# ZToolbar execution record (2026-09-06)

## Result

`ZToolbar` and the no-DOM `ZToolbarItem` implement the N3 focus-composition decision without a
second collection or roving engine. Toolbar directly composes `LogicalCollection`,
`CompoundLogicalCollectionRegistry`, `CollectionNavigation` and `MountedElements`.

`ZToolbarItem` owns no visual or business activation behavior. Disabled items suppress native activation. It calls its child snippet with an object
containing an SSR `tabindex`, disabled state and one stable `createAttachmentKey()` attachment.
The child spreads those properties onto its real native or first-party control, so Toolbar never
creates a button/link alias or an extra DOM wrapper.

## Public contract

```svelte
<ZToolbar aria-label="编辑工具" orientation="horizontal" loop gap="small" size="small">
	<ZToolbarItem value="save">
		{#snippet children(props)}
			<ZButton {...props}>保存</ZButton>
		{/snippet}
	</ZToolbarItem>
</ZToolbar>
```

Toolbar owns the active focus key, one child Tab stop, directional navigation, RTL, Home/End,
looping, dynamic removal reconciliation and owner-level disabled state. The child continues to
own click, submit, href, pressed/checked state and popup behavior.

Toolbar size resolves the explicit prop, `componentDefaults.toolbar.size`, the inherited Button
default, then density. A no-DOM nested Provider supplies that result as the Button, ToggleGroup
and Input default. Explicit child size still wins. Native HTML controls do not receive an invalid
string `size` attribute and retain caller-owned visual sizing.

`keyPolicy="control"` preserves input keys that operate the control. It reserves Left/Right and
Home/End for ordinary text inputs, Up/Down and Home/End for number/spin controls, and all
navigation keys for multiline/contenteditable, range/date-like inputs and combobox/slider roles.
Non-conflicting Toolbar-axis keys still move focus. Modified keys, IME composition and events
already cancelled by the user's root handler are never consumed.

Conflicting text inputs belong at the end of a horizontal Toolbar. Tab still exits the composite;
after focus leaves for another control, re-entry starts at the first available command, so a
text input cannot monopolize access to the preceding buttons. This uses the first-item entry
option in the [WAI-ARIA Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

Spreading `disabled` into `ZButton`, native button/input or `ZLink` keeps their native semantics.
A caller using a raw anchor must also omit its `href` while disabled because a parent no-DOM
component cannot rewrite a child-owned href before hydration; `ZLink disabled` is the direct
first-party path for that case.

## Boundaries

- Registration accepts only an HTMLElement contained by the current closest `role="toolbar"`;
  Portal content and a nested Toolbar cannot leak into the parent registry.
- Navigation derives a physical view from registered elements only. Owner-realm ResizeObserver,
  MutationObserver and window resize invalidate `hidden`, `inert`, `aria-hidden`, native disabled,
  visibility and `ZOverflowList` concealment facts without scanning DOM for business items or
  changing caller-owned disabled metadata.
- The root uses delegated keyboard/focus boundary events, while each stable attachment records
  the actual focus element.
- SSR uses the Tabs-style first-enabled fallback before compound effects register, so each named
  Toolbar emits one child `tabindex="0"` without DOM scanning.
- ToggleGroup integration consumes the optional Toolbar context separately. Toolbar does not
  import or modify ToggleGroup.
- Overflow measurement and geometry-driven focus transfer remain `ZOverflowList` responsibilities;
  Toolbar filters its navigation view and learns the resulting active item through native focus.
- ShadowRoot active-element correctness comes from the shared DOM-realm/MountedElements repair,
  not a Toolbar-local traversal.

## Authored evidence

The fixture and tests cover native button, `ZButton`, native anchor, disabled `ZLink`, number and
text inputs, horizontal/vertical navigation, RTL reversal, `loop=false`, Home, user-cancelled
keydown, native click and href activation, control-owned conflicting keys, non-conflicting axis
movement, dynamic focused-item removal, focused disablement, nested Toolbar isolation, a real
OverflowList/Popover path that skips inert source items and preserves geometry focus handoff,
nine named SSR toolbars with one Tab stop each, absence of wrapper item DOM, and type rejection of
invalid orientation/key/policy.

Local validation is intentionally limited to Node Prettier, `git diff --check` and focused
WebStorm diagnostics. Browser suites, TypeScript gates, builds and generated contract/catalog
updates are delegated to CI and the owning integration stage.

Real Chrome Docs inspection additionally verified one Tab stop in each of four rendered toolbars,
390px without horizontal overflow, and native keyboard traversal into and across two ToggleGroups.
The control-policy example kept the input caret at index zero after Home, exited on Tab, and
returned to the first command on Shift+Tab. In a 240px overflow example, End skipped the three
inert source items and reached the real overflow trigger; Enter opened their command popup and
Escape restored that trigger. No console errors or warnings were reported in this inspection.
Public metadata and catalog integration are complete. Readiness still requires the candidate's
remote test, accessibility and release gates; experimental labels remain unchanged.
