package com.androidcode.ide

import com.androidcode.ide.jsonrpc.AndroidCodeRpcEndpoint
import com.androidcode.ide.jsonrpc.JsonRpcClient
import com.intellij.openapi.components.Service
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import java.io.File
import java.util.concurrent.TimeUnit

/** Owns the AndroidCode CLI process lifecycle and JSON-RPC client per project. */
@Service(Service.Level.PROJECT)
class AndroidCodeProjectService(private val project: Project) {
    private val log = Logger.getInstance(AndroidCodeProjectService::class.java)
    private var process: Process? = null
    private var client: JsonRpcClient? = null

    val endpoint: AndroidCodeRpcEndpoint?
        get() = client?.let { AndroidCodeRpcEndpoint(it) }

    @Synchronized
    fun start() {
        if (process != null) return
        val baseDir = project.basePath ?: return

        val candidates = listOf(
            "node_modules/.bin/opencode",
            "node_modules/.bin/opencode.cmd",
            ".local/bin/opencode",
        ).map { File(baseDir, it) }
        val opencode = candidates.firstOrNull { it.exists() }
        if (opencode == null) {
            log.warn("opencode CLI not found in project; looked in: ${candidates.joinToString { it.path }}")
            return
        }

        val started = ProcessBuilder(opencode.absolutePath, "server", "--port", "0", "--lsp-framing")
            .directory(File(baseDir))
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()
        process = started

        // The CLI prints "...http://localhost:<port>..." once it is listening.
        val line = started.inputStream.bufferedReader().readLine()
        if (line == null) {
            log.error("opencode server did not print a listen address")
            return
        }
        val port = Regex("http://localhost:(\\d+)").find(line)?.groupValues?.get(1)
        if (port == null) {
            log.error("could not parse opencode server port from: $line")
            return
        }

        val url = "http://localhost:$port"
        client = JsonRpcClient(url)
        log.info("AndroidCode CLI connected at $url")
    }

    @Synchronized
    fun stop() {
        process?.destroyForcibly()?.waitFor(5, TimeUnit.SECONDS)
        process = null
        client = null
    }
}
