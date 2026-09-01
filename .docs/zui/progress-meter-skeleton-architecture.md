# Progress, Meter and Skeleton Architecture

Status: production contracts implemented, 2026-09-02.

## Separate meanings

- `ZProgress` communicates completion of an ongoing task. Missing `value` is indeterminate; a finite value
  is determinate and clamps to the declared business range.
- `ZMeter` communicates a scalar within a meaningful known range, such as storage or health capacity. It
  never represents task completion and never has an indeterminate mode.
- `ZSkeleton` is a visual placeholder occupying future layout space. It is always absent from the
  accessibility tree; the loading owner supplies readable status and decides when real content replaces it.

These components do not share a service or state machine merely because they may appear during loading.

## Progress

Line view remains a native `<progress>`. Because HTML progress always starts at zero, a business range with
non-zero `min` is translated to native `max - min` and `value - min`, while original min/max/value remain in
ARIA. Circle view is a `role=progressbar` around two numeric SVG circles. This is data geometry, not an icon,
so Lucide replacement would be incorrect.

Both views share validation, formatter, accessible label, indeterminate text and finite tone. Native line
uses `accent-color`; circle uses `currentColor`, including its translucent track, so forced-colors can remap
the geometry. Circle indeterminate rotation and determinate stroke transition use Theme durations and stop
under Provider/system reduced motion.

We adopt MUI's determinate/indeterminate and custom range semantics and Ant's formatter/tone/circle surface.
We do not add dashboard arcs, step segments, gradients, arbitrary stroke colors or nested success segments.

## Meter

Meter is always the native `<meter>` because browsers and assistive technology already understand
min/max/low/high/optimum. ZUI validates every value before rendering: max must exceed min; value and optimum
must lie within the range; low/high must remain ordered. Unlike Progress, Meter never clamps an invalid value.

The formatter receives normalized `MeterRange` and computed `MeterState`, and its result is both fallback
text and `aria-valuetext`. Styling does not replace the native bar, preserving platform high contrast and
best-region presentation. This follows the native-first recommendation in MDN's meter guidance.

## Skeleton

Skeleton supports only line, rectangle and circle geometry plus strict numeric/CSS dimensions. `lines`
duplicates equal line placeholders only; applications compose avatars, media, actions and varying widths
with ZStack and multiple Skeletons. There is no business-layout DSL and no children/loading switch.

The pulse is a single owner-realm WAAPI animation using `theme.duration.skeletonPulse`. `animated=false` or
reduced motion produces no animation. Every root remains `aria-hidden`; readable loading state belongs to a
nearby status, Spinner, Progress or task owner. A border plus surface fill preserves shape in high contrast.

## References

- Native progress: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress>
- Native meter guidance: <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/meter_role>
- MUI Progress: <https://mui.com/material-ui/react-progress/>
- Ant Progress: <https://ant.design/components/progress/>
- MUI Skeleton: <https://mui.com/material-ui/react-skeleton/>
- Ant Skeleton: <https://ant.design/components/skeleton/>
- Naive UI Progress: <https://github.com/tusen-ai/naive-ui/tree/main/src/progress>
- Naive UI Skeleton: <https://github.com/tusen-ai/naive-ui/tree/main/src/skeleton>
