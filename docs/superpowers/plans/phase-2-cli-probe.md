# Phase 2: Android CLI Probe + Wrapper Policy

**Goal:** Detect Google's `android` CLI and establish the raw-base / CLI-optional wrapping model.
**Depends on:** Phase 1
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §2 risk table; §4 wrap policies

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase2/cli-probe` off it.
- **Commits:** conventional-commit format `<type>(<scope>): <subject>`.

**Compliance gate — must pass BEFORE PR merge:**

- [ ] PR title matches conventional commit format
- [ ] PR template filled with real content — all five sections
- [ ] Linked issue via Fixes/Closes (auto-skipped for docs/refactor/feat)
- [ ] `bun turbo test:ci` green (Linux + Windows)
- [ ] `bun typecheck` green (TypeScript)
- [ ] `bun run test:httpapi` green in `packages/opencode` (Linux), where applicable

**Phase done = a compliant, green PR merged to `dev`.**

---

## 2.1 Session-Start Probe for the `android` CLI

**Why:** We need to know at session start whether Google's `android` CLI is present, which subcommands it supports, and on which platform it has caveats (e.g., Windows emulator support). This information drives every tool's wrap policy and is surfaced to the user via `/android status`.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/probe.ts` | **New file.** Define `AndroidProbe` service. On init, run `which android` (cross-spawn) to detect the CLI. If found, run `android --version` and `android help` to enumerate available subcommands. Record: `{ available: boolean; version?: string; subcommands: string[]; platformCaveats: string[] }`. Store result in `InstanceState` so it is cached per project directory. |
| `packages/opencode/src/android/probe.ts` | Export `platformCaveats()` helper that returns notes like `"Windows emulator not supported by android CLI — using raw avdmanager"`. |
| `packages/opencode/src/project/instance-runtime.ts` (or bootstrap layer) | Provide `AndroidProbe.defaultLayer` in the instance runtime so the probe runs automatically when a workspace is loaded. |

## Verification

- On a machine **without** `android` in `$PATH`, start a session and verify the probe records `{ available: false, subcommands: [] }`.
- On a machine **with** `android`, verify the probe records the version and a non-empty `subcommands` list.
- Run `bun test --cwd packages/opencode test/android/probe.test.ts` (mock spawn) to assert both branches.

## Risk

- **Risk:** `android --version` or `android help` exits with a non-zero code on some platforms, causing the probe to crash. → **Mitigation:** Wrap the version/help calls in `Effect.catchAll` and treat any failure as `available: false` with the stderr logged at WARN level.

---

## 2.2 Per-Tool Wrap Policy Registry

**Why:** Every Android tool must know whether it is allowed to use the `android` CLI or must fall back to the raw toolchain. A centralized policy registry prevents ad-hoc `which("android")` checks scattered across tools and makes the policy explicit and testable.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/wrap-policy.ts` | **New file.** Define `WrapPolicy` type: `"raw-only" | "android-optional" | "android-preferred"`. Define `toolPolicies: Record<string, WrapPolicy>` mapping each Android tool ID to its policy (e.g., `gradle: "raw-only"`, `android: "android-optional"`). Export `resolve(toolID, probe)` that returns `"android"` or `"raw"` based on the policy and probe result. |
| `packages/opencode/src/android/wrap-policy.ts` | Export `reason(toolID, probe)` that returns a human-readable string explaining the choice (e.g., `"gradle uses raw-only policy"`). |

## Verification

- Unit test: `resolve("gradle", { available: true })` returns `"raw"` because `gradle` is `raw-only`.
- Unit test: `resolve("android", { available: false })` returns `"raw"` because the CLI is missing.
- Unit test: `resolve("android", { available: true })` returns `"android"` because policy is `android-optional` and CLI is present.

## Risk

- **Risk:** A future tool author forgets to register a policy, defaulting to an unsafe choice. → **Mitigation:** The `resolve` function throws a typed error `MissingWrapPolicy` when a tool ID is not in the registry, failing fast in tests and CI.

---

## 2.3 `/android status` Surface

**Why:** Users and the agent need visibility into which tools are using the `android` CLI vs raw tools. This is the primary debugging surface for the wrap-policy system.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/cli/cmd/android.ts` | **New file.** Define `AndroidCommand` yargs command module with subcommand `status`. Handler uses `effectCmd` pattern (see `packages/opencode/src/cli/effect-cmd.ts`). Imports `AndroidProbe.Service` and `WrapPolicy` to print a table: tool ID → mode (`android` / `raw`) → reason. |
| `packages/opencode/src/index.ts` | Register `.command(AndroidCommand)` in the root yargs builder. |
| `packages/opencode/src/cli/cmd/android.ts` | Add a second subcommand `probe` that forces a fresh probe and prints raw JSON for scripting. |

## Verification

- `bun run --cwd packages/opencode src/index.ts android status` prints a table.
- On a machine without `android`, every tool shows `raw`.
- On a machine with `android`, the `android` tool shows `android` while `gradle`/`logcat`/etc. still show `raw`.

## Risk

- **Risk:** The command collides with an existing `android` command if the user has the `android` CLI on PATH — but our CLI is `androidcode`, so the subcommand `android status` is safe. → **Mitigation:** No action needed; the CLI binary name is already `androidcode` from Phase 0.

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- Probe unit tests cover `available=true`, `available=false`, and `version` parse failure branches
- `/android status` lists all defined Android tools and their resolved mode

## Risk (phase-wide)

- **Risk:** The probe spawns shell commands synchronously during instance bootstrap, blocking TUI startup. → **Mitigation:** Fork the probe inside `InstanceState.make` using `Effect.forkScoped` (per AGENTS.md guidance), or run it lazily on first access rather than at init.
