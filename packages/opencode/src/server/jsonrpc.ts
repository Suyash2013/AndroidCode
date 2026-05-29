import { Schema } from "effect"

const IdSchema = Schema.Union([Schema.String, Schema.Number, Schema.Null])

export const Request = Schema.Struct({
  jsonrpc: Schema.Literal("2.0"),
  id: Schema.optional(IdSchema),
  method: Schema.String,
  params: Schema.optional(Schema.Union([Schema.Struct({}), Schema.Array(Schema.Unknown)])),
})
export type Request = Schema.Schema.Type<typeof Request>

export const Notification = Schema.Struct({
  jsonrpc: Schema.Literal("2.0"),
  method: Schema.String,
  params: Schema.optional(Schema.Union([Schema.Struct({}), Schema.Array(Schema.Unknown)])),
})
export type Notification = Schema.Schema.Type<typeof Notification>

export const SuccessResponse = Schema.Struct({
  jsonrpc: Schema.Literal("2.0"),
  id: IdSchema,
  result: Schema.Unknown,
})
export type SuccessResponse = Schema.Schema.Type<typeof SuccessResponse>

export const ErrorObject = Schema.Struct({
  code: Schema.Number,
  message: Schema.String,
  data: Schema.optional(Schema.Unknown),
})
export type ErrorObject = Schema.Schema.Type<typeof ErrorObject>

export const ErrorResponse = Schema.Struct({
  jsonrpc: Schema.Literal("2.0"),
  id: IdSchema,
  error: ErrorObject,
})
export type ErrorResponse = Schema.Schema.Type<typeof ErrorResponse>

export type Response = SuccessResponse | ErrorResponse

export function success(id: string | number | null, result: unknown): SuccessResponse {
  return { jsonrpc: "2.0", id, result } as SuccessResponse
}

export function error(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): ErrorResponse {
  return { jsonrpc: "2.0", id, error: { code, message, ...(data !== undefined ? { data } : {}) } } as ErrorResponse
}

export function notification(method: string, params?: unknown): Notification {
  const result: Notification = params !== undefined
    ? ({ jsonrpc: "2.0", method, params } as unknown as Notification)
    : ({ jsonrpc: "2.0", method } as unknown as Notification)
  return result
}

export * as JsonRpc from "./jsonrpc"
