---
name: android-migration
description: Guides migration of Android projects (AndroidX, targetSdk bumps, Gradle version upgrades, Jetpack Compose transitions, and KMP adoption).
metadata:
  orchestration:
    category: process
    triggers:
      task_types: ["refactoring", "planning"]
      content_patterns: ["migrate", "upgrade", "AndroidX", "targetSdk", "bump version", "Compose migration"]
    priority: 70
    scope: project
---

# Android Migration

Use this skill when the user wants to migrate or upgrade part of their Android project.

## Migration Types
1. **AndroidX:** Replace support library packages, update ProGuard/R8 rules.
2. **targetSdk / compileSdk bump:** Review behavioral changes, permission changes, and deprecations.
3. **Gradle upgrade:** Update wrapper, align plugins, check version catalog.
4. **Compose transition:** Convert XML layouts to `@Composable` functions incrementally.
5. **KMP adoption:** Extract shared modules, configure `expect`/`actual`, and update CI.

## Workflow
1. Identify current and target versions.
2. Scan for breaking changes in official Android release notes.
3. Provide a step-by-step migration plan with rollback strategy.
4. Isolate changes per module to minimize blast radius.
5. Validate with `./gradlew check` after each step.
