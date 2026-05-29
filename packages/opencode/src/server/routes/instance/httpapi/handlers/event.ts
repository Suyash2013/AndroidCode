import { Bus } from "@/bus"
import { Config } from "@/config/config"
import { JsonRpc } from "@/server/jsonrpc"
import * as Log from "@opencode-ai/core/util/log"
import { Effect } from "effect"
import * as Stream from "effect/Stream"
import { HttpServerResponse } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import * as Sse from "effect/unstable/encoding/Sse"
import { EventApi } from "../groups/event"

const log = Log.create({ service: "server" })

function eventData(data: unknown, useJsonRpc: boolean): Sse.Event {
  return {
    _tag: "Event",
    event: "message",
    id: undefined,
    data: JSON.stringify(useJsonRpc ? JsonRpc.notification("event", data) : data),
  }
}

function eventResponse(bus: Bus.Interface, useJsonRpc: boolean) {
  return Effect.gen(function* () {
    // Subscribe eagerly: the bus subscription is acquired in the request scope
    // at this yield, so any publish from now on is queued for the body-pump
    // fiber to drain — closing the race where Stream.concat(server.connected,
    // lazy-subscribe) used to drop publishes in the prefix-consume window.
    const events = (yield* bus.subscribeAll()).pipe(
      Stream.takeUntil((event) => event.type === Bus.InstanceDisposed.type),
    )
    const heartbeat = Stream.tick("10 seconds").pipe(
      Stream.drop(1),
      Stream.map(() => ({ id: Bus.createID(), type: "server.heartbeat", properties: {} })),
    )

    log.info("event connected")
    return HttpServerResponse.stream(
      Stream.make({ id: Bus.createID(), type: "server.connected", properties: {} }).pipe(
        Stream.concat(events.pipe(Stream.merge(heartbeat, { haltStrategy: "left" }))),
        Stream.map((data) => eventData(data, useJsonRpc)),
        Stream.pipeThroughChannel(Sse.encode()),
        Stream.encodeText,
        Stream.ensuring(Effect.sync(() => log.info("event disconnected"))),
      ),
      {
        contentType: "text/event-stream",
        headers: {
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
          "X-Content-Type-Options": "nosniff",
        },
      },
    )
  })
}

export const eventHandlers = HttpApiBuilder.group(EventApi, "event", (handlers) =>
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    return handlers.handleRaw(
      "subscribe",
      Effect.fn("EventHttpApi.subscribe")(function* () {
        const config = yield* Config.Service.use((cfg) => cfg.get())
        const useJsonRpc = config.server?.lsp_framing ?? false
        return yield* eventResponse(bus, useJsonRpc)
      }),
    )
  }),
)
