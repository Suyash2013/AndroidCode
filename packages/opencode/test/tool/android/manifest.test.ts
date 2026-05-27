import { describe, expect, test } from "bun:test"
import { parseManifest } from "../../../src/tool/android/manifest"

const SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application>
        <activity android:name=".MainActivity" android:exported="true" />
        <activity android:name=".SettingsActivity" />
        <service android:name=".SyncService" android:exported="false" />
        <receiver android:name=".BootReceiver" android:exported="true" />
        <provider android:name=".FileProvider" />
    </application>
</manifest>`

describe("parseManifest", () => {
  test("extracts the package name", () => {
    expect(parseManifest(SAMPLE).package).toBe("com.example.app")
  })

  test("extracts all declared permissions", () => {
    const info = parseManifest(SAMPLE)
    expect(info.permissions).toEqual(["android.permission.INTERNET", "android.permission.CAMERA"])
  })

  test("collects components by type", () => {
    const info = parseManifest(SAMPLE)
    expect(info.activities).toEqual([".MainActivity", ".SettingsActivity"])
    expect(info.services).toEqual([".SyncService"])
    expect(info.receivers).toEqual([".BootReceiver"])
    expect(info.providers).toEqual([".FileProvider"])
  })

  test("flags only explicitly exported components", () => {
    const info = parseManifest(SAMPLE)
    expect(info.exportedComponents).toContain(".MainActivity")
    expect(info.exportedComponents).toContain(".BootReceiver")
    expect(info.exportedComponents).not.toContain(".SyncService")
    expect(info.exportedComponents).not.toContain(".SettingsActivity")
  })

  test("tolerates an empty manifest", () => {
    const info = parseManifest("<manifest></manifest>")
    expect(info.permissions).toEqual([])
    expect(info.activities).toEqual([])
  })
})
