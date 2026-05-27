# Upstream Sync Strategy

AndroidCode is maintained as a fork of [opencode](https://github.com/anthropics/opencode),
keeping its full feature set while adding Android-specific intelligence.

## Sync Schedule

Rebase onto upstream `main` monthly (first Monday of each month).

## Rebase Process

```bash
git fetch upstream main
git rebase upstream/main
```

## Never-Merge List

These directories contain Android-specific additions and must never be overwritten
by upstream merges. After every rebase, verify these files are intact:

- `.agents/skills/android-*/` — All 26 Android-specific skills
- `packages/opencode/src/tool/android/` — Android tool implementations
- `packages/opencode/src/project/android-*.ts` — Android project detection
- `packages/opencode/src/provider/android-*.ts` — Android provider auth
- `docs/superpowers/` — Implementation plans and ADRs
- `.androidcode/` — Project-specific configuration

## Conflict Resolution

When an upstream change conflicts with AndroidCode additions:

1. Prefer the upstream change for shared infrastructure (config, session, CLI framework)
2. Re-apply AndroidCode additions on top
3. Run the full test suite: `bun run test` from `packages/opencode`
4. If Android-specific tests fail, fix before merging branch into `dev`
