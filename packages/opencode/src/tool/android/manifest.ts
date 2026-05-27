import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { scan } from "@/project/android-intelligence"
import DESCRIPTION from "./manifest.txt" with { type: "text" }

export const Parameters = Schema.Struct({
  module: Schema.optional(Schema.String).annotate({
    description: "Module whose AndroidManifest.xml to read (e.g. ':app'). Defaults to the app module.",
  }),
})

type ManifestMetadata = Record<string, unknown>

export interface ManifestInfo {
  package?: string
  permissions: string[]
  activities: string[]
  services: string[]
  receivers: string[]
  providers: string[]
  exportedComponents: string[]
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
  // `android:name` etc. — match the namespaced or bare attribute.
  const m = source.match(new RegExp(`(?:android:)?${name}="([^"]*)"`))
  return m ? decodeXmlEntities(m[1]) : undefined
}

// Pure helper so manifest parsing is unit-testable without a project on disk.
export function parseManifest(xml: string): ManifestInfo {
  const info: ManifestInfo = {
    package: undefined,
    permissions: [],
    activities: [],
    services: [],
    receivers: [],
    providers: [],
    exportedComponents: [],
  }

  const manifestTag = xml.match(/<manifest\b([^>]*)>/)
  if (manifestTag) info.package = attr(manifestTag[1], "package")

  const permRe = /<uses-permission\b([^>]*?)\/?>/g
  let m: RegExpExecArray | null
  while ((m = permRe.exec(xml)) !== null) {
    const name = attr(m[1], "name")
    if (name) info.permissions.push(name)
  }

  const componentKinds: Array<[keyof ManifestInfo, string]> = [
    ["activities", "activity"],
    ["services", "service"],
    ["receivers", "receiver"],
    ["providers", "provider"],
  ]
  for (const [bucket, tag] of componentKinds) {
    const re = new RegExp(`<${tag}\\b([^>]*?)\\/?>`, "g")
    let c: RegExpExecArray | null
    while ((c = re.exec(xml)) !== null) {
      const name = attr(c[1], "name")
      if (!name) continue
      ;(info[bucket] as string[]).push(name)
      if (attr(c[1], "exported") === "true") info.exportedComponents.push(name)
    }
  }

  return info
}

function moduleDir(cwd: string, module?: string): string {
  if (!module) return cwd
  return path.join(cwd, module.replace(/^:/, "").replace(/:/g, path.sep))
}

function findManifest(cwd: string, module?: string): string | null {
  const candidates: string[] = []
  if (module) {
    candidates.push(path.join(moduleDir(cwd, module), "src", "main", "AndroidManifest.xml"))
  } else {
    const modules = scan(cwd).modules
    const app = modules.find((mod) => mod.type === "app") ?? modules[0]
    if (app) candidates.push(path.join(cwd, app.relativePath, "src", "main", "AndroidManifest.xml"))
    candidates.push(path.join(cwd, "app", "src", "main", "AndroidManifest.xml"))
    candidates.push(path.join(cwd, "src", "main", "AndroidManifest.xml"))
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

export const ManifestTool = Tool.define(
  "manifest",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { module } = params
          const cwd = (yield* InstanceState.context).directory
          const manifestPath = yield* Effect.sync(() => findManifest(cwd, module))
          if (!manifestPath) {
            return {
              title: "manifest",
              output: "No AndroidManifest.xml found for the requested module.",
              metadata: { error: true, code: "MANIFEST_NOT_FOUND" } as ManifestMetadata,
            }
          }
          const xml = yield* Effect.sync(() => fs.readFileSync(manifestPath, "utf-8"))
          const info = parseManifest(xml)
          return {
            title: `manifest ${path.relative(cwd, manifestPath)}`,
            output: [
              `package: ${info.package ?? "(unknown)"}`,
              `permissions: ${info.permissions.length}`,
              `activities: ${info.activities.length}, services: ${info.services.length}, receivers: ${info.receivers.length}, providers: ${info.providers.length}`,
              `exported components: ${info.exportedComponents.join(", ") || "(none)"}`,
            ].join("\n"),
            metadata: { path: manifestPath, ...info } as ManifestMetadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)
