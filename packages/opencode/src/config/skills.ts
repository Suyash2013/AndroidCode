import { Schema } from "effect"

export const Info = Schema.Struct({
  paths: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Additional paths to skill folders",
  }),
  urls: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "URLs to fetch skills from (e.g., https://example.com/.well-known/skills/)",
  }),
  auto_install_google_skills: Schema.optional(Schema.Boolean).annotate({
    description: "Automatically install Google's official Android skills on first use",
  }),
  max_active_skills: Schema.optional(Schema.Number).annotate({
    description: "Maximum number of skills to include in the system prompt per turn (default: 5)",
  }),
})

export type Info = Schema.Schema.Type<typeof Info>

export * as ConfigSkills from "./skills"
