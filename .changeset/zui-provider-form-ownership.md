---
'@zadmin/zui': minor
---

Add strict Provider-scoped defaults for Button and DataTable, plus public Form controller field-state subscriptions. Explicit component props and controlled state remain caller-owned; defaults reject callbacks, DOM and CSS, while subscriptions observe immutable state without owning field values.
