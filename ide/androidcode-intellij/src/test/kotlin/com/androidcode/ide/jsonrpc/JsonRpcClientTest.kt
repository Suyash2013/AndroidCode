package com.androidcode.ide.jsonrpc

import com.google.gson.Gson
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class JsonRpcClientTest {
    private val gson = Gson()

    @Test
    fun `success envelope deserialization`() {
        val json = """{"jsonrpc":"2.0","id":1,"result":{"ok":true}}"""
        val res = gson.fromJson(json, JsonRpcResponse::class.java)
        assertEquals("2.0", res.jsonrpc)
        assertEquals(1.0, res.id) // Gson parses JSON numbers as Double
        assertNull(res.error)
        assertEquals(true, (res.result as Map<*, *>)["ok"])
    }

    @Test
    fun `error envelope deserialization`() {
        val json = """{"jsonrpc":"2.0","id":2,"error":{"code":-32601,"message":"Method not found","data":null}}"""
        val res = gson.fromJson(json, JsonRpcResponse::class.java)
        assertEquals(-32601, res.error?.code)
        assertEquals("Method not found", res.error?.message)
    }
}
