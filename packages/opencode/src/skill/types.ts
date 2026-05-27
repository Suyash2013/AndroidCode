import { Schema } from "effect"
import { OrchestrationSchema } from "./orchestration"

export const Info = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  location: Schema.String,
  content: Schema.String,
  orchestration: Schema.optional(OrchestrationSchema),
  // Where the skill was loaded from: "local" (on-disk) or "cached" (pulled from
  // a URL). Drives version precedence — see skill/version.ts.
  source: Schema.optional(Schema.Literals(["local", "cached"])),
})
export type Info = Schema.Schema.Type<typeof Info>

export interface ScoredSkill {
  skill: Info
  score: number
  reasons: string[]
}
