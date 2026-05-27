---
name: android-security
description: Security best practices for Android: certificate pinning, encrypted preferences, biometrics, and secure network communication.
metadata:
  orchestration:
    category: analysis
    triggers:
      task_types: ["analysis", "code-generation"]
      content_patterns: ["security", "encrypt", "biometric", "certificate pinning", "SSL", "keystore", "EncryptedSharedPreferences"]
    priority: 70
    scope: project
---

# Android Security

Use this skill when implementing or auditing security features in Android.

## Network Security
- Use `NetworkSecurityConfig` for certificate pinning (debug builds vs release).
- Prohibit cleartext traffic with `cleartextTrafficPermitted="false"`.
- Validate SSL certificates; never trust all hosts.

## Storage
- Use `EncryptedSharedPreferences` for sensitive tokens.
- Store keys in Android Keystore (not bundled in APK).
- Avoid `MODE_WORLD_READABLE` / `MODE_WORLD_WRITEABLE`.

## Biometrics
- Use BiometricPrompt for fingerprint/face unlock.
- Combine with `CryptoObject` for cryptographic operations.
- Gracefully degrade on devices without hardware biometrics.

## Code Obfuscation
- Enable R8/ProGuard in release builds.
- Keep rules for serialization and reflection.
- Strip debug symbols and logging from release APKs.

## Input Validation
- Sanitize all user input before SQL queries (Room already handles most).
- Validate deep-link arguments; never trust Intent extras blindly.
- Use `Uri.parse()` carefully to avoid open redirects.
