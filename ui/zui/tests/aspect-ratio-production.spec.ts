import { describe, expect, it } from 'vitest';

import { normalizeAspectRatio } from '../src/components/layout/ZAspectRatio.svelte';

describe('ZAspectRatio normalization', () => {
	it('normalizes positive finite number and pair values', () => {
		expect(normalizeAspectRatio(1.5)).toBe('1.5');
		expect(normalizeAspectRatio(' 16 / 9 ')).toBe('16 / 9');
	});

	it('rejects zero, negative, non-finite and malformed values', () => {
		expect(() => normalizeAspectRatio(0)).toThrow(/positive/u);
		expect(() => normalizeAspectRatio(Number.POSITIVE_INFINITY)).toThrow(/positive/u);
		expect(() => normalizeAspectRatio('0 / 9')).toThrow(/positive/u);
		expect(() =>
			normalizeAspectRatio(
				'999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999 / 1'
			)
		).toThrow(/positive/u);
	});
});
