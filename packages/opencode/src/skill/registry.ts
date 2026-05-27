import { Effect, Layer, Path, Schema, Context } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http"
import { withTransientReadRetry } from "@/util/effect-http-client"
import * as Log from "@opencode-ai/core/util/log"

const log = Log.create({ service: "skill-registry" })

const RegistrySkill = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  version: Schema.String,
  downloadUrl: Schema.String,
  checksum: Schema.String,
  orchestration: Schema.optional(
    Schema.Struct({
      task_type: Schema.optional(Schema.String),
      category: Schema.optional(Schema.String),
      version: Schema.optional(Schema.String),
    }),
  ),
})

const RegistryIndex = Schema.Struct({
  skills: Schema.Array(RegistrySkill),
})

export type RegistrySkill = Schema.Schema.Type<typeof RegistrySkill>

const DEFAULT_REGISTRY_URL = "https://androidcode.ai/skills/index.json"

export interface Interface {
  readonly search: (query: string) => Effect.Effect<RegistrySkill[]>
}

export class Service extends Context.Service<Service, Interface>()("@androidcode/SkillRegistry") {}

export const layer: Layer.Layer<Service, never, HttpClient.HttpClient> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const http = HttpClient.filterStatusOk(withTransientReadRetry(yield* HttpClient.HttpClient))

    const fetchIndex = () => {
      const url = process.env.ANDROIDCODE_SKILL_REGISTRY ?? DEFAULT_REGISTRY_URL
      return HttpClientRequest.get(url).pipe(
        http.execute,
        Effect.flatMap(HttpClientResponse.schemaBodyJson(RegistryIndex)),
        Effect.map((data) => data.skills),
        Effect.catch((err) => {
          log.warn("failed to fetch skill registry", { url, error: String(err) })
          return Effect.succeed([] as RegistrySkill[])
        }),
      )
    }

    const search = (query: string) =>
      Effect.gen(function* () {
        const skills = yield* fetchIndex()
        const q = query.toLowerCase()
        return skills
          .filter(
            (s: RegistrySkill) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q),
          )
          .toSorted((a: RegistrySkill, b: RegistrySkill) => a.name.localeCompare(b.name))
      })

    return Service.of({ search })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(FetchHttpClient.layer))

export * as SkillRegistry from "./registry"
