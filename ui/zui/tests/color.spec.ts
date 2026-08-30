import { describe, expect, it } from 'vitest';

import { formatHexColor, normalizeHexColor, parseHexColor } from '../src/runtime/color.js';

describe('hex color algorithms', () => {
	it('parses short and long RGB/RGBA forms', () => {
		expect(parseHexColor('#369')).toEqual({ alpha: 1, blue: 153, green: 102, red: 51 });
		expect(parseHexColor('#3698')).toEqual({
			alpha: 136 / 255,
			blue: 153,
			green: 102,
			red: 51
		});
		expect(parseHexColor('#33669980')).toEqual({
			alpha: 128 / 255,
			blue: 153,
			green: 102,
			red: 51
		});
		expect(parseHexColor('invalid')).toBeUndefined();
	});

	it('formats canonical lowercase values and controls alpha inclusion', () => {
		const color = { alpha: 0.5, blue: 255, green: 128, red: 0 };
		expect(formatHexColor(color)).toBe('#0080ff');
		expect(formatHexColor(color, true)).toBe('#0080ff80');
		expect(normalizeHexColor('#ABC', false)).toBe('#aabbcc');
		expect(normalizeHexColor('#ABC8', true)).toBe('#aabbcc88');
	});
});
