import { Effect, Schema } from "effect"
import * as Tool from "../tool"
import { Service as AndroidProbeService } from "./probe"
import { InstanceState } from "@/effect/instance-state"
import { Log } from "@/util"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import * as Stream from "effect/Stream"

const log = Log.create({ service: "AndroidTool" })

export const Parameters = Schema.Struct({
  subcommand: Schema.String.annotate({
    description: "The android CLI subcommand (e.g., 'sdk', 'emulator', 'run', 'describe')",
  }),
  args: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Arguments for the subcommand as a list of strings",
  }),
})

type AndroidMetadata = Record<string, unknown>

export const AndroidTool = Tool.define(
  "android",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner
    const probe = yield* AndroidProbeService

    return {
      description:
        "Wrapper for Google's official Android CLI. Used for SDK, emulator, deployment, and layout introspection.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.scoped(
          Effect.gen(function* () {
            const { subcommand, args = [] } = params

            const status = yield* probe.status()

            if (!status.present || !status.availableSubcommands.includes(subcommand)) {
              if (subcommand === "emulator" && process.platform === "win32") {
                log.info("android emulator unavailable on Windows; using fallback binary path")

                const avdCommand = ChildProcess.make("avdmanager", args)
                const avdHandle = yield* spawner.spawn(avdCommand).pipe(
                  Effect.catch(() => Effect.succeed(null)),
                )

                if (avdHandle) {
                  const avdOut = yield* Stream.mkString(Stream.decodeText(avdHandle.stdout)).pipe(
                    Effect.catch(() => Effect.succeed("")),
                  )
                  if (avdOut) {
                    return {
                      title: "Android CLI: emulator (Windows fallback)",
                      output: avdOut || "(no output)",
                      metadata: {
                        fallback: true,
                        originalCommand: "android emulator",
                      } as AndroidMetadata,
                    }
                  }
                }

                const emulatorCommand = ChildProcess.make("emulator", args)
                const emulatorHandle = yield* spawner.spawn(emulatorCommand).pipe(
                  Effect.catch(() => Effect.succeed(null)),
                )

                if (emulatorHandle) {
                  const emuOut = yield* Stream.mkString(Stream.decodeText(emulatorHandle.stdout)).pipe(
                    Effect.catch(() => Effect.succeed("")),
                  )
                  if (emuOut) {
                    return {
                      title: "Android CLI: emulator (Windows fallback)",
                      output: emuOut || "(no output)",
                      metadata: {
                        fallback: true,
                        originalCommand: "android emulator",
                      } as AndroidMetadata,
                    }
                  }
                }

                return {
                  title: "Android CLI: emulator (Windows fallback)",
                  output: "Neither 'avdmanager' nor 'emulator' fallback binary is available on this system.",
                  metadata: {
                    fallback: true,
                    originalCommand: "android emulator",
                    error: true,
                    code: "ANDROID_CLI_UNAVAILABLE",
                  } as AndroidMetadata,
                }
              }

              return {
                title: `Android CLI: ${subcommand}`,
                output: `The 'android ${subcommand}' command is not available on this system.`,
                metadata: {
                  error: true,
                  code: "ANDROID_CLI_UNAVAILABLE",
                  message: `Subcommand '${subcommand}' is not available.`,
                  recoverable: false,
                } as AndroidMetadata,
              }
            }

            const instance = yield* InstanceState.context
            const command = ChildProcess.make("android", [subcommand, ...args], {
              cwd: instance.directory,
            })

            const handle = yield* spawner.spawn(command)

            const stdout = yield* Stream.mkString(Stream.decodeText(handle.stdout)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const stderr = yield* Stream.mkString(Stream.decodeText(handle.stderr)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const exitCode = yield* handle.exitCode.pipe(
              Effect.catch(() => Effect.succeed(-1)),
            )

            if (exitCode !== 0) {
              return {
                title: `Android CLI: ${subcommand}`,
                output: stderr || stdout || `Command 'android ${subcommand}' failed with exit code ${exitCode}.`,
                metadata: {
                  error: true,
                  code: "BUILD_FAILED",
                  message: `Command 'android ${subcommand}' failed.`,
                  recoverable: true,
                  exitCode,
                } as AndroidMetadata,
              }
            }

            return {
              title: `Android CLI: ${subcommand}`,
              output: stdout || "(no output)",
              metadata: {
                error: false,
                exitCode,
              } as AndroidMetadata,
            }
          }).pipe(Effect.orDie),
        ),
    }
  }),
)
