---
name: android-deeplinks
description: Implementing and testing deep links, app links, and URI handling in Android apps with Compose and Views.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation"]
      content_patterns: ["deep link", "app link", "intent filter", "uri", "navigation deep link"]
    priority: 65
    scope: module
---

# Android Deeplinks

Use this skill when implementing deep links or app links in an Android project.

## Manifest Declaration
- Add `<intent-filter>` with `android:scheme`, `host`, and `pathPrefix`.
- Use `autoVerify="true"` for Android App Links (HTTPS-only).
- Declare `<data>` tags inside `<intent-filter>`.

## Compose Navigation
- Use `navDeepLink { uriPattern = "https://example.com/{arg}" }` in graph.
- Extract arguments with `navBackStackEntry.arguments`.
- Handle deep link Intent in Activity `onCreate` and `onNewIntent`.

## Testing
- Test with `adb shell am start -W -a android.intent.action.VIEW -d "<uri>" <package>`.
- Verify App Links with Google's Digital Asset Links JSON.
- Handle invalid/malformed URIs gracefully.

## Routing
- Centralize routing logic in a single module.
- Map URI patterns to screen destinations using sealed classes.
- Log deep link errors for analytics/monitoring.
