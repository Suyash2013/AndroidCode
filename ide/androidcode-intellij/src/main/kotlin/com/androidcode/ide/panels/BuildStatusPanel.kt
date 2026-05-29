package com.androidcode.ide.panels

import com.intellij.openapi.project.Project
import java.awt.BorderLayout
import javax.swing.DefaultListModel
import javax.swing.JList
import javax.swing.JPanel
import javax.swing.JProgressBar
import javax.swing.JScrollPane
import javax.swing.SwingUtilities

class BuildStatusPanel(private val project: Project) : JPanel(BorderLayout()) {
    private val listModel = DefaultListModel<String>()
    private val list = JList(listModel)
    private val progress = JProgressBar(0, 100)

    init {
        add(JScrollPane(list), BorderLayout.CENTER)
        add(progress, BorderLayout.SOUTH)
        progress.isIndeterminate = true
    }

    fun reportTask(task: String, state: String, percent: Int) {
        SwingUtilities.invokeLater {
            listModel.addElement("$task — $state ($percent%)")
            progress.value = percent
            progress.isIndeterminate = percent == 0 || percent == 100
        }
    }

    fun clear() {
        SwingUtilities.invokeLater {
            listModel.clear()
            progress.value = 0
        }
    }
}
