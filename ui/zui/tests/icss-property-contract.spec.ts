import { describe, expect, it } from 'vitest';

import { createStyleProgram, defaultTheme } from '../src/entrypoints/index.js';

describe('ICSS property definitions', () => {
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
