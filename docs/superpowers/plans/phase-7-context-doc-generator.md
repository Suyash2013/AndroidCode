# Phase 7: Project Context Document Generator

**Goal:** Assemble Android structural facts from deterministic gap-filler tools into an injectable Project Context Document, with a per-turn injection hook and a clear GitNexus-complement boundary.  
**Depends on:** Phases 3, 5, 6  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §6

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase7/context-doc-generator` off it.
- **Commits:** conventional-commit format `<type>(<scope>): <subject>` (`<type>` ∈ feat/fix/docs/chore/refactor/test; scope optional). Keep the `Co-Authored-By:` footer on AI-assisted commits.

**Compliance gate — must pass BEFORE the phase's final commit / PR merge** (enforced by `.github/workflows/pr-standards.yml`; non-compliant PRs auto-close ~2h after flagging):

- [ ] PR **title** matches `^(feat|fix|docs|chore|refactor|test)\s*(\([a-zA-Z0-9-]+\))?\s*:`
- [ ] PR **template** filled with real content — all five sections: *Issue for this PR* · *Type of change* (≥1 box) · *What does this PR do?* (genuine, not placeholder/AI-wall-of-text) · *How did you verify your code works?* (non-empty) · *Checklist* (≥2 boxes)
- [ ] **Linked issue** via `Fixes #<n>` / `Closes #<n>` _(auto-skipped for `docs`/`refactor`/`feat` PRs)_
- [ ] `bun turbo test:ci` green (unit — Linux + Windows)
- [ ] `bun typecheck` green (TypeScript)
- [ ] `bun run test:httpapi` green in `packages/opencode` (HttpApi gates — Linux), where applicable

**Phase done = a compliant, green PR merged to `dev`.**

---

## 7.1 Define `ProjectContextDocument` schema and generator registry hook

**Why:** The `init` pipeline (Phase 3) needs a well-typed target artifact so that downstream code can read it safely. Without a schema, the assembled context is a plain blob that cannot be validated or incrementally updated.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/context-document.ts` | **Create.** Define `ProjectContextDocument` schema (module graph, manifest summary, resources index, dependency catalog summary, staleness timestamp). Export a generator function `generate(input: ToolOutputs): Effect.Effect<ProjectContextDocument>` registered with the `init` pipeline. |
| `packages/opencode/src/android/generator.ts` | **Create (or extend if Phase 3 created it).** Add `contextDocument` to the generator registry so `init` and `init --context` dispatch to it. |
| `packages/opencode/src/android/generator.ts` | **Create (or extend).** Export shared types for `GeneratorID`, `GeneratorRegistry`, and machine-owned vs user-owned file paths. |

---

## 7.2 Assemble deterministic tool outputs into the context document

**Why:** The gap-filler tools from Phases 5 and 6 (`manifest`, `resources`, `module-graph`, `dependency-catalog`) return structured `ToolResult` data. The generator must normalize and merge these into a single compact document that the agent can read in one turn.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/context-document.ts` | Implement `assemble()` that takes outputs from the four tools, deduplicates, trims verbose Gradle noise, and writes a compact markdown/JSON hybrid to `.agents/context/project-context.md`. |
| `packages/opencode/src/tool/manifest.ts` | **No new tool code** (built in Phase 5), but ensure its `ToolResult` shape is exported as a type so the generator can import it. If missing, add a `ManifestOutput` type export. |
| `packages/opencode/src/tool/module-graph.ts` | Same as above: export `ModuleGraphOutput` type. |
| `packages/opencode/src/tool/resources.ts` | Same as above: export `ResourcesOutput` type. |
| `packages/opencode/src/tool/dependency-catalog.ts` | Same as above: export `DependencyCatalogOutput` type. |
| `packages/opencode/src/android/context-document.md` | **Create.** Template file for the generated document (machine-owned header + generated body). |

---

## 7.3 Per-turn injection hook

**Why:** The agent must receive the Project Context Document on every turn without explicit tool calls. The existing `SystemPrompt` layer (`packages/opencode/src/session/system.ts`) injects environment info and skills; we add a new injection point for the Android context document.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/session/system.ts` | Extend `SystemPrompt.Interface` with `projectContext: (agent: Agent.Info) => Effect.Effect<string | undefined>`. In the service layer, read `.agents/context/project-context.md` if it exists and the agent is Android-targeted (mode !== "subagent" or name starts with `android-`). Inject as a `<project_context>` block after the `<env>` block. |
| `packages/opencode/src/session/prompt.ts` | In the prompt assembly flow (around the system-prompt composition), yield `sys.projectContext(agent)` alongside `sys.environment(model)` and `sys.skills(agent)`. |
| `packages/opencode/src/android/context-document.ts` | Export a helper `readContextDocument()` that returns the file contents or `undefined`, so `SystemPrompt` can call it without importing the generator internals. |

---

## 7.4 GitNexus-complement boundary

**Why:** The design doc (§6) states the Project Context Document complements GitNexus, not replaces it. The Kotlin/Java semantic graph stays with GitNexus. We must document this boundary so users and future maintainers do not try to reimplement code-graph features inside the context document.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `docs/superpowers/android-context-doc-boundary.md` | **Create.** Document what the context doc covers (manifest, resources, module graph, version catalog) and what it explicitly does NOT cover (callers, callees, impact analysis, execution flows → delegated to GitNexus or omni-rag). |
| `packages/opencode/src/android/context-document.ts` | Add a code comment at the top of the generator referencing the boundary doc, to prevent scope creep. |

---

## Verification

- `bun typecheck` in `packages/opencode` passes.
- Manual: run `init --context` on the sample Android project at `packages/opencode/test/fixture/android-sample/` (or create one if absent). Verify `.agents/context/project-context.md` is created and contains `module_graph`, `manifest`, `resources`, and `dependency_catalog` sections.
- Manual: start a session with `android-build` agent, inspect the system prompt, and confirm the `<project_context>` block appears after `<env>`.

## Risk

- **Risk:** The context document grows too large and inflates every prompt → **mitigation:** cap the document at a configurable byte limit (default 8 KB); truncate least-recently-changed modules first. Add a `max_context_doc_bytes` field to `androidcode.json`.
- **Risk:** Stale context document after build-file changes → **mitigation:** `init --context` is idempotent and fast; encourage users to re-run it after major Gradle edits. The document header includes a generated timestamp so the agent can warn if it is old.
