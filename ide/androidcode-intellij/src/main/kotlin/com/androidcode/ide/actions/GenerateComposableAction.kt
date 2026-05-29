package com.androidcode.ide.actions

import com.androidcode.ide.AndroidCodeProjectService
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.ui.Messages
import javax.swing.SwingUtilities

class GenerateComposableAction : AnAction("Generate Composable...") {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val editor = e.getData(CommonDataKeys.EDITOR) ?: return
        val document = editor.document

        val description = Messages.showInputDialog(
            project,
            "Describe the UI:",
            "Generate Composable",
            Messages.getQuestionIcon(),
        ) ?: return

        val service = project.getService(AndroidCodeProjectService::class.java)
        val filePath = e.getData(CommonDataKeys.VIRTUAL_FILE)?.path ?: return

        service.endpoint?.generateComposable(description, filePath)
            ?.whenComplete { code, _ ->
                SwingUtilities.invokeLater {
                    if (code != null) {
                        WriteCommandAction.runWriteCommandAction(project) {
                            document.insertString(editor.caretModel.offset, "\n$code\n")
                        }
                    } else {
                        Messages.showErrorDialog(project, "Generation failed", "AndroidCode")
                    }
                }
            }
    }

    override fun update(e: AnActionEvent) {
        val file = e.getData(CommonDataKeys.VIRTUAL_FILE)
        e.presentation.isEnabledAndVisible = file?.extension == "kt"
    }
}
