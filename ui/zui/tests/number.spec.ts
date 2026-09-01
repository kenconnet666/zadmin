import { describe, expect, it, vi } from 'vitest';

import {
	clampNumber,
	isNumberOutOfRange,
	parseLocalizedNumber,
	roundNumber,
	stepNumber
} from '../src/runtime/number.js';

describe('localized number algorithms', () => {
	it('parses locale digits, decimal marks, grouping and partial input', () => {
		expect(parseLocalizedNumber('1.234,5', 'de-DE')).toMatchObject({ valid: true, value: 1234.5 });
		expect(parseLocalizedNumber('1 234,5', 'fr-FR')).toMatchObject({ valid: true, value: 1234.5 });
		expect(parseLocalizedNumber('١٬٢٣٤٫٥', 'ar-EG')).toMatchObject({ valid: true, value: 1234.5 });
		expect(parseLocalizedNumber('-', 'en-US')).toEqual({ partial: true, valid: false });
		expect(parseLocalizedNumber('', 'en-US')).toEqual({ partial: true, valid: true });
		expect(parseLocalizedNumber('12x', 'en-US')).toEqual({ partial: false, valid: false });
		expect(parseLocalizedNumber('+12.5', 'en-US')).toMatchObject({ valid: true, value: 12.5 });
		expect(parseLocalizedNumber('-.5', 'en-US')).toMatchObject({ valid: true, value: -0.5 });
		expect(parseLocalizedNumber('+', 'en-US')).toEqual({ partial: true, valid: false });
		expect(parseLocalizedNumber('.', 'en-US')).toEqual({ partial: true, valid: false });
		expect(parseLocalizedNumber('9'.repeat(400), 'en-US')).toEqual({
			partial: false,
			valid: false
		});
	});

	it('steps decimals without floating point drift and respects bounds', () => {
		expect(stepNumber(0.2, 1, 0.1)).toBe(0.3);
		expect(stepNumber(2.75, 1, 0.25, 0, 3)).toBe(3);
		expect(stepNumber(3, -1, 0.25, 0, 3, 10)).toBe(0.5);
		expect(clampNumber(-1, 0, 10)).toBe(0);
		expect(clampNumber(11, 0, 10)).toBe(10);
		expect(clampNumber(5)).toBe(5);
		expect(clampNumber(-1, 0)).toBe(0);
		expect(clampNumber(11, undefined, 10)).toBe(10);
		expect(stepNumber(1e-7, 1, 1e-7)).toBe(2e-7);
		expect(stepNumber(1e21, -1, 1e20)).toBe(900000000000000000000);
		expect(stepNumber(-1.25, 1, 1)).toBe(-0.25);
		expect(stepNumber(-1e-7, -1, 1e-7)).toBe(-2e-7);
		expect(stepNumber(0.33, 1, 0.1, undefined, undefined, 1, 1)).toBe(0.4);
		expect(roundNumber(1.005, 2)).toBe(1.01);
		expect(roundNumber(-1.005, 2)).toBe(-1.01);
		expect(roundNumber(1.2345, 3)).toBe(1.235);
		expect(isNumberOutOfRange(undefined, 0, 10)).toBe(false);
		expect(isNumberOutOfRange(-1, 0, 10)).toBe(true);
		expect(isNumberOutOfRange(11, 0, 10)).toBe(true);
		expect(isNumberOutOfRange(5, 0, 10)).toBe(false);
	});

	it('falls back to ASCII separators when Intl omits optional symbol parts', () => {
		const formatter = {
			format: (value: number) => String(value),
			formatToParts: () => [{ type: 'integer', value: '12345' }]
		} as unknown as Intl.NumberFormat;
		const replacement = function NumberFormat(): Intl.NumberFormat {
			return formatter;
		} as unknown as typeof Intl.NumberFormat;
		const spy = vi.spyOn(Intl, 'NumberFormat').mockImplementation(replacement);

		expect(parseLocalizedNumber('1234.5', 'en-US')).toEqual({
			partial: false,
			valid: true,
			value: 1234.5
		});
		spy.mockRestore();
	});

	it('normalizes custom Intl grouping, decimal, plus and minus symbols', () => {
		const formatter = {
			format: (value: number) => String(value),
			formatToParts: (value: number) =>
				value < 0
					? [
							{ type: 'minusSign', value: '~' },
							{ type: 'integer', value: '12' },
							{ type: 'group', value: '_' },
							{ type: 'integer', value: '345' },
							{ type: 'decimal', value: ':' },
							{ type: 'fraction', value: '6' }
						]
					: [{ type: 'plusSign', value: '!' }]
		} as unknown as Intl.NumberFormat;
		const replacement = function NumberFormat(): Intl.NumberFormat {
			return formatter;
		} as unknown as typeof Intl.NumberFormat;
		const spy = vi.spyOn(Intl, 'NumberFormat').mockImplementation(replacement);

		expect(parseLocalizedNumber('!1_234:5', 'custom')).toEqual({
			partial: false,
			valid: true,
			value: 1234.5
		});
		expect(parseLocalizedNumber('~1_234:5', 'custom')).toEqual({
			partial: false,
			valid: true,
			value: -1234.5
		});
		expect(stepNumber(Number.NaN, 1, 1)).toBeNaN();
		spy.mockRestore();
	});
});
