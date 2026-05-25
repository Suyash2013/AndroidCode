import { Schema } from "effect"

export const TriggersSchema = Schema.Struct({
  file_patterns: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Glob patterns for files that trigger this skill",
  }),
  content_patterns: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Regex patterns for content that triggers this skill",
  }),
  task_types: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Task types that trigger this skill (e.g., debugging, code-generation)",
  }),
  tools_in_use: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Tool names that trigger this skill",
  }),
}).annotate({ identifier: "SkillTriggers" })

export const OrchestrationSchema = Schema.Struct({
  category: Schema.optional(
    Schema.Literals(["process", "implementation", "analysis", "tooling"]),
  ).annotate({ description: "Skill category" }),
  triggers: Schema.optional(TriggersSchema).annotate({
    description: "Trigger conditions",
  }),
  priority: Schema.optional(Schema.Number).annotate({
    description: "Priority 0-100 for tiebreaking",
  }),
  conflicts_with: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Skill names that conflict with this skill",
  }),
  depends_on: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Skill names this skill depends on",
  }),
  scope: Schema.optional(Schema.Literals(["file", "module", "project", "session"])).annotate({
    description: "Scope of this skill",
  }),
  version: Schema.optional(Schema.String).annotate({
    description: "Skill version",
  }),
}).annotate({ identifier: "SkillOrchestration" })

export type Orchestration = Schema.Schema.Type<typeof OrchestrationSchema>
