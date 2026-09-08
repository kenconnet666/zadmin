---
'@zadmin/zui': patch
---

Repair ZTransfer's published component declaration while preserving immediate/request prop discrimination, and settle immediate moves synchronously so consecutive keyboard selection and reverse moves remain available. Exclude the broken Lucide 1.42.0 declaration release until a healthy upstream package passes strict consumer validation.
