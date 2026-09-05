import type {
	RecipeDefinition,
	RecipeInput,
	RecipeSelectionFrom,
	RecipeVariantDefinitions,
	RuntimeRecipeDefinition
} from './types.js';

interface RecipeState {
	readonly dispose: Set<() => void>;
}

interface RecipeHotModule {
	readonly hot?: {
		dispose(callback: () => void): void;
	};
}

const RECIPE_STATE = Symbol('zui-recipe-state');
let recipeSequence = 0;

type InternalRecipe = RuntimeRecipeDefinition & { readonly [RECIPE_STATE]: RecipeState };

function optionKey(value: unknown): string {
	return typeof value === 'boolean' ? String(value) : String(value);
}

function assertSelection(
	name: string,
	variants: RecipeVariantDefinitions,
	selection: Readonly<Record<string, unknown>> | undefined
): void {
	if (selection === undefined) return;
	for (const [variantName, value] of Object.entries(selection)) {
		const options = variants[variantName];
		if (options === undefined)
			throw new TypeError(`Unknown recipe variant "${variantName}" in ${name}.`);
		if (!Object.hasOwn(options, optionKey(value))) {
			throw new TypeError(
				`Unknown recipe value "${String(value)}" for variant "${variantName}" in ${name}.`
			);
		}
	}
}

function cloneVariants<TVariants extends RecipeVariantDefinitions>(variants: TVariants): TVariants {
	const copy: Record<string, Readonly<Record<string, unknown>>> = Object.create(null);
	for (const [variantName, options] of Object.entries(variants)) {
		if (typeof options !== 'object' || options === null || Array.isArray(options)) {
			throw new TypeError(`Recipe variant "${variantName}" must be an options object.`);
		}
		const optionCopy = { ...options };
		if (Object.keys(optionCopy).length === 0) {
			throw new TypeError(`Recipe variant "${variantName}" must define at least one value.`);
		}
		for (const [option, style] of Object.entries(optionCopy)) {
			if (typeof style !== 'function') {
				throw new TypeError(`Recipe variant "${variantName}.${option}" must be a style factory.`);
			}
		}
		copy[variantName] = Object.freeze(optionCopy);
	}
	return Object.freeze(copy) as TVariants;
}

export function defineRecipe<const TVariants extends RecipeVariantDefinitions>(
	input: RecipeInput<TVariants>,
	meta?: ImportMeta
): RecipeDefinition<TVariants> {
	if (typeof input !== 'object' || input === null || Array.isArray(input)) {
		throw new TypeError('Recipe definition must be an object.');
	}
	if (input.base !== undefined && typeof input.base !== 'function') {
		throw new TypeError('Recipe base must be a style factory.');
	}
	if (input.layer !== undefined && input.layer !== 'components' && input.layer !== 'utilities') {
		throw new TypeError('Recipe layer must be components or utilities.');
	}

	const variants = cloneVariants(input.variants);
	const defaults = input.defaultVariants === undefined ? undefined : { ...input.defaultVariants };
	assertSelection('defaultVariants', variants, defaults);
	const compounds = (input.compoundVariants ?? []).map((compound, index) => {
		if (typeof compound.style !== 'function') {
			throw new TypeError(`Recipe compoundVariants[${index}].style must be a style factory.`);
		}
		const when = { ...compound.when };
		assertSelection(`compoundVariants[${index}].when`, variants, when);
		return Object.freeze({ style: compound.style, when: Object.freeze(when) });
	});
	const branchCount =
		(input.base === undefined ? 0 : 1) +
		Object.values(variants).reduce((total, options) => total + Object.keys(options).length, 0) +
		compounds.length;
	if (branchCount > 64) {
		throw new RangeError(`Recipe defines ${branchCount} branches; the maximum is 64.`);
	}

	const variantMap = Object.fromEntries(
		Object.entries(variants).map(([name, options]) => [name, Object.freeze(Object.keys(options))])
	) as RecipeDefinition<TVariants>['variantMap'];
	const state: RecipeState = { dispose: new Set() };
	recipeSequence += 1;
	const recipe = Object.freeze({
		[RECIPE_STATE]: state,
		base: input.base,
		compoundVariants: Object.freeze(compounds),
		defaultVariants: defaults === undefined ? undefined : Object.freeze(defaults),
		id: `r${recipeSequence.toString(36)}`,
		layer: input.layer ?? 'components',
		variantMap: Object.freeze(variantMap),
		variants
	}) as RecipeDefinition<TVariants>;
	if (meta !== undefined) registerRecipeHmr(meta, recipe);
	return recipe;
}

export function getRecipeState(recipe: RuntimeRecipeDefinition): RecipeState {
	const state = (recipe as InternalRecipe)[RECIPE_STATE];
	if (state === undefined) throw new TypeError('Expected a recipe created by defineRecipe().');
	return state;
}

export function disposeRecipe(recipe: RuntimeRecipeDefinition): void {
	const state = getRecipeState(recipe);
	for (const dispose of [...state.dispose]) dispose();
	state.dispose.clear();
}

export function registerRecipeHmr(meta: ImportMeta, recipe: RuntimeRecipeDefinition): void {
	(meta as RecipeHotModule).hot?.dispose(() => disposeRecipe(recipe));
}

export type { RecipeSelectionFrom };
