import { createStyleProgram } from '../icss/builder.js';
import type { IcssLayer, StyleRegistry } from '../icss/registry.js';
import type { IcssClassName, IcssFactory } from '../icss/types.js';
import type { ZuiTheme } from '../theme/types.js';
import type { RecipeVariantValue } from './types.js';

type SlotStyles<TSlot extends string> = Readonly<Partial<Record<TSlot, IcssFactory<ZuiTheme>>>>;

type SlotVariantOptions<TSlot extends string> = Readonly<Record<string, SlotStyles<TSlot>>>;

export type SlotVariantDefinitions<TSlot extends string> = Readonly<
	Record<string, SlotVariantOptions<TSlot>>
>;

export type SlotRecipeSelectionFrom<TVariants extends object> = {
	readonly [TName in keyof TVariants]?: RecipeVariantValue<TVariants[TName]>;
};

export interface SlotRecipeInput<
	TSlots extends readonly string[],
	TVariants extends SlotVariantDefinitions<TSlots[number]>
> {
	/** Component styles by default; utilities explicitly customize an existing component. */
	readonly layer?: IcssLayer;
	readonly base?: SlotStyles<TSlots[number]>;
	readonly defaultVariants?: Readonly<Record<string, string | boolean>>;
	readonly slots: TSlots;
	readonly variants: TVariants;
}

export interface SlotRecipeDefinition<
	TSlots extends readonly string[] = readonly string[],
	TVariants extends SlotVariantDefinitions<TSlots[number]> = SlotVariantDefinitions<TSlots[number]>
> extends SlotRecipeInput<TSlots, TVariants> {
	/** @internal Stable only for this recipe instance and its HMR disposal lifecycle. */
	readonly id: string;
	readonly variantMap: {
		readonly [TName in keyof TVariants]: readonly (keyof TVariants[TName] & string)[];
	};
}

export type SlotRecipeSelection<TRecipe> =
	TRecipe extends SlotRecipeDefinition<infer TSlots, infer TVariants>
		? TSlots extends readonly string[]
			? SlotRecipeSelectionFrom<TVariants>
			: never
		: never;

export type SlotClassNames<TRecipe extends SlotRecipeDefinition> = {
	readonly [TSlot in TRecipe['slots'][number]]: IcssClassName;
};

interface SlotRecipeState {
	readonly dispose: Set<() => void>;
}

interface InternalSlotRecipe extends SlotRecipeDefinition {
	readonly [SLOT_RECIPE_STATE]: SlotRecipeState;
}

interface SlotRecipeHotModule {
	readonly hot?: { dispose(callback: () => void): void };
}

interface CompiledSlotRecipe {
	readonly base: ReadonlyMap<string, string>;
	readonly variants: ReadonlyMap<string, ReadonlyMap<string, ReadonlyMap<string, string>>>;
}

export interface SlotRecipeExecutor {
	slots<
		const TSlots extends readonly string[],
		const TVariants extends SlotVariantDefinitions<TSlots[number]>
	>(
		theme: ZuiTheme,
		recipe: SlotRecipeDefinition<TSlots, TVariants>,
		selection?: SlotRecipeSelectionFrom<NoInfer<TVariants>>
	): { readonly [TSlot in TSlots[number]]: IcssClassName };
}

const SLOT_RECIPE_STATE = Symbol('zui-slot-recipe-state');
let slotRecipeSequence = 0;

function selectionKey(value: unknown): string {
	return String(value);
}

function assertSelection(
	variants: Readonly<Record<string, Readonly<Record<string, unknown>>>>,
	selection: Readonly<Record<string, unknown>> | undefined,
	location: string
): void {
	if (selection === undefined) return;
	for (const [variantName, value] of Object.entries(selection)) {
		const options = variants[variantName];
		if (options === undefined) throw new TypeError(`Unknown slot recipe variant "${variantName}".`);
		if (!Object.hasOwn(options, selectionKey(value))) {
			throw new TypeError(
				`Unknown slot recipe value "${String(value)}" for "${variantName}" in ${location}.`
			);
		}
	}
}

function assertSlotStyles(
	slots: ReadonlySet<string>,
	styles: Readonly<Record<string, unknown>>,
	location: string
): number {
	let count = 0;
	for (const [slot, factory] of Object.entries(styles)) {
		if (!slots.has(slot)) throw new TypeError(`Unknown slot "${slot}" in ${location}.`);
		if (typeof factory !== 'function') {
			throw new TypeError(`Slot "${slot}" in ${location} must be a style factory.`);
		}
		count += 1;
	}
	return count;
}

export function defineSlotRecipe<
	const TSlots extends readonly string[],
	const TVariants extends SlotVariantDefinitions<TSlots[number]>
>(
	input: SlotRecipeInput<TSlots, TVariants>,
	meta?: ImportMeta
): SlotRecipeDefinition<TSlots, TVariants> {
	if (input.layer !== undefined && input.layer !== 'components' && input.layer !== 'utilities') {
		throw new TypeError('Slot recipe layer must be components or utilities.');
	}
	if (!Array.isArray(input.slots) || input.slots.length === 0) {
		throw new TypeError('Slot recipe must define at least one slot.');
	}
	const slots = Object.freeze([...input.slots]) as unknown as TSlots;
	const slotSet = new Set(slots);
	if (slotSet.size !== slots.length) throw new TypeError('Slot recipe names must be unique.');

	let branchCount = assertSlotStyles(slotSet, input.base ?? {}, 'base');
	const variants: Record<
		string,
		Readonly<Record<string, SlotStyles<TSlots[number]>>>
	> = Object.create(null);
	for (const [variantName, options] of Object.entries(input.variants)) {
		const optionCopy: Record<string, SlotStyles<TSlots[number]>> = Object.create(null);
		for (const [value, styles] of Object.entries(options)) {
			branchCount += assertSlotStyles(slotSet, styles, `${variantName}.${value}`);
			optionCopy[value] = Object.freeze({ ...styles });
		}
		variants[variantName] = Object.freeze(optionCopy);
	}
	if (branchCount > 64) {
		throw new RangeError(`Slot recipe defines ${branchCount} branches; the maximum is 64.`);
	}
	assertSelection(variants, input.defaultVariants, 'defaultVariants');

	const variantMap = Object.fromEntries(
		Object.entries(variants).map(([name, options]) => [name, Object.freeze(Object.keys(options))])
	) as SlotRecipeDefinition<TSlots, TVariants>['variantMap'];
	const state: SlotRecipeState = { dispose: new Set() };
	slotRecipeSequence += 1;
	const recipe = Object.freeze({
		[SLOT_RECIPE_STATE]: state,
		base: Object.freeze({ ...(input.base ?? {}) }),
		defaultVariants:
			input.defaultVariants === undefined ? undefined : Object.freeze({ ...input.defaultVariants }),
		id: `sr${slotRecipeSequence.toString(36)}`,
		layer: input.layer ?? 'components',
		slots,
		variantMap: Object.freeze(variantMap),
		variants: Object.freeze(variants) as TVariants
	}) as SlotRecipeDefinition<TSlots, TVariants>;
	if (meta !== undefined) registerSlotRecipeHmr(meta, recipe);
	return recipe;
}

function getSlotRecipeState(recipe: SlotRecipeDefinition): SlotRecipeState {
	const state = (recipe as InternalSlotRecipe)[SLOT_RECIPE_STATE];
	if (state === undefined) throw new TypeError('Expected a recipe created by defineSlotRecipe().');
	return state;
}

export function disposeSlotRecipe(recipe: SlotRecipeDefinition): void {
	const state = getSlotRecipeState(recipe);
	for (const dispose of [...state.dispose]) dispose();
	state.dispose.clear();
}

export function registerSlotRecipeHmr(meta: ImportMeta, recipe: SlotRecipeDefinition): void {
	(meta as SlotRecipeHotModule).hot?.dispose(() => disposeSlotRecipe(recipe));
}

export function createSlotRecipeExecutor(registry: StyleRegistry): SlotRecipeExecutor {
	const cache = new WeakMap<SlotRecipeDefinition, WeakMap<ZuiTheme, CompiledSlotRecipe>>();
	const disposers = new WeakMap<SlotRecipeDefinition, () => void>();

	function compile(recipe: SlotRecipeDefinition, theme: ZuiTheme): CompiledSlotRecipe {
		const owner = `slot-recipe:${recipe.id}`;
		const compileSlots = (
			branch: string,
			styles: Readonly<Partial<Record<string, IcssFactory<ZuiTheme>>>>,
			specificity: number
		): ReadonlyMap<string, string> =>
			new Map(
				Object.entries(styles).flatMap(([slot, factory]) =>
					typeof factory === 'function'
						? [
								[
									slot,
									registry.ensure(
										createStyleProgram(theme, factory),
										`${owner}:${branch}:${slot}`,
										recipe.layer ?? 'components',
										specificity
									).className
								] as const
							]
						: []
				)
			);
		// Slot branches use the same deterministic specificity ladder as ordinary recipes;
		// shared canonical classes may have been registered by an unrelated recipe first.
		const base = compileSlots('base', recipe.base ?? {}, 1);
		const variants = new Map<string, ReadonlyMap<string, ReadonlyMap<string, string>>>();
		for (const [variantIndex, [variantName, options]] of Object.entries(
			recipe.variants
		).entries()) {
			variants.set(
				variantName,
				new Map(
					Object.entries(options).map(([value, styles]) => [
						value,
						compileSlots(`variant:${variantName}:${value}`, styles, variantIndex + 2)
					])
				)
			);
		}
		const compiled = { base, variants };
		if (!disposers.has(recipe)) {
			const state = getSlotRecipeState(recipe);
			const dispose = (): void => {
				cache.delete(recipe);
				registry.releaseOwnerPrefix(`${owner}:`);
				state.dispose.delete(dispose);
				disposers.delete(recipe);
			};
			state.dispose.add(dispose);
			disposers.set(recipe, dispose);
		}
		return compiled;
	}

	return {
		slots(theme, recipe, selected = {}) {
			let themed = cache.get(recipe);
			if (themed === undefined) {
				themed = new WeakMap();
				cache.set(recipe, themed);
			}
			let compiled = themed.get(theme);
			if (compiled === undefined) {
				compiled = compile(recipe, theme);
				themed.set(theme, compiled);
			}
			const provided = Object.fromEntries(
				Object.entries(selected as Readonly<Record<string, unknown>>).filter(
					([, value]) => value !== undefined
				)
			);
			const selection = {
				...(recipe.defaultVariants ?? {}),
				...provided
			};
			const classes = Object.fromEntries(
				recipe.slots.map((slot) => [slot, [compiled.base.get(slot) ?? '']])
			) as Record<string, string[]>;
			for (const [variantName, value] of Object.entries(selection)) {
				const options = compiled.variants.get(variantName);
				if (options === undefined)
					throw new TypeError(`Unknown slot recipe variant "${variantName}".`);
				const slotClasses = options.get(selectionKey(value));
				if (slotClasses === undefined) {
					throw new TypeError(`Unknown slot recipe value "${String(value)}" for "${variantName}".`);
				}
				for (const [slot, className] of slotClasses) classes[slot]?.push(className);
			}
			return Object.fromEntries(
				Object.entries(classes).map(([slot, values]) => [
					slot,
					values.filter(Boolean).join(' ') as IcssClassName
				])
			) as { readonly [TSlot in (typeof recipe.slots)[number]]: IcssClassName };
		}
	};
}
