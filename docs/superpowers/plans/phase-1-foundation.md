# Phase 1: Foundation (Weeks 1–8)

**Goal:** Make AndroidCode functional as a rebranded OpenCode with Android-aware agents, a working `android` CLI wrapper, 3 gap-filler tools, and auto-installed Google skills.

**Prerequisite:** Phase 0 work (Project Intelligence, CLI Probe, System Prompt Injection, Test Fixtures) is already complete on branch `phase1/project-intel`.

---

## 1.1 Rebranding

> **STATUS:** ✅ Complete. The `androidcode` name and `android` tool are in place. The config loader prioritizes `androidcode.jsonc`/`androidcode.json` (`packages/opencode/src/config/config.ts` — see `globalConfigFile()` and `loadGlobal()`), `flag.ts` reads `ANDROIDCODE_*` env vars first (falling back to `OPENCODE_*` for upstream compat), and `Global.Path` uses `.androidcode/` (`global.ts`, `app = "androidcode"`).

**Why:** Every user-facing string, config key, and directory name currently says `opencode`. The fork must establish its own identity before any public usage.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `package.json` (root) | Change `name` from `"opencode"` to `"androidcode"`. Update workspace names if needed. |
| `packages/opencode/package.json` | Change `name`, `bin` (`opencode` → `androidcode`), update description. |
| `packages/opencode/src/config/config.ts` | ✅ Done. `globalConfigFile()` and `loadGlobal()` recognize `androidcode.json`/`androidcode.jsonc` (preferred), falling back to `opencode.*`. |
| `packages/opencode/src/flag/flag.ts` | Rename `OPENCODE_*` flags to `ANDROIDCODE_*` (or keep `OPENCODE_` internally for upstream compat, but alias `ANDROIDCODE_` for user-facing env vars). |
| `packages/opencode/src/global.ts` | Update `Global.Path` entries to use `.androidcode/` instead of `.opencode/`. |
| `packages/opencode/src/skill/index.ts` | Update `EXTERNAL_DIRS` and skill scanning paths to include `.androidcode/skills/`, `.agent/skills/`. |
| `packages/opencode/src/tool/registry.ts` | Update `Flag.OPENCODE_*` references to `Flag.ANDROIDCODE_*`. |
| `packages/opencode/src/session/system.ts` | Update references if any hardcoded `.opencode/` paths exist. |
| `packages/opencode/test/**` | Update any test fixtures that hardcode `.opencode/` paths. |
| `packages/web/src/content/docs/**` | Update documentation (can be deferred to Phase 4, but at least the English `tools.mdx` and `skills.mdx` should be updated). |

**Verification:**
- `bun test --timeout 30000` in `packages/opencode/` passes.
- Running `bun run dev` starts the CLI with `androidcode` branding.
- Config file `androidcode.json` is read from project root and `~/.androidcode/`.

**Risk:** Upstream rebases become harder after a full rebrand. Mitigation: maintain a `REBRAND_MAP.md` documenting every rename so future rebases have a translation guide.

---

## 1.2 Android Tool — Fix Stub & Wire into Registry

> **STATUS:** ✅ Complete. `android.ts` is fully implemented with wrap-with-fallback for Windows emulator, registered in `tool/registry.ts`, and `probe.ts` exists. Tests added in `test/tool/android/android.test.ts`.

**Current state:** `packages/opencode/src/tool/android/android.ts` is a stub with **broken imports** (`../util/tool-result` does not exist) and is **not imported** in `tool/registry.ts`.

**Files to modify:**

| File | Action |
| :--- | :--- |
| `packages/opencode/src/tool/android/android.ts` | **Fix.** Remove the broken `makeToolResult` / `ErrorCodes` imports. Rewrite the execute function to return results in the same shape as `BashTool`. Implement the wrap-with-fallback logic for Windows emulator using `avdmanager` / `emulator` binaries. |
| `packages/opencode/src/tool/registry.ts` | **Add import and registration.** Import `AndroidTool` from `./android/android`. Add it to the `Effect.all({ ... })` initialization block and to the `builtin` array. Provide `AndroidProbe.layer` and `AndroidTool.layer` in `defaultLayer`. |
| `packages/opencode/src/tool/android/probe.ts` | **Enhance.** Add `ANDROIDCODE_DISABLE_ANDROID_TOOL` flag check. Cache invalidation hook. |

**Verification:**
- `bun test` in `packages/opencode/test/tool/` passes (add `android.test.ts`).
- The `android` tool appears in the tool list when running the CLI.
- Invoking `android` with `sdk` subcommand works on a machine with the CLI installed.
- Invoking `android emulator` on Windows falls back correctly.

---

## 1.3 Gap-Filler Tools (3 of 9)

> **STATUS:** ✅ Complete. `gradle.ts`, `logcat.ts`, and `lint.ts` are fully implemented with `Tool.define(...)`, registered in `tool/registry.ts`, and have unit tests.

**Pattern to follow:** Each tool is a `Tool.define(...)` export in its own file, imported and initialized in `tool/registry.ts`. Use `Effect.gen` for async operations, `ChildProcessSpawner` for shell execution, and `z` from `zod` for parameter schemas.

**What's done:** Description `.txt` files exist.
**Still needed:**
- `packages/opencode/src/tool/android/gradle.ts` — implement Tool.define
- `packages/opencode/src/tool/android/logcat.ts` — implement Tool.define
- `packages/opencode/src/tool/android/lint.ts` — implement Tool.define
- `packages/opencode/src/tool/registry.ts` — import and register all three tools

### 1.3.1 `gradle` Tool

**File:** `packages/opencode/src/tool/android/gradle.ts`

**Parameters:**
```typescript
z.object({
  task: z.string().describe("Gradle task name, e.g., ':app:assembleDebug'"),
  flags: z.array(z.string()).optional().describe("Additional flags like '--info', '--scan'"),
  module: z.string().optional().describe("Target module (e.g., ':app'). If omitted, runs at root."),
})
```

**Behavior:**
1. Detect `gradlew` vs `gradle` — prefer wrapper.
2. Build command: `./gradlew :module:task flags`.
3. Execute via `ChildProcessSpawner`.
4. Parse output: detect `BUILD SUCCESSFUL` / `BUILD FAILED`. Extract error lines with file paths.
5. Return structured result with `status`, `rawOutput`, `errors` array.

**Reuse:** The `android-intelligence.ts` already detects `hasWrapper` — the gradle tool can import `scan(cwd)` to check.

### 1.3.2 `logcat` Tool

**File:** `packages/opencode/src/tool/android/logcat.ts`

**Parameters:**
```typescript
z.object({
  packageName: z.string().describe("Application package name to filter by (e.g., 'com.example.app')"),
  level: z.enum(["V", "D", "I", "W", "E", "F"]).optional().describe("Minimum log level"),
  lines: z.number().optional().describe("Max lines to return (default: 500)"),
  since: z.string().optional().describe("Time filter, e.g., '10s' or '5m'"),
})
```

**Behavior:**
1. Verify a device is connected (`adb devices`).
2. Build `adb logcat` command with filters.
3. Execute via `ChildProcessSpawner`.
4. Parse standard Android log format.
5. Return structured array of log entries.

### 1.3.3 `lint` Tool

**File:** `packages/opencode/src/tool/android/lint.ts`

**Parameters:**
```typescript
z.object({
  module: z.string().optional().describe("Module to lint (e.g., ':app'). Default: all modules."),
  variant: z.string().optional().describe("Build variant, e.g., 'debug'"),
  baseline: z.string().optional().describe("Path to baseline file for comparison"),
})
```

**Behavior:**
1. Build command: `./gradlew :module:lintVariant`.
2. Parse XML output from `build/reports/lint-results-variant.xml`.
3. Extract issues: severity, category, message, file, line.
4. Return structured array.

**Registration:** Add all three to `tool/registry.ts` in the `Effect.all` block and `builtin` array.

**Verification:**
- Create `packages/opencode/test/tool/android/gradle.test.ts` with mock `ChildProcessSpawner` layer.
- Create `logcat.test.ts` and `lint.test.ts` similarly.

---

## 1.4 Agents — `android-build` and `android-plan`

> **STATUS:** ✅ Complete. Both agents are defined in `packages/opencode/src/agent/agent.ts` (lines 281–317), prompt files `android-build.txt` and `android-plan.txt` exist. Tests added.

**Current state:** Only generic OpenCode agents exist (`build`, `plan`, `general`, `explore`). No Android-specific agents.

**Files to modify/create:**

| File | Action |
| :--- | :--- |
| `packages/opencode/src/agent/prompt/android-build.txt` | **Create.** System prompt describing the agent's Android expertise: Gradle module awareness, lifecycle constraints, Compose vs Views, KMP awareness. Keep it under ~500 tokens. |
| `packages/opencode/src/agent/prompt/android-plan.txt` | **Create.** System prompt for architecture planning: modularization guidance, dependency inversion, convention plugin best practices. |
| `packages/opencode/src/agent/agent.ts` | Add `android-build` and `android-plan` to the `agents` record. Wire `prompt` and `description`. Both are `mode: "primary"`, `native: true`. |
| `packages/opencode/test/agent/agent.test.ts` | Add tests verifying `android-build` and `android-plan` appear in `list()`, have correct `mode`, and are selectable via `get()`. |

**Agent Definitions:**

- **android-build:** Default primary agent for Android development. Model default: Sonnet-class. Allows `question`, `plan_enter`.
- **android-plan:** Architecture planning specialist. Model default: Opus-class. Denies all edits. Allows `question`, `plan_exit`.

---

## 1.5 Auto-Install Google's Official Skills

> **STATUS:** ✅ Complete. `GOOGLE_SKILLS_URL` exists in `packages/opencode/src/skill/discovery.ts` (line 12). `auto_install_google_skills` is in config (`src/config/skills.ts` line 10). Auto-install logic in `src/skill/index.ts` (lines 243–252). Tests added.

**Current state:** `Skill.discovery.ts` can pull skills from URLs (`cfg.skills.urls`), but there is no hardcoded URL for Google's skills and no auto-install trigger.

**Files to modify:**

| File | Action |
| :--- | :--- |
| `packages/opencode/src/skill/discovery.ts` | Add `GOOGLE_SKILLS_URL` constant (`https://goo.gle/android-skills` or the actual well-known endpoint). |
| `packages/opencode/src/skill/index.ts` | In `discoverSkills`, after loading user-configured URLs, check if Google skills are already cached. If not, attempt to pull from `GOOGLE_SKILLS_URL`. Log success/failure. |
| `packages/opencode/src/config/skills.ts` | Add `auto_install_google_skills: Schema.optional(Schema.Boolean)` to `ConfigSkills.Info`. Default: `true`. |
| `packages/opencode/src/config/config.ts` | Include `auto_install_google_skills` in the main config schema. |
| `packages/opencode/test/skill/discovery.test.ts` | Add test: mock HTTP response for `index.json`, verify skills are pulled and cached. |

---

## 1.6 Phase 1 Completion Criteria

- [x] All existing tests pass (`bun test --timeout 30000`).
- [x] New tests for android tool pass.
- [x] New tests for **gradle, logcat, lint** tools pass.
- [x] New tests for agents and skill auto-install pass.
- [x] The CLI starts with `androidcode` branding.
- [x] `android` tool is available and functional.
- [x] `gradle`, `logcat`, `lint` tools are available and functional.
- [x] `android-build` and `android-plan` agents are selectable.
- [x] Google skills auto-install on first use (or are cached after first attempt).
- [x] `androidcode.json` is recognized as the config file (preferred over `opencode.json`).
