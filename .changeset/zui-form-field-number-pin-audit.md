---
'@zadmin/zui': minor
---

Preserve native interaction inside Field label snippets, ignore blank feedback, expose Field anatomy/state metadata, and keep helper/error typography compact and wrapping. Add opt-in feedbackMinLines to Field/FormField so asynchronous feedback can reserve theme-relative space without clipping longer messages. Reject conflicting ancestor/descendant FormData paths consistently without depending on entry order.

Retire queued change/blur validation when submit or explicit full-form validation takes ownership. Prevent readonly NumberField/PinInput keyboard edits, block incomplete number drafts from native submission, and correctly synchronize PinInput native clear events. Expand executable Docs examples and targeted multi-browser regressions while keeping Unicode segmentation delegated to Intl.Segmenter with an explicit code-point fallback.
