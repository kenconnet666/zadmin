<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ResizableLength } from '../../runtime/resize.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export type ZResizableAxis = 'inline' | 'block' | 'both';
	export type ZResizableHandle =
		| 'inline-start'
		| 'inline-end'
		| 'block-start'
		| 'block-end'
		| 'block-start-inline-start'
		| 'block-start-inline-end'
		| 'block-end-inline-start'
		| 'block-end-inline-end';
	export type ZResizableResizeSource = 'keyboard' | 'pointer';
	export type ZResizableCancelReason =
		| 'external-update'
		| 'geometry-change'
		| 'lost-capture'
		| 'owner-change'
		| 'pointer-cancel'
		| 'unmount';

	export interface ZResizableValue {
		readonly height: ResizableLength;
		readonly width: ResizableLength;
	}

	export interface ZResizableResizeDetail extends ZResizableValue {
		readonly handle: ZResizableHandle;
		readonly heightPixels: number;
		readonly source: ZResizableResizeSource;
		readonly widthPixels: number;
	}

	export interface ZResizableCancelDetail extends ZResizableResizeDetail {
		readonly reason: ZResizableCancelReason;
	}

	export interface ZResizableHandleContext {
		readonly axis: ZResizableAxis;
		readonly disabled: boolean;
		readonly handle: ZResizableHandle;
		readonly resizing: boolean;
	}

	export interface ZResizableProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onresize'
	> {
		readonly axis?: ZResizableAxis;
		readonly children?: Snippet;
		readonly defaultHeight?: ResizableLength;
		readonly defaultWidth?: ResizableLength;
		readonly disabled?: boolean;
		readonly handle?: Snippet<[context: ZResizableHandleContext]>;
		readonly handleLabel?: (handle: ZResizableHandle) => string;
		readonly handles?: readonly ZResizableHandle[];
		height?: ResizableLength;
		readonly maxHeight?: ResizableLength;
		readonly maxWidth?: ResizableLength;
		readonly minHeight?: ResizableLength;
		readonly minWidth?: ResizableLength;
		readonly onResize?: (detail: ZResizableResizeDetail) => void;
		readonly onResizeCancel?: (detail: ZResizableCancelDetail) => void;
		readonly onResizeEnd?: (detail: ZResizableResizeDetail) => void;
		readonly onResizeStart?: (detail: ZResizableResizeDetail) => void;
		readonly onSizeChange?: (value: ZResizableValue) => void;
		ref?: HTMLDivElement | null;
		readonly shiftStep?: number;
		readonly size?: ZControlSize;
		readonly step?: number;
		width?: ResizableLength;
	}

	export const zuiMetadata = {
		bindings: [
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实可调整根元素。' },
			{ name: 'width', type: 'ResizableLength', description: '受控或可绑定inline尺寸。' },
			{ name: 'height', type: 'ResizableLength', description: '受控或可绑定block尺寸。' }
		],
		category: 'layout',
		dependencies: ['ResizableLength', 'owner ResizeObserver', 'Pointer Events'],
		events: [
			{
				name: 'onSizeChange',
				type: '(value: ZResizableValue) => void',
				description: '用户pointer、键盘或公开reset写入尺寸时调用一次。'
			},
			{
				name: 'onResizeStart',
				type: '(detail: ZResizableResizeDetail) => void',
				description: 'pointer序列或一个离散键盘操作开始。'
			},
			{
				name: 'onResize',
				type: '(detail: ZResizableResizeDetail) => void',
				description: '实际几何改变时调用。'
			},
			{
				name: 'onResizeEnd',
				type: '(detail: ZResizableResizeDetail) => void',
				description: 'pointerup或离散键盘操作完成。'
			},
			{
				name: 'onResizeCancel',
				type: '(detail: ZResizableCancelDetail) => void',
				description: '活动pointer因取消、capture、owner、几何、外部写入或卸载而结束。'
			}
		],
		id: 'resizable',
		importStatement: "import { ZResizable } from '@zadmin/zui';",
		keyboard: [
			{ key: 'Arrow keys', description: '沿handle控制的物理方向按step调整。' },
			{ key: 'Shift + Arrow', description: '按shiftStep进行较大调整。' },
			{ key: 'Home / End', description: '移动到相关维度的最小或最大约束。' }
		],
		name: 'ZResizable',
		parts: [
			{ name: 'root', description: '拥有width/height的单一真实元素。' },
			{ name: 'handle', description: '位于逻辑边或角的真实键盘/pointer控制。' },
			{ name: 'grip', description: '默认主题化拖动指示；可由handle snippet替换。' }
		],
		props: [
			{
				name: 'axis',
				type: "'inline' | 'block' | 'both'",
				default: "'inline'",
				description: '允许改变的逻辑维度。'
			},
			{
				name: 'handles',
				type: 'readonly ZResizableHandle[]',
				default: '按axis选择结束边与结束角',
				description: '唯一逻辑边/角集合；省略时按axis生成末端默认handle。'
			},
			{
				name: 'width',
				type: 'ResizableLength',
				default: "defaultWidth → '100%'",
				bindable: true,
				description: '受控或可绑定inline尺寸，数字/百分比按owner换算，px/rem保留声明单位。'
			},
			{
				name: 'height',
				type: 'ResizableLength',
				default: "defaultHeight → '100%'",
				bindable: true,
				description: '受控或可绑定block尺寸，与width在同一次resize事件中原子通知。'
			},
			{
				name: 'defaultWidth',
				type: 'ResizableLength',
				default: "'100%'",
				description: '非受控初始inline尺寸及reset基线。'
			},
			{
				name: 'defaultHeight',
				type: 'ResizableLength',
				default: "'100%'",
				description: '非受控初始block尺寸及reset基线。'
			},
			{
				name: 'minWidth',
				type: 'ResizableLength',
				default: '0',
				description: 'inline方向的最小尺寸。'
			},
			{
				name: 'maxWidth',
				type: 'ResizableLength',
				default: 'owner inline size',
				description: 'inline方向的最大尺寸，省略时限制在owner内。'
			},
			{
				name: 'minHeight',
				type: 'ResizableLength',
				default: '0',
				description: 'block方向的最小尺寸。'
			},
			{
				name: 'maxHeight',
				type: 'ResizableLength',
				default: 'owner block size',
				description: 'block方向的最大尺寸，省略时限制在owner内。'
			},
			{ name: 'step', type: 'number', default: '8', description: '键盘调整像素。' },
			{ name: 'shiftStep', type: 'number', default: '32', description: 'Shift键盘调整像素。' },
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '停止用户调整，保留受控尺寸和可见内容。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'componentDefaults.resizable → Provider density',
				description: '五档手柄大小，共享控件主题尺度。'
			},
			{
				name: 'handleLabel',
				type: '(handle: ZResizableHandle) => string',
				default: 'localePack.common.resizeHandle',
				description: '覆盖每个handle的可访问名称。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				bindable: true,
				default: 'null',
				description: '真实可调整根元素引用。'
			}
		],
		since: 'unreleased',
		snippets: [
			{ name: 'children', type: 'Snippet', description: '根元素内容。' },
			{
				name: 'handle',
				type: 'Snippet<[ZResizableHandleContext]>',
				description: '替换handle内部指示，保留真实控制、ARIA和pointer语义。'
			}
		],
		source: 'ui/zui/src/components/layout/ZResizable.svelte',
		states: [
			{ name: 'data-axis', values: ['inline', 'block', 'both'], description: '允许调整的维度。' },
			{
				name: 'data-handle',
				values: [
					'inline-start',
					'inline-end',
					'block-start',
					'block-end',
					'block-start-inline-start',
					'block-start-inline-end',
					'block-end-inline-start',
					'block-end-inline-end'
				],
				description: '逻辑handle位置。'
			},
			{ name: 'data-measured', values: ['true', 'false'], description: 'owner几何是否可用。' },
			{ name: 'data-resizing', values: ['true'], description: '活动pointer调整。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的五档handle触摸目标尺寸。'
			}
		],
		status: 'experimental',
		summary: '以逻辑边/角handle调整一个元素的inline/block尺寸，保留单位、约束和完整交互生命周期。'
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'handle', 'grip'] as const,
			base: {
				root: (s) => {
					s.position.relative;
					s.boxSizing.borderBox;
					s.minInlineSize.px(0);
					s.minBlockSize.px(0);
					s.inlineSize.raw('var(--zui-resizable-width)');
					s.blockSize.raw('var(--zui-resizable-height)');
					s.overflow.auto;
				},
				handle: (s) => {
					s.position.absolute;
					s.display.flex;
					s.alignItems.center;
					s.justifyContent.center;
					s.boxSizing.borderBox;
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
					s._selector('&[data-handle="inline-start"], &[data-handle="inline-end"]', (s) => {
						s.blockSize.percent(100);
						s.inlineSize.raw('var(--zui-resizable-handle-size)');
						s.insetBlockStart.px(0);
						s.cursor.raw('col-resize');
					});
					s._selector('&[data-handle="inline-start"]', (s) => s.insetInlineStart.px(0));
					s._selector('&[data-handle="inline-end"]', (s) => s.insetInlineEnd.px(0));
					s._selector('&[data-handle="block-start"], &[data-handle="block-end"]', (s) => {
						s.blockSize.raw('var(--zui-resizable-handle-size)');
						s.inlineSize.percent(100);
						s.insetInlineStart.px(0);
						s.cursor.raw('row-resize');
					});
					s._selector('&[data-handle="block-start"]', (s) => s.insetBlockStart.px(0));
					s._selector('&[data-handle="block-end"]', (s) => s.insetBlockEnd.px(0));
					s._selector('&[data-corner="true"]', (s) => {
						s.blockSize.raw('var(--zui-resizable-handle-size)');
						s.inlineSize.raw('var(--zui-resizable-handle-size)');
					});
					s._selector(
						'&[data-direction="ltr"]:is([data-handle="block-start-inline-start"], [data-handle="block-end-inline-end"]), &[data-direction="rtl"]:is([data-handle="block-start-inline-end"], [data-handle="block-end-inline-start"])',
						(s) => s.cursor.raw('nwse-resize')
					);
					s._selector(
						'&[data-direction="ltr"]:is([data-handle="block-start-inline-end"], [data-handle="block-end-inline-start"]), &[data-direction="rtl"]:is([data-handle="block-start-inline-start"], [data-handle="block-end-inline-end"])',
						(s) => s.cursor.raw('nesw-resize')
					);
					s._selector('&[data-handle^="block-start-"]', (s) => s.insetBlockStart.px(0));
					s._selector('&[data-handle^="block-end-"]', (s) => s.insetBlockEnd.px(0));
					s._selector('&[data-handle$="inline-start"]', (s) => s.insetInlineStart.px(0));
					s._selector('&[data-handle$="inline-end"]', (s) => s.insetInlineEnd.px(0));
					s._selector('&[data-disabled="true"]', (s) => s.cursor.default);
				},
				grip: (s) => {
					s.blockSize.raw('calc(var(--zui-resizable-handle-size) / 2)');
					s.inlineSize.raw('calc(var(--zui-resizable-handle-size) / 2)');
					s.backgroundColor._border;
					s.borderRadius._small;
					s.pointerEvents.none;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onDestroy, tick, untrack } from 'svelte';

	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { isDomHtmlElement, isDomShadowRoot } from '../../runtime/layer/dom-realm.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import {
		encodeResizableLength,
		parseResizableLength,
		resolveResizableLength
	} from '../../runtime/resize.js';

	let {
		axis = 'inline',
		children,
		defaultHeight = '100%',
		defaultWidth = '100%',
		disabled = false,
		handle: handleSnippet,
		handleLabel,
		handles,
		height = $bindable(),
		maxHeight,
		maxWidth,
		minHeight = 0,
		minWidth = 0,
		onResize,
		onResizeCancel,
		onResizeEnd,
		onResizeStart,
		onSizeChange,
		ref = $bindable(null),
		shiftStep = 32,
		size,
		step = 8,
		width = $bindable(),
		class: className,
		dir,
		style,
		...rest
	}: ZResizableProps = $props();
	const zui = useZui();
	const handleValues = Object.freeze([
		'inline-start',
		'inline-end',
		'block-start',
		'block-end',
		'block-start-inline-start',
		'block-start-inline-end',
		'block-end-inline-start',
		'block-end-inline-end'
	] as const);
	const resetWidth = untrack(() => validateLength(defaultWidth, 'ZResizable defaultWidth'));
	const resetHeight = untrack(() => validateLength(defaultHeight, 'ZResizable defaultHeight'));
	const widthState = new ControllableState<ResizableLength>({
		defaultValue: () => resetWidth,
		read: () => width,
		write: (next) => (width = next)
	});
	const heightState = new ControllableState<ResizableLength>({
		defaultValue: () => resetHeight,
		read: () => height,
		write: (next) => (height = next)
	});
	const resolvedAxis = $derived.by((): ZResizableAxis => {
		if (!['inline', 'block', 'both'].includes(axis))
			throw new TypeError('Invalid ZResizable axis.');
		return axis;
	});
	const resolvedDirection = $derived(dir === 'rtl' || dir === 'ltr' ? dir : zui.direction);
	const resolvedSize = $derived(
		resolveControlSize(size ?? zui.componentDefaults.resizable?.size, zui.density)
	);
	const resolvedStep = $derived(validateStep(step, 'step'));
	const resolvedShiftStep = $derived(validateStep(shiftStep, 'shiftStep'));
	const configuration = $derived.by(() => {
		validateBoundPair(minWidth, maxWidth, 'Width');
		validateBoundPair(minHeight, maxHeight, 'Height');
		void resolvedStep;
		void resolvedShiftStep;
		return true;
	});
	const currentWidth = $derived.by(() => {
		configuration;
		return validateLength(widthState.current, 'ZResizable width');
	});
	const currentHeight = $derived.by(() => {
		configuration;
		return validateLength(heightState.current, 'ZResizable height');
	});
	const defaultHandleSet = $derived<readonly ZResizableHandle[]>(
		resolvedAxis === 'inline'
			? ['inline-end']
			: resolvedAxis === 'block'
				? ['block-end']
				: ['inline-end', 'block-end', 'block-end-inline-end']
	);
	const resolvedHandles = $derived.by((): readonly ZResizableHandle[] => {
		const values = handles ?? defaultHandleSet;
		if (!Array.isArray(values)) throw new TypeError('ZResizable handles must be an array.');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Per-call handle uniqueness scratch, not retained state.
		const seen = new Set<ZResizableHandle>();
		for (const value of values) {
			if (!handleValues.includes(value)) throw new TypeError('Invalid ZResizable handle.');
			if (seen.has(value)) throw new TypeError('ZResizable handles must be unique.');
			if (
				(resolvedAxis === 'inline' && dimensions(value).block) ||
				(resolvedAxis === 'block' && dimensions(value).inline)
			)
				throw new TypeError('ZResizable handle must match axis.');
			seen.add(value);
		}
		return Object.freeze([...values]);
	});

	let availableWidth = $state(0);
	let availableHeight = $state(0);
	let rootFontPixels = $state(16);
	let actualDirection = $state<'ltr' | 'rtl'>('ltr');
	let measured = $state(false);
	let resizingHandle = $state<ZResizableHandle | null>(null);

	const widthBounds = $derived(
		bounds(minWidth, maxWidth, availableWidth, rootFontPixels, 'Width', measured)
	);
	const heightBounds = $derived(
		bounds(minHeight, maxHeight, availableHeight, rootFontPixels, 'Height', measured)
	);
	const widthPixels = $derived(
		measured
			? clamp(
					resolveResizableLength(currentWidth, availableWidth, rootFontPixels, 'width'),
					widthBounds.min,
					widthBounds.max
				)
			: 0
	);
	const heightPixels = $derived(
		measured
			? clamp(
					resolveResizableLength(currentHeight, availableHeight, rootFontPixels, 'height'),
					heightBounds.min,
					heightBounds.max
				)
			: 0
	);
	const renderedWidth = $derived(
		measured
			? encodeResizableLength(widthPixels, currentWidth, availableWidth, rootFontPixels)
			: currentWidth
	);
	const renderedHeight = $derived(
		measured
			? encodeResizableLength(heightPixels, currentHeight, availableHeight, rootFontPixels)
			: currentHeight
	);
	const handleDirection = $derived(measured ? actualDirection : resolvedDirection);

	function validateLength(value: ResizableLength, name: string): ResizableLength {
		parseResizableLength(value, name);
		return value;
	}
	function validateStep(value: number, name: string): number {
		if (!Number.isFinite(value) || value <= 0)
			throw new TypeError(`ZResizable ${name} must be positive and finite.`);
		return value;
	}
	function validateBoundPair(
		minimum: ResizableLength,
		maximum: ResizableLength | undefined,
		name: string
	): void {
		const min = parseResizableLength(minimum, `ZResizable min${name}`);
		if (maximum === undefined) return;
		const max = parseResizableLength(maximum, `ZResizable max${name}`);
		const comparable =
			min.unit === max.unit || (min.unit.startsWith('percent') && max.unit.startsWith('percent'));
		if (comparable && min.value > max.value)
			throw new TypeError(`ZResizable min${name} cannot exceed max${name}.`);
	}
	function bounds(
		minimum: ResizableLength,
		maximum: ResizableLength | undefined,
		available: number,
		rootFont: number,
		name: string,
		active: boolean
	): { readonly max: number; readonly min: number } {
		parseResizableLength(minimum, `ZResizable min${name}`);
		if (maximum !== undefined) parseResizableLength(maximum, `ZResizable max${name}`);
		if (!active) return Object.freeze({ min: 0, max: 0 });
		const min = resolveResizableLength(minimum, available, rootFont, `ZResizable min${name}`);
		const max =
			maximum === undefined
				? available
				: resolveResizableLength(maximum, available, rootFont, `ZResizable max${name}`);
		if (min > max) throw new TypeError(`ZResizable min${name} cannot exceed max${name}.`);
		return Object.freeze({ min, max });
	}
	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
	function dimensions(handle: ZResizableHandle): { inline: boolean; block: boolean } {
		return {
			inline: handle.startsWith('inline-') || handle.includes('-inline-'),
			block: handle.startsWith('block-')
		};
	}
	function inlineSign(handle: ZResizableHandle): number {
		return handle === 'inline-start' || handle.endsWith('inline-start') ? -1 : 1;
	}
	function blockSign(handle: ZResizableHandle): number {
		return handle === 'block-start' || handle.startsWith('block-start-') ? -1 : 1;
	}
	function isCorner(handle: ZResizableHandle): boolean {
		const value = dimensions(handle);
		return value.inline && value.block;
	}
	function cssLengthValue(value: ResizableLength): string {
		const parsed = parseResizableLength(value);
		return parsed.unit === 'percent-number' || parsed.unit === 'percent'
			? `${parsed.value}%`
			: `${parsed.value}${parsed.unit}`;
	}
	function frozenValue(width: ResizableLength, height: ResizableLength): ZResizableValue {
		return Object.freeze({ height, width });
	}
	function detail(
		handle: ZResizableHandle,
		source: ZResizableResizeSource,
		value: ZResizableValue,
		width: number,
		height: number
	): ZResizableResizeDetail {
		return Object.freeze({
			handle,
			height: value.height,
			heightPixels: height,
			source,
			width: value.width,
			widthPixels: width
		});
	}
	function sameValue(left: ZResizableValue, right: ZResizableValue): boolean {
		return Object.is(left.width, right.width) && Object.is(left.height, right.height);
	}
	function encodePixels(
		width: number,
		height: number,
		declarations: ZResizableValue
	): ZResizableValue {
		return frozenValue(
			encodeResizableLength(width, declarations.width, availableWidth, rootFontPixels),
			encodeResizableLength(height, declarations.height, availableHeight, rootFontPixels)
		);
	}
	function writeUserValue(
		value: ZResizableValue,
		handle: ZResizableHandle,
		source: ZResizableResizeSource,
		width: number,
		height: number
	): ZResizableResizeDetail {
		widthState.setFromUser(value.width);
		heightState.setFromUser(value.height);
		onSizeChange?.(value);
		const snapshot = detail(handle, source, value, width, height);
		onResize?.(snapshot);
		return snapshot;
	}

	interface PointerSession {
		readonly handle: ZResizableHandle;
		readonly node: HTMLElement;
		readonly owner: HTMLElement;
		readonly ownerWindow: Window;
		readonly direction: 'ltr' | 'rtl';
		readonly pointerId: number;
		readonly startHeight: number;
		readonly startValue: ZResizableValue;
		readonly startWidth: number;
		readonly startX: number;
		readonly startY: number;
		currentHeight: number;
		currentValue: ZResizableValue;
		currentWidth: number;
		changed: boolean;
	}
	let pointerSession: PointerSession | null = null;

	function rootOwner(): HTMLElement | null {
		if (ref?.parentElement) return ref.parentElement;
		const tree = ref?.getRootNode();
		return isDomShadowRoot(tree) && isDomHtmlElement(tree.host) ? tree.host : null;
	}
	function resizedPixels(
		handle: ZResizableHandle,
		startWidth: number,
		startHeight: number,
		deltaX: number,
		deltaY: number
	): { width: number; height: number } {
		const controlled = dimensions(handle);
		const logicalX = actualDirection === 'rtl' ? -deltaX : deltaX;
		return {
			width: controlled.inline
				? clamp(startWidth + logicalX * inlineSign(handle), widthBounds.min, widthBounds.max)
				: startWidth,
			height: controlled.block
				? clamp(startHeight + deltaY * blockSign(handle), heightBounds.min, heightBounds.max)
				: startHeight
		};
	}
	function removePointerListeners(session: PointerSession): void {
		session.ownerWindow.removeEventListener('pointermove', pointerMove);
		session.ownerWindow.removeEventListener('pointerup', pointerUp);
		session.ownerWindow.removeEventListener('pointercancel', pointerCancel);
	}
	function releasePointer(session: PointerSession): void {
		removePointerListeners(session);
		if (session.node.hasPointerCapture(session.pointerId))
			session.node.releasePointerCapture(session.pointerId);
	}
	function cancelPointer(reason: ZResizableCancelReason, restore: boolean): void {
		const session = pointerSession;
		if (!session) return;
		pointerSession = null;
		resizingHandle = null;
		releasePointer(session);
		let value = session.currentValue;
		let width = session.currentWidth;
		let height = session.currentHeight;
		if (restore && session.changed) {
			value = session.startValue;
			width = session.startWidth;
			height = session.startHeight;
			if (reason !== 'unmount') {
				widthState.setFromUser(value.width);
				heightState.setFromUser(value.height);
				onSizeChange?.(value);
			}
		}
		onResizeCancel?.(
			Object.freeze({ ...detail(session.handle, 'pointer', value, width, height), reason })
		);
	}
	function finishPointer(): void {
		const session = pointerSession;
		if (!session) return;
		pointerSession = null;
		resizingHandle = null;
		releasePointer(session);
		onResizeEnd?.(
			detail(
				session.handle,
				'pointer',
				session.currentValue,
				session.currentWidth,
				session.currentHeight
			)
		);
	}
	function pointerMove(event: PointerEvent): void {
		const session = pointerSession;
		if (!session || event.pointerId !== session.pointerId) return;
		if (
			rootOwner() !== session.owner ||
			ref?.ownerDocument.defaultView !== session.ownerWindow ||
			actualDirection !== session.direction ||
			!ref?.contains(session.node)
		) {
			cancelPointer('owner-change', false);
			return;
		}
		event.preventDefault();
		const next = resizedPixels(
			session.handle,
			session.startWidth,
			session.startHeight,
			event.clientX - session.startX,
			event.clientY - session.startY
		);
		if (
			Math.abs(next.width - session.currentWidth) < 0.001 &&
			Math.abs(next.height - session.currentHeight) < 0.001
		)
			return;
		session.changed = true;
		session.currentWidth = next.width;
		session.currentHeight = next.height;
		session.currentValue = encodePixels(next.width, next.height, session.startValue);
		writeUserValue(session.currentValue, session.handle, 'pointer', next.width, next.height);
	}
	function pointerUp(event: PointerEvent): void {
		if (pointerSession?.pointerId === event.pointerId) finishPointer();
	}
	function pointerCancel(event: PointerEvent): void {
		if (pointerSession?.pointerId === event.pointerId) cancelPointer('pointer-cancel', true);
	}
	function beginPointer(event: PointerEvent, handle: ZResizableHandle): void {
		const node = event.currentTarget as HTMLElement;
		const owner = rootOwner();
		const ownerWindow = node.ownerDocument.defaultView;
		if (
			event.defaultPrevented ||
			disabled ||
			!measured ||
			!event.isPrimary ||
			event.button !== 0 ||
			!owner ||
			!ownerWindow
		)
			return;
		event.preventDefault();
		cancelPointer('owner-change', false);
		node.focus({ preventScroll: true });
		const startValue = frozenValue(currentWidth, currentHeight);
		pointerSession = {
			changed: false,
			currentHeight: heightPixels,
			currentValue: startValue,
			currentWidth: widthPixels,
			direction: actualDirection,
			handle,
			node,
			owner,
			ownerWindow,
			pointerId: event.pointerId,
			startHeight: heightPixels,
			startValue,
			startWidth: widthPixels,
			startX: event.clientX,
			startY: event.clientY
		};
		resizingHandle = handle;
		try {
			node.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic browser events have no active pointer; owner Window listeners still
			// exercise the same production lifecycle.
		}
		ownerWindow.addEventListener('pointermove', pointerMove, { passive: false });
		ownerWindow.addEventListener('pointerup', pointerUp);
		ownerWindow.addEventListener('pointercancel', pointerCancel);
		onResizeStart?.(detail(handle, 'pointer', startValue, widthPixels, heightPixels));
	}
	function lostCapture(event: PointerEvent): void {
		if (pointerSession?.pointerId === event.pointerId) cancelPointer('lost-capture', true);
	}

	function discrete(handle: ZResizableHandle, width: number, height: number): void {
		if (disabled || !measured) return;
		const before = frozenValue(currentWidth, currentHeight);
		const start = detail(handle, 'keyboard', before, widthPixels, heightPixels);
		onResizeStart?.(start);
		const changed =
			Math.abs(width - widthPixels) >= 0.001 || Math.abs(height - heightPixels) >= 0.001;
		const snapshot = changed
			? writeUserValue(encodePixels(width, height, before), handle, 'keyboard', width, height)
			: start;
		onResizeEnd?.(snapshot);
	}
	function keydown(event: KeyboardEvent, handle: ZResizableHandle): void {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			disabled ||
			!measured
		)
			return;
		const controlled = dimensions(handle);
		const amount = event.shiftKey ? resolvedShiftStep : resolvedStep;
		let deltaX = 0;
		let deltaY = 0;
		if (controlled.inline && event.key === 'ArrowLeft') deltaX = -amount;
		else if (controlled.inline && event.key === 'ArrowRight') deltaX = amount;
		else if (controlled.block && event.key === 'ArrowUp') deltaY = -amount;
		else if (controlled.block && event.key === 'ArrowDown') deltaY = amount;
		else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			discrete(
				handle,
				controlled.inline
					? event.key === 'Home'
						? widthBounds.min
						: widthBounds.max
					: widthPixels,
				controlled.block
					? event.key === 'Home'
						? heightBounds.min
						: heightBounds.max
					: heightPixels
			);
			return;
		} else return;
		event.preventDefault();
		const next = resizedPixels(handle, widthPixels, heightPixels, deltaX, deltaY);
		discrete(handle, next.width, next.height);
	}

	function measureOwner(owner: HTMLElement): void {
		if (!ref?.isConnected) return;
		const view = ref.ownerDocument.defaultView;
		if (!view) return;
		const computed = view.getComputedStyle(owner);
		const nextWidth = Math.max(
			0,
			owner.clientWidth -
				(Number.parseFloat(computed.paddingLeft) || 0) -
				(Number.parseFloat(computed.paddingRight) || 0)
		);
		const nextHeight = Math.max(
			0,
			owner.clientHeight -
				(Number.parseFloat(computed.paddingTop) || 0) -
				(Number.parseFloat(computed.paddingBottom) || 0)
		);
		if (
			pointerSession &&
			(Math.abs(nextWidth - availableWidth) > 0.5 || Math.abs(nextHeight - availableHeight) > 0.5)
		)
			cancelPointer('geometry-change', false);
		availableWidth = nextWidth;
		availableHeight = nextHeight;
		rootFontPixels =
			Number.parseFloat(view.getComputedStyle(ref.ownerDocument.documentElement).fontSize) || 16;
		actualDirection = view.getComputedStyle(ref).direction === 'rtl' ? 'rtl' : 'ltr';
		measured =
			resolvedAxis === 'inline'
				? nextWidth > 0
				: resolvedAxis === 'block'
					? nextHeight > 0
					: nextWidth > 0 && nextHeight > 0;
	}
	$effect(() => {
		const root = ref;
		resolvedAxis;
		resolvedHandles;
		if (!root) return;
		const view = root.ownerDocument.defaultView;
		if (!view) return;
		let owner = rootOwner();
		const Observer = view.ResizeObserver;
		const observer = Observer
			? new Observer(() => {
					if (owner) measureOwner(owner);
				})
			: undefined;
		const observeOwner = (next: HTMLElement | null) => {
			observer?.disconnect();
			owner = next;
			if (owner) observer?.observe(owner);
			if (owner) measureOwner(owner);
		};
		observeOwner(owner);
		const mutation = new view.MutationObserver(() => {
			const next = rootOwner();
			if (next === owner) return;
			if (pointerSession) cancelPointer('owner-change', false);
			observeOwner(next);
		});
		mutation.observe(root.ownerDocument, { childList: true, subtree: true });
		const resize = () => owner && measureOwner(owner);
		view.addEventListener('resize', resize);
		void tick().then(() => owner && measureOwner(owner));
		return () => {
			observer?.disconnect();
			mutation.disconnect();
			view.removeEventListener('resize', resize);
		};
	});
	$effect(() => {
		resolvedHandles;
		resolvedAxis;
		configuration;
		disabled;
		untrack(() => {
			if (
				pointerSession &&
				(disabled ||
					!resolvedHandles.includes(pointerSession.handle) ||
					!ref?.contains(pointerSession.node))
			)
				cancelPointer('owner-change', false);
		});
	});
	$effect(() => {
		const external = frozenValue(currentWidth, currentHeight);
		untrack(() => {
			if (pointerSession && !sameValue(external, pointerSession.currentValue))
				cancelPointer('external-update', false);
		});
	});

	export function reset(): void {
		if (pointerSession) cancelPointer('external-update', false);
		widthState.reset();
		heightState.reset();
		const value = frozenValue(resetWidth, resetHeight);
		onSizeChange?.(value);
	}
	onDestroy(() => {
		if (pointerSession) cancelPointer('unmount', false);
	});

	function label(handle: ZResizableHandle): string {
		const position = [
			handle.startsWith('block-start')
				? zui.localePack.common.resizeBlockStart
				: handle.startsWith('block-end')
					? zui.localePack.common.resizeBlockEnd
					: undefined,
			handle === 'inline-start' || handle.endsWith('inline-start')
				? zui.localePack.common.resizeInlineStart
				: handle === 'inline-end' || handle.endsWith('inline-end')
					? zui.localePack.common.resizeInlineEnd
					: undefined
		]
			.filter((part): part is string => part !== undefined)
			.join(', ');
		const value = handleLabel?.(handle) ?? zui.localePack.common.resizeHandle(position);
		if (typeof value !== 'string' || !value.trim())
			throw new TypeError('ZResizable handle labels must not be empty.');
		return value;
	}
	function context(handle: ZResizableHandle): ZResizableHandleContext {
		return Object.freeze({
			axis: resolvedAxis,
			disabled,
			handle,
			resizing: resizingHandle === handle
		});
	}
	function edgeMinimum(handle: ZResizableHandle): number | undefined {
		const value = dimensions(handle);
		return value.inline && !value.block
			? widthBounds.min
			: !value.inline && value.block
				? heightBounds.min
				: undefined;
	}
	function edgeMaximum(handle: ZResizableHandle): number | undefined {
		const value = dimensions(handle);
		return value.inline && !value.block
			? widthBounds.max
			: !value.inline && value.block
				? heightBounds.max
				: undefined;
	}
	function edgeCurrent(handle: ZResizableHandle): number | undefined {
		const value = dimensions(handle);
		return value.inline && !value.block
			? widthPixels
			: !value.inline && value.block
				? heightPixels
				: undefined;
	}

	const classes = $derived(zui.slots(recipe, {}));
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const variables = $derived(readIcssCarrier(rest));
	const styleVariables = $derived({
		...variables,
		'--zui-resizable-handle-size': metrics.indicatorSize,
		'--zui-resizable-height': cssLengthValue(renderedHeight),
		'--zui-resizable-width': cssLengthValue(renderedWidth)
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(styleVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	data-axis={resolvedAxis}
	data-disabled={disabled || undefined}
	data-measured={measured ? 'true' : 'false'}
	data-resizing={resizingHandle !== null ? 'true' : undefined}
	data-size={resolvedSize}
	dir={resolvedDirection}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: styleVariables }}
>
	{@render children?.()}
	{#each resolvedHandles as handle (handle)}
		{@const corner = isCorner(handle)}
		{@const inactive = disabled || !measured}
		{#if corner}
			<button
				aria-label={label(handle)}
				class={classes.handle}
				data-corner="true"
				data-disabled={disabled || undefined}
				data-direction={handleDirection}
				data-handle={handle}
				data-resizing={resizingHandle === handle || undefined}
				data-slot="handle"
				{disabled}
				onkeydown={(event) => keydown(event, handle)}
				onlostpointercapture={lostCapture}
				onpointerdown={(event) => beginPointer(event, handle)}
				tabindex={inactive ? -1 : 0}
				type="button"
			>
				{#if handleSnippet}{@render handleSnippet(context(handle))}{:else}<span
						aria-hidden="true"
						class={classes.grip}
						data-slot="grip"
					></span>{/if}
			</button>
		{:else}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (ARIA separator is the real keyboard and pointer resize control) -->
			<div
				aria-disabled={disabled || undefined}
				aria-label={label(handle)}
				aria-orientation={dimensions(handle).inline ? 'vertical' : 'horizontal'}
				aria-valuemax={measured ? edgeMaximum(handle) : undefined}
				aria-valuemin={measured ? edgeMinimum(handle) : undefined}
				aria-valuenow={measured ? edgeCurrent(handle) : undefined}
				class={classes.handle}
				data-disabled={disabled || undefined}
				data-direction={handleDirection}
				data-handle={handle}
				data-resizing={resizingHandle === handle || undefined}
				data-slot="handle"
				onkeydown={(event) => keydown(event, handle)}
				onlostpointercapture={lostCapture}
				onpointerdown={(event) => beginPointer(event, handle)}
				role="separator"
				tabindex={inactive ? -1 : 0}
			>
				{#if handleSnippet}{@render handleSnippet(context(handle))}{:else}<span
						aria-hidden="true"
						class={classes.grip}
						data-slot="grip"
					></span>{/if}
			</div>
		{/if}
	{/each}
</div>
