import { Schema } from "effect"
import { JsonRpc } from "./jsonrpc"

export const isRequest = Schema.is(JsonRpc.Request)
export const isNotification = Schema.is(JsonRpc.Notification)
export const isBatch = (input: unknown): input is Array<unknown> => Array.isArray(input)

export * as JsonRpcGuards from "./jsonrpc-guards"
