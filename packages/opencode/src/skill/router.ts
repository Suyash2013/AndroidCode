import type { Info, ScoredSkill } from "./types"
import type { Analysis } from "./task-analyzer"
import { resolveConflicts } from "./conflict-resolver"

const MIN_SCORE = 20

function scoreSkill(skill: Info, analysis: Analysis): ScoredSkill {
  const reasons: string[] = []
  let score = 0

  const orch = skill.orchestration
  const triggers = orch?.triggers

  if (triggers?.file_patterns) {
    for (const pattern of triggers.file_patterns) {
      for (const fp of analysis.filePatterns) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\?/g, "."))
        if (regex.test(fp)) {
          score += 30
          reasons.push(`file_pattern: ${pattern}`)
          break
        }
      }
    }
  }

  if (triggers?.content_patterns) {
    for (const pattern of triggers.content_patterns) {
      const regex = new RegExp(pattern, "i")
      if (regex.test(analysis.message) || analysis.contentPatterns.some((cp) => regex.test(cp))) {
        score += 25
        reasons.push(`content_pattern: ${pattern}`)
      }
    }
  }

  if (triggers?.task_types) {
    if (triggers.task_types.includes(analysis.taskType)) {
      score += 20
      reasons.push(`task_type: ${analysis.taskType}`)
    }
  }

  if (triggers?.tools_in_use) {
    for (const tool of triggers.tools_in_use) {
      if (analysis.toolsInUse.includes(tool)) {
        score += 15
        reasons.push(`tool: ${tool}`)
      }
    }
  }

  if (!orch) {
    // No orchestration metadata: keyword match on name/description
    const keywords = [skill.name, skill.description ?? ""].join(" ").toLowerCase().split(/\s+/)
    const messageWords = analysis.taskType.toLowerCase().split(/\s+/)
    let keywordScore = 0
    for (const word of messageWords) {
      if (keywords.some((k) => k.includes(word) || word.includes(k))) {
        keywordScore += 15
        if (keywordScore >= 45) break
      }
    }
    score += Math.min(keywordScore, 45)
    if (score > 0) reasons.push("keyword_match")
  }

  // Ensure minimum score
  if (score > 0 && score < MIN_SCORE) {
    score = MIN_SCORE
    reasons.push("min_floor")
  }

  return { skill, score, reasons }
}

export function select(
  skills: Info[],
  analysis: Analysis,
  maxActive: number,
  overrides?: { include: string[]; exclude: string[] },
  alwaysInclude?: string[],
): { selected: Info[]; scores: ScoredSkill[] } {
  // Always include overrides
  const includedNames = new Set(overrides?.include ?? [])
  const excludedNames = new Set(overrides?.exclude ?? [])

  const scored = skills
    .filter((s) => !excludedNames.has(s.name))
    .map((s) => scoreSkill(s, analysis))
    .filter((s) => s.score >= MIN_SCORE || includedNames.has(s.skill.name))

  const resolved = resolveConflicts(scored)

  // Add dependency bonuses
  const selectedNames = new Set(resolved.map((r) => r.skill.name))
  for (const item of resolved) {
    const deps = item.skill.orchestration?.depends_on ?? []
    for (const dep of deps) {
      if (selectedNames.has(dep)) {
        item.score += 10
        item.reasons.push(`depends_on: ${dep}`)
      }
    }
  }

  // Sort by score desc, then priority desc, then category order, then scope
  // breadth (session > project > module > file), then name asc
  const categoryOrder: Record<string, number> = { process: 0, implementation: 1, analysis: 2, tooling: 3 }
  const sorted = resolved.toSorted((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aPriority = a.skill.orchestration?.priority ?? 50
    const bPriority = b.skill.orchestration?.priority ?? 50
    if (bPriority !== aPriority) return bPriority - aPriority
    const aCat = categoryOrder[a.skill.orchestration?.category ?? ""] ?? 99
    const bCat = categoryOrder[b.skill.orchestration?.category ?? ""] ?? 99
    if (aCat !== bCat) return aCat - bCat
    const scopeOrder = { file: 0, module: 1, project: 2, session: 3 }
    const aScope = scopeOrder[a.skill.orchestration?.scope ?? "session"]
    const bScope = scopeOrder[b.skill.orchestration?.scope ?? "session"]
    if (bScope !== aScope) return bScope - aScope
    return a.skill.name.localeCompare(b.skill.name)
  })

  // Include forced overrides even if they scored low
  const overrideSkills = skills
    .filter((s) => includedNames.has(s.name) && !sorted.some((x) => x.skill.name === s.name))
    .map((s) => ({ skill: s, score: 100, reasons: ["user_override"] }))

  const allScored = [...overrideSkills, ...sorted]
  const capped = allScored.slice(0, maxActive)

  // Bootstrap skills are always loaded, independent of score and the maxActive
  // cap, unless the user has explicitly excluded them. They are prepended so
  // their always-on context appears first in the prompt.
  const present = new Set(capped.map((s) => s.skill.name))
  const bootstrap = skills
    .filter((s) => (alwaysInclude ?? []).includes(s.name) && !excludedNames.has(s.name) && !present.has(s.name))
    .map((s) => ({ skill: s, score: 0, reasons: ["bootstrap"] }))

  const final = [...bootstrap, ...capped]
  return { selected: final.map((s) => s.skill), scores: final }
}
