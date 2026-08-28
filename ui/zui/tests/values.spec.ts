import { describe, expect, it } from 'vitest';

import {
	createIcssSlot,
	isDynamicSlot,
	isIcssSlot,
	normalizeDeclarationValues
} from '../src/lib/core.js';

describe('ICSS dynamic values', () => {
	it('creates immutable target-neutral slots with optional debug names', () => {
		const slot = createIcssSlot('panel-width-0', 'width');
		expect(slot).toMatchObject({ debugName: 'width', id: 'panel-width-0' });
		expect(Object.isFrozen(slot)).toBe(true);
		expect(isIcssSlot(slot)).toBe(true);
		expect(isDynamicSlot(slot)).toBe(true);
	});

	it('validates slot ids and rejects unrelated values', () => {
		expect(() => createIcssSlot('')).toThrow(/cannot be empty/);
		expect(isIcssSlot(null)).toBe(false);
		expect(isIcssSlot('slot')).toBe(false);
		expect(isIcssSlot({ id: 'slot' })).toBe(false);
	});

	it('normalizes units, slots, strings and nullish values', () => {
		const slot = createIcssSlot('opacity-0');
		expect(normalizeDeclarationValues([null, undefined, 2, 'auto', slot], 'px')).toEqual([
			{ unit: 'px', value: 2 },
			{ unit: 'px', value: 'auto' },
			{ unit: 'px', value: slot }
		]);
		expect(normalizeDeclarationValues([1])).toEqual([{ value: 1 }]);
		expect(() => normalizeDeclarationValues([Number.POSITIVE_INFINITY])).toThrow(/finite/);
	});
});
