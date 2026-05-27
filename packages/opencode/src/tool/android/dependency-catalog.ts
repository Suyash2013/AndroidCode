import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { parseVersionCatalogFromPath } from "@/project/android-intelligence"
import DESCRIPTION from "./dependency-catalog.txt" with { type: "text" }

export const Parameters = Schema.Struct({
  action: Schema.Literals(["list", "get", "set"]).annotate({
    description: "'list' all versions/keys, 'get' a single version by key, or 'set' a version (writes the file).",
  }),
  key: Schema.optional(Schema.String).annotate({
    description: "Version key in the [versions] table (required for 'get' and 'set'), e.g. 'kotlin'.",
  }),
  value: Schema.optional(Schema.String).annotate({
    description: "New version string (required for 'set'), e.g. '2.0.21'.",
  }),
})

type CatalogMetadata = Record<string, unknown>

// Pure helper: set (or insert) a key in the [versions] table of a
// libs.versions.toml, preserving the rest of the file. Returns the new content.
export function setCatalogVersion(content: string, key: string, value: string): string {
  const lines = content.split("\n")
  const versionsIdx = lines.findIndex((l) => l.trim() === "[versions]")

  // No [versions] table: prepend one.
  if (versionsIdx === -1) {
    return `[versions]\n${key} = "${value}"\n\n${content}`
  }

  // Find the extent of the [versions] table (until the next [section] or EOF).
  let end = lines.length
  for (let i = versionsIdx + 1; i < lines.length; i++) {
    if (/^\s*\[/.test(lines[i])) {
      end = i
      break
    }
  }

  const keyRe = new RegExp(`^\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`)
  for (let i = versionsIdx + 1; i < end; i++) {
    if (keyRe.test(lines[i])) {
      lines[i] = `${key} = "${value}"`
      return lines.join("\n")
    }
  }

  // Key not present: insert at the end of the table (after the last non-blank line).
  let insertAt = end
  while (insertAt > versionsIdx + 1 && lines[insertAt - 1].trim() === "") insertAt--
  lines.splice(insertAt, 0, `${key} = "${value}"`)
  return lines.join("\n")
}

function findCatalog(cwd: string): string | null {
  const p = path.join(cwd, "gradle", "libs.versions.toml")
  return fs.existsSync(p) ? p : null
}

export const DependencyCatalogTool = Tool.define(
  "dependency-catalog",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { action, key, value } = params
          const cwd = (yield* InstanceState.context).directory
          const catalogPath = yield* Effect.sync(() => findCatalog(cwd))
          if (!catalogPath) {
            return {
              title: "dependency-catalog",
              output: "No gradle/libs.versions.toml found in this project.",
              metadata: { error: true, code: "CATALOG_NOT_FOUND" } as CatalogMetadata,
            }
          }

          if (action === "set") {
            if (!key || value === undefined) {
              return {
                title: "dependency-catalog set",
                output: "Both 'key' and 'value' are required for the 'set' action.",
                metadata: { error: true, code: "MISSING_ARGS" } as CatalogMetadata,
              }
            }
            const content = yield* Effect.sync(() => fs.readFileSync(catalogPath, "utf-8"))
            const updated = setCatalogVersion(content, key, value)
            yield* Effect.sync(() => fs.writeFileSync(catalogPath, updated))
            return {
              title: `dependency-catalog set ${key}`,
              output: `Set [versions] ${key} = "${value}" in ${path.relative(cwd, catalogPath)}.`,
              metadata: { path: catalogPath, key, value } as CatalogMetadata,
            }
          }

          const catalog = parseVersionCatalogFromPath(catalogPath)
          if (!catalog) {
            return {
              title: "dependency-catalog",
              output: "Failed to parse the version catalog.",
              metadata: { error: true, code: "PARSE_FAILED" } as CatalogMetadata,
            }
          }

          if (action === "get") {
            if (!key) {
              return {
                title: "dependency-catalog get",
                output: "'key' is required for the 'get' action.",
                metadata: { error: true, code: "MISSING_ARGS" } as CatalogMetadata,
              }
            }
            const found = catalog.versions[key]
            return {
              title: `dependency-catalog get ${key}`,
              output: found !== undefined ? `${key} = ${found}` : `Version key '${key}' not found.`,
              metadata: { key, value: found } as CatalogMetadata,
            }
          }

          // list
          const versionLines = Object.entries(catalog.versions).map(([k, v]) => `  ${k} = ${v}`)
          return {
            title: "dependency-catalog list",
            output: [
              `versions (${Object.keys(catalog.versions).length}):`,
              ...versionLines,
              `libraries: ${catalog.libraryKeys.length}, plugins: ${catalog.pluginKeys.length}`,
            ].join("\n"),
            metadata: {
              path: catalogPath,
              versions: catalog.versions,
              libraryKeys: catalog.libraryKeys,
              pluginKeys: catalog.pluginKeys,
            } as CatalogMetadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)
