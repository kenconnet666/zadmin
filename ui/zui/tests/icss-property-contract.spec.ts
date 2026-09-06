import { describe, expect, it } from 'vitest';

import { createStyleProgram, defaultTheme, extendTheme } from '../src/entrypoints/index.js';
import { serializeStyleProgram } from '../src/icss/serialize.js';

describe('ICSS property definitions', () => {
	it('serializes theme-aware animation delays and typography wrapping without raw accessors', () => {
		const theme = extendTheme(defaultTheme, { duration: { fast: '0.15s', normal: 240 } });
		const program = createStyleProgram(theme, (s) => {
			s.animationDelay._fast;
			s.transitionDelay._normal;
			s.animationDuration._normal;
			s.animationTimingFunction._enter;
			s.animationFillMode.both;
			s.animationDirection.alternateReverse;
			s.animationIterationCount.infinite;
			s.animationPlayState.paused;
			s.textWrap.balance;
		});
		const { cssText } = serializeStyleProgram(program, 'motion');
		for (const declaration of [
			'animation-delay:0.15s',
			'transition-delay:240ms',
			'animation-duration:240ms',
			'animation-timing-function:cubic-bezier(0.16, 1, 0.3, 1)',
			'animation-fill-mode:both',
			'animation-direction:alternate-reverse',
			'animation-iteration-count:infinite',
			'animation-play-state:paused',
			'text-wrap:balance'
		])
			expect(cssText).toContain(declaration);
	});

	it('records logical border declarations used by navigation recipes', () => {
		const program = createStyleProgram(defaultTheme, (s) => {
			s.borderInlineStartColor._accent;
			s.borderInlineStartStyle.solid;
			s.borderInlineStartWidth._medium;
			s.borderBlockEndColor.transparent;
			s.borderBlockEndStyle.dashed;
			s.borderBlockEndWidth._hairline;
		});

		expect(
			program.block.instructions
				.filter((instruction) => instruction.kind === 'declaration')
				.map(({ property }) => property)
		).toEqual([
			'borderInlineStartColor',
			'borderInlineStartStyle',
			'borderInlineStartWidth',
			'borderBlockEndColor',
			'borderBlockEndStyle',
			'borderBlockEndWidth'
		]);
	});

	it('throws for unknown modeled accessors while preserving raw CSS escape hatch', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) => {
				(s.borderInlineStartColor as unknown as { missing: unknown }).missing;
			})
		).toThrow('Unknown ICSS accessor');

		const program = createStyleProgram(defaultTheme, (s) => {
			s.borderInlineStartColor.raw('color(display-p3 1 0 0)');
		});
		expect(program.block.instructions[0]).toMatchObject({ property: 'borderInlineStartColor' });
	});
});
