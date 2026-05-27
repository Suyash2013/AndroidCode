---
name: android-compose
description: Specialized instructions for Jetpack Compose UI development, state management, navigation, theming, and performance optimization.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      file_patterns: ["*.kt"]
      content_patterns: ["@Composable", "Compose", "LazyColumn", "remember", "mutableStateOf", "Surface", "Scaffold"]
    priority: 80
    scope: module
    depends_on: ["android-core"]
---

# Android Compose

Use this skill when writing or refactoring Jetpack Compose UI code.

## Compose Idioms
- Use `remember` + `mutableStateOf` for local UI state.
- Hoist state to a ViewModel for screen-level state.
- Avoid recomposition by using stable keys and `key { ... }`.
- Use `DerivedStateOf` for expensive transformations.

## Performance
- Avoid non-`@Stable` lambdas in Composables (use `remember` or event wrapper).
- Use `LazyColumn`/`LazyRow` with `items` DSL and stable keys.
- Profile with Compose Compiler Metrics.

## Material Design
- Prefer Material3 components (`Scaffold`, `TopAppBar`, `NavigationBar`).
- Use `MaterialTheme.colorScheme` and `typography` for consistency.

## Navigation
- Use Compose Navigation with typed safe arguments.
- Keep navigation graph in a single module; export destinations as sealed classes.
