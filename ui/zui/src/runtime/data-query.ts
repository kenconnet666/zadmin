/** A JSON-safe scalar accepted by the query contract. */
export type DataQueryScalar = string | number | boolean | null;
export type DataQueryFilterOperator =
	'eq' | 'neq' | 'contains' | 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'isNull';

interface DataQueryFilterBase {
	readonly field: string;
}

export type DataQueryFilter =
	| (DataQueryFilterBase & { readonly operator: 'isNull'; readonly value?: never })
	| (DataQueryFilterBase & {
			readonly operator: 'in';
			readonly value: readonly DataQueryScalar[];
	  })
	| (DataQueryFilterBase & { readonly operator: 'contains'; readonly value: string })
	| (DataQueryFilterBase & {
			readonly operator: 'gt' | 'gte' | 'lt' | 'lte';
			readonly value: string | number;
	  })
	| (DataQueryFilterBase & {
			readonly operator: 'eq' | 'neq';
			readonly value: DataQueryScalar;
	  });

export interface DataQuerySort {
	readonly field: string;
	readonly direction: 'ascending' | 'descending';
}

export interface DataQuery {
	readonly page: number;
	readonly pageSize: number;
	readonly sort: readonly DataQuerySort[];
	readonly filters: readonly DataQueryFilter[];
}

const operators = new Set<DataQueryFilterOperator>([
	'eq',
	'neq',
	'contains',
	'in',
	'gt',
	'gte',
	'lt',
	'lte',
	'isNull'
]);

function fail(message: string): never {
	throw new TypeError(`DataQuery ${message}`);
}

function ownRecord(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		fail(`${label} must be an object.`);
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null)
		fail(`${label} must be a plain object.`);
	for (const key of Reflect.ownKeys(value)) {
		if (typeof key === 'symbol') fail(`${label} cannot contain symbol keys.`);
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor || !('value' in descriptor)) fail(`${label}.${key} must be a data property.`);
	}
	return value as Record<string, unknown>;
}

function assertKnownKeys(
	value: Record<string, unknown>,
	allowed: readonly string[],
	label: string
): void {
	const known = new Set(allowed);
	for (const key of Object.getOwnPropertyNames(value))
		if (!known.has(key)) fail(`${label}.${key} is not supported.`);
}

function denseDataArray(value: unknown, label: string): readonly unknown[] {
	if (!Array.isArray(value)) fail(`${label} must be an array.`);
	if (Object.getPrototypeOf(value) !== Array.prototype) fail(`${label} must be a plain array.`);
	for (const key of Reflect.ownKeys(value)) {
		if (typeof key === 'symbol') fail(`${label} cannot contain symbol keys.`);
		if (key === 'length') continue;
		if (!/^(?:0|[1-9]\d*)$/u.test(key) || Number(key) >= value.length)
			fail(`${label}.${key} is not a supported array index.`);
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor || !('value' in descriptor)) fail(`${label}[${key}] must be a data property.`);
	}
	for (let index = 0; index < value.length; index += 1)
		if (!Object.hasOwn(value, index)) fail(`${label}[${index}] must not be sparse.`);
	return value;
}

function scalar(value: unknown, label: string): DataQueryScalar {
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	fail(`${label} must be a finite number, string, boolean or null.`);
}

function queryValue(value: unknown, label: string): DataQueryScalar | readonly DataQueryScalar[] {
	if (Array.isArray(value))
		return Object.freeze(
			Array.from(denseDataArray(value, label), (item, index) => scalar(item, `${label}[${index}]`))
		);
	return scalar(value, label);
}

function positiveInteger(value: unknown, fallback: number, label: string): number {
	if (value === undefined) return fallback;
	if (!Number.isSafeInteger(value) || (value as number) < 1)
		fail(`${label} must be a positive safe integer.`);
	return value as number;
}

/** Normalize and freeze a caller-owned, request-free query description. */
export function normalizeDataQuery(input: unknown = {}): DataQuery {
	const source = ownRecord(input, 'query');
	assertKnownKeys(source, ['page', 'pageSize', 'sort', 'filters'], 'query');
	const sortInput = denseDataArray(source.sort ?? [], 'sort');
	const sort = Array.from(sortInput, (item, index) => {
		const value = ownRecord(item, `sort[${index}]`);
		assertKnownKeys(value, ['field', 'direction'], `sort[${index}]`);
		if (typeof value.field !== 'string' || value.field.trim() === '')
			fail(`sort[${index}].field must not be empty.`);
		if (value.direction !== 'ascending' && value.direction !== 'descending')
			fail(`sort[${index}].direction is invalid.`);
		return Object.freeze({ field: value.field.trim(), direction: value.direction });
	});
	if (new Set(sort.map(({ field }) => field)).size !== sort.length)
		fail('sort fields must be unique.');
	const filtersInput = denseDataArray(source.filters ?? [], 'filters');
	const filters = Array.from(filtersInput, (item, index) => {
		const value = ownRecord(item, `filters[${index}]`);
		assertKnownKeys(value, ['field', 'operator', 'value'], `filters[${index}]`);
		if (typeof value.field !== 'string' || value.field.trim() === '')
			fail(`filters[${index}].field must not be empty.`);
		if (
			typeof value.operator !== 'string' ||
			!operators.has(value.operator as DataQueryFilterOperator)
		)
			fail(`filters[${index}].operator is invalid.`);
		const operator = value.operator as DataQueryFilterOperator;
		if (operator === 'isNull' && value.value !== undefined)
			fail(`filters[${index}].isNull cannot have a value.`);
		if (operator === 'in' && (!Array.isArray(value.value) || value.value.length === 0))
			fail(`filters[${index}].in requires a non-empty value array.`);
		if (operator !== 'isNull' && value.value === undefined)
			fail(`filters[${index}].value is required.`);
		if (operator !== 'in' && operator !== 'isNull' && Array.isArray(value.value))
			fail(`filters[${index}] operator ${operator} does not accept an array.`);
		if (operator === 'contains' && typeof value.value !== 'string')
			fail(`filters[${index}].contains requires a string value.`);
		if (
			['gt', 'gte', 'lt', 'lte'].includes(operator) &&
			typeof value.value !== 'string' &&
			!(typeof value.value === 'number' && Number.isFinite(value.value))
		)
			fail(`filters[${index}].${operator} requires a string or finite number value.`);
		return Object.freeze({
			field: value.field.trim(),
			operator,
			...(value.value === undefined
				? {}
				: { value: queryValue(value.value, `filters[${index}].value`) })
		}) as DataQueryFilter;
	});
	return Object.freeze({
		page: positiveInteger(source.page, 1, 'page'),
		pageSize: positiveInteger(source.pageSize, 10, 'pageSize'),
		sort: Object.freeze(sort),
		filters: Object.freeze(filters)
	});
}

function canonical(value: unknown): string {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
	return `{${Object.keys(value as object)
		.sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
		.map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`)
		.join(',')}}`;
}

/** Stable, serializable identity for cache keys owned by the caller. */
export function dataQueryFingerprint(query: DataQuery | unknown): string {
	return `data-query:v1:${canonical(normalizeDataQuery(query))}`;
}
