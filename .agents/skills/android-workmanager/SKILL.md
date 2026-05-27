---
name: android-workmanager
description: Background work scheduling with WorkManager: one-time, periodic, expedited, and constrained workers.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["WorkManager", "Worker", "background work", "periodic", "doWork", "Constraints", "OneTimeWorkRequest"]
    priority: 65
    scope: module
---

# Android WorkManager

Use this skill when scheduling deferrable background work in Android.

## Worker Setup
- Extend `Worker` for synchronous work; `CoroutineWorker` for suspend functions.
- Return `Result.success()`, `Result.failure()`, or `Result.retry()`.
- Pass input data with `Data.Builder()`.

## Request Types
- **One-time:** `OneTimeWorkRequestBuilder<MyWorker>().build()`.
- **Periodic:** `PeriodicWorkRequestBuilder<MyWorker>(15, TimeUnit.MINUTES).build()`.
- **Expedited:** `setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)`.

## Constraints
- Apply network, battery, storage, and charging constraints.
- Chain workers with `WorkManager.getInstance().beginWith(...).then(...).enqueue()`.
- Use unique work chains with `ExistingWorkPolicy.REPLACE` or `KEEP`.

## Testing
- Use `WorkManagerTestInitHelper` for instrumented tests.
- Verify worker output with `TestWorkerBuilder`.
- Mock `WorkerParameters` for unit tests.
