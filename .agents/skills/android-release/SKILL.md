---
name: android-release
description: App release workflows: signing, versioning, Play Store publishing (AAB), and APK distribution.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["code-generation", "planning"]
      content_patterns: ["release", "APK", "AAB", "Play Store", "signing", "versionCode", "publish"]
    priority: 70
    scope: project
    conflicts_with: ["android-debug-workflow"]
---

# Android Release

Use this skill when preparing or automating an Android app release.

## Signing
- Manage release keystore securely (not in repo).
- Use `jarsigner` or Gradle signing config with environment variables.
- Enable APK Signature Scheme v3 for best compatibility.

## Versioning
- Increment `versionCode` uniquely for every release.
- Use semantic `versionName` (e.g., `1.2.3`).
- Tag releases in Git for traceability.

## Build Variants
- Define `release` build type with `minifyEnabled` and `shrinkResources`.
- Use `productFlavors` for white-label or environment-specific builds.
- Generate AAB (Android App Bundle) for Play Store submission.

## Play Store Publishing
- Use Google Play Publishing API or Gradle Play Publisher plugin.
- Upload AAB; Google generates optimized APKs per device.
- Staged rollouts (10% → 50% → 100%) for risk mitigation.

## Distribution
- Internal testing track for QA.
- Closed/open testing tracks before production.
- GitHub Releases or Firebase App Distribution for side-loading.
