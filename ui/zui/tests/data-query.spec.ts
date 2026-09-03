import { describe, expect, it } from 'vitest';
import { dataQueryFingerprint, normalizeDataQuery } from '../src/runtime/data-query.js';

describe('DataQuery', () => {
	it('normalizes a JSON-safe page, sort and filter description without side effects', () => {
		const query = normalizeDataQuery({
			page: 2,
			pageSize: 25,
			sort: [{ field: 'name', direction: 'ascending' }],
			filters: [
				{ field: 'status', operator: 'in', value: ['ready', 'queued'] },
				{ field: 'archived', operator: 'eq', value: false }
			]
		});
		expect(query).toEqual({
			page: 2,
			pageSize: 25,
			sort: [{ field: 'name', direction: 'ascending' }],
			filters: [
				{ field: 'status', operator: 'in', value: ['ready', 'queued'] },
				{ field: 'archived', operator: 'eq', value: false }
			]
		});
		expect(Object.isFrozen(query)).toBe(true);
		expect(dataQueryFingerprint(query)).toBe(
			dataQueryFingerprint({ ...query, filters: [...query.filters] })
		);
	});

	it('uses stable defaults and rejects malformed or non-serializable input', () => {
		expect(normalizeDataQuery()).toEqual({ page: 1, pageSize: 10, sort: [], filters: [] });
		const sparseSort = new Array(1);
		const extraFilterProperty: unknown[] = [];
		Object.defineProperty(extraFilterProperty, 'cache', { value: true });
		const accessorSort: unknown[] = [];
		Object.defineProperty(accessorSort, '0', {
			get: () => ({ field: 'name', direction: 'ascending' })
		});
		accessorSort.length = 1;
		const symbolValue: unknown[] = ['ready'];
		Object.defineProperty(symbolValue, Symbol('hidden'), { value: true });
		const nonEnumerableUnknown = Object.defineProperty({}, 'cacheKey', { value: 'hidden' });
		for (const input of [
			new Date(),
			/regexp/,
			Object.create({ page: 2 }),
			{ page: 0 },
			{ pageSize: 1.5 },
			{
				sort: [
					{ field: 'x', direction: 'ascending' },
					{ field: 'x', direction: 'descending' }
				]
			},
			{ filters: [{ field: 'x', operator: 'isNull', value: null }] },
			{ filters: [{ field: 'x', operator: 'in', value: [] }] },
			{ filters: [{ field: 'x', operator: 'eq', value: undefined }] },
			{ filters: [{ field: 'x', operator: 'eq', value: { nested: true } }] },
			{ filters: [{ field: 'x', operator: 'eq', value: ['not', 'allowed'] }] },
			{ filters: [{ field: 'x', operator: 'contains', value: 1 }] },
			{ filters: [{ field: 'x', operator: 'gte', value: true }] },
			{ filters: [{ field: 'x', operator: 'lt', value: ['array'] }] },
			{ cacheKey: 'must-not-be-smuggled' },
			{ sort: sparseSort },
			{ filters: extraFilterProperty },
			{ sort: accessorSort },
			{ filters: [{ field: 'status', operator: 'in', value: symbolValue }] },
			nonEnumerableUnknown,
			Object.assign(Object.create(null), { page: 1, [Symbol('hidden')]: true }),
			Object.defineProperty({}, 'page', { get: () => 1 })
		])
			expect(() => normalizeDataQuery(input)).toThrow(TypeError);
	});

	it('canonicalizes field whitespace in values and fingerprints', () => {
		const trimmed = normalizeDataQuery({
			sort: [{ field: ' name ', direction: 'ascending' }],
			filters: [{ field: ' status ', operator: 'contains', value: 'ready' }]
		});
		expect(trimmed.sort[0]?.field).toBe('name');
		expect(trimmed.filters[0]?.field).toBe('status');
		expect(dataQueryFingerprint(trimmed)).toBe(
			dataQueryFingerprint({
				sort: [{ field: 'name', direction: 'ascending' }],
				filters: [{ field: 'status', operator: 'contains', value: 'ready' }]
			})
		);
	});
});
