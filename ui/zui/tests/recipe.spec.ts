import { describe, expect, it } from 'vitest';

import { createIcssRuntime, createServerStyleRegistry } from '../src/lib/index.js';
import { defineRecipe, disposeRecipe, registerRecipeHmr } from '../src/lib/recipes/define.js';
import { defaultTheme } from '../src/lib/theme/default.js';
import { extendTheme } from '../src/lib/theme/define.js';

function createFixtureRecipe() {
	return defineRecipe({
		base: (s) => s.display.inlineFlex,
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => s.opacity._disabled
			},
			tone: {
				primary: (s) => s.color._primary,
				secondary: (s) => s.color._text
			}
		},
		compoundVariants: [
			{
				style: (s) => s.backgroundColor._surface,
				when: { disabled: true, tone: 'secondary' }
			}
		],
		defaultVariants: { disabled: false, tone: 'primary' }
	});
}

describe('defineRecipe', () => {
	it('exposes a readonly variant map and composes stable branch classes', () => {
		const recipe = createFixtureRecipe();
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const first = runtime.recipe(defaultTheme, recipe);
		const second = runtime.recipe(defaultTheme, recipe, { disabled: true, tone: 'secondary' });

		expect(recipe.variantMap).toEqual({
			disabled: ['false', 'true'],
			tone: ['primary', 'secondary']
		});
		expect(Object.isFrozen(recipe.variantMap)).toBe(true);
		expect(first.split(' ')).toHaveLength(2);
		expect(second.split(' ')).toHaveLength(4);
		expect(runtime.recipe(defaultTheme, recipe)).toBe(first);
		expect(registry.size).toBe(5);
	});

	it('caches each recipe branch once per theme', () => {
		const recipe = createFixtureRecipe();
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const alternate = extendTheme(defaultTheme, { color: { primary: '#6d28d9' } });

		runtime.recipe(defaultTheme, recipe);
		expect(registry.size).toBe(5);
		runtime.recipe(alternate, recipe);
		// Only the branch that reads the changed token gets a new canonical class.
		expect(registry.size).toBe(6);
		runtime.recipe(alternate, recipe, { disabled: true, tone: 'secondary' });
		expect(registry.size).toBe(6);
	});

	it('rejects invalid selections and excessive definitions', () => {
		const recipe = createFixtureRecipe();
		const runtime = createIcssRuntime();

		expect(() => runtime.recipe(defaultTheme, recipe, { tone: 'missing' } as never)).toThrow(
			/Unknown recipe value/
		);
		expect(() =>
			defineRecipe({
				variants: {
					value: Object.fromEntries(
						Array.from({ length: 65 }, (_, index) => [String(index), () => undefined])
					)
				}
			})
		).toThrow(/maximum is 64/);
	});

	it('releases only recipe-owned rules during HMR disposal', () => {
		const recipe = createFixtureRecipe();
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		runtime.icss(defaultTheme, (s) => s.display.inlineFlex);
		runtime.recipe(defaultTheme, recipe, { disabled: true, tone: 'secondary' });
		expect(registry.size).toBe(5);

		let hotDispose: (() => void) | undefined;
		registerRecipeHmr(
			{
				hot: {
					dispose: (callback: () => void) => {
						hotDispose = callback;
					}
				}
			} as unknown as ImportMeta,
			recipe
		);
		hotDispose?.();
		expect(registry.size).toBe(1);

		disposeRecipe(recipe);
		expect(registry.size).toBe(1);
	});
});
