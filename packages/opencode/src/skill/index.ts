import path from "path"
import * as fs from "fs"
import { pathToFileURL } from "url"
import { Effect, Layer, Context, Schema } from "effect"
import { NamedError } from "@opencode-ai/core/util/error"
import type { Agent } from "@/agent/agent"
import { Bus } from "@/bus"
import { InstanceState } from "@/effect/instance-state"
import { Global } from "@opencode-ai/core/global"
import { Permission } from "@/permission"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { Config } from "@/config/config"
import { ConfigMarkdown } from "@/config/markdown"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Glob } from "@opencode-ai/core/util/glob"
import * as Log from "@opencode-ai/core/util/log"
import { Discovery } from "./discovery"
import { OrchestrationSchema } from "./orchestration"
import { Info } from "./types"
import type { ScoredSkill } from "./types"
import { select as routerSelect } from "./router"
import { analyze, applyClassifier, type TaskClassifier } from "./task-analyzer"
import CUSTOMIZE_OPENCODE_SKILL_BODY from "./prompt/customize-opencode.md" with { type: "text" }
import { isRecord } from "@/util/record"

const log = Log.create({ service: "skill" })
const CLAUDE_EXTERNAL_DIR = ".claude"
const AGENTS_EXTERNAL_DIR = ".agents"
const SKILLS_EXTERNAL_DIR = ".skills"
const EXTERNAL_SKILL_PATTERN = "skills/**/SKILL.md"
const OPENCODE_SKILL_PATTERN = "{skill,skills}/**/SKILL.md"
const SKILL_PATTERN = "**/SKILL.md"

// Built-in skill that ships with opencode. The model's intuition for what an
// opencode.json should look like is often wrong, and opencode hard-fails on
// invalid config, so users hit cryptic startup errors. Loading this skill
// when the model is asked to touch opencode's own config files gives it the
// actual schemas instead of guesses.
// Bootstrap skills ship in `.agents/skills/` and are always loaded into the
// system prompt regardless of the router's task-relevance scoring. They give
// the agent baseline awareness of the skill system and Android conventions.
const BOOTSTRAP_SKILL_NAMES = ["skill-router", "android-core", "skill-guide"]

// Stage 3 enrichment bounds: only a handful of recently-touched files are read,
// each capped, so per-turn skill routing stays cheap.
const MAX_ENRICH_FILES = 10
const MAX_ENRICH_BYTES = 64 * 1024

// Best-effort read of recent file contents for import/API extraction. Unreadable
// or relative paths are silently skipped — enrichment is purely additive signal.
function readRecentFileContents(files: string[]): Map<string, string> {
  const contents = new Map<string, string>()
  for (const file of files.slice(0, MAX_ENRICH_FILES)) {
    try {
      const buf = fs.readFileSync(file)
      contents.set(file, buf.toString("utf-8", 0, Math.min(buf.length, MAX_ENRICH_BYTES)))
    } catch {
      continue
    }
  }
  return contents
}

const CUSTOMIZE_OPENCODE_SKILL_NAME = "customize-opencode"
const CUSTOMIZE_OPENCODE_SKILL_DESCRIPTION =
  "Use ONLY when the user is editing or creating opencode's own configuration: opencode.json, opencode.jsonc, files under .opencode/, or files under ~/.config/opencode/. Also use when creating or fixing opencode agents, subagents, skills, plugins, MCP servers, or permission rules. Do not use for the user's own application code, or for any project that is not configuring opencode itself."

export { Info }
export type { ScoredSkill }

const Issue = Schema.StructWithRest(
  Schema.Struct({
    message: Schema.String,
    path: Schema.Array(Schema.String),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
)

function isSkillFrontmatter(
  data: unknown,
): data is { name: string; description?: string; orchestration?: unknown; metadata?: { orchestration?: unknown } } {
  return (
    isRecord(data) &&
    typeof data.name === "string" &&
    (data.description === undefined || typeof data.description === "string")
  )
}

export const InvalidError = NamedError.create("SkillInvalidError", {
  path: Schema.String,
  message: Schema.optional(Schema.String),
  issues: Schema.optional(Schema.Array(Issue)),
})

export const NameMismatchError = NamedError.create("SkillNameMismatchError", {
  path: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
})

type State = {
  skills: Record<string, Info>
  dirs: Set<string>
  overrides: Set<string>
  exclusions: Set<string>
  lastSelection: { selected: Info[]; scores: ScoredSkill[] } | undefined
}

type DiscoveryState = {
  matches: string[]
  dirs: string[]
}

type ScanState = {
  matches: Set<string>
  dirs: Set<string>
}

export interface Interface {
  readonly get: (name: string) => Effect.Effect<Info | undefined>
  readonly all: () => Effect.Effect<Info[]>
  readonly dirs: () => Effect.Effect<string[]>
  readonly available: (agent?: Agent.Info) => Effect.Effect<Info[]>
  readonly analyzeAndSelect: (
    agent: Agent.Info | undefined,
    lastUserMessage: string,
    recentFiles: string[],
    recentTools?: string[],
    classify?: TaskClassifier,
  ) => Effect.Effect<{ selected: Info[]; scores: ScoredSkill[] }>
  readonly selected: (agent?: Agent.Info) => Effect.Effect<Info[]>
  readonly addOverride: (name: string) => Effect.Effect<void>
  readonly removeOverride: (name: string) => Effect.Effect<void>
  readonly resetOverrides: () => Effect.Effect<void>
  readonly lastScores: () => Effect.Effect<ScoredSkill[]>
}

const add = Effect.fnUntraced(function* (state: State, match: string, bus: Bus.Interface) {
  const md = yield* Effect.tryPromise({
    try: () => ConfigMarkdown.parse(match),
    catch: (err) => err,
  }).pipe(
    Effect.catch(
      Effect.fnUntraced(function* (err) {
        const message = ConfigMarkdown.FrontmatterError.isInstance(err)
          ? err.data.message
          : `Failed to parse skill ${match}`
        const { Session } = yield* Effect.promise(() => import("@/session/session"))
        yield* bus.publish(Session.Event.Error, { error: new NamedError.Unknown({ message }).toObject() })
        log.error("failed to load skill", { skill: match, err })
        return undefined
      }),
    ),
  )

  if (!md) return

  if (!isSkillFrontmatter(md.data)) return

  const rawOrchestration = md.data.orchestration ?? md.data.metadata?.orchestration
  const orchestration = rawOrchestration
    ? yield* Schema.decodeUnknownEffect(OrchestrationSchema)(rawOrchestration).pipe(
        Effect.catch((err) => {
          log.warn("failed to parse orchestration metadata", { skill: match, err: String(err) })
          return Effect.succeed(undefined)
        }),
      )
    : undefined

  if (state.skills[md.data.name]) {
    log.warn("duplicate skill name", {
      name: md.data.name,
      existing: state.skills[md.data.name].location,
      duplicate: match,
    })
  }

  state.dirs.add(path.dirname(match))
  state.skills[md.data.name] = {
    name: md.data.name,
    description: md.data.description,
    location: match,
    content: md.content,
    orchestration,
  }
})

const scan = Effect.fnUntraced(function* (
  state: ScanState,
  root: string,
  pattern: string,
  opts?: { dot?: boolean; scope?: string },
) {
  const matches = yield* Effect.tryPromise({
    try: () =>
      Glob.scan(pattern, {
        cwd: root,
        absolute: true,
        include: "file",
        symlink: true,
        dot: opts?.dot,
      }),
    catch: (error) => error,
  }).pipe(
    Effect.catch((error) => {
      if (!opts?.scope) return Effect.die(error)
      log.error(`failed to scan ${opts.scope} skills`, { dir: root, error })
      return Effect.succeed([] as string[])
    }),
  )

  for (const match of matches) {
    state.matches.add(match)
    state.dirs.add(path.dirname(match))
  }
})

const discoverSkills = Effect.fnUntraced(function* (
  config: Config.Interface,
  discovery: Discovery.Interface,
  fsys: AppFileSystem.Interface,
  global: Global.Interface,
  disableExternalSkills: boolean,
  disableClaudeCodeSkills: boolean,
  directory: string,
  worktree: string,
) {
  const state: ScanState = { matches: new Set(), dirs: new Set() }

  const externalDirs: string[] = []
  if (!disableExternalSkills) {
    if (!disableClaudeCodeSkills) externalDirs.push(CLAUDE_EXTERNAL_DIR)
    externalDirs.push(AGENTS_EXTERNAL_DIR)

    for (const dir of externalDirs) {
      const root = path.join(global.home, dir)
      if (!(yield* fsys.isDir(root))) continue
      yield* scan(state, root, EXTERNAL_SKILL_PATTERN, { dot: true, scope: "global" })
    }

    const upDirs = yield* fsys
      .up({ targets: externalDirs, start: directory, stop: worktree })
      .pipe(Effect.catch(() => Effect.succeed([] as string[])))

    for (const root of upDirs) {
      yield* scan(state, root, EXTERNAL_SKILL_PATTERN, { dot: true, scope: "project" })
    }

    // `.skills/` is itself the skills root (skills live at `.skills/<name>/SKILL.md`),
    // so it is scanned with the bare SKILL pattern rather than the nested `skills/**`
    // one used for `.claude`/`.agents`.
    const skillsRootGlobal = path.join(global.home, SKILLS_EXTERNAL_DIR)
    if (yield* fsys.isDir(skillsRootGlobal)) {
      yield* scan(state, skillsRootGlobal, SKILL_PATTERN, { dot: true, scope: "global" })
    }

    const skillsUpDirs = yield* fsys
      .up({ targets: [SKILLS_EXTERNAL_DIR], start: directory, stop: worktree })
      .pipe(Effect.catch(() => Effect.succeed([] as string[])))

    for (const root of skillsUpDirs) {
      yield* scan(state, root, SKILL_PATTERN, { dot: true, scope: "project" })
    }
  }

  const configDirs = yield* config.directories()
  for (const dir of configDirs) {
    yield* scan(state, dir, OPENCODE_SKILL_PATTERN)
  }

  const cfg = yield* config.get()
  for (const item of cfg.skills?.paths ?? []) {
    const expanded = item.startsWith("~/") ? path.join(global.home, item.slice(2)) : item
    const dir = path.isAbsolute(expanded) ? expanded : path.join(directory, expanded)
    if (!(yield* fsys.isDir(dir))) {
      log.warn("skill path not found", { path: dir })
      continue
    }

    yield* scan(state, dir, SKILL_PATTERN)
  }

  const urls = new Set(cfg.skills?.urls ?? [])
  if (cfg.skills?.auto_install_google_skills !== false) {
    urls.add(Discovery.GOOGLE_SKILLS_URL)
  }
  for (const url of urls) {
    const pulledDirs = yield* discovery.pull(url)
    for (const dir of pulledDirs) {
      yield* scan(state, dir, SKILL_PATTERN)
    }
  }

  return {
    matches: Array.from(state.matches),
    dirs: Array.from(state.dirs),
  }
})

const loadSkills = Effect.fnUntraced(function* (state: State, discovered: DiscoveryState, bus: Bus.Interface) {
  yield* Effect.forEach(discovered.matches, (match) => add(state, match, bus), {
    concurrency: "unbounded",
    discard: true,
  })

  log.info("init", { count: Object.keys(state.skills).length })
})

export class Service extends Context.Service<Service, Interface>()("@opencode/Skill") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const discovery = yield* Discovery.Service
    const config = yield* Config.Service
    const bus = yield* Bus.Service
    const fsys = yield* AppFileSystem.Service
    const global = yield* Global.Service
    const flags = yield* RuntimeFlags.Service
    const discovered = yield* InstanceState.make(
      Effect.fn("Skill.discovery")(function* (ctx) {
        return yield* discoverSkills(
          config,
          discovery,
          fsys,
          global,
          flags.disableExternalSkills,
          flags.disableClaudeCodeSkills,
          ctx.directory,
          ctx.worktree,
        )
      }),
    )
    const state = yield* InstanceState.make(
      Effect.fn("Skill.state")(function* () {
        const s: State = { skills: {}, dirs: new Set(), overrides: new Set(), exclusions: new Set(), lastSelection: undefined }
        // Register the built-in skill BEFORE disk discovery so a user-disk
        // skill with the same name can override it.
        s.skills[CUSTOMIZE_OPENCODE_SKILL_NAME] = {
          name: CUSTOMIZE_OPENCODE_SKILL_NAME,
          description: CUSTOMIZE_OPENCODE_SKILL_DESCRIPTION,
          location: "<built-in>",
          content: CUSTOMIZE_OPENCODE_SKILL_BODY,
        }
        yield* loadSkills(s, yield* InstanceState.get(discovered), bus)
        return s
      }),
    )

    const get = Effect.fn("Skill.get")(function* (name: string) {
      const s = yield* InstanceState.get(state)
      return s.skills[name]
    })

    const all = Effect.fn("Skill.all")(function* () {
      const s = yield* InstanceState.get(state)
      return Object.values(s.skills)
    })

    const dirs = Effect.fn("Skill.dirs")(function* () {
      return (yield* InstanceState.get(discovered)).dirs
    })

    const available = Effect.fn("Skill.available")(function* (agent?: Agent.Info) {
      const s = yield* InstanceState.get(state)
      const list = Object.values(s.skills).toSorted((a, b) => a.name.localeCompare(b.name))
      if (!agent) return list
      return list.filter((skill) => Permission.evaluate("skill", skill.name, agent.permission).action !== "deny")
    })

    const analyzeAndSelect = Effect.fn("Skill.analyzeAndSelect")(function* (
      agent: Agent.Info | undefined,
      lastUserMessage: string,
      recentFiles: string[],
      recentTools: string[] = [],
      classify?: TaskClassifier,
    ) {
      const s = yield* InstanceState.get(state)
      const cfg = yield* config.get()
      const maxActive = cfg.skills?.max_active_skills ?? 5

      const availableList = agent
        ? Object.values(s.skills).filter(
            (skill) => Permission.evaluate("skill", skill.name, agent.permission).action !== "deny",
          )
        : Object.values(s.skills)

      const fileContents = readRecentFileContents(recentFiles)
      const base = analyze(lastUserMessage, recentFiles, recentTools, fileContents)
      const analysis = yield* applyClassifier(base, classify)
      const result = routerSelect(
        availableList,
        analysis,
        maxActive,
        {
          include: Array.from(s.overrides),
          exclude: Array.from(s.exclusions),
        },
        BOOTSTRAP_SKILL_NAMES,
      )

      const previous = s.lastSelection?.selected.map((skill) => skill.name) ?? []
      const current = result.selected.map((skill) => skill.name)
      if (previous.join(",") !== current.join(",")) {
        log.info("skill selection changed", { taskType: analysis.taskType, from: previous, to: current })
      }

      s.lastSelection = result
      return result
    })

    const selected = Effect.fn("Skill.selected")(function* (agent?: Agent.Info) {
      const s = yield* InstanceState.get(state)
      if (s.lastSelection) {
        const availableNames = new Set(
          agent
            ? Object.values(s.skills)
                .filter((skill) => Permission.evaluate("skill", skill.name, agent.permission).action !== "deny")
                .map((s) => s.name)
            : Object.keys(s.skills),
        )
        return s.lastSelection.selected.filter((skill) => availableNames.has(skill.name))
      }
      return yield* available(agent)
    })

    const addOverride = Effect.fn("Skill.addOverride")(function* (name: string) {
      const s = yield* InstanceState.get(state)
      s.overrides.add(name)
      s.exclusions.delete(name)
      log.info("skill override added", { name })
    })

    const removeOverride = Effect.fn("Skill.removeOverride")(function* (name: string) {
      const s = yield* InstanceState.get(state)
      s.exclusions.add(name)
      s.overrides.delete(name)
      log.info("skill override removed", { name })
    })

    const resetOverrides = Effect.fn("Skill.resetOverrides")(function* () {
      const s = yield* InstanceState.get(state)
      s.overrides.clear()
      s.exclusions.clear()
      log.info("skill overrides reset")
    })

    const lastScores = Effect.fn("Skill.lastScores")(function* () {
      const s = yield* InstanceState.get(state)
      return s.lastSelection?.scores ?? []
    })

    return Service.of({ get, all, dirs, available, analyzeAndSelect, selected, addOverride, removeOverride, resetOverrides, lastScores })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Discovery.defaultLayer),
  Layer.provide(Config.defaultLayer),
  Layer.provide(Bus.layer),
  Layer.provide(AppFileSystem.defaultLayer),
  Layer.provide(Global.layer),
  Layer.provide(RuntimeFlags.defaultLayer),
)

export function fmt(list: Info[], opts: { verbose: boolean }) {
  const described = list.filter((skill) => skill.description !== undefined)
  if (described.length === 0) return "No skills are currently available."
  if (opts.verbose) {
    return [
      "<available_skills>",
      ...described
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .flatMap((skill) => [
          "  <skill>",
          `    <name>${skill.name}</name>`,
          `    <description>${skill.description}</description>`,
          `    <location>${pathToFileURL(skill.location).href}</location>`,
          "  </skill>",
        ]),
      "</available_skills>",
    ].join("\n")
  }

  return [
    "## Available Skills",
    ...described
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map((skill) => `- **${skill.name}**: ${skill.description}`),
  ].join("\n")
}

export * as Skill from "."
