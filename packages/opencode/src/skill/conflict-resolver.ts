import type { ScoredSkill } from "./types"

const SCOPE_ORDER = { file: 0, module: 1, project: 2, session: 3 } as const

// Resolves `conflicts_with` declarations between scored skills. When two skills
// conflict, the loser is dropped by: (1) lower priority, then (2) broader scope,
// then (3) alphabetical order as a final deterministic tiebreak.
export function resolveConflicts(scored: ScoredSkill[]): ScoredSkill[] {
  const kept = new Map<string, ScoredSkill>()

  for (const item of scored) {
    const conflicts = item.skill.orchestration?.conflicts_with ?? []
    let keep = true

    for (const existing of kept.values()) {
      if (!conflicts.includes(existing.skill.name)) continue

      const itemPriority = item.skill.orchestration?.priority ?? 50
      const existingPriority = existing.skill.orchestration?.priority ?? 50
      if (itemPriority < existingPriority) {
        keep = false
        break
      }
      if (itemPriority > existingPriority) continue

      const itemScope = SCOPE_ORDER[item.skill.orchestration?.scope ?? "session"]
      const existingScope = SCOPE_ORDER[existing.skill.orchestration?.scope ?? "session"]
      if (itemScope > existingScope) {
        keep = false
        break
      }
      if (itemScope < existingScope) continue

      if (item.skill.name > existing.skill.name) {
        keep = false
        break
      }
    }

    if (keep) kept.set(item.skill.name, item)
  }

  return Array.from(kept.values())
}
