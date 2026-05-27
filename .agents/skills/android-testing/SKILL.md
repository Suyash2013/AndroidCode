---
name: android-testing
description: Unit tests, integration tests, and UI tests for Android using JUnit, Espresso, and Compose UI Testing.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["testing", "code-generation"]
      content_patterns: ["test", "JUnit", "Espresso", "Compose UI Test", "@Test", "mock", "assert"]
    priority: 75
    scope: module
    depends_on: ["android-core"]
---

# Android Testing

Use this skill when writing or reviewing Android tests.

## Unit Tests
- Run with JVM test runner; use `testImplementation` dependency.
- Mock Android framework classes with MockK or Mockito.
- Test ViewModels with `kotlinx.coroutines.test` `TestDispatcher`.

## Instrumentation Tests
- Use Espresso for Views and Compose UI Test for Compose.
- Use `ActivityScenario` for Activity lifecycle testing.
- Grant permissions with `GrantPermissionRule`.

## Compose UI Testing
- Use `createComposeRule()` and `onNodeWithText` / `onNodeWithTag`.
- Perform actions with `.performClick()`, `.performTextInput()`.
- Verify state with `.assertIsDisplayed()`, `.assertTextEquals()`.

## Test Structure
- Follow Given-When-Then naming or `fun featureActionResult()`.
- Separate unit, integration, and UI test source sets.
- Use `HiltAndroidTest` with `HiltTestApplication` for DI tests.

## Coverage
- Enable JaCoCo or built-in Android coverage reporting.
- Exclude generated code and databinding classes.
- Aim for core module coverage >70%.
