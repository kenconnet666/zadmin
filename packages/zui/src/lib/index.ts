export const ZUI_PACKAGE_NAME = '@zadmin/zui';

export { icss } from './icss/runtime.js';
export { createIcssRuntime } from './icss/runtime.js';
export { createServerStyleRegistry, StyleRegistry } from './icss/registry.js';
export type { IcssClassName, IcssFactory, IcssStyle } from './icss/types.js';
export { defaultTheme } from './theme/default.js';
export { defineTheme } from './theme/define.js';
export type {
	DeepReadonly,
	Theme,
	ThemeSchema,
	ThemeTokenGroup,
	ThemeTokenValue
} from './theme/types.js';
