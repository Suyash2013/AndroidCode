import { Effect, Schema } from "effect"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { Log } from "@/util"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import * as Stream from "effect/Stream"
import DESCRIPTION from "./apk-analyzer.txt" with { type: "text" }

const log = Log.create({ service: "ApkAnalyzerTool" })

export const Parameters = Schema.Struct({
  apkPath: Schema.String.annotate({
    description: "Path to the .apk file to analyze (absolute, or relative to the project root).",
  }),
  action: Schema.optional(Schema.Literals(["summary", "manifest", "filesize", "permissions"])).annotate({
    description: "What to inspect. Defaults to 'summary' (package name, versionCode, versionName).",
  }),
})

type ApkMetadata = Record<string, unknown>

// Pure helper: map the chosen action to the `apkanalyzer` subcommand args.
export function apkAnalyzerArgs(apkPath: string, action: string): string[] {
  switch (action) {
    case "manifest":
      return ["manifest", "print", apkPath]
    case "filesize":
      return ["apk", "file-size", apkPath]
    case "permissions":
      return ["manifest", "permissions", apkPath]
    case "summary":
    default:
      return ["apk", "summary", apkPath]
  }
}

export const ApkAnalyzerTool = Tool.define(
  "apk-analyzer",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.scoped(
          Effect.gen(function* () {
            const action = params.action ?? "summary"
            const cwd = (yield* InstanceState.context).directory
            const args = apkAnalyzerArgs(params.apkPath, action)
            const title = `apk-analyzer ${action}`

            const command = ChildProcess.make("apkanalyzer", args, { cwd })
            const handle = yield* spawner.spawn(command).pipe(Effect.catch(() => Effect.succeed(null)))
            if (!handle) {
              log.info("apkanalyzer launch failed")
              return {
                title,
                output:
                  "apkanalyzer CLI not found. Install it via the Android SDK command-line tools " +
                  "(cmdline-tools/latest/bin/apkanalyzer) and ensure it is on PATH.",
                metadata: { error: true, code: "APKANALYZER_UNAVAILABLE" } as ApkMetadata,
              }
            }

            const stdout = yield* Stream.mkString(Stream.decodeText(handle.stdout)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const stderr = yield* Stream.mkString(Stream.decodeText(handle.stderr)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const exitCode = yield* handle.exitCode.pipe(Effect.catch(() => Effect.succeed(-1)))

            return {
              title,
              output: [stdout, stderr].filter((s) => s.length > 0).join("\n") || "(no output)",
              metadata: { action, exitCode, error: exitCode !== 0 } as ApkMetadata,
            }
          }).pipe(Effect.orDie),
        ),
    }
  }),
)
