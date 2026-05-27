---
name: android-ci
description: CI/CD pipeline templates and best practices for Android builds, tests, lint, and artifact publishing.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["code-generation", "planning"]
      content_patterns: ["CI", "CD", "pipeline", "GitHub Actions", "GitLab CI", "Bitrise", "automation", "build agent"]
    priority: 65
    scope: project
---

# Android CI

Use this skill when setting up or improving CI/CD for an Android project.

## Pipeline Stages
1. **Checkout:** Shallow clone with `fetch-depth: 0` if versioning from tags.
2. **Setup:** Install JDK (17+), Android SDK, and cache Gradle dependencies.
3. **Build:** Run `./gradlew assembleDebug` or `assembleRelease`.
4. **Test:** Run `./gradlew test` and `./gradlew connectedCheck` (if emulator available).
5. **Lint:** Run `./gradlew lint` and archive HTML/XML reports.
6. **Security:** Scan dependencies with OWASP Dependency-Check.
7. **Artifact:** Upload APK/AAB to artifact storage or distribution service.

## Gradle Caching
- Cache `~/.gradle/caches` and `~/.gradle/wrapper`.
- Use Gradle Build Cache in CI runners.
- Set `GRADLE_OPTS` for parallel builds.

## Emulator Tests
- Use emulator snapshots to reduce startup time.
- Consider Firebase Test Lab for device matrix testing.
- Use `android-emulator-runner` GitHub Action for local CI emulator runs.

## Secrets
- Never commit keystore passwords or API keys to source control.
- Use CI environment variables or secret managers (GitHub Secrets, Vault).
- Sign release builds in CI with imported keystore.
