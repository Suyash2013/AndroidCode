# AndroidCode: Android Development AI Agent — Design Specification

**Date:** 2026-04-20 (last revised 2026-04-21)  
**Author:** Suyash Shrivastava  
**Status:** Draft (Rev 3 — pivots to wrap Google's official Android CLI and conform to the agentskills.io open standard)  
**Base Framework:** OpenCode (anomalyco/opencode)  
**Team:** Solo developer (Suyash)  
**External dependencies:** Google's Android CLI (android), Android skills at goo.gle/android-skills  

---

## 1. Context & Motivation

### Problem
Building Android applications at scale involves navigating complex build systems (Gradle), multi-module architectures, platform-specific APIs (lifecycle, permissions, resources), and rapidly evolving UI paradigms (Compose vs Views). Existing AI coding agents (Claude Code, Aider, Cline) are general-purpose — they lack deep Android awareness, leading to:
* Generated code that ignores lifecycle constraints
* Build suggestions that don't understand Gradle module boundaries
* No integration with Android-specific tooling (ADB, Logcat, Lint, Emulator)
* Skill/instruction overload when multiple plugins are active simultaneously

### Solution
**AndroidCode** — a full fork of OpenCode (anomalyco/opencode) purpose-built as the definitive open-source AI agent for Android development. It ships with:
* A thin wrapper over **Google's official Android CLI** (the `android` command — see [developer.android.com/tools/agents/android-cli](https://developer.android.com/tools/agents/android-cli)) with graceful fallbacks where the official CLI is unavailable or incomplete (e.g., Windows emulator support).
* A curated set of Android-focused **tools** and **agents** that fill gaps the official CLI doesn't cover (Gradle orchestration, logcat streaming, module graph analysis, signing validation, resource management).
* An **agentskills.io-compliant** skill library that layers AndroidCode-specific orchestration metadata onto the official standard so skills remain portable to Gemini, Android Studio, and any other agentskills.io-compatible agent.
* A novel **Skill Orchestration Engine** that solves the multi-skill conflict problem present in all current agent frameworks.

### Relationship to Google's Android CLI and Skills
AndroidCode is **complementary, not competitive**, with Google's tooling:
* Google ships the `android` CLI, which is agent-agnostic and standardizes SDK management, emulator control, app deployment, and screen/layout introspection. AndroidCode **uses `android` as its primary surface** for those operations.
* Google publishes Android skills at goo.gle/android-skills against the agentskills.io open standard. AndroidCode **installs and uses these official skills** alongside its own bundled skills — both sets live under `.agent/skills/` (the agentskills.io-standard location) and conform to the same frontmatter schema.
* AndroidCode's differentiation is in: (a) the Skill Orchestration Engine, (b) Android-specialized agents with opinionated model routing, (c) TUI/IDE UX, (d) gap-filler tools (Gradle, logcat, module-graph, etc.), and (e) wrap-with-fallback resilience for environments where the `android` CLI is unavailable or incomplete.

### Target Users
* **Open-source / community:** Android developers of all skill levels
* Must be flexible, well-documented, and work across diverse Android projects

### Deployment Model
* **CLI tool** as the core engine (terminal-based, like OpenCode)
* **IDE extension** (Android Studio / IntelliJ) as an optional frontend wrapping the CLI

---

## 2. Architecture Overview

### Fork Strategy
AndroidCode is a **full fork** of OpenCode, not a plugin. This gives complete control over the TUI, agent loop, tool system, and default behavior.

| Layer | Keep from OpenCode | Customize for Android |
| :--- | :--- | :--- |
| **Core agent loop** | Client/server architecture, message handling | Android-aware context injection on every agent turn |
| **TUI** | TypeScript TUI (`cli/cmd/tui/`), session management | Android panels: device selector, build status, logcat stream |
| **Built-in tools** | `read`, `write`, `edit`, `bash`, `fetch`, `sourcegraph`, `task` | Add 1 `android` CLI wrapper + 8 gap-filler Android tools as first-class built-ins |
| **Agents** | Agent system (primary/subagent), permissions, model routing | Replace defaults with Android-specialized agents |
| **Skills** | `SKILL.md` system, discovery, permissions | Adopt agentskills.io standard; ship 23 Android skills + Skill Orchestration Engine; auto-install Google's official skills |
| **Plugins** | Plugin hook system, npm distribution | Community extends via plugins; core is Android-native |
| **Model routing** | Multi-provider support (75+ via AI SDK) | Android-optimized defaults per agent type |
| **Project detection** | Basic git detection | Gradle/Android project structure detection, module discovery, `android describe` integration |
| **Configuration** | `opencode.json`, per-project and global config | `androidcode.json` with Android-specific schema |

### Tech Stack
* **Language:** TypeScript (inherited from OpenCode)
* **Runtime:** Bun
* **Async/effects:** Effect (inherited from OpenCode — all new services, tools, and state use `Context.Service`, `Layer`, `Effect.gen`, `Tool.define`)
* **TUI:** TypeScript (`packages/opencode/src/cli/cmd/tui/`), no Go/Bubble Tea dependency in this fork
* **LLM Integration:** AI SDK (75+ providers, including local models via Ollama/LM Studio — built-in, not plugin)
* **Package Distribution:** npm + Homebrew + standalone binaries
* **IDE Extension:** IntelliJ Platform SDK (Kotlin) wrapping the CLI
* **External dependencies:** Google's `android` CLI (wrapped, with fallbacks to raw `adb`/`sdkmanager`/`avdmanager` where unavailable)
* **CLI API:** HTTP + WebSocket. LSP-compatible JSON-RPC 2.0 framing is a Phase 5 concern when the IDE extension lands — not Phase 1.

### Architecture Risks & Mitigations
| Risk | Mitigation |
| :--- | :--- |
| **`android` CLI unavailable or incomplete on user's platform** (e.g., `android emulator` is disabled on Windows as of 2026-04) | Wrap-with-fallback per tool: each Android tool prefers `android <subcommand>` when available and falls back to raw `adb`/`sdkmanager`/`avdmanager`. Detection runs on session start; `/android status` exposes which tools are wrapped vs. falling back. |
| **Bun runtime compatibility** with OpenCode's dependency tree | Phase 1 deliverable: run OpenCode's full test suite on Bun, document any failing modules in `bun-compat.md`. Fallback: Node.js compatibility mode for problematic modules. |
| **agentskills.io schema drift** — the open standard evolves and breaks our bundled skills | Pin to a specific agentskills.io revision in `androidcode.json`. Validate bundled skills against that revision in CI. Update revision intentionally, with changelog. |

---

## 3. Skill Orchestration Engine

This is the **key architectural innovation** — solving the multi-skill intermingling problem.

### The Problem
In current agent frameworks (Claude Code, OpenCode), when multiple skill packs are installed (Android, GitNexus, Superpowers, frontend-design), all skill instructions are loaded into the agent's context simultaneously. This causes:
* Conflicting instructions between skills
* Agent confusion about which workflow to follow
* Context window bloat reducing reasoning quality
* Unpredictable behavior when skill instructions overlap

### Solution: 3-Layer Skill Activation

#### Layer 1: Skill Classification & Metadata
AndroidCode skills conform to the **agentskills.io open standard** so they remain portable to Gemini, Android Studio, and any other agentskills.io-compatible agent. AndroidCode-specific orchestration hints live under `metadata.orchestration` — a nested object that the standard permits but does not require. Agents that ignore `metadata.orchestration` will still correctly render and use the skill; AndroidCode's router uses it for intelligent activation.

**Standard-conformant frontmatter constraints:**
* `name`: lowercase letters, numbers, hyphens only; ≤64 characters
* `description`: ≤1024 characters
* Skill body: recommended 10k–20k characters (~2,500–5,000 tokens)

**`metadata.orchestration` fields:**
| Field | Type | Purpose |
| :--- | :--- | :--- |
| `category` | enum: process, implementation, analysis, tooling | Determines loading order — process skills load before implementation |
| `triggers.file_patterns` | `glob[]` | Activate when these file types are being edited |
| `triggers.content_patterns` | `string[]` | Activate when these patterns appear in file content or user message |
| `triggers.task_types` | `string[]` | Activate for these task categories (code-generation, debugging, refactoring, review, planning) |
| `triggers.tools_in_use` | `string[]` | Activate when these tools are being called |
| `priority` | 0-100 | Higher priority wins on conflict |
| `conflicts_with` | `string[]` | Mutually exclusive skills |
| `depends_on` | `string[]` | Always co-load these skills |
| `scope` | file, module, project, session | How broadly this skill applies |

**Degraded mode:** Skills without `metadata.orchestration` (e.g., Google's official skills from goo.gle/android-skills) still participate in routing — the router falls back to scoring against `name` + `description` only. This is less precise but keeps ecosystem skills usable.

#### Layer 2: Contextual Skill Router
A middleware layer between user input and the agent.

**Scoring algorithm:**
* Each trigger match adds points (`file_pattern`: +30, `content_pattern`: +25, `task_type`: +20, `tools_in_use`: +15)
* Skills without `metadata.orchestration` score only against description keyword matches at +15 per match, capped at +45
* `depends_on` skills get a bonus (+10) if their dependent is already selected
* `conflicts_with` triggers elimination of the lower-priority skill
* **Tiebreaking:** Higher `priority` wins -> Breadth of relevance wins -> Narrower `scope` wins -> Alphabetical order.
* **Minimum score floor:** Skills scoring below 20 are never injected, even if a slot is free.

**Task Analyzer — Implementation Detail:**
Hybrid keyword + lightweight LLM classification.
* **Stage 1 (Keyword Classifier):** Fast, zero-cost, runs on every message. Matches keywords to task types.
* **Stage 2 (LLM Classification):** Only runs when Stage 1 confidence < 0.7. Sends a minimal prompt (~100 tokens) to the cheapest configured model.
* **Stage 3 (File Context Enrichment):** Always runs. Extracts patterns from open/recently edited files.

**Mid-Conversation Skill Re-Routing:**
Skills are NOT locked in for the entire conversation. The router re-evaluates on **every user message**.
* If the new task signal differs from the previous turn's signal, the router re-scores all skills.
* If the top-N skill set changes, the Context Injector swaps skills in the system prompt for the next agent turn.

**User Skill Override Mechanism:**
Users can inspect and override skill routing at any time using TUI commands (`/skills`, `/skills add <name>`, `/skills remove <name>`, `/skills reset`) or via the TUI panel. Overrides persist for the current session only.

**Skill Versioning:**
Skills use semantic versioning declared in frontmatter. Local skills (`.androidcode/skills/`) always take precedence. Version conflicts log a warning, and breaking changes alert the user.

#### Layer 3: Skill Composition Rules
Global configuration for skill interactions dictates priority order, conflict resolution, and user override capabilities.

**Bootstrap Skills (Always-Loaded):**
| Skill | Purpose | Token Budget |
| :--- | :--- | :--- |
| `skill-router` | Teaches the agent how the skill system works | ~200 tokens |
| `android-core` | Minimal always-on Android awareness | ~300 tokens |
| `skill-guide` | Explains how to create skills | ~200 tokens |

---

## 4. Android-Specific Tools

Nine first-class built-in tools. One `android` wrapper over Google's official CLI, plus eight gap-filler tools.

**Tool Error Handling Strategy:**
All Android tools return structured responses (`ToolResult` with status, data, and detailed error codes like `NO_DEVICE` or `BUILD_FAILED`) that the agent can reason about to suggest fixes or auto-recover.

* **4.0 `android` (CLI wrapper):** First-class wrapper around Google's official Android CLI. (Wrap policy: `android-cli-preferred`)
* **4.1 `gradle` (gap-filler):** Run Gradle tasks with intelligent output parsing. (Wrap policy: `raw-only`)
* **4.2 `logcat` (gap-filler):** Stream and filter Android logs with PID tracking. (Wrap policy: `raw-only`)
* **4.3 `lint` (gap-filler):** Run Android Lint and parse results. (Wrap policy: `raw-only`)
* **4.4 `manifest` (gap-filler):** Parse and modify `AndroidManifest.xml`. (Wrap policy: `raw-only`)
* **4.5 `resources` (gap-filler):** Navigate and modify Android resources. (Wrap policy: `raw-only`)
* **4.6 `module-graph` (gap-filler):** Analyze Gradle module dependencies and structure. (Wrap policy: `raw-only`)
* **4.7 `apk-analyzer` (gap-filler):** Inspect APK contents. (Wrap policy: `raw-only`)
* **4.8 `signing` (gap-filler):** Manage Android app signing configurations. Security rule: Never logs or outputs keystore passwords. (Wrap policy: `raw-only`)
* **4.9 `dependency-catalog` (gap-filler):** Query and manage Gradle Version Catalogs (`libs.versions.toml`). (Wrap policy: `raw-only`)

*(Deferred: `compose-preview` deferred to post-launch. `adb` and `emulator` absorbed into other tools.)*

---

## 5. Pre-Configured Agents

### 5.1 Primary Agents
* **`android-build` (Default):** Full development (write features, fix bugs, refactor). Model default: Sonnet-class.
* **`android-plan`:** Architecture planning, design reviews, no code modifications. Model default: Opus-class.

### 5.2 Subagents
* **`android-debug`:** Debugging specialist. Model default: Sonnet-class.
* **`android-review`:** Code review with Android best practices. Model default: Opus-class.
* **`android-explore`:** Fast codebase navigation and search. Model default: Haiku-class.
* **`android-kmp`:** Kotlin Multiplatform specialist. Model default: Sonnet-class. (Phase 3 deliverable).

### 5.3 Model Routing Defaults
All model assignments are user-configurable via `androidcode.json`.

---

## 6. Project Intelligence

**Auto-Detection on Project Open:**
When AndroidCode opens a project, it automatically runs `android describe` (if available), detects the project type, maps the module graph, reads the build config, parses version catalogs, detects convention plugins, enumerates components, and detects KMP/architecture setups.

This generates a **Project Context Document** that is injected into every agent session, replacing the need for external tools like GitNexus in many cases.

---

## 7. Shipped Skills (Out of the Box)

AndroidCode ships **24 skills** across four categories, living under `.agent/skills/`. AndroidCode also auto-installs Google's official skills on first use.

* **7.1 Process Skills:** `android-brainstorm`, `android-debug-workflow`, `android-migration`.
* **7.2 Implementation Skills:** `android-compose`, `android-views`, `android-navigation`, `android-networking`, `android-database`, `android-di`, `android-architecture`, `android-permissions`, `android-kmp`, `android-deeplinks`, `android-widgets`, `android-modularization`, `android-workmanager`.
* **7.3 Analysis Skills:** `android-performance`, `android-security`, `android-accessibility`.
* **7.4 Tooling Skills:** `android-gradle`, `android-testing`, `android-ci`, `android-release`, `android-proguard`.

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

The CLI's HTTP/WebSocket API should use **LSP-compatible message framing** from Phase 1 to support this integration seamlessly in Phase 5.

---

## 10. Configuration

`androidcode.json` (Project Root) supports specifying models for agents, overriding max active skills, defining SDK paths, and managing permissions. For CI/CD and scripting, all key config values can be overridden via environment variables (e.g., `ANDROIDCODE_MODEL`, `ANDROIDCODE_SDK_PATH`).

---

## 11. Phased Development Plan

*(Timelines adjusted for a solo developer working part-time)*

* **Pre-Phase: Setup (Week 0):** npm scope registration, fork, CI setup, Bun compatibility, clone google skills index.
* **Phase 1: Foundation (Weeks 1-8):** Rebrand, structured error handling, `android` CLI probe/wrapper, Project Intelligence, 3 gap filler tools, 2 primary agents, auto-install logic.
* **Phase 2: Skill Orchestration Engine (Weeks 9-16):** Extended `SKILL.md` frontmatter, Task Analyzer, Skill Scorer, Conflict Resolver, mid-conversation re-routing, UX overrides.
* **Phase 3: Full Tool Suite, Skills & Agents (Weeks 17-28):** Remaining 6 gap-filler tools, 4 subagents, 24 shipped skills, versioning, integration testing.
* **Phase 4: Community & Polish (Weeks 29-36):** Plugin system validation, registry design, opt-in telemetry, documentation, beta testing.
* **Phase 5: IDE Extension (Weeks 37-44):** IntelliJ Platform SDK plugin scaffold, tool window, build/logcat integration.

---

## 12. Key Design Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **Fork vs Plugin** | Full fork | Complete control over TUI, agent loop, tools, and default experience |
| **Google's `android` CLI** | Wrap with fallbacks | Leverages Google's investment; fallbacks preserve functionality on platforms where `android` is unavailable |
| **Skill frontmatter** | agentskills.io standard + `metadata.orchestration` | Makes skills portable to Gemini, Android Studio, any agentskills.io-compatible agent |
| **Skill discovery** | `.agent/skills/` + `.skills/` | Matches agentskills.io standard |
| **Google's official skills** | Auto-install on first session | Users get canonical Google guidance for migrations/upgrades automatically |
| **Skill activation** | Contextual router, not "load all" | Solves multi-skill conflict problem |
| **Task Analyzer** | Hybrid keyword + LLM | Keyword handles 70-80% of cases with zero latency; LLM reserved for ambiguous inputs |
| **Skill re-routing** | Per-message re-evaluation | Conversations shift context; static skill selection breaks on multi-turn tasks |

---

## 13. Resolved Questions

* **Upstream sync strategy:** Monthly rebase with a "never merge" list for Android-specific modules. Documented in `UPSTREAM_SYNC.md`.
* **Offline support:** Built-in via AI SDK (Ollama/LM Studio). Configuration-only.
* **KMP support:** Planned for Phase 3. Dedicated `android-kmp` agent and skill. Google has officially endorsed KMP; it is not optional.
* **Telemetry:** Opt-in only with full transparency. Never collect code content, file paths, or model prompts.
* **Monetization:** Business decision deferred. Architecture is neutral. Initial launch is purely open-source.

---

## 14. Success Metrics

* **Adoption:** 500+ GitHub stars within 3 months.
* **Community:** 5+ community-contributed plugins within 6 months.
* **Skill Router Accuracy:** 90%+ correct activation (measured via `/skills` override rate).
* **Skill Router Latency:** <10ms p95 (keyword path), <500ms p95 (LLM path).
* **Build Success Rate:** Agent-generated code compiles >80% on first build attempt.
* **Tool Error Recovery:** Agent self-recovers from 60%+ of tool errors.
* **Skill Portability:** 100% of shipped skills validate against the pinned agentskills.io revision.
* **Android CLI Wrap Coverage:** ≥90% of Android interactions on macOS/Linux go through `android` CLI.
