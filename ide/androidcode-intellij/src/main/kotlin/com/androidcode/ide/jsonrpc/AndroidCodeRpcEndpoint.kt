package com.androidcode.ide.jsonrpc

import com.androidcode.ide.model.DeviceInfo
import com.androidcode.ide.model.LogcatEntry
import com.google.gson.reflect.TypeToken
import java.util.concurrent.CompletableFuture

/** Maps IntelliJ-side domain calls onto JSON-RPC method names. */
class AndroidCodeRpcEndpoint(private val client: JsonRpcClient) {
    fun listDevices(): CompletableFuture<List<DeviceInfo>> =
        client.call("android.devices", null, object : TypeToken<List<DeviceInfo>>() {}.type)

    fun runLogcat(packageName: String, level: String?, lines: Int): CompletableFuture<List<LogcatEntry>> =
        client.call<LogcatResult>(
            "logcat.query",
            mapOf("packageName" to packageName, "level" to level, "lines" to lines),
            LogcatResult::class.java,
        ).thenApply { it.entries }

    fun runGradle(task: String, flags: List<String>?, module: String?): CompletableFuture<GradleResult> =
        client.call(
            "gradle.execute",
            mapOf("task" to task, "flags" to flags, "module" to module),
            GradleResult::class.java,
        )

    fun generateComposable(description: String, filePath: String): CompletableFuture<String> =
        client.call(
            "ai.generateComposable",
            mapOf("description" to description, "filePath" to filePath),
            String::class.java,
        )

    fun explainBuildError(errorText: String): CompletableFuture<String> =
        client.call("ai.explainBuildError", mapOf("errorText" to errorText), String::class.java)

    fun addPermission(manifestPath: String, description: String): CompletableFuture<String> =
        client.call(
            "ai.addPermission",
            mapOf("manifestPath" to manifestPath, "description" to description),
            String::class.java,
        )
}

data class LogcatResult(val entries: List<LogcatEntry>)
data class GradleResult(val status: String, val errors: List<String>, val rawOutput: String)
