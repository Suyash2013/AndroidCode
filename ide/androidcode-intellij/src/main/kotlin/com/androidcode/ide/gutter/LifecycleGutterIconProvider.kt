package com.androidcode.ide.gutter

import com.intellij.codeInsight.daemon.LineMarkerInfo
import com.intellij.codeInsight.daemon.LineMarkerProvider
import com.intellij.icons.AllIcons
import com.intellij.openapi.editor.markup.GutterIconRenderer
import com.intellij.openapi.ui.Messages
import com.intellij.psi.PsiElement
import org.jetbrains.kotlin.psi.KtClass

class LifecycleGutterIconProvider : LineMarkerProvider {
    override fun getLineMarkerInfo(element: PsiElement): LineMarkerInfo<*>? {
        // Anchor on the class name identifier leaf, not the whole class element.
        val ktClass = element.parent as? KtClass ?: return null
        if (element !== ktClass.nameIdentifier) return null
        val name = ktClass.name ?: return null
        if (!name.endsWith("Activity") && !name.endsWith("Fragment")) return null

        return LineMarkerInfo(
            element,
            element.textRange,
            AllIcons.Actions.Show,
            { "Lifecycle: $name" },
            { _, target ->
                val project = target.project
                Messages.showInfoMessage(
                    project,
                    "$name lifecycle:\nonCreate → onStart → onResume → onPause → onStop → onDestroy",
                    "AndroidCode Lifecycle",
                )
            },
            GutterIconRenderer.Alignment.LEFT,
            { "AndroidCode Lifecycle" },
        )
    }
}
