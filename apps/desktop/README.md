# ZAdmin Desktop

Windows 11 x64 Tauri 2 capability host. SvelteKit is built as an SPA with `adapter-static`; production loads local files and does not start Node, Vite, SSR, a sidecar, or an HTTP backend.

```powershell
pnpm dev:desktop
pnpm check:desktop
pnpm test:desktop
pnpm build:desktop
pnpm --filter @zadmin/desktop bindings:check
```

The application uses narrow Tauri capabilities. Dialog, clipboard, notifications, external opener, exit, relaunch, and installer behavior require supervised validation; safe app/OS/window, AppData, Store, log, and typed IPC probes are available in the capability lab.

Regenerate the deterministic six-layer Windows DIB icon after changing the SVG design:

```powershell
pnpm --filter @zadmin/desktop icon:generate
```

The local release and NSIS installer are intentionally unsigned until an Authenticode certificate or CI signing service is configured. Do not distribute them externally as trusted release artifacts before signing.
