---
'@zadmin/zui': minor
---

Add recursive structured-member metadata and path-aware lifecycle documentation for nested public data shapes. List, DescriptionList, Timeline, DataTable columns, Select options, and RadioGroup options now expose complete member fields; scoped `id` to `key` migration facts no longer confuse conditional identity branches with unconditional required fields. Caller-owned generics, external protocols and descriptors, and dynamic records now publish explicit opaque ownership metadata instead of fabricated member shapes. Callable metadata now publishes validated parameter order, names, optional/rest semantics, generic payload members, and array boundaries for Form submission and FileUpload transport/rejection callbacks.
