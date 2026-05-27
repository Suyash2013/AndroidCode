# Bun Compatibility Notes

AndroidCode targets Bun as its JavaScript runtime. This document tracks
compatibility issues encountered during development.

## Build System

- Build script: `packages/sdk/js/script/build.ts`
- TypeScript compilation uses `bun build` with `--target bun`
- All packages declare `"type": "module"` in `package.json`

## Bun-Specific APIs Used

| API | Location | Purpose |
| :--- | :--- | :--- |
| `Bun.file(path).json()` | Config, skill loading | Async JSON parsing |
| `Bun.write(path, content)` | Plugin tests, fixtures | File writing |
| `Bun.sleep(ms)` | Plugin tests | Async delays in tests |
| `Bun.$` | Plugin input | Shell command execution |

## Known Issues

### Bun.file() JSON parsing
Bun's `file.json()` throws on empty files. Config and skill loaders guard with
`catch(() => ...)` patterns.

### Cross-platform paths
Bun resolves `file://` URLs differently on Windows. Plugin loader explicitly
uses `fileURLToPath` and `pathToFileURL` to normalize.

### Module resolution
Some packages declare Conditional Exports that Bun resolves differently from Node.
Verify plugin compatibility when installing npm plugins by checking the `exports`
field for `./server` and `./tui` entries.

## CI Notes

- Tests run with `bun test` from `packages/opencode`
- `do-not-run-tests-from-root` guard prevents accidental root-level test invocation
- Use `tmux new-session -d -s opencode-dev 'bun dev'` for interactive development
- `bun run typecheck` from package directories (not `tsc` directly)
