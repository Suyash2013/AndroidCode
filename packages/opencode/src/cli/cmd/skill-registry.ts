import { Effect, Layer, ManagedRuntime } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { effectCmd } from "../effect-cmd"
import { SkillRegistry } from "@/skill/registry"

const registryRuntime = ManagedRuntime.make(SkillRegistry.layer.pipe(Layer.provide(FetchHttpClient.layer)))

export const SkillSearchCommand = effectCmd({
  command: "skills search <query>",
  describe: "search for skills in the AndroidCode registry",
  instance: false,
  handler: Effect.fn("Cli.SkillSearch")(function* (args) {
    const { query } = args as unknown as { query: string }
    const results = yield* Effect.promise(() =>
      registryRuntime.runPromise(SkillRegistry.Service.use((svc) => svc.search(query))),
    )

    if (results.length === 0) {
      console.log(`No skills found matching "${query}"`)
      return
    }

    console.log(`\nSkills matching "${query}":\n`)
    for (const skill of results) {
      console.log(`  ${skill.name}@${skill.version}`)
      console.log(`  ${skill.description}\n`)
    }
  }),
})
