<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { assertSelectionKey, type SelectionKey } from '../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import {
		adjacentResizableRange,
		allocateResizableLengths,
		encodeResizableLength,
		parseResizableLength,
		resizeAdjacentPair,
		resolveResizableLength,
		type ResizableAllocation,
		type ResizableBounds,
		type ResizableLength
	} from '../../runtime/resize.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export type ZSplitterSize = ResizableLength;
	export type ZSplitterOrientation = 'horizontal' | 'vertical';
	export type ZSplitterResizeSource = 'collapse' | 'keyboard' | 'pointer';
	export type ZSplitterCancelReason =
		| 'external-update'
		| 'geometry-change'
		| 'lost-capture'
		| 'owner-change'
		| 'pointer-cancel'
		| 'unmount';

	export interface ZSplitterPanel<TKey extends SelectionKey = SelectionKey> {
		readonly key: TKey;
		readonly label: string;
		readonly min?: ZSplitterSize;
		readonly max?: ZSplitterSize;
		readonly collapsible?: boolean;
		readonly collapsedSize?: ZSplitterSize;
		readonly resizable?: boolean;
	}

	export interface ZSplitterResizeDetail {
		readonly handleIndex: number;
		readonly percentages: readonly number[];
		readonly pixels: readonly number[];
		readonly sizes: readonly ZSplitterSize[];
		readonly source: ZSplitterResizeSource;
	}

	export interface ZSplitterCancelDetail extends ZSplitterResizeDetail {
		readonly reason: ZSplitterCancelReason;
	}

	export interface ZSplitterProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onresize'
	> {
		readonly panels: readonly ZSplitterPanel<TKey>[];
		readonly panel: Snippet<[panel: ZSplitterPanel<TKey>, index: number]>;
		readonly defaultSizes?: readonly ZSplitterSize[];
		sizes?: readonly ZSplitterSize[];
		readonly orientation?: ZSplitterOrientation;
		readonly size?: ZControlSize;
		readonly step?: number;
		readonly shiftStep?: number;
		readonly disabled?: boolean;
		readonly onSizesChange?: (sizes: readonly ZSplitterSize[]) => void;
		readonly onResizeStart?: (detail: ZSplitterResizeDetail) => void;
		readonly onResize?: (detail: ZSplitterResizeDetail) => void;
		readonly onResizeEnd?: (detail: ZSplitterResizeDetail) => void;
		readonly onResizeCancel?: (detail: ZSplitterCancelDetail) => void;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实Splitter根节点。' },
			{
				name: 'sizes',
				type: 'readonly ZSplitterSize[] | undefined',
				description: '按当前panels顺序的受控/可绑定尺寸；交互写回时保持每项声明单位。'
			}
		],
		category: 'layout',
		dependencies: ['owner Window ResizeObserver', 'Pointer Events', 'Svelte attachment'],
		events: [
			{
				name: 'onSizesChange',
				type: '(sizes: readonly ZSplitterSize[]) => void',
				description: '仅用户拖动、键盘或折叠改变尺寸时调用；快照冻结且可直接受控回传。'
			},
			{
				name: 'onResizeStart',
				type: '(detail: ZSplitterResizeDetail) => void',
				description: '一次交互开始；detail含保留单位尺寸、实际像素和标准化百分比的冻结快照。'
			},
			{
				name: 'onResize',
				type: '(detail: ZSplitterResizeDetail) => void',
				description: '实际相邻面板几何改变时调用。'
			},
			{
				name: 'onResizeEnd',
				type: '(detail: ZSplitterResizeDetail) => void',
				description: 'pointerup或一个离散键盘/折叠操作完成。'
			},
			{
				name: 'onResizeCancel',
				type: '(detail: ZSplitterCancelDetail) => void',
				description: 'pointercancel、capture丢失、外部受控/owner/几何变化或卸载终止活动拖动。'
			}
		],
		id: 'splitter',
		importStatement: "import { ZSplitter } from '@zadmin/zui';",
		keyboard: [
			{ key: 'ArrowLeft / ArrowRight', description: '水平布局按视觉方向移动separator。' },
			{ key: 'ArrowUp / ArrowDown', description: '垂直布局按视觉方向移动separator。' },
			{ key: 'Shift + Arrow', description: '使用shiftStep进行较大调整。' },
			{ key: 'Home / End', description: '把前一面板移动到当前相邻约束的最小/最大位置。' },
			{ key: 'Enter', description: '折叠或恢复相邻的collapsible面板，优先前一主面板。' }
		],
		name: 'ZSplitter',
		parts: [
			{ name: 'panel', description: '稳定key的命名region；保留内容DOM，可嵌套ZSplitter。' },
			{ name: 'handle', description: '可聚焦ARIA separator和pointer触摸目标。' },
			{ name: 'line', description: 'handle中央的主题化可见分隔线。' },
			{ name: 'grip', description: '五档control size对应的主题化拖动指示。' }
		],
		props: [
			{
				name: 'panels',
				type: 'readonly ZSplitterPanel<TKey>[]',
				default: '必填',
				required: true,
				description: '至少两个面板配置；key唯一稳定，label同时命名region和其后separator。',
				members: [
					{ name: 'key', type: 'TKey', required: true, description: '唯一string/number身份。' },
					{ name: 'label', type: 'string', required: true, description: '非空可见语义名称。' },
					{ name: 'min', type: 'ZSplitterSize', default: '0', description: '最小尺寸。' },
					{ name: 'max', type: 'ZSplitterSize', default: '无上限', description: '最大尺寸。' },
					{
						name: 'collapsible',
						type: 'boolean',
						default: 'false',
						description: '允许越过min折叠及Enter切换。'
					},
					{
						name: 'collapsedSize',
						type: 'ZSplitterSize',
						default: '0',
						description: '折叠后的尺寸，可与正常尺寸使用不同单位。'
					},
					{
						name: 'resizable',
						type: 'boolean',
						default: 'true',
						description: 'false禁用该面板两侧的调整。'
					}
				]
			},
			{
				name: 'defaultSizes',
				type: 'readonly ZSplitterSize[]',
				default: '等分number百分比',
				description: '仅初始化/显式reset基线；顺序和数量必须匹配panels。'
			},
			{
				name: 'sizes',
				type: 'readonly ZSplitterSize[]',
				default: 'defaultSizes',
				bindable: true,
				description: '数字和%是弹性百分比；px/rem固定，交互后仍以原单位写回。'
			},
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: "'horizontal'",
				description: '面板排列轴；horizontal产生垂直ARIA separator。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider density',
				description: '五档handle触摸目标与grip尺寸。'
			},
			{ name: 'step', type: 'number', default: '1', description: '方向键每次移动的容器百分比点。' },
			{
				name: 'shiftStep',
				type: 'number',
				default: '10',
				description: 'Shift+方向键每次移动的容器百分比点。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '禁用全部pointer与键盘调整，面板内容仍可访问。'
			},
			{
				name: 'onSizesChange',
				type: '(sizes: readonly ZSplitterSize[]) => void',
				default: '—',
				description: '用户变化回调；持久化由调用方拥有。'
			},
			{
				name: 'onResizeStart',
				type: '(detail: ZSplitterResizeDetail) => void',
				default: '—',
				description: '调整开始回调。'
			},
			{
				name: 'onResize',
				type: '(detail: ZSplitterResizeDetail) => void',
				default: '—',
				description: '调整变化回调。'
			},
			{
				name: 'onResizeEnd',
				type: '(detail: ZSplitterResizeDetail) => void',
				default: '—',
				description: '调整完成回调。'
			},
			{
				name: 'onResizeCancel',
				type: '(detail: ZSplitterCancelDetail) => void',
				default: '—',
				description: '调整取消回调。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: 'Splitter根引用。'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'panel',
				type: 'Snippet<[ZSplitterPanel<TKey>, number]>',
				required: true,
				description: '按配置和原始index渲染每个面板内容；可直接嵌套另一个ZSplitter。'
			}
		],
		source: 'ui/zui/src/components/layout/ZSplitter.svelte',
		states: [
			{
				name: 'data-measured',
				values: ['true', 'false'],
				description: '是否已有owner Window真实content-box几何；false时separator不发布数值。'
			},
			{ name: 'data-orientation', values: ['horizontal', 'vertical'], description: '面板排列轴。' },
			{ name: 'data-resizing', values: ['true'], description: '当前有活动pointer拖动。' },
			{
				name: 'data-constrained',
				values: ['true'],
				description: '容器小于min总和或大于有限max总和。'
			},
			{ name: 'data-collapsed', values: ['true'], description: 'panel处于其collapsedSize。' },
			{ name: 'data-disabled', values: ['true'], description: 'handle不可交互。' }
		],
		status: 'experimental',
		summary:
			'以真实容器几何分配混合单位面板，提供受控尺寸、折叠恢复、完整pointer/键盘生命周期和ARIA separator。'
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'panel', 'handle', 'line', 'grip'] as const,
			variants: {
				orientation: {
					horizontal: {
						root: (s) => s.flexDirection.row,
						handle: (s) => {
							s.inlineSize.raw('var(--zui-splitter-handle-size)');
							s.blockSize.percent(100);
							s.cursor.raw('col-resize');
						},
						line: (s) => {
							s.inlineSize.raw('var(--zui-splitter-line-size)');
							s.blockSize.percent(100);
							s.insetBlockStart.px(0);
							s.insetInlineStart.percent(50);
							s.transform.raw('translateX(-50%)');
						},
						grip: (s) => {
							s.inlineSize._medium;
							s.blockSize.raw('calc(var(--zui-splitter-handle-size) / 2)');
						}
					},
					vertical: {
						root: (s) => s.flexDirection.column,
						handle: (s) => {
							s.blockSize.raw('var(--zui-splitter-handle-size)');
							s.inlineSize.percent(100);
							s.cursor.raw('row-resize');
						},
						line: (s) => {
							s.blockSize.raw('var(--zui-splitter-line-size)');
							s.inlineSize.percent(100);
							s.insetBlockStart.percent(50);
							s.insetInlineStart.px(0);
							s.transform.raw('translateY(-50%)');
						},
						grip: (s) => {
							s.blockSize._medium;
							s.inlineSize.raw('calc(var(--zui-splitter-handle-size) / 2)');
						}
					}
				}
			},
			base: {
				root: (s) => {
					s.display.flex;
					s.position.relative;
					s.boxSizing.borderBox;
					s.minInlineSize.px(0);
					s.minBlockSize.px(0);
					s.overflow.hidden;
				},
				panel: (s) => {
					s.position.relative;
					s.boxSizing.borderBox;
					s.minInlineSize.px(0);
					s.minBlockSize.px(0);
					s.overflow.auto;
				},
				handle: (s) => {
					s.position.relative;
					s.display.flex;
					s.alignItems.center;
					s.justifyContent.center;
					s.flex.raw('0 0 auto');
					s.padding.px(0);
					s.borderWidth.px(0);
					s.backgroundColor.transparent;
					s.touchAction.none;
					s.userSelect.none;
					s._focusVisible((s) => {
						s.outlineColor._focus;
						s.outlineOffset._inner;
						s.outlineStyle.solid;
						s.outlineWidth._medium;
					});
					s._hover((s) => s._selector('& > [data-slot="line"]', (s) => s.backgroundColor._primary));
				},
				line: (s) => {
					s.position.absolute;
					s.backgroundColor._border;
					s.pointerEvents.none;
				},
				grip: (s) => {
					s.position.relative;
					s.backgroundColor._surface;
					s.borderColor._border;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.borderRadius._small;
					s.pointerEvents.none;
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { onDestroy, tick, untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';

	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		controlSizeMetrics,
		controlSizes,
		resolveControlSize
	} from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { containsComposedNode, getActiveElement } from '../../runtime/layer/dom-realm.js';
	import { cssLength } from '../../theme/units.js';

	const generatedId = $props.id();
	let {
		panels,
		panel,
		defaultSizes,
		sizes = $bindable(),
		orientation = 'horizontal',
		size,
		step = 1,
		shiftStep = 10,
		disabled = false,
		onSizesChange,
		onResizeStart,
		onResize,
		onResizeEnd,
		onResizeCancel,
		ref = $bindable(null),
		id,
		class: className,
		dir,
		style,
		...rest
	}: ZSplitterProps<TKey> = $props();
	const zui = useZui();
	const attachmentKey = createAttachmentKey();
	const rootId = $derived(id ?? generatedId);
	const resolvedOrientation = $derived.by((): ZSplitterOrientation => {
		if (orientation !== 'horizontal' && orientation !== 'vertical')
			throw new TypeError('ZSplitter orientation must be horizontal or vertical.');
		return orientation;
	});
	const resolvedSize = $derived.by(() => {
		const value = resolveControlSize(size ?? zui.componentDefaults.splitter?.size, zui.density);
		if (!controlSizes.includes(value))
			throw new TypeError('ZSplitter size must be a control size.');
		return value;
	});
	const entries = $derived.by(() => {
		if (panels.length < 2) throw new TypeError('ZSplitter requires at least two panels.');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Per-projection key validation, not a reactive collection.
		const keys = new Set<TKey>();
		for (const [index, entry] of panels.entries()) {
			assertSelectionKey(entry.key, `ZSplitter panels[${index}]`);
			if (keys.has(entry.key)) throw new TypeError('ZSplitter requires unique panel keys.');
			keys.add(entry.key);
			if (entry.label.trim().length === 0)
				throw new TypeError(`ZSplitter panels[${index}].label must not be empty.`);
			if (entry.collapsedSize !== undefined && !entry.collapsible)
				throw new TypeError(`ZSplitter panels[${index}].collapsedSize requires collapsible.`);
			const minimum =
				entry.min === undefined
					? undefined
					: parseResizableLength(entry.min, `panels[${index}].min`);
			const maximum =
				entry.max === undefined
					? undefined
					: parseResizableLength(entry.max, `panels[${index}].max`);
			const sameDimension =
				minimum &&
				maximum &&
				(minimum.unit === maximum.unit ||
					(minimum.unit.startsWith('percent') && maximum.unit.startsWith('percent')));
			if (sameDimension && minimum.value > maximum.value)
				throw new TypeError(`ZSplitter panels[${index}].min cannot exceed max.`);
			if (entry.collapsedSize !== undefined)
				parseResizableLength(entry.collapsedSize, `panels[${index}].collapsedSize`);
		}
		return panels;
	});
	function equalSizes(count: number): readonly ZSplitterSize[] {
		return Object.freeze(Array.from({ length: count }, () => 100 / count));
	}
	function validateSizes(
		value: readonly ZSplitterSize[] | undefined,
		name: string,
		count: number
	): readonly ZSplitterSize[] | undefined {
		if (value === undefined) return undefined;
		if (value.length !== count) throw new TypeError(`ZSplitter ${name} must match panels length.`);
		value.forEach((entry, index) => parseResizableLength(entry, `${name}[${index}]`));
		return value;
	}
	const resetBaseline = $derived(
		validateSizes(defaultSizes, 'defaultSizes', entries.length) ?? equalSizes(entries.length)
	);
	let internalKeys = $state.raw<readonly TKey[]>([]);
	let internalSizes = $state.raw<readonly ZSplitterSize[]>([]);
	let lastWrittenSizes = $state.raw<readonly ZSplitterSize[] | null>(null);
	function sameKeys(left: readonly TKey[], right: readonly ZSplitterPanel<TKey>[]): boolean {
		return (
			left.length === right.length && left.every((key, index) => Object.is(key, right[index].key))
		);
	}
	const sizeSeed = $derived.by((): readonly ZSplitterSize[] => {
		const external = validateSizes(sizes, 'sizes', entries.length);
		if (external && external !== lastWrittenSizes) return external;
		if (sameKeys(internalKeys, entries)) return internalSizes;
		const previous = new Map(
			internalKeys.map((key, index) => [key, internalSizes[index]] as const)
		);
		const remapped = entries.map((entry, index) => previous.get(entry.key) ?? resetBaseline[index]);
		return external && internalKeys.length === 0 ? external : remapped;
	});
	type PanelConfigSnapshot = readonly [
		key: TKey,
		min: ZSplitterSize | undefined,
		max: ZSplitterSize | undefined,
		collapsible: boolean | undefined,
		collapsedSize: ZSplitterSize | undefined,
		resizable: boolean | undefined
	];
	const configuration = $derived<readonly PanelConfigSnapshot[]>(
		entries.map(
			(entry) =>
				[
					entry.key,
					entry.min,
					entry.max,
					entry.collapsible,
					entry.collapsedSize,
					entry.resizable
				] as const
		)
	);
	function sameConfiguration(
		left: readonly PanelConfigSnapshot[],
		right: readonly PanelConfigSnapshot[]
	): boolean {
		return (
			left.length === right.length &&
			left.every((panel, index) =>
				panel.every((value, field) => Object.is(value, right[index]?.[field]))
			)
		);
	}
	let availablePixels = $state(0);
	let rootFontPixels = $state(16);
	let measured = $state(false);
	let actualDirection = $state<'ltr' | 'rtl'>('ltr');
	let dragPixels = $state.raw<readonly number[] | null>(null);
	let resizingHandle = $state<number | null>(null);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Action-only restore history; accepted allocations publish the rendered sizes.
	const restorePixels = new Map<TKey, number>();
	function seedIsCollapsed(index: number): boolean {
		if (!entries[index].collapsible) return false;
		const available = measured ? availablePixels : 1000;
		const current = resolveResizableLength(sizeSeed[index], available, rootFontPixels);
		const collapsed = resolveResizableLength(
			entries[index].collapsedSize ?? 0,
			available,
			rootFontPixels
		);
		return current <= collapsed + 0.5;
	}
	const normalAllocation = $derived.by((): ResizableAllocation =>
		allocateResizableLengths(
			sizeSeed,
			entries.map((entry) => (measured ? entry.min : undefined)),
			entries.map((entry) => (measured ? entry.max : undefined)),
			measured ? availablePixels : 1000,
			rootFontPixels
		)
	);
	const allocation = $derived.by((): ResizableAllocation =>
		allocateResizableLengths(
			sizeSeed,
			entries.map((entry, index) =>
				measured ? (seedIsCollapsed(index) ? (entry.collapsedSize ?? 0) : entry.min) : undefined
			),
			entries.map((entry) => (measured ? entry.max : undefined)),
			measured ? availablePixels : 1000,
			rootFontPixels
		)
	);
	const displayedPixels = $derived(dragPixels ?? allocation.pixels);
	function panelId(entry: ZSplitterPanel<TKey>): string {
		return `${rootId}-panel-${typeof entry.key}-${encodeURIComponent(String(entry.key))}`;
	}
	function panelStyle(index: number): string {
		if (measured) return `flex:0 0 ${Math.max(0, displayedPixels[index] ?? 0)}px`;
		const parsed = parseResizableLength(sizeSeed[index]);
		if (parsed.unit === 'px' || parsed.unit === 'rem') return `flex:0 1 ${sizeSeed[index]}`;
		return `flex:${parsed.value} 1 0px`;
	}
	function collapsedPixels(index: number): number {
		return resolveResizableLength(
			entries[index].collapsedSize ?? 0,
			measured ? availablePixels : 1000,
			rootFontPixels,
			`panels[${index}].collapsedSize`
		);
	}
	function isCollapsed(index: number, pixels = displayedPixels): boolean {
		return (
			measured &&
			Boolean(entries[index].collapsible) &&
			pixels[index] <= collapsedPixels(index) + 0.5
		);
	}
	function frozenSizes(value: readonly ZSplitterSize[]): readonly ZSplitterSize[] {
		return Object.freeze([...value]);
	}
	function encodePixels(
		pixels: readonly number[],
		declarations = sizeSeed
	): readonly ZSplitterSize[] {
		return Object.freeze(
			pixels.map((value, index) =>
				encodeResizableLength(
					value,
					declarations[index],
					Math.max(0, availablePixels),
					rootFontPixels
				)
			)
		);
	}
	function detail(
		handleIndex: number,
		source: ZSplitterResizeSource,
		pixels: readonly number[],
		output = encodePixels(pixels)
	): ZSplitterResizeDetail {
		const total = Math.max(0, availablePixels);
		return Object.freeze({
			handleIndex,
			percentages: Object.freeze(
				pixels.map((value) => (total <= 0 ? 0 : Math.round((value / total) * 100_000) / 1000))
			),
			pixels: Object.freeze([...pixels]),
			sizes: frozenSizes(output),
			source
		});
	}
	function sameSizes(left: readonly ZSplitterSize[], right: readonly ZSplitterSize[]): boolean {
		return (
			left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
		);
	}
	function writeUserSizes(
		pixels: readonly number[],
		handleIndex: number,
		source: ZSplitterResizeSource,
		declarations = sizeSeed
	): ZSplitterResizeDetail {
		const output = encodePixels(pixels, declarations);
		internalKeys = Object.freeze(entries.map((entry) => entry.key));
		internalSizes = output;
		lastWrittenSizes = output;
		dragPixels = Object.freeze([...pixels]);
		if (pointerSession) pointerSession.currentOutput = output;
		sizes = output;
		onSizesChange?.(output);
		const snapshot = detail(handleIndex, source, pixels, output);
		onResize?.(snapshot);
		return snapshot;
	}
	function adjustable(index: number): boolean {
		return (
			measured &&
			!disabled &&
			allocation.feasible &&
			entries[index].resizable !== false &&
			entries[index + 1].resizable !== false
		);
	}
	function boundsAllowingCollapse(
		base: readonly ResizableBounds[],
		index: number,
		allowCollapsed: boolean
	): readonly ResizableBounds[] {
		if (!allowCollapsed || !entries[index].collapsible) return base;
		const next = [...base];
		next[index] = { ...next[index], min: Math.min(next[index].min, collapsedPixels(index)) };
		return next;
	}
	function resizedFrom(
		start: readonly number[],
		handleIndex: number,
		delta: number,
		collapseOnCrossing: boolean
	): readonly number[] {
		let bounds: readonly ResizableBounds[] = normalAllocation.bounds;
		const pair = start[handleIndex] + start[handleIndex + 1];
		const desiredBefore = start[handleIndex] + delta;
		const desiredAfter = pair - desiredBefore;
		if (
			collapseOnCrossing &&
			entries[handleIndex].collapsible &&
			desiredBefore < normalAllocation.bounds[handleIndex].min
		) {
			restorePixels.set(entries[handleIndex].key, start[handleIndex]);
			bounds = boundsAllowingCollapse(bounds, handleIndex, true);
			return resizeAdjacentPair(
				start,
				bounds,
				handleIndex,
				collapsedPixels(handleIndex) - start[handleIndex]
			);
		}
		if (
			collapseOnCrossing &&
			entries[handleIndex + 1].collapsible &&
			desiredAfter < normalAllocation.bounds[handleIndex + 1].min
		) {
			restorePixels.set(entries[handleIndex + 1].key, start[handleIndex + 1]);
			bounds = boundsAllowingCollapse(bounds, handleIndex + 1, true);
			return resizeAdjacentPair(
				start,
				bounds,
				handleIndex,
				pair - collapsedPixels(handleIndex + 1) - start[handleIndex]
			);
		}
		return resizeAdjacentPair(start, bounds, handleIndex, delta);
	}

	interface PointerSession {
		readonly pointerId: number;
		readonly handleIndex: number;
		readonly node: HTMLElement;
		readonly ownerWindow: Window;
		readonly startCoordinate: number;
		readonly startPixels: readonly number[];
		readonly startOutput: readonly ZSplitterSize[];
		currentOutput: readonly ZSplitterSize[];
		changed: boolean;
	}
	let pointerSession: PointerSession | null = null;
	let observedConfiguration: readonly PanelConfigSnapshot[] = [];
	let observedOrientation: ZSplitterOrientation | undefined;
	function coordinate(event: PointerEvent): number {
		return resolvedOrientation === 'horizontal' ? event.clientX : event.clientY;
	}
	function removePointerListeners(session: PointerSession): void {
		session.ownerWindow.removeEventListener('pointermove', handlePointerMove);
		session.ownerWindow.removeEventListener('pointerup', handlePointerUp);
		session.ownerWindow.removeEventListener('pointercancel', handlePointerCancel);
	}
	function releasePointer(session: PointerSession): void {
		removePointerListeners(session);
		if (session.node.hasPointerCapture(session.pointerId))
			session.node.releasePointerCapture(session.pointerId);
	}
	function cancelPointer(reason: ZSplitterCancelReason, restore: boolean): void {
		const session = pointerSession;
		if (!session) return;
		pointerSession = null;
		resizingHandle = null;
		releasePointer(session);
		let pixels = session.changed && restore ? session.startPixels : displayedPixels;
		let output = session.changed && restore ? session.startOutput : encodePixels(pixels);
		if (session.changed && restore && reason !== 'unmount') {
			internalKeys = Object.freeze(entries.map((entry) => entry.key));
			internalSizes = session.startOutput;
			lastWrittenSizes = session.startOutput;
			sizes = session.startOutput;
			onSizesChange?.(session.startOutput);
		}
		dragPixels = null;
		onResizeCancel?.(
			Object.freeze({ ...detail(session.handleIndex, 'pointer', pixels, output), reason })
		);
	}
	function finishPointer(): void {
		const session = pointerSession;
		if (!session) return;
		pointerSession = null;
		resizingHandle = null;
		releasePointer(session);
		const pixels = dragPixels ?? session.startPixels;
		const snapshot = detail(session.handleIndex, 'pointer', pixels, session.currentOutput);
		dragPixels = null;
		onResizeEnd?.(snapshot);
	}
	function handlePointerMove(event: PointerEvent): void {
		const session = pointerSession;
		if (!session || event.pointerId !== session.pointerId) return;
		event.preventDefault();
		const physicalDelta = coordinate(event) - session.startCoordinate;
		const logicalDelta =
			resolvedOrientation === 'horizontal' && actualDirection === 'rtl'
				? -physicalDelta
				: physicalDelta;
		const pixels = resizedFrom(session.startPixels, session.handleIndex, logicalDelta, true);
		if (
			pixels.every(
				(value, index) => Math.abs(value - (dragPixels ?? session.startPixels)[index]) < 0.001
			)
		)
			return;
		session.changed = true;
		writeUserSizes(pixels, session.handleIndex, 'pointer', session.startOutput);
	}
	function handlePointerUp(event: PointerEvent): void {
		if (pointerSession?.pointerId !== event.pointerId) return;
		finishPointer();
	}
	function handlePointerCancel(event: PointerEvent): void {
		if (pointerSession?.pointerId !== event.pointerId) return;
		cancelPointer('pointer-cancel', true);
	}
	function beginPointer(event: PointerEvent): void {
		const node = event.currentTarget as HTMLElement;
		const handleIndex = Number(node.dataset.handleIndex);
		if (
			event.defaultPrevented ||
			!event.isPrimary ||
			event.button !== 0 ||
			!adjustable(handleIndex)
		)
			return;
		const ownerWindow = node.ownerDocument.defaultView;
		if (!ownerWindow || availablePixels <= 0) return;
		event.preventDefault();
		cancelPointer('owner-change', false);
		node.focus({ preventScroll: true });
		const startPixels = Object.freeze([...allocation.pixels]);
		const startOutput = frozenSizes(sizeSeed);
		pointerSession = {
			pointerId: event.pointerId,
			handleIndex,
			node,
			ownerWindow,
			startCoordinate: coordinate(event),
			startPixels,
			startOutput,
			currentOutput: startOutput,
			changed: false
		};
		resizingHandle = handleIndex;
		dragPixels = startPixels;
		try {
			node.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic test events have no active browser pointer; owner Window listeners still
			// exercise the same move/up/cancel lifecycle.
		}
		ownerWindow.addEventListener('pointermove', handlePointerMove, { passive: false });
		ownerWindow.addEventListener('pointerup', handlePointerUp);
		ownerWindow.addEventListener('pointercancel', handlePointerCancel);
		onResizeStart?.(detail(handleIndex, 'pointer', startPixels, startOutput));
	}
	const attachHandle: Attachment<Element> = (node) => {
		const HTMLElementConstructor = node.ownerDocument.defaultView?.HTMLElement;
		if (!HTMLElementConstructor || !(node instanceof HTMLElementConstructor))
			throw new TypeError('ZSplitter handle attachment requires an HTMLElement.');
		const handle = node as HTMLElement;
		const lost = (event: PointerEvent) => {
			if (pointerSession?.node === handle && pointerSession.pointerId === event.pointerId)
				cancelPointer('lost-capture', true);
		};
		handle.addEventListener('pointerdown', beginPointer);
		handle.addEventListener('lostpointercapture', lost);
		return () => {
			handle.removeEventListener('pointerdown', beginPointer);
			handle.removeEventListener('lostpointercapture', lost);
			if (pointerSession?.node === handle) cancelPointer('owner-change', false);
		};
	};
	const handleAttributes = { [attachmentKey]: attachHandle };

	function discrete(
		handleIndex: number,
		source: Exclude<ZSplitterResizeSource, 'pointer'>,
		pixels: readonly number[]
	): void {
		if (!adjustable(handleIndex)) return;
		const start = detail(handleIndex, source, allocation.pixels, sizeSeed);
		onResizeStart?.(start);
		const changed = pixels.some(
			(value, index) => Math.abs(value - allocation.pixels[index]) > 0.001
		);
		const snapshot = changed ? writeUserSizes(pixels, handleIndex, source) : start;
		dragPixels = null;
		onResizeEnd?.(snapshot);
	}
	function toggleCollapse(handleIndex: number, targetIndex?: number): void {
		const before =
			targetIndex ?? (entries[handleIndex].collapsible ? handleIndex : handleIndex + 1);
		if (!entries[before]?.collapsible) return;
		const start = allocation.pixels;
		const pair = start[handleIndex] + start[handleIndex + 1];
		let target: number;
		let bounds: readonly ResizableBounds[] = normalAllocation.bounds;
		if (isCollapsed(before, start)) {
			const remembered = restorePixels.get(entries[before].key);
			const fallback = Math.max(normalAllocation.bounds[before].min, pair * 0.25);
			const restored = Math.min(normalAllocation.bounds[before].max, remembered ?? fallback);
			target = before === handleIndex ? restored : pair - restored;
		} else {
			restorePixels.set(entries[before].key, start[before]);
			bounds = boundsAllowingCollapse(bounds, before, true);
			target = before === handleIndex ? collapsedPixels(before) : pair - collapsedPixels(before);
		}
		const pixels = resizeAdjacentPair(start, bounds, handleIndex, target - start[handleIndex]);
		discrete(handleIndex, 'collapse', pixels);
	}
	function resizeToBoundary(handleIndex: number, towardStart: boolean): void {
		const collapseIndex = towardStart ? handleIndex : handleIndex + 1;
		const collapseEntry = entries[collapseIndex];
		const canCollapse = collapseEntry.collapsible === true;
		if (canCollapse && !isCollapsed(collapseIndex, allocation.pixels))
			restorePixels.set(collapseEntry.key, allocation.pixels[collapseIndex]);
		const bounds = canCollapse
			? boundsAllowingCollapse(normalAllocation.bounds, collapseIndex, true)
			: normalAllocation.bounds;
		const range = adjacentResizableRange(allocation.pixels, bounds, handleIndex);
		const target = towardStart ? range.min : range.max;
		discrete(
			handleIndex,
			'keyboard',
			resizeAdjacentPair(
				allocation.pixels,
				bounds,
				handleIndex,
				target - allocation.pixels[handleIndex]
			)
		);
	}
	function handleKeydown(event: KeyboardEvent, handleIndex: number): void {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.ctrlKey ||
			event.altKey ||
			event.metaKey ||
			!adjustable(handleIndex)
		)
			return;
		const horizontal = resolvedOrientation === 'horizontal';
		let arrow: -1 | 1;
		switch (event.key) {
			case 'ArrowLeft':
				if (!horizontal) return;
				arrow = -1;
				break;
			case 'ArrowRight':
				if (!horizontal) return;
				arrow = 1;
				break;
			case 'ArrowUp':
				if (horizontal) return;
				arrow = -1;
				break;
			case 'ArrowDown':
				if (horizontal) return;
				arrow = 1;
				break;
			case 'Home':
				event.preventDefault();
				resizeToBoundary(handleIndex, true);
				return;
			case 'End':
				event.preventDefault();
				resizeToBoundary(handleIndex, false);
				return;
			case 'Enter':
				event.preventDefault();
				toggleCollapse(handleIndex);
				return;
			default:
				return;
		}
		event.preventDefault();
		const direction = horizontal && actualDirection === 'rtl' ? -arrow : arrow;
		const amount = event.shiftKey ? shiftStep : step;
		if (!Number.isFinite(amount) || amount <= 0)
			throw new TypeError('ZSplitter step and shiftStep must be positive and finite.');
		discrete(
			handleIndex,
			'keyboard',
			resizedFrom(
				allocation.pixels,
				handleIndex,
				direction * availablePixels * (amount / 100),
				false
			)
		);
	}
	function measure(): void {
		const root = ref;
		if (!root?.isConnected) return;
		const view = root.ownerDocument.defaultView;
		if (!view) return;
		const computed = view.getComputedStyle(root);
		const horizontal = resolvedOrientation === 'horizontal';
		const client = horizontal ? root.clientWidth : root.clientHeight;
		const padding = horizontal
			? Number.parseFloat(computed.paddingLeft) + Number.parseFloat(computed.paddingRight)
			: Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom);
		const handleTotal = [
			...root.querySelectorAll<HTMLElement>(':scope > [data-slot="handle"]')
		].reduce(
			(sum, handle) =>
				sum +
				(horizontal ? handle.getBoundingClientRect().width : handle.getBoundingClientRect().height),
			0
		);
		const next = Math.max(0, client - padding - handleTotal);
		if (pointerSession && Math.abs(next - availablePixels) > 0.5)
			cancelPointer('geometry-change', false);
		availablePixels = next;
		rootFontPixels =
			Number.parseFloat(view.getComputedStyle(root.ownerDocument.documentElement).fontSize) || 16;
		actualDirection = computed.direction === 'rtl' ? 'rtl' : 'ltr';
		measured = next > 0;
	}
	$effect(() => {
		const root = ref;
		resolvedOrientation;
		resolvedSize;
		zui.portalContainer;
		if (!root) return;
		const view = root.ownerDocument.defaultView;
		if (!view) return;
		const Observer = view.ResizeObserver;
		const observer = Observer ? new Observer(measure) : null;
		observer?.observe(root);
		view.addEventListener('resize', measure);
		void tick().then(measure);
		return () => {
			observer?.disconnect();
			view.removeEventListener('resize', measure);
		};
	});
	$effect(() => {
		const nextConfiguration = configuration;
		const nextOrientation = resolvedOrientation;
		const root = ref;
		const owner = root?.ownerDocument.defaultView;
		untrack(() => {
			if (
				pointerSession &&
				(!sameConfiguration(observedConfiguration, nextConfiguration) ||
					observedOrientation !== nextOrientation ||
					pointerSession.ownerWindow !== owner ||
					pointerSession.node.ownerDocument !== root?.ownerDocument ||
					!root?.contains(pointerSession.node))
			)
				cancelPointer('owner-change', false);
			observedConfiguration = nextConfiguration;
			observedOrientation = nextOrientation;
		});
	});
	$effect(() => {
		const external = sizes;
		untrack(() => {
			if (pointerSession && external && !sameSizes(external, pointerSession.currentOutput))
				cancelPointer('external-update', false);
		});
	});
	$effect(() => {
		const collapsed = entries.map((_, index) => isCollapsed(index));
		const root = ref;
		if (!root) return;
		untrack(() => {
			const active = getActiveElement(root);
			const panelElements = [...root.querySelectorAll<HTMLElement>(':scope > [data-slot="panel"]')];
			const index = panelElements.findIndex(
				(element, index) => collapsed[index] && containsComposedNode(element, active)
			);
			if (index >= 0) focusHandle(index === entries.length - 1 ? index - 1 : index);
		});
	});

	export function reset(): void {
		if (pointerSession) cancelPointer('external-update', false);
		const baseline = frozenSizes(resetBaseline);
		internalKeys = Object.freeze(entries.map((entry) => entry.key));
		internalSizes = baseline;
		lastWrittenSizes = baseline;
		sizes = baseline;
		onSizesChange?.(baseline);
	}
	export function collapse(key: TKey): void {
		const index = entries.findIndex((entry) => Object.is(entry.key, key));
		if (index < 0 || !entries[index].collapsible) return;
		const handleIndex = index === entries.length - 1 ? index - 1 : index;
		if (!isCollapsed(index, allocation.pixels)) toggleCollapse(handleIndex, index);
	}
	export function expand(key: TKey): void {
		const index = entries.findIndex((entry) => Object.is(entry.key, key));
		if (index < 0 || !entries[index].collapsible) return;
		const handleIndex = index === entries.length - 1 ? index - 1 : index;
		if (isCollapsed(index, allocation.pixels)) toggleCollapse(handleIndex, index);
	}
	function accessibleBounds(handleIndex: number): readonly ResizableBounds[] {
		if (!allocation.feasible)
			return allocation.pixels.map(() => ({ min: 0, max: Math.max(0, availablePixels) }));
		let bounds: readonly ResizableBounds[] = normalAllocation.bounds;
		bounds = boundsAllowingCollapse(bounds, handleIndex, true);
		bounds = boundsAllowingCollapse(bounds, handleIndex + 1, true);
		return bounds;
	}
	export function focusHandle(index: number): void {
		ref
			?.querySelector<HTMLElement>(`:scope > [data-slot="handle"][data-handle-index="${index}"]`)
			?.focus({ preventScroll: true });
	}
	onDestroy(() => cancelPointer('unmount', false));

	const classes = $derived(zui.slots(recipe, { orientation: resolvedOrientation }));
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() =>
		mergeStyles(
			style,
			serializeIcssVariables({
				...variables,
				'--zui-splitter-handle-size': metrics.indicatorSize,
				'--zui-splitter-line-size': cssLength(zui.theme.borderWidth.hairline)
			})
		)
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	data-constrained={measured && !allocation.feasible ? 'true' : undefined}
	data-measured={measured ? 'true' : 'false'}
	data-orientation={resolvedOrientation}
	data-resizing={resizingHandle !== null ? 'true' : undefined}
	data-size={resolvedSize}
	dir={dir ?? zui.direction}
	id={rootId}
	style={initialStyle}
	use:applyIcssRootStyle={{
		style,
		variables: {
			...variables,
			'--zui-splitter-handle-size': metrics.indicatorSize,
			'--zui-splitter-line-size': cssLength(zui.theme.borderWidth.hairline)
		}
	}}
>
	{#each entries as entry, index (entry.key)}
		{@const collapsed = isCollapsed(index)}
		<div
			aria-hidden={collapsed || undefined}
			aria-label={entry.label}
			class={classes.panel}
			data-collapsed={collapsed ? 'true' : undefined}
			data-key={String(entry.key)}
			data-key-type={typeof entry.key}
			data-slot="panel"
			id={panelId(entry)}
			inert={collapsed}
			role="region"
			style={panelStyle(index)}
		>
			{@render panel(entry, index)}
		</div>
		{#if index < entries.length - 1}
			{@const range = adjacentResizableRange(displayedPixels, accessibleBounds(index), index)}
			{@const inactive = !adjustable(index)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex (ARIA separator is the real keyboard and pointer resize control) -->
			<div
				{...handleAttributes}
				aria-controls={panelId(entry)}
				aria-disabled={measured && inactive ? true : undefined}
				aria-label={entry.label}
				aria-orientation={resolvedOrientation === 'horizontal' ? 'vertical' : 'horizontal'}
				aria-valuemax={measured && availablePixels > 0
					? Math.round((range.max / availablePixels) * 100_000) / 1000
					: undefined}
				aria-valuemin={measured && availablePixels > 0
					? Math.round((range.min / availablePixels) * 100_000) / 1000
					: undefined}
				aria-valuenow={measured && availablePixels > 0
					? Math.round(((displayedPixels[index] ?? 0) / availablePixels) * 100_000) / 1000
					: undefined}
				class={classes.handle}
				data-disabled={measured && inactive ? 'true' : undefined}
				data-handle-index={index}
				data-slot="handle"
				onkeydown={(event) => handleKeydown(event, index)}
				role="separator"
				tabindex={!measured || inactive ? -1 : 0}
			>
				<span aria-hidden="true" class={classes.line} data-slot="line"></span>
				<span aria-hidden="true" class={classes.grip} data-slot="grip"></span>
			</div>
		{/if}
	{/each}
</div>
