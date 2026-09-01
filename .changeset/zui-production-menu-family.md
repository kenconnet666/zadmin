---
'@zadmin/zui': minor
---

Unify Menu, DropdownMenu, ContextMenu, and nested submenu behavior on LogicalCollection, MountedElements, CollectionNavigation, locale-reactive typeahead, and the existing Popover layer runtime. Add controlled checkbox and typed radio items, real link items, RTL-aware submenus, dynamic nearest-focus recovery, ArrowUp/ArrowDown menu-button entry, cancellable cross-submenu actions, pointer/keyboard context anchors, viewport-bounded popup scrolling, and dedicated production documentation and browser contracts. PopoverContent now exposes typed cancellable Escape, focus-outside, and pointer-outside callbacks so nested layers can close the correct menu chain without duplicating document listeners.
