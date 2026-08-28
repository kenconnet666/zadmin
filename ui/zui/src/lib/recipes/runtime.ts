import { createStyleProgram } from '../icss/builder.js';
import type { IcssClassName } from '../icss/types.js';
import type { StyleRegistry } from '../icss/registry.js';
import type { ZuiTheme } from '../theme/types.js';
import { getRecipeState } from './define.js';
import type {
	RecipeDefinition,
	RecipeSelectionFrom,
	RecipeVariantDefinitions,
	RuntimeRecipeDefinition
} from './types.js';

interface CompiledRecipe {
	readonly base: string;
	readonly compounds: readonly string[];
	readonly variants: ReadonlyMap<string, ReadonlyMap<string, string>>;
}

export interface RecipeExecutor {
	recipe<const TVariants extends RecipeVariantDefinitions>(
		theme: ZuiTheme,
		recipe: RecipeDefinition<TVariants>,
		selection?: RecipeSelectionFrom<NoInfer<TVariants>>
	): IcssClassName;
}

function selectionKey(value: unknown): string {
	return typeof value === 'boolean' ? String(value) : String(value);
}

function matches(
	when: Readonly<Record<string, unknown>>,
	selection: Readonly<Record<string, unknown>>
): boolean {
	return Object.entries(when).every(
		([name, value]) => selectionKey(selection[name]) === selectionKey(value)
	);
}

export function createRecipeExecutor(registry: StyleRegistry): RecipeExecutor {
	const cache = new WeakMap<RuntimeRecipeDefinition, WeakMap<ZuiTheme, CompiledRecipe>>();
	const disposers = new WeakMap<RuntimeRecipeDefinition, () => void>();

	function compile(recipe: RuntimeRecipeDefinition, theme: ZuiTheme): CompiledRecipe {
		const owner = `recipe:${recipe.id}`;
		const ensure = (branch: string, factory: RuntimeRecipeDefinition['base']): string =>
			factory === undefined
				? ''
				: registry.ensure(createStyleProgram(theme, factory), `${owner}:${branch}`).className;
		const variants = new Map<string, ReadonlyMap<string, string>>();
		for (const [variantName, options] of Object.entries(recipe.variants)) {
			variants.set(
				variantName,
				new Map(
					Object.entries(options).map(([value, factory]) => [
						value,
						ensure(`variant:${variantName}:${value}`, factory)
					])
				)
			);
		}
		const compiled = {
			base: ensure('base', recipe.base),
			compounds: (recipe.compoundVariants ?? []).map((compound, index) =>
				ensure(`compound:${index}`, compound.style)
			),
			variants
		};

		if (!disposers.has(recipe)) {
			const state = getRecipeState(recipe);
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
		recipe(theme, recipe, selected = {}) {
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

			const selection = {
				...(recipe.defaultVariants as Readonly<Record<string, unknown>> | undefined),
				...(selected as Readonly<Record<string, unknown>>)
			};
			const classes = [compiled.base];
			for (const [variantName, value] of Object.entries(selection)) {
				const options = compiled.variants.get(variantName);
				if (options === undefined) throw new TypeError(`Unknown recipe variant "${variantName}".`);
				const className = options.get(selectionKey(value));
				if (className === undefined) {
					throw new TypeError(`Unknown recipe value "${String(value)}" for "${variantName}".`);
				}
				classes.push(className);
			}
			for (const [index, compound] of (recipe.compoundVariants ?? []).entries()) {
				if (matches(compound.when, selection)) classes.push(compiled.compounds[index] ?? '');
			}
			return classes.filter(Boolean).join(' ') as IcssClassName;
		}
	};
}
