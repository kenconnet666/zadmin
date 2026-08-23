import type { ThemeSchema } from '../theme/types.js';
import { createStyleProgram } from './builder.js';
import { StyleRegistry, type StyleRegistryOptions } from './registry.js';
import { BrowserStyleSheet, type BrowserStyleSheetOptions } from './sheet.js';
import type { IcssClassName, IcssFactory } from './types.js';

export interface IcssRuntime {
	readonly registry: StyleRegistry;
	icss<TTheme extends ThemeSchema>(theme: TTheme, factory: IcssFactory<TTheme>): IcssClassName;
}

export interface IcssRuntimeOptions extends StyleRegistryOptions {
	readonly registry?: StyleRegistry;
}

export function createIcssRuntime(options: IcssRuntimeOptions = {}): IcssRuntime {
	const registry = options.registry ?? new StyleRegistry(options);
	return {
		registry,
		icss(theme, factory) {
			return registry.ensure(createStyleProgram(theme, factory)).className;
		}
	};
}

export function createBrowserIcssRuntime(options: BrowserStyleSheetOptions = {}): IcssRuntime {
	return createIcssRuntime({
		registry: new StyleRegistry({ sheet: new BrowserStyleSheet(options) })
	});
}

let defaultBrowserRuntime: IcssRuntime | undefined;
const defaultServerRuntime = createIcssRuntime();

function getDefaultRuntime(): IcssRuntime {
	if (typeof document === 'undefined') return defaultServerRuntime;
	defaultBrowserRuntime ??= createBrowserIcssRuntime();
	return defaultBrowserRuntime;
}

export function icss<TTheme extends ThemeSchema>(
	theme: TTheme,
	factory: IcssFactory<TTheme>
): IcssClassName {
	return getDefaultRuntime().icss(theme, factory);
}
