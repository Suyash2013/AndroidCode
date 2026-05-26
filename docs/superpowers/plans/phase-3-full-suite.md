# Phase 3: Full Tool Suite, Skills & Agents (Weeks 17–28)

**Goal:** Complete the remaining 6 gap-filler tools, 4 subagents, and all 24 shipped skills.

**Prerequisite:** Phase 2 must be complete (Skill Orchestration Engine functional).

---

## 3.1 Remaining Gap-Filler Tools (6 of 9)

> **STATUS:** ❌ None implemented.

| Tool | File | Wrap Policy | Key Complexity | Status |
| :--- | :--- | :--- | :--- | :--- |
| `manifest` | `packages/opencode/src/tool/android/manifest.ts` | `raw-only` | XML parsing/modification of `AndroidManifest.xml`. | ❌ Not started |
| `resources` | `packages/opencode/src/tool/android/resources.ts` | `raw-only` | Navigate `res/` directory, parse resource types. | ❌ Not started |
| `module-graph` | `packages/opencode/src/tool/android/module-graph.ts` | `raw-only` | Parse Gradle module dependencies. Reuse `android-intelligence.ts`. | ❌ Not started |
| `apk-analyzer` | `packages/opencode/src/tool/android/apk-analyzer.ts` | `raw-only` | Use `apkanalyzer` CLI or unzip + parse APK contents. | ❌ Not started |
| `signing` | `packages/opencode/src/tool/android/signing.ts` | `raw-only` | Read signing configs. **Security rule:** Never log keystore passwords. | ❌ Not started |
| `dependency-catalog` | `packages/opencode/src/tool/android/dependency-catalog.ts` | `raw-only` | Query/manage `libs.versions.toml`. Reuse `parseVersionCatalogFromPath`. Add write capability. | ❌ Not started |

**Also note:** Phase 1 tools (`gradle`, `logcat`, `lint`) have description files but **no `.ts` implementations** yet — they are part of the 9 tool total.

---

## 3.2 Subagents (4 of 4)

> **STATUS:** ❌ None implemented.

**File:** `packages/opencode/src/agent/agent.ts` (extend `agents` record)

| Agent | Mode | Model Default | Description | Prompt File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `android-debug` | subagent | Sonnet-class | Debugging specialist. | `packages/opencode/src/agent/prompt/android-debug.txt` | ❌ Not started |
| `android-review` | subagent | Opus-class | Code review with Android best practices. | `packages/opencode/src/agent/prompt/android-review.txt` | ❌ Not started |
| `android-explore` | subagent | Haiku-class | Fast codebase navigation for Android. | `packages/opencode/src/agent/prompt/android-explore.txt` | ❌ Not started |
| `android-kmp` | subagent | Sonnet-class | Kotlin Multiplatform specialist. | `packages/opencode/src/agent/prompt/android-kmp.txt` | ❌ Not started |

**Permissions:**
- `android-debug`: Allow `logcat`, `bash`, `read`, `grep`, `glob`. Deny `write`, `edit`.
- `android-review`: Deny ALL edit tools. Allow `read`, `grep`, `glob`.
- `android-explore`: Same as existing `explore` with Android file pattern awareness.
- `android-kmp`: Allow all read/search tools. Deny edits.

---

## 3.3 Shipped Skills (24 skills)

> **STATUS:** ✅ All 24 skill skeletons created. They exist in `.agents/skills/` with proper `metadata.orchestration` frontmatter, but tests verifying parse + route are not yet written.

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

**Each skill MUST:**
1. Conform to agentskills.io frontmatter standard. ✅
2. Include `metadata.orchestration` for AndroidCode routing. ✅
3. Be ≤20k characters (~5k tokens). ✅ (all are well under)

**Still needed:**
4. Include a test verifying it parses and routes correctly. ❌ Not started.

---

## 3.4 Skill Versioning

> **STATUS:** ⚠ `version` field is parsed in frontmatter (line 37 of `orchestration.ts`) but **not enforced**. No semver validation, no local > cached precedence, no breaking change alerts.

**File:** `packages/opencode/src/skill/index.ts` (extend)

- ✅ Parse `version` from frontmatter (schema includes it).
- ❌ Local skills (`.androidcode/skills/`) always take precedence over cached URL skills — **not implemented**.
- ❌ On version conflict, log a warning — **not implemented**.
- ❌ Breaking change detection: if major version differs, alert the user at session start — **not implemented**.

---

## 3.5 Integration Testing

> **STATUS:** ❌ Not started.

**File:** `packages/opencode/test/integration/android-e2e.test.ts`

**Scenarios:**
1. Open Android project fixture → verify `android_project_context` is injected. ✅ (context injection works)
2. Ask "build the app" → verify `android-build` agent, `gradle` tool, `android-gradle` skill. ⚠ (`gradle` tool missing, but other parts work)
3. Ask "why did the build fail?" → verify `android-debug` subagent, `logcat`/`lint` tools. ❌ (subagent + tools missing)
4. Ask "review this code" → verify `android-review` subagent, edit tools denied. ❌ (subagent missing)
5. Switch task mid-conversation → verify skill re-routing occurs. ✅ (Phase 2 implements this)

---

## 3.6 Phase 3 Completion Criteria

- [ ] All 9 gap-filler tools are implemented and tested.
- [ ] All 5 primary/subagents are implemented and tested.
- [ ] All 24 skills are written, parse correctly, and include `metadata.orchestration`.
- [ ] Skill versioning works (local > cached, breaking change alerts).
- [ ] Integration test suite passes.
- [ ] `/skills` shows correct active set for each scenario above.
