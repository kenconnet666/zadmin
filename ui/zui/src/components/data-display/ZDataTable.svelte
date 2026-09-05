<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { DataSortDescriptor } from '../../runtime/collection/data-table.js';
	import type { KeyedVirtualRange, VirtualAlign } from '../../runtime/collection/virtualizer.js';
	import type { TableDensity } from './ZTable.svelte';
	import { styleInternalFocusRing } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type DataTableSelectionMode = 'multiple' | 'none' | 'single';
	export type DataTableWidth = number | string;
	export type DataTableColumnPin = 'end' | 'start';
	export type DataTableColumnAlign = 'center' | 'end' | 'start';
	export type DataTableSortingMode = 'client' | 'server';
	export type DataTableColumnVisibility = Readonly<Record<string, boolean>>;
	export type DataTableColumnWidths = Readonly<Record<string, number>>;
	export type DataTableRowFocusTarget = 'auto' | 'expand' | 'selection';

	export interface DataTableColumn<TRow> {
		readonly accessor: (row: TRow) => unknown;
		readonly align?: DataTableColumnAlign;
		readonly cell?: Snippet<[TRow, unknown, number]>;
		readonly compare?: (left: unknown, right: unknown, leftRow: TRow, rightRow: TRow) => number;
		readonly defaultHidden?: boolean;
		readonly ellipsis?: boolean;
		readonly header: string;
		readonly id: string;
		readonly maxWidth?: number;
		readonly minWidth?: number;
		readonly resizable?: boolean;
		readonly sortable?: boolean;
		readonly sticky?: DataTableColumnPin;
		readonly width?: DataTableWidth;
	}

	export interface ZDataTableController<TKey extends SelectionKey = SelectionKey> {
		readonly range: KeyedVirtualRange<TKey> | null;
		readonly visibleColumnIds: readonly string[];
		focusRow(key: TKey, target?: DataTableRowFocusTarget): boolean;
		resetColumnWidths(): void;
		scrollToRow(key: TKey, align?: VirtualAlign): boolean;
		setColumnVisible(columnId: string, visible: boolean): boolean;
	}

	export interface ZDataTableProps<
		TRow = unknown,
		TRowKey extends SelectionKey = SelectionKey
	> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly caption: string;
		columnVisibility?: DataTableColumnVisibility;
		columnWidths?: DataTableColumnWidths;
		readonly columns: readonly DataTableColumn<TRow>[];
		controller?: ZDataTableController<TRowKey> | null;
		readonly defaultColumnVisibility?: DataTableColumnVisibility;
		readonly defaultColumnWidths?: DataTableColumnWidths;
		readonly defaultExpandedKeys?: readonly TRowKey[];
		readonly defaultSelectedKeys?: readonly TRowKey[];
		readonly defaultSort?: DataSortDescriptor;
		readonly density?: TableDensity;
		readonly empty?: Snippet;
		readonly emptyLabel?: string;
		readonly error?: string | null;
		readonly errorContent?: Snippet<[string]>;
		expandedKeys?: readonly TRowKey[];
		readonly expandedRow?: Snippet<[TRow, number]>;
		readonly expandedRowEstimate?: number;
		readonly expansionColumnLabel?: string;
		readonly expansionLabel?: (row: TRow, expanded: boolean) => string;
		readonly height?: number;
		readonly isRowDisabled?: (row: TRow) => boolean;
		readonly isRowExpandable?: (row: TRow) => boolean;
		readonly loading?: boolean;
		readonly loadingContent?: Snippet;
		readonly loadingLabel?: string;
		readonly onColumnVisibilityChange?: (visibility: DataTableColumnVisibility) => void;
		readonly onColumnWidthsChange?: (widths: DataTableColumnWidths) => void;
		readonly onExpandedChange?: (keys: readonly TRowKey[]) => void;
		readonly onSelectionChange?: (keys: readonly TRowKey[]) => void;
		readonly onSortChange?: (sort: DataSortDescriptor | undefined) => void;
		readonly overscan?: number;
		ref?: HTMLDivElement | null;
		readonly resizeLabel?: (column: DataTableColumn<TRow>) => string;
		readonly rowHeight?: number;
		readonly rowIndexOffset?: number;
		readonly rowKey: (row: TRow) => TRowKey;
		readonly rows: readonly TRow[];
		readonly selectAllLabel?: string;
		readonly selectionColumnLabel?: string;
		readonly selectionLabel?: (row: TRow, index: number) => string;
		readonly selectionMode?: DataTableSelectionMode;
		selectedKeys?: readonly TRowKey[];
		readonly sortingMode?: DataTableSortingMode;
		readonly ssrViewportSize?: number;
		readonly stickyHeader?: boolean;
		readonly striped?: boolean;
		sort?: DataSortDescriptor;
		readonly totalRowCount?: number;
		readonly virtualized?: boolean;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'data-table',
		importStatement: "import { ZDataTable } from '@zadmin/zui';",
		name: 'ZDataTable',
		bindings: [
			{
				description: '排序描述；undefined明确表示无排序。',
				name: 'sort',
				type: 'DataSortDescriptor | undefined'
			},
			{
				description: '按typed row key保存的选择。',
				name: 'selectedKeys',
				type: 'readonly TRowKey[]'
			},
			{
				description: '按typed row key保存的展开行。',
				name: 'expandedKeys',
				type: 'readonly TRowKey[]'
			},
			{
				description: '列id到可见性的稀疏映射。',
				name: 'columnVisibility',
				type: 'Readonly<Record<string, boolean>>',
				opaque: {
					kind: 'dynamic-record',
					resolution: 'dynamic-key',
					type: 'DataTableColumnVisibility',
					reason: 'key集合由columns动态决定。',
					owner: 'caller/column model',
					serializable: true
				}
			},
			{
				description: '用户调整后的列像素宽度。',
				name: 'columnWidths',
				type: 'Readonly<Record<string, number>>',
				opaque: {
					kind: 'dynamic-record',
					resolution: 'dynamic-key',
					type: 'DataTableColumnWidths',
					reason: 'key集合由columns动态决定。',
					owner: 'caller/column model',
					serializable: true
				}
			},
			{
				description: '滚动、聚焦和列状态控制器。',
				name: 'controller',
				type: 'ZDataTableController<TRowKey> | null'
			},
			{ description: '真实滚动容器引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZTable',
			'LogicalCollection',
			'SelectionModel',
			'KeyedVirtualizer',
			'ControllableState'
		],
		events: [
			{
				description: '用户排序变化。',
				name: 'onSortChange',
				type: '(sort: DataSortDescriptor | undefined) => void'
			},
			{
				description: '用户选择变化。',
				name: 'onSelectionChange',
				type: '(keys: readonly TRowKey[]) => void'
			},
			{
				description: '用户展开行变化。',
				name: 'onExpandedChange',
				type: '(keys: readonly TRowKey[]) => void'
			},
			{
				description: '用户调整列宽。',
				name: 'onColumnWidthsChange',
				type: '(widths: DataTableColumnWidths) => void'
			},
			{
				description: '控制器修改列可见性。',
				name: 'onColumnVisibilityChange',
				type: '(visibility: DataTableColumnVisibility) => void'
			}
		],
		keyboard: [
			{ description: '激活排序、选择和展开控件。', key: 'Enter / Space' },
			{ description: '逐步调整聚焦列分隔线。', key: 'ArrowLeft / ArrowRight' },
			{ description: '将聚焦列分隔线设置到最小或最大宽度。', key: 'Home / End' }
		],
		parts: [
			{ description: '滚动viewport。', name: 'viewport' },
			{ description: '加载或错误反馈。', name: 'status' },
			{ description: '原生table。', name: 'table' },
			{ description: '数据row。', name: 'row' },
			{ description: '数据cell。', name: 'cell' },
			{ description: '列宽分隔线。', name: 'column-resizer' },
			{ description: '展开详情row。', name: 'expanded-row' },
			{ description: '空数据row。', name: 'empty' }
		],
		props: [
			{
				default: '必填',
				description: '原生caption可访问名称。',
				name: 'caption',
				required: true,
				type: 'string'
			},
			{
				default: '必填',
				description: '稳定列模型。',
				name: 'columns',
				required: true,
				type: 'readonly DataTableColumn<TRow>[]',
				members: [
					{
						description: '列唯一标识；与visibility/width映射一致。',
						name: 'id',
						type: 'string',
						required: true
					},
					{ description: '表头文本。', name: 'header', type: 'string', required: true },
					{
						description: '从行读取单元格值。',
						name: 'accessor',
						type: '(row: TRow) => unknown',
						required: true
					},
					{
						description: '自定义单元格内容。',
						name: 'cell',
						type: 'Snippet<[TRow, unknown, number]>'
					},
					{ description: '启用列排序；server模式只发出意图。', name: 'sortable', type: 'boolean' },
					{
						description: '可选本地排序比较器；省略时使用内建稳定值比较。',
						name: 'compare',
						type: '(left: unknown, right: unknown, leftRow: TRow, rightRow: TRow) => number'
					},
					{ description: '默认隐藏该列。', name: 'defaultHidden', type: 'boolean' },
					{ description: '文本溢出省略。', name: 'ellipsis', type: 'boolean' },
					{ description: '列宽下限像素。', name: 'minWidth', type: 'number' },
					{ description: '列宽上限像素。', name: 'maxWidth', type: 'number' },
					{ description: '初始列宽，可为安全CSS长度。', name: 'width', type: 'DataTableWidth' },
					{ description: '允许调整列宽。', name: 'resizable', type: 'boolean' },
					{ description: '逻辑方向固定列。', name: 'sticky', type: 'DataTableColumnPin' },
					{ description: '列内容对齐方式。', name: 'align', type: 'DataTableColumnAlign' }
				]
			},
			{
				default: '{}',
				description: '非受控列可见性的初始稀疏映射与reset目标。',
				name: 'defaultColumnVisibility',
				type: 'DataTableColumnVisibility'
			},
			{
				default: '{}',
				description: '非受控列宽的初始像素映射与reset目标。',
				name: 'defaultColumnWidths',
				type: 'DataTableColumnWidths'
			},
			{
				default: '[]',
				description: '非受控展开行的初始typed keys与reset目标。',
				name: 'defaultExpandedKeys',
				type: 'readonly TRowKey[]'
			},
			{
				default: '[]',
				description: '非受控选择的初始typed keys与reset目标。',
				name: 'defaultSelectedKeys',
				type: 'readonly TRowKey[]'
			},
			{
				default: 'undefined',
				description: '非受控排序的初始描述与reset目标。',
				name: 'defaultSort',
				type: 'DataSortDescriptor | undefined'
			},
			{
				default: "'Expand row details'",
				description: '展开控制列的可访问列标题；仅在提供expandedRow时显示。',
				name: 'expansionColumnLabel',
				type: 'string'
			},
			{
				default: 'expanded ? Collapse row details : Expand row details',
				description: '逐行展开控制的可访问名称。',
				name: 'expansionLabel',
				type: '(row: TRow, expanded: boolean) => string'
			},
			{
				default: '96',
				description: '展开详情用于虚拟测量的初始像素估算。',
				name: 'expandedRowEstimate',
				type: 'number'
			},
			{
				default: "'Select row'",
				description: '选择控制列的可访问列标题；与selectAllLabel和逐行selectionLabel独立。',
				name: 'selectionColumnLabel',
				type: 'string'
			},
			{
				default: "'Select all rows'",
				description: '多选表头全选控件的可访问名称。',
				name: 'selectAllLabel',
				type: 'string'
			},
			{
				default: 'Select row ${index + 1}',
				description: '逐行选择控件的可访问名称。',
				name: 'selectionLabel',
				type: '(row: TRow, index: number) => string'
			},
			{
				default: '必填',
				description: '当前数据快照。',
				name: 'rows',
				required: true,
				type: 'readonly TRow[]',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[]',
					genericParameters: ['TRow'],
					reason: '行结构由调用方定义；DataTable只拥有rowKey与表格状态。',
					owner: 'caller'
				}
			},
			{
				default: '必填',
				description: '稳定typed业务row key。',
				name: 'rowKey',
				required: true,
				type: '(row: TRow) => TRowKey'
			},
			{
				default: '() => false',
				description: '按业务行禁用选择、展开与行内交互。',
				name: 'isRowDisabled',
				type: '(row: TRow) => boolean'
			},
			{
				default: '() => true',
				description: '决定提供expandedRow时哪些业务行允许展开。',
				name: 'isRowExpandable',
				type: '(row: TRow) => boolean'
			},
			{
				default: "'client'",
				description: '本地稳定排序或只发出服务端排序意图。',
				name: 'sortingMode',
				type: "'client' | 'server'"
			},
			{
				default: "'none'",
				description: '行选择模式。',
				name: 'selectionMode',
				type: "'none' | 'single' | 'multiple'"
			},
			{
				default: "'comfortable'",
				description: '底层ZTable密度。',
				name: 'density',
				type: 'TableDensity'
			},
			{
				default: 'false',
				description: '使用底层ZTable的交替行表面。',
				name: 'striped',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '启用typed-key动态测量行窗口化。',
				name: 'virtualized',
				type: 'boolean'
			},
			{
				default: '44',
				description: '虚拟行的初始像素估算高度。',
				name: 'rowHeight',
				type: 'number'
			},
			{
				default: '320',
				description: '虚拟viewport的像素高度。',
				name: 'height',
				type: 'number'
			},
			{
				default: '4',
				description: '虚拟窗口两端额外渲染的行数。',
				name: 'overscan',
				type: 'number'
			},
			{
				default: 'undefined',
				description: 'SSR虚拟模式预渲染的行数；省略时使用可见窗口估算。',
				name: 'ssrViewportSize',
				type: 'number'
			},
			{
				default: '0',
				description: '服务端分页时aria-rowindex使用的零基偏移。',
				name: 'rowIndexOffset',
				type: 'number'
			},
			{
				default: 'rows.length',
				description: '服务端分页或虚拟全集的总行数，用于aria-rowcount。',
				name: 'totalRowCount',
				type: 'number'
			},
			{
				default: 'false',
				description: '显示组件内加载反馈并保留已有rows。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: "'Loading rows'",
				description: '加载状态的可访问文案。',
				name: 'loadingLabel',
				type: 'string'
			},
			{
				default: 'null',
				description: '显示组件内错误反馈并保留已有rows。',
				name: 'error',
				type: 'string | null'
			},
			{
				default: "'No rows'",
				description: '无数据状态的可访问文案。',
				name: 'emptyLabel',
				type: 'string'
			},
			{
				default: 'Resize ${column.header} column',
				description: '列宽分隔线的可访问名称。',
				name: 'resizeLabel',
				type: '(column: DataTableColumn<TRow>) => string'
			},
			{
				default: 'virtualized',
				description: '在viewport内固定表头。',
				name: 'stickyHeader',
				type: 'boolean'
			}
		],
		since: '0.2.0',
		snippets: [
			{ description: '自定义加载反馈。', name: 'loadingContent', type: 'Snippet' },
			{ description: '自定义错误反馈。', name: 'errorContent', type: 'Snippet<[string]>' },
			{ description: '自定义空状态。', name: 'empty', type: 'Snippet' },
			{ description: '按行渲染可折叠详情。', name: 'expandedRow', type: 'Snippet<[TRow, number]>' }
		],
		source: 'ui/zui/src/components/data-display/ZDataTable.svelte',
		states: [
			{ description: '选择行。', name: 'data-selected', values: ['true'] },
			{ description: '展开行。', name: 'data-expanded', values: ['true'] },
			{ description: '虚拟模式。', name: 'data-virtualized', values: ['true'] },
			{ description: '异步请求进行中。', name: 'aria-busy', values: ['true'] }
		],
		status: 'stable',
		summary:
			'保留原生table语义并组合受控排序、typed-key选择/展开、列状态、sticky与行虚拟化的DataTable。'
	} as const satisfies ZuiComponentMetadata;

	const viewportRecipe = defineRecipe({
		base: (s) => {
			s.maxWidth.percent(100);
			s.overflow.auto;
			s.position.relative;
			s._selector('& th', (header) => header.position.relative);
		},
		variants: {
			stickyHeader: {
				false: () => undefined,
				true: (s) =>
					s._selector('& thead th', (header) => {
						header.backgroundColor._canvas;
						header.position.sticky;
						header.top.px(0);
						header.zIndex(3);
					})
			},
			virtualized: {
				false: () => undefined,
				true: (s) => s.height.raw('var(--zui-data-table-height)')
			}
		},
		defaultVariants: { stickyHeader: false, virtualized: false }
	});
	const selectionRecipe = defineRecipe({
		base: (s) => styleInternalFocusRing(s),
		variants: {},
		defaultVariants: {}
	});
	const rowRecipe = defineRecipe({
		base: () => undefined,
		variants: {
			selected: {
				false: () => undefined,
				true: (s) =>
					s._selector('& > td', (cell) => {
						cell.backgroundColor._surface;
					})
			}
		},
		defaultVariants: { selected: false }
	});
	const stickyCellRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.position.sticky;
			s.zIndex(2);
		},
		variants: { selected: { false: () => undefined, true: (s) => s.backgroundColor._surface } },
		defaultVariants: { selected: false }
	});
	const ellipsisRecipe = defineRecipe({
		base: (s) => {
			s.display.block;
			s.overflow.hidden;
			s.textOverflow.ellipsis;
			s.whiteSpace.nowrap;
		},
		variants: {},
		defaultVariants: {}
	});
	const statusRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._canvas;
			s.boxSizing.borderBox;
			s.display.flex;
			s.gap._small;
			s.insetInlineStart.px(0);
			s.padding._medium;
			s.position.absolute;
			s.top.px(0);
			s.width.percent(100);
			s.zIndex(6);
		},
		variants: {},
		defaultVariants: {}
	});
	const expandedRecipe = defineRecipe({
		base: (s) => s.backgroundColor._surface,
		variants: {},
		defaultVariants: {}
	});
	const resizerRecipe = defineRecipe({
		base: (s) => {
			styleInternalFocusRing(s);
			s.backgroundColor._canvas;
			s.borderWidth.px(0);
			s.bottom.px(0);
			s.cursor.raw('col-resize');
			s.insetInlineEnd.px(0);
			s.padding.px(0);
			s.position.absolute;
			s.top.px(0);
			s.width.px(12);
			s.zIndex(5);
			s._hover((hover) =>
				hover._selector('& > span', (line) => {
					line.backgroundColor._primary;
				})
			);
		},
		variants: {},
		defaultVariants: {}
	});
	const resizerLineRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._border;
			s.bottom.px(0);
			s.left.percent(50);
			s.position.absolute;
			s.top.px(0);
			s.transform.raw('translateX(-50%)');
			s.width.px(2);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, viewportRecipe);
	registerRecipeHmr(import.meta, selectionRecipe);
	registerRecipeHmr(import.meta, rowRecipe);
	registerRecipeHmr(import.meta, stickyCellRecipe);
	registerRecipeHmr(import.meta, ellipsisRecipe);
	registerRecipeHmr(import.meta, statusRecipe);
	registerRecipeHmr(import.meta, expandedRecipe);
	registerRecipeHmr(import.meta, resizerRecipe);
	registerRecipeHmr(import.meta, resizerLineRecipe);
</script>

<script lang="ts" generics="TRow, TRowKey extends SelectionKey = SelectionKey">
	/* eslint-disable svelte/prefer-svelte-reactivity -- collection state is published through immutable Svelte snapshots. */
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { onMount, tick, untrack } from 'svelte';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { SelectionModel } from '../../runtime/collection/selection-model.js';
	import type { Selection } from '../../runtime/collection/selection.js';
	import {
		KeyedVirtualizer,
		type VirtualMeasurement
	} from '../../runtime/collection/virtualizer.js';
	import { nextDataSortDescriptor, stableSortRows } from '../../runtime/collection/data-table.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZAlert from '../feedback/ZAlert.svelte';
	import ZSpinner from '../feedback/ZSpinner.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import ZEmpty from './ZEmpty.svelte';
	import ZTable from './ZTable.svelte';

	const freezeKeys = <TKey extends SelectionKey>(keys: readonly TKey[]): readonly TKey[] => {
		for (const key of keys) {
			if (typeof key !== 'string' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError(
					'ZDataTable state keys must be strings or finite numbers other than -0.'
				);
			}
		}
		return Object.freeze([...new Set(keys)]);
	};
	const freezeRecord = <TValue,>(
		record: Readonly<Record<string, TValue>>
	): Readonly<Record<string, TValue>> => Object.freeze({ ...record });
	const CONTROL_COLUMN_WIDTH = 44;
	const DEFAULT_RESIZABLE_WIDTH = 160;

	let {
		caption,
		class: className,
		columnVisibility = $bindable(),
		columnWidths = $bindable(),
		columns,
		controller = $bindable(null),
		defaultColumnVisibility = {},
		defaultColumnWidths = {},
		defaultExpandedKeys = [],
		defaultSelectedKeys = [],
		defaultSort,
		density: densityProp,
		empty,
		emptyLabel = 'No rows',
		error = null,
		errorContent,
		expandedKeys = $bindable(),
		expandedRow,
		expandedRowEstimate = 96,
		expansionColumnLabel = 'Expand row details',
		expansionLabel = (_row, expanded) => (expanded ? 'Collapse row details' : 'Expand row details'),
		height = 320,
		isRowDisabled = () => false,
		isRowExpandable = () => true,
		loading = false,
		loadingContent,
		loadingLabel = 'Loading rows',
		onColumnVisibilityChange,
		onColumnWidthsChange,
		onExpandedChange,
		onSelectionChange,
		onSortChange,
		onscroll,
		overscan: overscanProp,
		ref = $bindable(null),
		resizeLabel = (column) => `Resize ${column.header} column`,
		rowHeight: rowHeightProp,
		rowIndexOffset = 0,
		rowKey,
		rows,
		selectAllLabel = 'Select all rows',
		selectionColumnLabel = 'Select row',
		selectionLabel = (_row, index) => `Select row ${index + 1}`,
		selectionMode: selectionModeProp,
		selectedKeys = $bindable(),
		sortingMode = 'client',
		ssrViewportSize,
		stickyHeader: stickyHeaderProp,
		striped: stripedProp,
		style,
		sort = $bindable(),
		totalRowCount,
		virtualized: virtualizedProp,
		...rest
	}: ZDataTableProps<TRow, TRowKey> = $props();

	const zui = useZui();
	const componentDefaults = $derived(zui.componentDefaults.dataTable);
	const density = $derived(densityProp ?? componentDefaults?.density ?? 'comfortable');
	const overscan = $derived(overscanProp ?? componentDefaults?.overscan ?? 4);
	const rowHeight = $derived(rowHeightProp ?? componentDefaults?.rowHeight ?? 44);
	const selectionMode = $derived(selectionModeProp ?? componentDefaults?.selectionMode ?? 'none');
	const stickyHeader = $derived(stickyHeaderProp ?? componentDefaults?.stickyHeader);
	const striped = $derived(stripedProp ?? componentDefaults?.striped ?? false);
	const virtualized = $derived(virtualizedProp ?? componentDefaults?.virtualized ?? false);
	const uid = $props.id();
	const selectionName = $derived(`${zui.idPrefix}-${uid}-data-table-selection`);
	let selectAll = $state<HTMLInputElement | null>(null);
	let range = $state<KeyedVirtualRange<TRowKey> | null>(null);
	let mounted = false;
	let resizeObserver: ResizeObserver | undefined;
	let viewportWidth = -1;
	let focusedKey: TRowKey | undefined;
	let focusedTarget: DataTableRowFocusTarget = 'auto';
	let previousKeys: readonly TRowKey[] = [];
	let previousSortColumnId: string | undefined;
	let previousSortDirection: DataSortDescriptor['direction'] | undefined;
	let stopColumnResize: (() => void) | undefined;
	const rowElements = new Map<TRowKey, Set<HTMLTableRowElement>>();

	const normalizedColumns = $derived.by(() => {
		if (columns.length === 0) throw new Error('ZDataTable requires at least one column.');
		const ids = new Set<string>();
		return columns.map((column) => {
			if (!column.id || ids.has(column.id))
				throw new Error(`Duplicate or empty ZDataTable column id "${column.id}".`);
			ids.add(column.id);
			validateColumn(column);
			return column;
		});
	});
	const sourceCollection = $derived(
		new LogicalCollection<TRowKey, TRow>(
			rows,
			{
				disabled: () => false,
				key: rowKey,
				selectionDisabled: isRowDisabled,
				textValue: (row) => String(rowKey(row))
			},
			{ name: 'ZDataTable row' }
		)
	);

	const sortState = new ControllableState<DataSortDescriptor | undefined>({
		defaultValue: () => defaultSort,
		onChange: () => onSortChange,
		read: () => sort,
		undefinedIsValue: true,
		write: (next) => (sort = next)
	});
	const selectionState = new ControllableState<readonly TRowKey[]>({
		defaultValue: () => freezeKeys(defaultSelectedKeys),
		onChange: () => onSelectionChange,
		read: () => selectedKeys,
		write: (next) => (selectedKeys = next)
	});
	const expandedState = new ControllableState<readonly TRowKey[]>({
		defaultValue: () => freezeKeys(defaultExpandedKeys),
		onChange: () => onExpandedChange,
		read: () => expandedKeys,
		write: (next) => (expandedKeys = next)
	});
	const visibilityState = new ControllableState<DataTableColumnVisibility>({
		defaultValue: () => freezeRecord(defaultColumnVisibility),
		onChange: () => onColumnVisibilityChange,
		read: () => columnVisibility,
		write: (next) => (columnVisibility = next)
	});
	const widthsState = new ControllableState<DataTableColumnWidths>({
		defaultValue: () => freezeRecord(defaultColumnWidths),
		onChange: () => onColumnWidthsChange,
		read: () => columnWidths,
		write: (next) => (columnWidths = next)
	});

	const visibleColumns = $derived.by(() => {
		const visibility = visibilityState.current;
		const visible = normalizedColumns.filter(
			(column) => visibility[column.id] ?? !column.defaultHidden
		);
		if (visible.length === 0)
			throw new Error('ZDataTable requires at least one visible data column.');
		return visible;
	});
	const resolvedSort = $derived.by(() => {
		const descriptor = sortState.current;
		if (!descriptor) return undefined;
		if (descriptor.direction !== 'ascending' && descriptor.direction !== 'descending') {
			throw new TypeError('ZDataTable sort direction must be ascending or descending.');
		}
		const column = normalizedColumns.find(({ id }) => id === descriptor.columnId);
		if (!column?.sortable)
			throw new Error(
				`ZDataTable sort column "${descriptor.columnId}" is missing or not sortable.`
			);
		return { column, descriptor };
	});
	const orderedRows = $derived.by(() => {
		const source = sourceCollection.full.items.map(({ value }) => value);
		if (sortingMode !== 'client' && sortingMode !== 'server') {
			throw new TypeError('ZDataTable sortingMode must be client or server.');
		}
		if (!resolvedSort || sortingMode === 'server') return source;
		return stableSortRows(source, {
			accessor: resolvedSort.column.accessor,
			compare: resolvedSort.column.compare,
			direction: resolvedSort.descriptor.direction,
			locale: zui.locale
		});
	});
	const rowView = $derived(sourceCollection.view({ keys: orderedRows.map(rowKey) }));
	const keyedRows = $derived(
		rowView.items.map((item, index) => ({
			disabled: item.disabled || item.selectionDisabled,
			index,
			key: item.key,
			row: item.value
		}))
	);
	const selected = $derived.by(() => {
		const keys = freezeKeys(selectionState.current);
		if (!['multiple', 'none', 'single'].includes(selectionMode)) {
			throw new TypeError('ZDataTable selectionMode must be none, single or multiple.');
		}
		if (selectionMode === 'single' && keys.length > 1) {
			throw new Error('ZDataTable single selectionMode accepts at most one selected key.');
		}
		return selectionMode === 'none' ? new Set<TRowKey>() : new Set(keys);
	});
	const expanded = $derived(new Set(freezeKeys(expandedState.current)));
	const enabledKeys = $derived(keyedRows.filter(({ disabled }) => !disabled).map(({ key }) => key));
	const allSelected = $derived(
		enabledKeys.length > 0 && enabledKeys.every((key) => selected.has(key))
	);
	const someSelected = $derived(!allSelected && enabledKeys.some((key) => selected.has(key)));
	const selectionModel = new SelectionModel<TRowKey, TRow>({
		collection: () => sourceCollection,
		mode: () => selectionMode,
		orphanPolicy: () => 'preserve',
		read: () => new Set(selectionState.current),
		selectAllScope: () => 'view',
		view: () => rowView,
		write: ({ selection }) => selectionState.setFromUser(selectionToKeys(selection))
	});

	function estimateRow(key: TRowKey): number {
		const item = sourceCollection.get(key);
		return (
			rowHeight +
			(expandedRow && expanded.has(key) && item && isRowExpandable(item.value)
				? expandedRowEstimate
				: 0)
		);
	}
	const virtualizer = new KeyedVirtualizer<TRowKey>({
		estimateSize: untrack(() => (key: TRowKey) => estimateRow(key)),
		keys: untrack(() => keyedRows.map(({ key }) => key)),
		overscan: untrack(() => overscan),
		viewportSize: untrack(() => ssrViewportSize ?? height)
	});
	if (untrack(() => virtualized)) range = virtualizer.range;

	const renderedRows = $derived.by(() => {
		if (!virtualized || !range) return keyedRows.map((entry) => ({ entry, virtual: undefined }));
		return range.items.flatMap((virtual) => {
			const index = keyedRows.findIndex(({ key }) => Object.is(key, virtual.key));
			const entry = index >= 0 ? keyedRows[index] : undefined;
			return entry ? [{ entry: { ...entry, index }, virtual }] : [];
		});
	});
	const topSpace = $derived(virtualized && range?.items[0] ? range.items[0].start : 0);
	const bottomSpace = $derived.by(() => {
		if (!virtualized || !range || range.items.length === 0) return 0;
		return Math.max(0, range.totalSize - range.items[range.items.length - 1]!.end);
	});
	const expansionColumn = $derived(expandedRow !== undefined);
	const controlColumnCount = $derived(
		(selectionMode === 'none' ? 0 : 1) + (expansionColumn ? 1 : 0)
	);
	const columnCount = $derived(visibleColumns.length + controlColumnCount);
	const resolvedStickyHeader = $derived(stickyHeader ?? virtualized);
	const columnLayouts = $derived.by(() => createColumnLayouts(visibleColumns));
	const hasStartPin = $derived(columnLayouts.some(({ column }) => column.sticky === 'start'));
	const rootAriaRowCount = $derived.by(() => {
		if (!Number.isInteger(rowIndexOffset) || rowIndexOffset < 0)
			throw new TypeError('ZDataTable rowIndexOffset must be a non-negative integer.');
		const count = totalRowCount ?? rowIndexOffset + keyedRows.length;
		if (!Number.isInteger(count) || count < rowIndexOffset + keyedRows.length)
			throw new TypeError(
				'ZDataTable totalRowCount must cover rowIndexOffset and the current rows.'
			);
		return count + 1;
	});
	const errorMessage = $derived.by(() => {
		if (error === null) return null;
		if (typeof error !== 'string') {
			throw new TypeError('ZDataTable error must be a non-empty string or null.');
		}
		const message = error.trim();
		if (!message) throw new TypeError('ZDataTable error must be a non-empty string or null.');
		return message;
	});
	const viewportClass = $derived(
		zui.recipe(viewportRecipe, { stickyHeader: resolvedStickyHeader, virtualized })
	);
	const selectionClass = $derived(zui.recipe(selectionRecipe));
	const ellipsisClass = $derived(zui.recipe(ellipsisRecipe));
	const statusClass = $derived(zui.recipe(statusRecipe));
	const expandedClass = $derived(zui.recipe(expandedRecipe));
	const resizerClass = $derived(zui.recipe(resizerRecipe));
	const resizerLineClass = $derived(zui.recipe(resizerLineRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-data-table-height': `${height}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const tableStyle = $derived.by(() => {
		const numericWidth = columnLayouts.reduce(
			(sum, layout) => sum + (typeof layout.width === 'number' ? layout.width : 0),
			controlColumnCount * CONTROL_COLUMN_WIDTH
		);
		return numericWidth > 0 ? `min-width: ${numericWidth}px; table-layout: fixed;` : undefined;
	});

	const publicController: ZDataTableController<TRowKey> = {
		get range() {
			return virtualized ? range : null;
		},
		get visibleColumnIds() {
			return Object.freeze(visibleColumns.map(({ id }) => id));
		},
		focusRow,
		resetColumnWidths() {
			widthsState.setFromUser(freezeRecord(defaultColumnWidths));
		},
		scrollToRow,
		setColumnVisible(columnId, visible) {
			const column = normalizedColumns.find(({ id }) => id === columnId);
			if (!column) return false;
			if (!visible && visibleColumns.length === 1 && visibleColumns[0]?.id === columnId)
				return false;
			const current = visibilityState.current[columnId] ?? !column.defaultHidden;
			if (current === visible) return false;
			visibilityState.setFromUser(
				freezeRecord({ ...visibilityState.current, [columnId]: visible })
			);
			return true;
		}
	};

	$effect(() => {
		if (selectAll) selectAll.indeterminate = someSelected;
	});
	$effect(() => {
		controller = publicController;
		const publishedController = untrack(() => controller);
		return () => {
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});
	$effect(() => {
		const sortColumnId = resolvedSort?.descriptor.columnId;
		const sortDirection = resolvedSort?.descriptor.direction;
		const resetForSort =
			sortColumnId !== previousSortColumnId || sortDirection !== previousSortDirection;
		previousSortColumnId = sortColumnId;
		previousSortDirection = sortDirection;
		// Programmatic focus/measurement updates can move the viewport without
		// dispatching a scroll event. Capture the real DOM offset before the keyed
		// update so anchor restoration preserves the visible key and its offset.
		const domOffset = ref?.scrollTop;
		if (
			!resetForSort &&
			domOffset !== undefined &&
			Math.abs(domOffset - virtualizer.scrollOffset) > 0.5
		) {
			virtualizer.setScrollOffset(domOffset);
		}
		const previousOffset = virtualizer.scrollOffset;
		virtualizer.update({
			estimateSize: (key) => estimateRow(key),
			keys: keyedRows.map(({ key }) => key),
			overscan
		});
		if (resetForSort) {
			virtualizer.setScrollOffset(0);
			if (ref) ref.scrollTop = 0;
		}
		if (resizeObserver) {
			for (const elements of rowElements.values()) {
				for (const element of elements) {
					if (virtualized) resizeObserver.observe(element);
					else resizeObserver.unobserve(element);
				}
			}
		}
		if (!virtualized) {
			range = null;
			return;
		}
		validateVirtualOptions();
		virtualizer.setViewportSize(ref?.clientHeight || ssrViewportSize || height);
		publishRange();
		synchronizeScroll(previousOffset);
	});
	$effect(() => {
		const nextKeys = keyedRows.map(({ key }) => key);
		if (focusedKey !== undefined && !nextKeys.some((key) => Object.is(key, focusedKey))) {
			const previousIndex = previousKeys.findIndex((key) => Object.is(key, focusedKey));
			const fallback = nearestFocusableKey(nextKeys, previousIndex, focusedTarget);
			focusedKey = fallback;
			if (fallback !== undefined) void tick().then(() => focusRow(fallback, focusedTarget));
		}
		previousKeys = Object.freeze(nextKeys);
	});
	$effect(() => {
		void columnLayouts;
		void expandedState.current;
		if (!virtualized) return;
		const previousOffset = virtualizer.scrollOffset;
		if (virtualizer.clearMeasurements()) {
			publishRange();
			synchronizeScroll(previousOffset);
		}
	});

	function selectionToKeys(selection: Selection<TRowKey>): readonly TRowKey[] {
		if (selection === 'all') return Object.freeze(enabledKeys);
		return freezeKeys([...selection]);
	}

	function validateColumn(column: DataTableColumn<TRow>): void {
		if (column.minWidth !== undefined)
			positiveFinite(column.minWidth, `ZDataTable column "${column.id}" minWidth`);
		if (column.maxWidth !== undefined)
			positiveFinite(column.maxWidth, `ZDataTable column "${column.id}" maxWidth`);
		if (minimumWidth(column) > maximumWidth(column))
			throw new RangeError(`ZDataTable column "${column.id}" minWidth cannot exceed maxWidth.`);
		if (typeof column.width === 'number')
			positiveFinite(column.width, `ZDataTable column "${column.id}" width`);
		if (
			typeof column.width === 'number' &&
			(column.width < minimumWidth(column) || column.width > maximumWidth(column))
		) {
			throw new RangeError(
				`ZDataTable column "${column.id}" width must respect minWidth/maxWidth.`
			);
		}
		if (typeof column.width === 'string' && (!column.width.trim() || /[;{}]/u.test(column.width)))
			throw new TypeError(`ZDataTable column "${column.id}" width must be a safe CSS value.`);
		if ((column.resizable || column.sticky) && typeof column.width === 'string')
			throw new TypeError(
				`ZDataTable column "${column.id}" must use a numeric width when resizable or sticky.`
			);
	}

	function validateVirtualOptions(): void {
		positiveFinite(height, 'ZDataTable height');
		positiveFinite(rowHeight, 'ZDataTable rowHeight');
		positiveFinite(expandedRowEstimate, 'ZDataTable expandedRowEstimate');
		if (!Number.isInteger(overscan) || overscan < 0)
			throw new TypeError('ZDataTable overscan must be a non-negative integer.');
		if (ssrViewportSize !== undefined)
			positiveFinite(ssrViewportSize, 'ZDataTable ssrViewportSize');
	}

	function positiveFinite(value: number, name: string): number {
		if (!Number.isFinite(value) || value <= 0)
			throw new TypeError(`${name} must be positive and finite.`);
		return value;
	}

	interface ColumnLayout {
		readonly column: DataTableColumn<TRow>;
		readonly offset: number | undefined;
		readonly width: DataTableWidth | undefined;
	}

	function createColumnLayouts(source: readonly DataTableColumn<TRow>[]): readonly ColumnLayout[] {
		const widths = widthsState.current;
		for (const [id, width] of Object.entries(widths))
			positiveFinite(width, `ZDataTable columnWidths["${id}"]`);
		const layouts: {
			column: DataTableColumn<TRow>;
			offset: number | undefined;
			width: DataTableWidth | undefined;
		}[] = source.map((column) => ({ column, offset: undefined, width: effectiveWidth(column) }));
		let start = controlColumnCount * CONTROL_COLUMN_WIDTH;
		for (const layout of layouts) {
			if (layout.column.sticky !== 'start') continue;
			if (typeof layout.width !== 'number')
				throw new TypeError(
					`Sticky ZDataTable column "${layout.column.id}" requires a numeric width.`
				);
			layout.offset = start;
			start += layout.width;
		}
		let end = 0;
		for (let index = layouts.length - 1; index >= 0; index -= 1) {
			const layout = layouts[index]!;
			if (layout.column.sticky !== 'end') continue;
			if (typeof layout.width !== 'number')
				throw new TypeError(
					`Sticky ZDataTable column "${layout.column.id}" requires a numeric width.`
				);
			layout.offset = end;
			end += layout.width;
		}
		return layouts;
	}

	function effectiveWidth(column: DataTableColumn<TRow>): DataTableWidth | undefined {
		const controlled = widthsState.current[column.id];
		if (controlled !== undefined) {
			positiveFinite(controlled, `ZDataTable columnWidths["${column.id}"]`);
			if (controlled < minimumWidth(column) || controlled > maximumWidth(column)) {
				throw new RangeError(
					`ZDataTable columnWidths["${column.id}"] must respect minWidth/maxWidth.`
				);
			}
			return controlled;
		}
		if (column.width !== undefined)
			return typeof column.width === 'number'
				? clampWidth(column, column.width)
				: column.width.trim();
		return column.resizable || column.sticky
			? clampWidth(column, DEFAULT_RESIZABLE_WIDTH)
			: undefined;
	}

	function clampWidth(column: DataTableColumn<TRow>, width: number): number {
		return Math.min(maximumWidth(column), Math.max(minimumWidth(column), width));
	}

	function minimumWidth(column: DataTableColumn<TRow>): number {
		return column.minWidth ?? 64;
	}

	function maximumWidth(column: DataTableColumn<TRow>): number {
		return column.maxWidth ?? 1200;
	}

	function columnStyle(layout: ColumnLayout): string | undefined {
		const declarations: string[] = [];
		if (typeof layout.width === 'number')
			declarations.push(
				`width: ${layout.width}px`,
				`min-width: ${layout.width}px`,
				`max-width: ${layout.width}px`
			);
		else if (layout.width) declarations.push(`width: ${layout.width}`);
		if (layout.column.align) declarations.push(`text-align: ${layout.column.align}`);
		if (layout.column.sticky && layout.offset !== undefined)
			declarations.push(`inset-inline-${layout.column.sticky}: ${layout.offset}px`);
		return declarations.length > 0 ? `${declarations.join('; ')};` : undefined;
	}

	function controlStyle(index: number, header: boolean): string | undefined {
		if (!hasStartPin)
			return `width: ${CONTROL_COLUMN_WIDTH}px; min-width: ${CONTROL_COLUMN_WIDTH}px;`;
		return `width: ${CONTROL_COLUMN_WIDTH}px; min-width: ${CONTROL_COLUMN_WIDTH}px; inset-inline-start: ${index * CONTROL_COLUMN_WIDTH}px; z-index: ${header ? 4 : 2};`;
	}

	function stickyClass(
		column: DataTableColumn<TRow> | undefined,
		rowSelected = false
	): string | undefined {
		return column?.sticky || (column === undefined && hasStartPin)
			? zui.recipe(stickyCellRecipe, { selected: rowSelected })
			: undefined;
	}

	function toggleSort(column: DataTableColumn<TRow>): void {
		if (!column.sortable) return;
		sortState.setFromUser(nextDataSortDescriptor(sortState.current, column.id));
		resetScroll();
	}

	function toggleRow(key: TRowKey, disabled: boolean): void {
		if (disabled || selectionMode === 'none') return;
		selectionModel.toggle(key);
	}

	function toggleAll(): void {
		if (selectionMode !== 'multiple') return;
		const current = new Set(selectionState.current);
		if (allSelected) for (const key of enabledKeys) current.delete(key);
		else for (const key of enabledKeys) current.add(key);
		selectionState.setFromUser(freezeKeys([...current]));
	}

	function toggleExpanded(key: TRowKey, row: TRow): void {
		if (!expandedRow || !isRowExpandable(row)) return;
		const current = new Set(expandedState.current);
		if (current.has(key)) current.delete(key);
		else current.add(key);
		const previousOffset = virtualizer.scrollOffset;
		virtualizer.clearMeasurements([key]);
		expandedState.setFromUser(freezeKeys([...current]));
		if (virtualized)
			void tick().then(() => {
				measureRows([key]);
				publishRange();
				synchronizeScroll(previousOffset);
			});
	}

	function resetScroll(): void {
		virtualizer.setScrollOffset(0);
		if (ref) ref.scrollTop = 0;
		if (virtualized) publishRange();
	}

	function publishRange(): void {
		const next = virtualizer.range;
		if (
			!range ||
			range.startIndex !== next.startIndex ||
			range.endIndex !== next.endIndex ||
			range.totalSize !== next.totalSize ||
			range.items.length !== next.items.length ||
			range.items.some((item, index) => {
				const candidate = next.items[index];
				return (
					!candidate ||
					!Object.is(item.key, candidate.key) ||
					item.start !== candidate.start ||
					item.size !== candidate.size
				);
			})
		)
			range = next;
	}

	function synchronizeScroll(previousOffset: number): void {
		if (
			mounted &&
			ref &&
			Math.abs(previousOffset - virtualizer.scrollOffset) > 0.5 &&
			Math.abs(ref.scrollTop - virtualizer.scrollOffset) > 0.5
		)
			ref.scrollTop = virtualizer.scrollOffset;
	}

	function scrollToRow(key: TRowKey, align: VirtualAlign = 'nearest'): boolean {
		if (virtualizer.indexOf(key) < 0) return false;
		if (!virtualized) {
			rowElements
				.get(key)
				?.values()
				.next()
				.value?.scrollIntoView({
					block:
						align === 'center'
							? 'center'
							: align === 'end'
								? 'end'
								: align === 'start'
									? 'start'
									: 'nearest'
				});
			return true;
		}
		const previousOffset = virtualizer.scrollOffset;
		virtualizer.scrollToKey(key, align);
		publishRange();
		synchronizeScroll(previousOffset);
		return true;
	}

	function focusRow(key: TRowKey, target: DataTableRowFocusTarget = 'auto'): boolean {
		if (!canFocusRow(key, target)) return false;
		if (!scrollToRow(key)) return false;
		void tick().then(() => {
			const rowsForKey = rowElements.get(key);
			if (!rowsForKey) return;
			for (const row of rowsForKey) {
				const selector =
					target === 'auto'
						? '[data-row-focus]:not([disabled])'
						: `[data-row-focus="${target}"]:not([disabled])`;
				const focusable =
					row.querySelector<HTMLElement>(selector) ??
					row.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled])');
				if (focusable) {
					focusable.focus();
					return;
				}
			}
		});
		return true;
	}

	function canFocusRow(key: TRowKey, target: DataTableRowFocusTarget): boolean {
		const item = sourceCollection.get(key);
		if (!item) return false;
		const canSelect = selectionMode !== 'none' && !item.disabled && !item.selectionDisabled;
		const canExpand = Boolean(expandedRow && isRowExpandable(item.value));
		return target === 'selection'
			? canSelect
			: target === 'expand'
				? canExpand
				: canSelect || canExpand;
	}

	function nearestFocusableKey(
		keys: readonly TRowKey[],
		previousIndex: number,
		target: DataTableRowFocusTarget
	): TRowKey | undefined {
		if (keys.length === 0) return undefined;
		const start = Math.min(Math.max(0, previousIndex), keys.length - 1);
		for (let distance = 0; distance < keys.length; distance += 1) {
			const after = keys[start + distance];
			if (after !== undefined && canFocusRow(after, target)) return after;
			const before = keys[start - distance - 1];
			if (before !== undefined && canFocusRow(before, target)) return before;
		}
		return undefined;
	}

	function handleFocus(
		key: TRowKey,
		event: FocusEvent & { currentTarget: HTMLTableRowElement }
	): void {
		focusedKey = key;
		const view = event.currentTarget.ownerDocument.defaultView;
		const target =
			view && event.target instanceof view.HTMLElement ? event.target.dataset.rowFocus : undefined;
		focusedTarget = target === 'selection' || target === 'expand' ? target : 'auto';
	}

	function handleScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }): void {
		onscroll?.(event);
		if (!virtualized) return;
		virtualizer.setScrollOffset(event.currentTarget.scrollTop);
		publishRange();
	}

	function setColumnWidth(column: DataTableColumn<TRow>, width: number): void {
		const next = clampWidth(column, width);
		if (widthsState.current[column.id] === next) return;
		widthsState.setFromUser(freezeRecord({ ...widthsState.current, [column.id]: next }));
	}

	function beginResize(
		event: PointerEvent & { currentTarget: HTMLElement },
		column: DataTableColumn<TRow>
	): void {
		if (event.button !== 0) return;
		event.preventDefault();
		stopColumnResize?.();
		const ownerDocument = event.currentTarget.ownerDocument;
		const view = ownerDocument.defaultView;
		if (!view) return;
		const startX = event.clientX;
		const header = event.currentTarget.closest('th');
		const resolved = effectiveWidth(column);
		const startWidth =
			typeof resolved === 'number'
				? resolved
				: (header?.getBoundingClientRect().width ?? DEFAULT_RESIZABLE_WIDTH);
		const direction =
			view.getComputedStyle(ref ?? event.currentTarget).direction === 'rtl' ? -1 : 1;
		const move = (moveEvent: PointerEvent): void =>
			setColumnWidth(column, startWidth + (moveEvent.clientX - startX) * direction);
		const end = (): void => {
			ownerDocument.removeEventListener('pointermove', move);
			ownerDocument.removeEventListener('pointerup', end);
			ownerDocument.removeEventListener('pointercancel', end);
			if (stopColumnResize === end) stopColumnResize = undefined;
		};
		stopColumnResize = end;
		ownerDocument.addEventListener('pointermove', move);
		ownerDocument.addEventListener('pointerup', end, { once: true });
		ownerDocument.addEventListener('pointercancel', end, { once: true });
	}

	function resizeWithKeyboard(
		event: KeyboardEvent & { currentTarget: HTMLElement },
		column: DataTableColumn<TRow>
	): void {
		const resolved = effectiveWidth(column);
		const width = typeof resolved === 'number' ? resolved : DEFAULT_RESIZABLE_WIDTH;
		const step = event.shiftKey ? 24 : 8;
		const view = event.currentTarget.ownerDocument.defaultView;
		const rtl = view?.getComputedStyle(event.currentTarget).direction === 'rtl';
		let next: number;
		switch (event.key) {
			case 'ArrowLeft':
				next = width + (rtl ? step : -step);
				break;
			case 'ArrowRight':
				next = width + (rtl ? -step : step);
				break;
			case 'Home':
				next = minimumWidth(column);
				break;
			case 'End':
				next = maximumWidth(column);
				break;
			default:
				return;
		}
		event.preventDefault();
		setColumnWidth(column, next);
	}

	interface RowMountOptions {
		readonly key: TRowKey;
	}
	function mountRow(element: HTMLTableRowElement, options: RowMountOptions) {
		let current = options;
		addRowElement(current.key, element);
		if (virtualized) resizeObserver?.observe(element);
		return {
			destroy() {
				resizeObserver?.unobserve(element);
				removeRowElement(current.key, element);
			},
			update(next: RowMountOptions) {
				if (Object.is(current.key, next.key)) return;
				removeRowElement(current.key, element);
				current = next;
				addRowElement(current.key, element);
			}
		};
	}

	function addRowElement(key: TRowKey, element: HTMLTableRowElement): void {
		const elements = rowElements.get(key) ?? new Set<HTMLTableRowElement>();
		elements.add(element);
		rowElements.set(key, elements);
	}

	function removeRowElement(key: TRowKey, element: HTMLTableRowElement): void {
		const elements = rowElements.get(key);
		if (!elements) return;
		elements.delete(element);
		if (elements.size === 0) rowElements.delete(key);
	}

	function measureRows(keys: readonly TRowKey[]): void {
		if (!virtualized) return;
		const measurements: VirtualMeasurement<TRowKey>[] = [];
		for (const key of keys) {
			const elements = rowElements.get(key);
			if (!elements) continue;
			let size = 0;
			for (const element of elements) size += element.getBoundingClientRect().height;
			if (Number.isFinite(size) && size > 0) measurements.push({ key, size });
		}
		virtualizer.measure(measurements);
	}

	onMount(() => {
		mounted = true;
		if (!ref) return;
		const ownerDocument = ref.ownerDocument;
		const view = ownerDocument.defaultView;
		if (!view) return;
		const ResizeObserverConstructor = view.ResizeObserver;
		const fallback = (): void => {
			if (!ref || !virtualized) return;
			const previousOffset = virtualizer.scrollOffset;
			if (Math.abs(viewportWidth - ref.clientWidth) > 0.5) {
				viewportWidth = ref.clientWidth;
				virtualizer.clearMeasurements();
			}
			virtualizer.setViewportSize(ref.clientHeight || height);
			measureRows([...rowElements.keys()]);
			publishRange();
			synchronizeScroll(previousOffset);
		};
		if (ResizeObserverConstructor) {
			resizeObserver = new ResizeObserverConstructor((entries) => {
				if (!virtualized || !ref) return;
				const keys = new Set<TRowKey>();
				const previousOffset = virtualizer.scrollOffset;
				for (const entry of entries) {
					if (entry.target === ref) {
						if (Math.abs(viewportWidth - ref.clientWidth) > 0.5) {
							viewportWidth = ref.clientWidth;
							virtualizer.clearMeasurements();
						}
						virtualizer.setViewportSize(ref.clientHeight || height);
						continue;
					}
					for (const [key, elements] of rowElements)
						if (elements.has(entry.target as HTMLTableRowElement)) keys.add(key);
				}
				measureRows([...keys]);
				publishRange();
				synchronizeScroll(previousOffset);
			});
			resizeObserver.observe(ref);
			for (const elements of rowElements.values())
				for (const element of elements) resizeObserver.observe(element);
		} else view.addEventListener('resize', fallback);
		viewportWidth = ref.clientWidth;
		if (virtualized) {
			virtualizer.setViewportSize(ref.clientHeight || height);
			measureRows([...rowElements.keys()]);
			publishRange();
		}
		const refresh = (): void => {
			if (!mounted || !virtualized) return;
			const previousOffset = virtualizer.scrollOffset;
			virtualizer.clearMeasurements();
			measureRows([...rowElements.keys()]);
			publishRange();
			synchronizeScroll(previousOffset);
		};
		ownerDocument.fonts?.addEventListener('loadingdone', refresh);
		ownerDocument.fonts?.addEventListener('loadingerror', refresh);
		void ownerDocument.fonts?.ready.then(refresh);
		return () => {
			mounted = false;
			stopColumnResize?.();
			resizeObserver?.disconnect();
			resizeObserver = undefined;
			view.removeEventListener('resize', fallback);
			ownerDocument.fonts?.removeEventListener('loadingdone', refresh);
			ownerDocument.fonts?.removeEventListener('loadingerror', refresh);
			rowElements.clear();
		};
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[viewportClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-busy={(loading && !errorMessage) || undefined}
	data-slot="viewport"
	data-virtualized={virtualized || undefined}
	data-range-start={range?.startIndex}
	data-range-end={range?.endIndex}
	onscroll={handleScroll}
>
	{#if errorMessage}
		<div class={statusClass} data-slot="status">
			{#if errorContent}{@render errorContent(errorMessage)}{:else}<ZAlert
					live="assertive"
					title={errorMessage}
					tone="danger"
				/>{/if}
		</div>
	{:else if loading}
		<div class={statusClass} data-slot="status" role="status" aria-label={loadingLabel}>
			{#if loadingContent}{@render loadingContent()}{:else}<ZSpinner
					aria-hidden="true"
					label={loadingLabel}
					size="small"
				/><ZVisuallyHidden>{loadingLabel}</ZVisuallyHidden>{/if}
		</div>
	{/if}
	<ZTable
		{caption}
		captionHidden
		{density}
		{striped}
		aria-rowcount={rootAriaRowCount}
		class="zui-data-table"
		data-slot="table"
		scroll="none"
		style={tableStyle}
	>
		{#snippet header()}
			<tr>
				{#if expansionColumn}
					<th class={stickyClass(undefined)} scope="col" style={controlStyle(0, true)}
						><ZVisuallyHidden>{expansionColumnLabel}</ZVisuallyHidden></th
					>
				{/if}
				{#if selectionMode !== 'none'}
					<th
						class={stickyClass(undefined)}
						scope="col"
						style={controlStyle(expansionColumn ? 1 : 0, true)}
					>
						<ZVisuallyHidden>{selectionColumnLabel}</ZVisuallyHidden>
						{#if selectionMode === 'multiple'}<input
								bind:this={selectAll}
								class={selectionClass}
								id={`${selectionName}-all`}
								type="checkbox"
								aria-label={selectAllLabel}
								checked={allSelected}
								onchange={toggleAll}
							/>{/if}
					</th>
				{/if}
				{#each columnLayouts as layout (layout.column.id)}
					<th
						class={stickyClass(layout.column)}
						scope="col"
						aria-sort={sortState.current?.columnId === layout.column.id
							? sortState.current.direction
							: undefined}
						data-column-id={layout.column.id}
						data-sticky={layout.column.sticky}
						style={columnStyle(layout)}
					>
						{#if layout.column.sortable}
							<ZButton
								type="button"
								size="small"
								variant="ghost"
								onclick={() => toggleSort(layout.column)}
							>
								{layout.column.header}
								{#if sortState.current?.columnId === layout.column.id}
									{#if sortState.current.direction === 'ascending'}<ArrowUp
											aria-hidden="true"
											size={16}
										/>{:else}<ArrowDown aria-hidden="true" size={16} />{/if}
								{:else}<ArrowUpDown aria-hidden="true" size={16} />{/if}
							</ZButton>
						{:else}{layout.column.header}{/if}
						{#if layout.column.resizable}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex (ARIA separator is a focusable value widget) -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions (pointer and keyboard resize the separator value) -->
							<div
								class={resizerClass}
								data-slot="column-resizer"
								role="separator"
								tabindex="0"
								aria-label={resizeLabel(layout.column)}
								aria-orientation="vertical"
								aria-valuemin={minimumWidth(layout.column)}
								aria-valuemax={maximumWidth(layout.column)}
								aria-valuenow={typeof layout.width === 'number'
									? layout.width
									: DEFAULT_RESIZABLE_WIDTH}
								onpointerdown={(event) => beginResize(event, layout.column)}
								onkeydown={(event) => resizeWithKeyboard(event, layout.column)}
							>
								<span class={resizerLineClass} aria-hidden="true"></span>
							</div>
						{/if}
					</th>
				{/each}
			</tr>
		{/snippet}

		{#if topSpace > 0}<tr aria-hidden="true"
				><td colspan={columnCount} style={`height: ${topSpace}px; padding: 0; border: 0;`}></td></tr
			>{/if}
		{#each renderedRows as rendered (rendered.entry.key)}
			{@const entry = rendered.entry}
			{@const rowSelected = selected.has(entry.key)}
			{@const rowExpanded =
				expanded.has(entry.key) && expansionColumn && isRowExpandable(entry.row)}
			<tr
				class={zui.recipe(rowRecipe, { selected: rowSelected })}
				data-slot="row"
				data-key={String(entry.key)}
				data-selected={rowSelected || undefined}
				data-expanded={rowExpanded || undefined}
				aria-rowindex={rowIndexOffset + entry.index + 2}
				style={virtualized ? `height: ${rowHeight}px` : undefined}
				use:mountRow={{ key: entry.key }}
				onfocusin={(event) => handleFocus(entry.key, event)}
			>
				{#if expansionColumn}
					<td class={stickyClass(undefined, rowSelected)} style={controlStyle(0, false)}>
						{#if isRowExpandable(entry.row)}
							<ZButton
								aria-controls={`${selectionName}-details-${entry.index}`}
								aria-expanded={rowExpanded}
								aria-label={expansionLabel(entry.row, rowExpanded)}
								data-row-focus="expand"
								id={`${selectionName}-expand-${entry.index}`}
								size="small"
								variant="ghost"
								onclick={() => toggleExpanded(entry.key, entry.row)}
								>{#if rowExpanded}<ChevronDown aria-hidden="true" size={16} />{:else}<ChevronRight
										aria-hidden="true"
										size={16}
									/>{/if}</ZButton
							>
						{/if}
					</td>
				{/if}
				{#if selectionMode !== 'none'}
					<td
						class={stickyClass(undefined, rowSelected)}
						style={controlStyle(expansionColumn ? 1 : 0, false)}
					>
						<input
							class={selectionClass}
							data-row-focus="selection"
							id={`${selectionName}-row-${entry.index}`}
							type={selectionMode === 'single' ? 'radio' : 'checkbox'}
							name={selectionMode === 'single' ? selectionName : undefined}
							aria-label={selectionLabel(entry.row, entry.index)}
							disabled={entry.disabled}
							checked={rowSelected}
							onchange={() => toggleRow(entry.key, entry.disabled)}
						/>
					</td>
				{/if}
				{#each columnLayouts as layout (layout.column.id)}
					{@const value = layout.column.accessor(entry.row)}
					<td
						class={stickyClass(layout.column, rowSelected)}
						data-slot="cell"
						data-column-id={layout.column.id}
						data-sticky={layout.column.sticky}
						style={columnStyle(layout)}
					>
						{#if layout.column.cell}{@render layout.column.cell(
								entry.row,
								value,
								entry.index
							)}{:else if layout.column.ellipsis}<span class={ellipsisClass}
								>{String(value ?? '')}</span
							>{:else}{String(value ?? '')}{/if}
					</td>
				{/each}
			</tr>
			{#if rowExpanded}
				<tr class={expandedClass} data-slot="expanded-row" use:mountRow={{ key: entry.key }}
					><td colspan={columnCount}
						><div
							id={`${selectionName}-details-${entry.index}`}
							role="region"
							aria-labelledby={`${selectionName}-expand-${entry.index}`}
						>
							{@render expandedRow!(entry.row, entry.index)}
						</div></td
					></tr
				>
			{/if}
		{/each}
		{#if bottomSpace > 0}<tr aria-hidden="true"
				><td colspan={columnCount} style={`height: ${bottomSpace}px; padding: 0; border: 0;`}
				></td></tr
			>{/if}
		{#if keyedRows.length === 0 && !loading && !errorMessage}
			<tr data-slot="empty"
				><td colspan={columnCount}
					>{#if empty}{@render empty()}{:else}<ZEmpty
							title={emptyLabel}
							headingLevel={3}
						/>{/if}</td
				></tr
			>
		{/if}
	</ZTable>
</div>
