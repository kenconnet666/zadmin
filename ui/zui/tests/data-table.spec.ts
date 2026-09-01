import { describe, expect, it } from 'vitest';

import {
	compareDataValues,
	nextDataSortDescriptor,
	stableSortRows
} from '../src/runtime/collection/data-table.js';

describe('data table sorting', () => {
	it('cycles another column through ascending, descending and a real clear state', () => {
		expect(nextDataSortDescriptor(undefined, 'name')).toEqual({
			columnId: 'name',
			direction: 'ascending'
		});
		expect(nextDataSortDescriptor({ columnId: 'name', direction: 'ascending' }, 'name')).toEqual({
			columnId: 'name',
			direction: 'descending'
		});
		expect(
			nextDataSortDescriptor({ columnId: 'name', direction: 'descending' }, 'name')
		).toBeUndefined();
		expect(nextDataSortDescriptor({ columnId: 'name', direction: 'descending' }, 'owner')).toEqual({
			columnId: 'owner',
			direction: 'ascending'
		});
		expect(() => nextDataSortDescriptor(undefined, '')).toThrow(/columnId/u);
	});

	it('compares numeric, date and natural string values', () => {
		expect(compareDataValues(2, 10)).toBeLessThan(0);
		expect(compareDataValues(new Date('2026-01-01'), new Date('2025-01-01'))).toBeGreaterThan(0);
		expect(compareDataValues('row 2', 'row 10')).toBeLessThan(0);
		expect(compareDataValues(null, 'ready')).toBeLessThan(0);
		expect(compareDataValues('ready', undefined)).toBeGreaterThan(0);
		expect(compareDataValues(undefined, undefined)).toBe(0);
		expect(compareDataValues(2n, 10n)).toBeLessThan(0);
		expect(compareDataValues(Number.NaN, 10)).toBeLessThan(0);
		expect(compareDataValues(10, Number.NaN)).toBeGreaterThan(0);
		expect(compareDataValues(new Date('invalid'), new Date('2026-01-01'))).toBeLessThan(0);
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
		expect(
			stableSortRows(rows, {
				accessor: (row) => row.value,
				compare: (_left, _right, left, right) => right.id.localeCompare(left.id),
				direction: 'ascending'
			}).map(({ id }) => id)
		).toEqual(['c', 'b', 'a']);
	});

	it('rejects non-finite custom comparison results', () => {
		expect(() =>
			stableSortRows([{ value: 1 }, { value: 2 }], {
				accessor: (row) => row.value,
				compare: () => Number.NaN,
				direction: 'ascending'
			})
		).toThrow(/finite/u);
	});
});
