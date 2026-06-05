# Phase 6: Gap-Filler Tools, Batch 3 (artifacts & dependencies)

**Goal:** Ship the remaining gap-filler tools: `apk-analyzer`, `signing`, `dependency-catalog`.
**Depends on:** Phase 1
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §4.7–4.9

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase6/gap-tools-batch3` off it.
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

## 6.1 `apk-analyzer` Tool

**Why:** Inspecting APK contents (DEX count, resource size, manifest summary) helps the agent diagnose build bloat and ProGuard/R8 issues. The tool wraps `aapt2` or the Android SDK's `apkanalyzer` if available, falling back to manual ZIP inspection.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/apk-analyzer.ts` | **New file.** Define `ApkAnalyzerTool` with `Tool.define("apk-analyzer", ...)`. Parameters: `{ apkPath?: string; variant?: string }`. Execute: if `apkPath` is not absolute, resolve it from `app/build/outputs/apk/<variant>/app-<variant>.apk`. Verify the file exists. If `apkanalyzer` is on PATH, run `apkanalyzer apk summary <apkPath>` and `apkanalyzer files list <apkPath>`. Otherwise, fall back to ZIP listing via `Bun.file(apkPath).zip()` (or `JSZip` / `@zip.js/zip.js` if already in deps). Parse into: `{ size: number, dexCount: number, manifest: { package: string, versionCode: number, versionName: string }, largestFiles: { name: string, size: number }[] }`. Return `AndroidToolResult`. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `ApkAnalyzerTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/apk-analyzer.txt` | **New file.** Tool description text. |

## Verification

- Build a sample APK and invoke `apk-analyzer` with the default path; verify output contains `size`, `dexCount`, and `largestFiles`.
- Delete the APK and invoke `apk-analyzer`; verify `error.code: "RESOURCE_NOT_FOUND"`.

## Risk

- **Risk:** `apkanalyzer` output format is not guaranteed stable. → **Mitigation:** The ZIP fallback is the stable base; `apkanalyzer` is an optional accelerator. If `apkanalyzer` output is unparseable, gracefully fall back to ZIP inspection and log a warning.

---

## 6.2 `signing` Tool (No-Password-Leak Rule)

**Why:** Managing signing configurations is sensitive. The tool must inspect `build.gradle*` signing configs and keystores without ever emitting keystore passwords in tool output or logs. This is a hard security requirement.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/signing.ts` | **New file.** Define `SigningTool` with `Tool.define("signing", ...)`. Parameters: `{ action: "inspect" | "validate"; module?: string }`. Execute: read the module's `build.gradle*` files and extract `signingConfigs` blocks. For `inspect`, return `{ configs: { name: string, storeFile?: string, keyAlias?: string, storeType?: string }[] }` — **never include `storePassword` or `keyPassword`**. For `validate`, check that `storeFile` exists on disk and return `{ valid: boolean, missingFiles: string[] }`. |
| `packages/opencode/src/tool/signing.ts` | Add a `redactPasswords(text: string): string` helper that replaces any value assigned to `storePassword` or `keyPassword` with `"***REDACTED***"`. Apply this helper to every string that is returned in `output` and to every log line. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `SigningTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/signing.txt` | **New file.** Tool description text, explicitly stating: "Passwords are never returned or logged." |

## Verification

- Create a `build.gradle.kts` with a `signingConfigs` block containing plaintext passwords. Invoke `signing` with `action: "inspect"`. Verify the returned JSON does not contain the password strings (use `expect(...).not.toContain("mySecret")`).
- Check tool logs (via a test mock of the logging layer) and verify no password strings appear.
- Run `bun test --cwd packages/opencode test/tool/signing-password-leak.test.ts` — this test **must** pass for the phase to be accepted.

## Risk

- **Risk:** A future refactor accidentally removes the redaction helper. → **Mitigation:** The password-leak test is a permanent CI gate. It fails the build if any password string appears in tool output or logs. The test uses a hardcoded dummy password and asserts its absence.

---

## 6.3 `dependency-catalog` Tool

**Why:** Gradle Version Catalogs (`gradle/libs.versions.toml`) are the modern way to manage dependencies. The agent needs to read, search, and suggest updates to catalog entries without manual TOML editing.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/dependency-catalog.ts` | **New file.** Define `DependencyCatalogTool` with `Tool.define("dependency-catalog", ...)`. Parameters: `{ action: "list" | "get" | "update"; key?: string; version?: string }`. Execute: locate `gradle/libs.versions.toml`. `list`: return all `[libraries]`, `[plugins]`, `[versions]` entries as `{ libraries: { key: string, module: string, version: string }[] }`. `get`: return a single entry by key. `update`: rewrite the TOML file, updating the version for the given key (create the entry if it doesn't exist in the `[versions]` table). Return `AndroidToolResult`. |
| `packages/opencode/src/tool/dependency-catalog.ts` | Use a small custom TOML parser/writer since `libs.versions.toml` is constrained (no nested tables beyond `[libraries]`, `[plugins]`, `[bundles]`, `[versions]`). Avoid adding a heavy dependency just for this. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `DependencyCatalogTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/dependency-catalog.txt` | **New file.** Tool description text. |

## Verification

- Against a sample project with `libs.versions.toml`: invoke `dependency-catalog` with `action: "list"`; verify output contains keys like `android-gradle-plugin`, `kotlin`, `compose-bom`.
- Invoke `dependency-catalog` with `action: "update", key: "kotlin", version: "2.1.0"`; verify the TOML file is rewritten with the new version and no other entries are corrupted.

## Risk

- **Risk:** TOML parsing is subtle (inline tables, multiline strings, comments). → **Mitigation:** Implement only the subset used by version catalogs: simple `key = "value"` assignments and `[section]` headers. Preserve unknown lines as-is when rewriting. Add a round-trip test that asserts a parsed-then-serialized TOML is identical to the original for valid version-catalog files.

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- Each tool (`apk-analyzer`, `signing`, `dependency-catalog`) runs against a sample project and returns structured `AndroidToolResult`
- `signing` never emits keystore passwords in output or logs (verified by `test/tool/signing-password-leak.test.ts`)

## Risk (phase-wide)

- **Risk:** Tools in this batch require file paths that vary per project (e.g., APK output directory name differs between `app/build/outputs/apk/debug/` and `app/build/outputs/apk/release/`). → **Mitigation:** Accept `variant` parameter with sensible defaults (`debug`); if the default path doesn't exist, return a structured error listing the actual APK files found in `app/build/outputs/apk/` so the agent can retry with the correct variant.
