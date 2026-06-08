# Phase 17: Opt-In Telemetry

**Goal:** Ship transparent, opt-in telemetry that never collects code content, file paths, or model prompts, with a clear disclosure and a test that proves the exclusion.  
**Depends on:** Phase 0  
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §11 Phase 17

---

## Branch & Delivery (required — applies to this whole phase)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest (`git fetch origin && git switch dev && git pull`), then cut `phase17/telemetry` off it — so the phase is validated against the current CI/compliance config. One phase = one branch = one PR.
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

## 17.1 Telemetry Payload Schema & Collector Service

**Why:** Telemetry must be structured so the collector can aggregate without ever touching free-form text that might contain code or paths. A strict schema with enum/bounded fields guarantees privacy by design.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/telemetry/schema.ts` | New Effect schema `TelemetryEvent` with fields: `event_type` (enum: `session_start`, `tool_invoke`, `agent_dispatch`, `init_run`, `error`), `agent_id` (enum of known agent IDs), `tool_id` (enum of known tool IDs), `duration_ms` (non-negative integer), `success` (boolean), `error_code` (enum of `ToolResult` error codes or `null`), `platform` (enum: `linux`, `macos`, `windows`), `androidcode_version` (string), `timestamp` (ISO8601). Explicitly **no** `file_path`, `code_snippet`, `prompt_text`, or `session_message` fields. |
| `packages/opencode/src/telemetry/collector.ts` | New `TelemetryCollector` service (Effect `Context.Service`): buffers events in memory (max 50), flushes to a telemetry endpoint (configurable in `androidcode.json`, default `https://telemetry.androidcode.ai/v1/events`) via `HttpClient`. Batches events as a JSON array. Includes `X-Telemetry-Source: androidcode` header. |
| `packages/opencode/src/telemetry/index.ts` | Barrel: exports `TelemetryCollector`, `TelemetryEvent`, and `defaultLayer`. |

## 17.2 Opt-In Gate & Settings Integration

**Why:** Telemetry must be off by default and require explicit user opt-in. The setting lives in `androidcode.json` so it is user-visible and version-controllable.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/config/androidcode-schema.ts` | Add `telemetry: Schema.optional(Schema.Struct({ enabled: Schema.Boolean, endpoint: Schema.optional(Schema.String) }))` to `AndroidCodeConfig`. Default is absent (equivalent to `enabled: false`). |
| `packages/opencode/src/telemetry/collector.ts` | On service initialization, read `Config.Service` and check `config.telemetry?.enabled`. If absent or false, replace the flush effect with `Effect.void` and log `telemetry disabled` at `info` level. If true, proceed with batching and flushing. |
| `packages/opencode/src/cli/cmd/init.ts` | When seeding `androidcode.json`, include `telemetry: { enabled: false }` with a comment/disclosure block linking to the privacy policy. |
| `packages/opencode/src/cli/cmd/stats.ts` | Add a `--telemetry` flag that prints the current telemetry status (enabled/disabled, endpoint, event count in buffer) without sending anything. |

## 17.3 Instrumentation Points (Agent, Tool, Session)

**Why:** Telemetry is only useful if it captures measurable signals (agent usage, tool success rates, init runs). Instrumentation must be minimal and never block the hot path.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/agent/agent.ts` | After agent dispatch resolves, fire a `TelemetryEvent` of type `agent_dispatch` with `agent_id` and `duration_ms`. Wrap in `Effect.ignore` so telemetry failures never crash the agent loop. |
| `packages/opencode/src/tool/registry.ts` | After a tool executes, fire `tool_invoke` with `tool_id`, `duration_ms`, `success`, and `error_code` (from `ToolResult` if present). |
| `packages/opencode/src/session/session.ts` | Fire `session_start` once per session with `platform` and `androidcode_version`. |
| `packages/opencode/src/cli/cmd/init.ts` | Fire `init_run` on each `init` invocation (in the Phase 3 init command handler) with a boolean `full` vs `--skills` vs `--context` flag. |

## 17.4 Provable Exclusion Test

**Why:** The acceptance criteria require a test that proves payloads exclude code, paths, and prompts. This test must inspect the actual JSON that would be sent over the wire.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/test/telemetry/privacy.test.ts` | New test suite: (1) Create a mock telemetry endpoint that captures payloads. (2) Run a session that exercises a tool (`read`) on a real file path and an agent dispatch. (3) Assert every captured payload's keys are a subset of the allowed `TelemetryEvent` schema keys. (4) Deep-scan every string value in the payload for the file path substring and for the prompt text; assert zero matches. (5) Verify `code_snippet`, `prompt_text`, `file_path`, and `message_content` keys are absent. |
| `packages/opencode/test/telemetry/collector.test.ts` | New test: enable telemetry, emit events, assert they batch and flush correctly. Assert no events are buffered when telemetry is disabled. |

## 17.5 Privacy Disclosure & Documentation

**Why:** Legal and trust requirements demand a visible disclosure before the user enables telemetry.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `PRIVACY.md` | New file at repo root: what is collected (event types, counters, durations, platform, version), what is **never** collected (code, paths, prompts, file names, model outputs), retention policy (30 days), how to opt in/out (`androidcode.json` + env var `ANDROIDCODE_TELEMETRY_ENABLED`). |
| `packages/opencode/src/cli/cmd/init.ts` | On first `init`, print a short terminal disclosure referencing `PRIVACY.md` and stating telemetry is off by default. |

---

## Verification

- `bun test` in `packages/opencode` passes `telemetry/privacy.test.ts` and `telemetry/collector.test.ts`.
- `bun typecheck` passes with the new telemetry types integrated into agent/tool/session paths.
- Manual test:
  ```bash
  # telemetry off by default
  androidcode init --dry-run
  # verify no telemetry flush HTTP calls in debug logs

  # enable telemetry
  echo '{ "telemetry": { "enabled": true } }' > androidcode.json
  androidcode stats --telemetry
  # verify status shows enabled and endpoint
  ```
- Run the privacy test in isolation and confirm it fails if any developer accidentally adds a `file_path` or `prompt_text` field to `TelemetryEvent` in the future.

## Risk

- **Telemetry endpoint downtime degrades user experience** → Mitigation: collector uses `Effect.timeout` (5s) and `Effect.ignore` on flush failures. Buffers are in-memory only; no disk queue. If the endpoint is down, events are silently dropped after the timeout.
- **Future developers accidentally add sensitive fields to the schema** → Mitigation: the `privacy.test.ts` test is a regression guard. Any new field added to `TelemetryEvent` must be reviewed; if it is a string field, the test scans for path/prompt leaks. CI fails on schema drift that breaks the privacy invariant.
