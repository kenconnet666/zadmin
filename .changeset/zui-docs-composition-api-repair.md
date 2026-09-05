---
'@zadmin/zui': minor
---

Repair component composition, typography, and public API forwarding discovered through real Docs usage.

- Add explicit utility-layer recipes, button/navigation appearances for native links, Card body padding, and accessible Table scroll-region references.
- Preserve exact Code source whitespace and line geometry after highlighting; align Tag/Text/Button typography with theme tokens.
- Register logical border tokens and reject unknown ICSS accessors at type/runtime boundaries; valid unmodeled CSS values remain available through `.raw()`.
- Unify Select, MultiSelect, and RadioGroup size inheritance, honor local trigger disabling, and synchronize virtual Transfer disabled semantics.
- Remove menu slots and relationship IDs that were silently overwritten from public types; preserve native lifecycle and hover/focus callbacks alongside internal behavior.

Docs now consumes shared cards, accordions, navigation links, table scrolling, and code copying instead of duplicating those UI implementations. Test inventories explicitly distinguish authored evidence from executed page-level acceptance.

Migration: remove child `id` on Root-owned relationship nodes and reserved `leading`/`trailing` slots on menu indicator wrappers. Where supported, set the ID on the Root (`ZPopover.triggerId` or input Root `id`). Invalid fluent ICSS accessors that previously did nothing now throw; replace them with a modeled accessor or `.raw(validCssValue)`.
