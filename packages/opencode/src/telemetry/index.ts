import { Context, Duration, Effect, Layer, Schedule } from "effect"
import { Config } from "@/config/config"
import { InstanceState } from "@/effect/instance-state"
import * as Log from "@opencode-ai/core/util/log"

const log = Log.create({ service: "telemetry" })

const METRICS_ENDPOINT = "https://telemetry.androidcode.ai/v1/metrics"

type State = {
  buffer: Array<{ event: string; timestamp: number; properties?: Record<string, unknown> }>
  enabled: boolean
  flushing: boolean
}

const FLUSH_INTERVAL_MS = 60_000

export interface Interface {
  readonly record: (event: string, properties?: Record<string, unknown>) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@androidcode/Telemetry") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const configSvc = yield* Config.Service

    const state = yield* InstanceState.make<State>(() =>
      Effect.gen(function* () {
        const cfg = yield* configSvc.get()
        return { buffer: [], enabled: cfg.telemetry === true, flushing: false }
      }),
    )

    const flush = () =>
      Effect.gen(function* () {
        const s = yield* InstanceState.get(state)
        if (!s.enabled || s.buffer.length === 0 || s.flushing) return

        s.flushing = true
        const batch = s.buffer.splice(0, s.buffer.length)
        s.flushing = false

        yield* Effect.tryPromise({
          try: () =>
            fetch(METRICS_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metrics: batch }),
            }),
          catch: (err) => {
            log.warn("failed to flush telemetry", { error: String(err) })
          },
        })
      }).pipe(Effect.ignore)

    const record = (event: string, properties?: Record<string, unknown>) =>
      Effect.gen(function* () {
        const s = yield* InstanceState.get(state)
        if (!s.enabled) return

        s.buffer.push({
          event,
          timestamp: Date.now(),
          properties,
        })
      })

    yield* flush().pipe(
      Effect.repeat(Schedule.spaced(Duration.millis(FLUSH_INTERVAL_MS))),
      Effect.forkScoped,
    )

    return Service.of({ record })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(Config.defaultLayer))

export * as Telemetry from "./index"
