import { describe, expect, test } from "bun:test"
import { Effect, Layer, Context } from "effect"
import { AndroidTool } from "../../../src/tool/android/android"
import { Service as AndroidProbeService, type AndroidProbeResult } from "../../../src/tool/android/probe"
import { CrossSpawnSpawner } from "@opencode-ai/core/cross-spawn-spawner"
import { Truncate } from "../../../src/tool/truncate"
import { Agent } from "../../../src/agent/agent"

function makeProbeLayer(result: AndroidProbeResult) {
  return Layer.succeed(AndroidProbeService, AndroidProbeService.of({ status: () => Effect.succeed(result) }))
}

// Minimal mock layers to avoid heavy Agent/Truncate initialization
const mockTruncateLayer = Layer.succeed(
  Truncate.Service,
  Truncate.Service.of({
    limits: () => Effect.succeed({ maxLines: 2000, maxBytes: 51200 }),
    output: (output: string) => Effect.succeed({ content: output, truncated: false }),
    write: () => Effect.succeed("/tmp/truncated"),
  } as any),
)

const mockAgentLayer = Layer.succeed(
  Agent.Service,
  Agent.Service.of({
    get: () => Effect.succeed({ name: "build", mode: "primary", permission: [], options: {} } as any),
    list: () => Effect.succeed([]),
    defaultInfo: () => Effect.succeed({ name: "build", mode: "primary", permission: [], options: {} } as any),
    defaultAgent: () => Effect.succeed("build"),
    generate: () => Effect.die("not implemented"),
  }),
)

describe("AndroidTool", () => {
  test("returns error when CLI is not present", async () => {
    const probeLayer = makeProbeLayer({ present: false, availableSubcommands: [], platformCaveats: [] })
    const layers = Layer.mergeAll(CrossSpawnSpawner.defaultLayer, mockTruncateLayer, mockAgentLayer, probeLayer)

    const toolInfo = await Effect.runPromise(AndroidTool.pipe(Effect.provide(layers)))
    const tool = await Effect.runPromise(toolInfo.init().pipe(Effect.provide(layers)))

    const result = await Effect.runPromise(
      Effect.scoped(
        tool.execute({ subcommand: "sdk", args: [] }, {
          directory: "/tmp",
          worktree: "/tmp",
          sessionID: "test",
          callID: "test",
          messageID: "test",
          messages: [],
          ask: () => Effect.void,
          metadata: () => Effect.void,
          abort: new AbortController(),
          extra: {},
        } as any),
      ).pipe(Effect.provide(layers)),
    )

    expect(result.metadata.error).toBe(true)
    expect(result.metadata.code).toBe("ANDROID_CLI_UNAVAILABLE")
  })

  test("returns error for unavailable subcommand", async () => {
    const probeLayer = makeProbeLayer({ present: true, version: "1.0.0", availableSubcommands: ["sdk"], platformCaveats: [] })
    const layers = Layer.mergeAll(CrossSpawnSpawner.defaultLayer, mockTruncateLayer, mockAgentLayer, probeLayer)

    const toolInfo = await Effect.runPromise(AndroidTool.pipe(Effect.provide(layers)))
    const tool = await Effect.runPromise(toolInfo.init().pipe(Effect.provide(layers)))

    const result = await Effect.runPromise(
      Effect.scoped(
        tool.execute({ subcommand: "emulator", args: [] }, {
          directory: "/tmp",
          worktree: "/tmp",
          sessionID: "test",
          callID: "test",
          messageID: "test",
          messages: [],
          ask: () => Effect.void,
          metadata: () => Effect.void,
          abort: new AbortController(),
          extra: {},
        } as any),
      ).pipe(Effect.provide(layers)),
    )

    expect(result.metadata.error).toBe(true)
    expect(result.metadata.code).toBe("ANDROID_CLI_UNAVAILABLE")
  })
})
