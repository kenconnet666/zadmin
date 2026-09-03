---
'@zadmin/zui': minor
---

Add strict Provider-scoped defaults for Button, Input, Tag, Card, DataTable, and Pagination, plus public Form controller field-state subscriptions. Explicit component props and nearest field contexts remain higher priority, while values, pages, selections, callbacks, DOM, and CSS stay caller-owned; subscriptions observe immutable field state without owning values.
