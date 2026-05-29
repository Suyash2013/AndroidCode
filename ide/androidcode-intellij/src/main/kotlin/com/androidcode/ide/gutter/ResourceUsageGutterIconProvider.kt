package com.androidcode.ide.gutter

import com.intellij.codeInsight.daemon.LineMarkerInfo
import com.intellij.codeInsight.daemon.LineMarkerProvider
import com.intellij.icons.AllIcons
import com.intellij.openapi.editor.markup.GutterIconRenderer
import com.intellij.openapi.ui.Messages
import com.intellij.psi.PsiElement
import com.intellij.psi.impl.source.tree.LeafPsiElement

class ResourceUsageGutterIconProvider : LineMarkerProvider {
    private val rIdPattern = Regex("R\\.id\\.([A-Za-z_][A-Za-z0-9_]*)")

    override fun getLineMarkerInfo(element: PsiElement): LineMarkerInfo<*>? {
        if (element !is LeafPsiElement) return null
        val match = rIdPattern.find(element.text) ?: return null
        val resourceName = match.groupValues[1]

        return LineMarkerInfo(
            element,
            element.textRange,
            AllIcons.Actions.Find,
            { "Resource: $resourceName" },
            { _, target ->
                Messages.showInfoMessage(
                    target.project,
                    "XML source for $resourceName will be shown here in a future version.",
                    "Resource Usage",
                )
            },
            GutterIconRenderer.Alignment.LEFT,
            { "AndroidCode Resource" },
        )
    }
}
