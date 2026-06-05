# Phase 3: `init` Detection Pass + Pipeline Scaffolding

**Goal:** One project-detection pass that drives independent, regenerable generators.
**Depends on:** Phase 1
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §6

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase3/init-pipeline` off it.
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

## 3.1 `init` CLI Command Scaffold

**Why:** `init` is the bootstrap spine of AndroidCode. Before we can implement detection or generators, we need the CLI entry point that orchestrates them.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/cli/cmd/init.ts` | **New file.** Define `InitCommand` yargs module with subcommands: `init` (full), `init --skills`, `init --context`. Uses `effectCmd` pattern. Parameters: optional `--force` flag to override ownership rules. Handler imports the `InitPipeline` service (defined in 3.2) and calls `pipeline.run(flags)`. |
| `packages/opencode/src/index.ts` | Register `.command(InitCommand)` in the root yargs builder. |
| `packages/opencode/src/cli/cmd/init.ts` | Print a summary of what was generated and what was skipped (with reasons). |

## Verification

- `bun run --cwd packages/opencode src/index.ts init --help` shows the three flags.
- `bun run --cwd packages/opencode src/index.ts init` in a non-Android directory prints a friendly "no Android project detected" message.

## Risk

- **Risk:** The command conflicts with OpenCode's existing `init` if upstream adds one later. → **Mitigation:** AndroidCode's `init` is Android-specific; if upstream adds a generic `init`, we rename ours to `android init` (namespaced under the `android` command from Phase 2).

---

## 3.2 Shared Detection Pass

**Why:** Every generator needs the same project facts (module graph, SDK versions, AGP version, KMP setup, convention plugins). Running detection once and sharing the result avoids O(n) filesystem scans.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/detect.ts` | **New file.** Define `AndroidDetect` service with method `detect(directory): Effect.Effect<ProjectInfo>`. Implementation: (a) check for `gradlew` / `settings.gradle.kts` / `settings.gradle` to confirm Android/Gradle project, (b) list modules by scanning `**/build.gradle*` and reading `include` lines from settings, (c) read `gradle/libs.versions.toml` if present to extract AGP/Kotlin/Compose versions, (d) detect KMP by looking for `kotlin("multiplatform")` in build files, (e) detect convention plugins by scanning `buildSrc/` or `gradle/build-logic/`, (f) return `ProjectInfo` Schema.Class. |
| `packages/opencode/src/android/detect.ts` | Use `FSUtil.Service` and `FileSystem.FileSystem` (per AGENTS.md) for all file I/O. Parse TOML with a lightweight parser (e.g., `@iarna/toml` or a small custom parser since version-catalog TOML is constrained). |
| `packages/opencode/src/android/detect.ts` | Cache the `ProjectInfo` in `InstanceState` keyed by directory + mtime of `settings.gradle*` so re-detection is cheap. |

## Verification

- Point `init` at a sample Android project (e.g., a standard empty activity template) and verify `ProjectInfo` contains: `modules` (list of strings), `agpVersion`, `kotlinVersion`, `targetSdk`, `minSdk`, `kmp: boolean`, `conventionPlugins: string[]`.
- Point `init` at a non-Android directory and verify it returns a typed `NotAnAndroidProjectError` that the CLI prints gracefully.

## Risk

- **Risk:** Gradle build files are complex (script plugins, `apply from:`, Groovy DSL). → **Mitigation:** The detection pass is intentionally shallow — it reads only `settings.gradle*`, `libs.versions.toml`, and top-level `build.gradle*` files. Deep Gradle parsing is deferred to the `module-graph` and `dependency-catalog` tools in later phases.

---

## 3.3 Generator Registry

**Why:** Generators (`android-core`, Project Context Document, skills catalog) must be independent and regenerable. A registry decouples `init` from the individual generators, so adding a new generator in a later phase only requires registering it.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/generator.ts` | **New file.** Define `Generator` interface: `{ id: string; staleWhen(info: ProjectInfo): boolean; generate(info: ProjectInfo, flags: InitFlags): Effect.Effect<{ path: string; written: boolean }> }`. Define `GeneratorRegistry` service that holds a list of generators and exposes `run(info, flags)` which iterates the list, checks `staleWhen`, and calls `generate` if needed. |
| `packages/opencode/src/android/generator.ts` | Export `register(generator)` helper for use by later phases. |

## Verification

- Register a no-op test generator and run `init`; verify the registry calls it with `ProjectInfo`.
- `bun typecheck` passes.

## Risk

- **Risk:** Generators run in an unpredictable order and one overwrites another's file. → **Mitigation:** Each generator owns a distinct output path; the registry does not guarantee order, but generators must not touch each other's files (enforced by code review and tests).

---

## 3.4 Machine-Owned vs Seeded-Then-Yours File Ownership Convention

**Why:** Some files (generated context docs, catalog) should be overwritten on re-run. Others (`androidcode.json`) should be seeded once and then left to the user. Without this convention, `init` will either clobber user edits or leave stale generated files in place.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/generator.ts` | Add `ownership: "machine" | "seeded"` to the `Generator` interface. For `"machine"`, `generate` always writes. For `"seeded"`, `generate` checks if the file exists; if yes, it skips with a log message. Add `--force` flag in `InitFlags` that overrides `"seeded"` ownership. |
| `packages/opencode/src/android/generator.ts` | Add `preserveUserSection(path, marker)` helper that reads an existing file, looks for a `<!-- USER SECTION -->` (or equivalent) marker, and preserves everything after it when regenerating a `"machine"` file. |

## Verification

- Write a test generator that emits a `"machine"` file, run `init` twice, and verify the file is regenerated both times.
- Write a test generator that emits a `"seeded"` file, run `init` twice, and verify the second run skips it.
- Run `init --force` on the `"seeded"` file and verify it is overwritten.

## Risk

- **Risk:** The user-section marker convention is fragile (users might delete the marker). → **Mitigation:** Document the marker prominently in the seeded file's header comment; if the marker is missing, treat the file as user-owned and never overwrite (even with `--force` — `--force` only overrides the seeded check, not the missing-marker safety).

---

## 3.5 Wire `init` Sub-Flags to Individual Generators

**Why:** `init --skills` and `init --context` must regenerate only one artifact without re-running the full detection pass (unless the cached `ProjectInfo` is stale).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/cli/cmd/init.ts` | Map `--skills` flag to `registry.runSingle("skills-catalog", info)` and `--context` to `registry.runSingle("project-context", info)`. If the flag is absent, call `registry.runAll(info)`. |
| `packages/opencode/src/android/generator.ts` | Add `runSingle(id, info)` to the registry that looks up a generator by ID and runs only that one, respecting its ownership rules. |

## Verification

- `bun run --cwd packages/opencode src/index.ts init --skills` runs only the skills-catalog generator (or a stub registered for testing).
- `bun run --cwd packages/opencode src/index.ts init --context` runs only the project-context generator.

## Risk

- **Risk:** `runSingle` is called with stale `ProjectInfo` because the user changed `settings.gradle.kts` after the last full `init`. → **Mitigation:** `runSingle` still checks the cache mtime; if the project info is stale, it silently re-runs detection first, then the requested generator.

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- `init` on a sample Android project runs detection once and invokes all registered generators
- `init --skills` and `init --context` run only the targeted generator
- Re-run respects ownership rules (machine-owned regenerated, seeded skipped)

## Risk (phase-wide)

- **Risk:** The detection pass is too slow on large multi-module projects (e.g., 500-module monorepo). → **Mitigation:** Cap detection to the first N modules (e.g., 100) with a warning; full module graph is the responsibility of the later `module-graph` tool, not the `init` detection pass.
