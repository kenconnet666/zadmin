# Accordion and Tabs Logical Collection Architecture

## Scope

This stage retires the legacy `CollectionStore`/`RovingFocus` implementations in Accordion and Tabs.
Both compound families now use the same ownership layers as the newer selection components:

1. `CompoundLogicalCollectionRegistry` reads typed item metadata from compound Trigger children.
2. `LogicalCollection` is the sole ordered key, text, and disabled-state fact.
3. `MountedElements` owns only currently rendered Trigger elements and their opaque IDs.
4. `CollectionNavigation` owns the active key and nearest-enabled reconciliation.
5. Accordion expansion or Tabs selection remains a separate controllable owner.

`SelectionKey` is `string | number`; finite numbers other than negative zero are accepted. Numeric `1`
and string `"1"` remain distinct in collection identity, state, DOM registration, and callbacks. Opaque
incremental slots generate IDs so stringification cannot cause ARIA collisions.

## Accordion contract

`type` is a public discriminant:

- `single`: `value/defaultValue` are `SelectionKey | null`; `null` is the explicit empty value.
- `multiple`: `value/defaultValue` are deduplicated `readonly SelectionKey[]`; `[]` is empty.

Arrays in single mode and scalar/null values in multiple mode fail early. `activeValue` is independent
from expansion. Arrow/Home/End move active focus only. Native button activation toggles expansion.
When `collapsible=false`, an open single Trigger exposes `aria-disabled=true` and cannot close, but it
is not native-disabled and remains reachable by collection navigation.

Each Trigger is the only button inside a `role=heading` wrapper with configurable `headingLevel`.
Content defaults to `role=region`; nested or large multiple Accordions may set `region=false` to avoid
landmark proliferation. Root and Item contexts share an opaque owner token, so valid nested roots own
independent collections while a Trigger/Content that accidentally inherits an outer Item fails early.

Accordion Content retains the existing grid-row/opacity Presence transition. A closing Panel is inert
but does not add a redundant `aria-hidden` while focus is being restored to its Trigger, then unmounts.
The timer comes from the Content owner Window. Reduced motion completes exit immediately and releases
the Presence timer/listener state.

## Tabs contract

Tabs exposes two nullable typed owners:

- `value`: selected Tab and visible Panel.
- `activeValue`: roving-focus Tab.

In `automatic` mode, focus activates selection. In `manual` mode, arrows move only `activeValue`, and
Enter/Space or click commits `value`. IME composition and legacy key code 229 bypass both navigation and
activation.

Panel lifecycle is explicit:

- `keep-mounted` (default): render every Panel and hide inactive Panels. This preserves state and makes
  automatic activation immediate, matching the APG latency recommendation.
- `lazy`: do not render a Panel before its first selection; retain it hidden after first visit.
- `active-only`: render only the selected Panel and unmount on every switch.

`aria-controls` is emitted only while the corresponding Panel exists, so lazy and active-only Triggers
never reference a missing ID. Before any selected Panel becomes hidden or unmounts, focus inside it is
moved to the new selected Trigger (or the current/first enabled Trigger when selection is null).

Dynamic removal or disabling of an active/selected Trigger recovers in old logical order: the next
enabled key first, then the previous enabled key, then the first enabled key, otherwise `null`. Recovery
writes through the binding without firing user callbacks. If the removed Trigger held DOM focus, focus
is restored to the recovered mounted Trigger.

Compound registration remains client-reactive, but SSR/client-first render uses a synchronous one-shot
roving claim: an explicit active/selected key wins, otherwise the first enabled Trigger receives
`tabindex=0`. Hydration then hands ownership to LogicalCollection without producing an all-`-1` entry
state.

## References and deliberate choices

- WAI-ARIA APG Accordion: <https://www.w3.org/WAI/ARIA/apg/patterns/accordion/>
- WAI-ARIA APG Tabs: <https://www.w3.org/WAI/ARIA/apg/patterns/tabs/>
- APG keyboard interface: <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>
- React Spectrum Accordion: <https://react-spectrum.adobe.com/Accordion>
- React Spectrum Tabs: <https://react-spectrum.adobe.com/Tabs>
- MUI Tabs panel mounting: <https://mui.com/material-ui/react-tabs/>
- Ant Design Collapse/Tabs: <https://ant.design/components/collapse/> and
  <https://ant.design/components/tabs/>
- Naive UI Collapse/Tabs sources: <https://github.com/tusen-ai/naive-ui/tree/main/src/collapse> and
  <https://github.com/tusen-ai/naive-ui/tree/main/src/tabs>

We keep compound composition instead of adding a parallel options API because Panel snippets and nested
content are authoritative application structure. We do not add editable/closable Tabs, drag reorder,
overflow dropdowns, URL routing, async loaders, or virtualized headers in this stage. Applications own
those workflows and may mutate the compound children; the collection recovery contract handles the
result.
