# Phase 1: Structured Tool-Result Error Model

**Goal:** Define the shared structured result contract every Android tool returns so the agent can branch on `error.code` and auto-recover.
**Depends on:** Phase 0
**Design ref:** `docs/superpowers/design/2026-04-20-androidcode-ai-agent-design.md` §4 Tool Error Handling Strategy

---

## Branch & Delivery (required)

> This phase is developed in isolation and merged on its own. It is **not done** until its PR is compliant, green, and merged to `dev`. See §11 "Per-Phase Development Workflow" in the design doc.

- **Branch:** sync `dev` to latest, then cut `phase1/tool-result-errors` off it.
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

## 1.1 Define `AndroidToolResult` Schema & Error-Code Enum

**Why:** The existing `ToolResult` in `packages/opencode/src/session/message.ts` is a message-level schema (state, toolCallId, result string). Android tools need a richer, structured output layer — status, typed data, and a machine-readable error code — so the agent can reason about failures (e.g., `NO_DEVICE` → suggest `adb start-server`).

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/android-result.ts` | **New file.** Define `AndroidToolStatus` enum (`success`, `error`, `warning`); define `AndroidToolErrorCode` enum (`NO_DEVICE`, `BUILD_FAILED`, `SDK_MISSING`, `MANIFEST_NOT_FOUND`, `RESOURCE_NOT_FOUND`, `GRADLE_NOT_FOUND`, `SIGNING_CONFIG_INVALID`, `DEPENDENCY_CONFLICT`, `UNKNOWN_ERROR`, …); define `AndroidToolResult` Schema.Class with `{ status, data?: unknown, error?: { code: AndroidToolErrorCode, message: string, detail?: unknown } }` |
| `packages/opencode/src/tool/android-result.ts` | Export helper `makeSuccess(data)` and `makeError(code, message, detail?)` that return typed `AndroidToolResult` instances |

## Verification

- Run `bun test --cwd packages/opencode src/tool/android-result.ts` (or add a test in `packages/opencode/test/tool/android-result.test.ts`) asserting that `makeError("NO_DEVICE", "no emulator").error.code === "NO_DEVICE"`.
- `bun typecheck` passes with the new module imported somewhere (e.g., in the sample tool of 1.2).

## Risk

- **Risk:** Confusing the message-level `ToolResult` with the Android tool output contract. → **Mitigation:** Name the new type `AndroidToolResult` (not `ToolResult`) and keep it in the `tool/` directory, not `session/`.

---

## 1.2 Sample Tool Using the Contract

**Why:** A real tool exercising the contract proves the schema is usable, the registry can consume it, and the agent receives structured output. It also serves as a living reference implementation for later gap-filler tools.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/src/tool/android-sample.ts` | **New file.** Implement `AndroidSampleTool` using `Tool.define("android-sample", ...)`. Parameters: `{}`. Execute returns `Effect.Effect<ExecuteResult>` where `output` is `JSON.stringify(makeSuccess({ hello: "android" }))` on happy path, or `JSON.stringify(makeError("UNKNOWN_ERROR", "..."))` on a forced error branch triggered by an env var (`ANDROIDCODE_FORCE_SAMPLE_ERROR=1`). |
| `packages/opencode/src/tool/registry.ts` | Import and yield `AndroidSampleTool` inside the registry `Effect.all` block; add it to the `builtin` list (behind a RuntimeFlag or unconditionally for this phase). |
| `packages/opencode/src/tool/registry.ts` | Ensure the registry's `execute` wrapper does not strip the JSON structure — the tool's `output` is already a JSON string, so truncation and passthrough are safe. |

## Verification

- Start a session or use the debug CLI to invoke `android-sample`.
- Verify the tool returns a JSON string that parses to `{ "status": "success", "data": { "hello": "android" } }`.
- Set `ANDROIDCODE_FORCE_SAMPLE_ERROR=1`, rerun, and verify the tool returns `{ "status": "error", "error": { "code": "UNKNOWN_ERROR", "message": "..." } }`.

## Risk

- **Risk:** The agent doesn't "know" how to interpret `AndroidToolResult` because it only sees the `output` string. → **Mitigation:** Include a compact usage note in the tool's `description` text: "Returns JSON with a `status` field and an `error.code` the agent can branch on." This is sufficient until Phase 10 agents add explicit branching logic.

---

## 1.3 Unit Tests for the Contract

**Why:** Without tests the contract will drift as later tools are added. We need guardrails that assert `makeSuccess`, `makeError`, and the Schema encode/decode round-trip correctly.

**Files to modify:**

| File | Change |
| :--- | :--- |
| `packages/opencode/test/tool/android-result.test.ts` | **New file.** Tests: (a) `makeSuccess` produces valid `AndroidToolResult`, (b) `makeError` with each enum code produces valid result, (c) JSON round-trip preserves code and message, (d) Schema decode rejects an invalid status string, (e) Schema decode rejects an unknown error code. |

## Verification

- `bun test --cwd packages/opencode test/tool/android-result.test.ts` passes.

## Risk

- **Risk:** Tests live in the wrong directory and are skipped by CI. → **Mitigation:** Verify `bun turbo test:ci` discovers the new test file (check the JUnit artifact list).

---

## Verification (phase-wide)

- `bun typecheck` green
- `bun turbo test:ci` green
- `bun run test:httpapi` green in `packages/opencode`
- The sample tool `android-sample` returns JSON-structured success and error outputs
- The agent prompt / tool description mentions the `status` + `error.code` convention

## Risk (phase-wide)

- **Risk:** The contract is too generic (e.g., `data: unknown`) and later tools invent incompatible shapes. → **Mitigation:** Document in `android-result.ts` that each tool must document its `data` schema in the tool description; in later phases we may add per-tool `data` sub-schemas.
