import { expect, it } from 'vitest';
import { cssLengthExpression } from '../src/theme/units.js';
import { createStyleProgram } from '../src/icss/builder.js';
import { canonicalizeStyleProgram } from '../src/icss/serialize.js';
import { defaultTheme } from '../src/theme/default.js';

it('preserves logical viewport and container units through typed ICSS and sizing expressions', () => {
	const css = canonicalizeStyleProgram(
		createStyleProgram(defaultTheme, (s) => {
			s.inlineSize.svi(80);
			s.minBlockSize.dvb(20);
			s.maxInlineSize.cqmax(90);
			s.gap.cqmin(2);
			s.gridAutoFlow.rowDense;
			s.gridAutoColumns.rem(12);
			s.gridTemplateColumns.subgrid;
		})
	);
	expect(css).toBe(
		'inline-size:80svi;min-block-size:20dvb;max-inline-size:90cqmax;gap:2cqmin;grid-auto-flow:row dense;grid-auto-columns:12rem;grid-template-columns:subgrid;'
	);
	expect(cssLengthExpression('10dvi')).toBe('10dvi');
	expect(cssLengthExpression('calc(2cqmin + var(--gutter, 8px))')).toBe(
		'calc(2cqmin + var(--gutter, 8px))'
	);
	expect(() => cssLengthExpression('var(--gutter); color:red')).toThrow('CSS sizing expression');
	expect(() => cssLengthExpression('switchInset')).toThrow('CSS sizing expression');
});
