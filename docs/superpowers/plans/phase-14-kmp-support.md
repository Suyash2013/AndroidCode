# Phase 14: KMP Support

**Goal:** Add first-class Kotlin Multiplatform support via a dedicated subagent and skill, plus automatic KMP detection in the `init` pass.  
**Depends on:** Phases 11, 12, 13  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 14

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase14/kmp-support` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
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

## 14.1 KMP Detection in `init`

**Why:** Without automatic detection, the agent treats KMP projects as plain Android projects and suggests Android-only APIs in `commonMain`, breaking the shared module contract. Detecting `kotlin(multiplatform)` plugin presence and `commonMain`/`androidMain`/`iosMain` source sets lets the agent scope suggestions correctly.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/detect.ts` | Extend the detection pass to probe for KMP markers: `kotlin("multiplatform")` in root `build.gradle.kts`, existence of `commonMain/`, `androidMain/`, `iosMain/` (or other target) source-set directories, and `shared/build.gradle.kts` conventions. Emit a `kmp: true` flag plus target list into the detection result. |
| `packages/opencode/src/android/android-core-generator.ts` | Feed the KMP detection flag into the `android-core` generator so generated project facts include `isKmp: true` and `kmpTargets: ["android", "ios", "desktop", …]`. |
| `packages/opencode/src/tool/module-graph.ts` | Add KMP source-set edges to the module graph output: `commonMain → androidMain` dependency wiring per module. |

## 14.2 `android-kmp` Subagent

**Why:** A general-purpose agent lacks KMP-specific reasoning (expect/actual boundaries, `commonMain` API restrictions, target-specific `actual` implementations). A dedicated subagent scopes LLM context to KMP rules and emits code that compiles across targets.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | New subagent definition: `android-kmp` with model default Sonnet-class. System prompt constrains the agent to `commonMain` API surface, requires `expect`/`actual` pairs for platform-specific code, and prohibits Android-only imports in `commonMain`. |
| `packages/opencode/src/agent/agent.ts` | Register `android-kmp` in the subagent dispatch table so `task` or inline `@android-kmp` references route correctly. |
| `packages/opencode/src/agent/agent.ts` | Add `android-kmp` to the permission matrix with default read permissions on `shared/` and `commonMain/` paths. |

## 14.3 Enhance `android-kmp` Skill

**Why:** The `android-kmp` skill was seeded in Phase 12 with basic KMP content. This phase enhances it with KMP-specific patterns the model cannot deduce from general Kotlin knowledge: correct `build.gradle.kts` plugin wiring, `expect`/`actual` placement rules, `commonMain` dependency limitations, and target hierarchy (`common` → `jvm`/`android`/`ios`).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-kmp/SKILL.md` | Enhance the existing skill created in Phase 12 with KMP-specific content: concrete `expect`/`actual` pair (e.g., platform time), shared `build.gradle.kts` snippet with `kotlin { sourceSets { commonMain { dependencies { … } } } }`, `commonMain` API boundary rules, and a "when to use" hint for cross-target logic. |
| `packages/opencode/src/skill/index.ts` | Ensure `android-kmp` frontmatter is discovered and cataloged under `implementation`. |

## 14.4 End-to-End Test with KMP Sample

**Why:** KMP behavior is only verifiable against a real KMP project structure. A fixture project in the test suite proves detection, agent dispatch, and skill compliance.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/test/fixture/kmp-sample/shared/build.gradle.kts` | New fixture: minimal KMP module with `kotlin("multiplatform")`, `commonMain`, `androidMain`, and `iosMain` source sets, plus a trivial `expect`/`actual` `Platform` object. |
| `packages/opencode/test/project/init.test.ts` | Add test: run `init` against the KMP fixture; assert detection result contains `isKmp: true` and `kmpTargets` includes `"android"` and `"ios"`. |
| `packages/opencode/test/agent/subagent.test.ts` | Add test: dispatch `android-kmp` on a task that requests a cross-platform timer; assert the response references `expect`/`actual` and does not import `android.os.SystemClock` into `commonMain`. |

---

## Verification

- `bun test` in `packages/opencode` passes the new KMP fixture tests.
- Manually run `init` on the KMP fixture:
  ```bash
  cd packages/opencode/test/fixture/kmp-sample
  ../../../src/cli/cmd/init.ts --dry-run
  ```
  Assert output contains `kmp: true` and target list.
- Dispatch the `android-kmp` subagent via the TUI or CLI on a task:
  ```
  @android-kmp add a cross-platform UUID generator
  ```
  Assert the generated code contains `expect fun generateUUID(): String` in `commonMain` and `actual` implementations in `androidMain` and `iosMain`.

## Risk

- **KMP project structures vary widely (CMP, KMP with native, KMP with server)** → Mitigation: detection is conservative — it only flags `kmp: true` when `kotlin("multiplatform")` and at least one `commonMain` source set are present. The skill and agent prompt are explicit about scoping to `commonMain` and delegating target-specific decisions to `actual` stubs.
- **`init` performance degradates on large KMP monorepos** → Mitigation: detection reads only root `build.gradle.kts` and lists immediate subdirectories under `src/`; no deep Gradle task invocation. Slow semantic indexing is deferred to the async enrichment path.
