import { describe, expect, test } from "bun:test"
import { apkAnalyzerArgs } from "../../../src/tool/android/apk-analyzer"

describe("apkAnalyzerArgs", () => {
  test("defaults to apk summary", () => {
    expect(apkAnalyzerArgs("app.apk", "summary")).toEqual(["apk", "summary", "app.apk"])
    expect(apkAnalyzerArgs("app.apk", "unknown")).toEqual(["apk", "summary", "app.apk"])
  })

  test("maps manifest and permissions to manifest subcommands", () => {
    expect(apkAnalyzerArgs("a.apk", "manifest")).toEqual(["manifest", "print", "a.apk"])
    expect(apkAnalyzerArgs("a.apk", "permissions")).toEqual(["manifest", "permissions", "a.apk"])
  })

  test("maps filesize to apk file-size", () => {
    expect(apkAnalyzerArgs("a.apk", "filesize")).toEqual(["apk", "file-size", "a.apk"])
  })
})
