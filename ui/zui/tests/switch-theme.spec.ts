import { describe, expect, expectTypeOf, it } from 'vitest';

import { createStyleProgram } from '../src/icss/builder.js';
import { defaultTheme } from '../src/theme/default.js';
import { extendTheme } from '../src/theme/define.js';
import type { IcssStyle } from '../src/icss/types.js';

describe('ZSwitch theme travel tokens', () => {
	it('exposes and serializes purpose-named thumb travel through typed ICSS', () => {
		type Style = IcssStyle<typeof defaultTheme>;
		expectTypeOf<Style['transform']['_switchThumbTravelSmall']>().toEqualTypeOf<void>();

		const program = createStyleProgram(defaultTheme, (s) => {
			s.transform._switchThumbTravelSmall;
			s.transform._switchThumbTravelMedium;
			s.transform._switchThumbTravelLarge;
		});
		expect(program.block.instructions).toMatchObject([
			{ property: 'transform', values: [{ value: 'translateX(12px)' }] },
			{ property: 'transform', values: [{ value: 'translateX(16px)' }] },
			{ property: 'transform', values: [{ value: 'translateX(20px)' }] }
		]);
	});

	it('lets strict themes override travel together with switch dimensions', () => {
		const theme = extendTheme(defaultTheme, {
			transform: { switchThumbTravelMedium: 'translateX(15px)' }
		});
		const program = createStyleProgram(theme, (s) => s.transform._switchThumbTravelMedium);
		expect(program.block.instructions[0]).toMatchObject({
			property: 'transform',
			values: [{ value: 'translateX(15px)' }]
		});
	});
});
