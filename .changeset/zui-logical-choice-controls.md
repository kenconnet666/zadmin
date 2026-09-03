---
'@zadmin/zui': minor
---

Move RadioGroup and Segmented to the shared logical collection, navigation, mounted-element, and single-selection runtimes; add typed options, controlled clear and dynamic focus reconciliation, and move Segmented form ownership to FormValueBridge. Deferred nearest-focus recovery now stops at owner teardown instead of reading destroyed Svelte derived state.
