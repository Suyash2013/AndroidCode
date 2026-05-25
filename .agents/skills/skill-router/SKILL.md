---
name: skill-router
description: Explains how the AndroidCode skill orchestration system works. Load when the user asks about skills, routing, or why certain skills are active.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["skill-help", "routing-help"]
      content_patterns: ["skill", "router", "orchestration", "active skills"]
    priority: 100
    scope: session
---

# Skill Router

AndroidCode uses a 3-layer Skill Orchestration Engine:

1. **Task Analyzer** — Classifies the user's message into a task type (debugging, code-generation, refactoring, etc.)
2. **Skill Router** — Scores all available skills against the task analysis and selects up to 5
3. **Conflict Resolver** — Eliminates conflicting skills based on priority and scope

Users can override the router with `/skills add <name>`, `/skills remove <name>`, and `/skills reset`.
