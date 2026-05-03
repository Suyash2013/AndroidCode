import * as fs from "fs"
import * as path from "path"
import { Context, Effect, Layer } from "effect"
import { Log } from "@/util"
import { Service as AndroidProbeService } from "@/tool/android/probe"

const log = Log.create({ service: "AndroidIntelligence" })

export interface ModuleInfo {
  name: string
  type: "app" | "feature" | "core" | "shared" | "lib" | "other"
  relativePath: string
  hasKmp: boolean
  conventionPlugins: string[]
}

export interface VersionCatalog {
  path: string
  versions: Record<string, string>
  libraryKeys: string[]
  pluginKeys: string[]
}

export interface GradleProfile {
  hasGradle: boolean
  hasWrapper: boolean
  buildScriptType: "kts" | "groovy" | "mixed" | "none"
  modules: ModuleInfo[]
  versionCatalog?: VersionCatalog
  isKmp: boolean
  conventionPluginDirs: string[]
  androidDescribeOutput?: Record<string, unknown>
}

function exists(p: string): boolean {
  try { fs.accessSync(p); return true } catch { return false }
}

function readText(p: string): string | null {
  try { return fs.readFileSync(p, "utf-8") } catch { return null }
}

function parseTomlSections(content: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}
  let current = ""
  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const sectionMatch = line.match(/^\[(\w[\w.-]*)\]$/)
    if (sectionMatch) { current = sectionMatch[1]; result[current] = {}; continue }
    if (!current) continue
    const eqIdx = line.indexOf("=")
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    const rawVal = line.slice(eqIdx + 1).trim()
    const strMatch = rawVal.match(/^"([^"]*)"/)
    result[current][key] = strMatch ? strMatch[1] : rawVal
  }
  return result
}

export function parseVersionCatalogFromPath(tomlPath: string): VersionCatalog | null {
  const content = readText(tomlPath)
  if (!content) return null
  try {
    const sections = parseTomlSections(content)
    const versions: Record<string, string> = {}
    const libraryKeys: string[] = []
    const pluginKeys: string[] = []
    for (const [k, v] of Object.entries(sections["versions"] ?? {})) versions[k] = v
    for (const k of Object.keys(sections["libraries"] ?? {})) libraryKeys.push(k)
    for (const k of Object.keys(sections["plugins"] ?? {})) pluginKeys.push(k)
    if (Object.keys(versions).length === 0 && libraryKeys.length === 0) return null
    return { path: tomlPath, versions, libraryKeys, pluginKeys }
  } catch (e) {
    log.warn("failed to parse version catalog", { path: tomlPath, error: String(e) })
    return null
  }
}

function parseVersionCatalog(cwd: string): VersionCatalog | undefined {
  const standard = path.join(cwd, "gradle", "libs.versions.toml")
  return exists(standard) ? parseVersionCatalogFromPath(standard) ?? undefined : undefined
}

function classifyModule(name: string): ModuleInfo["type"] {
  if (name === ":app") return "app"
  if (name.startsWith(":feature")) return "feature"
  if (name.startsWith(":core")) return "core"
  if (name.includes("shared")) return "shared"
  if (name.startsWith(":lib")) return "lib"
  return "other"
}

function discoverModules(cwd: string): ModuleInfo[] {
  const content = readText(path.join(cwd, "settings.gradle.kts")) ?? readText(path.join(cwd, "settings.gradle"))
  if (!content) return []
  const modules: ModuleInfo[] = []
  const re = /include\s*\(([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const nameRe = /"(:[^"]+)"/g
    let n: RegExpExecArray | null
    while ((n = nameRe.exec(m[1])) !== null) {
      const name = n[1]
      const relativePath = name.replace(/^:/, "").replace(/:/g, "/")
      const moduleContent = readText(path.join(cwd, relativePath, "build.gradle.kts")) ?? ""
      const hasKmp = moduleContent.includes('kotlin("multiplatform")')
      modules.push({ name, type: classifyModule(name), relativePath, hasKmp, conventionPlugins: [] })
    }
  }
  return modules
}

function detectKmpAndConventionPlugins(cwd: string, modules: ModuleInfo[]) {
  const rootKts = readText(path.join(cwd, "build.gradle.kts")) ?? ""
  const isKmp = modules.some((m) => m.hasKmp) || rootKts.includes('kotlin("multiplatform")')
  const conventionPluginDirs = ["build-logic", "buildSrc", "convention"].filter((d) => exists(path.join(cwd, d)))
  return { isKmp, conventionPluginDirs }
}

export function scan(cwd: string): GradleProfile {
  const hasKts = exists(path.join(cwd, "build.gradle.kts"))
  const hasGroovy = exists(path.join(cwd, "build.gradle"))
  const hasSettings = exists(path.join(cwd, "settings.gradle.kts")) || exists(path.join(cwd, "settings.gradle"))
  const hasWrapper = exists(path.join(cwd, "gradlew"))
  const hasGradle = hasKts || hasGroovy || hasSettings || hasWrapper

  if (!hasGradle) return { hasGradle: false, hasWrapper: false, buildScriptType: "none", modules: [], isKmp: false, conventionPluginDirs: [] }

  let buildScriptType: GradleProfile["buildScriptType"] = "kts"
  if (hasKts && hasGroovy) buildScriptType = "mixed"
  else if (hasGroovy && !hasKts) buildScriptType = "groovy"

  const modules = discoverModules(cwd)
  const versionCatalog = parseVersionCatalog(cwd)
  const { isKmp, conventionPluginDirs } = detectKmpAndConventionPlugins(cwd, modules)

  return { hasGradle: true, hasWrapper, buildScriptType, modules, versionCatalog, isKmp, conventionPluginDirs }
}

function trySpawnDescribe(cwd: string): Record<string, unknown> | null {
  try {
    const r = Bun.spawnSync(["android", "describe", "--json"], { stdout: "pipe", stderr: "pipe", cwd })
    if (!r || r.exitCode !== 0) return null
    return JSON.parse(new TextDecoder().decode(r.stdout).trim()) as Record<string, unknown>
  } catch { return null }
}

export interface AndroidIntelligenceInterface {
  detect: (cwd: string) => Effect.Effect<GradleProfile>
}

export class Service extends Context.Service<Service, AndroidIntelligenceInterface>()("@androidcode/AndroidIntelligence") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const probe = yield* AndroidProbeService
    return Service.of({
      detect: (cwd) => Effect.gen(function* () {
        const profile = scan(cwd)
        const probeResult = yield* probe.status()
        if (probeResult.availableSubcommands.includes("describe")) {
          const out = yield* Effect.sync(() => trySpawnDescribe(cwd))
          if (out) return { ...profile, androidDescribeOutput: out }
        }
        return profile
      }),
    })
  }),
)
