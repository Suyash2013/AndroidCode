---
name: android-modularization
description: Gradle module setup, feature modules, dynamic feature modules, and modularization strategies for large Android projects.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["planning", "refactoring"]
      content_patterns: ["module", "modularization", "feature module", "dynamic feature", "gradle module", "settings.gradle"]
    priority: 70
    scope: project
---

# Android Modularization

Use this skill when splitting or restructuring an Android project into modules.

## Module Types
- **app:** Application module; depends on feature modules.
- **feature:** Self-contained feature with UI and ViewModel.
- **core:** Shared utilities, networking, database.
- **domain:** Business logic and use cases (no Android deps).

## Dynamic Feature Modules
- Use `com.android.dynamic-feature` plugin.
- Declare dependency in `app/build.gradle.kts` with `dynamicFeatures += setOf(":feature:x")`.
- Navigate with `PlayCore` or `androidx.navigation` dynamic features.

## Dependency Rules
- Feature modules should not depend on each other.
- Core modules expose public APIs; internal packages are `internal` visibility.
- Version catalog drives dependency versions from root project.

## Migration Strategy
- Start by extracting `core` and `domain` modules.
- Then split features one at a time.
- Use dependency graph visualization to identify cycles.
- Validate with `./gradlew :app:dependencies --configuration implementation`.
