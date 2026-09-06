# N3 Toolbar / ToggleGroup focus composition decision

## Decision

Toolbar and ToggleGroup should use the current target collection stack directly:

- `LogicalCollection` owns stable typed metadata and source order.
- `CollectionNavigation` owns active-key reconciliation, orientation, RTL, loop, Home/End and
  disabled-item skipping.
- `MountedElements` owns actual mounted nodes, DOM order and focus execution.
- `CompoundLogicalCollectionRegistry` remains the markup-driven compatibility source when item
  metadata is not available as one data array before children mount.
- `SelectionModel` owns ToggleGroup selection independently from the active focus key.
- `ZOverflowList` remains the only width-measurement and geometry-driven focus-handoff owner.

Do not add the proposed `RovingCollectionAdapter` whose public shape only repeats
`currentKey`/`set`/`move`/`tabIndex`. There are already 15 production
`CollectionNavigation` instances. Menu, Tabs, RadioGroup, Accordion, Select, Combobox,
MultiSelect, Segmented, Command, Tree, Cascader, Mention, TagsInput and Transfer have migrated
to the target stack. The old `RovingFocus`/`CollectionStore` pair has no production consumer and
survives only as a runtime export; its compatibility and eventual removal are separate from N3.

The one new bridge N3 needs is an explicit, no-wrapper-DOM Toolbar item registration. This is a
real missing boundary because Toolbar accepts heterogeneous authored markup rather than one
predeclared option array.

## Evidence from current consumers

`ZMenu` combines a compound registry, mounted nodes and `CollectionNavigation`. Focus changes
update the active key, keyboard movement then calls `mounted.focus`, and removal snapshots the
old view before `reconcileRemoved`. `ZTabs` uses the same layers, but keeps active and selected
state separate and adds an SSR-first-tab fallback before compound children register. Both
implement small owner-specific selection/activation behavior around the same navigation core.

`ZSegmented` is data-backed, so it constructs `LogicalCollection` directly. It separately owns
selection, active focus, mounted buttons, nearest focus after removal, and field/form behavior.
Its current arrow handler both focuses and selects the next radio. That behavior is correct for
standalone Segmented, but cannot run alongside a parent Toolbar arrow handler.

The repeated code worth watching is the lifecycle sequence:

1. register logical metadata;
2. register the mounted element;
3. on cleanup, snapshot the old view and ask `MountedElements.ownsFocus`;
4. unregister both records;
5. reconcile the removed active key;
6. focus the nearest surviving mounted key in the owner realm.

Toolbar should initially implement this sequence locally. Extract a helper only after its code is
actually identical to the surviving Menu/Tabs path. A helper for this registration lifecycle
could earn its cost; an interface that merely forwards `CollectionNavigation` cannot.

## Registration contract

`ZToolbar` renders one named `div[role="toolbar"]`. The root may use `tabindex="-1"` as a
programmatic fallback, but the toolbar's page Tab stop is one enabled child control. Toolbar owns
focus only; it never owns click, submit, href navigation, pressed state, checked state or menu
open state.

Each heterogeneous control is wrapped by `ZToolbarItem`, a component that emits no DOM. The Item
owns one stable attachment and calls its child snippet with the attributes to spread onto the
real control:

```text
type ToolbarKeyPolicy = 'toolbar' | 'control'

interface ZToolbarItemProps {
  value: SelectionKey
  disabled?: boolean
  keyPolicy?: ToolbarKeyPolicy
  children: Snippet<[ToolbarItemAttributes]>
}

interface ToolbarItemAttributes {
  tabindex: 0 | -1
  disabled?: boolean
  aria-disabled?: true
  [attachmentKey]: Attachment<Element>
}
```

Example authored markup:

```svelte
<ZToolbar aria-label="编辑工具">
	<ZToolbarItem value="bold">
		{#snippet children(props)}<button {...props}>粗体</button>{/snippet}
	</ZToolbarItem>
	<ZToolbarItem value="help">
		{#snippet children(props)}<a {...props} href="/help">帮助</a>{/snippet}
	</ZToolbarItem>
	<ZToolbarItem keyPolicy="control" value="font-size">
		{#snippet children(props)}
			<input {...props} aria-label="字号" type="number" />
		{/snippet}
	</ZToolbarItem>
</ZToolbar>
```

The returned object contains an ordinary `tabindex` for SSR and a property keyed by Svelte's
`createAttachmentKey()` for client mount/cleanup. The installed Svelte runtime explicitly
supports spreading such objects onto elements. The binding does not replace `onclick`, href,
submit or component events; root-level delegated `focusin` and `keydown` handle Toolbar focus.
Toolbar owns the resulting `tabindex`. The attachment key and function are created once per
`ZToolbarItem`; reactive tabindex changes do not create a new attachment or registration loop.

This binding can be spread onto native elements and onto first-party controls that already pass
rest props to their real root, including `ZButton` and `ZLink`. A focused authored test must prove
that the symbol attachment survives that component boundary before relying on it broadly.

Toolbar `size` is not part of these generic DOM attributes because an HTML input's native `size`
attribute is not a ZUI control size. Toolbar instead resolves its explicit size,
`componentDefaults.toolbar.size`, inherited Button default, then density, and uses a no-DOM nested
Provider to supply Button, ToggleGroup and Input defaults. Explicit child sizes still win.

### Why the alternatives are not the default

Client DOM enumeration can discover `button`, `a[href]` and inputs after hydration, but it cannot
produce a single SSR Tab stop. It also cannot reliably infer whether descendants of a ToggleGroup,
Menu, combobox or custom element are separate toolbar items, one opaque composite, or Portal
content. Dynamic `inert`/hidden state and Shadow DOM make an implicit selector another focus
engine. DOM scanning may be used as a development audit for unregistered tabbables, not as the
authoritative registry.

Making every `ZButton` and `ZLink` automatically consume Toolbar context pushes navigation
ownership into the gene layer. Context also follows component composition into nested/Portal
content, so a button rendered for a popup could register accidentally. N3 should not make generic
controls change focus behavior merely because a Toolbar exists above them. The explicit no-DOM
Item keeps ownership visible at the composition site and avoids adding ToolbarButton/ToolbarLink
aliases.

## Keyboard ownership

Toolbar calls `CollectionNavigation.handleKey` only when all of these are true:

- the event is not already prevented;
- IME composition is not active;
- no Ctrl, Alt, Meta or Shift modified command is in progress;
- the event target belongs to the registered item found through `event.composedPath()`;
- the item's policy gives Toolbar ownership of that key.

Horizontal Toolbar handles Left/Right and optional Home/End. Vertical Toolbar handles Up/Down and
optional Home/End. It should not enable the current `orientation="both"` behavior because that
takes the orthogonal axis away from embedded controls. Pointer or native focus only updates the
active key; it does not activate a command or change selection.

`keyPolicy="control"` reserves conflicting Arrow/Home/End keys for an editing control. In a
horizontal toolbar, a textbox or horizontal slider retains Left/Right; a spinbutton naturally
retains the orthogonal Up/Down. In a vertical toolbar, a textbox naturally retains Left/Right,
while a spinbutton that needs Up/Down uses control policy. In accordance with the
[WAI-ARIA Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), a control that needs
the Toolbar's navigation-axis pair should be avoided or placed last. Tab then leaves the Toolbar
from that last control; the runtime should not invent a nonstandard replacement shortcut.

Disabled items stay in the logical source but are skipped by navigation and receive
`tabindex="-1"`. Removing or disabling the active item chooses the nearest following enabled item,
then the nearest previous item, then the first enabled item, matching
`CollectionNavigation.reconcileRemoved`/`reconcile`.

## SSR and hydration

Attachments do not run during SSR, so SSR cannot depend on mounted registration. Toolbar should
copy the narrow technique already used by Tabs: while the compound view is empty, the first
enabled `ZToolbarItem` render asks `tabIndex(value, disabled)` and claims `initialTabStopKey`;
later Items receive `-1`. Stable authored values make hydration select the same item once the
compound registry is populated.

SSR output therefore contains:

- one named `role="toolbar"` root;
- exactly one enabled child with `tabindex="0"` when an enabled item exists;
- all other registered children with `tabindex="-1"`;
- no invented selection or activation state.

An implicit post-hydration DOM adapter cannot meet this contract and is not a substitute.

## Nested composites

Nested composites need one declared ownership mode; Toolbar must never let two roving owners
handle the same arrow event.

`ZToggleGroup` uses a targeted Toolbar integration. Standalone, it owns its own
`CollectionNavigation` and selection. Inside Toolbar, every real toggle button registers as a
separate Toolbar item using a group-instance-prefixed stable key. ToggleGroup stops handling
directional/Home/End navigation, while continuing to own `aria-pressed`, single/multiple
selection and click/Space activation. Focus movement does not change pressed state. This is the
toolbar-specific radio/toggle behavior described by the
[WAI-ARIA Radio Group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

A Menu or Popover trigger is one Toolbar item. Its Portal content belongs to Menu/Popover focus
management and never registers into Toolbar. Closing the layer restores the same trigger, whose
native focus event reestablishes the Toolbar active key.

An opaque custom composite must explicitly register one focus delegate/boundary and must own and
stop its internal navigation keys. Its iframe or Shadow DOM descendants are not automatically
flattened. Tabs is a separate composite and should not be accepted as an implicitly flattened
Toolbar item. `ZSegmented` remains standalone in the first N3 slice; a later Toolbar-aware mode can
delegate each option exactly like ToggleGroup and suppress Segmented's current arrow-to-select
path. Treating Segmented as one opaque item while retaining both roving handlers is invalid.

## ShadowRoot and iframe boundary

`MountedElements` now consumes the shared owner-realm active-element helper, which descends into
known ShadowRoot focus instead of comparing only `ownerDocument.activeElement` with the item.
Toolbar reuses it and does not add a private traversal. Physical registration also uses composed
containment and the nearest composed `role="toolbar"`, so inherited context cannot enroll Portal
content or an item owned by a nested Toolbar.

A Toolbar rendered inside an iframe uses that document's elements and owner Window; existing
`MountedElements.scheduleFocus` already queues through the mounted element's owner Window. One
Toolbar must reject registrations from another `ownerDocument`. An iframe host can be one opaque
Toolbar item, but controls inside the iframe belong to a separate Toolbar instance in that frame.

## OverflowList composition

Toolbar overflow reuses `ZOverflowList`. The one overflow trigger is a registered, pinned Toolbar
item. Hidden source items stay mounted for measurement, so Toolbar derives a physical view from
its already registered elements: `hidden`, `inert`, `aria-hidden`, native disabled, computed
visibility and `data-overflow-hidden` exclude an item from navigation without changing its logical
disabled metadata. Owner-realm observers invalidate only registered nodes and their Toolbar
subtree; they do not enumerate DOM to create business items.

`ZOverflowList` already owns physical focus transfer when geometry hides the focused item or when
the overflow trigger disappears after expansion. Toolbar must not issue a competing scheduled
focus. It updates its active key from the resulting delegated `focusin` event and then reconciles
the visible view. While the overflow Menu/Popover is open, `suspended` freezes the split so its
trigger cannot disappear; popup content retains its own collection and focus scope.

If an external caller places Toolbar inside an unrelated OverflowList, it must pass an explicit
visible-key view or treat the whole Toolbar as one overflow item. Toolbar should not infer external
visibility through document selectors.

## Implementation order

1. Reuse the corrected `MountedElements` owner-realm focus path and cover ShadowRoot plus
   iframe-local Toolbar cases.
2. Implement Toolbar directly with the existing four collection layers and explicit no-DOM Item
   binding. Add SSR first-enabled fallback before client registration.
3. Add ToggleGroup with independent `SelectionModel`; add only the targeted Toolbar focus-owner
   delegation.
4. Integrate Toolbar's own OverflowList using visible-key filtering and one overflow trigger.
5. After real code exists, compare its registration/removal lifecycle with Menu and Tabs. Extract
   only an identical lifecycle helper if duplication remains.
6. Leave the old exported `RovingFocus` compatibility decision and Segmented migration to a
   separate API stage.

This replaces the earlier instruction to create a generic roving adapter before Toolbar. The
existing navigation engine is already shared; N3 needs a composition boundary, SSR attributes and
one ShadowRoot ownership correction.
