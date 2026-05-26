import type { ScoredSkill } from "./types"
import * as Log from "@opencode-ai/core/util/log"

const log = Log.create({ service: "skill-conflict" })
const SCOPE_ORDER = { file: 0, module: 1, project: 2, session: 3 } as const

// Resolves `conflicts_with` declarations between scored skills. When two skills
// conflict, the loser is dropped by: (1) lower priority, then (2) broader scope,
// then (3) alphabetical order as a final deterministic tiebreak.
// Conflicts are checked bidirectionally: either skill may declare the conflict.
export function resolveConflicts(scored: ScoredSkill[]): ScoredSkill[] {
  const kept = new Map<string, ScoredSkill>()

  for (const item of scored) {
    const itemConflicts = item.skill.orchestration?.conflicts_with ?? []
    let keep = true

    for (const existing of Array.from(kept.values())) {
      const existingConflicts = existing.skill.orchestration?.conflicts_with ?? []
      if (!itemConflicts.includes(existing.skill.name) && !existingConflicts.includes(item.skill.name)) continue

      const itemPriority = item.skill.orchestration?.priority ?? 50
      const existingPriority = existing.skill.orchestration?.priority ?? 50
      if (itemPriority < existingPriority) {
        keep = false
        break
      }
      if (itemPriority > existingPriority) {
        kept.delete(existing.skill.name)
        continue
      }

      const itemScope = SCOPE_ORDER[item.skill.orchestration?.scope ?? "session"]
      const existingScope = SCOPE_ORDER[existing.skill.orchestration?.scope ?? "session"]
      if (itemScope > existingScope) {
        keep = false
        break
      }
      if (itemScope < existingScope) {
        kept.delete(existing.skill.name)
        continue
      }

      if (item.skill.name > existing.skill.name) {
        log.warn("skill conflict resolved by alphabetical tiebreak", {
          kept: existing.skill.name,
          removed: item.skill.name,
        })
        keep = false
        break
      }
      // item.name comes alphabetically before existing.name → existing loses
      kept.delete(existing.skill.name)
    }

    if (keep) kept.set(item.skill.name, item)
  }

  return Array.from(kept.values())
}
