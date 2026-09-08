<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
	import type { ZStackProps } from '../../layout/ZStack.svelte';
	import type {
		SortableItemContext,
		SortableMoveEnd,
		SortableMoveRequest
	} from '../../../runtime/drag-drop/types.js';
	/* eslint-disable no-import-assign -- Type-only re-exports have no runtime writes; the Svelte scope analyzer marks their references as assignments. */
	export type {
		SortableItemContext,
		SortableMoveEnd,
		SortableMoveRequest,
		SortableMoveResult
	} from '../../../runtime/drag-drop/types.js';
	/* eslint-enable no-import-assign */

	export interface ZSortableProps<
		T,
		TKey extends PublicSelectionKey = PublicSelectionKey
	> extends Omit<ZStackProps, 'children' | 'direction'> {
		readonly items: readonly T[];
		readonly itemKey: (item: T) => TKey;
		readonly itemLabel: (item: T) => string;
		readonly itemDisabled?: (item: T) => boolean;
		readonly onMoveRequest: (request: SortableMoveRequest<T, TKey>) => boolean | Promise<boolean>;
		readonly onMoveEnd?: (detail: SortableMoveEnd<T, TKey>) => void;
		readonly item?: Snippet<[item: T, context: SortableItemContext<TKey>]>;
		readonly actions?: Snippet<[context: SortableItemContext<TKey>]>;
		readonly orientation?: 'horizontal' | 'vertical';
		readonly disabled?: boolean;
		readonly readonly?: boolean;
		readonly size?: ZControlSize;
		readonly nonce?: string;
	}

	export const zuiMetadata = {
		category: 'layout',
		id: 'sortable',
		name: 'ZSortable',
		importStatement: "import { ZSortable } from '@zadmin/zui';",
		dependencies: [
			'ZStack',
			'ZButton',
			'LogicalCollection',
			'MountedElements',
			'@dnd-kit/svelte',
			'Theme layout motion'
		],
		bindings: [{ name: 'ref', type: 'HTMLDivElement | null', description: '真实列表根节点。' }],
		props: [
			{
				name: 'items',
				type: 'readonly T[]',
				required: true,
				default: '必填',
				description: '调用方唯一拥有的当前顺序；拖动预览不修改业务数组。'
			},
			{
				name: 'itemKey',
				type: '(item: T) => TKey',
				required: true,
				default: '必填',
				description: '稳定且唯一的string/number身份，保留0与字符串0的区别。'
			},
			{
				name: 'itemLabel',
				type: '(item: T) => string',
				required: true,
				default: '必填',
				description: '非空可读名称，用于手柄、操作按钮及结果公告。'
			},
			{
				name: 'itemDisabled',
				type: '(item: T) => boolean',
				default: 'undefined',
				description: '禁止该项作为拖动源和落点。'
			},
			{
				name: 'onMoveRequest',
				type: '(request: SortableMoveRequest<T, TKey>) => boolean | Promise<boolean>',
				required: true,
				default: '必填',
				description:
					'接受方应用nextItems或调用上层move操作，再返回true；false拒绝。signal通知取消。'
			},
			{
				name: 'onMoveEnd',
				type: '(detail: SortableMoveEnd<T, TKey>) => void',
				default: 'undefined',
				description: '已发出的移动请求结束后通知；不自动写入items。'
			},
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: "'vertical'",
				description: '复用ZStack的水平或垂直布局；wrap可形成多行。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '停止拖动和替代操作，并取消在途请求。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: 'false',
				description: '保留内容与表单值，禁止结构写入并取消在途请求。'
			},
			{
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
				default: 'componentDefaults.sortable > Provider density',
				description: '统一行内留白、手柄、移动按钮和文字比例。'
			},
			{
				name: 'nonce',
				type: 'string',
				default: 'undefined',
				description: '显式传给拖放依赖的style registry；默认反馈不产生inline style。'
			},
			{
				name: 'gap',
				type: "ZStackProps['gap']",
				default: "'small'",
				description: '复用主题间距与响应式间距。'
			},
			{
				name: 'wrap',
				type: "ZStackProps['wrap']",
				default: 'horizontal为true，vertical为false',
				description: '复用ZStack响应式换行；水平布局默认换行以适应可用宽度。'
			},
			{
				name: 'item',
				type: 'Snippet<[T, SortableItemContext<TKey>]>',
				default: 'itemLabel正文',
				description: '只定制行内容，行身份、手柄和移动事务仍由Sortable管理。'
			},
			{
				name: 'actions',
				type: 'Snippet<[SortableItemContext<TKey>]>',
				default: '前移/后移动作',
				description: '定制拖动的可见替代操作；moveTo复用同一请求路径。'
			}
		],
		events: [
			{
				name: 'onMoveRequest',
				type: '(request: SortableMoveRequest<T, TKey>) => boolean | Promise<boolean>',
				description: '发出具有快照、最终索引、nextItems及AbortSignal的移动请求。'
			},
			{
				name: 'onMoveEnd',
				type: '(detail: SortableMoveEnd<T, TKey>) => void',
				description: '请求接受、拒绝、取消、过期或异常；拖动尚未请求时取消不触发。'
			}
		],
		keyboard: [
			{ key: 'Space / Enter', description: '在手柄开始拖动或放下；原生移动按钮提供独立替代路径。' },
			{ key: 'Arrow keys', description: '按真实布局选择目标，支持水平、垂直及RTL布局。' },
			{ key: 'Escape', description: '取消活动拖动或待接受请求，不提交当前预览。' }
		],
		parts: [
			{ name: 'row', description: '保留稳定key的实际列表项。' },
			{ name: 'handle', description: 'ZButton拖动手柄。' },
			{ name: 'content', description: '行内容区域。' },
			{ name: 'actions', description: '前移、后移或定制替代操作。' }
		],
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[T, SortableItemContext<TKey>]>',
				description: '定制行内容。'
			},
			{
				name: 'actions',
				type: 'Snippet<[SortableItemContext<TKey>]>',
				description: '通过moveTo定制替代操作。'
			}
		],
		states: [
			{
				name: 'data-state',
				values: ['idle', 'dragging', 'pending'],
				description: '当前交互或等待接受状态。'
			},
			{ name: 'data-disabled', values: ['true'], description: '列表已禁用。' },
			{ name: 'data-readonly', values: ['true'], description: '结构只读。' },
			{ name: 'data-reduced-motion', values: ['true'], description: '移动动画立即禁用。' }
		],
		since: 'unreleased',
		status: 'experimental',
		source: 'ui/zui/src/components/compound/sortable/ZSortable.svelte',
		summary: '受控顺序的可排序集合，鼠标、触摸、键盘与替代操作共享接受、取消和焦点规则。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="T, TKey extends PublicSelectionKey = PublicSelectionKey">
	import { onDestroy, tick, untrack } from 'svelte';
	import { DragDropProvider } from '@dnd-kit/svelte';
	import {
		DragDropManager,
		defaultPreset,
		type BeforeDragStartEvent,
		type DragStartEvent,
		type DragOverEvent,
		type DragEndEvent
	} from '@dnd-kit/dom';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import {
		applyReorderRequest,
		createReorderRequest,
		type ReorderSource
	} from '../../../runtime/collection/reorder.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { resolveControlSize } from '../../../runtime/foundation/control-size.js';
	import { ReducedMotionState } from '../../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../../theme/units.js';
	import {
		getActiveElement,
		containsComposedNode,
		isDomHtmlElement
	} from '../../../runtime/layer/dom-realm.js';
	import { DismissableLayer } from '../../../runtime/layer/dismissable-layer.js';
	import { classOnlyDragDropPlugins } from '../../../runtime/drag-drop/plugins.js';
	import { connectDragGeometry } from '../../../runtime/drag-drop/geometry.js';
	import {
		captureReorderLayout,
		animateReorderLayout
	} from '../../../runtime/drag-drop/layout-motion.js';
	import ZStack from '../../layout/ZStack.svelte';
	import ZVisuallyHidden from '../../gene/ZVisuallyHidden.svelte';
	import ZButton from '../../gene/ZButton.svelte';
	import SortableRow from './SortableRow.svelte';

	let {
		items,
		itemKey,
		itemLabel,
		itemDisabled,
		onMoveRequest,
		onMoveEnd,
		item,
		actions,
		orientation = 'vertical',
		disabled = false,
		readonly: readonlyProp = false,
		size,
		nonce,
		gap = 'small',
		wrap,
		ref = $bindable(null),
		tabindex = -1,
		'aria-label': ariaLabel,
		...rest
	}: ZSortableProps<T, TKey> = $props();
	const zui = useZui();
	const resolvedOrientation = $derived.by(() => {
		if (orientation !== 'vertical' && orientation !== 'horizontal')
			throw new TypeError('ZSortable orientation must be vertical or horizontal.');
		return orientation;
	});
	const resolvedWrap = $derived(wrap ?? resolvedOrientation === 'horizontal');
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'sortable'));
	const collection = $derived(
		new LogicalCollection<TKey, T>(
			items,
			{ key: itemKey, textValue: itemLabel, disabled: itemDisabled },
			{ name: 'ZSortable items' }
		)
	);
	const records = $derived(
		collection.full.items.map((record) => {
			const label = itemLabel(record.value);
			if (typeof label !== 'string' || !label.trim())
				throw new TypeError('ZSortable itemLabel must return a non-empty string.');
			return { ...record, label };
		})
	);
	const keys = $derived(collection.full.keys);
	const resolvedSize = $derived(
		resolveControlSize(size ?? zui.componentDefaults.sortable?.size, zui.density)
	);
	const motion = new ReducedMotionState(() => zui.motion);
	const plugins = $derived(classOnlyDragDropPlugins(defaultPreset.plugins, { nonce }));
	const manager = new DragDropManager({ plugins: untrack(() => plugins) });
	const stopGeometry = connectDragGeometry(manager);
	const rows = new MountedElements<TKey, HTMLElement>();
	const handles = new MountedElements<TKey, HTMLButtonElement>();
	let live = true;
	let animationCleanup: (() => void) | undefined;
	let announcement = $state('');
	let announcementId = $state(0);
	interface Session {
		root: HTMLElement | null;
		key: TKey;
		keys: readonly TKey[];
		source: ReorderSource;
		focus: Element | null;
	}
	interface Pending {
		root: HTMLElement;
		request: SortableMoveRequest<T, TKey>;
		expected: readonly TKey[];
		controller: AbortController;
		focus: Element | null;
		abortDrop?: () => void;
		resumeDrop?: () => void;
		completed: boolean;
	}
	let session = $state.raw<Session | null>(null);
	let pending = $state.raw<Pending | null>(null);
	const phase = $derived(pending ? 'pending' : session ? 'dragging' : 'idle');
	const messages = $derived(zui.localePack.sortable);
	const formatter = $derived(new Intl.NumberFormat(zui.locale));
	const labelFor = (key: TKey) =>
		records.find((record) => Object.is(record.key, key))?.label ?? String(key);
	const sameKeys = (left: readonly TKey[], right: readonly TKey[]) =>
		left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
	const position = (index: number) => formatter.format(index + 1);
	const count = () => formatter.format(keys.length);
	function announce(message: string): void {
		if (live) {
			announcement = message;
			announcementId += 1;
		}
	}
	function registerElements(key: TKey, row: HTMLElement, handle: HTMLButtonElement): () => void {
		const stopRow = rows.mount(key, row, row.id);
		const stopHandle = handles.mount(key, handle, handle.id);
		return () => {
			stopHandle();
			stopRow();
		};
	}
	function restoreFocus(key: TKey, before: Element | null, fallbackIndex = 0): void {
		if (!live || !ref?.isConnected) return;
		const current = getActiveElement(ref);
		if (
			current &&
			current !== ref.ownerDocument.body &&
			current !== ref.ownerDocument.documentElement &&
			!current.matches(':disabled') &&
			!current.closest('[inert]')
		)
			return;
		if (
			before?.isConnected &&
			containsComposedNode(ref, before) &&
			isDomHtmlElement(before) &&
			!before.matches(':disabled') &&
			!before.closest('[inert]')
		) {
			before.focus({ preventScroll: true });
			if (getActiveElement(ref) === before) return;
		}
		const focusHandle = (key: TKey) => {
			const element = handles.get(key)?.element;
			return (
				element &&
				!element.matches(':disabled') &&
				!element.closest('[inert]') &&
				handles.focus(key)
			);
		};
		if (!focusHandle(key)) {
			const index = Math.min(Math.max(fallbackIndex, 0), keys.length);
			const fallback = [...keys.slice(index), ...keys.slice(0, index).reverse()];
			if (!fallback.some(focusHandle)) ref.focus({ preventScroll: true });
		}
	}
	function finish(
		entry: Pending,
		result: SortableMoveEnd<T, TKey>['result'],
		error?: unknown
	): boolean {
		if (entry.completed) return false;
		entry.completed = true;
		if (pending === entry) pending = null;
		session = null;
		const accepted = result === 'accepted';
		if (accepted) entry.resumeDrop?.();
		else entry.abortDrop?.();
		if (live) {
			const label = labelFor(entry.request.key);
			announce(
				accepted
					? messages.moved(label, position(entry.request.toIndex), count())
					: result === 'error'
						? messages.error(label)
						: result === 'cancelled' || result === 'stale'
							? messages.cancelled(label)
							: messages.rejected(label)
			);
			void tick().then(() => restoreFocus(entry.request.key, entry.focus, entry.request.fromIndex));
			onMoveEnd?.({ request: entry.request, result, ...(error === undefined ? {} : { error }) });
		}
		return accepted;
	}
	function cancel(result: 'cancelled' | 'stale' = 'cancelled', stopEngine = true): void {
		animationCleanup?.();
		animationCleanup = undefined;
		const active = session;
		const entry = pending;
		if (entry) {
			entry.controller.abort();
			finish(entry, result);
		} else if (active) {
			session = null;
			if (stopEngine) manager.actions.stop({ canceled: true });
			announce(messages.cancelled(labelFor(active.key)));
			void tick().then(() =>
				restoreFocus(active.key, active.focus, active.keys.indexOf(active.key))
			);
		}
	}
	async function requestMove(
		key: TKey,
		toIndex: number,
		source: ReorderSource,
		drop?: ReturnType<DragEndEvent['suspend']>
	): Promise<boolean> {
		const abortMove = () => {
			drop?.abort();
			if (drop && !pending) cancel('cancelled', false);
			return false;
		};
		if (
			!live ||
			!ref ||
			pending ||
			(session !== null && drop === undefined) ||
			disabled ||
			readonlyProp ||
			!collection.full.get(key) ||
			collection.full.get(key)?.disabled
		) {
			return abortMove();
		}
		const target = collection.full.items[toIndex];
		if (target?.disabled) {
			return abortMove();
		}
		const move = createReorderRequest(keys, key, toIndex, source);
		if (!move) {
			const focus = session?.focus ?? getActiveElement(ref);
			session = null;
			drop?.resume();
			announce(messages.moved(labelFor(key), position(toIndex), count()));
			void tick().then(() => restoreFocus(key, focus, toIndex));
			return true;
		}
		const Controller = ref.ownerDocument.defaultView?.AbortController;
		if (!Controller) {
			return abortMove();
		}
		const controller = new Controller();
		const expected = applyReorderRequest(keys, move);
		const byKey = new Map(records.map((record) => [record.key, record.value]));
		const request = Object.freeze({
			...move,
			nextItems: Object.freeze(expected.map((key) => byKey.get(key)!)),
			signal: controller.signal
		});
		const entry: Pending = {
			root: ref,
			request,
			expected,
			controller,
			completed: false,
			focus: session?.focus ?? getActiveElement(ref),
			abortDrop: drop?.abort,
			resumeDrop: drop?.resume
		};
		animationCleanup?.();
		animationCleanup = undefined;
		pending = entry;
		announce(messages.pending(labelFor(key)));
		let result: SortableMoveEnd<T, TKey>['result'] = 'rejected';
		let failure: unknown;
		try {
			const before = captureReorderLayout(
				keys.flatMap((key) => {
					const row = rows.get(key);
					return row ? [row.element] : [];
				})
			);
			const accepted = await onMoveRequest(request);
			await tick();
			if (!live || entry.completed || controller.signal.aborted) return false;
			if (accepted && sameKeys(keys, expected)) {
				animationCleanup = animateReorderLayout(before, {
					duration: durationMilliseconds(zui.theme.duration.normal),
					easing: zui.theme.easing.standard,
					reduced: motion.current
				});
				result = 'accepted';
			}
		} catch (error) {
			result = 'error';
			failure = error;
		}
		if (!live || entry.completed || controller.signal.aborted) return false;
		return finish(entry, result, failure);
	}
	function eventKey(value: { data: Record<string, unknown> } | null): TKey | undefined {
		return value?.data.ownerId === idBase ? (value.data.key as TKey) : undefined;
	}
	function beforeDragStart(event: BeforeDragStartEvent): void {
		const key = eventKey(event.operation.source);
		if (
			disabled ||
			readonlyProp ||
			pending ||
			key === undefined ||
			!collection.full.get(key) ||
			collection.full.get(key)?.disabled
		)
			event.preventDefault();
	}
	function startDrag(event: DragStartEvent): void {
		const key = eventKey(event.operation.source);
		if (key === undefined) return;
		animationCleanup?.();
		animationCleanup = undefined;
		session = {
			root: ref,
			key,
			keys: Object.freeze([...keys]),
			source: event.operation.activatorEvent?.type.startsWith('key') ? 'keyboard' : 'pointer',
			focus: ref ? getActiveElement(ref) : null
		};
		announce(messages.started(labelFor(key), position(collection.full.indexOf(key)), count()));
	}
	function overDrag(event: DragOverEvent): void {
		if (!session || pending) return;
		const key = eventKey(event.operation.target);
		if (key !== undefined && !Object.is(key, session.key))
			announce(
				messages.target(labelFor(session.key), position(collection.full.indexOf(key)), count())
			);
	}
	function endDrag(event: DragEndEvent): void {
		const active = session;
		if (!active || pending) return;
		if (event.canceled) {
			cancel('cancelled', false);
			return;
		}
		const target = eventKey(event.operation.target);
		if (target === undefined || !sameKeys(keys, active.keys)) {
			cancel('stale');
			return;
		}
		const drop = event.suspend();
		void requestMove(active.key, collection.full.indexOf(target), active.source, drop);
	}
	$effect(() => motion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		if (!ref || phase === 'idle') return;
		const layer = new DismissableLayer(ref, {
			onDismiss: () => cancel(),
			onFocusOutside: (event) => event.preventDefault(),
			onPointerOutside: (event) => event.preventDefault()
		});
		return () => layer.destroy();
	});
	$effect(() => {
		const currentKeys = keys;
		const currentRoot = ref;
		const unavailable = disabled || readonlyProp;
		const entry = pending;
		const active = session;
		const reduced = motion.current;
		untrack(() => {
			if ((entry && entry.root !== currentRoot) || (active && active.root !== currentRoot)) {
				cancel('stale');
				return;
			}
			if (reduced) {
				animationCleanup?.();
				animationCleanup = undefined;
			}
			const movingKey = entry?.request.key ?? active?.key;
			if (unavailable || (movingKey !== undefined && collection.full.get(movingKey)?.disabled)) {
				cancel();
				return;
			}
			if (
				entry &&
				!sameKeys(currentKeys, entry.request.keys) &&
				!sameKeys(currentKeys, entry.expected)
			)
				cancel('stale');
			else if (!entry && active && !sameKeys(currentKeys, active.keys)) cancel('stale');
		});
	});
	onDestroy(() => {
		live = false;
		cancel();
		stopGeometry();
		manager.destroy();
		rows.clear();
		handles.clear();
	});
</script>

<DragDropProvider
	{manager}
	{plugins}
	onBeforeDragStart={beforeDragStart}
	onDragStart={startDrag}
	onDragOver={overDrag}
	onDragEnd={endDrag}
>
	<ZStack
		{...rest}
		bind:ref
		{gap}
		wrap={resolvedWrap}
		{tabindex}
		direction={resolvedOrientation === 'horizontal' ? 'row' : 'column'}
		role="list"
		aria-label={ariaLabel ?? messages.rootLabel}
		aria-busy={pending ? 'true' : undefined}
		data-slot="sortable"
		data-state={phase}
		data-disabled={disabled || undefined}
		data-readonly={readonlyProp || undefined}
		data-reduced-motion={motion.current || undefined}
	>
		{#each records as record, index (record.key)}
			<SortableRow
				item={record.value}
				key={record.key}
				{index}
				count={records.length}
				domId={`${idBase}-${encodeURIComponent(`${typeof record.key}:${record.key}`)}`}
				ownerId={idBase}
				label={record.label}
				orientation={resolvedOrientation}
				size={resolvedSize}
				disabled={disabled || record.disabled}
				readonly={readonlyProp}
				pending={pending !== null}
				itemContent={item}
				{actions}
				onMove={(toIndex) => requestMove(record.key, toIndex, 'action')}
				onElements={registerElements}
			/>
		{/each}
	</ZStack>
	{#if pending}
		<ZButton data-slot="cancel" size={resolvedSize} variant="ghost" onclick={() => cancel()}>
			{zui.localePack.common.cancel}
		</ZButton>
	{/if}
	<ZVisuallyHidden id={`${idBase}-instructions`}>{messages.instructions}</ZVisuallyHidden>
	<ZVisuallyHidden role="status" aria-live="polite" aria-atomic="true">
		{#key announcementId}{announcement}{/key}
	</ZVisuallyHidden>
</DragDropProvider>
