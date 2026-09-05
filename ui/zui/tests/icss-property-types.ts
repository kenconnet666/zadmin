import { type IcssStyle, defaultTheme } from '../src/entrypoints/index.js';

type Style = IcssStyle<typeof defaultTheme>;

const style = {} as Style;
style.borderInlineStartColor._accent;
style.borderInlineStartStyle.solid;
style.borderInlineStartWidth._medium;

// @ts-expect-error Unknown CSS property accessors are intentionally not modeled; use .raw().
const unsupportedProperty = style.borderInlineColor._accent;
void unsupportedProperty;

// @ts-expect-error A defined property's unknown keyword must not be silently accepted.
const unsupportedKeyword = style.borderInlineStartColor.missing;
void unsupportedKeyword;
