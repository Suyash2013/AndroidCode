# Phase 2: Skill Orchestration Engine (Weeks 9–16)

**Goal:** Implement the 3-layer Skill Orchestration Engine — the key architectural differentiator that solves multi-skill conflict.

**Prerequisite:** Phase 1 must be complete (agents, tools, rebranding all functional).

---

## 2.1 Extended `SKILL.md` Frontmatter (`metadata.orchestration`)

> **STATUS:** ✅ Complete. `OrchestrationSchema` created in `orchestration.ts`. `types.ts` extends `Info` with optional `orchestration`. `add()` in `index.ts` parses `metadata.orchestration` with fallback. Tests pass.

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

> **STATUS:** ✅ Complete. All three stages implemented; tests pass.

**File:** `packages/opencode/src/skill/task-analyzer.ts`

**Stage 1 — Keyword Classifier:**
- ✅ Fast, zero-cost, runs on every user message.
- ✅ Keyword-to-task-type mapping covers 9 task types — including `review` and `planning`.

**Stage 2 — LLM Classification:**
- ✅ Implemented as a **gated** classifier (`applyClassifier` in `task-analyzer.ts`). The
  configured small model is consulted only when keyword confidence < 0.7, with graceful fallback to
  the keyword result on any error or out-of-vocabulary label. To avoid a provider dependency in the
  analyzer, the classifier closure is injected by the caller (`session/prompt.ts`), where the model
  and `Provider` service are already in scope, and threaded through `SystemPrompt.skills()` →
  `Skill.analyzeAndSelect`.

**Stage 3 — File Context Enrichment:**
- ✅ Extracts file extensions, basenames, **and import specifiers** (JS/TS + JVM imports and their
  trailing identifiers) via `extractContentPatterns`, so `content_patterns` triggers have real signal.

**Resolved Limitations (previously noted):**
- ✅ `content_patterns` now matches the actual user message text and extracted import patterns (`router.ts`).
- ✅ `tools_in_use` fires from real tool-call history (`recentTools` threaded through `analyzeAndSelect`).
- ✅ `contentPatterns` is populated from recently-touched file contents (`readRecentFileContents`).

---

## 2.3 Skill Scorer / Contextual Skill Router

> **STATUS:** ✅ Complete. Scoring algorithm implemented with all point values, tiebreaking, min floor, conflicts, dependencies, bootstrap handling. Tests pass.

**File:** `packages/opencode/src/skill/router.ts`

---

## 2.4 Conflict Resolver

**File:** `packages/opencode/src/skill/conflict-resolver.ts`

> **STATUS:** ✅ Fixed (2026-05-26). Originally had two bugs: one-directional conflict check (only `item.conflicts_with` was tested) and inability to remove an already-kept skill when a later higher-priority conflicting skill arrived. Both fixed; conflicts are now checked bidirectionally and losers are removed from `kept` regardless of array order.

**Rules:**
1. Compare `priority`. Remove lower-priority skill.
2. If equal priority, remove broader `scope`.
3. If still tied, log warning and remove alphabetically second.
4. Conflicts are checked bidirectionally (either skill may declare the conflict).

---

## 2.5 Mid-Conversation Skill Re-Routing

> **STATUS:** ✅ Implemented. `SystemPrompt.skills()` now calls `analyzeAndSelect` when `turnContext.lastUserMessage` is provided (line 82 of `system.ts`). Skill set swaps per turn. Overrides (`addOverride`, `removeOverride`, `resetOverrides`) implemented in `src/skill/index.ts`.

**Current state:** `SystemPrompt.skills()` loads ALL available skills into the system prompt on every turn.

**Changes:**
1. Import `SkillRouter` and `TaskAnalyzer`. ✅ (via `skill.analyzeAndSelect`)
2. In `SystemPrompt.skills()`, call `taskAnalyzer.analyze(lastUserMessage, recentFiles)`. ✅
3. Call `skillRouter.select(availableSkills, analysis, maxActive)`. ✅
4. Only include selected skills in the prompt. ✅
5. Cache selected skill set per turn. If set changes, log it. ✅ (`state.lastSelection` in index.ts)

**User Overrides:** Add to `packages/opencode/src/skill/index.ts`:
- ✅ `addOverride(name)`, `removeOverride(name)`, `resetOverrides()`.

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

> **STATUS:** ✅ Fixed (2026-05-26). Backend handler in `session/prompt.ts` was already complete. The Command service (`command/index.ts`) and TUI Command Palette (`session/index.tsx`) now register `/skills add`, `/skills remove`, and `/skills reset` as first-class commands so they appear in slash autocomplete and the Cmd+K palette.

**Commands:**
- `/skills` — List active skills with scores and selection reasons.
- `/skills add <name>` — Force-load a skill for this session.
- `/skills remove <name>` — Force-exclude a skill for this session.
- `/skills reset` — Clear all overrides, return to router control.

---

## 2.8 Phase 2 Completion Criteria

- [x] Skills with `metadata.orchestration` parse correctly.
- [x] Task Analyzer classifies 90%+ of common Android tasks correctly via keyword path.
- [x] Skill Router selects ≤5 skills per turn, with scores visible in `/skills`.
- [x] Conflicting skills are eliminated.
- [x] Mid-conversation re-routing works: changing task type swaps skills in the next turn.
- [x] Bootstrap skills are always loaded.
- [x] User overrides persist for the session.
- [x] All new tests pass.

**Post-Completion Gaps — Resolved:**
- ✅ Stage 3 enrichment (import extraction) — implemented in `extractContentPatterns`.
- ✅ `content_patterns` user-message matching — wired in `router.ts`.
- ✅ `tools_in_use` tool-call history — threaded through `analyzeAndSelect`.
- ✅ `category` ordering — implemented in `router.ts` sort.
- ✅ `.skills/` discovery path — scanned in `skill/index.ts` (`SKILLS_EXTERNAL_DIR`).
- ✅ Stage 2 LLM classifier — implemented as a gated, injected classifier (see §2.2).

> `version` enforcement (semver precedence / breaking-change alerts) is tracked and implemented in
> Phase 3 §3.4, not Phase 2.
