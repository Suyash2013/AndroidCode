package com.androidcode.ide.model

data class LogcatEntry(
    val date: String,
    val time: String,
    val pid: String,
    val tid: String,
    val level: String,
    val tag: String,
    val message: String,
)
