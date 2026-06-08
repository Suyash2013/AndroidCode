# Upstream Sync Policy

AndroidCode is a fork of [OpenCode](https://github.com/opencode-ai/opencode). This document defines how we stay in sync with upstream without breaking Android-specific modules.

## Upstream Details

| Field | Value |
| :--- | :--- |
| Upstream repo | `https://github.com/opencode-ai/opencode` |
| Pinned stable tag | `v1.15.13` (last synced at fork creation) |
| Rebase schedule | Quarterly (or when a security patch lands upstream) |

## Rebase Procedure

1. Fetch upstream: `git fetch upstream`
2. Review the upstream changelog for breaking changes to the tool registry, CLI, or config schema.
3. Run the pre-rebase checklist: check every path in the **Never Merge** list against the upstream diff.
4. Rebase on the upstream stable tag: `git rebase upstream/<tag>`
5. Resolve conflicts — Android-specific files always win over upstream equivalents.
6. Run `bun turbo typecheck && bun turbo test:ci` to verify the merged state.
7. Update the **Pinned stable tag** row above.

## Never-Merge Paths

These files and directories are Android-specific and must **never** be blindly overwritten by an upstream rebase. If upstream changes conflict with these paths, the AndroidCode version wins.

| Path | Reason |
| :--- | :--- |
| `packages/opencode/src/tool/android-*.ts` | Android tool implementations — not present upstream |
| `packages/opencode/src/tool/registry.ts` | Registers Android tools; upstream version lacks them |
| `docs/superpowers/` | AndroidCode phase plans and design docs |
| `.claude/` | Local AI agent configuration |
| `CLAUDE.md` | AI agent instructions specific to this fork |
| `AGENTS.md` | Agent-facing fork instructions |
| `docs/bun-compat.md` | Bun compatibility tracking (this fork only) |
| `docs/UPSTREAM_SYNC.md` | This file |

## Conflict Resolution Ownership

| Area | Owner |
| :--- | :--- |
| Tool registry & Android tools | AndroidCode maintainers |
| CLI branding (`scriptName`, binary name) | AndroidCode maintainers |
| Core session / LLM infrastructure | Follow upstream, then reapply Android patches |
| CI workflows | Follow upstream; add Android-specific jobs on top |
| Dependencies | Follow upstream; re-verify `docs/bun-compat.md` after each sync |
