# Svelte Taro production acceptance

Acceptance date: 2026-08-25. The default supported release target is a trusted first-party WeChat Mini Program using WebView, Taro 4.2.1, Vite 4.5.14, and the exact Svelte custom-renderer artifact at commit `eb7532dd70fb11b36258347c44cf3910d244f987`.

## Passed gates

- `pnpm install --frozen-lockfile` and `pnpm peers check` passed.
- Production dependency audit reported no known vulnerabilities.
- Full repository check, test, build, Prettier, ESLint, and gitleaks passed.
- Svelte compiler/renderer/runtime/platform tests: 13 files and 40 tests passed, including two independent 100-cycle cleanup checks.
- The conformance fixture covers `$state`, `$derived`, `$effect` and cleanup, `$props`, component `$bindable`, lifecycle, context, snippets, `#if`, keyed `#each`, `#key`, `#await`, nested components, class/style updates, events, mount/unmount, and `<svelte:boundary onerror>` recovery.
- Unsupported browser-only syntax has a stable `svelte_taro_unsupported` diagnostic with filename, line, column, and replacement guidance.
- Five ZUI design components, three flow components, static WXSS, theme switching, and dynamic ICSS leaf binding passed package tests, production build, and WebView simulator interaction.
- The platform catalog contains 32 attributed capabilities. Driver/error/scope/module/native contracts passed; network, temporary storage cleanup, and read-only privacy state reached simulator verification. Hardware/account/merchant-dependent items retain their lower truthful grades in the capability report.
- Four clean tarballs installed into an empty system-temporary project. Frozen reinstall, external-module literal inference, native/ZUI types, Taro production build, production-content guards, and one Svelte/Taro runtime version passed.
- The exact Svelte runtime is prebundled once into condition-specific, tree-shakeable ESM. The application graph fell from 246–247 to 141–142 transformed modules, while clean install still resolved one Svelte instance.
- A three-round alternating Taro Solid reference measured a Svelte/Solid cold-build median ratio of 1.018x, passing the 1.25x limit.
- Production bundles contain no development build ID/storage bridge, supervisor, fake driver, testing entry, tracked secret, or workspace absolute path.

## Explicit limits

- The pinned upstream Svelte artifact crashes internally when compiling a boundary `failed`/`pending` snippet under custom rendering. `<svelte:boundary onerror>` is supported and tested; the broken snippet form is rejected before upstream compilation with guidance to render recovery state outside the boundary. Re-run this gate when changing the artifact.
- WebView is simulator-verified. A corrected Skyline build passed with `glass-easel` and `lazyCodeLoading: requiredComponents`, but simulator re-verification was blocked by an unattended `wechatide` client-authorization modal that must not be accepted or rejected by automation. Skyline remains build-verified, not simulator-verified.
- Compiler/config cold restarts improved from roughly 16 seconds to roughly 11.4 seconds after runtime prebundling. Incremental app/ZUI/platform updates remain around 1.5–2.8 seconds. The provisional 8/10-second total restart targets remain narrowly unmet because a fresh Taro CLI process is required.
- Full development audit reports 21 advisories in the fixed Taro CLI/Vite4 and existing development toolchain. They are absent from `pnpm audit --prod`; the supervisor uses local build-watch only and does not expose a Vite HTTP server.
- No upload, review submission, payment, phone-number exchange, subscription request, permission prompt, cloud write, merchant flow, or real-hardware operation was performed. Those require separate user authorization and environment-specific acceptance.

## Evidence

- [Capability report](./wechat-capability-report.md)
- [Fast Refresh](./wechat-fast-refresh.md)
- [Clean-package acceptance](./wechat-package-acceptance.md)
- [Performance baseline](./wechat-performance.md)
- [Renderer acceptance](./wechat-renderers.md)
- [Manual device/account acceptance](./wechat-manual-acceptance.md)
- [WebView screenshot](/wechat/webview.jpg)

The result is production-usable for the documented default WebView target and stable managed capabilities. Provisional/raw capabilities and Skyline are not represented as device- or account-verified.
