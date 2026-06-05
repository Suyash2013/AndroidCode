# Phase 10: Primary Agents + Model Routing

**Goal:** Ship the default Android primary agents (`android-build`, `android-plan`) with per-agent model defaults and user-configurable overrides via `androidcode.json`.  
**Depends on:** Phases 1, 3  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §5.1, §5.3

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase10/primary-agents` off it.
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

## 10.1 Rename and specialize default primary agents

**Why:** OpenCode ships `build` and `plan` as generic agents. AndroidCode needs `android-build` (default, full dev) and `android-plan` (architecture, no edits) with Android-specific descriptions and permission profiles.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Replace the `build` agent entry with `android-build`: name `"android-build"`, description `"Default Android development agent. Writes features, fixes bugs, refactors, and runs Gradle tasks."`, mode `"primary"`, native `true`, permission merge defaults + `question: "allow"`, `plan_enter: "allow"`. Replace `plan` with `android-plan`: name `"android-plan"`, description `"Architecture planning and design reviews. Disallows all edit tools."`, mode `"primary"`, native `true`, permission identical to current `plan` but with description updated. Keep `build` and `plan` as hidden aliases (or remove them entirely — see risk discussion below). |
| `packages/opencode/src/agent/prompt/android-build.txt` | **Create.** Android-specific system prompt fragment for `android-build` (injected via `agent.prompt` field). Emphasizes: always check `android-core` context, prefer Compose over Views when both are present, respect module boundaries, never hardcode SDK paths. |
| `packages/opencode/src/agent/prompt/android-plan.txt` | **Create.** Android-specific system prompt fragment for `android-plan`. Emphasizes: no code edits, focus on module graph and convention plugin alignment, suggest migration paths with KMP awareness. |

---

## 10.2 Add per-agent model defaults

**Why:** The design doc assigns Sonnet-class to `android-build` and Opus-class to `android-plan`. The agent definition schema already supports a `model` field (`{ modelID, providerID }`). We need to wire sensible defaults that map to real provider/model IDs.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Add `model` to `android-build`: default to `{ providerID: "anthropic", modelID: "claude-sonnet-4-20250514" }` (or the latest Sonnet-class ID available in the AI SDK). Add `model` to `android-plan`: default to `{ providerID: "anthropic", modelID: "claude-opus-4-20250514" }` (or latest Opus-class). These are defaults, not hard requirements — the user can override. |
| `packages/opencode/src/provider/provider.ts` | Verify that `Provider.parseModel()` can resolve these IDs. If not, add aliases or update the defaults to IDs that do resolve. Document the chosen IDs in `docs/superpowers/agent-model-defaults.md`. |

---

## 10.3 Wire `androidcode.json` model override

**Why:** The design doc (§5.3) states all model assignments are user-configurable via `androidcode.json`. The existing config system (`packages/opencode/src/config/config.ts`) already supports `cfg.agent.<name>.model` overrides because the agent layer loops over `cfg.agent` entries and applies them.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/config/config.ts` | Confirm that `ConfigV1.Info` already has an `agent` record that supports `model`. It does (see `ConfigAgent` in `ConfigV1`). No changes needed unless the schema lacks the field. If so, patch `ConfigAgentV1.Info` in `packages/core/src/v1/config/agent.ts`. |
| `packages/opencode/src/config/paths.ts` | Add `androidcode` to the config file name list so `androidcode.json` and `androidcode.jsonc` are loaded alongside `opencode.json`. Add a new function `androidcodeFiles(directory, worktree)` or extend `files()` to accept a list of names. |
| `packages/opencode/src/config/config.ts` | In `loadInstanceState`, merge `androidcode.json`/`androidcode.jsonc` files after `opencode` files. The merge order should be: global → opencode project → androidcode project, so androidcode values win. |

---

## 10.4 Update tool registry descriptions and permission defaults

**Why:** The `task` tool description (`packages/opencode/src/tool/task.txt`) and the tool registry (`packages/opencode/src/tool/registry.ts`) list available subagents for the model. When primary agents change, the descriptions must stay accurate.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/task.txt` | Update the subagent list in the tool description to mention `android-build` and `android-plan` as the primary agents. |
| `packages/opencode/src/tool/registry.ts` | In `describeTask()`, ensure the agent list uses `agent.list()` dynamically, so no hardcoded names are required. If any hardcoded strings exist, replace them. |

---

## Verification

- `bun typecheck` in `packages/opencode` passes.
- `bun turbo test:ci` green.
- **Resolve model IDs before merging:** the hardcoded `claude-sonnet-4-20250514` / `claude-opus-4-20250514` are placeholders. Confirm each default resolves via `Provider.parseModel()` against this repo's provider catalog and replace any that don't (capture the chosen IDs in `model-defaults.ts`).
- Manual: start the TUI and verify `android-build` appears as the default visible primary agent, and `android-plan` is selectable.
- Manual: create an `androidcode.json` with `{ "agent": { "android-build": { "model": "openai/gpt-4o" } } }`, restart, and verify `android-build` uses the overridden model.
- Manual: dispatch `android-plan` and confirm the agent cannot call `edit` or `write` (permission denied).

## Risk

- **Risk:** Removing `build`/`plan` breaks existing user configs, scripts, and documentation that reference them → **mitigation:** keep `build` and `plan` as hidden aliases (`hidden: true`) that map to the same permission sets but are not selectable in the UI. After a deprecation period (future phase), remove them.
- **Risk:** Sonnet/Opus model IDs drift as providers update their catalogs → **mitigation:** store the default model IDs in a constants file `packages/opencode/src/agent/model-defaults.ts` with a comment block linking to the provider's model list. Update them in a dedicated chore commit when IDs change.
