---
name: android-navigation
description: Navigation Component, deep links, backstack management, and safe args for both Compose and Views.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["navigate", "deep link", "NavController", "NavHost", "backstack", "safe args"]
    priority: 75
    scope: module
    depends_on: ["android-core"]
---

# Android Navigation

Use this skill when implementing navigation flows, deep links, or backstack management.

## Compose Navigation
- Define `NavHost` with typed destinations using Compose Navigation 2.8+.
- Pass arguments via `navigate(route = ...)` with URL-encoded values.
- Handle `onBackPressed` with `BackHandler { ... }` in Composables.

## Views Navigation
- Use Navigation Component XML graphs in `res/navigation/`.
- Use Safe Args plugin for type-safe argument passing.
- Handle Up button with `NavigationUI.setupActionBarWithNavController`.

## Deep Links
- Declare `<deepLink>` in XML graph with `android:uri`.
- In Compose, use `navDeepLink { uriPattern = ... }`.
- Test deep links with `adb shell am start -W -a android.intent.action.VIEW -d "<uri>"`.

## Backstack
- Use `popUpTo` with `inclusive = true` to clear intermediate destinations.
- Avoid duplicate destinations by checking `currentBackStackEntry`.
