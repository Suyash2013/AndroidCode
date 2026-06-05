# Phase 4: Gap-Filler Tools, Batch 1 (build & logs)

**Goal:** Ship the core build/diagnostics tools: `gradle`, `logcat`, `lint`.
**Depends on:** Phase 1
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §4.1–4.3

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase4/gap-tools-batch1` off it.
- **Commits:** conventional-commit format `<type>(<scope>): <subject>`.

**Compliance gate — must pass BEFORE PR merge:**

- [ ] PR title matches conventional commit format
- [ ] PR template filled with real content — all five sections
- [ ] Linked issue via Fixes/Closes (auto-skipped for docs/refactor/feat)
- [ ] `bun turbo test:ci` green (Linux + Windows)
- [ ] `bun typecheck` green (TypeScript)
- [ ] `bun run test:httpapi` green in `packages/opencode` (Linux), where applicable

**Phase done = a compliant, green PR merged to `dev`.**

---

## 4.1 `gradle` Tool

**Why:** The agent needs to run Gradle tasks (build, test, assemble) and receive structured output (task list, failures, warnings) rather than a raw wall of text. This is the most frequently used Android build tool.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/gradle.ts` | **New file.** Define `GradleTool` with `Tool.define("gradle", ...)`. Parameters: `{ task: string; args?: string[]; variant?: string }`. Execute: locate `gradlew` in the project root (or fall back to system `gradle`), spawn the task with `--console=plain` and `--build-cache` flags, capture stdout/stderr, and parse the output. Return `AndroidToolResult` with `status: "success"` + `{ tasks: string[], duration?: number }` or `status: "error"` + `error.code: "BUILD_FAILED"` and extracted failure lines. |
| `packages/opencode/src/tool/gradle.ts` | Use `ChildProcessSpawner` and `ChildProcess.make` per AGENTS.md. Apply the default timeout from `RuntimeFlags.Service` (or a Gradle-specific longer timeout, e.g., 10 minutes). |
| `packages/opencode/src/tool/registry.ts` | Import and yield `GradleTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/gradle.txt` | **New file.** Tool description text explaining what the tool does, expected parameters, and that it returns structured JSON the agent can branch on. |

## Verification

- Against a sample Android project: invoke `gradle` tool with task `"build"`; verify the output JSON contains `status: "success"` and a non-empty `tasks` array.
- Introduce a deliberate compile error in the sample project; invoke `gradle` with task `"build"`; verify output contains `status: "error"`, `error.code: "BUILD_FAILED"`, and the failure message is captured.

## Risk

- **Risk:** Gradle output format changes between AGP versions and breaks parsing. → **Mitigation:** Parse only `--console=plain` output, which is stable. Keep the parser shallow: look for `BUILD FAILED` / `BUILD SUCCESSFUL` markers and capture the last 20 lines of stderr on failure. Do not attempt to parse every Gradle log line.

---

## 4.2 `logcat` Tool

**Why:** Debugging Android crashes requires streaming and filtering logcat output. A general-purpose `bash` tool can run `adb logcat`, but a dedicated tool adds PID tracking, package-name filtering, and structured line parsing that the agent can reason about.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/logcat.ts` | **New file.** Define `LogcatTool` with `Tool.define("logcat", ...)`. Parameters: `{ package?: string; pid?: string; filter?: string; lines?: number; timeoutMs?: number }`. Execute: if `package` is provided, resolve its PID via `adb shell pidof <package>` first. Spawn `adb logcat` with filters (e.g., `adb logcat --pid=<pid>` or tag filters). Stream output for `timeoutMs` (default 30s or `lines` reached), then kill the process. Parse each line into `{ level: "V"|"D"|"I"|"W"|"E"|"F", tag: string, message: string, time?: string }`. Return `AndroidToolResult` with `data: { lines: ParsedLine[], truncated: boolean }`. |
| `packages/opencode/src/tool/logcat.ts` | Handle the "no device" case by returning `makeError("NO_DEVICE", "No Android device or emulator connected")`. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `LogcatTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/logcat.txt` | **New file.** Tool description text. |

## Verification

- With an emulator running and a sample app installed: invoke `logcat` with `package: "com.example.sample"`; verify output contains only lines from that package's PID and each line is parsed with a `level` field.
- With no emulator: invoke `logcat`; verify output is `error.code: "NO_DEVICE"`.

## Risk

- **Risk:** `adb logcat` stream blocks indefinitely if the device disconnects mid-stream. → **Mitigation:** Use `Effect.timeout` (or `Effect.race` with `Effect.sleep`) on the stream fiber. Kill the `adb` child process on timeout via `Effect.addFinalizer`.

---

## 4.3 `lint` Tool

**Why:** Android Lint finds performance, correctness, and security issues. The agent needs structured lint results (file, line, severity, message) to suggest fixes.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/lint.ts` | **New file.** Define `LintTool` with `Tool.define("lint", ...)`. Parameters: `{ variant?: string; paths?: string[] }`. Execute: run `./gradlew lint<Variant>` (or `lint` if no variant). Wait for completion. Parse the XML report at `build/reports/lint-results-<variant>.xml` (or the default path). Map each `<issue>` node to `{ severity: "Error"|"Warning"|"Informational", category: string, message: string, location: { file: string, line: number, column?: number } }`. Return `AndroidToolResult` with `data: { issues: Issue[] }`. If the report file is missing, return `makeError("BUILD_FAILED", "Lint report not found — did the lint task fail?")`. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `LintTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/lint.txt` | **New file.** Tool description text. |

## Verification

- Against a sample Android project with a known lint issue (e.g., missing `contentDescription` on an ImageView): invoke `lint`; verify the output JSON contains an issue with `severity: "Warning"`, the correct file path, and line number.
- Delete the lint report XML and invoke `lint`; verify `error.code: "BUILD_FAILED"`.

## Risk

- **Risk:** Lint XML format changes between AGP versions. → **Mitigation:** Parse only the stable fields (`severity`, `id`, `message`, `location@file`, `location@line`). Ignore unknown attributes. Add a unit test with a mocked XML string from two AGP versions to prove resilience.

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- Each tool (`gradle`, `logcat`, `lint`) runs against a sample project, parses output, and returns structured success/error conforming to `AndroidToolResult`

## Risk (phase-wide)

- **Risk:** Tools require a real Android project + emulator for integration tests, making CI slow or flaky. → **Mitigation:** Use mocked `ChildProcessSpawner` for unit tests (assert parsing and error codes). Run real-device integration tests only in a manual / nightly job, not in `test:ci`.
