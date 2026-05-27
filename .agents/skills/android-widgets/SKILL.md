---
name: android-widgets
description: Home screen widgets, glance/app widgets, and notification widgets for Android. Covers RemoteViews and Glance APIs.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation"]
      content_patterns: ["widget", "AppWidgetProvider", "RemoteViews", "Glance", "home screen"]
    priority: 60
    scope: module
---

# Android Widgets

Use this skill when implementing home screen or notification widgets.

## AppWidgetProvider
- Extend `AppWidgetProvider`; override `onUpdate`, `onEnabled`, `onDisabled`.
- Register in `AndroidManifest.xml` with `<receiver>` and `<intent-filter>` for `APPWIDGET_UPDATE`.
- Define `appwidget-provider` XML in `res/xml/`.

## RemoteViews
- Build layouts with `RemoteViews` for widget UI.
- Supported views: `TextView`, `ImageView`, `ProgressBar`, `Button`, etc.
- Use `PendingIntent` for click actions on widget elements.

## Glance (Jetpack Glance)
- Use Glance for modern widget API with Compose-like syntax.
- Define `GlanceAppWidget` and `GlanceAppWidgetReceiver`.
- Use `GlanceTheme` for Material3 theming.

## Update Strategy
- Use `WorkManager` for periodic widget updates.
- Avoid frequent updates that drain battery.
- Handle widget resize with `onAppWidgetOptionsChanged`.
