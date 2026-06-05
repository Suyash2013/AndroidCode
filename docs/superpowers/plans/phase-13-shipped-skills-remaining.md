# Phase 13: Shipped Skills: Process / Analysis / Tooling Sets

**Goal:** Author the remaining shipped skills across process, analysis, and tooling categories so the generated catalog is complete and each skill meets the content-quality bar.  
**Depends on:** Phase 9  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 13

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase13/shipped-skills-remaining` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
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

## 13.1 Process Skills (`android-brainstorm`, `android-debug-workflow`, `android-migration`)

**Why:** Process skills guide the agent through non-coding workflows (planning, debugging, migration). Without them, the agent falls back to generic patterns that ignore Android-specific constraints (e.g., missing lifecycle checks during migration, skipping Logcat root-cause steps).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-brainstorm/SKILL.md` | New process skill: structured brainstorming for Android features with a constraints checklist (lifecycle, permissions, backward compat, testability). |
| `.agents/skills/android-debug-workflow/SKILL.md` | New process skill: reproducible debug workflow — capture crash → filter logcat by PID → isolate stack → hypothesize → reproduce → fix → validate. |
| `.agents/skills/android-migration/SKILL.md` | New process skill: migration checklist (deprecation mapping, API-level gating, `lint` baseline update, module-boundary impact). |
| `packages/opencode/src/skill/index.ts` | Ensure the skill scanner discovers skills in `.agents/skills/android-*/` and assigns the `process` category from frontmatter. |

## 13.2 Analysis Skills (`android-performance`, `android-security`, `android-accessibility`)

**Why:** Analysis skills give the agent concrete evaluation rubrics. Without them, performance reviews become "use less memory" platitudes; security reviews miss exported-component checks; accessibility reviews omit `contentDescription` and touch-target size rules.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-performance/SKILL.md` | New analysis skill: performance rubric (overdraw, allocation churn, background-thread blocking, `StrictMode` violation patterns, `Profileable`/`Debuggable` measurement steps). |
| `.agents/skills/android-security/SKILL.md` | New analysis skill: security checklist (exported components, `usesCleartextTraffic`, WebView JS interface, `Intent` validation, keystore usage, ProGuard/R8 rules). |
| `.agents/skills/android-accessibility/SKILL.md` | New analysis skill: accessibility rubric (minimum touch-target 48dp, `contentDescription`/`stateDescription`, color-contrast 4.5:1, focus order, `AccessibilityNodeInfo`). |
| `packages/opencode/src/skill/index.ts` | Ensure `category: analysis` is read from frontmatter and emitted into the catalog under the `analysis` group. |

## 13.3 Tooling Skills (`android-gradle`, `android-testing`, `android-ci`, `android-release`, `android-proguard`)

**Why:** Tooling skills bridge the gap between Android build/test/release mechanics and the agent's reasoning. Without them, the agent generates naive Gradle snippets that break version-catalog conventions or emits `proguard-rules.pro` entries that conflict with R8 defaults.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-gradle/SKILL.md` | New tooling skill: `build.gradle.kts` idioms (version-catalog access, `plugins` block ordering, custom task wiring, build-type/flavor merging, Gradle module boundaries). |
| `.agents/skills/android-testing/SKILL.md` | New tooling skill: test taxonomy (unit vs instrumented vs screenshot vs benchmark), `TestDispatcher` + `Dispatchers.Main` replacement, `Espresso` idling resources, `UiAutomator` vs `ComposeTest` selection matrix. |
| `.agents/skills/android-ci/SKILL.md` | New tooling skill: CI recipe templates (GitHub Actions with `gradle/gradle-build-action`, AVD caching, `lint` baseline diffs, Firebase Test Lab matrix). |
| `.agents/skills/android-release/SKILL.md` | New tooling skill: release checklist (version bump in catalog, signing config validation, `bundle` vs `apk` decision, Play Console upload vs local sideload, rollback plan). |
| `.agents/skills/android-proguard/SKILL.md` | New tooling skill: R8/ProGuard rule patterns (`keep` vs `keepclassmembers`, `-dontwarn` responsibility, `@Keep` annotation usage, library consumer rules, crash-after-minification diagnostics). |
| `packages/opencode/src/skill/index.ts` | Ensure `category: tooling` maps correctly in the generated catalog. |

## 13.4 Validation & Content-Quality Gate

**Why:** The design doc mandates a content-quality bar: every sentence must be something the model would not deduce on its own, or a concrete code pattern. A centralized validation script enforces this before any skill is accepted.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `script/validate-skills.ts` | New script: parse each `SKILL.md` frontmatter (`name`, `description`, `category`, `when_to_use`), assert `category` ∈ {`process`,`implementation`,`analysis`,`tooling`}, assert body length ≥ 500 chars, assert body contains at least one Kotlin/XML/Gradle code block, fail on "Android 101" heuristics (banlist: "prefer build.gradle.kts" standalone). |
| `.github/workflows/pr-standards.yml` | Add a step invoking `bun run script/validate-skills.ts` so skill PRs fail CI if frontmatter or quality bar is violated. |

---

## Verification

- `bun run script/validate-skills.ts` exits 0 with all 11 new skills present.
- `init --skills` regenerates the catalog; inspect output to confirm:
  - `process` group contains `android-brainstorm`, `android-debug-workflow`, `android-migration`
  - `analysis` group contains `android-performance`, `android-security`, `android-accessibility`
  - `tooling` group contains `android-gradle`, `android-testing`, `android-ci`, `android-release`, `android-proguard`
- Spot-check one skill per group by opening a test session and requesting the agent to "brainstorm a background-location feature", "audit security of this manifest", and "write a CI workflow" — agent loads the skill body on demand and follows its rubric.

## Risk

- **Skill bloat inflates context windows** → Mitigation: the catalog keeps only one-line entries per skill in always-on context; full bodies are loaded on demand. Each SKILL.md stays under ~2,500 tokens.
- **agentskills.io schema drift breaks validation** → Mitigation: validation script reads the pinned agentskills.io revision from `androidcode.json` (Phase 15) and asserts frontmatter fields against that revision; CI fails on mismatch.
