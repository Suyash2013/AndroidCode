import { describe, expect } from "bun:test"
import { Effect, Layer, Option } from "effect"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import path from "path"
import { pathToFileURL } from "url"
import { Account } from "../../src/account/account"
import { Auth } from "../../src/auth"
import { Bus } from "../../src/bus"
import { Config } from "../../src/config/config"
import { Env } from "../../src/env"
import { RuntimeFlags } from "../../src/effect/runtime-flags"
import { Plugin } from "../../src/plugin/index"
import { provideTmpdirInstance } from "../fixture/fixture"
import { testEffect } from "../lib/effect"
import { NpmTest } from "../fake/npm"

const emptyAccount = Layer.mock(Account.Service)({
  active: () => Effect.succeed(Option.none()),
  activeOrg: () => Effect.succeed(Option.none()),
})
const emptyAuth = Layer.mock(Auth.Service)({
  all: () => Effect.succeed({}),
})
const configLayer = Config.layer.pipe(
  Layer.provide(EffectFlock.defaultLayer),
  Layer.provide(AppFileSystem.defaultLayer),
  Layer.provide(Env.defaultLayer),
  Layer.provide(emptyAuth),
  Layer.provide(emptyAccount),
  Layer.provide(NpmTest.noop),
)
const it = testEffect(
  Layer.mergeAll(
    Plugin.layer.pipe(
      Layer.provide(Bus.layer),
      Layer.provide(configLayer),
      Layer.provide(RuntimeFlags.layer({ disableDefaultPlugins: true })),
    ),
    CrossSpawnSpawner.defaultLayer,
  ),
)

const preExecuteHook = "android.tool.preExecute"
const postExecuteHook = "android.tool.postExecute"

function withPlugin(source: string, self: Effect.Effect<unknown, unknown, unknown>) {
  return provideTmpdirInstance((dir) =>
    Effect.gen(function* () {
      const file = path.join(dir, "plugin.ts")
      yield* Effect.all(
        [
          Effect.promise(() => Bun.write(file, source)),
          Effect.promise(() =>
            Bun.write(
              path.join(dir, "opencode.json"),
              JSON.stringify(
                {
                  $schema: "https://opencode.ai/config.json",
                  plugin: [pathToFileURL(file).href],
                },
                null,
                2,
              ),
            ),
          ),
        ],
        { discard: true, concurrency: 2 },
      )
      return yield* self
    }),
  )
}

const triggerHook = Effect.fn("triggerAndroidTool")(function* (
  hookName: string,
  input: Record<string, unknown>,
) {
  const plugin = yield* Plugin.Service
  const output: string[] = []
  yield* plugin.trigger(hookName, input, { output })
  return output
})

describe("android.tool plugin hooks", () => {
  it.live("preExecute hook fires before tool execution", () =>
    withPlugin(
      [
        "export default async () => ({",
        `  ${JSON.stringify(preExecuteHook)}: async (input, output) => {`,
        `    output.output.push("pre:" + input.tool)`,
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        const out = yield* triggerHook(preExecuteHook, { tool: "gradle", args: ["build"] })
        expect(out).toEqual(["pre:gradle"])
      }),
    ),
  )

  it.live("postExecute hook fires after tool execution with result", () =>
    withPlugin(
      [
        "export default async () => ({",
        `  ${JSON.stringify(postExecuteHook)}: async (input, output) => {`,
        `    output.output.push("post:" + input.tool + ":" + input.exitCode)`,
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        const out = yield* triggerHook(postExecuteHook, { tool: "adb", exitCode: 0 })
        expect(out).toEqual(["post:adb:0"])
      }),
    ),
  )

  it.live("both hooks fire in sequence for a full tool lifecycle", () =>
    withPlugin(
      [
        "export default async () => ({",
        `  ${JSON.stringify(preExecuteHook)}: async (input, output) => {`,
        `    output.output.push("pre:" + input.tool)`,
        "  },",
        `  ${JSON.stringify(postExecuteHook)}: async (input, output) => {`,
        `    output.output.push("post:" + input.tool + ":" + input.exitCode)`,
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        const plugin = yield* Plugin.Service
        const lifecycle: string[] = []
        yield* plugin.trigger(preExecuteHook, { tool: "sdkmanager" }, { output: lifecycle })
        yield* plugin.trigger(postExecuteHook, { tool: "sdkmanager", exitCode: 0 }, { output: lifecycle })
        expect(lifecycle).toEqual(["pre:sdkmanager", "post:sdkmanager:0"])
      }),
    ),
  )

  it.live("plugin without android hooks does not crash when hooks trigger", () =>
    withPlugin(
      [
        "export default async () => ({",
        `  "experimental.chat.system.transform": (_input, output) => {`,
        `    output.system.unshift("other")`,
        "  },",
        "})",
        "",
      ].join("\n"),
      Effect.gen(function* () {
        const out = yield* triggerHook(preExecuteHook, { tool: "gradle" })
        expect(out).toEqual([])
      }),
    ),
  )

  it.live("multiple plugins can register for the same android hook", () =>
    provideTmpdirInstance((dir) =>
      Effect.gen(function* () {
        const p1 = path.join(dir, "plugin1.ts")
        const p2 = path.join(dir, "plugin2.ts")
        yield* Effect.all(
          [
            Effect.promise(() =>
              Bun.write(
                p1,
                [
                  "export default async () => ({",
                  `  ${JSON.stringify(preExecuteHook)}: async (input, output) => {`,
                  `    output.output.push("p1:" + input.tool)`,
                  "  },",
                  "})",
                  "",
                ].join("\n"),
              ),
            ),
            Effect.promise(() =>
              Bun.write(
                p2,
                [
                  "export default async () => ({",
                  `  ${JSON.stringify(preExecuteHook)}: async (input, output) => {`,
                  `    output.output.push("p2:" + input.tool)`,
                  "  },",
                  "})",
                  "",
                ].join("\n"),
              ),
            ),
            Effect.promise(() =>
              Bun.write(
                path.join(dir, "opencode.json"),
                JSON.stringify(
                  {
                    $schema: "https://opencode.ai/config.json",
                    plugin: [pathToFileURL(p1).href, pathToFileURL(p2).href],
                  },
                  null,
                  2,
                ),
              ),
            ),
          ],
          { discard: true, concurrency: 3 },
        )
        const plugin = yield* Plugin.Service
        const output: string[] = []
        yield* plugin.trigger(preExecuteHook, { tool: "gradle" }, { output })
        expect(output.toSorted()).toEqual(["p1:gradle", "p2:gradle"])
      }),
    ),
  )
})
