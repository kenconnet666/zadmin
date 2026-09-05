---
'@zadmin/zui': patch
---

Defer Table overflow measurement to the owner-window ResizeObserver layout callback instead of forcing layout during mount and reactive DOM updates. Keep a coalesced animation-frame resize fallback when ResizeObserver is unavailable, preserve the one-pixel overflow keyboard-access contract, and reconnect/clean up observers when bound elements or scroll mode change.
