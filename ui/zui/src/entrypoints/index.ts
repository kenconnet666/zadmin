export const ZUI_PACKAGE_NAME = '@zadmin/zui';

export { default as ZBox } from '../components/gene/ZBox.svelte';
export type { ZBoxProps } from '../components/gene/ZBox.svelte';
export { default as ZButton } from '../components/gene/ZButton.svelte';
export type { ZButtonProps, ZButtonVariants } from '../components/gene/ZButton.svelte';
export { default as ZIcon, iconManifest } from '../components/gene/ZIcon.svelte';
export type { ZIconName, ZIconProps } from '../components/gene/ZIcon.svelte';
export { default as ZProvider } from '../components/gene/ZProvider.svelte';
export type { ZProviderProps } from '../components/gene/ZProvider.svelte';
export { default as ZText } from '../components/gene/ZText.svelte';
export type { ZTextElement, ZTextProps, ZTextTone } from '../components/gene/ZText.svelte';
export { default as ZField } from '../components/input/ZField.svelte';
export type { ZFieldProps, ZFieldSize } from '../components/input/ZField.svelte';
export { default as ZInput } from '../components/input/ZInput.svelte';
export type { ZInputProps, ZInputSize, ZInputType } from '../components/input/ZInput.svelte';
export { default as ZStack } from '../components/layout/ZStack.svelte';
export type {
	ZStackAlignment,
	ZStackDirection,
	ZStackJustification,
	ZStackProps
} from '../components/layout/ZStack.svelte';
export { useZui } from '../runtime/context.js';
export type { ZuiContext } from '../runtime/context.js';
export {
	createBrowserIcssRuntime,
	createIcssRuntime,
	createServerStyleRegistry,
	icss,
	StyleRegistry
} from './runtime.js';
export type {
	BrowserStyleSheetOptions,
	IcssRuntime,
	IcssRuntimeOptions,
	StyleRegistryMetrics
} from './runtime.js';
export { createStyleProgram, isDynamicSlot } from '../icss/builder.js';
export { defaultTheme } from '../theme/default.js';
export { defineTheme, extendTheme } from '../theme/define.js';
export { defineRecipe, defineSlotRecipe } from '../recipes/index.js';
export type {
	RecipeDefinition,
	RecipeSelection,
	RecipeVariants,
	SlotClassNames,
	SlotRecipeDefinition,
	SlotRecipeSelection
} from '../recipes/index.js';
export type { IcssClassName, IcssFactory, IcssStyle } from '../icss/types.js';
export type {
	DeepPartial,
	DeepReadonly,
	Theme,
	ThemeSchema,
	ThemeTokenGroup,
	ThemeTokenValue,
	ZuiTheme
} from '../theme/types.js';
