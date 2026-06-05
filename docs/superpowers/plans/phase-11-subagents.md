# Phase 11: Subagents

**Goal:** Ship the specialized Android subagents (`android-debug`, `android-review`, `android-explore`) with model defaults and task-tool wiring so each can be dispatched and returns results consistent with its specialization.  
**Depends on:** Phase 10  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §5.2

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase11/subagents` off it.
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

## 11.1 Add `android-debug` subagent

**Why:** A dedicated debugging subagent needs permission to read logs, run Gradle tests, inspect the manifest, and read source files, but it must not edit code or write new files (that is the primary agent's job).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Add `android-debug` entry: `name: "android-debug"`, `mode: "subagent"`, `native: true`, description `"Debugging specialist for Android. Reads logcat, stack traces, and source to diagnose crashes, ANRs, and test failures. Does not edit code."`, permission: defaults + `edit: deny`, `write: deny`, `bash: allow`, `read: allow`, `grep: allow`, `glob: allow`, `logcat: allow` (the `logcat` tool from Phase 4). Model default: Sonnet-class (`{ providerID: "anthropic", modelID: "claude-sonnet-4-20250514" }`). |
| `packages/opencode/src/agent/prompt/android-debug.txt` | **Create.** System prompt fragment: "You are an Android debugging specialist. Use `logcat` and `read` to gather evidence. Always provide a root-cause hypothesis before suggesting a fix. Never call `edit` or `write`."

---

## 11.2 Add `android-review` subagent

**Why:** Code review requires broad read access and the ability to run lint/tests, but no editing. It should surface Android-specific issues (Compose recompositions, lifecycle leaks, missing content descriptions, Gradle convention violations).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Add `android-review` entry: `name: "android-review"`, `mode: "subagent"`, `native: true`, description `"Android code review specialist. Checks for Compose, lifecycle, accessibility, and Gradle best practices. Does not edit code."`, permission: defaults + `edit: deny`, `write: deny`, `bash: allow`, `read: allow`, `lint: allow` (Phase 4 `lint` tool). Model default: Opus-class (`{ providerID: "anthropic", modelID: "claude-opus-4-20250514" }`). |
| `packages/opencode/src/agent/prompt/android-review.txt` | **Create.** System prompt fragment: "You are an Android code reviewer. Focus on: unnecessary recompositions, missing `contentDescription`, lifecycle leaks, hardcoded dimensions, non-idiomatic Gradle convention plugin usage, and missing test coverage. Never call `edit` or `write`."

---

## 11.3 Add `android-explore` subagent

**Why:** Fast codebase navigation needs minimal permissions (read, grep, glob, bash) and a lightweight model default. It answers "how does X work?" without editing.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Add `android-explore` entry: `name: "android-explore"`, `mode: "subagent"`, `native: true`, description `"Fast Android codebase explorer. Searches files, reads module graphs, and answers architecture questions. Does not edit code."`, permission: identical to current `explore` agent but with `module-graph: allow` (Phase 5 tool) and `dependency-catalog: allow` (Phase 6 tool). Model default: Haiku-class (`{ providerID: "anthropic", modelID: "claude-haiku-3-20240307" }` or the smallest/fastest available Claude model ID). |
| `packages/opencode/src/agent/prompt/android-explore.txt` | **Create.** System prompt fragment: "You are a fast Android codebase explorer. Use `grep`, `glob`, `read`, `module-graph`, and `dependency-catalog` to answer questions. Keep answers concise. Never call `edit` or `write`."

---

## 11.4 Model defaults and task-tool wiring

**Why:** The `task` tool (`packages/opencode/src/tool/task.ts`) dispatches to any agent by name via `agent.get(params.subagent_type)`. The subagents must be visible in the tool description so the primary agent knows they exist.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/task.txt` | Update the description to list the available subagent types, including `android-debug`, `android-review`, and `android-explore`. |
| `packages/opencode/src/tool/registry.ts` | In `describeTask()`, confirm that `agent.list()` includes subagents (it does, because `list()` returns all agents sorted). No hardcoded list needed. |
| `packages/opencode/src/agent/subagent-permissions.ts` | Verify that `deriveSubagentSessionPermission()` correctly narrows permissions for subagents. If any Android-specific permission logic is needed (e.g., never allow `signing` tool in a subagent), add it here. |

---

## Verification

- `bun typecheck` in `packages/opencode` passes.
- `bun turbo test:ci` green.
- **Resolve model IDs before merging:** `claude-haiku-3-20240307` (for `android-explore`) is notably old and likely will not resolve — confirm every subagent default resolves via `Provider.parseModel()` and replace stale IDs with current Haiku/Sonnet/Opus IDs.
- Manual: in a session with `android-build`, call the `task` tool with `subagent_type: "android-debug"` and a crash-analysis prompt. Verify the subagent session starts, the `logcat` tool is available, and the result is a diagnosis (not a code edit).
- Manual: call `task` with `subagent_type: "android-review"` on a sample file. Verify the subagent runs lint and returns a review comment without editing.
- Manual: call `task` with `subagent_type: "android-explore"` and a question like "Which modules depend on `:feature:login`?". Verify it uses `module-graph` and returns a concise answer.
- Manual: verify that `android-kmp` subagent is not present in this phase — it is deferred to Phase 14.

## Risk

- **Risk:** Subagent permission profiles are too permissive and allow destructive operations (e.g., `bash` running `rm`) → **mitigation:** subagent permissions explicitly deny `edit`, `write`, and `apply_patch`. `bash` is allowed because reading logs requires shell access, but the primary agent's permission system already gates `bash` via user approval. Keep the existing ask/allow/deny model.
- **Risk:** Model defaults reference unavailable or renamed provider/model IDs on the user's machine → **mitigation:** the `Agent.defaultInfo()` and `TaskTool` flows already fall back to the session's current model if `agent.model` is undefined or fails resolution. Confirm this fallback path works by temporarily setting an invalid model ID in `androidcode.json` and verifying the agent still loads with the session model.
