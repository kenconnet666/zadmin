---
'@zadmin/zui': patch
---

Keep module-local context HMR identity compatible with source consumers that do not include Vite ambient types. Preserve direct owner-module hot accesses without adding global types or a Vite runtime dependency.

Make AsyncCollectionQuery latest-wins ownership safe when abort listeners synchronously start a newer load during replacement or cancellation. Disposal still rejects attempts to revive a query.
