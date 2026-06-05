# Phase 5: Gap-Filler Tools, Batch 2 (project structure)

**Goal:** Ship the deterministic Android-file parsers that power project intelligence: `manifest`, `resources`, `module-graph`.
**Depends on:** Phase 1
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §4.4–4.6

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase5/gap-tools-batch2` off it.
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

## 5.1 `manifest` Tool

**Why:** The agent needs to read `AndroidManifest.xml` to understand permissions, activities, services, and intent filters. Returning a structured JSON representation lets the agent reason about the app's surface without parsing XML itself.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/manifest.ts` | **New file.** Define `ManifestTool` with `Tool.define("manifest", ...)`. Parameters: `{ module?: string; readOnly?: boolean; edits?: { path: string; value: string }[] }`. Execute: resolve `AndroidManifest.xml` for the requested module (default app module). Use a lightweight XML parser (e.g., `fast-xml-parser` or `htmlparser2` if already in the dependency tree) to extract: `package`, `application` attributes, `activities` (name + exported + intent-filters), `services`, `receivers`, `providers`, `permissions` (declared + requested). Return `AndroidToolResult` with `data: { manifest: ParsedManifest }`. If `edits` is provided, apply edits and write back (gated by permission). |
| `packages/opencode/src/tool/registry.ts` | Import and yield `ManifestTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/manifest.txt` | **New file.** Tool description text. |

## Verification

- Against a sample Android project: invoke `manifest` with no args; verify output contains `package`, `activities` array with at least the main activity, and `permissions`.
- Test the edit path: invoke `manifest` with `edits: [{ path: "application.@android:allowBackup", value: "false" }]`, then re-read the file and verify the attribute changed.

## Risk

- **Risk:** XML namespace handling (`android:` prefix) is brittle across different manifest styles. → **Mitigation:** Strip namespace prefixes during parse and re-add them during serialize. Only support a fixed set of well-known Android namespace URIs. Document unsupported cases.

---

## 5.2 `resources` Tool

**Why:** Android resources (`res/values/`, `res/layout/`, `res/drawable/`) are a core part of the project structure. The agent needs to list, read, and modify resource files without guessing file paths.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/resources.ts` | **New file.** Define `ResourcesTool` with `Tool.define("resources", ...)`. Parameters: `{ action: "list" | "read" | "write"; module?: string; type?: string; name?: string; content?: string }`. Execute: resolve `src/main/res/` for the requested module. `list`: return all resource directories and file names. `read`: read the specific resource file (e.g., `type: "layout", name: "activity_main"` → `res/layout/activity_main.xml`). `write`: write content to the resource file (create directories if needed). Return `AndroidToolResult` with appropriate `data`. |
| `packages/opencode/src/tool/resources.ts` | Handle `values` XML specially: for `read`, parse `<string>`, `<color>`, `<dimen>`, etc. into a flat map. For `write`, merge entries into the existing XML file preserving the rest. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `ResourcesTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/resources.txt` | **New file.** Tool description text. |

## Verification

- `resources` with `action: "list"` returns `drawable/`, `layout/`, `values/`, etc.
- `resources` with `action: "read", type: "layout", name: "activity_main"` returns the XML content.
- `resources` with `action: "write", type: "values", name: "strings", content: '<string name="app_name">NewName</string>'` merges the entry into `res/values/strings.xml`.

## Risk

- **Risk:** `write` to `values` XML corrupts the file by duplicating entries or mangling formatting. → **Mitigation:** Before write, parse the existing XML, check if the entry name already exists, and replace-in-place if so. Use a simple string-based merge only as fallback; prefer DOM-like manipulation.

---

## 5.3 `module-graph` Tool

**Why:** Understanding Gradle module dependencies is critical for refactoring, migration, and build optimization. The agent needs a structured module graph to answer "what depends on `:feature:x`?".

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/module-graph.ts` | **New file.** Define `ModuleGraphTool` with `Tool.define("module-graph", ...)`. Parameters: `{ includeTestDependencies?: boolean; format?: "json" | "dot" }`. Execute: run `./gradlew projects` (or a custom Gradle task that prints dependency info) to get the module list. Then run `./gradlew dependencies --configuration implementation` per module, or use a single `./gradlew allDependencies` if the project has one. Parse the ASCII dependency tree into a structured graph: `{ modules: { name: string, path: string, dependencies: string[], dependents: string[] }[] }`. Return `AndroidToolResult` with `data: { graph: ModuleGraph }`. |
| `packages/opencode/src/tool/module-graph.ts` | If Gradle is not available, return `makeError("GRADLE_NOT_FOUND", "gradlew not found in project root")`. |
| `packages/opencode/src/tool/registry.ts` | Import and yield `ModuleGraphTool`; add to the `builtin` list. |
| `packages/opencode/src/tool/module-graph.txt` | **New file.** Tool description text. |

## Verification

- Against a multi-module Android project: invoke `module-graph`; verify the output contains all modules and their `dependencies` / `dependents` arrays are populated.
- Against a non-Gradle directory: verify `error.code: "GRADLE_NOT_FOUND"`.

## Risk

- **Risk:** Parsing Gradle's ASCII dependency tree is brittle. → **Mitigation:** Prefer `--configuration implementation` and parse only the flat list (not the tree). If the project has the `allDependencies` custom task (documented in the tool description as a recommendation), use that for a more stable JSON-like output. Keep the ASCII parser as fallback.

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- Each tool (`manifest`, `resources`, `module-graph`) parses a sample project's files and returns structured data consumable by the Project Context generator (Phase 7)

## Risk (phase-wide)

- **Risk:** These tools do heavy file I/O and XML parsing, potentially blocking the agent loop. → **Mitigation:** All I/O uses Effect (`FSUtil.Service`, `FileSystem.FileSystem`) which is async. For very large projects, add a 5-second timeout and return partial data with a warning flag.
