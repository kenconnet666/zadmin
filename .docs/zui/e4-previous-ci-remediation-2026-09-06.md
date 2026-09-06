# E4 previous CI remediation (2026-09-06)

## Source run

This stage reads only completed GitHub Actions run `34025263618` at
`ae19b1bff881d764b5821aef369ad872b0c1d6d3`. Workspace builds and bundle/external-package jobs
passed. No new workflow was queried or awaited, and no diagnostic artifact was downloaded.

## Workspace component and coverage failures

Job `101465001480` reported 10 failures out of 947 ZUI tests:

- Chromium, Firefox and WebKit: `responsive-grid.browser.spec.ts:50` expected the Stack row gap
  to remain `3px` after its container entered the medium breakpoint, but received the responsive
  shared gap `20px`.
- Chromium, Firefox and WebKit: `scroll-area-production.browser.spec.ts:50` expected the explicit
  RTL fixture to compute as RTL, but it computed as LTR.
- Firefox only: `scroll-area-production.browser.spec.ts:33` requested native `scrollTop=80` and
  received `79.6500015258789` throughout the five-second exact-equality poll.
- Chromium and WebKit: `steps-production.browser.spec.ts:211` measured a `280px` narrow owner with
  `scrollWidth=281`; the Steps root itself passed its preceding no-overflow assertion.
- Unit fixture audit: `StepsUncontrolledFixture.svelte` placed a Svelte diagnostic `<output>`
  inside a native form reset owner.

Coverage job `101465001477` repeated four Chromium failures: the Steps fixture audit, Grid/Stack
gap, ScrollArea explicit RTL and Steps narrow-width cases. Its remaining ZUI coverage tests and
the later SvelteKit coverage package passed.

### Remediation

`ZStack` and `ZGrid` now cascade an explicit axis spacing value through later breakpoints before
emitting responsive longhands. A scalar `rowGap=3` therefore remains `3px` when `gap` changes at
medium, and `{ small: 5 }` column gap continues as `5px` at medium unless explicitly replaced.
The original responsive-value validation path remains active, including unknown-key and
non-plain-object rejection.

The legacy ScrollArea fixture now puts `dir="rtl"` on `ZScrollArea` itself. The outer full-motion
Provider intentionally owns LTR, so relying on a plain ancestor `div[dir=rtl]` could not override
the component's resolved direction. The separate Provider-only RTL fixture remains unchanged.

ScrollArea continues to expose the browser's native double-precision positions. The Firefox
result is a `0.3499984741211` CSS-pixel quantization difference, not delayed motion: the value was
stable for the complete poll. Only requested native scroll coordinates now use a half-CSS-pixel
comparison, and the authored event output is parsed and checked numerically rather than rounded
or normalized in production. RTL `scrollLeft=-100` remains exact and unchanged.

The named ScrollArea region intentionally has `tabindex=0`; its Svelte accessibility suppression
now documents that focus contract instead of leaving the same warning in static and Windows jobs.

Chrome inspection reproduced the Steps owner at 280px with scrollWidth 281 even with explicit
root sizing. The actual contributor was its `ZVisuallyHidden` status: negative margin placed
the one-pixel absolute box at inline coordinates 280..281 in RTL. The shared visually-hidden
recipe now uses zero margin and explicit logical start insets, keeping that clipped pixel
inside the containing block. The same owner then measures 280/280. The unnecessary Steps root
sizing change was removed; strict overflow assertions and visible focus outlines are retained.
The uncontrolled Steps diagnostic output moved immediately outside the native form.

## Docs AppShell failures

Firefox job `101465001483`, Chromium job `101465001485` and WebKit job `101465001499` each passed
185 of 186 Docs cases. Their only failure was the accessibility sweep for
`#/components/app-shell`: axe `landmark-unique` found repeated navigation landmarks with the same
accessible name `主导航`. The four real demos render simultaneously on one documentation page.

Each demo now supplies purpose-specific `navbarLabel` and `asideLabel` values: desktop workspace,
responsive example, root-scroll example and Arabic RTL example. The fix changes the authored
landmark names at their source and does not disable or filter axe.

## Earlier WebKit blockers confirmed passed in this run

Workspace job `101465001480` contains an explicit passed-test record for
`coordinates modal Popover semantics, width and resource cleanup` in all three engines:
Firefox `368ms`, Chromium `389ms` and WebKit `1681ms`. That exact test retains the strict terminal
`{ connected: true, state: 'open', opacity: '1' }` assertion and the animation/resource checks.
This run therefore confirms the prior WebKit intermediate-opacity blocker passed at this commit;
it is not merely absent from the failed-test summary.

The three Docs jobs each explicitly started
`keeps DateRangePicker two-step normalized selection and dual form fields synchronized` as case
39 of 186: Firefox job `101465001483`, Chromium job `101465001485` and WebKit job `101465001499`.
The list reporter does not print a separate check-mark line for each passing Playwright case, but
each job completed with exactly one named failure, the later AppShell accessibility sweep, and
reported 185 passed. Consequently the DateRangePicker pure-pointer case executed and passed in
all three engines at this commit. The earlier WebKit second-click blocker can be removed from the
active ledger while retaining its diagnostic history.

## Static and Windows failures remediated by the integration stage

Static job `101465001531` reported 20 errors and one warning in five files. Windows job
`101465001454` stopped in desktop `svelte-check` with 15 errors and one warning in three shared
ZUI files; it did not reach a C# compiler failure. The integration stage has now changed every
reported source/type boundary below; they remain pending remote verification:

- `ZOverflowList.svelte:288-310`: generic `$state<TKey | undefined>` plus derived `hidden/state`
  inference errors, including “Untyped function calls may not accept type arguments”, `$state`
  used before declaration and implicit-any recursive initializers. The state snapshot is now
  named `snapshot`, and the hidden set has an explicit `Set<TKey>` type.
- `ZAppShell.svelte:5-6` and `184-188`: duplicate `ZLayoutSpacing` and `ResponsiveValue` imports
  across module and instance scripts. The duplicate instance-script type imports were removed.
- `overflow-layout.spec.ts:13-14`: the generic call inferred literal key type `1`, rejecting string
  keys `"1"` and `"third"`. The mixed-key call now explicitly uses `SelectionKey`.
- `overflow-list-production.spec.ts:17,37,41`: server render inferred `TItem=unknown`, making typed
  `itemKey` props incompatible in both positive and negative cases. The SSR renders now use the
  explicit generic component instance.
- `ZScrollArea.svelte:318`: the named focusable region warning is addressed by the documented
  intentional focusable-region suppression above.

## Validation boundary

Local verification is limited to Node Prettier, `git diff --check`, focused WebStorm diagnostics
and source review. Per project policy this stage does not run Vitest, Playwright, Svelte Check,
full TypeScript, builds or bundle gates. The root integration task owns real browser inspection,
public/generated updates and the next CI push.
