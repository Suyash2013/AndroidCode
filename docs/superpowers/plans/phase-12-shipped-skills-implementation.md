# Phase 12: Shipped Skills: Implementation Set

**Goal:** Author the 13 code-rich implementation skills from §7.2, each meeting the content-quality bar (real Kotlin snippets, no vague guidance, agentskills.io-compatible frontmatter).  
**Depends on:** Phase 9  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §7 content quality bar

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase12/shipped-skills-implementation` off it.
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

## 12.1 Skill authoring infrastructure and validation harness

**Why:** 13 skills is too many to author without a repeatable template and an automated validator. We need a harness that checks frontmatter schema, `category`, `when_to_use`, presence of real code snippets, and agentskills.io compliance.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/test/fixture/skills/agentskills-io-schema.json` | **Create.** Copy or reference the pinned agentskills.io JSON Schema revision into the repo. The design doc does not specify an exact URL; use `https://agentskills.io/schema/v1` or the latest stable revision documented at agentskills.io. If no public schema URL exists, inline a minimal schema that validates `name`, `description`, `category`, `when_to_use`. |
| `packages/opencode/test/skills/validate-skills.test.ts` | **Create.** A `bun test` suite (the repo's test runner — not Vitest) that discovers every `SKILL.md` under `.agents/skills/` (or the AndroidCode skills directory) and asserts: (1) frontmatter parses without error, (2) `name` is lowercase-kebab ≤64 chars, (3) `description` ≤1024 chars, (4) `category` is one of `process` | `implementation` | `analysis` | `tooling`, (5) `when_to_use` is non-empty, (6) body contains at least one triple-backtick Kotlin or Gradle code block. |
| `.github/workflows/pr-standards.yml` | Add a step that runs the skills validation test in CI so future skill edits are gated. |

---

## 12.2 Author implementation skills, batch A (Compose, Views, Navigation, Networking, Database, DI)

**Why:** These six skills cover the most common Android implementation areas. Each must include concrete Kotlin snippets and Gradle config, not vague "prefer X" statements.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-compose/SKILL.md` | **Create.** Frontmatter: `name: android-compose`, `category: implementation`, `when_to_use: "Use when writing, modifying, or reviewing Jetpack Compose UI"`. Body: real snippets for `remember` vs `rememberSaveable`, `derivedStateOf`, `LaunchedEffect`/`DisposableEffect`/`SideEffect`, custom `Modifier`, `CompositionLocalProvider`, and a complete `ViewModel` + `UiState` + composable wiring example. |
| `.agents/skills/android-views/SKILL.md` | **Create.** Frontmatter: `name: android-views`, `category: implementation`, `when_to_use: "Use when working with legacy View-based UI, custom views, or XML layouts"`. Body: `RecyclerView.Adapter` with `ListAdapter` + `DiffUtil`, custom `View` subclass with `onMeasure`/`onDraw`, `ViewBinding` usage, and `ConstraintLayout` chain/flow XML + programmatic equivalent. |
| `.agents/skills/android-navigation/SKILL.md` | **Create.** Frontmatter: `name: android-navigation`, `category: implementation`, `when_to_use: "Use when adding or modifying screen navigation, deep links, or back stack behavior"`. Body: Compose Navigation `NavHost` + `composable` route with arguments, `rememberNavController`, type-safe navigation with Kotlin Serialization, and a `BottomNavigationBar` wiring snippet. |
| `.agents/skills/android-networking/SKILL.md` | **Create.** Frontmatter: `name: android-networking`, `category: implementation`, `when_to_use: "Use when making HTTP requests, handling REST APIs, or configuring OkHttp/Retrofit"`. Body: Retrofit interface + `@GET`/`@POST`, OkHttp `Interceptor` for auth headers, Kotlinx Serialization converter setup, and a `Repository` layer that maps DTOs to domain models with `Result` wrapper. |
| `.agents/skills/android-database/SKILL.md` | **Create.** Frontmatter: `name: android-database`, `category: implementation`, `when_to_use: "Use when persisting data with Room, DataStore, or SQLite"`. Body: Room `@Entity` + `@Dao` + `@Database` with `Migration`, `DataStore` preferences with proto, and a `Repository` that exposes `Flow` from `Room` queries. |
| `.agents/skills/android-di/SKILL.md` | **Create.** Frontmatter: `name: android-di`, `category: implementation`, `when_to_use: "Use when adding or modifying dependency injection with Hilt/Dagger or Koin"`. Body: Hilt `@HiltAndroidApp`, `@HiltViewModel`, `@Module` + `@Provides`, and a Koin `module { single { ... } }` + `startKoin` alternative for KMP or test environments. |

---

## 12.3 Author implementation skills, batch B (Architecture, Permissions, KMP, Deeplinks, Widgets, Modularization, WorkManager)

**Why:** These seven skills cover architecture patterns, platform APIs, KMP, and system integration. The `android-kmp` skill is especially important because Phase 14 depends on it.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `.agents/skills/android-architecture/SKILL.md` | **Create.** Frontmatter: `name: android-architecture`, `category: implementation`, `when_to_use: "Use when structuring ViewModels, UI state, or unidirectional data flow"`. Body: MVI-lite `sealed interface UiState` + `sealed interface Event`, `ViewModel` with `StateFlow`, and a composable that collects state with `collectAsStateWithLifecycle`. |
| `.agents/skills/android-permissions/SKILL.md` | **Create.** Frontmatter: `name: android-permissions`, `category: implementation`, `when_to_use: "Use when requesting runtime permissions or handling permission rationale"`. Body: `ActivityResultContracts.RequestPermission()` launcher, `shouldShowRequestPermissionRationale()` check, and a `PermissionState` sealed class with `Granted`, `Denied`, `PermanentlyDenied`. |
| `.agents/skills/android-kmp/SKILL.md` | **Create.** Frontmatter: `name: android-kmp`, `category: implementation`, `when_to_use: "Use when writing shared Kotlin Multiplatform code or configuring expect/actual pairs"`. Body: `expect class Platform` / `actual class Platform` in `androidMain` and `commonMain`, a shared `build.gradle.kts` with `kotlin("multiplatform")`, `commonMain.dependencies` block, and a `ViewModel` in `commonMain` using `coroutines` with `expect/actual` `DispatcherProvider`. |
| `.agents/skills/android-deeplinks/SKILL.md` | **Create.** Frontmatter: `name: android-deeplinks`, `category: implementation`, `when_to_use: "Use when adding URI deep links or App Links to the project"`. Body: `AndroidManifest.xml` `intent-filter` with `data android:scheme`, Compose Navigation deep link `navDeepLink { uriPattern = ... }`, and verification with `adb shell am start -W -a android.intent.action.VIEW -d`. |
| `.agents/skills/android-widgets/SKILL.md` | **Create.** Frontmatter: `name: android-widgets`, `category: implementation`, `when_to_use: "Use when building or updating app widgets / glances"`. Body: `GlanceAppWidget` subclass + `GlanceAppWidgetReceiver`, `Box`/`Text`/`Button` Glance composables, `actionStartActivity`, and `updateAll` periodic worker snippet. |
| `.agents/skills/android-modularization/SKILL.md` | **Create.** Frontmatter: `name: android-modularization`, `category: implementation`, `when_to_use: "Use when splitting a monolith into modules or redesigning module boundaries"`. Body: `build.gradle.kts` `api` vs `implementation` dependency example, a feature module `plugins { id("com.android.library") }`, and a convention plugin snippet that applies `kotlin("android")` + `kotlin("kapt")` across modules. |
| `.agents/skills/android-workmanager/SKILL.md` | **Create.** Frontmatter: `name: android-workmanager`, `category: implementation`, `when_to_use: "Use when scheduling background work that must survive process death"`. Body: `Worker` subclass with `doWork()`, `OneTimeWorkRequestBuilder` + `setConstraints(Constraints.Builder().setRequiredNetworkType(...))`, and `WorkManager.getInstance(context).enqueueUniqueWork()` with `ExistingWorkPolicy.KEEP`. |

---

## 12.4 Validate against agentskills.io revision and catalog integration

**Why:** The acceptance criteria require each skill to validate against the pinned agentskills.io revision and to appear in the generated catalog (Phase 9). We must verify both.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/test/skills/validate-skills.test.ts` | Run the test and fix any frontmatter or schema violations in the 13 new skills. Ensure all skills pass before the PR is opened. |
| `packages/opencode/src/android/catalog-generator.ts` | If the catalog generator is already merged from Phase 9, run `init --skills` and verify that all 13 skills appear under `## implementation`. If any are missing, fix the generator's scan path or the skills' directory layout. |
| `docs/superpowers/shipped-skills-index.md` | **Create.** Index document listing every shipped skill with its category, when_to_use, and the file path. This is human-facing documentation, not machine-owned. |

---

## Verification

- `bun turbo test:ci` green, including the new `validate-skills.test.ts`.
- `bun typecheck` green.
- Manual: run `init --skills` and confirm the catalog contains all 13 implementation skills under `## implementation`.
- Manual: spot-check 3 skills (`android-compose`, `android-kmp`, `android-workmanager`) by reading their `SKILL.md` files and confirming they contain real Kotlin/Gradle snippets inside triple backticks.
- Manual: verify that the `skill` tool can load each of the 13 skills by name without error.

## Risk

- **Risk:** Skills bloat past the recommended 10k–20k character body size and degrade reasoning on constrained context windows → **mitigation:** enforce a soft limit in the validator (warn if >20k chars, error if >40k). Split oversized skills into focused sub-skills (e.g., `android-compose` could split into `android-compose-state` and `android-compose-layout` if it grows too large).
- **Risk:** agentskills.io schema revision changes after pinning and breaks validation → **mitigation:** pin the revision in `androidcode.json` (e.g., `"agentskills_revision": "v1.2"`) and document the pin date. The validator loads the pinned schema from the fixture file, not from a live URL, so external drift does not break CI.
- **Risk:** Code snippets become stale as Android/Kotlin/Gradle versions evolve → **mitigation:** add a `last_verified` frontmatter field (AndroidCode extension, ignored by standard agents) and schedule a quarterly review. The validator does not enforce `last_verified`; it is documentation only.
