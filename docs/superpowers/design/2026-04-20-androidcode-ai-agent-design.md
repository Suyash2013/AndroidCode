# AndroidCode: Android Development AI Agent — Design Specification

**Date:** 2026-04-20 (last revised 2026-06-05)  
**Author:** Suyash Shrivastava  
**Status:** Draft (Rev 4)  
**Base Framework:** OpenCode (anomalyco/opencode)  
**Team:** Solo developer (Suyash)  
**Optional external dependencies:** Google's Android CLI (`android`) and Android skills at goo.gle/android-skills — used as enhancements when present, never required.

> **Rev 4 changelog:** (1) Google's `android` CLI is now an *optional* enhancement, not the primary surface — raw `adb`/`sdkmanager`/`avdmanager`/`gradlew` are the stable base. (2) The Skill Orchestration Engine is replaced by a lighter **generated skills catalog**. (3) `init` becomes the bootstrap spine — one detection pass feeding regenerable generators (project-specific `android-core`, Project Context Document, skills catalog). (4) The Project Context Document *complements* GitNexus (it no longer claims to replace it). (5) Success metrics trimmed to honest user-outcome signals; framing softened from "definitive AI agent" to an opinionated, personal-tool-first Android distribution. (6) The delivery plan is restructured into a **medium-granularity phased backbone** (§11) where each phase is precise enough to seed a standalone implementation plan.

---

## 1. Context & Motivation

### Problem
Building Android applications at scale involves navigating complex build systems (Gradle), multi-module architectures, platform-specific APIs (lifecycle, permissions, resources), and rapidly evolving UI paradigms (Compose vs Views). Existing AI coding agents (Claude Code, Aider, Cline) are general-purpose — they lack deep Android awareness, leading to:
* Generated code that ignores lifecycle constraints
* Build suggestions that don't understand Gradle module boundaries
* No integration with Android-specific tooling (ADB, Logcat, Lint, Emulator)
* Skill/instruction overload when many skill packs are active simultaneously on a constrained context window

### Solution
**AndroidCode** — a full fork of OpenCode (anomalyco/opencode), built as an **opinionated, Android-focused distribution**. It is a personal tool first, intended to grow into a community tool. It ships with:
* Direct wrappers over the **stable, universally available Android toolchain** (`adb`, `sdkmanager`, `avdmanager`, `gradlew`), with **optional** use of Google's official `android` CLI as an enhancement where it is available and stable (see [developer.android.com/tools/agents/android-cli](https://developer.android.com/tools/agents/android-cli)).
* A curated set of Android-focused **tools** and **agents** that fill gaps general agents miss (Gradle orchestration, logcat streaming, module graph analysis, signing validation, resource management).
* An **agentskills.io-compatible** skill library so skills remain portable to Gemini, Android Studio, and other agentskills.io-compatible agents.
* A **generated skills catalog** that maps the bundled and user-added skills into categories with "when to use" hints — keeping context lean on constrained windows without a heavyweight routing engine.

### Relationship to Google's Android CLI and Skills
AndroidCode is **complementary, not competitive**, with Google's tooling, and **does not depend on it**:
* The stable base for every operation is the raw toolchain (`adb`/`sdkmanager`/`avdmanager`/`gradlew`). These are universally available and never deprecated out from under us.
* Where Google's `android` CLI is present and stable, AndroidCode **uses it as an optional optimization** for the operations it standardizes (SDK management, emulator control, app deployment, screen/layout introspection).
* Google publishes Android skills at goo.gle/android-skills against the agentskills.io standard. When available, AndroidCode can install and use these official skills alongside its own — both sets live under `.agents/skills/` and conform to the same frontmatter schema.
* AndroidCode's differentiation is in: (a) the generated skills catalog, (b) Android-specialized agents with opinionated model routing, (c) TUI/IDE UX, (d) gap-filler tools (Gradle, logcat, module-graph, etc.), and (e) deterministic Android-file intelligence that code-graph tools miss.

### Target Users
* **Open-source / community:** Android developers of all skill levels, and project managers building systems for their teams.
* Must be flexible, well-documented, and work across diverse Android projects.

### Deployment Model
* **CLI tool** as the core engine (terminal-based, like OpenCode)
* **IDE extension** (Android Studio / IntelliJ) as an optional frontend wrapping the CLI

---

## 2. Architecture Overview

### Fork Strategy
AndroidCode is a **full fork** of OpenCode, not a plugin. This is a deliberate values choice: full control over the TUI, agent loop, tool system, and default behavior, on a transparent open-source foundation. The maintenance cost is accepted and managed by pinning to stable upstream releases and rebasing on our own schedule (see §13).

| Layer | Keep from OpenCode | Customize for Android |
| :--- | :--- | :--- |
| **Core agent loop** | Client/server architecture, message handling | Android-aware context injection on every agent turn |
| **TUI** | TypeScript TUI (`cli/cmd/tui/`), session management | Android panels: device selector, build status, logcat stream |
| **Built-in tools** | `read`, `write`, `edit`, `bash`, `fetch`, `sourcegraph`, `task` | Add 9 gap-filler Android tools + 1 optional `android` CLI wrapper as first-class built-ins |
| **Agents** | Agent system (primary/subagent), permissions, model routing | Replace defaults with Android-specialized agents |
| **Skills** | `SKILL.md` system, discovery, permissions | agentskills.io-compatible; ship Android skills + a generated skills catalog |
| **Plugins** | Plugin hook system, npm distribution | Community extends via plugins; core is Android-native |
| **Model routing** | Multi-provider support (75+ via AI SDK) | Android-optimized defaults per agent type |
| **Project detection** | Basic git detection | Gradle/Android project structure detection, module discovery via `init` |
| **Configuration** | `opencode.json`, per-project and global config | `androidcode.json` with Android-specific schema |

### Tech Stack
* **Language:** TypeScript (inherited from OpenCode)
* **Runtime:** Bun
* **Async/effects:** Effect (inherited from OpenCode — all new services, tools, and state use `Context.Service`, `Layer`, `Effect.gen`, `Tool.define`)
* **TUI:** TypeScript (`packages/opencode/src/cli/cmd/tui/`), no Go/Bubble Tea dependency in this fork
* **LLM Integration:** AI SDK (75+ providers, including local models via Ollama/LM Studio — built-in, not plugin)
* **Package Distribution:** npm + Homebrew + standalone binaries
* **IDE Extension:** IntelliJ Platform SDK (Kotlin) wrapping the CLI
* **External dependencies:** Raw Android toolchain (`adb`/`sdkmanager`/`avdmanager`/`gradlew`) as the base; Google's `android` CLI wrapped as an *optional* optimization.
* **CLI API:** HTTP + WebSocket. LSP-compatible JSON-RPC 2.0 framing is a later concern when the IDE extension lands — not the first phase.

### Architecture Risks & Mitigations
| Risk | Mitigation |
| :--- | :--- |
| **Google's `android` CLI is unavailable, incomplete, or deprecated** | Low impact by design: the raw toolchain is the base, and the `android` CLI is only an optional enhancement layered on top. A session-start probe records which operations can use it; `/android status` exposes wrapped-vs-raw. Nothing breaks if it disappears. |
| **Bun runtime compatibility** with OpenCode's dependency tree | Phase 0 deliverable: run OpenCode's full test suite on Bun, document any failing modules in `bun-compat.md`. Fallback: Node.js compatibility mode for problematic modules. |
| **agentskills.io schema drift** — the open standard evolves and breaks bundled skills | Pin to a specific agentskills.io revision in `androidcode.json`. Validate bundled skills against that revision in CI. Update the revision intentionally, with a changelog. |

---

## 3. Skills Catalog

Rather than loading every installed skill's full body into context (which bloats constrained windows and degrades reasoning), AndroidCode keeps an always-on **catalog** — a lightweight, generated index of the skills available, grouped by category, with a one-line "when to use" hint per skill. The agent reads the map, then loads a skill's full body **on demand** (progressive disclosure). This covers both AndroidCode's bundled skills and any the user adds.

This replaces the heavyweight per-message scoring/re-routing engine of earlier revisions. There are no scoring weights, no LLM classifier, and no mid-conversation skill swapping — the catalog is a stable map, and the agent decides.

### Catalog structure
Skills are grouped by `category`:

| Category | Loads before | Examples |
| :--- | :--- | :--- |
| `process` | implementation | `android-brainstorm`, `android-debug-workflow`, `android-migration` |
| `implementation` | — | `android-compose`, `android-architecture`, `android-di` |
| `analysis` | — | `android-performance`, `android-security`, `android-accessibility` |
| `tooling` | — | `android-gradle`, `android-testing`, `android-ci` |

Each catalog entry is derived from the skill's frontmatter and is cheap (~one line):
* `name` — the skill identifier.
* `description` — one line, from frontmatter.
* `when_to_use` — a short trigger hint ("reach for this when…"), from frontmatter.
* `category` — for grouping and load order.

### Generation, not hand-maintenance
The catalog is **generated by `init`** (see §6) from the frontmatter of all discovered skills — bundled and user-added. Adding or removing a skill and re-running `init --skills` regenerates the catalog, so it never rots. It is a machine-owned artifact.

### Skill frontmatter (agentskills.io-compatible)
* `name`: lowercase letters, numbers, hyphens only; ≤64 characters
* `description`: ≤1024 characters
* `category`: one of `process`, `implementation`, `analysis`, `tooling`
* `when_to_use`: short trigger hint (AndroidCode extension; ignored by agents that don't understand it)
* Skill body: recommended 10k–20k characters (~2,500–5,000 tokens), loaded on demand

Skills from external sources without a `category`/`when_to_use` still appear in the catalog under an "uncategorized" group using `name` + `description` only.

### Always-on context
Only two things are always in context:
| Item | Purpose | Budget |
| :--- | :--- | :--- |
| **Skills catalog** | The map of available skills + when to use each | ~one line per skill |
| **`android-core`** | Project-specific Android context, generated by `init` (see §6) | small; project facts only |

`android-core` is no longer a generic "Android 101" skill; it is generated per project. There is no separate `skill-router` bootstrap skill — the catalog is the routing surface.

---

## 4. Android-Specific Tools

Ten first-class built-in tools: nine gap-filler tools over the stable raw toolchain, plus one optional `android` CLI wrapper.

**Tool Error Handling Strategy:**
All Android tools return structured responses (`ToolResult` with status, data, and detailed error codes like `NO_DEVICE` or `BUILD_FAILED`) that the agent can reason about to suggest fixes or auto-recover.

* **4.0 `android` (optional CLI wrapper):** Uses Google's official Android CLI when present and stable. (Wrap policy: `raw-base / android-optional` — raw equivalents are always the fallback.)
* **4.1 `gradle` (gap-filler):** Run Gradle tasks with intelligent output parsing. (Wrap policy: `raw-only`)
* **4.2 `logcat` (gap-filler):** Stream and filter Android logs with PID tracking. (Wrap policy: `raw-only`)
* **4.3 `lint` (gap-filler):** Run Android Lint and parse results. (Wrap policy: `raw-only`)
* **4.4 `manifest` (gap-filler):** Parse and modify `AndroidManifest.xml`. (Wrap policy: `raw-only`)
* **4.5 `resources` (gap-filler):** Navigate and modify Android resources. (Wrap policy: `raw-only`)
* **4.6 `module-graph` (gap-filler):** Analyze Gradle module dependencies and structure. (Wrap policy: `raw-only`)
* **4.7 `apk-analyzer` (gap-filler):** Inspect APK contents. (Wrap policy: `raw-only`)
* **4.8 `signing` (gap-filler):** Manage Android app signing configurations. Security rule: Never logs or outputs keystore passwords. (Wrap policy: `raw-only`)
* **4.9 `dependency-catalog` (gap-filler):** Query and manage Gradle Version Catalogs (`libs.versions.toml`). (Wrap policy: `raw-only`)

*(Deferred: `compose-preview` deferred to post-launch. `adb` and `emulator` operations are absorbed into other tools and the optional `android` wrapper.)*

---

## 5. Pre-Configured Agents

### 5.1 Primary Agents
* **`android-build` (Default):** Full development (write features, fix bugs, refactor). Model default: Sonnet-class.
* **`android-plan`:** Architecture planning, design reviews, no code modifications. Model default: Opus-class.

### 5.2 Subagents
* **`android-debug`:** Debugging specialist. Model default: Sonnet-class.
* **`android-review`:** Code review with Android best practices. Model default: Opus-class.
* **`android-explore`:** Fast codebase navigation and search. Model default: Haiku-class.
* **`android-kmp`:** Kotlin Multiplatform specialist. Model default: Sonnet-class.

### 5.3 Model Routing Defaults
All model assignments are user-configurable via `androidcode.json`.

---

## 6. Project Intelligence — the `init` Pipeline

`init` is the bootstrap spine of AndroidCode. It runs **one project-detection pass** and feeds the result into a set of **independent, regenerable generators**. Each generated artifact has its own staleness trigger, so they can be regenerated individually without rebuilding everything.

### The single detection pass
On `init`, AndroidCode detects the project type, maps the module graph, reads the build config, parses version catalogs, detects convention plugins, enumerates components, and detects KMP/architecture setups. Where Google's `android describe` is available, it is used as an optional accelerator; otherwise detection uses the raw toolchain and the gap-filler tools directly.

### Generators and their artifacts
| Artifact | Generated from | Ownership | Goes stale when… |
| :--- | :--- | :--- | :--- |
| **`android-core`** (project-specific) | module-graph + version catalog + Gradle config | machine-owned facts + preserved user section | a module is added/renamed, SDK/AGP bumped |
| **Project Context Document** | manifest + resources + module-graph + version-catalog tools | machine-owned | project structure changes |
| **Skills catalog** | frontmatter of bundled + user skills | machine-owned | a skill is added/removed |
| **`androidcode.json`** | detected models, SDK path, CLI probe | seeded-then-yours (never overwritten) | rarely — user-owned after creation |
| **CLI wrap/fallback status** | `android` CLI probe | machine-owned | environment changes |

### Sub-steps (independent regeneration)
* `init` — full bootstrap: one detection pass, all generators.
* `init --context` — re-derive only the Project Context Document.
* `init --skills` — regenerate only the skills catalog.

### Fast-sync vs slow-async
Cheap, deterministic parsing (Gradle config, `AndroidManifest.xml`, `libs.versions.toml`, module graph) runs synchronously so the agent has structural facts immediately. Any slow semantic indexing (Kotlin/Java code graph) is kicked off asynchronously and enriches context when ready.

### Relationship to GitNexus (complement, not replace)
The Project Context Document is the **assembled output of AndroidCode's deterministic Android tools** — it covers the XML/resource/NDK/Gradle territory that code-graph tools (GitNexus, omni-rag) handle poorly or not at all. It does **not** replace GitNexus: the Kotlin/Java semantic graph (callers, callees, impact, execution flows) is delegated to GitNexus when present, or to omni-rag when it matures. AndroidCode complements code intelligence on the Android-file side; it does not reimplement it.

---

## 7. Shipped Skills (Out of the Box)

AndroidCode ships Android skills across four categories, living under `.agents/skills/`. The **skills catalog** (§3) is generated from these skills' frontmatter. `android-core` is no longer a static shipped skill — it is generated per project by `init` (§6). When Google's official skills are available, AndroidCode can install and surface them in the catalog alongside these.

* **7.1 Process Skills:** `android-brainstorm`, `android-debug-workflow`, `android-migration`.
* **7.2 Implementation Skills:** `android-compose`, `android-views`, `android-navigation`, `android-networking`, `android-database`, `android-di`, `android-architecture`, `android-permissions`, `android-kmp`, `android-deeplinks`, `android-widgets`, `android-modularization`, `android-workmanager`.
* **7.3 Analysis Skills:** `android-performance`, `android-security`, `android-accessibility`.
* **7.4 Tooling Skills:** `android-gradle`, `android-testing`, `android-ci`, `android-release`, `android-proguard`.

> **Content quality bar (applies to every shipped skill):** Every sentence must either be something the model would not deduce on its own, or a concrete code pattern to follow. No "Android 101", no vague guidance ("prefer build.gradle.kts"). Implementation skills must include real Kotlin snippets (e.g. `android-architecture`: ViewModel skeleton + sealed `UiState` + composable wiring; `android-kmp`: an `expect`/`actual` pair + shared `build.gradle.kts`).

---

## 8. Plugin System (Community Extensions)

The plugin system is inherited from OpenCode and allows the community to extend AndroidCode without forking. Plugins are distributed via npm under the `@androidcode` scoped package.

Plugins can add:
* Custom tools (e.g., Firebase integration)
* Event hooks (e.g., auto-run lint before commit)
* Environment injection
* Session hooks
* Custom compaction

---

## 9. IDE Extension (Android Studio / IntelliJ)

The IDE extension is a **thin client** that wraps the AndroidCode CLI. Features include a tool window panel, inline code actions, gutter annotations, and build/logcat integration.

The CLI's HTTP/WebSocket API should adopt **LSP-compatible message framing** when the IDE extension work begins, to support this integration seamlessly.

---

## 10. Configuration

`androidcode.json` (Project Root) supports specifying models for agents, overriding catalog behavior, defining SDK paths, pinning the agentskills.io revision, and managing permissions. For CI/CD and scripting, all key config values can be overridden via environment variables (e.g., `ANDROIDCODE_MODEL`, `ANDROIDCODE_SDK_PATH`). It is seeded by `init` and then user-owned (never overwritten on re-run).

---

## 11. Phased Delivery

This is the delivery backbone. Each phase is a **cohesive, self-contained deliverable** sized so that a single, precise implementation plan can be generated from it. Phases are ordered by dependency (forward-only). There is no hard cap on phase count — phases may be added or split as the design evolves; the numbering below is the current shape, not a contract.

Every phase block follows the same template: **Goal · Deliverables · Design detail · Depends on · Acceptance** — and is delivered via the Per-Phase Development Workflow below.

### Per-Phase Development Workflow

The project is built one phase at a time, in isolation. Each phase is its own branch and its own PR, and a phase is not "done" until that PR is compliant, green, and merged.

1. **Branch per phase, off the latest `dev`.** Sync first (`git fetch origin && git switch dev && git pull`), then cut `phase<N>/<slug>` (e.g. `phase3/init-pipeline`). Starting from current `dev` means the phase is built and validated against the latest CI/compliance config. One phase = one branch = one PR. Use this form consistently (not older variants like `phase-5-ide`).
2. **Conventional commits.** Every commit message and the PR title use conventional-commit format `<type>(<scope>): <subject>`, where `<type>` ∈ {`feat`, `fix`, `docs`, `chore`, `refactor`, `test`} and `<scope>` is optional (e.g. `feat(opencode):`). AI-assisted commits keep the `Co-Authored-By:` footer.
3. **Compliance gate — must pass before the phase's final commit / PR merge.** Enforced by `.github/workflows/pr-standards.yml`:
   * **PR title** matches `^(feat|fix|docs|chore|refactor|test)\s*(\([a-zA-Z0-9-]+\))?\s*:` .
   * **PR template** filled with real content — all five sections present: *Issue for this PR*, *Type of change* (≥1 box checked), *What does this PR do?* (genuine description, not a placeholder or AI wall-of-text), *How did you verify your code works?* (non-empty), *Checklist* (≥2 boxes checked).
   * **Linked issue** via `Fixes #<n>` / `Closes #<n>` — automatically skipped for `docs`/`refactor`/`feat` PRs.
   And CI must be green:
   * `bun turbo test:ci` — unit tests (Linux + Windows).
   * `bun typecheck` — TypeScript.
   * `bun run test:httpapi` (in `packages/opencode`) — HttpApi gates (Linux), where applicable.
   Non-compliant PRs are auto-closed ~2 hours after the bot flags them, so confirm compliance before opening/finalizing.
4. **Phase done = a compliant, green PR merged to `dev`.** This is the standing definition behind every phase's **Acceptance** field below — a phase's acceptance criteria are only met once its PR clears the compliance gate and CI and is merged.

Each phase's detailed implementation plan lives at `docs/superpowers/plans/phase-<N>-<slug>.md`, written from the template at `docs/superpowers/plans/_phase-plan-template.md` (which carries this workflow as a required checklist).

### Phase 0 — Fork & Project Setup
* **Goal:** Stand up the AndroidCode fork with build, CI, and distribution scaffolding.
* **Deliverables:** Forked repo rebranded (opencode → androidcode); `@androidcode` npm scope; CI pipeline (lint/test/build) on Bun; `bun-compat.md` documenting any failing upstream modules; `UPSTREAM_SYNC.md` with the pin-and-rebase policy.
* **Design detail:** §2 Fork Strategy; §13 upstream sync.
* **Depends on:** —
* **Acceptance:** Inherited test suite runs on Bun; CI green; standalone binary builds; brand strings replaced.

### Phase 1 — Structured Tool-Result Error Model
* **Goal:** Define the shared structured result contract every Android tool returns.
* **Deliverables:** `ToolResult` type (status, data, error code/message); error-code enum (`NO_DEVICE`, `BUILD_FAILED`, `SDK_MISSING`, …); a helper for tools to emit structured results.
* **Design detail:** §4 Tool Error Handling Strategy.
* **Depends on:** Phase 0.
* **Acceptance:** A sample tool returns structured success and error; an agent can branch on `error.code`.

### Phase 2 — Android CLI Probe + Wrapper Policy
* **Goal:** Detect Google's `android` CLI and establish the raw-base / CLI-optional wrapping model.
* **Deliverables:** Session-start probe detecting `android` + its available subcommands and platform caveats (e.g. Windows emulator); per-tool wrap policy that resolves to raw tools by default and uses `android` only as an optional enhancement; `/android status` surface listing wrapped-vs-raw.
* **Design detail:** §2 risk table; §4 wrap policies.
* **Depends on:** Phase 1.
* **Acceptance:** On a machine without `android`, the probe reports unavailable and all tools use raw paths; `/android status` accurately lists each tool's mode.

### Phase 3 — `init` Detection Pass + Pipeline Scaffolding
* **Goal:** One project-detection pass that drives independent, regenerable generators.
* **Deliverables:** `init` command; the shared detection pass (Gradle/Android structure, modules, KMP, version catalogs, convention plugins); a generator registry with `init`, `init --skills`, `init --context` sub-steps; the machine-owned vs seeded-then-yours file-ownership convention.
* **Design detail:** §6.
* **Depends on:** Phase 2.
* **Acceptance:** `init` on a sample project runs detection once and invokes registered generators; sub-flags run individual generators; re-run respects ownership rules (seeded files untouched, machine-owned files regenerated).

### Phase 4 — Gap-Filler Tools, Batch 1 (build & logs)
* **Goal:** Ship the core build/diagnostics tools.
* **Deliverables:** `gradle`, `logcat`, `lint` tools, each returning the `ToolResult` contract.
* **Design detail:** §4.1–4.3.
* **Depends on:** Phase 1.
* **Acceptance:** Each tool runs against a sample project, parses output, and returns structured success/error.

### Phase 5 — Gap-Filler Tools, Batch 2 (project structure)
* **Goal:** Ship the deterministic Android-file parsers that power project intelligence.
* **Deliverables:** `manifest`, `resources`, `module-graph` tools.
* **Design detail:** §4.4–4.6.
* **Depends on:** Phase 1.
* **Acceptance:** Each tool parses a sample project's manifest/resources/module graph and returns structured data consumable by the Project Context generator.

### Phase 6 — Gap-Filler Tools, Batch 3 (artifacts & dependencies)
* **Goal:** Ship the remaining gap-filler tools.
* **Deliverables:** `apk-analyzer`, `signing` (with the no-password-leak rule), `dependency-catalog`.
* **Design detail:** §4.7–4.9.
* **Depends on:** Phase 1.
* **Acceptance:** Each tool runs against a sample project; `signing` never emits keystore passwords in output or logs (verified by a test).

### Phase 7 — Project Context Document Generator
* **Goal:** Assemble Android structural facts into an injectable context document.
* **Deliverables:** A generator (registered with `init`/`init --context`) that assembles `manifest` + `resources` + `module-graph` + `dependency-catalog` outputs into the Project Context Document; the GitNexus-complement boundary (Kotlin/Java semantic graph delegated, not reimplemented); the per-turn injection hook.
* **Design detail:** §6.
* **Depends on:** Phases 3, 5, 6.
* **Acceptance:** `init --context` produces a context doc for a sample project containing module graph + manifest + resource + version-catalog facts; the doc is injected into an agent session.

### Phase 8 — `init`-Generated `android-core`
* **Goal:** Replace the static `android-core` skill with a generated, project-specific one.
* **Deliverables:** A generator (registered with `init`) that emits a small `android-core` containing only project facts the model can't deduce (module names + graph, target/min SDK, AGP/Kotlin/Compose versions, convention plugins, project-specific rules), with a clearly marked user section preserved across regenerations.
* **Design detail:** §3 always-on context; §6.
* **Depends on:** Phases 3, 5, 6.
* **Acceptance:** `init` generates `android-core` from a sample project; re-running preserves the user section; no generic Android-101 content present.

### Phase 9 — Skills Catalog Generator
* **Goal:** Generate the always-on catalog from skill frontmatter.
* **Deliverables:** A generator (registered with `init`/`init --skills`) that scans bundled + user skills, groups by `category`, and emits the catalog (name + description + `when_to_use` per entry); progressive-disclosure loading of full bodies on demand; an "uncategorized" group for external skills lacking metadata.
* **Design detail:** §3.
* **Depends on:** Phase 3.
* **Acceptance:** `init --skills` produces a catalog reflecting installed skills; adding a skill and re-running updates it; the agent can load a skill body on demand from a catalog reference.

### Phase 10 — Primary Agents + Model Routing
* **Goal:** Ship the default Android agents and routing defaults.
* **Deliverables:** `android-build` (default) and `android-plan` agents; per-agent model defaults; user override via `androidcode.json`.
* **Design detail:** §5.1, §5.3.
* **Depends on:** Phases 1, 3.
* **Acceptance:** Both agents are selectable and operate with their default models; overriding a model in config takes effect.

### Phase 11 — Subagents
* **Goal:** Ship the specialized subagents.
* **Deliverables:** `android-debug`, `android-review`, `android-explore` subagents with model defaults.
* **Design detail:** §5.2.
* **Depends on:** Phase 10.
* **Acceptance:** Each subagent can be dispatched and returns results consistent with its specialization.

### Phase 12 — Shipped Skills: Implementation Set
* **Goal:** Author the code-rich implementation skills.
* **Deliverables:** The §7.2 implementation skills, each meeting the content-quality bar (real Kotlin snippets, no vague guidance).
* **Design detail:** §7 content quality bar.
* **Depends on:** Phase 9.
* **Acceptance:** Each skill validates against the pinned agentskills.io revision, appears in the catalog, and contains concrete code patterns (spot-checked).

### Phase 13 — Shipped Skills: Process / Analysis / Tooling Sets
* **Goal:** Author the remaining shipped skills.
* **Deliverables:** The §7.1, §7.3, §7.4 skills, meeting the content-quality bar (process skills include concrete checklists/constraints).
* **Design detail:** §7.
* **Depends on:** Phase 9.
* **Acceptance:** Each skill validates and appears in the catalog under the correct category.

### Phase 14 — KMP Support
* **Goal:** First-class Kotlin Multiplatform support.
* **Deliverables:** `android-kmp` subagent and `android-kmp` skill (expect/actual pair, shared `build.gradle.kts`, commonMain wiring); KMP detection in the `init` pass.
* **Design detail:** §5.2, §7.2, §13.
* **Depends on:** Phases 11, 12, 13.
* **Acceptance:** On a KMP sample, `init` detects the setup and the agent/skill produce valid expect/actual wiring.

### Phase 15 — Configuration
* **Goal:** Finalize the `androidcode.json` schema and env overrides.
* **Deliverables:** Full schema (models, catalog options, SDK paths, agentskills.io revision pin, permissions); env-var overrides (`ANDROIDCODE_MODEL`, `ANDROIDCODE_SDK_PATH`, …); seed-if-absent behavior in `init`.
* **Design detail:** §10.
* **Depends on:** Phases 2, 10.
* **Acceptance:** A project with `androidcode.json` honors its settings; env vars override; `init` seeds the file once and never overwrites it.

### Phase 16 — Plugin System Validation + Registry
* **Goal:** Validate community extensibility.
* **Deliverables:** Verified plugin hooks for custom tools/agents/skills; `@androidcode` distribution; registry design.
* **Design detail:** §8.
* **Depends on:** Phase 10.
* **Acceptance:** A sample external plugin adds a tool and a skill (which appears in the catalog) without forking.

### Phase 17 — Opt-In Telemetry
* **Goal:** Transparent, opt-in usage signal.
* **Deliverables:** Opt-in telemetry that never collects code content, file paths, or model prompts; clear disclosure.
* **Design detail:** §13.
* **Depends on:** Phase 0.
* **Acceptance:** Telemetry is off by default; when enabled, payloads provably exclude code/paths/prompts (verified by a test).

### Phase 18 — IDE Extension
* **Goal:** Ship the IntelliJ/Android Studio thin client.
* **Deliverables:** IntelliJ Platform SDK plugin scaffold; tool window; inline actions; build/logcat integration; LSP-compatible CLI framing.
* **Design detail:** §9.
* **Depends on:** Phases 10, 15.
* **Acceptance:** The extension connects to the CLI, shows the tool window, and surfaces build/logcat output.

---

## 12. Key Design Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **Fork vs Plugin** | Full fork | Complete, transparent control over TUI, agent loop, tools, and default experience; maintenance managed via pinned upstream + scheduled rebase |
| **Google's `android` CLI** | Raw base, CLI optional | Stable raw toolchain is the foundation; `android` CLI is an optional optimization, so nothing breaks if it's absent or deprecated |
| **Skill frontmatter** | agentskills.io-compatible + `category`/`when_to_use` | Portable to Gemini, Android Studio, any agentskills.io-compatible agent |
| **Skill discovery** | `.agents/skills/` (external dir scanned by `skill/index.ts`) | Matches agentskills.io standard |
| **Skill activation** | Generated catalog + on-demand bodies | Keeps context lean on constrained windows without a heavyweight routing engine |
| **`init`** | Bootstrap spine: one detection pass → regenerable generators | Single source of project truth; each artifact regenerates on its own staleness trigger |
| **Code intelligence** | Deterministic Android parsers + GitNexus for Kotlin | Cover the XML/resource/NDK/Gradle gap; delegate the semantic graph rather than reimplement it |

---

## 13. Resolved Questions

* **Upstream sync strategy:** Pin to stable OpenCode releases; rebase on our own schedule (≈quarterly) with a "never merge" list for Android-specific modules. Documented in `UPSTREAM_SYNC.md`.
* **Offline support:** Built-in via AI SDK (Ollama/LM Studio). Configuration-only.
* **KMP support:** Dedicated `android-kmp` agent and skill (Phase 14). Google has officially endorsed KMP; it is not optional.
* **Telemetry:** Opt-in only with full transparency. Never collect code content, file paths, or model prompts.
* **Monetization:** Business decision deferred. Architecture is neutral. Initial launch is purely open-source.

---

## 14. Success Metrics

AndroidCode is a personal tool first; metrics are honest user-outcome signals, not vanity numbers. Only ship-faster matters:

* **Time to first successful build:** Median time from project open to a green build on a task, with vs without AndroidCode.
* **Time to fix a crash:** Median time from a logcat crash to a passing fix.
* **Beta-user NPS:** Qualitative signal from early users — would they keep using it?

Everything else (stars, internal router accuracy, compliance percentages) is explicitly out of scope as a success measure.
