import { getContext, setContext } from 'svelte';
import type { ResponsiveQuery, ResponsiveValue } from './responsive.js';

export interface GridContext {
	readonly columns: ResponsiveValue<number>;
	readonly query: ResponsiveQuery;
}

const GRID_CONTEXT = Symbol('zui-grid');

export function provideGrid(read: () => GridContext): void {
	setContext<GridContext>(GRID_CONTEXT, {
		get columns() {
			return read().columns;
		},
		get query() {
			return read().query;
		}
	});
}

export function useGrid(): GridContext {
	const context = getContext<GridContext | undefined>(GRID_CONTEXT);
	if (!context) throw new Error('ZGridItem must be rendered inside ZGrid.');
	return context;
}

export function assertGridInteger(value: number, name: string, minimum = 1): void {
	if (!Number.isSafeInteger(value) || value < minimum)
		throw new TypeError(`${name} must be a safe integer of at least ${minimum}.`);
}
