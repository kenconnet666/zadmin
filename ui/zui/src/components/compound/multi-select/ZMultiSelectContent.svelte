<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	import type { ZMultiSelectOption } from './ZMultiSelect.svelte';

	export type ZMultiSelectContentProps = Omit<
		ZPopoverContentProps,
		'aria-activedescendant' | 'ariaLabelledBy' | 'children' | 'initialFocus' | 'role'
	> & {
		readonly children?: Snippet;
		readonly empty?: Snippet;
		readonly groupLabel?: Snippet<[group: string]>;
		readonly loading?: Snippet;
		readonly option?: Snippet<[option: ZMultiSelectOption]>;
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	};

	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select-content',
		importStatement: "import { ZMultiSelectContent } from '@zadmin/zui';",
		name: 'ZMultiSelectContent',
		bindings: [
			{ description: '真实Popover shell引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZMultiSelect',
			'ZPopoverContent',
			'LogicalCollection',
			'ActiveDescendant',
			'ZVirtualList'
		],
		events: [],
		keyboard: [
			{ description: '在完整逻辑view中移动active key。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '按Provider locale文本前缀移动。', key: 'Printable characters' },
			{ description: 'toggle active option且保持打开。', key: 'Enter / Space' },
			{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '数据模式的option分组。', name: 'group' },
			{ description: '数据模式的分组标题。', name: 'group-label' },
			{ description: '空集合或加载状态。', name: 'status' }
		],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实Popover shell引用；非虚拟时它也是listbox焦点owner。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			},
			{
				default: 'false',
				description: '仅权威options且无group时启用固定行虚拟窗口与ActiveDescendant握手。',
				name: 'virtual',
				type: 'boolean'
			},
			{
				default: '240',
				description: '虚拟listbox viewport高度，单位px。',
				name: 'virtualHeight',
				type: 'number'
			},
			{
				default: '40',
				description: '虚拟option固定高度，单位px。',
				name: 'virtualItemSize',
				type: 'number'
			},
			{
				default: '4',
				description: '虚拟窗口上下额外option数量。',
				name: 'virtualOverscan',
				type: 'number'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'compound模式的ZMultiSelectItem集合。', name: 'children', type: 'Snippet' },
			{
				description: 'options数据模式的自定义option内容。',
				name: 'option',
				type: 'Snippet<[ZMultiSelectOption]>'
			},
			{ description: 'options数据模式的分组标题。', name: 'groupLabel', type: 'Snippet<[string]>' },
			{ description: '覆盖空集合状态。', name: 'empty', type: 'Snippet' },
			{ description: '覆盖异步加载状态。', name: 'loading', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary:
			'以listbox容器保持DOM焦点、用active-descendant导航完整多选集合，并为无分组options提供可选虚拟窗口。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZVirtualList from '../../data-display/ZVirtualList.svelte';
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { choiceGroupLabelRecipe, choiceStatusRecipe } from '../choice-content.js';
	import {
		assertChoiceContentContract,
		type ChoiceVirtualController
	} from '../choice-virtualization.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import ZMultiSelectItem from './ZMultiSelectItem.svelte';
	import { useZMultiSelect } from './context.svelte.js';
	import { floatingContentSizingRecipe } from '../floating-content-sizing.js';

	let {
		children,
		class: className,
		empty,
		groupLabel,
		loading,
		onkeydown,
		option,
		ref = $bindable(null),
		style,
		virtual = false,
		virtualHeight = 240,
		virtualItemSize = 40,
		virtualOverscan = 4,
		...rest
	}: ZMultiSelectContentProps = $props();
	const zui = useZui();
	const popover = useZPopover();
	const multi = useZMultiSelect();
	const groupLabelClass = $derived(zui.recipe(choiceGroupLabelRecipe));
	const statusClass = $derived(zui.recipe(choiceStatusRecipe));
	const sizingClass = $derived(
		zui.recipe(floatingContentSizingRecipe, { intrinsicWidth: !popover.matchWidth })
	);
	let virtualRef = $state<HTMLDivElement | null>(null);
	let controller = $state<ChoiceVirtualController | null>(null);

	function assertContentContract(): void {
		assertChoiceContentContract('ZMultiSelect', {
			dataMode: multi.dataMode,
			grouped: multi.grouped,
			hasChildren: children !== undefined,
			virtual
		});
	}

	untrack(assertContentContract);
	$effect(assertContentContract);

	$effect(() => {
		multi.setVirtualizer(virtual ? controller : null);
		return () => multi.setVirtualizer(null);
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || isKeyboardComposing(event)) return;
		if (multi.handleKey(event)) return;
		switch (event.key) {
			case 'Enter':
			case ' ': {
				if (multi.activeKey === undefined) return;
				event.preventDefault();
				multi.toggle(multi.activeKey, event);
				return;
			}
			default: {
				const match = multi.search(event.key);
				if (match === undefined) return;
				event.preventDefault();
				multi.setActive(match);
			}
		}
	}
</script>

{#if virtual}
	<ZPopoverContent
		{...rest}
		ariaLabelledBy={null}
		bind:ref
		class={[sizingClass, className]}
		initialFocus={() => virtualRef}
		role="presentation"
		{style}
	>
		<ZVirtualList
			aria-activedescendant={multi.activeId}
			aria-busy={multi.loading || undefined}
			aria-labelledby={popover.triggerId}
			aria-multiselectable="true"
			bind:controller
			bind:ref={virtualRef}
			height={virtualHeight}
			itemKey={(item) => item.key}
			itemRole="presentation"
			itemSize={virtualItemSize}
			items={multi.view.items}
			loading={multi.loading}
			onkeydown={handleKeydown}
			overscan={virtualOverscan}
			role="listbox"
			tabindex={-1}
		>
			{#snippet item(item, index)}
				<ZMultiSelectItem
					aria-posinset={index + 1}
					aria-setsize={multi.view.size}
					disabled={item.disabled}
					style="box-sizing: border-box; height: 100%;"
					textValue={item.textValue}
					value={item.key}
				>
					{#if option && item.value.option}
						{@render option(item.value.option)}
					{:else}
						{item.textValue}
					{/if}
				</ZMultiSelectItem>
			{/snippet}
			{#snippet empty()}
				<span role="status"
					>{#if empty}{@render empty()}{:else}{multi.emptyText}{/if}</span
				>
			{/snippet}
			{#snippet loadingContent()}
				<span role="status"
					>{#if loading}{@render loading()}{:else}{multi.loadingText}{/if}</span
				>
			{/snippet}
		</ZVirtualList>
		{#if multi.loading && multi.view.size > 0}
			<div class={statusClass} data-slot="status" role="presentation">
				<span role="status"
					>{#if loading}{@render loading()}{:else}{multi.loadingText}{/if}</span
				>
			</div>
		{/if}
	</ZPopoverContent>
{:else}
	<ZPopoverContent
		{...rest}
		aria-activedescendant={multi.activeId}
		aria-busy={multi.loading || undefined}
		aria-multiselectable="true"
		ariaLabelledBy={popover.triggerId}
		bind:ref
		class={[sizingClass, className]}
		initialFocus={() => ref}
		role="listbox"
		{style}
		onkeydown={handleKeydown}
	>
		{#if multi.dataMode}
			{#if multi.loading && multi.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if loading}{@render loading()}{:else}{multi.loadingText}{/if}</span
					>
				</div>
			{:else if multi.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if empty}{@render empty()}{:else}{multi.emptyText}{/if}</span
					>
				</div>
			{:else}
				{#each multi.view.groups as group (group.key)}
					<div
						aria-label={group.key || undefined}
						data-slot="group"
						role={group.key ? 'group' : undefined}
					>
						{#if group.key}
							<div class={groupLabelClass} data-slot="group-label">
								{#if groupLabel}{@render groupLabel(group.key)}{:else}{group.key}{/if}
							</div>
						{/if}
						{#each group.items as item (item.key)}
							<ZMultiSelectItem
								disabled={item.disabled}
								textValue={item.textValue}
								value={item.key}
							>
								{#if option && item.value.option}
									{@render option(item.value.option)}
								{:else}
									{item.textValue}
								{/if}
							</ZMultiSelectItem>
						{/each}
					</div>
				{/each}
				{#if multi.loading}
					<div class={statusClass} data-slot="status" role="presentation">
						<span role="status"
							>{#if loading}{@render loading()}{:else}{multi.loadingText}{/if}</span
						>
					</div>
				{/if}
			{/if}
		{:else}
			{@render children?.()}
		{/if}
	</ZPopoverContent>
{/if}
