export const ZUI_PACKAGE_NAME = '@zadmin/zui';

export { Box } from './components/box/index.js';
export type { BoxProps } from './components/box/index.js';
export { Button } from './components/button/index.js';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/button/index.js';
export { useZui, ZuiProvider } from './components/provider/index.js';
export type { ZProviderProps, ZuiContext } from './components/provider/index.js';
export { Stack } from './components/stack/index.js';
export type {
	StackAlignment,
	StackDirection,
	StackGap,
	StackJustification,
	StackProps
} from './components/stack/index.js';
export { Text } from './components/text/index.js';
export type { TextElement, TextProps } from './components/text/index.js';
export { icss } from './icss/runtime.js';
export { createIcssRuntime } from './icss/runtime.js';
export type { IcssRuntime, IcssRuntimeOptions } from './icss/runtime.js';
export { createServerStyleRegistry, StyleRegistry } from './icss/registry.js';
export {
	createStyleProgram,
	defaultTheme,
	defineTheme,
	extendTheme,
	isDynamicSlot
} from './core.js';
export { defineRecipe } from './recipes/index.js';
export type { RecipeDefinition, RecipeSelection, RecipeVariants } from './recipes/index.js';
export type {
	ButtonDesignProps,
	DeepPartial,
	DeepReadonly,
	IcssClassName,
	IcssFactory,
	IcssStyle,
	StackDesignProps,
	Theme,
	ThemeSchema,
	ThemeTokenGroup,
	ThemeTokenValue,
	ZuiTheme
} from './core.js';
