export type DataSortDirection = 'ascending' | 'descending';

export interface DataSortDescriptor {
	readonly columnId: string;
	readonly direction: DataSortDirection;
}

/**
 * Returns the next single-column sort state used by DataTable headers.
 *
 * A different column always starts ascending. Repeated activation cycles
 * ascending -> descending -> unsorted so both controlled and uncontrolled
 * owners have an explicit way to clear a default sort.
 */
export function nextDataSortDescriptor(
	current: DataSortDescriptor | undefined,
	columnId: string
): DataSortDescriptor | undefined {
	if (!columnId) throw new TypeError('Data table sort columnId must not be empty.');
	if (current && current.direction !== 'ascending' && current.direction !== 'descending') {
		throw new TypeError('Data table sort direction must be ascending or descending.');
	}
	if (current?.columnId !== columnId) return Object.freeze({ columnId, direction: 'ascending' });
	if (current.direction === 'ascending') {
		return Object.freeze({ columnId, direction: 'descending' });
	}
	return undefined;
}

function compareDataValuesWithCollator(
	left: unknown,
	right: unknown,
	collator: Intl.Collator
): number {
	if (Object.is(left, right)) return 0;
	if (left === null || left === undefined) return -1;
	if (right === null || right === undefined) return 1;
	if (typeof left === 'number' && typeof right === 'number') {
		if (Number.isNaN(left)) return -1;
		if (Number.isNaN(right)) return 1;
		return left < right ? -1 : left > right ? 1 : 0;
	}
	if (typeof left === 'bigint' && typeof right === 'bigint') return left < right ? -1 : 1;
	if (left instanceof Date && right instanceof Date) {
		return compareDataValuesWithCollator(left.getTime(), right.getTime(), collator);
	}
	return collator.compare(String(left), String(right));
}

export function compareDataValues(left: unknown, right: unknown, locale = 'en-US'): number {
	return compareDataValuesWithCollator(
		left,
		right,
		new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
	);
}

export function stableSortRows<TRow>(
	rows: readonly TRow[],
	options: {
		readonly accessor: (row: TRow) => unknown;
		readonly compare?: (left: unknown, right: unknown, leftRow: TRow, rightRow: TRow) => number;
		readonly direction: DataSortDirection;
		readonly locale?: string;
	}
): readonly TRow[] {
	if (options.direction !== 'ascending' && options.direction !== 'descending') {
		throw new TypeError('Data table sort direction must be ascending or descending.');
	}
	const direction = options.direction === 'ascending' ? 1 : -1;
	const collator = options.compare
		? undefined
		: new Intl.Collator(options.locale ?? 'en-US', { numeric: true, sensitivity: 'base' });
	return Object.freeze(
		rows
			.map((row, index) => ({ index, row, value: options.accessor(row) }))
			.sort((left, right) => {
				const compared = options.compare
					? options.compare(left.value, right.value, left.row, right.row)
					: compareDataValuesWithCollator(left.value, right.value, collator!);
				if (!Number.isFinite(compared)) {
					throw new TypeError('ZDataTable column compare must return a finite number.');
				}
				return compared === 0 ? left.index - right.index : compared * direction;
			})
			.map(({ row }) => row)
	);
}
