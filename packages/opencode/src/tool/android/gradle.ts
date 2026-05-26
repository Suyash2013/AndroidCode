import { Effect, Schema } from "effect"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { Log } from "@/util"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import * as Stream from "effect/Stream"
import { scan } from "@/project/android-intelligence"
import DESCRIPTION from "./gradle.txt" with { type: "text" }

const log = Log.create({ service: "GradleTool" })

export const Parameters = Schema.Struct({
  task: Schema.String.annotate({
    description: "Gradle task name, e.g. ':app:assembleDebug', 'test', or 'lint'",
  }),
  flags: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Additional flags such as '--info', '--stacktrace', '--scan'",
  }),
  module: Schema.optional(Schema.String).annotate({
    description: "Target module (e.g. ':app'). If omitted, the task runs at the root.",
  }),
})

type GradleMetadata = Record<string, unknown>

export interface GradleParseResult {
  status: "success" | "failed" | "unknown"
  errors: string[]
  rawOutput: string
}

// Pure helper so the output classification is unit-testable without spawning.
export function parseGradleOutput(stdout: string, stderr: string, exitCode: number): GradleParseResult {
  const rawOutput = [stdout, stderr].filter((s) => s.length > 0).join("\n")
  let status: GradleParseResult["status"] = "unknown"
  if (/BUILD SUCCESSFUL/.test(rawOutput)) status = "success"
  else if (/BUILD FAILED/.test(rawOutput) || exitCode !== 0) status = "failed"

  const errors: string[] = []
  for (const line of rawOutput.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (
      trimmed.startsWith("e: ") || // Kotlin compiler error
      trimmed.startsWith("FAILURE:") ||
      /\berror:/i.test(trimmed) ||
      /> Task .* FAILED$/.test(trimmed) ||
      /\bFAILED$/.test(trimmed)
    ) {
      errors.push(trimmed)
    }
  }
  return { status, errors, rawOutput }
}

export function buildTaskPath(task: string, module?: string): string {
  if (!module || task.startsWith(":")) return task
  const mod = module.startsWith(":") ? module : `:${module}`
  return `${mod}:${task}`
}

export const GradleTool = Tool.define(
  "gradle",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.scoped(
          Effect.gen(function* () {
            const { task, flags = [], module } = params
            const instance = yield* InstanceState.context
            const cwd = instance.directory

            const profile = scan(cwd)
            const wrapperName = process.platform === "win32" ? "gradlew.bat" : "gradlew"
            const executable = profile.hasWrapper ? path.join(cwd, wrapperName) : "gradle"
            const taskPath = buildTaskPath(task, module)
            const title = `gradle ${taskPath}`

            const command = ChildProcess.make(executable, [taskPath, ...flags], { cwd })
            const handle = yield* spawner.spawn(command).pipe(Effect.catch(() => Effect.succeed(null)))
            if (!handle) {
              log.info("gradle launch failed", { executable })
              return {
                title,
                output: `Failed to launch Gradle (${executable}). Ensure a Gradle wrapper is present or 'gradle' is on PATH.`,
                metadata: { error: true, code: "GRADLE_UNAVAILABLE" } as GradleMetadata,
              }
            }

            const stdout = yield* Stream.mkString(Stream.decodeText(handle.stdout)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const stderr = yield* Stream.mkString(Stream.decodeText(handle.stderr)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const exitCode = yield* handle.exitCode.pipe(Effect.catch(() => Effect.succeed(-1)))

            const parsed = parseGradleOutput(stdout, stderr, exitCode)
            return {
              title,
              output: parsed.rawOutput || "(no output)",
              metadata: {
                status: parsed.status,
                errors: parsed.errors,
                exitCode,
                error: parsed.status === "failed",
                usedWrapper: profile.hasWrapper,
              } as GradleMetadata,
            }
          }).pipe(Effect.orDie),
        ),
    }
  }),
)
