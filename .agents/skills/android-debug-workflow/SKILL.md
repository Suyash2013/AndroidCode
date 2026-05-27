---
name: android-debug-workflow
description: Systematic debugging workflow for Android crashes, ANRs, and build failures. Guides logcat analysis, stack trace navigation, and root-cause isolation.
metadata:
  orchestration:
    category: process
    triggers:
      task_types: ["debugging"]
      content_patterns: ["crash", "ANR", "stack trace", "NullPointerException", "fatal", "force close"]
    priority: 85
    scope: session
    depends_on: ["android-core"]
---

# Android Debug Workflow

Use this skill when the user reports a crash, ANR, or unexpected behavior in an Android app.

## Workflow
1. Identify the crash type: `RuntimeException`, `ANR`, native crash, or build failure.
2. Request the full stack trace or relevant logcat output.
3. Pinpoint the line of code and trace backwards through the call stack.
4. Identify the root cause (null safety, lifecycle issue, threading, memory leak, or build config).
5. Propose a fix with a minimal code change.
6. Suggest preventive measures (lint rules, tests, or architecture adjustments).

## Common Patterns
- `NullPointerException` in `onCreate` → check `findViewById` / `binding` initialization order.
- `IllegalStateException` in Fragment → lifecycle mismatch, use `viewLifecycleOwner`.
- `ANR` in main thread → offload work to `CoroutineScope(Dispatchers.IO)` or `WorkManager`.
- `OutOfMemoryError` → review image loading (Coil/Glide config) and large bitmap handling.
- Build failure with `Duplicate class` → version catalog alignment or transitive dependency exclusion.
