import { describe, expect, it } from 'vitest';

import { assertChoiceContentContract } from '../src/components/compound/choice-virtualization.js';

describe('choice virtualization contract', () => {
	it.each(['ZSelect', 'ZCombobox', 'ZMultiSelect'] as const)(
		'rejects compound, grouped and dual-source virtual %s content',
		(component) => {
			expect(() =>
				assertChoiceContentContract(component, {
					dataMode: false,
					grouped: false,
					hasChildren: true,
					virtual: true
				})
			).toThrow(/requires authoritative/u);
			expect(() =>
				assertChoiceContentContract(component, {
					dataMode: true,
					grouped: true,
					hasChildren: false,
					virtual: true
				})
			).toThrow(/does not support grouped options/u);
			expect(() =>
				assertChoiceContentContract(component, {
					dataMode: true,
					grouped: false,
					hasChildren: true,
					virtual: false
				})
			).toThrow(/mutually exclusive/u);
			expect(() =>
				assertChoiceContentContract(component, {
					dataMode: true,
					grouped: false,
					hasChildren: false,
					virtual: true
				})
			).not.toThrow();
		}
	);
});
