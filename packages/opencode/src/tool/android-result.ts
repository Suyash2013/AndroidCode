import { Schema } from "effect"

export const AndroidToolStatus = Schema.Literals(["success", "error", "warning"])
export type AndroidToolStatus = Schema.Schema.Type<typeof AndroidToolStatus>

export const AndroidToolErrorCode = Schema.Literals([
  "NO_DEVICE",
  "BUILD_FAILED",
  "SDK_MISSING",
  "MANIFEST_NOT_FOUND",
  "RESOURCE_NOT_FOUND",
  "GRADLE_NOT_FOUND",
  "SIGNING_CONFIG_INVALID",
  "DEPENDENCY_CONFLICT",
  "UNKNOWN_ERROR",
])
export type AndroidToolErrorCode = Schema.Schema.Type<typeof AndroidToolErrorCode>

export const ALL_ERROR_CODES = [
  "NO_DEVICE",
  "BUILD_FAILED",
  "SDK_MISSING",
  "MANIFEST_NOT_FOUND",
  "RESOURCE_NOT_FOUND",
  "GRADLE_NOT_FOUND",
  "SIGNING_CONFIG_INVALID",
  "DEPENDENCY_CONFLICT",
  "UNKNOWN_ERROR",
] as const

export class AndroidToolError extends Schema.Class<AndroidToolError>("AndroidToolError")({
  code: AndroidToolErrorCode,
  message: Schema.String,
  detail: Schema.optional(Schema.Unknown),
}) {}

export class AndroidToolResult extends Schema.Class<AndroidToolResult>("AndroidToolResult")({
  status: AndroidToolStatus,
  data: Schema.optional(Schema.Unknown),
  error: Schema.optional(AndroidToolError),
}) {}

export function makeSuccess(data?: unknown): AndroidToolResult {
  return new AndroidToolResult({ status: "success", data })
}

export function makeError(code: AndroidToolErrorCode, message: string, detail?: unknown): AndroidToolResult {
  return new AndroidToolResult({
    status: "error",
    error: new AndroidToolError({ code, message, detail }),
  })
}
