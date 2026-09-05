import { describe, expect, it } from 'vitest';

import { createStyleProgram } from '../src/icss/builder.js';
import { createIcssSlot } from '../src/icss/values.js';
import { defaultTheme } from '../src/theme/default.js';
import { getUnitSuffix } from '../src/theme/units.js';

describe('ICSS builder edge behavior', () => {
	it('records raw, global keywords, low-level properties and all nested primitives', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.width.raw('min(100%, 40rem)');
			s.opacity.inherit;
			s.set('--local-value' as never, '10' as never);
			s._active((nested) => nested.opacity(1));
			s._before((nested) => nested.content('"before"'));
			s._after((nested) => nested.content('"after"'));
			s._disabled((nested) => nested.pointerEvents.none);
			s._focusVisible((nested) => nested.outline('none'));
			s._supports('(display: grid)', (nested) => nested.display.grid);
			s._container('(min-width: 20rem)', (nested) => nested.display.block);
			s._selector('& > span', (nested) => nested.color._primary);
		});

		expect(program.block.instructions).toHaveLength(11);
		expect(program.block.instructions.at(-1)).toMatchObject({
			query: '& > span',
			type: 'selector'
		});
	});

	it('omits nullish declarations and empty nested blocks', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.width(undefined);
			s.height(null);
			s._hover(() => undefined);
		});

		expect(program.block.instructions).toEqual([]);
	});

	it('validates value arity, low-level properties, selectors and at-rule queries', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) => (s.padding.px as (...values: number[]) => void)())
		).toThrow(/between one and four/);
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				(s.padding.px as (...values: number[]) => void)(1, 2, 3, 4, 5)
			)
		).toThrow(/between one and four/);
		expect(() =>
			createStyleProgram(defaultTheme, (s) => s.set('bad property' as never, 'x' as never))
		).toThrow(/Invalid CSS property/);
		expect(() => createStyleProgram(defaultTheme, (s) => s._media('', () => undefined))).toThrow(
			/cannot be empty/
		);
		expect(() =>
			createStyleProgram(defaultTheme, (s) => s._supports('{bad}', () => undefined))
		).toThrow(/cannot contain CSS blocks/);
	});

	it('resolves typed breakpoint media queries and rejects invalid boundaries', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s._media({ min: 'medium', max: 'large' }, (media) => media.display.grid);
		});
		expect(program.block.instructions[0]).toMatchObject({
			query: '@media (min-width: 48rem) and (max-width: 64rem)',
			type: 'at-rule'
		});
		expect(() =>
			createStyleProgram(defaultTheme, (s) => s._media({} as never, () => undefined))
		).toThrow(/requires min and\/or max/);
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				s._media({ min: 'missing' as never }, () => undefined)
			)
		).toThrow(/Unknown breakpoint/);
		expect(() =>
			createStyleProgram({ breakpoint: { small: '1px){body{display:none}}' } }, (s) =>
				s._media({ min: 'small' }, () => undefined)
			)
		).toThrow(/cannot contain CSS blocks/);
		expect(() =>
			createStyleProgram({ color: { primary: 'red' } }, (s) =>
				s._media({ min: 'small' } as never, () => undefined)
			)
		).toThrow(/no breakpoint group/);
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				s._media({ min: 'toString' } as never, () => undefined)
			)
		).toThrow(/Unknown breakpoint/);
		const pixel = createStyleProgram({ breakpoint: { small: 480 } }, (s) =>
			s._media({ min: 'small' }, (m) => m.display.block)
		);
		expect(pixel.block.instructions[0]).toMatchObject({ query: '@media (min-width: 480px)' });
	});

	it('distinguishes modern system colors from theme colors', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.color.canvasText;
			s.backgroundColor.canvas;
			s.color._text;
			s.backgroundColor._canvas;
			s.stroke.currentColor;
		});
		expect(program.block.instructions).toMatchObject([
			{ property: 'color', values: [{ value: 'CanvasText' }] },
			{ property: 'backgroundColor', values: [{ value: 'Canvas' }] },
			{ property: 'color', values: [{ value: defaultTheme.color.text }] },
			{ property: 'backgroundColor', values: [{ value: defaultTheme.color.canvas }] },
			{ property: 'stroke', values: [{ value: 'currentColor' }] }
		]);
	});

	it('records focus offsets and theme easing tokens alongside system keywords', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.outlineOffset._outer;
			s.transitionTimingFunction._enter;
			s.animationTimingFunction._exit;
			s.transitionTimingFunction.ease;
		});
		expect(program.block.instructions).toMatchObject([
			{ property: 'outlineOffset', values: [{ unit: 'px', value: 2 }] },
			{
				property: 'transitionTimingFunction',
				values: [{ value: 'cubic-bezier(0.16, 1, 0.3, 1)' }]
			},
			{ property: 'animationTimingFunction', values: [{ value: 'cubic-bezier(0.7, 0, 0.84, 0)' }] },
			{ property: 'transitionTimingFunction', values: [{ value: 'ease' }] }
		]);
	});

	it('rejects missing runtime tokens and accepts compiler slots', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) => {
				(s.color as unknown as Record<string, void>)._missing;
			})
		).toThrow(/Unknown theme token/);

		const slot = createIcssSlot('--width-test-0');
		expect(slot.id).toBe('--width-test-0');
		const program = createStyleProgram(defaultTheme, (s) => {
			(s.width.px as (...values: unknown[]) => void)(slot);
		});
		expect(program.block.instructions[0]).toMatchObject({
			values: [{ unit: 'px', value: slot }]
		});
		expect(getUnitSuffix('unknown' as never)).toBeUndefined();
	});

	it('rejects unknown carrier members without breaking thenable probes', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) => {
				(s.color as unknown as Record<string, unknown>).unknown;
			})
		).toThrow(/Unknown ICSS accessor "color.unknown"/u);
		createStyleProgram(defaultTheme, (s) => {
			expect((s.color as unknown as Record<string, unknown>).then).toBeUndefined();
		});
	});
});
