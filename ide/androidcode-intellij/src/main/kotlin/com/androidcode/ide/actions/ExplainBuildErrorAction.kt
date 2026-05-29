package com.androidcode.ide.actions

import com.androidcode.ide.AndroidCodeProjectService
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.Messages
import javax.swing.SwingUtilities

class ExplainBuildErrorAction : AnAction("Explain with AndroidCode") {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val selected = e.getData(CommonDataKeys.EDITOR)?.selectionModel?.selectedText
            ?: return

        val service = project.getService(AndroidCodeProjectService::class.java)
        service.endpoint?.explainBuildError(selected)
            ?.whenComplete { explanation, _ ->
                SwingUtilities.invokeLater {
                    Messages.showInfoMessage(project, explanation ?: "No explanation.", "AndroidCode Explanation")
                }
            }
    }

    override fun update(e: AnActionEvent) {
        val hasSelection = e.getData(CommonDataKeys.EDITOR)?.selectionModel?.hasSelection() == true
        e.presentation.isEnabledAndVisible = e.project != null && hasSelection
    }
}
