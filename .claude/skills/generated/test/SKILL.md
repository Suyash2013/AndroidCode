---
name: test
description: "Skill for the Test area of AndroidCode. 85 symbols across 34 files."
---

# Test

85 symbols | 34 files | Cohesion: 85%

## When to Use

- Working with code in `packages/`
- Understanding how location, tmpdir, toDefinitions work
- Modifying test-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/llm/test/recorded-scenarios.ts` | user, expectText, runGeneratedConversation, runTextScenario, runToolCallScenario (+15) |
| `packages/core/test/session-runner.test.ts` | replaySessionProjection, fragmentID, fragmentFixture, verifyEphemeralDeltas, verifyPartialFlushOnFailure (+1) |
| `packages/core/test/project-reference.test.ts` | testLayer, withTmp, withReferences, withoutReferences, withEnv |
| `packages/llm/test/recorded-utils.ts` | unique, classifiedTags, kebab, matchesSelected, cassetteName |
| `packages/core/test/permission.test.ts` | setup, setRules, assertion, waitForRequest |
| `packages/core/test/file-mutation.test.ts` | provide, instrumentWrites, withTmp |
| `packages/llm/test/lib/tool-runtime.ts` | runTools, stepState, addUsage |
| `packages/llm/test/lib/openai-chunks.ts` | deltaChunk, finishChunk, toolCallChunk |
| `packages/llm/test/executor.test.ts` | responsesLayer, expectLLMError, failWith |
| `packages/core/test/location-filesystem.test.ts` | provide, withTmp |

## Entry Points

Start here when exploring this area:

- **`location`** (Function) — `packages/core/test/fixture/location.ts:4`
- **`tmpdir`** (Function) — `packages/core/test/fixture/tmpdir.ts:4`
- **`toDefinitions`** (Function) — `packages/llm/src/tool.ts:209`
- **`runTools`** (Function) — `packages/llm/test/lib/tool-runtime.ts:23`
- **`runWeatherToolLoop`** (Function) — `packages/llm/test/recorded-scenarios.ts:90`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `location` | Function | `packages/core/test/fixture/location.ts` | 4 |
| `tmpdir` | Function | `packages/core/test/fixture/tmpdir.ts` | 4 |
| `toDefinitions` | Function | `packages/llm/src/tool.ts` | 209 |
| `runTools` | Function | `packages/llm/test/lib/tool-runtime.ts` | 23 |
| `runWeatherToolLoop` | Function | `packages/llm/test/recorded-scenarios.ts` | 90 |
| `deltaChunk` | Function | `packages/llm/test/lib/openai-chunks.ts` | 8 |
| `finishChunk` | Function | `packages/llm/test/lib/openai-chunks.ts` | 20 |
| `toolCallChunk` | Function | `packages/llm/test/lib/openai-chunks.ts` | 22 |
| `sseEvents` | Function | `packages/llm/test/lib/sse.ts` | 7 |
| `weatherToolLoopRequest` | Function | `packages/llm/test/recorded-scenarios.ts` | 54 |
| `goldenWeatherToolLoopRequest` | Function | `packages/llm/test/recorded-scenarios.ts` | 73 |
| `expectWeatherToolLoop` | Function | `packages/llm/test/recorded-scenarios.ts` | 156 |
| `expectGoldenWeatherToolLoop` | Function | `packages/llm/test/recorded-scenarios.ts` | 181 |
| `expectFinish` | Function | `packages/llm/test/recorded-scenarios.ts` | 146 |
| `gitRemote` | Function | `packages/core/test/fixture/git.ts` | 9 |
| `recordedEffectGroup` | Function | `packages/llm/test/recorded-runner.ts` | 26 |
| `recordedTests` | Function | `packages/llm/test/recorded-test.ts` | 43 |
| `run` | Function | `packages/llm/test/recorded-runner.ts` | 46 |
| `unique` | Function | `packages/llm/test/recorded-utils.ts` | 16 |
| `classifiedTags` | Function | `packages/llm/test/recorded-utils.ts` | 18 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Schema | 2 calls |
| Cluster_714 | 1 calls |
| Fixture | 1 calls |

## How to Explore

1. `gitnexus_context({name: "location"})` — see callers and callees
2. `gitnexus_query({query: "test"})` — find related execution flows
3. Read key files listed above for implementation details
