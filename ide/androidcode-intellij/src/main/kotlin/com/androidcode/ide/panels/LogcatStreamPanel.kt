package com.androidcode.ide.panels

import com.androidcode.ide.AndroidCodeProjectService
import com.intellij.openapi.project.Project
import java.awt.BorderLayout
import javax.swing.JButton
import javax.swing.JComboBox
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JScrollPane
import javax.swing.JTextArea
import javax.swing.JTextField
import javax.swing.SwingUtilities

class LogcatStreamPanel(private val project: Project) : JPanel(BorderLayout()) {
    private val textArea = JTextArea(20, 60).apply { isEditable = false }
    private val packageField = JTextField("com.example.app", 20)
    private val levelCombo = JComboBox(arrayOf("V", "D", "I", "W", "E", "F"))
    private val searchField = JTextField(15)
    private val fetch = JButton("Fetch")

    init {
        val controls = JPanel().apply {
            add(JLabel("Package:"))
            add(packageField)
            add(JLabel("Level:"))
            add(levelCombo)
            add(JLabel("Search:"))
            add(searchField)
            add(fetch)
        }
        add(controls, BorderLayout.NORTH)
        add(JScrollPane(textArea), BorderLayout.CENTER)

        fetch.addActionListener { fetchLogcat() }
    }

    private fun fetchLogcat() {
        val service = project.getService(AndroidCodeProjectService::class.java)
        val pkg = packageField.text
        val level = levelCombo.selectedItem as? String
        val search = searchField.text.trim()
        service.endpoint?.runLogcat(pkg, level, 500)
            ?.whenComplete { entries, _ ->
                SwingUtilities.invokeLater {
                    val filtered = entries
                        ?.filter { search.isEmpty() || it.message.contains(search, ignoreCase = true) }
                    textArea.text = filtered?.joinToString("\n") {
                        "${it.date} ${it.time} ${it.level}/${it.tag}: ${it.message}"
                    } ?: "No logs."
                }
            }
    }
}
