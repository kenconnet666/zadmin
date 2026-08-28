import { describe, expect, expectTypeOf, it } from 'vitest';

import { createStyleProgram, defaultTheme, type IcssStyle } from '../src/lib/core.js';

describe('ICSS builder', () => {
	it('records ordered raw, keyword, token and unit declarations', () => {
		const program = createStyleProgram(defaultTheme, (style) => {
			style.display.flex;
			style.color._primary;
			style.padding.px(8, 16);
			style.opacity(0.8);
		});

		expect(program.block.instructions).toEqual([
			{
				important: false,
				kind: 'declaration',
				property: 'display',
				values: [{ value: 'flex' }]
			},
			{
				important: false,
				kind: 'declaration',
				property: 'color',
				values: [{ value: '#2563eb' }]
			},
			{
				important: false,
				kind: 'declaration',
				property: 'padding',
				values: [
					{ unit: 'px', value: 8 },
					{ unit: 'px', value: 16 }
				]
			},
			{
				important: false,
				kind: 'declaration',
				property: 'opacity',
				values: [{ value: 0.8 }]
			}
		]);
	});

	it('records nested selectors and at-rules without empty blocks', () => {
		const program = createStyleProgram(defaultTheme, (style) => {
			style._hover((hover) => hover.color._primaryHover);
			style._media('(min-width: 48rem)', (media) => media.padding._large);
			style._focus(() => undefined);
		});

		expect(program.block.instructions).toHaveLength(2);
		expect(program.block.instructions[0]).toMatchObject({
			kind: 'nested',
			query: '&:hover',
			type: 'selector'
		});
		expect(program.block.instructions[1]).toMatchObject({
			kind: 'nested',
			query: '@media (min-width: 48rem)',
			type: 'at-rule'
		});
	});

	it('validates selectors, values and theme tokens', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (style) => style._selector('.outside', () => undefined))
		).toThrow(/contain "&"/);
		expect(() => createStyleProgram(defaultTheme, (style) => style.width.px(Number.NaN))).toThrow(
			/finite/
		);
	});

	it('infers property, token, keyword and unit APIs', () => {
		type Style = IcssStyle<typeof defaultTheme>;

		expectTypeOf<Style['color']>().toBeCallableWith('#fff');
		expectTypeOf<Style['color']['_primary']>().toEqualTypeOf<void>();
		expectTypeOf<Style['display']['inlineFlex']>().toEqualTypeOf<void>();
		expectTypeOf<Style['padding']['px']>().toBeFunction();
	});
});
