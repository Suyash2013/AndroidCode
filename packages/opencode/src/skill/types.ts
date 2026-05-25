import { Schema } from "effect"
import { OrchestrationSchema } from "./orchestration"

export const Info = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.String),
  location: Schema.String,
  content: Schema.String,
  orchestration: Schema.optional(OrchestrationSchema),
})
export type Info = Schema.Schema.Type<typeof Info>

export interface ScoredSkill {
  skill: Info
  score: number
  reasons: string[]
}
