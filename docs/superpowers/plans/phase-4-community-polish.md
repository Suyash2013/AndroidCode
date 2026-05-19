# Phase 4: Community & Polish (Weeks 29–36)

**Goal:** Validate plugin system, design skill registry, add opt-in telemetry, write documentation, and run beta testing.

**Prerequisite:** Phase 3 must be complete (all tools, agents, skills functional).

---

## 4.1 Plugin System Validation

**Files:**
| File | Action |
| :--- | :--- |
| `packages/opencode/src/plugin/index.ts` | Verify plugin hooks fire correctly for Android tools. Add `android.tool.preExecute` and `android.tool.postExecute` hooks if not present. |
| `packages/opencode/test/plugin/` | Add tests for Android-specific plugin lifecycle. |

**Test Plugin:** Create `@androidcode/test-plugin` in a separate directory (not in core repo) to validate npm distribution and hook system.

---

## 4.2 Skill Registry Design

**File:** `docs/superpowers/design/skill-registry.md`

**Specification:**
- Registry format: npm-like with `index.json` at a well-known URL.
- Each entry: `name`, `description`, `version`, `downloadUrl`, `checksum`, `orchestration` summary.
- Submission process: PR to registry repo with skill files + eval evidence.
- Verification: Automated CI runs skill parsing + adversarial tests.

**Implementation:**
- `packages/opencode/src/skill/registry.ts` — Client for querying the registry.
- `packages/opencode/src/cli/cmd/skills/` — `androidcode skills search <query>`, `androidcode skills install <name>`, `androidcode skills update`.

---

## 4.3 Opt-In Telemetry

**Principles:**
- Opt-in ONLY. Ask on first launch.
- Never collect: code content, file paths, model prompts, user messages.
- Collect: skill activation accuracy, tool success/failure rates (no arguments), agent usage counts, platform, android CLI availability.

**Files:**
| File | Action |
| :--- | :--- |
| `packages/opencode/src/telemetry/index.ts` | **Create.** Effect service for batching and sending telemetry. |
| `packages/opencode/src/config/config.ts` | Add `telemetry: Schema.optional(Schema.Boolean)` to config. |
| `packages/opencode/src/session/system.ts` | On first launch, if `telemetry` is unset, prompt user. |

---

## 4.4 Documentation

**Files to create:**
| File | Content |
| :--- | :--- |
| `packages/web/src/content/docs/en/androidcode.mdx` | Main AndroidCode documentation: installation, quick start, config reference. |
| `packages/web/src/content/docs/en/tools-android.mdx` | Android-specific tool reference. |
| `packages/web/src/content/docs/en/skills-android.mdx` | Android skill reference + authoring guide. |
| `packages/web/src/content/docs/en/agents-android.mdx` | Android agent reference. |
| `docs/UPSTREAM_SYNC.md` | Monthly rebase strategy, `never-merge` list. |
| `docs/BUN_COMPAT.md` | Document any Bun-specific issues found in Phase 1. |

---

## 4.5 Beta Testing

**Plan:**
1. Tag `v0.1.0-beta.1`.
2. Publish to npm as `@androidcode/cli`.
3. Recruit 5–10 Android developers for feedback.
4. Track issues in GitHub with `beta-feedback` label.
5. Iterate for 4 weeks, cutting beta.2, beta.3 as needed.

---

## 4.6 Phase 4 Completion Criteria

- [ ] Plugin system validated with a real external plugin.
- [ ] Skill registry client implemented (`search`, `install`, `update`).
- [ ] Telemetry is opt-in, transparent, and collects only approved metrics.
- [ ] Documentation covers all AndroidCode-specific features.
- [ ] Beta release is published and receiving feedback.
