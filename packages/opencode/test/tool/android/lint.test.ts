import { describe, expect, test } from "bun:test"
import { parseLintXml } from "../../../src/tool/android/lint"

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<issues format="6" by="lint 8.0">
  <issue id="UnusedResources" severity="Warning" message="The resource &quot;R.string.foo&quot; appears to be unused" category="Performance">
    <location file="/proj/app/src/main/res/values/strings.xml" line="12" column="5"/>
  </issue>
  <issue id="HardcodedText" severity="Error" message="Hardcoded string" category="Internationalization">
    <location file="/proj/app/src/main/res/layout/main.xml" line="42"/>
  </issue>
</issues>`

describe("lint parseLintXml", () => {
  test("parses issues with location and decodes XML entities", () => {
    const issues = parseLintXml(SAMPLE)
    expect(issues.length).toBe(2)

    expect(issues[0].id).toBe("UnusedResources")
    expect(issues[0].severity).toBe("Warning")
    expect(issues[0].category).toBe("Performance")
    expect(issues[0].message).toContain('"R.string.foo"')
    expect(issues[0].file).toContain("strings.xml")
    expect(issues[0].line).toBe(12)

    expect(issues[1].id).toBe("HardcodedText")
    expect(issues[1].severity).toBe("Error")
    expect(issues[1].line).toBe(42)
  })

  test("returns an empty array when there are no issues", () => {
    expect(parseLintXml("<issues></issues>")).toEqual([])
    expect(parseLintXml("")).toEqual([])
  })
})
