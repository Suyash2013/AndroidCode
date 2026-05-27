import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import * as fs from "fs"
import path from "path"
import { ConfigMarkdown } from "../../src/config/markdown"
import { OrchestrationSchema } from "../../src/skill/orchestration"
import { select } from "../../src/skill/router"
import type { Analysis } from "../../src/skill/task-analyzer"
import type { Info } from "../../src/skill/types"

// The 24 shipped skills live at the repo-root `.agents/skills/` directory.
const SKILLS_DIR = path.resolve(import.meta.dir, "../../../..", ".agents", "skills")

// Always-loaded bootstrap skills are exempt from the shipped-skill orchestration
// requirements (they are minimal and intentionally trigger-free).
const BOOTSTRAP = new Set(["android-core"])

const shippedDirs = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith("android-") && !BOOTSTRAP.has(e.name))
  .map((e) => e.name)
  .toSorted()

function analysisFor(orch: Schema.Schema.Type<typeof OrchestrationSchema>): Analysis {
  const triggers = orch.triggers ?? {}
  return {
    taskType: triggers.task_types?.[0] ?? "general",
    confidence: 0.9,
    message: triggers.content_patterns?.[0] ?? "",
    filePatterns: triggers.file_patterns ? [...triggers.file_patterns] : [],
    contentPatterns: [],
    toolsInUse: [],
  }
}

describe("shipped android skills", () => {
  test("the expected number of shipped skills are present", () => {
    // Phase 3 §3.3 ships 24 android skills (excluding the android-core bootstrap).
    expect(shippedDirs.length).toBeGreaterThanOrEqual(24)
  })

  for (const name of shippedDirs) {
    test(`${name}: parses, decodes orchestration, and routes`, async () => {
      const file = path.join(SKILLS_DIR, name, "SKILL.md")
      const md = await ConfigMarkdown.parse(file)

      // Frontmatter basics.
      expect(md.data.name).toBe(name)
      expect(typeof md.data.description).toBe("string")
      expect(md.content.length).toBeGreaterThan(0)

      // metadata.orchestration must exist and decode against the schema.
      const raw = md.data.metadata?.orchestration ?? md.data.orchestration
      expect(raw, `${name} is missing metadata.orchestration`).toBeDefined()
      const orchestration = Schema.decodeUnknownSync(OrchestrationSchema)(raw)

      // It must declare at least one trigger so the router can select it.
      const triggers = orchestration.triggers ?? {}
      const hasTrigger =
        !!triggers.task_types?.length || !!triggers.content_patterns?.length || !!triggers.file_patterns?.length
      expect(hasTrigger, `${name} declares no triggers`).toBe(true)

      // The router should select the skill for an analysis matching its triggers.
      const skill: Info = {
        name,
        description: md.data.description,
        location: file,
        content: md.content,
        orchestration,
      }
      const { selected } = select([skill], analysisFor(orchestration), 5)
      expect(
        selected.map((s) => s.name),
        `${name} was not selected by the router for its own triggers`,
      ).toContain(name)
    })
  }
})
