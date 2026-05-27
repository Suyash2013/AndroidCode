---
name: android-brainstorm
description: Workflow for brainstorming and exploring Android feature ideas, architecture options, and UI/UX strategies before implementation.
metadata:
  orchestration:
    category: process
    triggers:
      task_types: ["planning", "refactoring"]
      content_patterns: ["brainstorm", "architecture", "design", "feature idea", "explore options"]
    priority: 60
    scope: session
    conflicts_with: ["android-compose", "android-views", "android-navigation"]
---

# Android Brainstorm

Use this skill when the user wants to explore ideas before writing code.

## Workflow
1. Ask clarifying questions about constraints (API level, Compose vs Views, offline support).
2. Propose 2–3 architecture options with trade-offs.
3. Recommend one option and explain why.
4. Provide a high-level module breakdown if relevant.

## Constraints to Always Consider
- Minimum SDK version
- Jetpack Compose vs legacy Views
- Kotlin Multiplatform (KMP) boundaries
- Gradle module granularity
- Accessibility requirements

## Output Format
- **Option A:** ... (pros/cons)
- **Option B:** ... (pros/cons)
- **Recommendation:** ...
- **Next Steps:** ...
