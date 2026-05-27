import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { scan } from "@/project/android-intelligence"
import DESCRIPTION from "./resources.txt" with { type: "text" }

export const Parameters = Schema.Struct({
  module: Schema.optional(Schema.String).annotate({
    description: "Module whose res/ directory to inspect (e.g. ':app'). Defaults to the app module.",
  }),
  type: Schema.optional(Schema.String).annotate({
    description: "Filter to a single resource type, e.g. 'values', 'layout', 'drawable', 'mipmap'.",
  }),
})

type ResourcesMetadata = Record<string, unknown>

export interface ResourceTypeInfo {
  type: string
  qualifiers: string[]
}

// Pure helper: split a res/ subdirectory name into its base type and any
// configuration qualifiers (e.g. "values-night-v23" -> values + [night, v23]).
export function parseResourceDir(dirName: string): ResourceTypeInfo {
  const [type, ...qualifiers] = dirName.split("-")
  return { type, qualifiers }
}

export interface ResourceSummary {
  byType: Record<string, { dirs: string[]; fileCount: number }>
}

function moduleDir(cwd: string, module?: string): string {
  if (!module) return cwd
  return path.join(cwd, module.replace(/^:/, "").replace(/:/g, path.sep))
}

function findResDir(cwd: string, module?: string): string | null {
  const candidates: string[] = []
  if (module) {
    candidates.push(path.join(moduleDir(cwd, module), "src", "main", "res"))
  } else {
    const modules = scan(cwd).modules
    const app = modules.find((mod) => mod.type === "app") ?? modules[0]
    if (app) candidates.push(path.join(cwd, app.relativePath, "src", "main", "res"))
    candidates.push(path.join(cwd, "app", "src", "main", "res"))
    candidates.push(path.join(cwd, "src", "main", "res"))
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

function summarizeResDir(resDir: string, filterType?: string): ResourceSummary {
  const byType: ResourceSummary["byType"] = {}
  for (const entry of fs.readdirSync(resDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const { type } = parseResourceDir(entry.name)
    if (filterType && type !== filterType) continue
    const dirPath = path.join(resDir, entry.name)
    const files = fs.readdirSync(dirPath).filter((f) => {
      try {
        return fs.statSync(path.join(dirPath, f)).isFile()
      } catch {
        return false
      }
    })
    byType[type] ??= { dirs: [], fileCount: 0 }
    byType[type].dirs.push(entry.name)
    byType[type].fileCount += files.length
  }
  return { byType }
}

export const ResourcesTool = Tool.define(
  "resources",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { module, type } = params
          const cwd = (yield* InstanceState.context).directory
          const resDir = yield* Effect.sync(() => findResDir(cwd, module))
          if (!resDir) {
            return {
              title: "resources",
              output: "No res/ directory found for the requested module.",
              metadata: { error: true, code: "RES_NOT_FOUND" } as ResourcesMetadata,
            }
          }
          const summary = yield* Effect.sync(() => summarizeResDir(resDir, type))
          const lines = Object.entries(summary.byType)
            .toSorted(([a], [b]) => a.localeCompare(b))
            .map(([t, info]) => `${t}: ${info.fileCount} file(s) across ${info.dirs.length} config dir(s)`)
          return {
            title: `resources ${path.relative(cwd, resDir)}`,
            output: lines.length ? lines.join("\n") : "(no resources found)",
            metadata: { path: resDir, ...summary } as ResourcesMetadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)
