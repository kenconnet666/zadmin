# WeChat renderer acceptance

Checked on 2026-08-25 with WeChat DevTools Stable 2.02.2608040 and base library 3.17.1.

## WebView

- Production Taro build passed.
- ZUI layout, count update, keyed list, conditional content, theme update, dynamic ICSS, and flow-button `open-type` values passed in the simulator.
- The typed navigation facade opened the capability page without crossing Svelte's component-context boundary. Network, temporary storage roundtrip/cleanup, and read-only privacy probes passed after a fresh project-window open.
- The simulator console was clean after a fresh project-window open; transient `MPPage.getCurrent` errors observed after cache clearing came from the DevTools inspectee rather than the Mini Program stack.
- A supervised Xiaomi 22081212C (arm64-v8a), Android API 35, WeChat 8.0.76, base-library 3.17.1 session rendered the homepage and exposed `pages/capabilities/index` in the real-device WXML tree after navigation. Network returned `wifi`, storage roundtrip/removal passed, and read-only privacy reported no pending consent. The real-device Console stayed empty; service status remained normal with zero queued/unacknowledged messages.
- Evidence: [WebView screenshot](/wechat/webview.jpg) and [capability page](/wechat/capabilities-webview.jpg).

Highest level: **device-verified for the named rendering/navigation/probe flows**; the broader component interaction matrix remains **simulator-verified**.

## Skyline

- Temporary PageConfig builds established all prerequisites documented by Taro: `renderer: "skyline"`, `componentFramework: "glass-easel"`, and `navigationStyle: "custom"`. AppConfig retained `lazyCodeLoading: "requiredComponents"` and now permanently carries `rendererOptions.skyline.defaultDisplayBlock/defaultContentBox` so future Skyline experiments start from the correct baseline.
- The corrected Skyline production build passed and DevTools displayed `当前渲染模式: Skyline`, but the simulator surface remained black. The WeChat automator/inspectee repeatedly failed in `MPPage.getCurrent`, so selector-driven interaction and simulator screenshots were unavailable.
- A temporary control build of the repository's same-version Taro Solid reference produced the same black surface and inspectee failure. This evidence does not prove an upstream root cause, but it does show that the observed failure is not unique to the Svelte application bundle in this environment.
- Taro 4.2 currently has an open [Skyline issue](https://github.com/NervJS/taro/issues/19141); the [4.2.1 release notes](https://github.com/NervJS/taro/releases/tag/v4.2.1) do not list a Skyline fix. Re-evaluate with a newer Taro/DevTools/base-library combination before changing the support grade.
- Source was restored to the default WebView PageConfig after the build check.

Highest level: **build-verified**, not simulator-verified. The observed black surface is a failed simulator attempt, not acceptance evidence; no Skyline screenshot is presented as proof of successful rendering.
