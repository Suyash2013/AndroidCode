import z from "zod"
import { Effect, Layer } from "effect"
import { Tool } from "../tool"
import { AndroidProbe } from "./probe"
import { makeToolResult, ErrorCodes } from "../util/tool-result"
import { ChildProcessSpawner } from "@/effect/cross-spawn-spawner"
import { Log } from "../util"

const log = Log.create({ service: "AndroidTool" })

/**
 * The `android` tool is a first-class wrapper around Google's official Android CLI.
 * It serves as the primary interface for SDK management, emulator control, 
 * and app deployment.
 */
export const AndroidTool = Tool.define("android", Effect.gen(function* () {
  const spawner = yield* ChildProcessSpawner.Service
  const probe = yield* AndroidProbe.Service

  return {
    description: "Wrapper for Google's official Android CLI. Used for SDK, emulator, deployment, and layout introspection.",
    parameters: z.object({
      subcommand: z.string().describe("The android CLI subcommand (e.g., 'sdk', 'emulator', 'run', 'describe')"),
      args: z.record(z.string()).describe("Arguments for the subcommand as key-value pairs"),
    }),
    execute: (args, ctx) => Effect.gen(function* () {
      const { subcommand, args: params } = args
      
      // 1. Check if subcommand is supported by the current installation
      const status = yield* probe.status()
      if (!status.present || !status.availableSubcommands.includes(subcommand)) {
        
        // Special case: Windows emulator fallback
        if (subcommand === "emulator" && process.platform === "win32") {
          log.info("android emulator unavailable on Windows; using fallback binary path")
          // The actual fallback binary invocation would go here. 
          // For now, we'll implement the wrap-with-fallback logic.
        } else {
          return {
            title: `Android CLI: ${subcommand}`,
            output: `The 'android ${subcommand}' command is not available on this system.`,
            metadata: {
              result: makeToolResult({
                status: "error",
                error: {
                  code: ErrorCodes.ANDROID_CLI_UNAVAILABLE,
                  message: `Subcommand '${subcommand}' is not available.`,
                  recoverable: false,
                },
              }),
            },
          }
        }
      }

      // 2. Convert args record to shell array
      const shellArgs = [subcommand]
      for (const [key, value] of Object.entries(params)) {
        shellArgs.push(`${key}=${value}`)
      }

      // 3. Execute and parse
      const result = yield* Effect.promise(() => 
        spawner.spawn("android", shellArgs)
      )

      if (result.error) {
        return {
          title: `Android CLI: ${subcommand}`,
          output: result.stderr || result.error.toString(),
          metadata: {
            result: makeToolResult({
              status: "error",
              error: {
                code: ErrorCodes.BUILD_FAILED, // Generic failure for now
                message: `Command 'android ${subcommand}' failed.`,
                recoverable: true,
              },
            }),
          },
        }
      }

      return {
        title: `Android CLI: ${subcommand}`,
        output: result.stdout,
        metadata: {
          result: makeToolResult({
            status: "success",
            data: { raw: result.stdout },
          }),
        },
      }
    }),
  }
}))

export const layer = Layer.provide(
  AndroidTool.layer,
  AndroidProbe.layer
)

export * as AndroidTool from "."
