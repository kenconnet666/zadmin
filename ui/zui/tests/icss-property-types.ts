import { type IcssStyle, defaultTheme } from '../src/entrypoints/index.js';

type Style = IcssStyle<typeof defaultTheme>;

const style = {} as Style;
style.borderInlineStartColor._accent;
style.borderInlineStartStyle.solid;
style.borderInlineStartWidth._medium;
style.animationDelay._fast;
style.transitionDelay._normal;
style.animationDirection.alternateReverse;
style.animationFillMode.both;
style.animationIterationCount.infinite;
style.animationPlayState.paused;
style.textWrap.balance;
style.display.none;
style.visibility.hidden;

// @ts-expect-error Hiding layout is display.none; visibility.hidden preserves layout.
const ambiguousDisplayAlias = style.display.hidden;
void ambiguousDisplayAlias;

// @ts-expect-error A size token cannot be used as a duration.
const invalidDelayToken = style.animationDelay._large;
void invalidDelayToken;

// @ts-expect-error Background wrapping is not an animation fill mode.
const invalidFillMode = style.animationFillMode.wrap;
void invalidFillMode;

// @ts-expect-error Unknown CSS property accessors are intentionally not modeled; use .raw().
const unsupportedProperty = style.borderInlineColor._accent;
void unsupportedProperty;

// @ts-expect-error A defined property's unknown keyword must not be silently accepted.
const unsupportedKeyword = style.borderInlineStartColor.missing;
void unsupportedKeyword;
