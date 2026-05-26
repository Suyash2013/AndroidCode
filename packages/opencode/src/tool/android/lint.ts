import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { Log } from "@/util"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"
import { ChildProcess } from "effect/unstable/process"
import * as Stream from "effect/Stream"
import { scan } from "@/project/android-intelligence"
import { buildTaskPath } from "./gradle"
import DESCRIPTION from "./lint.txt" with { type: "text" }

const log = Log.create({ service: "LintTool" })

export const Parameters = Schema.Struct({
  module: Schema.optional(Schema.String).annotate({
    description: "Module to lint (e.g. ':app'). Default: the root 'lint' task across all modules.",
  }),
  variant: Schema.optional(Schema.String).annotate({
    description: "Build variant, e.g. 'debug'. Determines the lint task name and report file.",
  }),
  baseline: Schema.optional(Schema.String).annotate({
    description: "Path to a lint baseline file to compare against.",
  }),
})

type LintMetadata = Record<string, unknown>

export interface LintIssue {
  id?: string
  severity?: string
  category?: string
  message?: string
  file?: string
  line?: number
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function attr(source: string, name: string): string | undefined {
  const m = source.match(new RegExp(`\\b${name}="([^"]*)"`))
  return m ? decodeXmlEntities(m[1]) : undefined
}

// Pure helper so report parsing is unit-testable without running Gradle.
export function parseLintXml(xml: string): LintIssue[] {
  const issues: LintIssue[] = []
  const issueRe = /<issue\b([^>]*?)>([\s\S]*?)<\/issue>|<issue\b([^>]*?)\/>/g
  let m: RegExpExecArray | null
  while ((m = issueRe.exec(xml)) !== null) {
    const attrs = m[1] ?? m[3] ?? ""
    const body = m[2] ?? ""
    const loc = body.match(/<location\b([^>]*?)\/?>/)
    const locAttrs = loc?.[1] ?? ""
    const lineStr = attr(locAttrs, "line")
    issues.push({
      id: attr(attrs, "id"),
      severity: attr(attrs, "severity"),
      category: attr(attrs, "category"),
      message: attr(attrs, "message"),
      file: attr(locAttrs, "file"),
      line: lineStr ? Number(lineStr) : undefined,
    })
  }
  return issues
}

function lintTaskName(variant?: string): string {
  if (!variant) return "lint"
  return `lint${variant.charAt(0).toUpperCase()}${variant.slice(1)}`
}

function moduleDir(cwd: string, module?: string): string {
  if (!module) return cwd
  return path.join(cwd, module.replace(/^:/, "").replace(/:/g, path.sep))
}

function readLintReport(cwd: string, module: string | undefined, variant?: string): string | null {
  const dir = path.join(moduleDir(cwd, module), "build", "reports")
  const candidates = [
    variant ? `lint-results-${variant}.xml` : undefined,
    "lint-results-debug.xml",
    "lint-results.xml",
  ].filter((c): c is string => !!c)
  for (const name of candidates) {
    const p = path.join(dir, name)
    try {
      return fs.readFileSync(p, "utf-8")
    } catch {
      continue
    }
  }
  return null
}

export const LintTool = Tool.define(
  "lint",
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner

    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.scoped(
          Effect.gen(function* () {
            const { module, variant, baseline } = params
            const instance = yield* InstanceState.context
            const cwd = instance.directory

            const profile = scan(cwd)
            const wrapperName = process.platform === "win32" ? "gradlew.bat" : "gradlew"
            const executable = profile.hasWrapper ? path.join(cwd, wrapperName) : "gradle"
            const taskPath = buildTaskPath(lintTaskName(variant), module)
            const args = [taskPath]
            if (baseline) args.push(`-Plint.baseline=${baseline}`)
            const title = `lint ${taskPath}`

            const command = ChildProcess.make(executable, args, { cwd })
            const handle = yield* spawner.spawn(command).pipe(Effect.catch(() => Effect.succeed(null)))
            if (!handle) {
              log.info("lint launch failed", { executable })
              return {
                title,
                output: `Failed to launch Gradle (${executable}) to run lint.`,
                metadata: { error: true, code: "GRADLE_UNAVAILABLE" } as LintMetadata,
              }
            }

            const stdout = yield* Stream.mkString(Stream.decodeText(handle.stdout)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const stderr = yield* Stream.mkString(Stream.decodeText(handle.stderr)).pipe(
              Effect.catch(() => Effect.succeed("")),
            )
            const exitCode = yield* handle.exitCode.pipe(Effect.catch(() => Effect.succeed(-1)))

            const xml = yield* Effect.sync(() => readLintReport(cwd, module, variant))
            const issues = xml ? parseLintXml(xml) : []
            const rawOutput = [stdout, stderr].filter((s) => s.length > 0).join("\n")

            return {
              title,
              output: xml
                ? `${issues.length} lint issue(s) found.\n${rawOutput}`
                : rawOutput || "(no lint report found)",
              metadata: {
                issues,
                count: issues.length,
                reportFound: xml !== null,
                exitCode,
                error: exitCode !== 0,
              } as LintMetadata,
            }
          }).pipe(Effect.orDie),
        ),
    }
  }),
)
