# E3 DateRangePicker WebKit range-selection diagnosis

## Evidence

GitHub Actions run `34017484365`, job `101443758658` checked out `424128d`. Its WebKit
Docs job failed only the DateRangePicker two-step selection case; the other 177 cases passed.
After Playwright clicked August 25 and August 22, the original first terminal assertion waited
five seconds for focus restoration. All 14 samples still found the trigger with
`aria-expanded="true"` and `data-state="open"`, and the trigger remained inactive.

The uploaded screenshot and trace narrow this further. The displayed value and fields stayed at
`2026-08-25 / null`, while August 22 through 25 were painted as the focused preview. The trace
shows Playwright's second click first found August 22 unstable, then saw August 15 intercept
pointer events after the absolute Portal moved from `bottom-start` to `top-start`. Its final
attempt focused August 22, causing the preview, but the document scrolled another 21 pixels and
no end commit followed. The component source has only one route for those two outcomes:
`onfocus` publishes preview focus and `onclick` commits the value. The pointer click was
cancelled after focus while the target moved; no submitted range was later reopened. The trace
does not establish whether the same pointerdown-focus movement can cancel a real user's click,
so it does not yet distinguish a Playwright-only actionability problem from a production pointer
interaction defect.

## Ownership and current boundary

`ZDateRangePicker` owns the two-step state. A start click commits a partial value and changes
`rangePart` to `end`; the end click normalizes the range, returns `rangePart` to `start`, clears
preview focus, and requests `setOpen(false)`. `ZPopoverContent` reacts to the controlled open
value by making retained Presence content inert, destroys its FocusScope, and restores focus.
The picker also queues a trigger-focus fallback in the owner document.

The focused ZUI browser case already waits for a Svelte update after each calendar click. The
Docs E2E issued its two real Playwright clicks consecutively without observing that the first
partial selection had reached the DOM and FormData. Chromium and Firefox passed that sequence;
one WebKit run hit the auto-scroll/absolute-Portal flip above. The proven boundary is between
focus-driven preview and click-driven end commit. Whether ownership of pointer focus, Floating
repositioning, or WebKit click cancellation requires a production change remains unproven. This
failure is separate from the Popover entry-animation start-time diagnosis.

## Change

The Docs case keeps the original pointer-only path with two real Playwright clicks, default
timeouts, strict final focus/range/FormData assertions, and WebKit coverage. Between clicks it
strictly waits for the partial range, `end` selection state, open trigger/content, and partial
FormData. After the second click it polls one strict snapshot containing the normalized value,
both form fields, closed root/trigger, non-interactive Presence content, and restored trigger
focus before retaining the original terminal assertions. It does not pre-focus the end date or
dispatch synthetic DOM events, so a repeated failure still exercises the unresolved pointerdown
to click boundary.

This change is diagnostic and does not claim a fix. If WebKit fails again, the received snapshot
will identify the earliest failed ownership boundary without a timeout increase, retry, skipped
engine, or relaxed assertion. A production change requires evidence that real pointer activation
can reproduce the movement and cancellation, or that the component moves its target during the
pointer sequence independently of Playwright's auto-scroll.
