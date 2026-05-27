---
name: android-permissions
description: Runtime permission handling, permission rationale dialogs, and special permissions (camera, location, notifications, etc.).
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["permission", " Manifest.permission", "requestPermissions", "ActivityResultContracts", "camera", "location", "notification"]
    priority: 70
    scope: module
---

# Android Permissions

Use this skill when adding or managing runtime permissions.

## Runtime Permissions
- Use `ActivityResultContracts.RequestPermission()` or `RequestMultiplePermissions()`.
- Check `ContextCompat.checkSelfPermission()` before requesting.
- Show a rationale dialog if `shouldShowRequestPermissionRationale()` returns true.

## Permission Patterns
- Group related permissions (location foreground + background) in a single flow.
- Handle denied permanently: redirect to app settings with an Intent.
- Never block app startup waiting for optional permissions.

## Special Permissions
- **Notification:** Use `NotificationManagerCompat` and `NotificationChannel`.
- **Camera:** Requires both `CAMERA` and optionally `RECORD_AUDIO`.
- **Location:** Distinguish `ACCESS_FINE_LOCATION` vs `ACCESS_COARSE_LOCATION`; background needs `ACCESS_BACKGROUND_LOCATION`.
- **Storage:** Use `MediaStore` APIs on API 29+; scoped storage applies.

## Testing
- Use `GrantPermissionRule` in Espresso tests.
- Mock permission results with `ActivityResultContract` in unit tests.
