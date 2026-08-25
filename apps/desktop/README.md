# ZAdmin Desktop

Windows 11 x64 Tauri 2 capability host. SvelteKit is built as an SPA with `adapter-static`; production loads local files and does not start Node, Vite, SSR, a sidecar, or an HTTP backend.

```powershell
pnpm dev:desktop
pnpm check:desktop
pnpm test:desktop
pnpm build:desktop
```

The application uses narrow Tauri capabilities. Dialog, clipboard, notifications, external opener, exit, relaunch, and installer behavior require supervised validation; safe app/OS/window, AppData, Store, log, and typed IPC probes are available in the capability lab.
