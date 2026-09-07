<script module lang="ts">
	import type { Snippet } from 'svelte';
	import { defineRecipe } from '../../../recipes/define.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { SortableItemContext } from '../../../runtime/drag-drop/types.js';
	import {
		controlSizeMetrics,
		controlSizeStyles,
		type ZControlSize
	} from '../../../runtime/foundation/control-size.js';

	const rowRecipe = defineRecipe(
		{
			base: (s) => {
				s.alignItems.center;
				s.backgroundColor._canvas;
				s.boxSizing.borderBox;
				s.color._text;
				s.fontFamily._sans;
				s.lineHeight._normal;
				s.minWidth.px(0);
				s.maxWidth._full;
				s.paddingBlock._small;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.display.grid;
				s.gap._small;
				s.gridTemplateColumns.raw('auto minmax(0, 1fr) auto');
				s.transitionDuration._fast;
				s.transitionProperty.raw('background-color, border-color, box-shadow, opacity');
				s.transitionTimingFunction._standard;
				s._selector('[data-reduced-motion="true"] &', (s) => s.transitionDuration.ms(0));
			},
			variants: {
				disabled: {
					false: () => undefined,
					true: (s) => s.color._textMuted
				},
				dragging: {
					false: () => undefined,
					true: (s) => {
						s.backgroundColor._primarySubtle;
						s.borderColor._primary;
						s.boxShadow._medium;
					}
				},
				orientation: {
					horizontal: (s) => s.flexShrink(0),
					vertical: (s) => s.width._full
				},
				pending: {
					false: () => undefined,
					true: (s) => s.backgroundColor._surface
				},
				readonly: {
					false: () => undefined,
					true: (s) => s.backgroundColor._neutralSubtle
				},
				size: controlSizeStyles,
				targeted: {
					false: () => undefined,
					true: (s) => {
						s.backgroundColor._primarySubtle;
						s.borderColor._primary;
					}
				}
			},
			defaultVariants: {
				disabled: false,
				dragging: false,
				orientation: 'vertical',
				pending: false,
				readonly: false,
				size: 'medium',
				targeted: false
			}
		},
		import.meta
	);
	const contentRecipe = defineRecipe(
		{
			base: (s) => {
				s.minWidth.px(0);
				s.overflowWrap.anywhere;
			},
			variants: {},
			defaultVariants: {}
		},
		import.meta
	);
	const actionsRecipe = defineRecipe(
		{
			base: (s) => {
				s.alignItems.center;
				s.display.flex;
				s.gap._xsmall;
			},
			variants: {},
			defaultVariants: {}
		},
		import.meta
	);
	const handleRecipe = defineRecipe(
		{
			base: (s) => {
				s.touchAction.none;
				s.userSelect.none;
				s.cursor.grab;
			},
			variants: { dragging: { false: () => undefined, true: (s) => s.cursor.grabbing } },
			defaultVariants: { dragging: false }
		},
		import.meta
	);

	export interface SortableRowProps<T, TKey extends SelectionKey = SelectionKey> {
		readonly actions?: Snippet<[context: SortableItemContext<TKey>]>;
		readonly count: number;
		readonly disabled: boolean;
		readonly domId: string;
		readonly index: number;
		readonly item: T;
		readonly itemContent?: Snippet<[item: T, context: SortableItemContext<TKey>]>;
		readonly key: TKey;
		readonly label: string;
		readonly onElements: (key: TKey, row: HTMLElement, handle: HTMLButtonElement) => () => void;
		readonly onMove: (toIndex: number) => Promise<boolean>;
		readonly orientation: 'horizontal' | 'vertical';
		readonly ownerId: string;
		readonly pending: boolean;
		readonly readonly: boolean;
		readonly size: ZControlSize;
	}
</script>

<script lang="ts" generics="T, TKey extends SelectionKey = SelectionKey">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';

	import { useZui } from '../../../runtime/foundation/context.js';
	import { getElementDirection } from '../../../runtime/layer/dom-realm.js';
	import ZButton from '../../gene/ZButton.svelte';
	import SortableItem, { type SortableItemState } from './SortableItem.svelte';

	let {
		actions,
		count,
		disabled,
		domId,
		index,
		item,
		itemContent,
		key,
		label,
		onElements,
		onMove,
		orientation,
		ownerId,
		pending,
		readonly,
		size
	}: SortableRowProps<T, TKey> = $props();
	const zui = useZui();
	const attachmentKey = createAttachmentKey();
	const contentClass = $derived(zui.recipe(contentRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const unavailable = $derived(disabled || readonly || pending);
	const sortableData = $derived(Object.freeze({ key, ownerId }));
	let rowRef = $state<HTMLElement | null>(null);
	let handleRef = $state<HTMLButtonElement | null>(null);
	const direction = $derived(getElementDirection(rowRef, zui.direction));
	const iconSize = $derived(controlSizeMetrics(zui.theme, size).indicatorSize);

	$effect(() => {
		const row = rowRef;
		const handle = handleRef;
		const currentKey = key;
		const register = onElements;
		if (!row || !handle) return;
		return untrack(() => register(currentKey, row, handle));
	});

	function itemContext(state: SortableItemState): SortableItemContext<TKey> {
		return {
			get key() {
				return key;
			},
			get index() {
				return index;
			},
			get count() {
				return count;
			},
			get dragging() {
				return state.isDragging || state.isDragSource;
			},
			get targeted() {
				return state.isDropTarget;
			},
			get pending() {
				return pending;
			},
			get disabled() {
				return disabled;
			},
			get readonly() {
				return readonly;
			},
			moveTo(toIndex) {
				return unavailable ? Promise.resolve(false) : onMove(toIndex);
			}
		};
	}
</script>

<SortableItem
	id={domId}
	{index}
	group={ownerId}
	data={sortableData}
	disabled={disabled || readonly}
>
	{#snippet children(sortableState)}
		{@const context = itemContext(sortableState)}
		{@const handleAttributes = { [attachmentKey]: sortableState.attachHandle }}
		<div
			{@attach sortableState.attach}
			bind:this={rowRef}
			id={domId}
			role="listitem"
			class={zui.recipe(rowRecipe, {
				disabled,
				dragging: context.dragging,
				orientation,
				pending,
				readonly,
				size,
				targeted: context.targeted
			})}
			data-slot="row"
			data-state={pending
				? 'pending'
				: context.dragging
					? 'dragging'
					: context.targeted
						? 'targeted'
						: 'idle'}
			data-disabled={disabled || undefined}
			data-readonly={readonly || undefined}
		>
			<ZButton
				{...handleAttributes}
				bind:ref={handleRef}
				id={`${domId}-handle`}
				aria-describedby={`${ownerId}-instructions`}
				aria-label={zui.localePack.sortable.dragHandle(label)}
				data-slot="handle"
				class={zui.recipe(handleRecipe, { dragging: context.dragging })}
				disabled={unavailable}
				shape="square"
				{size}
				tone="neutral"
				variant="ghost"
			>
				<GripVertical aria-hidden="true" size={iconSize} />
			</ZButton>
			<div class={contentClass} data-slot="content">
				{#if itemContent}{@render itemContent(item, context)}{:else}{label}{/if}
			</div>
			<div class={actionsClass} data-slot="actions">
				{#if actions}
					{@render actions(context)}
				{:else}
					<ZButton
						data-slot="move-previous"
						aria-label={zui.localePack.sortable.movePrevious(label)}
						disabled={unavailable || index <= 0}
						onclick={() => void context.moveTo(index - 1)}
						shape="square"
						{size}
						tone="neutral"
						variant="ghost"
					>
						{#if orientation === 'vertical'}<ArrowUp aria-hidden="true" size={iconSize} />
						{:else if direction === 'rtl'}<ArrowRight aria-hidden="true" size={iconSize} />
						{:else}<ArrowLeft aria-hidden="true" size={iconSize} />{/if}
					</ZButton>
					<ZButton
						data-slot="move-next"
						aria-label={zui.localePack.sortable.moveNext(label)}
						disabled={unavailable || index >= count - 1}
						onclick={() => void context.moveTo(index + 1)}
						shape="square"
						{size}
						tone="neutral"
						variant="ghost"
					>
						{#if orientation === 'vertical'}<ArrowDown aria-hidden="true" size={iconSize} />
						{:else if direction === 'rtl'}<ArrowLeft aria-hidden="true" size={iconSize} />
						{:else}<ArrowRight aria-hidden="true" size={iconSize} />{/if}
					</ZButton>
				{/if}
			</div>
		</div>
	{/snippet}
</SortableItem>
