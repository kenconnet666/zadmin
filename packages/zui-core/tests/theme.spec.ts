import { describe, expect, it } from 'vitest';

import { defaultTheme, defineTheme } from '../src/index.ts';

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

	it('rejects invalid groups and token values', () => {
		expect(() => defineTheme({ color: null } as never)).toThrow(/must be an object/);
		expect(() => defineTheme({ color: { broken: true } } as never)).toThrow(
			/must be a string or number/
		);
	});

	it('provides a small semantic default theme', () => {
		expect(defaultTheme.color.primary).toBe('#2563eb');
		expect(defaultTheme.space.medium).toBe(8);
	});

	it('treats prototype-shaped names as ordinary data', () => {
		const schema = Object.fromEntries([
			['__proto__', Object.fromEntries([['constructor', 'safe']])]
		]) as never;
		const theme = defineTheme(schema) as Record<string, Record<string, string>>;

		expect(Object.getPrototypeOf(theme)).toBeNull();
		expect(Object.getPrototypeOf(theme.__proto__)).toBeNull();
		expect(theme.__proto__.constructor).toBe('safe');
	});
});
