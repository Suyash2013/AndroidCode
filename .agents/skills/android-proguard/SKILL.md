---
name: android-proguard
description: ProGuard / R8 configuration for code shrinking, obfuscation, and optimization in Android release builds.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["code-generation", "debugging"]
      content_patterns: ["ProGuard", "R8", "obfuscation", "shrink", "minifyEnabled", "keep class", "rules"]
    priority: 65
    scope: module
---

# Android ProGuard / R8

Use this skill when configuring or debugging ProGuard/R8 in an Android project.

## Enable R8
- Set `android.buildTypes.release.minifyEnabled = true`.
- Use `shrinkResources = true` to remove unused resources (requires minification).
- Output mapping file: `proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")`.

## Keep Rules
- Keep model classes used in serialization (`@SerializedName`, `@JsonClass`).
- Keep ViewModel constructors accessed by Hilt.
- Keep Parcelable implementations and CREATOR fields.
- Keep enums used in `when` expressions.

## Debugging
- Use `proguard-android.txt` (no optimization) vs `proguard-android-optimize.txt`.
- Decode stack traces with `retrace` and the generated mapping file.
- Enable `-printusage` and `-printconfiguration` temporarily.
- Review `build/outputs/mapping/` for usage reports.

## Third-Party Libraries
- Most libraries ship their own `consumer-proguard-rules.pro`.
- Add manual `-keep` rules for libraries that don't.
- Report missing rules to library maintainers.
