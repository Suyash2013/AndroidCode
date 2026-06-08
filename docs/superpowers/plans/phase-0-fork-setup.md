# Phase 0: Fork & Project Setup

**Goal:** Stand up the AndroidCode fork with build, CI, and distribution scaffolding.
**Depends on:** —
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §2 Fork Strategy; §13 upstream sync

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase0/fork-setup` off it.
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

## 0.1 Rebrand Package Scope & Name

**Why:** The fork must ship under the `@androidcode` npm scope so plugins and consumers reference the correct packages. Leaving `@opencode-ai` would create namespace collisions and confuse users.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `package.json` | Rename `"name"` from `"opencode"` to `"androidcode"`; update any workspace-level references |
| `packages/*/package.json` | Replace `"@opencode-ai/*"` → `"@androidcode/*"` in both `name` and dependency fields |
| `packages/opencode/package.json` | Rename `"name"` from `"opencode"` to `"androidcode"`; update `bin` entry to `"androidcode"`; update `exports` if needed |
| `packages/opencode/bin/opencode` | Rename file to `bin/androidcode`; update internal shebang / path references |
| `packages/opencode/src/index.ts` | Update `scriptName("opencode")` → `scriptName("androidcode")`; update version label strings |
| `packages/opencode/src/cli/ui.ts` | Replace logo / brand string "opencode" with "androidcode" (case-insensitive sweep) |
| `packages/opencode/src/installation.ts` | Update binary name references used by `Installation.upgrade` and `Installation.method` |

## Verification

- `grep -ri "@opencode-ai" packages/*/package.json package.json` returns zero matches (except possibly historical docs).
- `grep -ri '"opencode"' packages/opencode/src/index.ts` no longer references the old CLI name.

## Risk

- **Risk:** Some package names are hard-coded in CI scripts, Dockerfiles, or Nix expressions outside the JS source. → **Mitigation:** Run a global `grep -r "opencode-ai" .github/ script/ *.nix Dockerfile*` and update every hit.

---

## 0.2 Fork Branding — Repo-Level String Replacement

**Why:** User-facing strings (CLI help, error messages, logs, TUI labels) must say "AndroidCode" so the fork is distinguishable from upstream. Missing any surface leaks the original brand and confuses users.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/cli/logo.ts` | Replace ASCII logo text "opencode" with "androidcode" |
| `packages/opencode/src/cli/ui.ts` | Replace remaining user-facing "OpenCode" / "opencode" strings with "AndroidCode" / "androidcode" |
| `packages/opencode/src/session/message.ts` | Any human-readable strings referencing the product name |
| `packages/opencode/src/config/config.ts` | Default config file name references: seed `androidcode.json` instead of `opencode.json` (keep backward-read for migration) |
| `packages/opencode/src/installation.ts` | Update `Installation.latest()` endpoint / registry references if any are brand-specific |
| `README.md` (repo root) | Replace product name, installation instructions, and quick-start commands with `androidcode` |
| `AGENTS.md` (repo root) | Update brand references in agent-facing instructions |

## Verification

- Run `grep -ri "opencode" packages/opencode/src/cli/` and confirm only historical / upstream-related comments remain.
- Run the CLI help: `bun run --cwd packages/opencode src/index.ts --help` — top line should show `androidcode`.

## Risk

- **Risk:** Over-replacing breaks internal identifiers (e.g., `OPENCODE_PURE` env var). → **Mitigation:** Only replace user-facing strings; keep env-var names and internal protocol identifiers unchanged in this phase (document in `bun-compat.md` if they must migrate later).

---

## 0.3 CI Pipeline on Bun

**Why:** The fork runs exclusively on Bun. We must verify that the inherited test suite, typecheck, and build scripts work under Bun before any Android-specific code lands.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.github/workflows/test.yml` | Ensure `runs-on` matrix still covers Linux + Windows; verify Bun setup action is used; ensure `bun turbo test:ci` is the test command |
| `.github/workflows/typecheck.yml` | Ensure command is `bun typecheck` or `bun turbo typecheck` |
| `package.json` scripts | Confirm `"test": "echo 'do not run tests from root' && exit 1"` remains as guard; confirm `"typecheck": "bun turbo typecheck"` |
| `packages/opencode/package.json` | Confirm `"test": "bun test --timeout 30000"` and `"typecheck": "tsgo --noEmit"` |
| `turbo.json` (if exists) | Verify pipeline tasks reference `test:ci` and `typecheck` with correct topological dependencies |

## Verification

- `bun turbo test:ci` passes locally (or in a Linux CI runner).
- `bun typecheck` passes from repo root.
- `bun run test:httpapi` passes from `packages/opencode`.

## Risk

- **Risk:** Some upstream dependencies are not Bun-compatible (e.g., native modules, `node-pty` patches). → **Mitigation:** Document every failing module in `bun-compat.md` with a fallback strategy (Node compat mode, polyfill, or dependency replacement).

---

## 0.4 Standalone Binary Build

**Why:** AndroidCode must be distributable as a standalone binary (like OpenCode). This verifies the build script still works after the rebrand.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/script/build.ts` | Update output binary name from `opencode` to `androidcode`; update any branding inside the build script |
| `packages/opencode/package.json` | Update `"bin"` field to `"androidcode": "./bin/androidcode"` |
| `.github/workflows/publish.yml` | Update artifact name references from `opencode` to `androidcode` |

## Verification

- `bun run --cwd packages/opencode build` completes without error.
- The resulting binary `./packages/opencode/dist/androidcode` (or `.exe` on Windows) runs and prints the help.

## Risk

- **Risk:** Bun bundler inlines absolute paths that break when the binary moves. → **Mitigation:** Run the built binary from a temp directory and verify it resolves its own path correctly.

---

## 0.5 `bun-compat.md` Documentation

**Why:** Forking from OpenCode means inheriting a dependency tree that may contain Node.js-only modules. We need a living document that records every incompatibility and its workaround so future AndroidCode phases don’t waste time rediscovering them.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `docs/bun-compat.md` | **New file.** List each upstream module that fails under Bun, the observed error, the workaround (Node compat mode / polyfill / replacement), and the last tested Bun version |

## Verification

- File exists and contains at least one entry for `node-pty` (known from `postinstall` script) and any other failing native dependency.

## Risk

- **Risk:** The doc rots as dependencies are upgraded. → **Mitigation:** Add a CI step that fails if a listed module starts passing without its workaround being removed.

---

## 0.6 `UPSTREAM_SYNC.md` — Pin-and-Rebase Policy

**Why:** A full fork must have a transparent policy for staying in sync with upstream OpenCode. Without documentation, future maintainers will guess (incorrectly) and either diverge permanently or break Android-specific modules during rebases.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `docs/UPSTREAM_SYNC.md` | **New file.** Document: (1) upstream repo URL, (2) pinned stable release tag, (3) rebase schedule (e.g., quarterly), (4) "never merge" list of Android-specific modules (tool registry, CLI commands, config schema, agents, skills), (5) conflict-resolution ownership |

## Verification

- File exists and lists at least 5 Android-specific files/directories in the "never merge" list.

## Risk

- **Risk:** The policy is ignored during a rushed security patch rebase. → **Mitigation:** Add a pre-rebase checklist script that reads `UPSTREAM_SYNC.md` and prints the protected paths.

---

## Verification (phase-wide)

- `bun turbo test:ci` green (Linux + Windows)
- `bun typecheck` green
- `bun run test:httpapi` green in `packages/opencode`
- `bun run --cwd packages/opencode build` produces a working `androidcode` binary
- `bun run --cwd packages/opencode src/index.ts --help` shows `androidcode` branding
- `grep -ri "opencode" packages/*/package.json package.json` returns zero matches for scope/name fields

## Risk (phase-wide)

- **Risk:** Rebranding touches 30+ files and a missed string causes user confusion or broken installs. → **Mitigation:** Write a snapshot test that asserts no `@opencode-ai` scope or `"opencode"` package name remains in `package.json` files, and that the CLI `--help` output contains `androidcode`.
