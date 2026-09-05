import type { IcssClassName, IcssFactory } from '../icss/types.js';
import type { IcssLayer } from '../icss/registry.js';
import type { ZuiTheme } from '../theme/types.js';

export type RecipeVariantOptions = Readonly<Record<string, IcssFactory<ZuiTheme>>>;

export type RecipeVariantDefinitions = Readonly<Record<string, RecipeVariantOptions>>;

export type RecipeVariantValue<TOptions> = keyof TOptions extends 'false' | 'true'
	? boolean
	: keyof TOptions;

export type RecipeSelectionFrom<TVariants extends RecipeVariantDefinitions> = {
	readonly [TName in keyof TVariants]?: RecipeVariantValue<TVariants[TName]>;
};

export interface RecipeCompoundVariant {
	readonly style: IcssFactory<ZuiTheme>;
	readonly when: Readonly<Record<string, string | boolean>>;
}

export interface RecipeInput<TVariants extends RecipeVariantDefinitions> {
	/** Component styles by default; utilities explicitly customize an existing component. */
	readonly layer?: IcssLayer;
	readonly base?: IcssFactory<ZuiTheme>;
	readonly compoundVariants?: readonly RecipeCompoundVariant[];
	readonly defaultVariants?: Readonly<Record<string, string | boolean>>;
	readonly variants: TVariants;
}

export interface RecipeDefinition<
	TVariants extends RecipeVariantDefinitions = RecipeVariantDefinitions
> extends RecipeInput<TVariants> {
	/** @internal Stable only for this recipe instance and its HMR disposal lifecycle. */
	readonly id: string;
	readonly variantMap: {
		readonly [TName in keyof TVariants]: readonly (keyof TVariants[TName] & string)[];
	};
}

/** @internal Type-erased recipe shape used by runtime caches. */
export type RuntimeRecipeDefinition = RecipeDefinition<RecipeVariantDefinitions>;

export type RecipeSelection<TRecipe> =
	TRecipe extends RecipeDefinition<infer TVariants> ? RecipeSelectionFrom<TVariants> : never;

export type RecipeVariants<TRecipe> = RecipeSelection<TRecipe>;

export type RecipeClassName = IcssClassName;
