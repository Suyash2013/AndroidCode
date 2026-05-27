import { describe, expect, test } from "bun:test"
import { parseSigningConfigs } from "../../../src/tool/android/signing"

const HARDCODED_KTS = `
android {
    signingConfigs {
        create("release") {
            storeFile = file("release.keystore")
            storePassword = "supersecret"
            keyAlias = "releaseKey"
            keyPassword = "alsosecret"
        }
    }
}
`

const ENV_SOURCED_KTS = `
android {
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KEYSTORE_PATH"))
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "releaseKey"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
}
`

describe("parseSigningConfigs", () => {
  test("detects the config name, store file, and key alias", () => {
    const configs = parseSigningConfigs(HARDCODED_KTS)
    expect(configs).toHaveLength(1)
    expect(configs[0].name).toBe("release")
    expect(configs[0].hasStoreFile).toBe(true)
    expect(configs[0].keyAlias).toBe("releaseKey")
    expect(configs[0].hasStorePassword).toBe(true)
    expect(configs[0].hasKeyPassword).toBe(true)
  })

  test("flags hardcoded password literals", () => {
    expect(parseSigningConfigs(HARDCODED_KTS)[0].hardcodedPassword).toBe(true)
  })

  test("does not flag env-sourced passwords", () => {
    expect(parseSigningConfigs(ENV_SOURCED_KTS)[0].hardcodedPassword).toBe(false)
  })

  test("NEVER leaks password values in the parsed output", () => {
    const serialized = JSON.stringify(parseSigningConfigs(HARDCODED_KTS))
    expect(serialized).not.toContain("supersecret")
    expect(serialized).not.toContain("alsosecret")
  })

  test("returns empty when there is no signingConfigs block", () => {
    expect(parseSigningConfigs("android { buildTypes { } }")).toEqual([])
  })
})
