import { getContext, setContext } from 'svelte';

import { defaultMiniappTheme } from './default.ts';
import type { MiniappTheme } from './types.ts';

const MINIAPP_THEME = Symbol.for('@zadmin/miniapp/theme');

export interface MiniappThemeContext {
	readonly theme: MiniappTheme;
}

const DEFAULT_CONTEXT: MiniappThemeContext = { theme: defaultMiniappTheme };

export function provideMiniappTheme(read: () => MiniappTheme): MiniappThemeContext {
	const context: MiniappThemeContext = {
		get theme() {
			return read();
		}
	};
	setContext(MINIAPP_THEME, context);
	return context;
}

export function useMiniappTheme(): MiniappThemeContext {
	return getContext<MiniappThemeContext | undefined>(MINIAPP_THEME) ?? DEFAULT_CONTEXT;
}
