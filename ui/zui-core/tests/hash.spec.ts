import { describe, expect, it } from 'vitest';

import { hashString } from '../src/index.ts';

describe('hashString', () => {
	it('is deterministic, compact, and input-sensitive', () => {
		const first = hashString('same');
		expect(first).toBe(hashString('same'));
		expect(first).not.toBe(hashString('different'));
		expect(first).toMatch(/^[a-z0-9]+$/);
	});

	it('handles empty and unicode inputs', () => {
		expect(hashString('')).toMatch(/^[a-z0-9]+$/);
		expect(hashString('宽度:320px')).not.toBe(hashString('width:320px'));
	});
});
