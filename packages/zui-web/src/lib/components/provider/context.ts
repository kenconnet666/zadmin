import { getContext, setContext } from 'svelte';
import { defaultTheme, type ThemeSchema } from '@zadmin/zui-core';

type DefaultGroup<TGroup> = { readonly [TKey in keyof TGroup]: string | number };

export type ZuiTheme = ThemeSchema & {
	readonly color: { readonly [TKey in keyof typeof defaultTheme.color]: string };
	readonly fontSize: DefaultGroup<typeof defaultTheme.fontSize>;
	readonly fontWeight: DefaultGroup<typeof defaultTheme.fontWeight>;
	readonly space: DefaultGroup<typeof defaultTheme.space>;
};

export interface ZuiThemeContext {
	readonly theme: ZuiTheme;
}

const THEME_CONTEXT = Symbol('zui-theme');
const DEFAULT_CONTEXT: ZuiThemeContext = { theme: defaultTheme };

export function provideZuiTheme(readTheme: () => ZuiTheme): ZuiThemeContext {
	const context: ZuiThemeContext = {
		get theme() {
			return readTheme();
		}
	};
	setContext(THEME_CONTEXT, context);
	return context;
}

export function useZuiTheme(): ZuiThemeContext {
	return getContext<ZuiThemeContext | undefined>(THEME_CONTEXT) ?? DEFAULT_CONTEXT;
}
