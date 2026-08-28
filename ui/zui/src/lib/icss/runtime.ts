import type { ThemeSchema } from '../theme/types.js';
import type { ZuiTheme } from '../theme/types.js';
import { createRecipeExecutor } from '../recipes/runtime.js';
import type {
	RecipeDefinition,
	RecipeSelectionFrom,
	RecipeVariantDefinitions
} from '../recipes/types.js';
import { createStyleProgram } from './builder.js';
import type { IcssClassName, IcssFactory } from './types.js';

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
	recipe<const TVariants extends RecipeVariantDefinitions>(
		theme: ZuiTheme,
		recipe: RecipeDefinition<TVariants>,
		variants?: RecipeSelectionFrom<NoInfer<TVariants>>
	): IcssClassName;
}

export interface IcssRuntimeOptions extends StyleRegistryOptions {
	readonly registry?: StyleRegistry;
}

export function createIcssRuntime(options: IcssRuntimeOptions = {}): IcssRuntime {
	const registry = options.registry ?? new StyleRegistry(options);
	const recipes = createRecipeExecutor(registry);
	return {
		registry,
		ownedIcss(owner, theme, factory) {
			return registry.ensure(createStyleProgram(theme, factory), owner).className;
		},
		icss(theme, factory) {
			return registry.ensure(createStyleProgram(theme, factory)).className;
		},
		recipe(theme, recipe, variants) {
			return recipes.recipe(theme, recipe, variants);
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

export function getDefaultIcssRuntime(): IcssRuntime {
	if (typeof document === 'undefined') return serverRuntimeResolver?.() ?? defaultServerRuntime;
	defaultBrowserRuntime ??= createBrowserIcssRuntime();
	return defaultBrowserRuntime;
}

export function icss<TTheme extends ThemeSchema>(
	theme: TTheme,
	factory: IcssFactory<TTheme>
): IcssClassName {
	return getDefaultIcssRuntime().icss(theme, factory);
}

/** @internal Compiler-owned class registration for HMR cleanup. */
export function ownedIcss<TTheme extends ThemeSchema>(
	owner: string,
	theme: TTheme,
	factory: IcssFactory<TTheme>
): IcssClassName {
	return getDefaultIcssRuntime().ownedIcss(owner, theme, factory);
}

/** @internal Removes browser rules no longer owned after a module replacement. */
export function disposeIcssModule(owner: string): void {
	getDefaultIcssRuntime().registry.releaseOwnerPrefix(`${owner}:`);
}
