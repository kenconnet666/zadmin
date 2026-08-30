export type DataSortDirection = 'ascending' | 'descending';

export interface DataSortDescriptor {
	readonly columnId: string;
	readonly direction: DataSortDirection;
}

export function compareDataValues(left: unknown, right: unknown, locale = 'en-US'): number {
	if (Object.is(left, right)) return 0;
	if (left === null || left === undefined) return -1;
	if (right === null || right === undefined) return 1;
	if (typeof left === 'number' && typeof right === 'number') return left - right;
	if (typeof left === 'bigint' && typeof right === 'bigint') return left < right ? -1 : 1;
	if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
	return new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }).compare(
		String(left),
		String(right)
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
	const direction = options.direction === 'ascending' ? 1 : -1;
	return Object.freeze(
		rows
			.map((row, index) => ({ index, row, value: options.accessor(row) }))
			.sort((left, right) => {
				const compared = options.compare
					? options.compare(left.value, right.value, left.row, right.row)
					: compareDataValues(left.value, right.value, options.locale);
				return compared === 0 ? left.index - right.index : compared * direction;
			})
			.map(({ row }) => row)
	);
}
