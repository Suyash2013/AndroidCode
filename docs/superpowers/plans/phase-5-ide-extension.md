# Phase 5: IDE Extension (Weeks 37–44)

**Goal:** Build an IntelliJ Platform SDK plugin that wraps the AndroidCode CLI.

**Prerequisite:** Phase 4 must be complete (stable beta, documented API).

---

## 5.1 Plugin Scaffold

**Directory:** `ide/androidcode-intellij/` (new top-level directory)

**Tech:** IntelliJ Platform SDK (Kotlin), Gradle build.

**Structure:**
```
ide/androidcode-intellij/
  build.gradle.kts
  src/main/kotlin/com/androidcode/ide/
    AndroidCodePlugin.kt          # Plugin entry point
    AndroidCodeService.kt         # Manages CLI process lifecycle
    AndroidCodeToolWindowFactory.kt
    panels/
      DeviceSelectorPanel.kt
      BuildStatusPanel.kt
      LogcatStreamPanel.kt
    actions/
      InlineCodeAction.kt
      GutterAnnotationAction.kt
```

---

## 5.2 CLI API Enhancement

**Current state:** CLI uses HTTP + WebSocket. No LSP-compatible framing yet.

**Files:**
| File | Action |
| :--- | :--- |
| `packages/opencode/src/server/` | Add JSON-RPC 2.0 framing option for all endpoints. Enable via config flag `lsp_compatible: true`. |
| `packages/opencode/src/server/event.ts` | Ensure events can be serialized as JSON-RPC notifications. |

**Why this matters:** The IntelliJ plugin communicates with the CLI via the HTTP/WebSocket API. Using JSON-RPC 2.0 framing makes it trivial to integrate with IntelliJ's existing messaging infrastructure.

---

## 5.3 Tool Window

**Features:**
- **Device Selector:** Dropdown of connected ADB devices. Syncs with `android` CLI / `adb devices`.
- **Build Status:** Shows current Gradle task progress (parse `gradle` tool output for progress events).
- **Logcat Stream:** Real-time logcat output with filtering by package, level, and search term.

---

## 5.4 Inline Actions

**Actions:**
- **Generate Composable:** Right-click in Kotlin file → "Generate with AndroidCode" → describe UI → AI generates `@Composable` function.
- **Explain Build Error:** Click on red squiggly in build output → "Explain with AndroidCode" → AI analyzes error.
- **Add Permission:** In `AndroidManifest.xml` → "Add permission with AndroidCode" → describe needed permission → AI adds correct `<uses-permission>` tag and runtime check.

---

## 5.5 Gutter Annotations

**Features:**
- **Lifecycle indicator:** Small icon next to Activity/Fragment classes showing lifecycle state diagram on hover.
- **Module dependency graph:** Icon next to `build.gradle.kts` showing module graph visualization.
- **Resource usage:** Icon next to `R.id.*` references showing XML source.

---

## 5.6 Phase 5 Completion Criteria

- [ ] IntelliJ plugin builds and installs in Android Studio.
- [ ] Tool window shows device selector, build status, and logcat stream.
- [ ] Inline actions work for at least 3 scenarios.
- [ ] Gutter annotations display for lifecycle and resources.
- [ ] CLI JSON-RPC 2.0 framing passes compatibility tests.
