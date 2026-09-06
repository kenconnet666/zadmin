# E10 previous CI evidence

Read once on 2026-09-07 from GitHub Actions run [34050004211](https://github.com/kenconnet666/zadmin/actions/runs/34050004211).

- Workflow: `CI`
- Status: `completed`
- Conclusion: `failure`
- Commit: `d4eb6fae5dfe3028a2dfabd4eca6ba4ea69b5c1d` (`master`)
- Created: `2026-09-06T17:53:37Z`; updated: `2026-09-06T18:11:12Z`
- `Workspace builds` and `Bundles and external packages` passed. `Drizzle PostgreSQL JSONB` also passed.

## Static

`Static contracts` failed in `ui/zui` with 12 errors and 5 warnings. The deduplicated actionable errors were:

- `src/components/input/ZSlider.svelte:564:23`: `HTMLElement | null | undefined` is not assignable to `HTMLElement | null`.
- `src/components/input/ZRangeSlider.svelte:598:2`: `aria-readonly` is unsupported for role `group`.
- `src/components/input/ZRangeSlider.svelte:599:2`: `aria-invalid` is unsupported for role `group`.
- `src/components/input/ZRangeSlider.svelte:616:2`: pointer event handlers on a `div` require an ARIA role.
- `src/components/input/ZRating.svelte:655:7`: `aria-readonly` is unsupported for the implicit `input[role=radio]`.
- `src/components/layout/ZResizable.svelte:1057:4`: non-interactive `div` has mouse/keyboard listeners.
- Contract/type checks also reported unused `@ts-expect-error` directives, `[number]` versus `readonly [number, number]`, invalid `SliderCollision` value `"cross"`, five `UserEvent.pointer` properties missing from the type, indexing a `Number`, and `Snippet<[never]>` not assignable to `Snippet<[context: ZRatingItemContext]>`.

`Windows C# WebView2 desktop` failed its Svelte check with the same `HTMLElement | null | undefined` to `HTMLElement | null` error (one error, five warnings). No build failure was reported; `Workspace builds` passed.

## Browser and component tests

The same production-contract failures were repeated by `Workspace component tests` and `Coverage suites`; the repeated root causes were deduplicated here:

- `tests/fieldset.spec.ts`: SSR output did not contain the expected `<legend>Account` markup.
- `tests/range-slider-production.spec.ts`: expected `<b>15</b>`, received `<b>undefined</b>` in RangeSlider value labels.
- `tests/range-slider-production.browser.spec.ts`: `userEvent.pointer is not a function`; the vertical drag assertion also received missing `data-dragging` (`undefined` instead of `"true"`).
- `tests/affix-back-top-production.browser.spec.ts`: BackTop scroll assertion did not reach expected `scrollTop=0`; RTL/Button-size assertion hit `Cannot read properties of null (reading 'closest')`.
- `tests/menubar-production.browser.spec.ts`: focus reconciliation expected the view button but received a different button.
- `tests/readonly-controls.browser.spec.ts`: expected event text `0:0:0|0:0:0:0:0|0:0:0:0|0:0`, received `0:0:0|0:0:0:1:1|0:0:0:0|0:0`.
- `tests/rating-production.browser.spec.ts`: expected rating root/controls were absent (`null`), causing `getAttribute`, `querySelector`, and `dataset` TypeErrors.
- `tests/slider-keyboard.browser.spec.ts`: RTL expected `rtl:45:3:3` / `rtl:50:2:2` sequences but received `rtl:55:3:3` / corresponding wrong values.

## Docs browser E2E

`Docs end-to-end (chromium)`, `(firefox)`, and `(webkit)` each completed with 200 passed and 2 failed:

- `tests/site.e2e.ts:1518`: `keeps Slider keyboard, value text, FormData and reset synchronized`; `toHaveValue` expected `"40"` but the element was not found, and the expected `value = 40% · 用户变更次数 = 1` text was absent.
- `tests/site.e2e.ts:2189` on `#/components/rating`: accessibility route sweep expected `results.violations` to equal `[]`, but it did not.

The failure shape was identical across Chromium, Firefox, and WebKit. This run therefore has no evidence of a build/compiler failure; the blocking failures are static contracts/types plus component/browser behavior and the rating accessibility route.

## E9 snapshot read before the E10A push

Run [34056020605](https://github.com/kenconnet666/zadmin/actions/runs/34056020605), commit `59ff62d79c76a099906d861c8dbfa33d13573c2e`, completed with failure. Read once; no polling or rerun. Workspace builds, bundles/external packages, Drizzle PostgreSQL JSONB and dispatch revision integrity passed. Static reported 24 errors/8 warnings; coverage reported 15 failed/1103 passed. These are historical E9 results, not results for the uncommitted E10A changes.

New E9 failures were FormModel array/object string indexing, CheckboxGroup generic narrowing and duplicate type import, unsupported group ARIA, initial SelectAll mixed state read before the first Svelte flush, checkbox indicator size confused with control height, and the CheckboxGroup Docs accessibility route. The previous Rating/Slider, BackTop and Menubar failures repeated. All three Docs engines reported Slider plus Rating and CheckboxGroup accessibility failures.

## E10A remediation and remaining execution boundary

- FormModel uses Reflect deletion and own-property definition when cloning array/object paths, preserving correct TypeScript indexing and prototype behavior. CheckboxGroup keeps its generic type through runtime array validation and removes the duplicate instance-script type import.
- Group roles no longer receive unsupported readonly/invalid/required ARIA; native controls retain their applicable semantics, required ownership and constraint validity. RangeSlider and Rating received the corresponding role-specific corrections. Resizable uses the correct comma-separated Svelte warning suppression for its established accessible drag surface.
- Slider nullable geometry fallback is explicitly null. readonly guards precede consumer pointer/key callbacks. Explicit ltr/rtl direction now comes directly from reactive props/Provider state; only auto consults computed DOM direction, avoiding a cached old direction during the same flush.
- Rating's missing browser roots came from a fixture snippet mutating `$state` during render. The fixture now renders a pure `Object.isFrozen(context)` data attribute and the test checks every rendered layer. Production rendering was not replaced to accommodate the invalid fixture.
- Fieldset SSR assertion ignores framework comment markers; RangeSlider and Rating raw snippets use the actual getter/context contracts. Tuple/collision negative type assertions are placed at the failing expressions.
- RangeSlider has a Playwright-provider browser command for real pointer down/move/up outside the rail, with release in finally. Synthetic pointer branches remain state-machine assets and are not claimed as native capture evidence.
- BackTop fixture separates the full-motion and primary fixed buttons so the intended target is actionable. Menubar mounts await tick and establish that Edit actually opened before disable/remove; the speculative direct-focus production change was reverted.
- CheckboxGroup fixtures await registration before initial mixed state assertions. Five indicator sizes are 12/14/16/20/24; the label is also checked as the complete click target. These are not the 24/28/32/40/48 control row heights. Required coverage retains actual form.checkValidity/min/max assertions.
- The Docs Slider locator still matches the current rendered slider name/value and example. No selector or business assertion was relaxed without evidence.

Local checks comprise affected-file WebStorm diagnostics, format/diff checks, source artifact generation and necessary real browser inspection. No local test suite, typecheck or build ran. The above fixes and authored regressions await remote execution; this document does not report E10A CI as passed. New CI must run without blocking the next implementation stage.
