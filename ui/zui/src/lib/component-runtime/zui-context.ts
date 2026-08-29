import { getContext, setContext } from 'svelte';

import { getDefaultIcssRuntime, type IcssRuntime } from '../icss/runtime.js';
import type { IcssClassName, IcssFactory } from '../icss/types.js';
import type {
	RecipeDefinition,
	RecipeSelectionFrom,
	RecipeVariantDefinitions
} from '../recipes/types.js';
import type {
	SlotRecipeDefinition,
	SlotRecipeSelectionFrom,
	SlotVariantDefinitions
} from '../recipes/slots.js';
import { defaultTheme } from '../theme/default.js';
import type { ZuiTheme } from '../theme/types.js';

export type { ZuiTheme } from '../theme/types.js';

export interface ZuiContext {
	readonly colorScheme: 'dark' | 'light';
	readonly direction: 'ltr' | 'rtl';
	readonly locale: string;
	readonly runtime: IcssRuntime;
	readonly theme: ZuiTheme;
	icss(factory: IcssFactory<ZuiTheme>): IcssClassName;
	recipe<const TVariants extends RecipeVariantDefinitions>(
		recipe: RecipeDefinition<TVariants>,
		variants?: RecipeSelectionFrom<NoInfer<TVariants>>
	): IcssClassName;
	slots<
		const TSlots extends readonly string[],
		const TVariants extends SlotVariantDefinitions<TSlots[number]>
	>(
		recipe: SlotRecipeDefinition<TSlots, TVariants>,
		variants?: SlotRecipeSelectionFrom<NoInfer<TVariants>>
	): { readonly [TSlot in TSlots[number]]: IcssClassName };
}

export interface ZuiContextSource {
	readonly colorScheme?: 'dark' | 'light';
	readonly direction?: 'ltr' | 'rtl';
	readonly locale?: string;
	readonly runtime?: IcssRuntime;
	readonly theme?: ZuiTheme;
}

const ZUI_CONTEXT = Symbol('zui-context');

function createZuiContext(read: () => Required<ZuiContextSource>): ZuiContext {
	const context: ZuiContext = {
		get colorScheme() {
			return read().colorScheme;
		},
		get direction() {
			return read().direction;
		},
		get locale() {
			return read().locale;
		},
		get runtime() {
			return read().runtime;
		},
		get theme() {
			return read().theme;
		},
		icss(factory) {
			return context.runtime.icss(context.theme, factory);
		},
		recipe(recipe, variants) {
			return context.runtime.recipe(context.theme, recipe, variants);
		},
		slots(recipe, variants) {
			return context.runtime.slots(context.theme, recipe, variants);
		}
	};
	return context;
}

const DEFAULT_CONTEXT = createZuiContext(() => ({
	colorScheme: 'light',
	direction: 'ltr',
	locale: 'en-US',
	runtime: getDefaultIcssRuntime(),
	theme: defaultTheme
}));

export function provideZui(read: () => ZuiContextSource): ZuiContext {
	const parent = getContext<ZuiContext | undefined>(ZUI_CONTEXT) ?? DEFAULT_CONTEXT;
	const context = createZuiContext(() => {
		const source = read();
		return {
			colorScheme: source.colorScheme ?? parent.colorScheme,
			direction: source.direction ?? parent.direction,
			locale: source.locale ?? parent.locale,
			runtime: source.runtime ?? parent.runtime,
			theme: source.theme ?? parent.theme
		};
	});
	setContext(ZUI_CONTEXT, context);
	return context;
}

export function useZui(): ZuiContext {
	return getContext<ZuiContext | undefined>(ZUI_CONTEXT) ?? DEFAULT_CONTEXT;
}

/** @deprecated Use provideZui(). */
export function provideZuiTheme(readTheme: () => ZuiTheme): ZuiContext {
	return provideZui(() => ({ theme: readTheme() }));
}

/** @deprecated Use useZui(). */
export const useZuiTheme = useZui;
