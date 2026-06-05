# Bun Compatibility Notes

This document tracks every upstream dependency that has known incompatibilities under Bun, the observed symptom, the workaround currently in use, and the last tested Bun version.

## Known Incompatibilities

### `node-pty` / `@lydell/node-pty`

| Field | Value |
| :--- | :--- |
| Package | `@lydell/node-pty@1.2.0-beta.12` |
| Symptom | Native `.node` addon requires a `postinstall` fixup script; raw `node-pty` crashes at runtime without it |
| Workaround | Root `package.json` contains `"postinstall": "bun run --cwd packages/core fix-node-pty"` which patches the addon path |
| Last tested Bun | `1.3.14` |
| Notes | Tracked as a patched dependency. Do not remove the postinstall hook. |

### `@parcel/watcher`

| Field | Value |
| :--- | :--- |
| Package | `@parcel/watcher@2.5.1` |
| Symptom | Pre-built binaries are platform-specific; `bun install` does not always select the correct one for cross-platform binary builds |
| Workaround | `script/build.ts` explicitly installs `--os="*" --cpu="*"` variants before bundling so the correct native binary is embedded |
| Last tested Bun | `1.3.14` |
| Notes | Required for the standalone binary build step only. Not a runtime issue for local dev. |

### `@silvia-odwyer/photon-node`

| Field | Value |
| :--- | :--- |
| Package | `@silvia-odwyer/photon-node@0.3.4` |
| Symptom | WASM-backed image processing library; requires a patch for Bun WASM loading |
| Workaround | `patches/@silvia-odwyer%2Fphoton-node@0.3.4.patch` applied via `patchedDependencies` in root `package.json` |
| Last tested Bun | `1.3.14` |
| Notes | Patch tracked in `patches/` directory. |

## Adding a New Entry

When you discover a new incompatibility:

1. Add a row to this file with all five fields.
2. If a workaround is added to `package.json` or a script, note it here.
3. Update "Last tested Bun" whenever you verify the workaround still works after a Bun upgrade.

## CI Verification

Add a CI step to `test.yml` that fails if a listed module starts passing without its workaround — this prevents the doc from silently going stale as Bun matures.
