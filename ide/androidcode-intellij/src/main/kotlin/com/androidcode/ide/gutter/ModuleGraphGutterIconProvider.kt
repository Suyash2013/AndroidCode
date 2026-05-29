package com.androidcode.ide.gutter

import com.intellij.codeInsight.daemon.LineMarkerInfo
import com.intellij.codeInsight.daemon.LineMarkerProvider
import com.intellij.icons.AllIcons
import com.intellij.openapi.editor.markup.GutterIconRenderer
import com.intellij.openapi.ui.Messages
import com.intellij.psi.PsiElement
import com.intellij.psi.impl.source.tree.LeafPsiElement

class ModuleGraphGutterIconProvider : LineMarkerProvider {
    override fun getLineMarkerInfo(element: PsiElement): LineMarkerInfo<*>? {
        if (element !is LeafPsiElement) return null
        val file = element.containingFile ?: return null
        if (file.name != "build.gradle.kts") return null
        // Only mark the first leaf of the file to avoid an icon on every token.
        if (element.textRange.startOffset != 0) return null

        return LineMarkerInfo(
            element,
            element.textRange,
            AllIcons.Actions.ShowHiddens,
            { "Module Dependency Graph" },
            { _, target ->
                Messages.showInfoMessage(
                    target.project,
                    "Module graph visualization will open here in a future version.",
                    "Module Graph",
                )
            },
            GutterIconRenderer.Alignment.LEFT,
            { "AndroidCode Module Graph" },
        )
    }
}
