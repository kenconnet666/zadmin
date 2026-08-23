import { describe, expect, it } from 'vitest';

import { defaultTheme, defineTheme } from '../src/lib/index.js';

describe('defineTheme', () => {
	it('copies and freezes token groups', () => {
		const source = { color: { primary: '#123456' }, space: { medium: 8 } };
		const theme = defineTheme(source);

		expect(theme).not.toBe(source);
		expect(theme.color).not.toBe(source.color);
		expect(Object.isFrozen(theme)).toBe(true);
		expect(Object.isFrozen(theme.color)).toBe(true);
		expect(theme.color.primary).toBe('#123456');
	});

	it('rejects non-finite numeric tokens', () => {
		expect(() => defineTheme({ opacity: { broken: Number.NaN } })).toThrow(/finite/);
	});

	it('provides a small semantic default theme', () => {
		expect(defaultTheme.color.primary).toBe('#2563eb');
		expect(defaultTheme.space.medium).toBe(8);
	});
});
