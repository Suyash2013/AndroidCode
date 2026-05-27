// Semver-ish utilities for skill version enforcement (§3.4).
//
// Skill versions come from `metadata.orchestration.version`. We don't need a
// full semver implementation — just numeric, dot-separated comparison and major
// extraction, tolerant of missing/garbage values.

export type SkillSource = "local" | "cached"

export interface SkillVersionMeta {
  source?: SkillSource
  version?: string
  // Built-in skills (registered in-memory) are always overridable by disk skills.
  isBuiltin?: boolean
}

function parseParts(v: string): number[] {
  return v
    .trim()
    .replace(/^[v=]/, "")
    .split(/[.+-]/)
    .map((p) => Number.parseInt(p, 10))
    .map((n) => (Number.isNaN(n) ? 0 : n))
}

export function parseMajor(v?: string): number | undefined {
  if (!v) return undefined
  return parseParts(v)[0] ?? 0
}

// Returns >0 if a is newer than b, <0 if older, 0 if equal. A missing version
// sorts below a present one.
export function compareVersions(a?: string, b?: string): number {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const pa = parseParts(a)
  const pb = parseParts(b)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

// A breaking-change conflict: both versions are present and their major
// components differ.
export function isMajorConflict(a?: string, b?: string): boolean {
  const ma = parseMajor(a)
  const mb = parseMajor(b)
  if (ma === undefined || mb === undefined) return false
  return ma !== mb
}

// Decide whether an incoming skill should replace an already-loaded one of the
// same name. Rules, in order:
//   1. Built-in entries are always replaced by a disk skill.
//   2. Local (on-disk) skills always win over cached URL skills.
//   3. Within the same source, the higher version wins; ties keep the existing
//      entry so the result is independent of (concurrent) scan order.
export function resolveSkillPrecedence(
  existing: SkillVersionMeta,
  incoming: SkillVersionMeta,
): "replace" | "keep-existing" {
  if (existing.isBuiltin) return "replace"
  const existingSource = existing.source ?? "local"
  const incomingSource = incoming.source ?? "local"
  if (incomingSource !== existingSource) {
    return incomingSource === "local" ? "replace" : "keep-existing"
  }
  return compareVersions(incoming.version, existing.version) > 0 ? "replace" : "keep-existing"
}
