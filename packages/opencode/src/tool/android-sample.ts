import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { makeError, makeSuccess } from "./android-result"

export const Parameters = Schema.Struct({})

export const AndroidSampleTool = Tool.define(
  "android-sample",
  Effect.succeed({
    description: [
      "A sample Android tool that returns a structured JSON result with a `status` field.",
      "On success, returns `{ status: \"success\", data: { hello: \"android\" } }`.",
      "On error, returns `{ status: \"error\", error: { code: \"UNKNOWN_ERROR\", message: \"...\" } }`.",
      "The agent can branch on `error.code` to suggest recovery actions (e.g., NO_DEVICE → start an emulator).",
    ].join("\n"),
    parameters: Parameters,
    execute: () =>
      Effect.succeed({
        title: "android-sample",
        output:
          process.env.ANDROIDCODE_FORCE_SAMPLE_ERROR === "1"
            ? JSON.stringify(makeError("UNKNOWN_ERROR", "Forced sample error for testing"))
            : JSON.stringify(makeSuccess({ hello: "android" })),
        metadata: {},
      }),
  }),
)
