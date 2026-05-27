---
name: android-performance
description: Performance optimization for Android: memory profiling, layout inspection, startup time, and battery usage.
metadata:
  orchestration:
    category: analysis
    triggers:
      task_types: ["analysis", "debugging"]
      content_patterns: ["performance", "profiler", "memory leak", "startup", "jank", "battery", "ANR", "OOM"]
    priority: 75
    scope: project
    depends_on: ["android-core"]
---

# Android Performance

Use this skill when optimizing Android app performance or diagnosing slowness.

## Memory
- Profile with Android Studio Memory Profiler.
- Look for retained objects in heap dumps.
- Use `WeakReference` for caches; avoid static `Activity` references.
- Review bitmap allocations and image loading library configs.

## Startup
- Use Jetpack Startup Library for dependency initialization.
- Defer non-critical initialization to background thread.
- Profile cold start with `am start -W` and Android Studio CPU Profiler.

## UI Jank
- Enable GPU rendering profile bars.
- Reduce overdraw: flatten views, avoid transparent pixels.
- Move heavy work off main thread during animations.

## Battery
- Use `HealthStats` for battery attribution.
- Minimize background services; prefer `WorkManager` with constraints.
- Audit `AlarmManager` usage and replace with `JobScheduler`/`WorkManager`.
