import { Config } from "effect"

function env(key: string) {
  return process.env[`ANDROIDCODE_${key}`] ?? process.env[`OPENCODE_${key}`]
}

function truthy(key: string) {
  const value = env(key)?.toLowerCase()
  return value === "true" || value === "1"
}

const OPENCODE_EXPERIMENTAL = truthy("EXPERIMENTAL")
const copy = env("EXPERIMENTAL_DISABLE_COPY_ON_SELECT")

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  OPENCODE_AUTO_HEAP_SNAPSHOT: truthy("AUTO_HEAP_SNAPSHOT"),
  OPENCODE_GIT_BASH_PATH: env("GIT_BASH_PATH"),
  OPENCODE_CONFIG: env("CONFIG"),
  OPENCODE_CONFIG_CONTENT: env("CONFIG_CONTENT"),
  OPENCODE_DISABLE_AUTOUPDATE: truthy("DISABLE_AUTOUPDATE"),
  OPENCODE_ALWAYS_NOTIFY_UPDATE: truthy("ALWAYS_NOTIFY_UPDATE"),
  OPENCODE_DISABLE_PRUNE: truthy("DISABLE_PRUNE"),
  OPENCODE_DISABLE_TERMINAL_TITLE: truthy("DISABLE_TERMINAL_TITLE"),
  OPENCODE_SHOW_TTFD: truthy("SHOW_TTFD"),
  OPENCODE_PERMISSION: env("PERMISSION"),
  OPENCODE_DISABLE_AUTOCOMPACT: truthy("DISABLE_AUTOCOMPACT"),
  OPENCODE_DISABLE_MODELS_FETCH: truthy("DISABLE_MODELS_FETCH"),
  OPENCODE_DISABLE_MOUSE: truthy("DISABLE_MOUSE"),
  OPENCODE_FAKE_VCS: env("FAKE_VCS"),
  OPENCODE_SERVER_PASSWORD: env("SERVER_PASSWORD"),
  OPENCODE_SERVER_USERNAME: env("SERVER_USERNAME"),

  // Experimental
  OPENCODE_EXPERIMENTAL_FILEWATCHER: Config.boolean("OPENCODE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  OPENCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  OPENCODE_MODELS_URL: env("MODELS_URL"),
  OPENCODE_MODELS_PATH: env("MODELS_PATH"),
  OPENCODE_DB: env("DB"),

  OPENCODE_WORKSPACE_ID: env("WORKSPACE_ID"),
  OPENCODE_EXPERIMENTAL_WORKSPACES: OPENCODE_EXPERIMENTAL || truthy("EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get OPENCODE_DISABLE_PROJECT_CONFIG() {
    return truthy("OPENCODE_DISABLE_PROJECT_CONFIG")
  },
  get OPENCODE_TUI_CONFIG() {
    return process.env["OPENCODE_TUI_CONFIG"]
  },
  get OPENCODE_CONFIG_DIR() {
    return process.env["OPENCODE_CONFIG_DIR"]
  },
  get OPENCODE_PURE() {
    return truthy("OPENCODE_PURE")
  },
  get OPENCODE_PLUGIN_META_FILE() {
    return process.env["OPENCODE_PLUGIN_META_FILE"]
  },
  get OPENCODE_CLIENT() {
    return process.env["OPENCODE_CLIENT"] ?? "cli"
  },
}
