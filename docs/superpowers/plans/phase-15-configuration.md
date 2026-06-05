# Phase 15: Configuration

**Goal:** Finalize the `androidcode.json` schema, env-var override layer, and seed-if-absent behavior in `init`.  
**Depends on:** Phases 2, 10  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 15

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase15/configuration` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
- **Commits:** conventional-commit format `<type>(<scope>): <subject>` (`<type>` ∈ feat/fix/docs/chore/refactor/test; scope optional). Keep the `Co-Authored-By:` footer on AI-assisted commits.

**Compliance gate — must pass BEFORE the phase's final commit / PR merge** (enforced by `.github/workflows/pr-standards.yml`; non-compliant PRs auto-close ~2h after flagging):

- [ ] PR **title** matches `^(feat|fix|docs|chore|refactor|test)\s*(\([a-zA-Z0-9-]+\))?\s*:`
- [ ] PR **template** filled with real content — all five sections: *Issue for this PR* · *Type of change* (≥1 box) · *What does this PR do?* (genuine, not placeholder/AI-wall-of-text) · *How did you verify your code works?* (non-empty) · *Checklist* (≥2 boxes)
- [ ] **Linked issue** via `Fixes #<n>` / `Closes #<n>` _(auto-skipped for `docs`/`refactor`/`feat` PRs)_
- [ ] `bun turbo test:ci` green (unit — Linux + Windows)
- [ ] `bun typecheck` green (TypeScript)
- [ ] `bun run test:httpapi` green in `packages/opencode` (HttpApi gates — Linux), where applicable

**Phase done = a compliant, green PR merged to `dev`.**

---

## 15.1 `androidcode.json` Schema Definition

**Why:** OpenCode uses `opencode.json` for project-level config. AndroidCode needs an Android-specific superset schema that carries model assignments per agent, catalog options, SDK paths, and agentskills.io revision pinning — without breaking compatibility with the upstream config loader.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/config/androidcode-schema.ts` | New Schema (Effect `Schema.Class` or `Schema.Struct`): `AndroidCodeConfig` with fields `models` (record of agent→model), `catalog` (`autoLoad` boolean, `categories` string array), `sdk_path` (string), `agentskills_revision` (string, pinned), `permissions` (same shape as upstream permission config), and `$schema` (string). Use branded schemas for path-like fields. |
| `packages/opencode/src/config/config.ts` | Extend the config-loading cascade: after loading `opencode.json` / `opencode.jsonc`, also attempt `androidcode.json` / `androidcode.jsonc` from project root (and `.agents/` if present). Merge with `mergeDeep` so `androidcode.json` wins on overlapping keys. Normalize `$schema` to `https://androidcode.ai/config.json`. |
| `packages/opencode/src/config/parse.ts` | Add `AndroidCodeConfig` to the schema registry so `loadConfig` can validate against it and emit typed decode errors. |

## 15.2 Environment-Variable Override Layer

**Why:** CI/CD and scripting require ephemeral overrides without mutating the committed `androidcode.json`. An env-var layer applied after file loading ensures `ANDROIDCODE_MODEL` can override the default model for a single run.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/config/config.ts` | After all file-based config is merged, read `ANDROIDCODE_MODEL`, `ANDROIDCODE_SDK_PATH`, `ANDROIDCODE_AGMSKILLS_REVISION`, and `ANDROIDCODE_CATALOG_AUTOLOAD` from `process.env`. Override the corresponding config keys. Log each override at `info` level so users can audit. |
| `packages/opencode/src/env.ts` | Add the four `ANDROIDCODE_*` env keys to the `Env.Service` schema so they are typed and discoverable. |
| `packages/opencode/test/config/config.test.ts` | Add test: seed a config file with one model, set `ANDROIDCODE_MODEL` env var, assert `config.get()` returns the env override. |

## 15.3 Seed-If-Absent Behavior in `init`

**Why:** `init` must create `androidcode.json` on first run so the user has a starting point, but it must never overwrite user edits on subsequent runs. Violating this erases custom model assignments and permissions.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/generator.ts` | In the Phase 3 generator registry, register a generator for `androidcode.json` (the `init` command in `src/cli/cmd/init.ts` invokes the registry). Generator checks for existing `androidcode.json` / `androidcode.jsonc` in project root. If absent, write a seeded file containing detected `sdk_path`, default model map (`android-build` → default Sonnet, `android-plan` → default Opus), and the current agentskills.io revision pin. If present, skip with a log message. |
| `packages/opencode/src/config/config.ts` | Ensure the global config seeding logic (which writes a default `opencode.json`) does not conflict with the project-level `androidcode.json` seeding — they operate on different paths and different lifecycle triggers. |
| `packages/opencode/test/project/init.test.ts` | Add test: run `init` twice in the same temp directory. First run creates `androidcode.json`. Second run leaves it untouched; assert file content (e.g., a known seed timestamp) is unchanged. |

## 15.4 Schema Documentation & JSON Schema File

**Why:** Editor completion and external tooling depend on a published JSON Schema. Shipping the schema file alongside the code ensures IDEs and validation scripts stay in sync.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `docs/schema/androidcode-config.json` | New JSON Schema derived from the TypeScript `AndroidCodeConfig` shape. Fields: `models`, `catalog`, `sdk_path`, `agentskills_revision`, `permissions`, `$schema`. Include `description` and `default` annotations for each key. |
| `packages/opencode/src/config/androidcode-schema.ts` | Export a `schemaUrl` constant pointing to `https://androidcode.ai/config.json` so seeding and validation reference the canonical URL. |
| `README.md` | Add a "Configuration" section documenting `androidcode.json`, env overrides, and the seed-if-absent rule. |

---

## Verification

- `bun typecheck` in `packages/opencode` passes with the new schema types.
- `bun test` in `packages/opencode` passes the seed-idempotency and env-override tests.
- Manual test:
  ```bash
  mkdir /tmp/androidcode-config-test && cd /tmp/androidcode-config-test
  # run init
  ../../../packages/opencode/src/cli/cmd/init.ts
  cat androidcode.json # verify seeded with sdk_path and model defaults
  # edit androidcode.json: change android-build model to "custom-model"
  # run init again
  ../../../packages/opencode/src/cli/cmd/init.ts
  cat androidcode.json # model must still be "custom-model"
  # run with env override
  ANDROIDCODE_MODEL="override-model" ../../../packages/opencode/src/cli/cmd/init.ts --dry-run
  # verify printed log shows env override
  ```

## Risk

- **Config loader merge conflicts with upstream `opencode.json` keys** → Mitigation: `androidcode.json` is a separate file in the cascade, merged after `opencode.json`. Overlapping keys are intentional overrides (e.g., `models` in `androidcode.json` shadows upstream `model` only when the Android-specific agent keys are present). Document the precedence in `README.md`.
- **Env-var names collide with future upstream additions** → Mitigation: prefix everything with `ANDROIDCODE_` (not `OPENCODE_`), keeping the AndroidCode namespace distinct. Register env keys in `env.ts` so collisions are caught at type-check time.
