package com.androidcode.ide.jsonrpc

import com.google.gson.Gson
import com.intellij.openapi.diagnostic.Logger
import java.lang.reflect.Type
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.concurrent.CompletableFuture
import java.util.concurrent.atomic.AtomicLong

private val LOG = Logger.getInstance(JsonRpcClient::class.java)
private val GSON = Gson()

/**
 * Minimal JSON-RPC 2.0 client that speaks to the AndroidCode CLI over HTTP POST.
 * `resultType` is a [Type] so callers can pass either a `Class<T>` or a
 * `TypeToken<...>().type` for generic results such as `List<DeviceInfo>`.
 */
class JsonRpcClient(private val baseUrl: String) {
    private val http = HttpClient.newHttpClient()
    private val idGen = AtomicLong(0)

    fun <T> call(method: String, params: Any?, resultType: Type): CompletableFuture<T> {
        val id = idGen.incrementAndGet()
        val payload = mapOf(
            "jsonrpc" to "2.0",
            "id" to id,
            "method" to method,
            "params" to params,
        )
        val request = HttpRequest.newBuilder()
            .uri(URI.create("$baseUrl/jsonrpc"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(payload)))
            .build()

        return http.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply { response ->
                val envelope = GSON.fromJson(response.body(), JsonRpcResponse::class.java)
                if (envelope.error != null) {
                    throw JsonRpcException(envelope.error.code, envelope.error.message)
                }
                GSON.fromJson<T>(GSON.toJson(envelope.result), resultType)
            }
    }

    fun notify(method: String, params: Any?): CompletableFuture<Void> {
        val payload = mapOf(
            "jsonrpc" to "2.0",
            "method" to method,
            "params" to params,
        )
        val request = HttpRequest.newBuilder()
            .uri(URI.create("$baseUrl/jsonrpc"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(payload)))
            .build()
        return http.sendAsync(request, HttpResponse.BodyHandlers.discarding())
            .thenApply { LOG.debug("notify $method sent"); null }
    }
}

data class JsonRpcResponse(
    val jsonrpc: String,
    val id: Any?,
    val result: Any?,
    val error: JsonRpcError?,
)

data class JsonRpcError(val code: Int, val message: String, val data: Any?)

class JsonRpcException(val code: Int, override val message: String) :
    RuntimeException("JSON-RPC $code: $message")
