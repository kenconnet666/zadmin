<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import type { LogicalCollectionView } from '../../runtime/collection/logical-collection.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { ChoiceVirtualController } from '../compound/choice-virtualization.js';
	import type { TransferItem } from './ZTransfer.svelte';

	export interface TransferPaneProps {
		readonly active: ActiveDescendant<SelectionKey, TransferItem>;
		readonly checked: ReadonlySet<SelectionKey>;
		readonly controlId: string;
		readonly describedBy?: string;
		readonly disabled: boolean;
		readonly emptyText: string;
		readonly filterable: boolean;
		readonly invalid: boolean;
		readonly label: string;
		readonly labelId: string;
		readonly labelledBy: string;
		readonly loading: boolean;
		readonly loadingText: string;
		listRef?: HTMLDivElement | null;
		readonly onControllerChange: (controller: ChoiceVirtualController<SelectionKey> | null) => void;
		readonly onFilterKeydown: (event: KeyboardEvent) => void;
		readonly onListKeydown: (event: KeyboardEvent) => void;
		readonly onToggle: (item: TransferItem) => void;
		readonly orphanText?: string;
		query?: string;
		readonly readonly: boolean;
		readonly required: boolean;
		readonly searchPlaceholder: string;
		readonly totalCount: number;
		readonly view: LogicalCollectionView<SelectionKey, TransferItem>;
		readonly virtual: boolean;
		readonly virtualHeight: number;
		readonly virtualItemSize: number;
		readonly virtualOverscan: number;
	}
</script>

<script lang="ts">
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import ZInput from './ZInput.svelte';
	import ZVirtualList from '../data-display/ZVirtualList.svelte';

	const panelRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flex.raw('1 1 14rem');
			s.flexDirection.column;
			s.gap._small;
			s.minWidth._menu;
			s.padding._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.fontWeight._semibold;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const listRecipe = defineRecipe({
		base: () => undefined,
		variants: {
			virtual: {
				false: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._xsmall;
					s.maxHeight.rem(16);
					s.minHeight.rem(10);
					s.overflow.auto;
				},
				true: () => undefined
			}
		},
		defaultVariants: { virtual: false }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.borderRadius._small;
			s.cursor.pointer;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._surface;
					s.color._primary;
				}
			}
		},
		defaultVariants: { disabled: false, selected: false }
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const stateRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [
		panelRecipe,
		headerRecipe,
		listRecipe,
		itemRecipe,
		descriptionRecipe,
		stateRecipe
	]) {
		registerRecipeHmr(import.meta, recipe);
	}

	let {
		active,
		checked,
		controlId,
		describedBy,
		disabled,
		emptyText,
		filterable,
		invalid,
		label,
		labelId,
		labelledBy,
		loading,
		loadingText,
		listRef = $bindable(null),
		onControllerChange,
		onFilterKeydown,
		onListKeydown,
		onToggle,
		orphanText,
		query = $bindable(''),
		readonly,
		required,
		searchPlaceholder,
		totalCount,
		view,
		virtual,
		virtualHeight,
		virtualItemSize,
		virtualOverscan
	}: TransferPaneProps = $props();
	const zui = useZui();
	const panelClass = $derived(zui.recipe(panelRecipe));
	const headerClass = $derived(zui.recipe(headerRecipe));
	const listClass = $derived(zui.recipe(listRecipe, { virtual }));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const stateClass = $derived(zui.recipe(stateRecipe));
	let controller = $state<ChoiceVirtualController<SelectionKey> | null>(null);

	$effect(() => {
		onControllerChange(virtual ? controller : null);
		return () => onControllerChange(null);
	});

	function itemKey(item: (typeof view.items)[number]): SelectionKey {
		return item.key;
	}

	function itemId(item: (typeof view.items)[number]): string {
		return active.idFor(item.key);
	}

	function itemDisabled(item: (typeof view.items)[number]): boolean {
		return disabled || item.disabled;
	}

	function itemSelected(item: (typeof view.items)[number]): boolean {
		return checked.has(item.key);
	}

	function mountVirtualItem(key: SelectionKey, element: HTMLElement): () => void {
		return active.mount(key, element);
	}

	function attachItem(item: TransferItem, mount: boolean): Attachment<HTMLDivElement> {
		return (node) => {
			const stopMount = mount ? active.mount(item.key, node) : undefined;
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
				if (!disabled && !readonly && !item.disabled) onToggle(item);
			};
			node.addEventListener('click', handleClick);
			node.addEventListener('pointerdown', handlePointerDown);
			node.addEventListener('pointermove', handlePointerMove);
			return () => {
				stopMount?.();
				node.removeEventListener('click', handleClick);
				node.removeEventListener('pointerdown', handlePointerDown);
				node.removeEventListener('pointermove', handlePointerMove);
			};
		};
	}

	function handleListFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		if (event.target === event.currentTarget) active.reconcile();
	}

	function handleListKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onListKeydown(event);
	}

	function handleFilterKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		onFilterKeydown(event);
	}
</script>

<div class={panelClass} data-slot="panel" role="group" aria-labelledby={labelId}>
	<header class={headerClass}>
		<span id={labelId}>{label}</span><span>{checked.size} / {totalCount}</span>
	</header>
	{#if filterable}
		<ZInput
			aria-controls={controlId}
			aria-label={`${label}: ${searchPlaceholder}`}
			bind:value={query}
			form={undefined}
			name=""
			placeholder={searchPlaceholder}
			{readonly}
			resetOnForm={false}
			size="small"
			{disabled}
			onkeydown={handleFilterKeydown}
		/>
	{/if}
	{#if virtual}
		<ZVirtualList
			aria-activedescendant={active.activeId}
			aria-busy={loading || undefined}
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			aria-label={label}
			aria-labelledby={labelledBy}
			aria-multiselectable="true"
			aria-readonly={readonly || undefined}
			aria-required={required || undefined}
			bind:controller
			bind:ref={listRef}
			class={listClass}
			data-slot="list"
			height={virtualHeight}
			id={controlId}
			{itemDisabled}
			{itemId}
			{itemKey}
			itemRole="option"
			{itemSelected}
			itemSize={virtualItemSize}
			items={view.items}
			{loading}
			overscan={virtualOverscan}
			role="listbox"
			tabindex={disabled ? -1 : 0}
			onItemMount={mountVirtualItem}
			onfocus={handleListFocus}
			onkeydown={handleListKeydown}
		>
			{#snippet item(logicalItem)}
				<div
					{@attach attachItem(logicalItem.value, false)}
					class={zui.recipe(itemRecipe, {
						disabled: disabled || logicalItem.disabled,
						selected: checked.has(logicalItem.key)
					})}
					data-slot="item-content"
					data-state={checked.has(logicalItem.key) ? 'selected' : 'unselected'}
					style="box-sizing: border-box; height: 100%;"
				>
					<div>{logicalItem.value.label}</div>
					{#if logicalItem.value.description}
						<div class={descriptionClass}>{logicalItem.value.description}</div>
					{/if}
				</div>
			{/snippet}
			{#snippet empty()}
				<span role="status"
					>{#if loading}{loadingText}{:else}{orphanText ?? emptyText}{/if}</span
				>
			{/snippet}
			{#snippet loadingContent()}
				<span role="status">{loadingText}</span>
			{/snippet}
		</ZVirtualList>
		{#if view.size > 0 && (loading || orphanText)}
			<div class={stateClass} data-slot="status" role="status">
				{loading ? loadingText : orphanText}
			</div>
		{/if}
	{:else}
		<div
			aria-activedescendant={active.activeId}
			aria-busy={loading || undefined}
			aria-describedby={describedBy}
			aria-disabled={disabled || undefined}
			aria-invalid={invalid || undefined}
			aria-label={label}
			aria-labelledby={labelledBy}
			aria-multiselectable="true"
			aria-readonly={readonly || undefined}
			aria-required={required || undefined}
			bind:this={listRef}
			class={listClass}
			data-slot="list"
			id={controlId}
			role="listbox"
			tabindex={disabled ? -1 : 0}
			onfocus={handleListFocus}
			onkeydown={handleListKeydown}
		>
			{#each view.items as logicalItem (logicalItem.key)}
				<div
					{@attach attachItem(logicalItem.value, true)}
					class={zui.recipe(itemRecipe, {
						disabled: disabled || logicalItem.disabled,
						selected: checked.has(logicalItem.key)
					})}
					data-disabled={disabled || logicalItem.disabled || undefined}
					data-slot="item"
					data-state={checked.has(logicalItem.key) ? 'selected' : 'unselected'}
					id={active.idFor(logicalItem.key)}
					role="option"
					aria-disabled={disabled || logicalItem.disabled || undefined}
					aria-selected={checked.has(logicalItem.key)}
					tabindex={-1}
				>
					<div>{logicalItem.value.label}</div>
					{#if logicalItem.value.description}
						<div class={descriptionClass}>{logicalItem.value.description}</div>
					{/if}
				</div>
			{/each}
		</div>
		{#if view.size === 0}
			<div class={stateClass} data-slot="status" role="status">
				{loading ? loadingText : (orphanText ?? emptyText)}
			</div>
		{:else if loading || orphanText}
			<div class={stateClass} data-slot="status" role="status">
				{loading ? loadingText : orphanText}
			</div>
		{/if}
	{/if}
</div>
