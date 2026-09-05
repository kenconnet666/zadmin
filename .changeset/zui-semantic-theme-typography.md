---
'@zadmin/zui': minor
---

Unify semantic interaction colors, typography, and compact disclosure styling across the component system.

- Add `surfaceHover`, `primarySubtle`, `primarySubtleHover`, `accentSubtle`, `dangerSubtle`, `successSubtle`, `warningSubtle`, `onPrimary`, and `onDanger` color tokens. `extendTheme` derives related colors when their sources change; explicit overrides win.
- Apply shared colors to buttons/loading indicators, navigation links, choice and menu items, tags, alerts, danger badges, and selected calendar cells.
- Add the `fontSize.xxlarge` token, support it in Heading/Text/Code, and expose an explicit Code `size` API. Add AccordionTrigger `appearance="inline"` for compact disclosure controls without application-specific trigger CSS.
- Keep navigation heights consistent with the control size scale, remove implicit bold emphasis from plain List labels, and make Alert text use its own theme foreground and typography.
- Finish an in-flight Presence exit immediately when reduced motion changes its duration to zero.

Migration: consumers manually constructing complete themes through `defineTheme` must add the new color and font-size tokens; prefer `extendTheme(defaultTheme, patch)`. Theme duration values are now typed and validated as non-negative millisecond numbers or concrete `ms`/`s` values because JavaScript lifecycle timers cannot resolve `var()`/`calc()`. CSS expressions remain available for dimensional tokens. Invalid token types, blank strings, and out-of-range numeric values fail at theme construction.
