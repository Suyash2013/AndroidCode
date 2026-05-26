import { Effect } from "effect"

export interface Analysis {
  taskType: string
  confidence: number
  message: string
  filePatterns: string[]
  contentPatterns: string[]
  toolsInUse: string[]
}

const KEYWORD_MAP: Record<string, string[]> = {
  "code-generation": ["build", "compile", "gradle", "generate", "create", "scaffold", "implement"],
  debugging: ["fix", "bug", "error", "crash", "debug", "trace", "breakpoint", "exception"],
  refactoring: ["refactor", "rename", "extract", "split", "clean", "simplify", "organize"],
  testing: ["test", "spec", "jest", "junit", "mock", "assert", "coverage", "unit", "integration"],
  analysis: ["analyze", "audit", "inspect", "investigate", "profile"],
  review: ["review", "pull request", "code review", "diff", "approve", "lgtm", "feedback"],
  planning: ["plan", "design", "architecture", "approach", "strategy", "roadmap", "milestone"],
  documentation: ["doc", "readme", "comment", "explain", "document", "diagram"],
  deployment: ["deploy", "release", "publish", "ci", "cd", "pipeline"],
}

function keywordClassify(message: string): { taskType: string; confidence: number } {
  const lower = message.toLowerCase()
  let bestType = "general"
  let bestScore = 0

  for (const [taskType, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestType = taskType
    }
  }

  const confidence = Math.min(bestScore * 0.25, 0.95)
  return { taskType: bestType, confidence }
}

// All known task-type labels — the candidate set handed to the Stage 2 classifier.
export const TASK_TYPES = Object.keys(KEYWORD_MAP)

// Confidence below which the keyword classifier is considered under-confident and
// the (optional) Stage 2 LLM classifier is consulted.
const STAGE2_CONFIDENCE = 0.7

// Stage 2: optional LLM classifier. Given the user message and the candidate
// task-type labels, it returns the chosen label, or undefined to defer to the
// keyword result. Injected by the caller (which owns the model/provider) so the
// task analyzer stays free of any provider dependency.
export type TaskClassifier = (
  message: string,
  candidates: readonly string[],
) => Effect.Effect<string | undefined>

// Gated Stage 2: only consult the classifier when the keyword path is
// under-confident. Any classifier failure or out-of-vocabulary label falls back
// to the keyword analysis, so routing never hard-fails on a bad model response.
export function applyClassifier(analysis: Analysis, classify: TaskClassifier | undefined) {
  return Effect.gen(function* () {
    if (analysis.confidence >= STAGE2_CONFIDENCE || !classify) return analysis
    const label = yield* classify(analysis.message, TASK_TYPES).pipe(
      Effect.catchCause(() => Effect.succeed(undefined)),
    )
    const normalized = label?.trim().toLowerCase()
    if (normalized && TASK_TYPES.includes(normalized) && normalized !== analysis.taskType) {
      return { ...analysis, taskType: normalized, confidence: Math.max(analysis.confidence, 0.8) }
    }
    return analysis
  })
}

const MAX_CONTENT_PATTERNS = 50
// JS/TS module specifiers: `import ... from "module"` or `import "module"`.
const JS_IMPORT_RE = /import\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g
// JVM imports: `import a.b.c.Name` / `import static a.b.C.method` (Kotlin/Java).
const JVM_IMPORT_RE = /^\s*import\s+(?:static\s+)?([\w.]+(?:\.\*)?)/gm

// Stage 3 enrichment: pull import specifiers and their trailing identifiers out
// of recently-touched file contents so `content_patterns` triggers have real
// signal to match against (instead of always being empty).
export function extractContentPatterns(fileContents: Map<string, string>): string[] {
  const found = new Set<string>()
  for (const content of fileContents.values()) {
    let m: RegExpExecArray | null
    JS_IMPORT_RE.lastIndex = 0
    while ((m = JS_IMPORT_RE.exec(content)) !== null) found.add(m[1])
    JVM_IMPORT_RE.lastIndex = 0
    while ((m = JVM_IMPORT_RE.exec(content)) !== null) {
      const fqn = m[1]
      found.add(fqn)
      const last = fqn.split(".").pop()
      if (last && last !== "*") found.add(last)
    }
    if (found.size >= MAX_CONTENT_PATTERNS) break
  }
  return Array.from(found).slice(0, MAX_CONTENT_PATTERNS)
}

function extractFilePatterns(
  filePaths: string[],
  fileContents?: Map<string, string>,
): { filePatterns: string[]; contentPatterns: string[] } {
  const patterns: string[] = []
  for (const fp of filePaths) {
    const ext = fp.split(".").pop()
    if (ext) patterns.push(`*.${ext}`)
    const basename = fp.split("/").pop()
    if (basename) patterns.push(basename)
  }
  const contentPatterns = fileContents ? extractContentPatterns(fileContents) : []
  return { filePatterns: patterns, contentPatterns }
}

export function analyze(
  lastUserMessage: string,
  recentFiles: string[],
  toolsInUse: string[] = [],
  fileContents?: Map<string, string>,
): Analysis {
  const { taskType, confidence } = keywordClassify(lastUserMessage)
  const stage3 = extractFilePatterns(recentFiles, fileContents)

  return {
    taskType,
    confidence,
    message: lastUserMessage,
    filePatterns: stage3.filePatterns,
    contentPatterns: stage3.contentPatterns,
    toolsInUse,
  }
}
