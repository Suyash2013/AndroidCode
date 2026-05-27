---
name: android-architecture
description: Android architecture patterns: MVVM, MVI, Clean Architecture, and unidirectional data flow. Guides layer separation and state management.
metadata:
  orchestration:
    category: implementation
    triggers:
      task_types: ["code-generation", "refactoring", "planning"]
      content_patterns: ["MVVM", "MVI", "Clean Architecture", "ViewModel", "Repository", "UseCase", "state management", "unidirectional"]
    priority: 75
    scope: project
    depends_on: ["android-core"]
---

# Android Architecture

Use this skill when designing or refactoring the overall architecture of an Android project.

## MVVM
- ViewModel holds UI state (use `StateFlow` or Compose `mutableStateOf`).
- ViewModel exposes events to UI; UI sends user intents back.
- Never hold references to Views or Activities in ViewModel.

## MVI
- Single immutable state object per screen.
- Intents are events; reducer computes new state.
- Use sealed classes for `UiState`, `UiEvent`, and `SideEffect`.

## Clean Architecture
- Modules: `domain` (no Android deps), `data`, `presentation`.
- Domain defines interfaces; data implements them.
- Presentation layer depends on domain, not data directly.

## Unidirectional Data Flow
- State flows down; events flow up.
- One source of truth per screen (ViewModel or Store).
- Avoid two-way binding between UI and ViewModel.
