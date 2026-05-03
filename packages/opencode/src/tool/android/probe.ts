import { Context, Effect, Layer } from "effect"
import { Log } from "@/util"

/**
 * Probe for Google's official Android CLI.
 * Detects presence, version, and per-subcommand availability.
 * This is used by the `android` wrapper tool to decide whether to wrap the official CLI
 * or fall back to raw SDK utilities (adb, sdkmanager, avdmanager).
 */
const log = Log.create({ service: "AndroidProbe" })

let cached: ReturnType<typeof runProbe> | undefined

function trySpawn(args: string[]) {
  try {
    return Bun.spawnSync(args, { stdout: "pipe", stderr: "pipe" })
  } catch {
    return null
  }
}

function runProbe() {
  log.debug("probing android cli...")

  const versionResult = trySpawn(["android", "--version"])

  if (!versionResult || versionResult.exitCode !== 0) {
    return {
      present: false as const,
      availableSubcommands: [] as string[],
      platformCaveats: ["Android CLI not found in PATH"],
    }
  }

  const version = new TextDecoder().decode(versionResult.stdout).trim()
  const subcommands = ["sdk", "emulator", "run", "screen", "layout", "create", "describe", "docs", "skills", "init"]
  const availableSubcommands: string[] = []
  const platformCaveats: string[] = []

  for (const sub of subcommands) {
    const r = trySpawn(["android", sub, "--help"])
    if (r && r.exitCode === 0) {
      availableSubcommands.push(sub)
    } else if (sub === "emulator" && process.platform === "win32") {
      platformCaveats.push("android emulator is disabled on Windows; falling back to avdmanager/emulator binaries")
    }
  }

  return { present: true as const, version, availableSubcommands, platformCaveats }
}

export interface AndroidProbeResult {
  present: boolean
  version?: string
  availableSubcommands: string[]
  platformCaveats: string[]
}

export interface AndroidProbe {
  readonly status: () => Effect.Effect<AndroidProbeResult>
}

export class Service extends Context.Service<Service, AndroidProbe>()("@androidcode/AndroidProbe") {}

export const layer = Layer.succeed(
  Service,
  Service.of({
    status: () => Effect.sync(() => (cached ??= runProbe())),
  }),
)
