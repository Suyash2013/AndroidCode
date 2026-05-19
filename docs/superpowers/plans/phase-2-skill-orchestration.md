# Phase 2: Skill Orchestration Engine (Weeks 9–16)

**Goal:** Implement the 3-layer Skill Orchestration Engine — the key architectural differentiator that solves multi-skill conflict.

**Prerequisite:** Phase 1 must be complete (agents, tools, rebranding all functional).

---

## 2.1 Extended `SKILL.md` Frontmatter (`metadata.orchestration`)

**Current state:** Skills only parse `name` and `description` from frontmatter. The `ConfigMarkdown.parse` function (using `gray-matter`) can parse arbitrary frontmatter fields.

**Files to modify/create:**

| File | Action |
| :--- | :--- |
| `packages/opencode/src/skill/orchestration.ts` | **Create.** Define `OrchestrationSchema` with all fields from design spec §3. |
| `packages/opencode/src/skill/index.ts` | Extend `Info` schema to include optional `orchestration` field. Update `add()` to parse and validate orchestration metadata. |
| `packages/opencode/test/skill/skill.test.ts` | Add tests for skills with `metadata.orchestration`. |

**Orchestration Schema:**
```typescript
export const OrchestrationSchema = z.object({
  category: z.enum(["process", "implementation", "analysis", "tooling"]).optional(),
  triggers: z.object({
    file_patterns: z.array(z.string()).optional(),
    content_patterns: z.array(z.string()).optional(),
    task_types: z.array(z.string()).optional(),
    tools_in_use: z.array(z.string()).optional(),
  }).optional(),
  priority: z.number().min(0).max(100).optional(),
  conflicts_with: z.array(z.string()).optional(),
  depends_on: z.array(z.string()).optional(),
  scope: z.enum(["file", "module", "project", "session"]).optional(),
  version: z.string().optional(),
})
```

---

## 2.2 Task Analyzer

**File:** `packages/opencode/src/skill/task-analyzer.ts`

**Stage 1 — Keyword Classifier:**
- Fast, zero-cost, runs on every user message.
- Keyword-to-task-type mapping: `{"build", "compile", "gradle"} → "code-generation"`, `{"fix", "bug", "error"} → "debugging"`, etc.
- Returns `{ taskType: string, confidence: number }`.

**Stage 2 — LLM Classification:**
- Only runs when Stage 1 confidence < 0.7.
- Sends a minimal prompt (~100 tokens) to the cheapest configured model (`small_model`).
- Returns `{ taskType: string, confidence: number }`.

**Stage 3 — File Context Enrichment:**
- Always runs.
- Extracts patterns from open/recently edited files: file extensions, import statements, API usage.
- Returns `{ filePatterns: string[], contentPatterns: string[] }`.

---

## 2.3 Skill Scorer / Contextual Skill Router

**File:** `packages/opencode/src/skill/router.ts`

**Scoring Algorithm:**
- `file_pattern` match: +30
- `content_pattern` match: +25
- `task_type` match: +20
- `tools_in_use` match: +15
- No orchestration metadata: keyword match on name/description at +15 per match, capped at +45.
- `depends_on` bonus: +10 if dependent is already selected.
- `conflicts_with` elimination: lower-priority skill removed.
- Tiebreaking: higher `priority` → broader relevance → narrower `scope` → alphabetical.
- Minimum score floor: 20.

**Max Active Skills:** Configurable via `androidcode.json` (`max_active_skills`, default: 5).

---

## 2.4 Conflict Resolver

**File:** `packages/opencode/src/skill/conflict-resolver.ts`

**Rules:**
1. Compare `priority`. Remove lower-priority skill.
2. If equal priority, remove broader `scope`.
3. If still tied, log warning and remove alphabetically second.

---

## 2.5 Mid-Conversation Skill Re-Routing

**File:** `packages/opencode/src/session/system.ts` (modify)

**Current state:** `SystemPrompt.skills()` loads ALL available skills into the system prompt on every turn.

**Changes:**
1. Import `SkillRouter` and `TaskAnalyzer`.
2. In `SystemPrompt.skills()`, call `taskAnalyzer.analyze(lastUserMessage, recentFiles)`.
3. Call `skillRouter.select(availableSkills, analysis, maxActive)`.
4. Only include selected skills in the prompt.
5. Cache selected skill set per turn. If set changes, log it.

**User Overrides:** Add to `packages/opencode/src/skill/index.ts`:
- `userOverrides()`, `addOverride(name)`, `removeOverride(name)`, `resetOverrides()`.

---

## 2.6 Bootstrap Skills

**Create 3 minimal skills (always-loaded):**

| Skill | File | Token Budget | Purpose |
| :--- | :--- | :--- | :--- |
| `skill-router` | `.agent/skills/skill-router/SKILL.md` | ~200 | Teaches the agent how the skill system works. |
| `android-core` | `.agent/skills/android-core/SKILL.md` | ~300 | Minimal always-on Android awareness. |
| `skill-guide` | `.agent/skills/skill-guide/SKILL.md` | ~200 | Explains how to create skills. |

---

## 2.7 TUI Skill Overrides

**Commands:**
- `/skills` — List active skills with scores and selection reasons.
- `/skills add <name>` — Force-load a skill for this session.
- `/skills remove <name>` — Force-exclude a skill for this session.
- `/skills reset` — Clear all overrides, return to router control.

---

## 2.8 Phase 2 Completion Criteria

- [ ] Skills with `metadata.orchestration` parse correctly.
- [ ] Task Analyzer classifies 90%+ of common Android tasks correctly via keyword path.
- [ ] Skill Router selects ≤5 skills per turn, with scores visible in `/skills`.
- [ ] Conflicting skills are eliminated.
- [ ] Mid-conversation re-routing works: changing task type swaps skills in the next turn.
- [ ] Bootstrap skills are always loaded.
- [ ] User overrides persist for the session.
- [ ] All new tests pass.
