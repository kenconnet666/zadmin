# WeChat Fast Refresh

`pnpm dev:wechat` starts one supervisor. It first builds the package and its single prebundled Svelte runtime, then directly owns one TypeScript watcher for `@zadmin/svelte-taro`, one `svelte-package` watcher for `@zadmin/zui-taro`, and one Taro Vite watcher. It does not nest `concurrently` processes, and it removes its lock plus all children on `SIGINT`/`SIGTERM`.

## Change policy

| Change                                                | Action                                             |
| ----------------------------------------------------- | -------------------------------------------------- |
| `apps/wechat/**/*.svelte`                             | Taro incremental build                             |
| `packages/zui-taro/src/**`                            | package watch plus Taro incremental build          |
| `svelte-taro` runtime/platform/native/module/renderer | TypeScript watch plus Taro incremental build       |
| `svelte-taro` compiler/plugin/vite                    | rebuild package and restart only the Taro child    |
| `app.config.ts` or Taro host config                   | restart only the Taro child                        |
| package manifest, workspace file, or lockfile         | stop with exit code 75 and require install/restart |

External first-party plugin source roots can be listed in ignored `apps/wechat/.wechat/plugins.json` as an array of absolute paths or `{ "paths": [] }`. The supervisor resolves real paths and follows their source changes. A dependency-manifest change still stops instead of mutating the install while children are active.

## Build identity and state

Every successful development bundle publishes one ID through `globalThis.__ZADMIN_BUILD_ID__` and the development-only storage key `__zadmin_build_id__`. The virtual build-id module is forcibly reloaded on every Rollup watch cycle, including cycles that only transform platform TypeScript. A failed build never reaches `writeBundle`, so it cannot replace the last successful ID. Production compilation emits neither identifier.

Ignored runtime evidence:

- `.wechat/build-status.json`: current source, ID, timestamps, duration, result, restart reason, and watcher count.
- `.wechat/build-events.jsonl`: append-only status/change/restart/refresh trail.
- `.wechat/supervisor.lock`: one-supervisor process lock; stale locks are recovered only when their PID is no longer alive.

WeChat DevTools normally notices `dist` itself. If an already-authorized `wechatide` CLI client is available, set `ZADMIN_WECHATIDE_CLIENT` to its client name; the supervisor waits for automatic reload, compares the storage build ID, and calls `simulator_refresh` once only when stale. Without that opt-in, fallback remains disabled rather than opening an unattended authorization flow. MCP acceptance can still perform the same compare/refresh explicitly.

## Measured acceptance on this Windows machine

Measured on 2026-08-25 with Node 24.18, Taro 4.2.1, Vite 4.5.14, and WeChat DevTools Stable 2.02.2608040:

| Scenario                 |    Taro-reported build | Observed source-to-success | Result                                                                                            |
| ------------------------ | ---------------------: | -------------------------: | ------------------------------------------------------------------------------------------------- |
| App `.svelte` edit       |            1.54–2.05 s |                1.25–2.81 s | passed; visible text and runtime build ID updated automatically                                   |
| ZUI Taro component edit  |            1.51–1.56 s |                  under 3 s | passed; no Taro restart                                                                           |
| Platform TypeScript edit |            1.50–1.53 s |                  under 3 s | passed after retaining virtual marker/CSS caches across incremental rounds                        |
| Compiler/plugin edit     | 6.69–6.92 s cold build |       approximately 11.4 s | functionally passed; improved by runtime prebundling, but misses the provisional 8 s total target |
| App-config/route edit    |    approximately 6.9 s |       approximately 11.5 s | functionally passed; narrowly misses the provisional 10 s total target                            |

The cold-restart targets remain a measured performance gap, not a correctness gap. Prebundling the exact pinned Svelte runtime reduced the Taro graph from 246–247 to 141–142 transformed modules and the cold build itself by about four seconds. The remaining cost is Taro CLI process startup plus the full build. The supervisor already removes duplicate file events, limits intentional child shutdown to 500 ms, and refuses in-process Taro Hook replacement because Taro has no Hook disposer.

Taro Vite may log that `src/comp` is missing during incremental rounds while it injects `usingComponents.comp`; the same build emits the expected root `dist/comp.js`, `comp.json`, and `comp.wxml`. Production builds do not log this warning, and simulator interaction passed. Revisit it when upgrading the fixed Taro version rather than adding a fake source component.

## Cleanup evidence

After an interactive `Ctrl+C`, acceptance found zero matching supervisor, Taro-watch, TypeScript-watch, or `svelte-package` Node processes and no remaining supervisor lock. Temporary source edits used for timing were restored before production validation.
