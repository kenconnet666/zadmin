# Small Foundation Primitives

Status: production contracts implemented, 2026-09-02.

## Separator

Separator remains a semantic boundary, not a resizable splitter. Horizontal mode uses native `hr`;
vertical mode uses `role=separator` and `aria-orientation=vertical`. `decorative` removes the element from
the accessibility tree. Semantic separators may have a label, while decorative labels are ignored.
The line uses Theme border as `currentColor`, allowing forced-colors to remap it. We adopt Radix's small
orientation/decorative contract and reject size/color/asChild expansion.

## Visually Hidden

VisuallyHidden is a fixed span that clips content visually while keeping it in the accessibility tree. It
does not provide a focusable mode or asChild polymorphism. A skip link or hidden interactive control needs
its own visible-on-focus contract and must not be placed inside this primitive. The clipping technique does
not depend on color, opacity or viewport size, and remains visually absent in print and high contrast.

## Kbd

Kbd is the native user-input text element. Multiple keys are composed as multiple Kbd instances or as
nested Kbd elements following HTML semantics. Applications explicitly provide Ctrl/Command alternatives
and accessible labels for glyphs. ZUI does not inspect the platform, register shortcuts, or add a key-map
data API. This follows MDN's native nesting model and keeps Chakra-style combinations at composition level.

## AspectRatio

AspectRatio is a responsive div using native CSS `aspect-ratio`. Ratios are positive finite numbers or
positive finite width/height strings. The container constrains itself to its parent and supports images,
video, custom content or no content; media owns fit, alt, captions and controls. No padding hack,
ResizeObserver, breakpoint object or media-specific prop is included.

## Container

Container provides a centered typed max-width and logical inline gutter. `box-sizing:border-box` ensures a
100% narrow-screen width includes padding rather than overflowing. `full` removes only max-width, not
gutter. Nested containers explicitly retain their own boundaries. Container does not add landmarks,
responsive breakpoint maps, Grid columns, Stack alignment, sx or arbitrary polymorphism.

## References

- Radix Separator: <https://www.radix-ui.com/primitives/docs/components/separator>
- Chakra Visually Hidden: <https://chakra-ui.com/docs/components/visually-hidden>
- Native Kbd: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd>
- MUI Container: <https://mui.com/material-ui/api/container/>
- Chakra Aspect Ratio tokens: <https://chakra-ui.com/docs/theming/aspect-ratios>
