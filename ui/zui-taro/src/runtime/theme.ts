import { getContext, setContext } from 'svelte';
import { defaultTheme, type DefaultTheme, type ThemeSchema } from '@zadmin/zui/core';

const ZUI_TARO_THEME = Symbol.for('@zadmin/zui-taro/theme');

export interface ZuiTaroThemeContext<TTheme extends ThemeSchema = DefaultTheme> {
	readonly theme: TTheme;
}

export function provideZuiTaroTheme<TTheme extends ThemeSchema>(getTheme: () => TTheme): void {
	setContext(ZUI_TARO_THEME, {
		get theme() {
			return getTheme();
		}
	});
}

export function useZuiTaroTheme(): ZuiTaroThemeContext {
	return getContext<ZuiTaroThemeContext>(ZUI_TARO_THEME) ?? { theme: defaultTheme };
}
