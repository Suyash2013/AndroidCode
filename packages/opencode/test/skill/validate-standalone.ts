import { select } from "../../src/skill/router"
import { analyze } from "../../src/skill/task-analyzer"

// Quick validation of router
const skills = [
  { name: "debug", description: "debug", location: "/tmp/debug", content: "# debug", orchestration: { triggers: { task_types: ["debugging"] }, priority: 50 } },
  { name: "build", description: "build", location: "/tmp/build", content: "# build", orchestration: { triggers: { task_types: ["code-generation"] }, priority: 50 } },
]

const r1 = select(skills, { taskType: "debugging", confidence: 0.9, message: "", filePatterns: [], contentPatterns: [], toolsInUse: [] }, 5)
console.log("Router test 1:", r1.selected.length === 1 && r1.selected[0].name === "debug" ? "PASS" : "FAIL")

const r2 = select(skills, { taskType: "debugging", confidence: 0.9, message: "", filePatterns: [], contentPatterns: [], toolsInUse: [] }, 5, { include: ["build"], exclude: [] })
console.log("Router test 2:", r2.selected.map(s => s.name).includes("build") ? "PASS" : "FAIL")

// Quick validation of task analyzer
const a1 = analyze("Fix the crash", [])
console.log("Analyzer test 1:", a1.taskType === "debugging" && a1.confidence > 0.5 ? "PASS" : "FAIL")

const a2 = analyze("Build a new module", [])
console.log("Analyzer test 2:", a2.taskType === "code-generation" && a2.confidence > 0.5 ? "PASS" : "FAIL")

console.log("All standalone tests complete")
