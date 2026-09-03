---
'@zadmin/webview': patch
'@zadmin/miniapp': patch
---

Ship stable CLI bin shims that are present immediately after installation, delegate to the built package entrypoint, and report an actionable missing-build error when a source checkout has not been built yet.
