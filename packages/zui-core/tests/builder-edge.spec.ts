import { describe, expect, it } from 'vitest';

import { createIcssSlot, createStyleProgram, defaultTheme, getUnitSuffix } from '../src/index.ts';

describe('ICSS builder edge behavior', () => {
	it('records raw, global keywords, low-level properties and all nested primitives', () => {
		const program = createStyleProgram(defaultTheme, (style) => {
			style.width.raw('min(100%, 40rem)');
			style.opacity.inherit;
			style.set('--local-value' as never, '10' as never);
			style._active((nested) => nested.opacity(1));
			style._before((nested) => nested.content('"before"'));
			style._after((nested) => nested.content('"after"'));
			style._disabled((nested) => nested.pointerEvents.none);
			style._focusVisible((nested) => nested.outline('none'));
			style._supports('(display: grid)', (nested) => nested.display.grid);
			style._container('(min-width: 20rem)', (nested) => nested.display.block);
			style._selector('& > span', (nested) => nested.color._primary);
		});

		expect(program.block.instructions).toHaveLength(11);
		expect(program.block.instructions.at(-1)).toMatchObject({
			query: '& > span',
			type: 'selector'
		});
	});

	it('omits nullish declarations and empty nested blocks', () => {
		const program = createStyleProgram(defaultTheme, (style) => {
			style.width(undefined);
			style.height(null);
			style._hover(() => undefined);
		});

		expect(program.block.instructions).toEqual([]);
	});

	it('validates value arity, low-level properties, selectors and at-rule queries', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (style) =>
				(style.padding.px as (...values: number[]) => void)()
			)
		).toThrow(/between one and four/);
		expect(() =>
			createStyleProgram(defaultTheme, (style) =>
				(style.padding.px as (...values: number[]) => void)(1, 2, 3, 4, 5)
			)
		).toThrow(/between one and four/);
		expect(() =>
			createStyleProgram(defaultTheme, (style) => style.set('bad property' as never, 'x' as never))
		).toThrow(/Invalid CSS property/);
		expect(() =>
			createStyleProgram(defaultTheme, (style) => style._media('', () => undefined))
		).toThrow(/cannot be empty/);
		expect(() =>
			createStyleProgram(defaultTheme, (style) => style._supports('{bad}', () => undefined))
		).toThrow(/cannot contain CSS blocks/);
	});

	it('rejects missing runtime tokens and accepts compiler slots', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (style) => {
				(style.color as unknown as Record<string, void>)._missing;
			})
		).toThrow(/Unknown theme token/);

		const slot = createIcssSlot('--width-test-0');
		expect(slot.id).toBe('--width-test-0');
		const program = createStyleProgram(defaultTheme, (style) => {
			(style.width.px as (...values: unknown[]) => void)(slot);
		});
		expect(program.block.instructions[0]).toMatchObject({
			values: [{ unit: 'px', value: slot }]
		});
		expect(getUnitSuffix('unknown' as never)).toBeUndefined();
	});

	it('returns undefined for unknown carrier members', () => {
		createStyleProgram(defaultTheme, (style) => {
			expect((style.color as unknown as Record<string, unknown>).unknown).toBeUndefined();
		});
	});
});
