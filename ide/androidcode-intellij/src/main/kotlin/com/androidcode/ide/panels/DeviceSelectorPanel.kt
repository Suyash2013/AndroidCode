package com.androidcode.ide.panels

import com.androidcode.ide.AndroidCodeProjectService
import com.intellij.openapi.project.Project
import java.awt.BorderLayout
import javax.swing.JButton
import javax.swing.JComboBox
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingUtilities

class DeviceSelectorPanel(private val project: Project) : JPanel(BorderLayout()) {
    private val combo = JComboBox<String>()
    private val refresh = JButton("Refresh")
    private val status = JLabel("No devices")

    init {
        val top = JPanel(BorderLayout()).apply {
            add(combo, BorderLayout.CENTER)
            add(refresh, BorderLayout.EAST)
        }
        add(top, BorderLayout.NORTH)
        add(status, BorderLayout.SOUTH)

        refresh.addActionListener { reload() }
        reload()
    }

    private fun reload() {
        val service = project.getService(AndroidCodeProjectService::class.java)
        service.endpoint?.listDevices()
            ?.whenComplete { devices, _ ->
                SwingUtilities.invokeLater {
                    combo.removeAllItems()
                    if (devices.isNullOrEmpty()) {
                        status.text = "No devices connected"
                    } else {
                        devices.forEach { combo.addItem("${it.model ?: it.serial} (${it.state})") }
                        status.text = "${devices.size} device(s)"
                    }
                }
            }
    }
}
