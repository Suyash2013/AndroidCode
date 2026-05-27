---
name: android-gradle
description: Gradle build optimization, buildSrc, version catalogs, convention plugins, and custom Gradle tasks for Android.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["code-generation", "debugging"]
      content_patterns: ["gradle", "build.gradle", "buildSrc", "version catalog", "convention plugin", "gradle task"]
      file_patterns: ["*.gradle", "*.gradle.kts", "*.toml"]
    priority: 80
    scope: project
    depends_on: ["android-core"]
---

# Android Gradle

Use this skill when working with Gradle build configuration for Android.

## Version Catalogs
- Declare versions, libraries, plugins, and bundles in `gradle/libs.versions.toml`.
- Reference in `build.gradle.kts` with `alias(libs.plugins.android.application)`.
- Keep catalog in root project; avoid per-module duplication.

## Convention Plugins
- Extract common plugin configs to `buildSrc` or `build-logic`.
- Use `plugins { id("com.android.application") }` in convention plugin.
- Apply convention plugin in module `build.gradle.kts` with `plugins { id("my.convention") }`.

## Build Optimization
- Enable Gradle Build Cache and Configuration Cache.
- Use `org.gradle.parallel=true` and `org.gradle.caching=true` in `gradle.properties`.
- Profile build with `./gradlew :app:build --scan`.

## Custom Tasks
- Define custom `Task` types in `buildSrc`.
- Register with `tasks.register<MyTask>("myTask") { ... }`.
- Ensure task inputs/outputs are declared for incremental builds.

## Troubleshooting
- Resolve dependency conflicts with `resolutionStrategy`.
- Use `./gradlew dependencies --configuration implementation` to inspect graph.
- Address deprecation warnings before Gradle upgrades.
