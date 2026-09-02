<script module lang="ts">
	import type { SelectionKey as PublicSelectionKey } from '../../runtime/collection/selection.js';

	export type CascaderLoadState = 'error' | 'loading';

	export interface CascaderColumnItem<TKey extends PublicSelectionKey = PublicSelectionKey> {
		readonly disabled: boolean;
		readonly hasChildren: boolean;
		readonly key: TKey;
		readonly label: string;
		readonly loadState?: CascaderLoadState;
		/** Remains navigable, but cannot commit a leaf selection. */
		readonly selectionDisabled?: boolean;
		readonly textValue: string;
	}

	export interface CascaderColumnController<TKey extends PublicSelectionKey = PublicSelectionKey> {
		readonly activeKey: TKey | undefined;
		focus(key?: TKey): boolean;
	}

	export interface CascaderColumnProps<TKey extends PublicSelectionKey = PublicSelectionKey> {
		readonly busy: boolean;
		readonly columnId: string;
		readonly disabled: boolean;
		readonly emptyText: string;
		readonly items: readonly CascaderColumnItem<TKey>[];
		readonly label: string;
		readonly level: number;
		readonly loadingText: string;
		readonly onChoose: (item: CascaderColumnItem<TKey>) => void;
		readonly onControllerChange: (
			level: number,
			controller: CascaderColumnController<TKey> | null
		) => void;
		readonly onFocusParent: (level: number) => void;
		readonly selectedKey?: TKey;
		readonly virtual: boolean;
		readonly virtualHeight: number;
		readonly virtualItemSize: number;
		readonly virtualOverscan: number;
	}
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import type { Attachment } from 'svelte/attachments';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { Typeahead } from '../../runtime/collection/typeahead.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		createChoiceVirtualMountBridge,
		type ChoiceVirtualController
	} from '../compound/choice-virtualization.js';
	import ZVirtualList from '../data-display/ZVirtualList.svelte';
	import ZSpinner from '../feedback/ZSpinner.svelte';

	const listRecipe = defineRecipe({
		base: (s) => {
			s.minWidth._menu;
			s.outlineStyle.none;
		},
		variants: {
			virtual: {
				false: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._xsmall;
					s.maxHeight.rem(18);
					s.overflow.auto;
					s.padding._small;
				},
				true: () => undefined
			}
		},
		defaultVariants: { virtual: false }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.gap._small;
			s.height.percent(100);
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
		},
		variants: {
			active: { false: () => undefined, true: (s) => s.backgroundColor._surface },
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			selected: { false: () => undefined, true: (s) => s.color._primary }
		},
		defaultVariants: { active: false, disabled: false, selected: false }
	});
	const stateRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
			s.textAlign.center;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [listRecipe, itemRecipe, stateRecipe])
		registerRecipeHmr(import.meta, recipe);

	let {
		busy,
		columnId,
		disabled,
		emptyText,
		items,
		label,
		level,
		loadingText,
		onChoose,
		onControllerChange,
		onFocusParent,
		selectedKey,
		virtual,
		virtualHeight,
		virtualItemSize,
		virtualOverscan
	}: CascaderColumnProps<TKey> = $props();
	const zui = useZui();
	const collection = $derived(
		new LogicalCollection<TKey, CascaderColumnItem<TKey>>(
			items,
			{
				disabled: (item) => item.disabled,
				key: (item) => item.key,
				textValue: (item) => item.textValue
			},
			{ name: 'ZCascader column' }
		)
	);
	const view = $derived(collection.full);
	const mounted = new MountedElements<TKey>();
	const virtualMount = createChoiceVirtualMountBridge(mounted);
	const navigation = new CollectionNavigation<TKey, CascaderColumnItem<TKey>>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => false,
		orientation: () => 'vertical',
		view: () => view
	});
	const active = new ActiveDescendant({
		idBase: () => columnId,
		mounted,
		navigation,
		virtualizer: virtualMount
	});
	const typeahead = new Typeahead<TKey>({ locale: () => zui.locale });
	let listRef = $state<HTMLDivElement | null>(null);
	let virtualController = $state<ChoiceVirtualController<TKey> | null>(null);
	const listClass = $derived(zui.recipe(listRecipe, { virtual }));
	const stateClass = $derived(zui.recipe(stateRecipe));

	const controller: CascaderColumnController<TKey> = {
		get activeKey() {
			return active.activeKey;
		},
		focus(key) {
			const target = key !== undefined && view.get(key) !== undefined ? key : active.reconcile();
			if (target !== undefined) active.set(target, 'programmatic');
			listRef?.focus({ preventScroll: true });
			return target !== undefined;
		}
	};

	$effect(() => {
		virtualMount.connect(virtual ? virtualController : null, active.activeKey);
		return () => virtualMount.connect(null);
	});
	$effect(() => {
		active.prune(view.keys);
		if (selectedKey !== undefined && view.get(selectedKey) !== undefined)
			active.set(selectedKey, 'programmatic');
		else active.reconcile();
	});
	$effect(() => {
		onControllerChange(level, controller);
		return () => onControllerChange(level, null);
	});

	function itemKey(item: CascaderColumnItem<TKey>): TKey {
		return item.key;
	}
	function itemId(item: CascaderColumnItem<TKey>): string {
		return active.idFor(item.key);
	}
	function itemDisabled(item: CascaderColumnItem<TKey>): boolean {
		return disabled || item.disabled;
	}
	function itemSelected(item: CascaderColumnItem<TKey>): boolean {
		return selectedKey !== undefined && Object.is(selectedKey, item.key);
	}
	function mountVirtualItem(key: TKey, element: HTMLElement): () => void {
		return active.mount(key, element);
	}
	function attachItem(item: CascaderColumnItem<TKey>, mount: boolean): Attachment<HTMLDivElement> {
		return (element) => {
			const unmount = mount ? active.mount(item.key, element) : undefined;
			const handlePointerDown = (event: PointerEvent): void => {
				if (disabled) return;
				event.preventDefault();
				listRef?.focus({ preventScroll: true });
				active.set(item.key, 'pointer');
			};
			const handlePointerMove = (): void => {
				if (!disabled && !item.disabled) active.set(item.key, 'pointer');
			};
			const handleClick = (): void => {
				if (!disabled && !item.disabled) onChoose(item);
			};
			element.addEventListener('click', handleClick);
			element.addEventListener('pointerdown', handlePointerDown);
			element.addEventListener('pointermove', handlePointerMove);
			return () => {
				unmount?.();
				element.removeEventListener('click', handleClick);
				element.removeEventListener('pointerdown', handlePointerDown);
				element.removeEventListener('pointermove', handlePointerMove);
			};
		};
	}
	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		if (event.target === event.currentTarget) active.reconcile();
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		if (disabled || isKeyboardComposing(event)) return;
		if (active.handleKey(event)) return;
		const key = active.activeKey;
		const item = key === undefined ? undefined : view.get(key)?.value;
		if (!item) return;
		const expandKey = zui.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
		const collapseKey = zui.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
		if (event.key === expandKey && item.hasChildren) {
			event.preventDefault();
			onChoose(item);
			return;
		}
		if (event.key === collapseKey && level > 0) {
			event.preventDefault();
			onFocusParent(level);
			return;
		}
		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				onChoose(item);
				return;
			default: {
				const match = typeahead.search(event.key, view.items, item.key);
				if (match !== undefined) {
					event.preventDefault();
					active.set(match, 'keyboard');
				}
			}
		}
	}
</script>

{#snippet itemContent(item: CascaderColumnItem<TKey>)}
	<span>{item.label}</span>
	<span aria-hidden="true">
		{#if item.loadState === 'loading'}
			<ZSpinner aria-hidden="true" size="small" tone="inherit" />
		{:else if item.loadState === 'error'}
			<RotateCcw size={15} />
		{:else if item.hasChildren}
			{#if zui.direction === 'rtl'}<ChevronLeft size={15} />{:else}<ChevronRight size={15} />{/if}
		{/if}
	</span>
{/snippet}

{#snippet virtualItemBody(item: CascaderColumnItem<TKey>)}
	<div
		{@attach attachItem(item, false)}
		class={zui.recipe(itemRecipe, {
			active: Object.is(active.activeKey, item.key),
			disabled: disabled || item.disabled,
			selected: itemSelected(item)
		})}
		data-slot="item-content"
		data-active={Object.is(active.activeKey, item.key) || undefined}
		data-load-state={item.loadState}
		data-selection-disabled={item.selectionDisabled || undefined}
		data-selected={itemSelected(item) || undefined}
	>
		{@render itemContent(item)}
	</div>
{/snippet}

{#if virtual}
	<ZVirtualList
		aria-activedescendant={active.activeId}
		aria-busy={busy || undefined}
		aria-label={label}
		bind:controller={virtualController}
		bind:ref={listRef}
		class={listClass}
		data-slot="column"
		height={virtualHeight}
		id={columnId}
		{itemDisabled}
		{itemId}
		{itemKey}
		itemRole="option"
		{itemSelected}
		itemSize={virtualItemSize}
		{items}
		loading={busy && items.length === 0}
		overscan={virtualOverscan}
		role="listbox"
		tabindex={disabled ? -1 : 0}
		onItemMount={mountVirtualItem}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
	>
		{#snippet item(item)}{@render virtualItemBody(item)}{/snippet}
		{#snippet empty()}<span class={stateClass} role="status">{emptyText}</span>{/snippet}
		{#snippet loadingContent()}<span class={stateClass} role="status">{loadingText}</span>{/snippet}
	</ZVirtualList>
{:else}
	<div
		aria-activedescendant={active.activeId}
		aria-busy={busy || undefined}
		aria-label={label}
		bind:this={listRef}
		class={listClass}
		data-slot="column"
		id={columnId}
		role="listbox"
		tabindex={disabled ? -1 : 0}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
	>
		{#each items as item, index (item.key)}
			<div
				{@attach attachItem(item, true)}
				class={zui.recipe(itemRecipe, {
					active: Object.is(active.activeKey, item.key),
					disabled: disabled || item.disabled,
					selected: itemSelected(item)
				})}
				data-active={Object.is(active.activeKey, item.key) || undefined}
				data-load-state={item.loadState}
				data-selected={itemSelected(item) || undefined}
				data-slot="item-content"
				data-selection-disabled={item.selectionDisabled || undefined}
				id={active.idFor(item.key)}
				role="option"
				aria-disabled={disabled || item.disabled || undefined}
				aria-posinset={index + 1}
				aria-selected={itemSelected(item)}
				aria-setsize={items.length}
				tabindex={-1}
			>
				{@render itemContent(item)}
			</div>
		{/each}
		{#if items.length === 0}
			<div class={stateClass} data-slot="status" role="status">
				{busy ? loadingText : emptyText}
			</div>
		{/if}
	</div>
{/if}
