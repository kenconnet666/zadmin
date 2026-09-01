# Button and ToggleButton Production Architecture

## Orthogonal visual axes

`ZButton` separates four independent decisions:

- `variant`: action hierarchy — `primary`, `secondary`, or `ghost`.
- `tone`: finite semantic intent — `default` or `danger`.
- `size`: `small`, `medium`, or `large`, with Provider density fallback.
- `shape`: normal content width, square icon button, or circular icon button.

The previous `variant="danger"` combined hierarchy and semantic intent. Because ZUI is still pre-1.0,
the alias is removed rather than deprecated. The equivalent solid destructive action is now
`variant="primary" tone="danger"`; secondary and ghost danger actions can use the same tone without
inventing more mixed variants.

## Loading ownership

Loading is a Button state, not a second status widget:

- The native button owns `aria-busy` and the optional `loadingLabel` accessible name.
- The default visual indicator is the existing `ZSpinner`, rendered inside an `aria-hidden` overlay so
  its internal `role=status` and label do not create nested live semantics.
- Normal start/content/end markup stays rendered at its intrinsic width with zero opacity. The loading
  overlay is absolutely centered, so entering loading does not resize the button.
- `loading` uses native disabled behavior to prevent duplicate click/submit actions while preserving
  the requested `type`, `form`, and other native button attributes.
- A custom `loadingIndicator` replaces only the visual indicator and remains inside the same
  `aria-hidden` owner.

Async work, cancellation, timers, retries, and result announcements remain application-owned.

## ToggleButton ownership

`ZToggleButton` adds exactly one state machine to Button:

- `pressed`
- `defaultPressed`
- `onPressedChange`

It forwards the native click first; `preventDefault` cancels the state transition. External writes to
`pressed` never call the user-change callback. The real button publishes `aria-pressed` and the shared
Button recipe derives its selected appearance using the same variant/tone matrix. ToggleButton does not
own loading, async behavior, a value, a group, or a second visual palette.

Square and circular icon-only Button/ToggleButton instances require an accessible name. ZUI deliberately
does not infer a name from a Lucide icon or from `title`.

## Mature-library decisions

- Ant Design separates color/danger from visual variant and supports shape/size/loading. ZUI adopts the
  orthogonal axes but keeps only two semantic tones and three hierarchy variants:
  <https://ant.design/components/button/>
- Chakra Button separates variant and color palette and documents loading width preservation. ZUI uses a
  finite tone union rather than an open palette on action semantics:
  <https://chakra-ui.com/docs/components/button>
- React Spectrum keeps pending actions focusable, while the existing ZUI contract uses native disabled
  during loading. This stage preserves ZUI's established native-disabled behavior but adopts a single
  accessible busy owner and stable width:
  <https://react-spectrum.adobe.com/Button>
- MUI ToggleButton confirms that Toggle is a native button with `aria-pressed` and shared size/color axes.
  ZUI keeps standalone Toggle state separate from collection-oriented groups:
  <https://mui.com/material-ui/react-toggle-button/>

## Required pre-1.0 consumer migration

Every remaining old danger variant must be changed to `variant="primary" tone="danger"` unless product
design explicitly chooses a lower hierarchy:

| Consumer                                  | Current location                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Theme Lab destructive action              | `apps/docs/src/views/ThemeLabPage.svelte:289`                                           |
| AlertDialog default action implementation | `ui/zui/src/components/compound/alert-dialog/ZAlertDialogAction.svelte:43`              |
| Popconfirm default action implementation  | `ui/zui/src/components/compound/popconfirm/ZPopconfirmAction.svelte:50`                 |
| Disabled Tooltip danger trigger demo      | `apps/docs/src/content/components/overlay/tooltip/DisabledDemo.svelte:7`                |
| Popconfirm prevent demo                   | `apps/docs/src/content/components/overlay/popconfirm/PreventDemo.svelte:19`             |
| Popconfirm interactive demo               | `apps/docs/src/content/components/overlay/popconfirm/InteractiveDemo.svelte:19`         |
| Popconfirm controlled lifecycle demo      | `apps/docs/src/content/components/overlay/popconfirm/ControlledLifecycleDemo.svelte:43` |
| Popconfirm async success demo             | `apps/docs/src/content/components/overlay/popconfirm/AsyncSuccessDemo.svelte:33`        |
| Popconfirm async error demo               | `apps/docs/src/content/components/overlay/popconfirm/AsyncErrorDemo.svelte:24`          |
| AlertDialog prevent demo                  | `apps/docs/src/content/components/overlay/alert-dialog/PreventDemo.svelte:18`           |
| AlertDialog interactive demo              | `apps/docs/src/content/components/overlay/alert-dialog/InteractiveDemo.svelte:20`       |
| Tree controller destructive action        | `apps/docs/src/content/components/navigation/tree/ControllerDemo.svelte:32`             |
| Tooltip/Popconfirm production fixture     | `ui/zui/tests/TooltipPopconfirmProductionFixture.svelte:50`                             |

The two compound action implementations should default both props (`variant="primary"`, `tone="danger"`)
and forward caller overrides independently. The other call sites can use the direct prop replacement.

## Deliberate non-goals

- No open-ended color palette or arbitrary semantic tone strings.
- No link polymorphism; navigation remains a real anchor component.
- No promise ownership or implicit async callback detection.
- No ToggleButtonGroup behavior inside standalone ToggleButton.
- No automatic icon accessible-name inference.
