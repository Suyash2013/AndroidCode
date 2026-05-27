---
name: android-kmp
description: Kotlin Multiplatform Mobile (KMM/KMP) setup, shared module architecture, expect/actual pattern, and platform interop.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["KMP", "KMM", "Kotlin Multiplatform", "commonMain", "expect", "actual", "shared module"]
    priority: 65
    scope: project
---

# Android KMP

Use this skill when adopting or working with Kotlin Multiplatform in an Android project.

## Module Setup
- Create a shared module with `kotlin("multiplatform")` plugin.
- Source sets: `commonMain`, `androidMain`, `iosMain` (if targeting iOS).
- Keep UI in platform modules; business logic in `commonMain`.

## Expect / Actual
- Declare platform APIs with `expect` in `commonMain`.
- Implement with `actual` in `androidMain` and other targets.
- Avoid `expect`/`actual` for pure Kotlin logic; reserve for IO, storage, or OS APIs.

## Dependencies
- Use KMP-compatible libraries: Ktor, SqlDelight, Apollo GraphQL, Koin.
- Avoid JVM-only libraries in `commonMain`.
- Use `kotlinx.coroutines` for async code across platforms.

## Build Config
- Configure `androidTarget()` in shared module Gradle.
- Link Android source sets with `androidMain` dependencies.
- Use version catalog for consistent library versions.
