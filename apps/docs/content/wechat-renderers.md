# WeChat renderer acceptance

Checked on 2026-08-25 with WeChat DevTools Stable 2.02.2608040 and base library 3.17.1.

## WebView

- Production Taro build passed.
- ZUI layout, count update, keyed list, conditional content, theme update, and flow-button `open-type` values passed in the simulator.
- The simulator console was clean after a fresh project-window open; transient `MPPage.getCurrent` errors observed after cache clearing came from the DevTools inspectee rather than the Mini Program stack.
- Evidence: [WebView screenshot](/wechat/webview.jpg).

Highest level: **simulator-verified**.

## Skyline

- A temporary PageConfig build emitted `renderer: "skyline"` and `componentFramework: "glass-easel"`.
- The first simulator attempt correctly identified the missing Skyline prerequisite. `lazyCodeLoading: "requiredComponents"` was added permanently to AppConfig, and the corrected Skyline production build passed.
- Visual/interaction re-verification could not continue because an earlier diagnostic `wechatide -c zadmin-supervisor` call left a global “MCP client authorization” modal in DevTools. The unattended policy prohibits accepting or rejecting authentication prompts. Closing and reopening only the project window did not dismiss the global modal.
- Source was restored to the default WebView PageConfig after the build check.

Highest level: **build-verified**, not simulator-verified. No Skyline screenshot is presented as proof of successful rendering.
