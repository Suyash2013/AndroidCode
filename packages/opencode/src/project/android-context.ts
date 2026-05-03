import { scan, type GradleProfile } from "./android-intelligence"

export function generate(profile: GradleProfile): string {
  const lines: string[] = ["android_project:"]
  lines.push(`  has_wrapper: ${profile.hasWrapper}`)
  lines.push(`  build_script_type: ${profile.buildScriptType}`)
  lines.push(`  kmp: ${profile.isKmp}`)

  if (profile.conventionPluginDirs.length > 0) {
    lines.push("  convention_plugin_dirs:")
    for (const d of profile.conventionPluginDirs) lines.push(`    - ${d}`)
  } else {
    lines.push("  convention_plugin_dirs: []")
  }

  if (profile.modules.length > 0) {
    lines.push("  modules:")
    for (const m of profile.modules) {
      lines.push(`    - name: "${m.name}"`)
      lines.push(`      type: ${m.type}`)
      if (m.hasKmp) lines.push(`      kmp: true`)
    }
  } else {
    lines.push("  modules: []")
  }

  if (profile.versionCatalog) {
    const cat = profile.versionCatalog
    lines.push("  version_catalog:")
    if (Object.keys(cat.versions).length > 0) {
      lines.push("    versions:")
      for (const [k, v] of Object.entries(cat.versions)) lines.push(`      ${k}: "${v}"`)
    }
    lines.push(`    library_count: ${cat.libraryKeys.length}`)
    lines.push(`    plugin_count: ${cat.pluginKeys.length}`)
  }

  return lines.join("\n")
}

export function forDirectory(cwd: string): string | null {
  const profile = scan(cwd)
  return profile.hasGradle ? generate(profile) : null
}
