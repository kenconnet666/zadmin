import { describe, expect, expectTypeOf, it } from 'vitest';

import { createStyleProgram, defaultTheme, type IcssStyle } from '../src/entrypoints/index.js';

describe('ICSS builder', () => {
	it('records ordered raw, keyword, token and unit declarations', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.display.flex;
			s.borderLeftColor.transparent;
			s.color._primary;
			s.padding.px(8, 16);
			s.opacity(0.8);
			s.width.fitContent;
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
				property: 'borderLeftColor',
				values: [{ value: 'transparent' }]
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
			},
			{
				important: false,
				kind: 'declaration',
				property: 'width',
				values: [{ value: 'fit-content' }]
			}
		]);
	});

	it('records nested selectors and at-rules without empty blocks', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s._hover((hover) => hover.color._primaryHover);
			s._media('(min-width: 48rem)', (media) => media.padding._large);
			s._focus(() => undefined);
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

	it('serializes typed scroll anchoring and pointer gesture keywords', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.overflowAnchor.none;
			s.touchAction.manipulation;
		});
		expect(program.block.instructions).toEqual([
			{
				important: false,
				kind: 'declaration',
				property: 'overflowAnchor',
				values: [{ value: 'none' }]
			},
			{
				important: false,
				kind: 'declaration',
				property: 'touchAction',
				values: [{ value: 'manipulation' }]
			}
		]);
	});

	it('validates selectors, values and theme tokens', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) => s._selector('.outside', () => undefined))
		).toThrow(/contain "&"/);
		expect(() => createStyleProgram(defaultTheme, (s) => s.width.px(Number.NaN))).toThrow(/finite/);
	});

	it('infers property, token, keyword and unit APIs', () => {
		type Style = IcssStyle<typeof defaultTheme>;

		expectTypeOf<Style['color']>().toBeCallableWith('#fff');
		expectTypeOf<Style['color']['_primary']>().toEqualTypeOf<void>();
		expectTypeOf<Style['display']['inlineFlex']>().toEqualTypeOf<void>();
		expectTypeOf<Style['borderLeftColor']['transparent']>().toEqualTypeOf<void>();
		expectTypeOf<Style['aspectRatio']['auto']>().toEqualTypeOf<void>();
		expectTypeOf<Style['clipPath']['raw']>().toBeFunction();
		expectTypeOf<Style['marginInline']['auto']>().toEqualTypeOf<void>();
		expectTypeOf<Style['outlineColor']['_focus']>().toEqualTypeOf<void>();
		expectTypeOf<Style['outlineStyle']['solid']>().toEqualTypeOf<void>();
		expectTypeOf<Style['outlineWidth']['_medium']>().toEqualTypeOf<void>();
		expectTypeOf<Style['overflowAnchor']['none']>().toEqualTypeOf<void>();
		expectTypeOf<Style['insetBlockStart']['_small']>().toEqualTypeOf<void>();
		expectTypeOf<Style['insetInlineEnd']['percent']>().toBeFunction();
		expectTypeOf<Style['padding']['px']>().toBeFunction();
		expectTypeOf<Style['touchAction']['manipulation']>().toEqualTypeOf<void>();
		expectTypeOf<Style['width']['fitContent']>().toEqualTypeOf<void>();
		expectTypeOf<Style['outlineOffset']['_outer']>().toEqualTypeOf<void>();
		expectTypeOf<Style['transitionTimingFunction']['_enter']>().toEqualTypeOf<void>();
		expectTypeOf<Style['overflowWrap']['anywhere']>().toEqualTypeOf<void>();
		expectTypeOf<Style['overflowWrap']['breakWord']>().toEqualTypeOf<void>();
		expectTypeOf<Style['_media']>().toBeCallableWith({ min: 'medium' }, () => undefined);
	});

	it('records standard overflow wrapping keywords without raw CSS escape hatches', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.overflowWrap.normal;
			s.overflowWrap.breakWord;
			s.overflowWrap.anywhere;
		});
		expect(program.block.instructions).toMatchObject([
			{ property: 'overflowWrap', values: [{ value: 'normal' }] },
			{ property: 'overflowWrap', values: [{ value: 'break-word' }] },
			{ property: 'overflowWrap', values: [{ value: 'anywhere' }] }
		]);
	});

	it('records a tokenized focus outline without shorthand raw values', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s._focusVisible((focus) => {
				focus.outlineWidth._medium;
				focus.outlineStyle.solid;
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.insetBlockStart._small;
				focus.insetInlineEnd.percent(0);
			});
		});

		expect(program.block.instructions[0]).toMatchObject({
			kind: 'nested',
			query: '&:focus-visible'
		});
		expect(JSON.stringify(program)).not.toContain('currentColor');
	});

	it('records modern layout and visually-hidden primitives through typed properties', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.accentColor._primary;
			s.aspectRatio.raw('16 / 9');
			s.blockSize._medium;
			s.borderInlineEndStyle.solid;
			s.borderInlineEndWidth._hairline;
			s.clip.raw('rect(0 0 0 0)');
			s.clipPath.raw('inset(50%)');
			s.inlineSize._small;
			s.marginInline.auto;
		});

		expect(program.block.instructions).toMatchObject([
			{ property: 'accentColor', values: [{ value: '#2563eb' }] },
			{ property: 'aspectRatio', values: [{ value: '16 / 9' }] },
			{ property: 'blockSize', values: [{ unit: 'px', value: 18 }] },
			{ property: 'borderInlineEndStyle', values: [{ value: 'solid' }] },
			{ property: 'borderInlineEndWidth', values: [{ unit: 'px', value: 1 }] },
			{ property: 'clip', values: [{ value: 'rect(0 0 0 0)' }] },
			{ property: 'clipPath', values: [{ value: 'inset(50%)' }] },
			{ property: 'inlineSize', values: [{ unit: 'px', value: 16 }] },
			{ property: 'marginInline', values: [{ value: 'auto' }] }
		]);
	});
});
