<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { DataSortDescriptor } from '../../runtime/collection/data-table.js';
	import type { TableDensity } from './ZTable.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type DataTableSelectionMode = 'multiple' | 'none' | 'single';
	export type DataTableWidth = number | string;
	export interface DataTableColumn<TRow> {
		readonly accessor: (row: TRow) => unknown;
		readonly cell?: Snippet<[TRow, unknown]>;
		readonly compare?: (left: unknown, right: unknown, leftRow: TRow, rightRow: TRow) => number;
		readonly header: string;
		readonly id: string;
		readonly sortable?: boolean;
		readonly width?: DataTableWidth;
	}
	export interface ZDataTableProps<TRow = unknown> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children'
	> {
		readonly caption: string;
		readonly columns: readonly DataTableColumn<TRow>[];
		readonly defaultSelectedKeys?: readonly SelectionKey[];
		readonly defaultSort?: DataSortDescriptor;
		readonly density?: TableDensity;
		readonly emptyLabel?: string;
		readonly height?: number;
		readonly isRowDisabled?: (row: TRow) => boolean;
		readonly onSelectionChange?: (keys: readonly SelectionKey[]) => void;
		readonly onSortChange?: (sort: DataSortDescriptor | undefined) => void;
		readonly overscan?: number;
		ref?: HTMLDivElement | null;
		readonly rowHeight?: number;
		readonly rowKey: (row: TRow) => SelectionKey;
		readonly rows: readonly TRow[];
		readonly selectAllLabel?: string;
		readonly selectionLabel?: (row: TRow, index: number) => string;
		readonly selectionMode?: DataTableSelectionMode;
		selectedKeys?: readonly SelectionKey[];
		sort?: DataSortDescriptor;
		readonly striped?: boolean;
		readonly virtualized?: boolean;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'data-table',
		importStatement: "import { ZDataTable } from '@zadmin/zui';",
		name: 'ZDataTable',
		bindings: [
			{ description: '排序描述。', name: 'sort', type: 'DataSortDescriptor | undefined' },
			{ description: '稳定业务选择key。', name: 'selectedKeys', type: 'readonly SelectionKey[]' },
			{ description: '真实滚动容器引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZTable', 'selection', 'stable sort', 'fixed-size virtualizer'],
		events: [
			{
				description: '用户排序变化。',
				name: 'onSortChange',
				type: '(sort: DataSortDescriptor | undefined) => void'
			},
			{
				description: '用户选择变化。',
				name: 'onSelectionChange',
				type: '(keys: readonly SelectionKey[]) => void'
			}
		],
		keyboard: [
			{ description: '激活排序按钮。', key: 'Enter / Space' },
			{ description: '切换原生checkbox/radio选择。', key: 'Space' }
		],
		parts: [
			{ description: '滚动viewport。', name: 'viewport' },
			{ description: '原生table。', name: 'table' },
			{ description: '数据row。', name: 'row' },
			{ description: '数据cell。', name: 'cell' }
		],
		props: [
			{
				default: '必填',
				description: '稳定列模型。',
				name: 'columns',
				required: true,
				type: 'readonly DataTableColumn<TRow>[]'
			},
			{
				default: '必填',
				description: '行数据。',
				name: 'rows',
				required: true,
				type: 'readonly TRow[]'
			},
			{
				default: '必填',
				description: '稳定业务row key。',
				name: 'rowKey',
				required: true,
				type: '(row: TRow) => SelectionKey'
			},
			{
				default: "'none'",
				description: '选择模式。',
				name: 'selectionMode',
				type: "'none' | 'single' | 'multiple'"
			},
			{
				default: 'false',
				description: '启用固定rowHeight虚拟化。',
				name: 'virtualized',
				type: 'boolean'
			},
			{
				default: '44 / 320',
				description: '虚拟行高与viewport高。',
				name: 'rowHeight / height',
				type: 'number'
			}
		],
		since: '0.8.0',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZDataTable.svelte',
		states: [
			{ description: '选择行。', name: 'data-selected', values: ['true'] },
			{ description: '虚拟模式。', name: 'data-virtualized', values: ['true'] }
		],
		status: 'experimental',
		summary: '在原生Table上组合稳定sort、selection和可选固定行高虚拟化的Data Table。'
	} as const satisfies ZuiComponentMetadata;
	const viewportRecipe = defineRecipe({
		base: (s) => {
			s.maxWidth.percent(100);
		},
		variants: {
			virtualized: {
				false: () => undefined,
				true: (s) => {
					s.height.raw('var(--zui-data-table-height)');
					s.overflow.auto;
					s.position.relative;
					s._selector('& thead', (header) => {
						header.backgroundColor._canvas;
						header.position.sticky;
						header.top.px(0);
						header.zIndex(1);
					});
				}
			}
		},
		defaultVariants: { virtualized: false }
	});
	const sortButtonRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.cursor.pointer;
			s.display.inlineFlex;
			s.fontWeight._semibold;
			s.gap._small;
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, viewportRecipe);
	registerRecipeHmr(import.meta, sortButtonRecipe);
</script>

<script lang="ts" generics="TRow">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets and Maps validate and compare immutable snapshots. */
	import { onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { calculateVirtualRange } from '../../runtime/collection/virtualizer.js';
	import { stableSortRows } from '../../runtime/collection/data-table.js';
	import ZTable from './ZTable.svelte';
	const unique = (keys: readonly SelectionKey[]) => Object.freeze([...new Set(keys)]);
	let {
		caption,
		class: className,
		columns,
		defaultSelectedKeys = [],
		defaultSort,
		density = 'comfortable',
		emptyLabel = 'No rows',
		height = 320,
		isRowDisabled = () => false,
		onSelectionChange,
		onSortChange,
		overscan = 4,
		ref = $bindable(null),
		rowHeight = 44,
		rowKey,
		rows,
		selectAllLabel = 'Select all rows',
		selectionLabel = (_row, index) => `Select row ${index + 1}`,
		selectionMode = 'none',
		selectedKeys = $bindable(),
		sort = $bindable(),
		striped = false,
		style,
		virtualized = false,
		...rest
	}: ZDataTableProps<TRow> = $props();
	const zui = useZui();
	const uid = $props.id();
	const selectionName = $derived(`${zui.idPrefix}-${uid}-data-table-selection`);
	let scrollOffset = $state(0);
	let viewportSize = $state(untrack(() => height));
	let selectAll = $state<HTMLInputElement | null>(null);
	const normalizedColumns = $derived.by(() => {
		if (columns.length === 0) throw new Error('ZDataTable requires at least one column.');
		const ids = new Set<string>();
		for (const column of columns) {
			if (!column.id || ids.has(column.id))
				throw new Error(`Duplicate or empty ZDataTable column id "${column.id}".`);
			ids.add(column.id);
		}
		return columns;
	});
	const normalizedRows = $derived.by(() => {
		const keys = new Set<SelectionKey>();
		for (const row of rows) {
			const key = rowKey(row);
			if (keys.has(key)) throw new Error(`Duplicate ZDataTable row key "${String(key)}".`);
			keys.add(key);
		}
		return rows;
	});
	const sortState = new ControllableState<DataSortDescriptor | undefined>({
		defaultValue: () => defaultSort,
		onChange: () => onSortChange,
		read: () => sort,
		write: (next) => (sort = next)
	});
	const selectionState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => unique(defaultSelectedKeys),
		onChange: () => onSelectionChange,
		read: () => selectedKeys,
		write: (next) => (selectedKeys = next)
	});
	const resolvedSort = $derived.by(() => {
		const descriptor = sortState.current;
		if (!descriptor) return undefined;
		const column = normalizedColumns.find(({ id }) => id === descriptor.columnId);
		if (!column?.sortable) {
			throw new Error(
				`ZDataTable sort column "${descriptor.columnId}" is missing or not sortable.`
			);
		}
		return { column, descriptor };
	});
	const sortedRows = $derived.by(() => {
		if (!resolvedSort) return normalizedRows;
		return stableSortRows(normalizedRows, {
			accessor: resolvedSort.column.accessor,
			compare: resolvedSort.column.compare,
			direction: resolvedSort.descriptor.direction,
			locale: zui.locale
		});
	});
	const keyedRows = $derived(
		sortedRows.map((row, index) => ({ disabled: isRowDisabled(row), index, key: rowKey(row), row }))
	);
	const selected = $derived(new Set(selectionState.current));
	const enabledKeys = $derived(keyedRows.filter(({ disabled }) => !disabled).map(({ key }) => key));
	const allSelected = $derived(
		enabledKeys.length > 0 && enabledKeys.every((key) => selected.has(key))
	);
	const someSelected = $derived(!allSelected && enabledKeys.some((key) => selected.has(key)));
	const virtualRange = $derived.by(() =>
		virtualized
			? calculateVirtualRange({
					count: keyedRows.length,
					itemSize: rowHeight,
					overscan,
					scrollOffset,
					viewportSize
				})
			: {
					endIndex: keyedRows.length,
					items: Object.freeze([]),
					startIndex: 0,
					totalSize: keyedRows.length * rowHeight
				}
	);
	const renderedRows = $derived(
		virtualized ? keyedRows.slice(virtualRange.startIndex, virtualRange.endIndex) : keyedRows
	);
	const topSpace = $derived(virtualized ? virtualRange.startIndex * rowHeight : 0);
	const bottomSpace = $derived(
		virtualized ? virtualRange.totalSize - virtualRange.endIndex * rowHeight : 0
	);
	const columnCount = $derived(normalizedColumns.length + (selectionMode === 'none' ? 0 : 1));
	const viewportClass = $derived(zui.recipe(viewportRecipe, { virtualized }));
	const sortButtonClass = $derived(zui.recipe(sortButtonRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-data-table-height': `${height}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (selectAll) selectAll.indeterminate = someSelected;
	});
	onMount(() => {
		if (!ref || !virtualized) return;
		const observer = new ResizeObserver(() => {
			if (ref) viewportSize = ref.clientHeight;
		});
		observer.observe(ref);
		return () => observer.disconnect();
	});
	function toggleSort(column: DataTableColumn<TRow>): void {
		if (!column.sortable) return;
		const current = sortState.current;
		const next =
			current?.columnId !== column.id
				? { columnId: column.id, direction: 'ascending' as const }
				: current.direction === 'ascending'
					? { columnId: column.id, direction: 'descending' as const }
					: undefined;
		sortState.setFromUser(next);
		if (ref) ref.scrollTop = 0;
		scrollOffset = 0;
	}
	function toggleRow(key: SelectionKey, disabled: boolean): void {
		if (disabled || selectionMode === 'none') return;
		if (selectionMode === 'single') {
			selectionState.setFromUser([key]);
			return;
		}
		selectionState.setFromUser(
			selected.has(key)
				? selectionState.current.filter((candidate) => !Object.is(candidate, key))
				: Object.freeze([...selectionState.current, key])
		);
	}
	function toggleAll(): void {
		if (selectionMode !== 'multiple') return;
		const enabled = new Set(enabledKeys);
		selectionState.setFromUser(
			allSelected
				? selectionState.current.filter((key) => !enabled.has(key))
				: unique([...selectionState.current, ...enabledKeys])
		);
	}
	function widthStyle(width: DataTableWidth | undefined): string | undefined {
		if (width === undefined) return undefined;
		if (typeof width === 'number') {
			if (!Number.isFinite(width) || width <= 0)
				throw new TypeError('ZDataTable column width must be positive and finite.');
			return `width: ${width}px`;
		}
		if (!width.trim() || /[;{}]/u.test(width))
			throw new TypeError('ZDataTable column width must be a safe CSS value.');
		return `width: ${width.trim()}`;
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[viewportClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-slot="viewport"
	data-virtualized={virtualized || undefined}
	data-range-start={virtualRange.startIndex}
	data-range-end={virtualRange.endIndex}
	onscroll={(event) => (scrollOffset = event.currentTarget.scrollTop)}
>
	<ZTable {caption} captionHidden {density} {striped} aria-rowcount={keyedRows.length + 1}>
		{#snippet header()}<tr
				>{#if selectionMode !== 'none'}<th scope="col"
						>{#if selectionMode === 'multiple'}<input
								bind:this={selectAll}
								type="checkbox"
								aria-label={selectAllLabel}
								checked={allSelected}
								onchange={toggleAll}
							/>{/if}</th
					>{/if}{#each normalizedColumns as column (column.id)}<th
						scope="col"
						aria-sort={sortState.current?.columnId === column.id
							? sortState.current.direction
							: undefined}
						style={widthStyle(column.width)}
						>{#if column.sortable}<button
								type="button"
								class={sortButtonClass}
								onclick={() => toggleSort(column)}
								>{column.header}<span aria-hidden="true"
									>{sortState.current?.columnId === column.id
										? sortState.current.direction === 'ascending'
											? '↑'
											: '↓'
										: '↕'}</span
								></button
							>{:else}{column.header}{/if}</th
					>{/each}</tr
			>{/snippet}
		{#if topSpace > 0}<tr aria-hidden="true"
				><td colspan={columnCount} style={`height: ${topSpace}px; padding: 0; border: 0;`}></td></tr
			>{/if}
		{#each renderedRows as entry (entry.key)}<tr
				data-slot="row"
				data-key={String(entry.key)}
				data-selected={selected.has(entry.key) || undefined}
				aria-rowindex={entry.index + 2}
				style={virtualized ? `height: ${rowHeight}px` : undefined}
				>{#if selectionMode !== 'none'}<td
						><input
							type={selectionMode === 'single' ? 'radio' : 'checkbox'}
							name={selectionMode === 'single' ? selectionName : undefined}
							aria-label={selectionLabel(entry.row, entry.index)}
							disabled={entry.disabled}
							checked={selected.has(entry.key)}
							onchange={() => toggleRow(entry.key, entry.disabled)}
						/></td
					>{/if}{#each normalizedColumns as column (column.id)}{@const value = column.accessor(
						entry.row
					)}<td data-slot="cell"
						>{#if column.cell}{@render column.cell(entry.row, value)}{:else}{String(
								value ?? ''
							)}{/if}</td
					>{/each}</tr
			>{/each}
		{#if bottomSpace > 0}<tr aria-hidden="true"
				><td colspan={columnCount} style={`height: ${bottomSpace}px; padding: 0; border: 0;`}
				></td></tr
			>{/if}{#if keyedRows.length === 0}<tr><td colspan={columnCount}>{emptyLabel}</td></tr>{/if}
	</ZTable>
</div>
