---
name: android-di
description: Dependency injection patterns for Android using Hilt, Dagger, and Koin. Covers component scopes and testing.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["Hilt", "Dagger", "Koin", "@Inject", "@Module", "@Component", "dependency injection"]
    priority: 75
    scope: module
---

# Android DI

Use this skill when setting up or refactoring dependency injection in an Android project.

## Hilt (Recommended)
- Apply `com.google.dagger.hilt.android` plugin in app/module `build.gradle.kts`.
- Annotate `Application` with `@HiltAndroidApp`.
- Use `@HiltViewModel` for ViewModels; constructor-inject dependencies.
- Use `@InstallIn(SingletonComponent::class)` or `ActivityComponent::class` for modules.

## Dagger (Manual)
- Define component interfaces with `@Component`.
- Use `@Subcomponent` for screen-level scopes.
- Ensure lifecycle alignment: don't hold Activity references in singletons.

## Koin
- Use `module { single { ... } }` and `viewModel { ... }` DSL.
- Start Koin in `Application.onCreate` with `startKoin { androidContext(...) }`.
- Prefer constructor injection over `get()` / `inject()` for testability.

## Testing
- Use `HiltAndroidTest` with `HiltTestApplication` for instrumented tests.
- Replace bindings with `@TestInstallIn` for fakes/mocks.
