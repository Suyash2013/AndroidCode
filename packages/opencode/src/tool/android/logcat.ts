import { Effect, Schema } from "effect"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { Log } from "@/util"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import * as Stream from "effect/Stream"
import DESCRIPTION from "./logcat.txt" with { type: "text" }

const log = Log.create({ service: "LogcatTool" })

const DEFAULT_LINES = 500

export const Parameters = Schema.Struct({
  packageName: Schema.String.annotate({
    description: "Application package name to filter by (e.g. 'com.example.app')",
  }),
  level: Schema.optional(Schema.Literals(["V", "D", "I", "W", "E", "F"])).annotate({
    description: "Minimum log level (V, D, I, W, E, F)",
  }),
  lines: Schema.optional(Schema.Number).annotate({
    description: `Maximum number of recent lines to return (default ${DEFAULT_LINES})`,
  }),
  since: Schema.optional(Schema.String).annotate({
    description: "Only show logs since this time, e.g. '10s' or '5m' ago",
  }),
})

type LogcatMetadata = Record<string, unknown>

export interface LogcatEntry {
  date: string
  time: string
  pid: string
  tid: string
  level: string
  tag: string
  message: string
}

// Android `threadtime` format: "MM-DD HH:MM:SS.mmm  PID  TID L TAG: message".
const LOGCAT_RE = /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.*?):\s?(.*)$/

// Pure helper so log-line parsing is unit-testable without a device.
export function parseLogcatLine(line: string): LogcatEntry | null {
  const m = LOGCAT_RE.exec(line)
  if (!m) return null
  return {
    date: m[1],
    time: m[2],
    pid: m[3],
    tid: m[4],
    level: m[5],
    tag: m[6].trim(),
    message: m[7],
  }
}

export const LogcatTool = Tool.define(
  "logcat",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner

    const run = (args: string[], cwd: string) =>
      Effect.gen(function* () {
        const handle = yield* spawner.spawn(ChildProcess.make("adb", args, { cwd })).pipe(
          Effect.catch(() => Effect.succeed(null)),
        )
        if (!handle) return null
        const stdout = yield* Stream.mkString(Stream.decodeText(handle.stdout)).pipe(
          Effect.catch(() => Effect.succeed("")),
        )
        const exitCode = yield* handle.exitCode.pipe(Effect.catch(() => Effect.succeed(-1)))
        return { stdout, exitCode }
      })

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.scoped(
          Effect.gen(function* () {
            const { packageName, level, lines = DEFAULT_LINES, since } = params
            const instance = yield* InstanceState.context
            const cwd = instance.directory

            const devices = yield* run(["devices"], cwd)
            const deviceLines = (devices?.stdout ?? "")
              .split("\n")
              .slice(1)
              .filter((l) => l.trim() && !l.startsWith("*"))
            if (!devices || deviceLines.length === 0) {
              log.info("no adb device connected")
              return {
                title: `logcat ${packageName}`,
                output: "No connected Android device or emulator was found (`adb devices` returned none).",
                metadata: { error: true, code: "NO_DEVICE" } as LogcatMetadata,
              }
            }

            // Resolve the package's PID so logcat can filter by it. Best-effort:
            // if the app is not running, fall back to an unfiltered dump.
            const pidResult = yield* run(["shell", "pidof", "-s", packageName], cwd)
            const pid = (pidResult?.stdout ?? "").trim().split(/\s+/)[0]

            const args = ["logcat", "-d", "-v", "threadtime"]
            if (pid) args.push(`--pid=${pid}`)
            if (since) args.push("-T", since)
            args.push("-t", String(lines))
            if (level) args.push(`*:${level}`)

            const result = yield* run(args, cwd)
            const raw = result?.stdout ?? ""
            const entries = raw
              .split("\n")
              .map((l) => parseLogcatLine(l))
              .filter((e): e is LogcatEntry => e !== null)

            return {
              title: `logcat ${packageName}`,
              output: raw || "(no log output)",
              metadata: {
                entries,
                count: entries.length,
                pid: pid || null,
                error: false,
              } as LogcatMetadata,
            }
          }).pipe(Effect.orDie),
        ),
    }
  }),
)
