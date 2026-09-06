import { describe, expect, it } from 'vitest';
import { createStyleProgram } from '../src/icss/builder.js';
import { canonicalizeStyleProgram } from '../src/icss/serialize.js';
import { applyResponsiveStyles } from '../src/runtime/foundation/responsive.js';
import { defaultTheme } from '../src/theme/default.js';
import { extendTheme } from '../src/theme/define.js';

describe('responsive CSS contract', () => {
	it('keeps semantic cascade order independent of input object order and preserves theme units', () => {
		const theme = extendTheme(defaultTheme, {
			breakpoint: { small: '20em', medium: '40rem', large: '64rem' }
		});
		const style = (value: { base: number; small: number; large: number }) =>
			canonicalizeStyleProgram(
				createStyleProgram(theme, (s) =>
					applyResponsiveStyles(s, value, (s, selected) => s.gap.px(selected))
				)
			);
		const first = style({ large: 24, base: 2, small: 8 });
		expect(first).toBe(style({ small: 8, large: 24, base: 2 }));
		expect(first).toBe(
			'gap:2px;@media (min-width: 20em){gap:8px;}@media (min-width: 64rem){gap:24px;}'
		);
	});

	it('uses the same typed breakpoints for named container rules and serializes new CSS keywords', () => {
		const css = canonicalizeStyleProgram(
			createStyleProgram(defaultTheme, (s) => {
				s.containerType.inlineSize;
				s.containerName('cards');
				s.listStyleType.none;
				s._container({ name: 'cards', min: 'small', max: 'medium' }, (s) => s.gridColumn.auto);
			})
		);
		expect(css).toContain('container-type:inline-size;container-name:cards;list-style-type:none;');
		expect(css).toContain(
			'@container cards (min-inline-size: 30rem) and (max-inline-size: 48rem){grid-column:auto;}'
		);
	});

	it('rejects invalid responsive keys and ambiguous container declarations', () => {
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				applyResponsiveStyles<number>(s, { tiny: 3 } as never, (s, value) => s.gap.px(value))
			)
		).toThrow('Unknown responsive breakpoint');
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				s._container({ name: 'cards' } as never, () => undefined)
			)
		).toThrow('requires min and/or max');
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				s._container({ name: 'not', min: 'small' }, () => undefined)
			)
		).toThrow('Container name');
		expect(() =>
			createStyleProgram(defaultTheme, (s) =>
				s._container({ name: 'cards){body{color:red}}', min: 'small' }, () => undefined)
			)
		).toThrow('Container name');
	});
});
