---
name: android-networking
description: Networking patterns for Android: Retrofit, OkHttp, Ktor, offline-first architecture, and error handling.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring"]
      content_patterns: ["Retrofit", "OkHttp", "Ktor", "API", "network", "offline", "caching", "HTTP"]
    priority: 70
    scope: module
---

# Android Networking

Use this skill when implementing REST APIs, GraphQL, or WebSocket clients in Android.

## Retrofit / OkHttp
- Use Retrofit with Kotlin coroutines (`suspend` functions).
- Configure OkHttp interceptors for logging (debug builds only) and auth tokens.
- Use `Converter.Factory` for JSON (Kotlinx Serialization or Moshi).

## Offline-First
- Layer a local cache (Room) between UI and network.
- Use `Flow` to emit cached data immediately, then refresh from network.
- Handle network errors gracefully with retry policies (`ExponentialBackoff`).

## Error Handling
- Map HTTP errors to sealed class states: `Loading`, `Success`, `Error`, `Empty`.
- Use `Result<T>` or custom domain `NetworkResult` wrappers.
- Never expose raw HTTP exceptions to UI layer.

## Security
- Pin certificates in OkHttp for high-security apps.
- Use `CertificateTransparency` where applicable.
- Clear sensitive headers from logs.
