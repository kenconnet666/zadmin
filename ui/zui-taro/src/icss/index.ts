import {
	createStyleProgram,
	defaultTheme,
	type IcssFactory,
	type ThemeSchema
} from '@zadmin/zui/core';

import { compileTaroIcss, type CompiledTaroIcss } from '../compiler/index.ts';

export function icss<TTheme extends ThemeSchema>(
	theme: TTheme,
	factory: IcssFactory<TTheme>
): CompiledTaroIcss {
	return compileTaroIcss(createStyleProgram(theme, factory));
}

export function defaultIcss(factory: IcssFactory<typeof defaultTheme>): CompiledTaroIcss {
	return icss(defaultTheme, factory);
}
