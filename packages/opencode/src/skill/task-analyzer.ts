export interface Analysis {
  taskType: string
  confidence: number
  filePatterns: string[]
  contentPatterns: string[]
}

const KEYWORD_MAP: Record<string, string[]> = {
  "code-generation": ["build", "compile", "gradle", "generate", "create", "scaffold", "implement"],
  debugging: ["fix", "bug", "error", "crash", "debug", "trace", "breakpoint", "exception"],
  refactoring: ["refactor", "rename", "extract", "split", "clean", "simplify", "organize"],
  testing: ["test", "spec", "jest", "junit", "mock", "assert", "coverage", "unit", "integration"],
  analysis: ["analyze", "review", "audit", "check", "inspect", "investigate", "profile"],
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

function llmClassify(_message: string): { taskType: string; confidence: number } {
  // Stage 2: LLM fallback. Stub for now — returns low confidence so keyword path dominates.
  return { taskType: "general", confidence: 0 }
}

function extractFilePatterns(filePaths: string[]): { filePatterns: string[]; contentPatterns: string[] } {
  const patterns: string[] = []
  for (const fp of filePaths) {
    const ext = fp.split(".").pop()
    if (ext) patterns.push(`*.${ext}`)
    const basename = fp.split("/").pop()
    if (basename) patterns.push(basename)
  }
  return { filePatterns: patterns, contentPatterns: [] }
}

export function analyze(lastUserMessage: string, recentFiles: string[]): Analysis {
  const stage1 = keywordClassify(lastUserMessage)
  const stage2 = stage1.confidence < 0.7 ? llmClassify(lastUserMessage) : stage1
  const taskType = stage2.confidence > stage1.confidence ? stage2.taskType : stage1.taskType
  const confidence = Math.max(stage1.confidence, stage2.confidence)
  const stage3 = extractFilePatterns(recentFiles)

  return {
    taskType,
    confidence,
    filePatterns: stage3.filePatterns,
    contentPatterns: stage3.contentPatterns,
  }
}
