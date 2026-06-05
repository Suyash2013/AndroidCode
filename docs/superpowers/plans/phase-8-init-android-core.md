# Phase 8: `init`-Generated `android-core`

**Goal:** Replace any static, generic `android-core` skill with a generated, project-specific SKILL.md that contains only facts the model cannot deduce on its own, preserving a user-editable section across regenerations.  
**Depends on:** Phases 3, 5, 6  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §3 always-on context; §6

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase8/init-android-core` off it.
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

## 8.1 Define `android-core` generator and user-section preservation contract

**Why:** The generated `android-core` is machine-owned except for a fenced user section. Without a clear preservation contract, re-running `init` would overwrite user rules and break team conventions the user has added.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/android-core-generator.ts` | **Create.** Export `generateAndroidCore(input: DetectionResult): Effect.Effect<string>`. The output is a valid `SKILL.md` with frontmatter (`name: android-core`, `description: ...`, `category: process`, `when_to_use: ...`). The body is split into a machine-owned block and a `<!-- USER SECTION START -->` / `<!-- USER SECTION END -->` fence. On regeneration, parse the existing file, keep the fenced section, and replace everything outside the fence. |
| `packages/opencode/src/android/android-core-template.md` | **Create.** Template for the machine-owned portion: module list + graph (ASCII or bullet), target/min SDK, AGP/Kotlin/Compose versions, convention plugin list, project-specific rules derived from lint/detekt config. |

---

## 8.2 Emit project facts from the detection pass into `android-core`

**Why:** The detection pass (Phase 3) discovers module names, Gradle config, version catalogs, and KMP setup. These facts must flow into the generated skill so the agent knows the project shape without guessing.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/android-core-generator.ts` | Implement fact extraction: read `module-graph` tool output for module list and dependency edges; read `dependency-catalog` output for AGP/Kotlin/Compose versions; read `gradle.properties` and `build.gradle.kts` for target/min SDK and convention plugins. Emit only non-obvious facts (e.g., "minSdk = 24" is worth stating; "uses Gradle" is not). |
| `packages/opencode/src/android/detect.ts` | **Extend if Phase 3 created it.** Ensure the detection result type includes fields for `modules`, `versions`, `conventionPlugins`, and `kmpTargets` so the generator can consume them without re-parsing build files. |

---

## 8.3 Register generator with `init` pipeline and output path

**Why:** The generator must be discoverable by `init` and write to a path that the skill loader already scans (`.agents/skills/`).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/android/generator.ts` | Register `androidCore` generator with ID `"android-core"`. Trigger on full `init`. |
| `packages/opencode/src/android/android-core-generator.ts` | Write output to `.agents/skills/android-core/SKILL.md`. If the parent directory does not exist, create it. |
| `packages/opencode/src/skill/index.ts` | Verify that `.agents/skills/**/SKILL.md` is already scanned via `AGENTS_EXTERNAL_DIR` (it is: `AGENTS_EXTERNAL_DIR = ".agents"` in `skill/index.ts`). AndroidCode uses the existing `.agents/` convention, so **no scan-list change is needed** — generated skills written under `.agents/skills/` are discovered automatically. |

---

## Verification

- `bun typecheck` in `packages/opencode` passes.
- Manual: run `init` on a sample Android project. Verify `.agents/skills/android-core/SKILL.md` is created.
- Manual: add a user rule between `<!-- USER SECTION START -->` and `<!-- USER SECTION END -->`, re-run `init`, and confirm the user rule is preserved while machine-owned facts are updated.
- Manual: inspect the generated file and confirm it contains no generic Android 101 content (e.g., no "Android uses Activities and Fragments" unless the project actually uses Fragments and the detection pass found them).

## Risk

- **Risk:** User edits the file outside the fence and regeneration wipes them → **mitigation:** emit a loud header comment at the top of the file: "This file is regenerated by `init`. Only edit inside the `USER SECTION` fence."
- **Risk:** Detection pass fails on non-standard Gradle layouts and generates an empty skill → **mitigation:** if detection yields no facts, skip writing the file and log a warning. Do not emit an empty skill.
