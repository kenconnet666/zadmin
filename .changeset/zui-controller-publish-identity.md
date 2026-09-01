---
'@zadmin/zui': patch
---

Preserve the identity actually published through bindable imperative controllers so Tree, DataTable, VirtualList, and FileUpload can clean up without comparing a Svelte state proxy to the original controller object.
