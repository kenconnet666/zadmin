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

export type ZuiColorScheme = 'dark' | 'light';
export type ZuiContrast = 'auto' | 'high' | 'normal';
export type ZuiDensity = 'compact' | 'comfortable' | 'spacious';
export type ZuiDirection = 'ltr' | 'rtl';
export type ZuiMotion = 'auto' | 'full' | 'reduced';
export type ZuiPortalContainer = Document | HTMLElement | ShadowRoot | null;
export type ZuiTranslations = Readonly<Record<string, string>>;

export interface ZuiContext {
	readonly colorScheme: ZuiColorScheme;
	readonly contrast: ZuiContrast;
	readonly density: ZuiDensity;
	readonly direction: ZuiDirection;
	readonly idPrefix: string;
	readonly locale: string;
	readonly motion: ZuiMotion;
	readonly portalContainer: ZuiPortalContainer;
	readonly runtime: IcssRuntime;
	readonly theme: ZuiTheme;
	readonly translations: ZuiTranslations;
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
	readonly colorScheme?: ZuiColorScheme;
	readonly contrast?: ZuiContrast;
	readonly density?: ZuiDensity;
	readonly direction?: ZuiDirection;
	readonly idPrefix?: string;
	readonly locale?: string;
	readonly motion?: ZuiMotion;
	readonly portalContainer?: ZuiPortalContainer;
	readonly runtime?: IcssRuntime;
	readonly theme?: ZuiTheme;
	readonly translations?: ZuiTranslations;
}

const ZUI_CONTEXT = Symbol('zui-context');
const EMPTY_TRANSLATIONS: ZuiTranslations = Object.freeze({});

function createZuiContext(read: () => Required<ZuiContextSource>): ZuiContext {
	const context: ZuiContext = {
		get colorScheme() {
			return read().colorScheme;
		},
		get contrast() {
			return read().contrast;
		},
		get density() {
			return read().density;
		},
		get direction() {
			return read().direction;
		},
		get idPrefix() {
			return read().idPrefix;
		},
		get locale() {
			return read().locale;
		},
		get motion() {
			return read().motion;
		},
		get portalContainer() {
			return read().portalContainer;
		},
		get runtime() {
			return read().runtime;
		},
		get theme() {
			return read().theme;
		},
		get translations() {
			return read().translations;
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
	contrast: 'normal',
	density: 'comfortable',
	direction: 'ltr',
	idPrefix: 'zui',
	locale: 'en-US',
	motion: 'auto',
	portalContainer: null,
	runtime: getDefaultIcssRuntime(),
	theme: defaultTheme,
	translations: EMPTY_TRANSLATIONS
}));

export function provideZui(read: () => ZuiContextSource): ZuiContext {
	const parent = getContext<ZuiContext | undefined>(ZUI_CONTEXT) ?? DEFAULT_CONTEXT;
	const context = createZuiContext(() => {
		const source = read();
		return {
			colorScheme: source.colorScheme ?? parent.colorScheme,
			contrast: source.contrast ?? parent.contrast,
			density: source.density ?? parent.density,
			direction: source.direction ?? parent.direction,
			idPrefix: source.idPrefix ?? parent.idPrefix,
			locale: source.locale ?? parent.locale,
			motion: source.motion ?? parent.motion,
			portalContainer:
				source.portalContainer === undefined ? parent.portalContainer : source.portalContainer,
			runtime: source.runtime ?? parent.runtime,
			theme: source.theme ?? parent.theme,
			translations: source.translations ?? parent.translations
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
