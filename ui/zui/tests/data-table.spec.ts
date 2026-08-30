import { describe, expect, it } from 'vitest';

import { compareDataValues, stableSortRows } from '../src/runtime/collection/data-table.js';

describe('data table sorting', () => {
	it('compares numeric, date and natural string values', () => {
		expect(compareDataValues(2, 10)).toBeLessThan(0);
		expect(compareDataValues(new Date('2026-01-01'), new Date('2025-01-01'))).toBeGreaterThan(0);
		expect(compareDataValues('row 2', 'row 10')).toBeLessThan(0);
	});

	it('keeps equal values stable in both directions', () => {
		const rows = [
			{ id: 'a', value: 2 },
			{ id: 'b', value: 1 },
			{ id: 'c', value: 2 }
		];
		expect(
			stableSortRows(rows, { accessor: (row) => row.value, direction: 'ascending' }).map(
				({ id }) => id
			)
		).toEqual(['b', 'a', 'c']);
		expect(
			stableSortRows(rows, { accessor: (row) => row.value, direction: 'descending' }).map(
				({ id }) => id
			)
		).toEqual(['a', 'c', 'b']);
	});
});
