import { describe, expect, it } from 'vitest';

import { createIcssRuntime, createServerStyleRegistry } from '../src/lib/index.js';
import { defineRecipe, disposeRecipe, registerRecipeHmr } from '../src/lib/recipes/define.js';
import {
	defineSlotRecipe,
	disposeSlotRecipe,
	registerSlotRecipeHmr
} from '../src/lib/recipes/slots.js';
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
		expect(registry.metrics).toMatchObject({ classes: 5, recipes: 1 });
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

	it('validates malformed recipe definitions at their exact boundary', () => {
		expect(() => defineRecipe(null as never)).toThrow(/must be an object/);
		expect(() => defineRecipe({ base: 'bad', variants: {} } as never)).toThrow(
			/base must be a style factory/
		);
		expect(() => defineRecipe({ variants: { tone: null } } as never)).toThrow(/options object/);
		expect(() => defineRecipe({ variants: { tone: {} } })).toThrow(/at least one value/);
		expect(() => defineRecipe({ variants: { tone: { bad: 1 } } } as never)).toThrow(
			/style factory/
		);
		expect(() =>
			defineRecipe({
				defaultVariants: { missing: 'x' },
				variants: { tone: { primary: () => undefined } }
			})
		).toThrow(/Unknown recipe variant/);
		expect(() =>
			defineRecipe({
				defaultVariants: { tone: 'missing' },
				variants: { tone: { primary: () => undefined } }
			})
		).toThrow(/Unknown recipe value/);
		expect(() =>
			defineRecipe({
				compoundVariants: [{ style: 1, when: {} }],
				variants: { tone: { primary: () => undefined } }
			} as never)
		).toThrow(/compoundVariants\[0\]\.style/);
		expect(() => disposeRecipe({} as never)).toThrow(/Expected a recipe/);
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
		expect(registry.metrics.recipes).toBe(0);

		disposeRecipe(recipe);
		expect(registry.size).toBe(1);
	});
});

describe('defineSlotRecipe', () => {
	it('returns stable classes for every declared real-element slot', () => {
		const recipe = defineSlotRecipe({
			slots: ['root', 'label', 'control'] as const,
			base: {
				control: () => undefined,
				label: (s) => s.fontWeight._medium,
				root: (s) => s.display.grid
			},
			variants: {
				invalid: {
					false: {},
					true: { control: (s) => s.borderColor._danger }
				},
				size: {
					medium: { root: (s) => s.gap._small },
					small: { root: (s) => s.gap._xsmall }
				}
			},
			defaultVariants: { invalid: false, size: 'medium' }
		});
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const defaults = runtime.slots(defaultTheme, recipe);
		const invalid = runtime.slots(defaultTheme, recipe, { invalid: true, size: 'small' });

		expect(Object.keys(defaults)).toEqual(['root', 'label', 'control']);
		expect(defaults.root.split(' ')).toHaveLength(2);
		expect(defaults.control).toBe('');
		expect(invalid.control).not.toBe('');
		expect(runtime.slots(defaultTheme, recipe)).toEqual(defaults);
		expect(registry.size).toBe(5);
		expect(registry.metrics.recipes).toBe(1);
		expect(() => runtime.slots(defaultTheme, recipe, { size: 'large' } as never)).toThrow(
			/Unknown slot recipe value/
		);

		let hotDispose: (() => void) | undefined;
		registerSlotRecipeHmr(
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
		expect(registry.size).toBe(0);
		expect(registry.metrics.recipes).toBe(0);
		disposeSlotRecipe(recipe);
	});

	it('rejects invalid slot topology and branch definitions', () => {
		expect(() => defineSlotRecipe({ slots: [], variants: {} })).toThrow(/at least one slot/);
		expect(() => defineSlotRecipe({ slots: ['root', 'root'], variants: {} })).toThrow(/unique/);
		expect(() =>
			defineSlotRecipe({
				base: { missing: () => undefined },
				slots: ['root'] as const,
				variants: {}
			} as never)
		).toThrow(/Unknown slot/);
		expect(() =>
			defineSlotRecipe({
				base: { root: 1 },
				slots: ['root'] as const,
				variants: {}
			} as never)
		).toThrow(/style factory/);
		expect(() =>
			defineSlotRecipe({
				defaultVariants: { missing: 'x' },
				slots: ['root'] as const,
				variants: {}
			})
		).toThrow(/Unknown slot recipe variant/);
		expect(() => disposeSlotRecipe({} as never)).toThrow(/Expected a recipe/);
	});
});
