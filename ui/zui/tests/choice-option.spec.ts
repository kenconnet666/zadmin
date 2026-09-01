import { describe, expect, it } from 'vitest';

import { assertContiguousOptionGroups } from '../src/components/compound/choice-option.js';

describe('choice option groups', () => {
	it('accepts contiguous groups and rejects ambiguous visual ordering', () => {
		expect(() =>
			assertContiguousOptionGroups(
				[
					{ group: 'A', label: 'A1', value: 'a1' },
					{ group: 'A', label: 'A2', value: 'a2' },
					{ group: 'B', label: 'B1', value: 'b1' }
				],
				'Fixture'
			)
		).not.toThrow();
		expect(() =>
			assertContiguousOptionGroups(
				[
					{ group: 'A', label: 'A1', value: 'a1' },
					{ group: 'B', label: 'B1', value: 'b1' },
					{ group: 'A', label: 'A2', value: 'a2' }
				],
				'Fixture'
			)
		).toThrow(/must be contiguous/u);
		expect(() =>
			assertContiguousOptionGroups([{ group: ' ', label: 'Blank', value: 'blank' }], 'Fixture')
		).toThrow(/non-empty/u);
	});
});
