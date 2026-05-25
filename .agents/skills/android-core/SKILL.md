---
name: android-core
description: Minimal always-on Android development awareness. Provides Android project structure conventions, Gradle basics, and common patterns.
metadata:
  orchestration:
    category: implementation
    triggers:
      file_patterns: ["*.gradle", "*.kt", "*.java", "AndroidManifest.xml", "build.gradle*"]
      task_types: ["code-generation", "debugging", "refactoring"]
    priority: 10
    scope: project
---

# Android Core

This skill provides baseline Android development context.

## Project Structure
- `app/src/main/java/` — Application source
- `app/src/main/res/` — Resources (layouts, drawables, values)
- `app/build.gradle.kts` — App-level build config
- `build.gradle.kts` — Project-level build config
- `settings.gradle.kts` — Project settings

## Common Patterns
- Use `ViewModel` for UI-related data
- Use `CoroutineScope` for async operations
- Prefer `build.gradle.kts` over `build.gradle`
