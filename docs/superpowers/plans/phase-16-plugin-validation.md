# Phase 16: Plugin System Validation + Registry

**Goal:** Validate that the community can extend AndroidCode via plugins without forking, verify all plugin hooks support custom tools/agents/skills, and design the `@androidcode` distribution and registry.  
**Depends on:** Phase 10  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 16

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase16/plugin-validation` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
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

## 16.1 Verify Plugin Hooks for Custom Tools

**Why:** OpenCode's plugin system already supports tools (`packages/plugin/src/tool.ts`). AndroidCode must confirm this path works for Android-specific tools (e.g., a Firebase tool) and that the tool appears in the agent's tool registry.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/plugin/src/tool.ts` | Confirm no AndroidCode-specific changes are needed; add a JSDoc note that `ToolContext.directory` is the Android project root when running under AndroidCode. |
| `packages/opencode/src/tool/registry.ts` | Ensure external plugin tools are merged into the agent's available tool set with the same `Tool.define` pattern as built-ins. Add a log line at `debug` level listing discovered plugin tool IDs on session start. |
| `packages/opencode/test/plugin/trigger.test.ts` | Add test: a mock plugin registers a tool via the plugin `trigger` hook; assert the tool ID appears in `registry.list()`. |

## 16.2 Verify Plugin Hooks for Custom Agents / Subagents

**Why:** Plugins should be able to register new agents or subagents (e.g., a `android-firebase` agent). This requires the agent dispatch table to accept runtime-registered entries.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | Expose an `registerAgent(id, agentDef)` function that plugins can call at boot time. The dispatch table merges plugin-provided agents after built-ins. Guard against duplicate IDs: plugin agents shadow built-ins with a warning log. |
| `packages/opencode/src/plugin/index.ts` | In the `PluginInput` object passed to plugins, add `registerAgent(id, agentDef)` so external plugins can inject agents without direct imports of `agent.ts`. |
| `packages/opencode/test/agent/agent.test.ts` | Add test: load a mock plugin that calls `registerAgent`; assert the new agent is selectable via the CLI/TUI dispatch path. |

## 16.3 Verify Plugin Hooks for Custom Skills

**Why:** A plugin may ship its own `SKILL.md` files (e.g., a vendor-specific Android skill pack). The skill discovery path must include plugin-provided directories so they appear in the catalog.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/skill/index.ts` | After scanning the `.agents/skills/` external dirs, query `Plugin.Service` for any `skills` directories advertised by loaded plugins. Merge discovered plugin skills into the same frontmatter-parsing pipeline. |
| `packages/opencode/src/plugin/index.ts` | Add `registerSkillDir(path)` to `PluginInput` so plugins can expose skill directories at runtime. |
| `packages/opencode/test/skill/discovery.test.ts` | Add test: mock plugin registers a skill directory; run discovery; assert the skill appears in the catalog with correct `category` and `when_to_use`. |

## 16.4 `@androidcode` npm Scope + Sample External Plugin

**Why:** The design doc specifies `@androidcode` as the distribution namespace. We need a working sample plugin published (or locally installable) under that scope to prove the end-to-end flow.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/plugin/package.json` | Update `name` field to `@androidcode/plugin` (or create a new `@androidcode/plugin` wrapper that re-exports the upstream plugin API with AndroidCode branding). Ensure `exports` map includes `./tool`, `./shell`, `./tui`. |
| `examples/plugin-sample/package.json` | New sample external plugin under `examples/plugin-sample/`: name `@androidcode/sample-plugin`, depends on `@androidcode/plugin`, registers one tool (`sample-firebase-deploy`) and one skill directory (`skills/`). |
| `examples/plugin-sample/src/index.ts` | Plugin entrypoint: calls `registerAgent`, `registerSkillDir`, and registers a tool using the `tool` export from `@androidcode/plugin`. |
| `examples/plugin-sample/skills/android-firebase/SKILL.md` | New skill: `category: tooling`, `when_to_use: reach for this when deploying to Firebase App Distribution`. |
| `packages/opencode/test/plugin/external-plugin.test.ts` | Add integration test: install the sample plugin via a local file path, load it, assert the tool appears in the registry and the skill appears in the catalog. |

## 16.5 Registry Design Document

**Why:** A registry document is needed so the community knows how to publish, discover, and install AndroidCode plugins. This is design-only in this phase; implementation is post-launch.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `docs/registry/plugin-registry.md` | New design doc: registry requirements (npm search via `@androidcode/*` scope, GitHub Topics `androidcode-plugin`, optional future central index). Installation via `androidcode plugin add <pkg>` (CLI command wrapping npm install + reload). Verification criteria (tool + skill smoke test). |

---

## Verification

- `bun test` in `packages/opencode` passes the new plugin integration tests (custom tool, custom agent, custom skill).
- Manual end-to-end:
  ```bash
  cd examples/plugin-sample
  bun link
  cd /tmp/test-project
  # add to androidcode.json plugin list:
  # "plugin": ["file:../../AndroidCode/examples/plugin-sample"]
  androidcode init
  # verify `sample-firebase-deploy` appears in tool registry
  # verify `android-firebase` appears in skills catalog
  ```
- `bun typecheck` passes across `packages/plugin`, `packages/opencode`, and `examples/plugin-sample`.

## Risk

- **Upstream plugin API changes break compatibility** → Mitigation: the `@androidcode/plugin` wrapper pins to a known upstream plugin API version. If upstream changes, the wrapper adapts without forcing every community plugin to change. Document the supported API version in `examples/plugin-sample/README.md`.
- **Plugin agents shadowing built-ins create confusion** → Mitigation: log a warning when a plugin overrides a built-in agent ID, and require explicit user opt-in in `androidcode.json` (`allowPluginAgentOverrides: true`) before shadowing takes effect.
