import {
	createStyleProgram,
	type IcssClassName,
	type IcssFactory,
	type ThemeSchema
} from '@zadmin/zui-core';

import { StyleRegistry, type StyleRegistryOptions } from './registry.js';
import { BrowserStyleSheet, type BrowserStyleSheetOptions } from './sheet.js';

export interface IcssRuntime {
	readonly registry: StyleRegistry;
	ownedIcss<TTheme extends ThemeSchema>(
		owner: string,
		theme: TTheme,
		factory: IcssFactory<TTheme>
	): IcssClassName;
	icss<TTheme extends ThemeSchema>(theme: TTheme, factory: IcssFactory<TTheme>): IcssClassName;
}

export interface IcssRuntimeOptions extends StyleRegistryOptions {
	readonly registry?: StyleRegistry;
}

export function createIcssRuntime(options: IcssRuntimeOptions = {}): IcssRuntime {
	const registry = options.registry ?? new StyleRegistry(options);
	return {
		registry,
		ownedIcss(owner, theme, factory) {
			return registry.ensure(createStyleProgram(theme, factory), owner).className;
		},
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
let serverRuntimeResolver: (() => IcssRuntime | undefined) | undefined;

/** @internal Server integrations install request-local runtime resolution here. */
export function setServerRuntimeResolver(resolver: () => IcssRuntime | undefined): void {
	serverRuntimeResolver = resolver;
}

function getDefaultRuntime(): IcssRuntime {
	if (typeof document === 'undefined') return serverRuntimeResolver?.() ?? defaultServerRuntime;
	defaultBrowserRuntime ??= createBrowserIcssRuntime();
	return defaultBrowserRuntime;
}

export function icss<TTheme extends ThemeSchema>(
	theme: TTheme,
	factory: IcssFactory<TTheme>
): IcssClassName {
	return getDefaultRuntime().icss(theme, factory);
}

/** @internal Compiler-owned class registration for HMR cleanup. */
export function ownedIcss<TTheme extends ThemeSchema>(
	owner: string,
	theme: TTheme,
	factory: IcssFactory<TTheme>
): IcssClassName {
	return getDefaultRuntime().ownedIcss(owner, theme, factory);
}

/** @internal Removes browser rules no longer owned after a module replacement. */
export function disposeIcssModule(owner: string): void {
	getDefaultRuntime().registry.releaseOwnerPrefix(`${owner}:`);
}
