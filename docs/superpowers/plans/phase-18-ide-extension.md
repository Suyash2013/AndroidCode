# Phase 18: IDE Extension

**Goal:** Ship an IntelliJ/Android Studio thin-client plugin scaffold with tool window, inline actions, build/logcat integration, and LSP-compatible CLI framing.  
**Depends on:** Phases 10, 15  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 18

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase18/ide-extension` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
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

## 18.1 IntelliJ Platform SDK Plugin Scaffold

**Why:** Android Studio is the primary IDE for Android developers. A thin-client plugin that wraps the AndroidCode CLI lets users stay in their IDE while benefiting from the agent's reasoning and tool output.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `ide/androidcode-studio/build.gradle.kts` | New Gradle Kotlin script: IntelliJ Platform Plugin setup. `plugins` block applies `org.jetbrains.intellij.platform` version `2.x`. `intellij.platform` target: `IC` (IntelliJ Community) with bundled Android plugin. `dependencies` include Kotlin stdlib and a JSON-RPC client library (e.g., `com.github.rsinukov:jsonrpc-kotlin` or raw `java.net.http` + kotlinx.serialization). |
| `ide/androidcode-studio/settings.gradle.kts` | New settings file defining the plugin module. |
| `ide/androidcode-studio/src/main/resources/META-INF/plugin.xml` | Plugin manifest: `id="ai.androidcode.studio"`, `name="AndroidCode"`, version follows repo tag, `depends` on `com.intellij.modules.platform` and `org.jetbrains.android`. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/AndroidCodePlugin.kt` | Plugin entrypoint: `ApplicationComponent` / `ProjectActivity` that initializes the plugin state, discovers the `androidcode` CLI binary (from `PATH` or a configurable setting), and starts the JSON-RPC connection. |

## 18.2 LSP-Compatible CLI Framing

**Why:** The IDE extension communicates with the CLI. Using LSP-compatible JSON-RPC 2.0 framing from day one avoids a custom protocol that would need to be reimplemented later for other editors.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/cli/cmd/server.ts` | Add a `--lsp` flag (or `androidcode server --lsp`) that starts the existing HTTP/WebSocket server but wraps all messages in JSON-RPC 2.0 envelopes (`jsonrpc: "2.0"`, `id`, `method`, `params` / `result` / `error`). Support methods: `initialize`, `shutdown`, `agent/dispatch`, `tool/invoke`, `build/stream`, `logcat/stream`. |
| `packages/opencode/src/lsp/jsonrpc.ts` | New module: JSON-RPC 2.0 message parser/serializer, request/response matching, and error code constants. Keep it generic so it can be reused for a future native LSP server. |
| `packages/opencode/test/server/lsp-framing.test.ts` | New test: send a JSON-RPC `initialize` request over stdin to `server --lsp`; assert the response contains `result` with `capabilities` and correct `jsonrpc` version. |

## 18.3 Tool Window Panel

**Why:** A dedicated tool window gives users a persistent UI for agent chat, build status, and logcat without leaving the IDE layout.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/ui/AndroidCodeToolWindowFactory.kt` | Implements `ToolWindowFactory`. Creates a `JBSplitter` with a chat panel (top) and a streaming output panel (bottom). |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/ui/ChatPanel.kt` | Chat UI: `JBTextArea` input + scrollable message list. Messages are rendered as simple HTML bubbles. Sends `agent/dispatch` JSON-RPC requests to the CLI. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/ui/StreamPanel.kt` | Streaming output panel: `ConsoleViewImpl` (or `JBTextArea` with ANSI color parsing) for build and logcat streams. Listens for `build/stream` and `logcat/stream` JSON-RPC notifications. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/CliClient.kt` | JSON-RPC client over stdin/stdout (or TCP socket) to the `androidcode server --lsp` process. Handles connection lifecycle, reconnection, and request/response correlation by `id`. |

## 18.4 Inline Actions & Gutter Annotations

**Why:** Inline actions reduce context switching: users can trigger agent actions (explain, refactor, test) directly from the editor instead of copying code into a chat panel.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/action/ExplainAction.kt` | `AnAction` registered in `AndroidCode` action group: sends `agent/dispatch` with `agent: android-explore` and the current selection as context (file path + line range, **not** file content — the agent reads the file via its own `read` tool to avoid duplicating code in the IDE→CLI payload). |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/action/RefactorAction.kt` | Similar action targeting `android-build` with a refactor intent. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/action/GenerateTestAction.kt` | Action targeting `android-testing` skill context. |
| `ide/androidcode-studio/src/main/resources/META-INF/plugin.xml` | Register actions in `<actions>` block with `group-id="EditorPopupMenu"` and `group-id="ProjectViewPopupMenu"`. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/gutter/AndroidCodeGutterIconProvider.kt` | Optional: gutter icons on `fun` / `class` lines that open a small popup with Explain / Refactor / Test shortcuts. |

## 18.5 Build / Logcat Integration

**Why:** Surfacing `gradle` build output and `logcat` streams in the IDE tool window lets the agent and the user share the same diagnostic view.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/gradle.ts` | When running under the IDE (detected by `ANDROIDCODE_IDE_SESSION` env var), emit build-progress JSON-RPC notifications in addition to structured `ToolResult`. Notification shape: `method: "build/stream"`, `params: { task: string, status: "started"|"completed"|"failed", output_chunk: string }`. |
| `packages/opencode/src/tool/logcat.ts` | Similarly emit `logcat/stream` notifications when `ANDROIDCODE_IDE_SESSION` is set. Params: `pid`, `tag`, `level`, `message`. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/ui/StreamPanel.kt` | Parse `build/stream` and `logcat/stream` notifications and append to the console view with ANSI color or log-level color coding. |
| `ide/androidcode-studio/src/main/kotlin/ai/androidcode/studio/CliClient.kt` | Subscribe to server→client JSON-RPC notifications (no `id` field) and route them by `method` to the appropriate UI panel. |

## 18.6 Build & Packaging

**Why:** The plugin must be buildable from the monorepo CI and distributable via JetBrains Marketplace or GitHub Releases.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `ide/androidcode-studio/build.gradle.kts` | Add `signPlugin` and `publishPlugin` tasks (credentials from env). Add `runIde` task for local testing. Add a `zipDistribution` task producing `androidcode-studio-<version>.zip`. |
| `.github/workflows/build-plugin.yml` | New CI workflow: on PRs and `dev` pushes, run `./gradlew :ide:androidcode-studio:buildPlugin` (Linux runner with Java 21). Upload the zip as an artifact. |
| `package.json` (repo root) | Add `scripts.build:plugin` entry invoking the Gradle build. |

---

## Verification

- `./gradlew :ide:androidcode-studio:runIde` launches IntelliJ IDEA with the plugin loaded; the AndroidCode tool window appears in the bottom-right sidebar.
- Open an Android project in the test IDE instance, click the AndroidCode tool window, type a message, and verify the JSON-RPC `agent/dispatch` request is sent and a response is rendered.
- Trigger a Gradle build from the IDE's built-in build action; verify `build/stream` notifications appear in the AndroidCode stream panel.
- Run `packages/opencode/test/server/lsp-framing.test.ts` and confirm JSON-RPC responses are well-formed.
- `bun typecheck` in `packages/opencode` passes with the new `--lsp` server path.

## Risk

- **IntelliJ Platform SDK versions drift between Android Studio and IntelliJ Community** → Mitigation: target the lowest common denominator (`IC` base) and test against the latest stable Android Studio via `runIdeForAndroidStudio` task if the `gradle-intellij-plugin` supports it. Document supported Android Studio versions in `ide/androidcode-studio/README.md`.
- **CLI binary discovery is unreliable across OS installs** → Mitigation: the plugin searches `PATH` for `androidcode`, then falls back to a user-configurable path in IDE settings (`Settings → Tools → AndroidCode`). If neither is found, the tool window shows a setup prompt with installation instructions.
- **Large logcat/build streams overwhelm the IDE UI** → Mitigation: the `StreamPanel` uses a ring buffer (max 10,000 lines) and drops oldest lines. Heavy streams are throttled in the CLI (max 10 notifications/sec) to avoid JSON-RPC backpressure.
