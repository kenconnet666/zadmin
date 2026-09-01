export type PaginationItem = number | 'ellipsis-end' | 'ellipsis-start';

export interface PaginationModelOptions {
	readonly pageSize?: number;
	readonly totalItems?: number;
	readonly totalPages?: number;
}

export interface PaginationModel {
	readonly pageSize?: number;
	readonly totalItems?: number;
	readonly totalPages: number;
}

function assertCount(value: number, label: string, allowZero = false): void {
	if (!Number.isInteger(value) || value < (allowZero ? 0 : 1)) {
		throw new TypeError(`${label} must be ${allowZero ? 'a non-negative' : 'a positive'} integer.`);
	}
}

/**
 * Resolves the two intentionally exclusive public count modes.
 *
 * `totalPages` is the compatibility path for an already-paginated owner. `totalItems`
 * derives its page count from `pageSize`; accepting both would create two competing
 * sources of truth, so an explicitly ambiguous configuration fails immediately.
 * Omitting both preserves the compatibility default of one page.
 */
export function resolvePaginationModel({
	pageSize,
	totalItems,
	totalPages
}: PaginationModelOptions): PaginationModel {
	const hasTotalItems = totalItems !== undefined;
	const hasTotalPages = totalPages !== undefined;
	if (hasTotalItems && hasTotalPages) {
		throw new TypeError('Pagination cannot use totalPages and totalItems together.');
	}
	if (hasTotalPages) {
		assertCount(totalPages, 'Pagination totalPages');
		return Object.freeze({ totalPages });
	}
	if (!hasTotalItems) return Object.freeze({ totalPages: 1 });
	assertCount(totalItems, 'Pagination totalItems', true);
	assertCount(pageSize ?? 10, 'Pagination pageSize');
	return Object.freeze({
		pageSize: pageSize ?? 10,
		totalItems,
		totalPages: Math.max(1, Math.ceil(totalItems / (pageSize ?? 10)))
	});
}

/** Validates picker choices and keeps an externally controlled custom size representable. */
export function normalizePageSizeOptions(
	options: readonly number[],
	currentPageSize: number
): readonly number[] {
	assertCount(currentPageSize, 'Pagination pageSize');
	if (options.length === 0) return Object.freeze([]);
	const normalized: number[] = [];
	for (const option of options) {
		assertCount(option, 'Pagination pageSizeOptions item');
		if (normalized.includes(option)) {
			throw new TypeError('Pagination pageSizeOptions must not contain duplicates.');
		}
		normalized.push(option);
	}
	if (!normalized.includes(currentPageSize)) normalized.unshift(currentPageSize);
	return Object.freeze(normalized);
}

export function clampPage(page: number, totalPages: number): number {
	assertCount(totalPages, 'Pagination totalPages');
	if (!Number.isFinite(page)) throw new TypeError('Pagination page must be finite.');
	return Math.min(totalPages, Math.max(1, Math.trunc(page)));
}

export function createPaginationItems(
	totalPages: number,
	page: number,
	boundaryCount = 1,
	siblingCount = 1
): readonly PaginationItem[] {
	assertCount(totalPages, 'Pagination totalPages');
	assertCount(boundaryCount, 'Pagination boundaryCount', true);
	assertCount(siblingCount, 'Pagination siblingCount', true);
	const current = clampPage(page, totalPages);
	const included: number[] = [];
	const add = (candidate: number) => {
		if (candidate >= 1 && candidate <= totalPages && !included.includes(candidate)) {
			included.push(candidate);
		}
	};

	for (let candidate = 1; candidate <= boundaryCount; candidate += 1) add(candidate);
	for (
		let candidate = current - siblingCount;
		candidate <= current + siblingCount;
		candidate += 1
	) {
		add(candidate);
	}
	for (
		let candidate = Math.max(1, totalPages - boundaryCount + 1);
		candidate <= totalPages;
		candidate += 1
	) {
		add(candidate);
	}
	included.sort((left, right) => left - right);

	const items: PaginationItem[] = [];
	const first = included[0]!;
	if (first === 2) items.push(1);
	else if (first > 2) items.push('ellipsis-start');
	for (const candidate of included) {
		const previous = items.at(-1);
		if (typeof previous === 'number') {
			const gap = candidate - previous;
			if (gap === 2) items.push(previous + 1);
			else if (gap > 2) items.push(candidate <= current ? 'ellipsis-start' : 'ellipsis-end');
		}
		items.push(candidate);
	}
	const last = included.at(-1)!;
	if (last === totalPages - 1) items.push(totalPages);
	else if (last < totalPages - 1) items.push('ellipsis-end');
	return Object.freeze(items);
}
