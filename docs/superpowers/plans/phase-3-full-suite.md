# Phase 3: Full Tool Suite, Skills & Agents (Weeks 17–28)

**Goal:** Complete the remaining 6 gap-filler tools, 4 subagents, and all 24 shipped skills.

**Prerequisite:** Phase 2 must be complete (Skill Orchestration Engine functional).

---

## 3.1 Gap-Filler Tools (9 of 9)

> **STATUS:** ✅ All 9 implemented and tested.

| Tool | File | Wrap Policy | Status |
| :--- | :--- | :--- | :--- |
| `android` | `packages/opencode/src/tool/android/android.ts` | `raw-only` | ✅ Done — wraps Google's official Android CLI |
| `gradle` | `packages/opencode/src/tool/android/gradle.ts` | `raw-only` | ✅ Done — runs Gradle tasks via shell |
| `logcat` | `packages/opencode/src/tool/android/logcat.ts` | `raw-only` | ✅ Done — streams `adb logcat` output |
| `lint` | `packages/opencode/src/tool/android/lint.ts` | `raw-only` | ✅ Done — runs Android Lint, parses XML reports |
| `manifest` | `packages/opencode/src/tool/android/manifest.ts` | `raw-only` | ✅ Done — parses `AndroidManifest.xml` |
| `resources` | `packages/opencode/src/tool/android/resources.ts` | `raw-only` | ✅ Done — scans `res/` directories |
| `module-graph` | `packages/opencode/src/tool/android/module-graph.ts` | `raw-only` | ✅ Done — parses Gradle module deps |
| `apk-analyzer` | `packages/opencode/src/tool/android/apk-analyzer.ts` | `raw-only` | ✅ Done — wraps `apkanalyzer` CLI |
| `signing` | `packages/opencode/src/tool/android/signing.ts` | `raw-only` | ✅ Done — inspects signing configs safely |
| `dependency-catalog` | `packages/opencode/src/tool/android/dependency-catalog.ts` | `raw-only` | ✅ Done — queries and edits `libs.versions.toml` |

All tools are registered in `registry.ts` and have corresponding `.txt` description files and unit tests in `test/tool/android/`.

---

## 3.2 Subagents & Primary Agents (6 of 6)

> **STATUS:** ✅ All 6 implemented and tested.

**File:** `packages/opencode/src/agent/agent.ts` (agents record at line ~132)

| Agent | Mode | Model Default | Prompt File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `android-build` | primary | Sonnet-class | `prompt/android-build.txt` | ✅ Done |
| `android-plan` | primary | Opus-class | `prompt/android-plan.txt` | ✅ Done |
| `android-debug` | subagent | Sonnet-class | `prompt/android-debug.txt` | ✅ Done |
| `android-review` | subagent | Opus-class | `prompt/android-review.txt` | ✅ Done |
| `android-explore` | subagent | Haiku-class | `prompt/android-explore.txt` | ✅ Done |
| `android-kmp` | subagent | Sonnet-class | `prompt/android-kmp.txt` | ✅ Done |

**Permissions:**
- `android-debug`: Allows `logcat`, `bash`, `read`, `grep`, `glob`. Denies `write`, `edit`.
- `android-review`: Denies ALL edit tools. Allows `read`, `grep`, `glob`.
- `android-explore`: Same as existing `explore` with Android file pattern awareness.
- `android-kmp`: Allows all read/search tools. Denies edits.

Tests in `test/agent/agent.test.ts` (lines 736–793) verify registration, properties, and permission rules.

---

## 3.3 Shipped Skills (24+ skills)

> **STATUS:** ✅ All skills created, parseable, and routing-correct.

**Directory:** `.agents/skills/` (agentskills.io standard)

**Process Skills (3):**
- ✅ `android-brainstorm` — task_types: ["planning"]
- ✅ `android-debug-workflow` — task_types: ["debugging"]
- ✅ `android-migration` — content_patterns: ["migrate", "upgrade", "AndroidX"]

**Implementation Skills (13):**
- ✅ `android-compose`, `android-views`, `android-navigation`, `android-networking`, `android-database`, `android-di`, `android-architecture`, `android-permissions`, `android-kmp`, `android-deeplinks`, `android-widgets`, `android-modularization`, `android-workmanager`

**Analysis Skills (3):**
- ✅ `android-performance`, `android-security`, `android-accessibility`

**Tooling Skills (5):**
- ✅ `android-gradle`, `android-testing`, `android-ci`, `android-release`, `android-proguard`

**Bootstrap Skills (3):**
- ✅ `android-core`, `skill-router`, `skill-guide` — always loaded

**Each skill:**
1. Conforms to agentskills.io frontmatter standard. ✅
2. Includes `metadata.orchestration` for AndroidCode routing. ✅
3. Is ≤20k characters (~5k tokens). ✅
4. Test verifying parse + route exists. ✅ (`test/skill/shipped-skills.test.ts`)

---

## 3.4 Skill Versioning

> **STATUS:** ✅ Fully implemented.

**File:** `packages/opencode/src/skill/version.ts`

- ✅ Parse `version` from orchestration frontmatter (schema includes it).
- ✅ Local on-disk skills (`.agents/skills/`) always take precedence over cached URL skills.
- ✅ Version conflicts log a warning; tied versions keep existing entry (scan-order independent).
- ✅ Breaking change detection: if major version differs, a `Session.Event.Error` is published at session start to alert the user.

**File:** `packages/opencode/src/skill/index.ts` (lines 171–212) — `resolveSkillPrecedence` and `isMajorConflict` integrated into the skill-loading pipeline.

Tests in `test/skill/version.test.ts`.

---

## 3.5 Integration Testing

> **STATUS:** ✅ Implemented and passing.

**File:** `packages/opencode/test/integration/android-e2e.test.ts` (223 lines, 12 tests)

**Scenarios:**
1. ✅ Open Android project fixture → verify `android_project_context` is injected.
2. ✅ Ask "build the app" → verify `android-build` agent, `gradle` tool, `android-gradle` skill are in the active set.
3. ✅ Ask "why did the build fail?" → verify `android-debug` subagent permissions allow `logcat`/`read`, deny `edit`.
4. ✅ Ask "review this code" → verify `android-review` subagent denies all editing tools.
5. ✅ Switch task mid-conversation → verify skill re-routing occurs (performance skill replaces compose patterns).

The test is LLM-free (drives the skill router, agent registry, and project-context generator directly), keeping it deterministic and fast.

---

## 3.6 Phase 3 Completion Criteria

- [x] All 9 gap-filler tools are implemented and tested.
- [x] All 6 primary/subagents are implemented and tested.
- [x] All 24+ skills are written, parse correctly, and include `metadata.orchestration`.
- [x] Skill versioning works (local > cached, breaking change alerts).
- [x] Integration test suite passes (12/12).
- [x] `/skills` shows correct active set for each scenario above.

**Phase 3 is complete.**
