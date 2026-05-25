---
name: skill-guide
description: Explains how to create custom skills for AndroidCode. Load when the user wants to write a skill.
metadata:
  orchestration:
    category: tooling
    triggers:
      task_types: ["documentation"]
      content_patterns: ["create skill", "write skill", "custom skill", "SKILL.md"]
    priority: 80
    scope: session
---

# Skill Guide

## Creating a Skill

1. Create a folder: `.agents/skills/my-skill/`
2. Add `SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill
description: What this skill does
metadata:
  orchestration:
    category: implementation
    triggers:
      file_patterns: ["*.kt"]
      task_types: ["code-generation"]
    priority: 50
    scope: project
---
```

3. Write markdown instructions after the frontmatter

## Orchestration Fields
- `category`: process | implementation | analysis | tooling
- `triggers.file_patterns`: Glob patterns for relevant files
- `triggers.task_types`: Task types that activate this skill
- `priority`: 0-100, higher wins in ties
- `scope`: file | module | project | session
- `conflicts_with`: Skill names to exclude when this one is active
- `depends_on`: Skill names that boost this skill's score
