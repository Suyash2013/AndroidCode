package com.androidcode.ide

import com.androidcode.ide.panels.BuildStatusPanel
import com.androidcode.ide.panels.DeviceSelectorPanel
import com.androidcode.ide.panels.LogcatStreamPanel
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

class AndroidCodeToolWindowFactory : ToolWindowFactory {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val service = project.getService(AndroidCodeProjectService::class.java)
        service.start()

        val contentFactory = ContentFactory.getInstance()

        val devices = contentFactory.createContent(DeviceSelectorPanel(project), "Devices", false)
        val build = contentFactory.createContent(BuildStatusPanel(project), "Build", false)
        val logcat = contentFactory.createContent(LogcatStreamPanel(project), "Logcat", false)

        toolWindow.contentManager.addContent(devices)
        toolWindow.contentManager.addContent(build)
        toolWindow.contentManager.addContent(logcat)
    }
}
