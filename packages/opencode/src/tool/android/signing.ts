import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { scan } from "@/project/android-intelligence"
import DESCRIPTION from "./signing.txt" with { type: "text" }

export const Parameters = Schema.Struct({
  module: Schema.optional(Schema.String).annotate({
    description: "Module whose signing configuration to inspect (e.g. ':app'). Defaults to the app module.",
  }),
})

type SigningMetadata = Record<string, unknown>

export interface SigningConfigInfo {
  name: string
  hasStoreFile: boolean
  keyAlias?: string
  hasStorePassword: boolean
  hasKeyPassword: boolean
  // True when a password is assigned a bare string literal in the build script
  // (a security smell). Passwords sourced from env vars / Gradle properties are
  // not flagged. The actual password value is NEVER captured or emitted.
  hardcodedPassword: boolean
}

const LITERAL_ASSIGN = /=?\s*["'][^"']*["']/

function isHardcoded(body: string, field: string): boolean {
  // Matches `field "value"`, `field = "value"`, `field('value')` etc. We only
  // care whether the right-hand side is a string literal — we never read it.
  const re = new RegExp(`\\b${field}\\b\\s*\\(?${LITERAL_ASSIGN.source}`)
  return re.test(body)
}

function hasField(body: string, field: string): boolean {
  return new RegExp(`\\b${field}\\b`).test(body)
}

// Pure helper: extract signing configs from a Gradle build script with all
// secret values redacted. Returns structure + a hardcoded-secret flag only.
export function parseSigningConfigs(buildScript: string): SigningConfigInfo[] {
  const start = buildScript.indexOf("signingConfigs")
  if (start === -1) return []

  // Best-effort: scan from `signingConfigs` to the matching closing brace.
  let depth = 0
  let i = buildScript.indexOf("{", start)
  if (i === -1) return []
  const blockStart = i
  for (; i < buildScript.length; i++) {
    if (buildScript[i] === "{") depth++
    else if (buildScript[i] === "}") {
      depth--
      if (depth === 0) break
    }
  }
  const block = buildScript.slice(blockStart + 1, i)

  // Each config is either `create("name") { ... }` / `getByName("name") { ... }`
  // (Kotlin DSL) or `name { ... }` (Groovy). Capture name + body per config.
  const configs: SigningConfigInfo[] = []
  const configRe = /(?:create|getByName)\s*\(\s*["']([^"']+)["']\s*\)\s*\{|(\w+)\s*\{/g
  let m: RegExpExecArray | null
  while ((m = configRe.exec(block)) !== null) {
    const name = m[1] ?? m[2]
    if (!name) continue
    // Capture this config's body via brace matching from the match end.
    let d = 1
    let j = configRe.lastIndex
    const bodyStart = j
    for (; j < block.length && d > 0; j++) {
      if (block[j] === "{") d++
      else if (block[j] === "}") d--
    }
    const body = block.slice(bodyStart, j - 1)
    const aliasMatch = body.match(/keyAlias\b\s*=?\s*\(?\s*["']([^"']+)["']/)
    configs.push({
      name,
      hasStoreFile: hasField(body, "storeFile"),
      keyAlias: aliasMatch?.[1],
      hasStorePassword: hasField(body, "storePassword"),
      hasKeyPassword: hasField(body, "keyPassword"),
      hardcodedPassword: isHardcoded(body, "storePassword") || isHardcoded(body, "keyPassword"),
    })
    configRe.lastIndex = j
  }
  return configs
}

function moduleDir(cwd: string, module?: string): string {
  if (!module) return cwd
  return path.join(cwd, module.replace(/^:/, "").replace(/:/g, path.sep))
}

function findBuildScript(cwd: string, module?: string): string | null {
  const dirs: string[] = []
  if (module) dirs.push(moduleDir(cwd, module))
  else {
    const modules = scan(cwd).modules
    const app = modules.find((mod) => mod.type === "app") ?? modules[0]
    if (app) dirs.push(path.join(cwd, app.relativePath))
    dirs.push(path.join(cwd, "app"))
  }
  for (const dir of dirs) {
    for (const name of ["build.gradle.kts", "build.gradle"]) {
      const p = path.join(dir, name)
      if (fs.existsSync(p)) return p
    }
  }
  return null
}

export const SigningTool = Tool.define(
  "signing",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { module } = params
          const cwd = (yield* InstanceState.context).directory
          const scriptPath = yield* Effect.sync(() => findBuildScript(cwd, module))
          if (!scriptPath) {
            return {
              title: "signing",
              output: "No build.gradle(.kts) found for the requested module.",
              metadata: { error: true, code: "BUILD_SCRIPT_NOT_FOUND" } as SigningMetadata,
            }
          }
          const script = yield* Effect.sync(() => fs.readFileSync(scriptPath, "utf-8"))
          const configs = parseSigningConfigs(script)
          const hardcoded = configs.filter((c) => c.hardcodedPassword).map((c) => c.name)
          const lines = configs.length
            ? configs.map(
                (c) =>
                  `${c.name}: storeFile=${c.hasStoreFile}, keyAlias=${c.keyAlias ?? "(n/a)"}, ` +
                  `storePassword=${c.hasStorePassword}, keyPassword=${c.hasKeyPassword}` +
                  (c.hardcodedPassword ? "  [WARNING: hardcoded password literal]" : ""),
              )
            : ["No signingConfigs found in this module."]
          if (hardcoded.length) {
            lines.push("", `Security: ${hardcoded.join(", ")} use hardcoded password literals. Move them to env vars or a keystore.properties file (gitignored).`)
          }
          return {
            title: `signing ${path.relative(cwd, scriptPath)}`,
            // Passwords are never read or included — only presence/hardcoded flags.
            output: lines.join("\n"),
            metadata: { path: scriptPath, configs, hardcodedConfigs: hardcoded } as SigningMetadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)
