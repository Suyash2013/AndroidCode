package com.androidcode.ide.actions

import com.androidcode.ide.AndroidCodeProjectService
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.ui.Messages
import javax.swing.SwingUtilities

class AddPermissionAction : AnAction("Add Permission...") {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val file = e.getData(CommonDataKeys.VIRTUAL_FILE) ?: return
        val document = FileDocumentManager.getInstance().getDocument(file) ?: return

        val description = Messages.showInputDialog(
            project,
            "Describe the permission needed:",
            "Add Permission",
            Messages.getQuestionIcon(),
        ) ?: return

        val service = project.getService(AndroidCodeProjectService::class.java)
        service.endpoint?.addPermission(file.path, description)
            ?.whenComplete { xmlSnippet, _ ->
                SwingUtilities.invokeLater {
                    if (xmlSnippet != null) {
                        WriteCommandAction.runWriteCommandAction(project) {
                            document.insertString(0, "\n$xmlSnippet\n")
                        }
                    } else {
                        Messages.showErrorDialog(project, "Permission generation failed", "AndroidCode")
                    }
                }
            }
    }

    override fun update(e: AnActionEvent) {
        val file = e.getData(CommonDataKeys.VIRTUAL_FILE)
        e.presentation.isEnabledAndVisible = file?.name == "AndroidManifest.xml"
    }
}
