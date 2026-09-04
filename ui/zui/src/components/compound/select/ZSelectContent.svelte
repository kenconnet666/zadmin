<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	import type { ZSelectOption } from './ZSelect.svelte';

	export type ZSelectContentProps = Omit<
		ZPopoverContentProps,
		'aria-activedescendant' | 'ariaLabelledBy' | 'children' | 'initialFocus' | 'role'
	> & {
		readonly children?: Snippet;
		readonly empty?: Snippet;
		readonly groupLabel?: Snippet<[group: string]>;
		readonly loading?: Snippet;
		readonly option?: Snippet<[option: ZSelectOption]>;
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	};

	export const zuiMetadata = {
		category: 'input',
		id: 'select-content',
		importStatement: "import { ZSelectContent } from '@zadmin/zui';",
		name: 'ZSelectContent',
		bindings: [
			{
				description: '真实Popover shell引用；非虚拟模式下也是listbox焦点owner。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		dependencies: [
			'ZSelect',
			'ZPopoverContent',
			'LogicalCollection',
			'ActiveDescendant',
			'Typeahead',
			'ZVirtualList'
		],
		events: [],
		keyboard: [
			{
				description: '在完整逻辑view的enabled options间移动。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '按Provider locale文本前缀移动。', key: 'Printable characters' },
			{ description: '选择active option。', key: 'Enter / Space' },
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
				description: '真实Popover shell引用；非虚拟模式下也是listbox焦点owner。',
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
			{ description: 'compound模式的ZSelectItem集合。', name: 'children', type: 'Snippet' },
			{
				description: 'options数据模式的自定义option内容。',
				name: 'option',
				type: 'Snippet<[ZSelectOption]>'
			},
			{ description: 'options数据模式的分组标题。', name: 'groupLabel', type: 'Snippet<[string]>' },
			{ description: '覆盖空集合状态。', name: 'empty', type: 'Snippet' },
			{ description: '覆盖异步加载状态。', name: 'loading', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/select/ZSelectContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary:
			'以listbox本身保持DOM焦点、只暴露真实挂载option id，并为无分组options提供可选固定行虚拟窗口的Select Content。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZVirtualList from '../../data-display/ZVirtualList.svelte';
	import { choiceGroupLabelRecipe, choiceStatusRecipe } from '../choice-content.js';
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import {
		assertChoiceContentContract,
		type ChoiceVirtualController
	} from '../choice-virtualization.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import ZSelectItem from './ZSelectItem.svelte';
	import { useZSelect } from './context.svelte.js';
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
	}: ZSelectContentProps = $props();
	const zui = useZui();
	const popover = useZPopover();
	const select = useZSelect();
	const groupLabelClass = $derived(zui.recipe(choiceGroupLabelRecipe));
	const statusClass = $derived(zui.recipe(choiceStatusRecipe));
	const sizingClass = $derived(
		zui.recipe(floatingContentSizingRecipe, { intrinsicWidth: !popover.matchWidth })
	);
	let virtualRef = $state<HTMLDivElement | null>(null);
	let controller = $state<ChoiceVirtualController | null>(null);

	function assertContentContract(): void {
		assertChoiceContentContract('ZSelect', {
			dataMode: select.dataMode,
			grouped: select.grouped,
			hasChildren: children !== undefined,
			virtual
		});
	}

	untrack(assertContentContract);
	$effect(assertContentContract);
	$effect(() => {
		select.setVirtualizer(virtual ? controller : null);
		return () => select.setVirtualizer(null);
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || isKeyboardComposing(event)) return;
		if (select.handleKey(event)) return;
		switch (event.key) {
			case 'Enter':
			case ' ': {
				if (select.activeKey === undefined) return;
				event.preventDefault();
				select.choose(select.activeKey, event);
				return;
			}
			default: {
				const match = select.search(event.key);
				if (match === undefined) return;
				event.preventDefault();
				select.setActive(match);
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
			aria-activedescendant={select.activeId}
			aria-busy={select.loading || undefined}
			aria-labelledby={popover.triggerId}
			bind:controller
			bind:ref={virtualRef}
			height={virtualHeight}
			itemKey={(item) => item.key}
			itemRole="presentation"
			itemSize={virtualItemSize}
			items={select.view.items}
			loading={select.loading}
			onkeydown={handleKeydown}
			overscan={virtualOverscan}
			role="listbox"
			tabindex={-1}
		>
			{#snippet item(item, index)}
				<ZSelectItem
					aria-posinset={index + 1}
					aria-setsize={select.view.size}
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
				</ZSelectItem>
			{/snippet}
			{#snippet empty()}
				<span role="status"
					>{#if empty}{@render empty()}{:else}{select.emptyText}{/if}</span
				>
			{/snippet}
			{#snippet loadingContent()}
				<span role="status"
					>{#if loading}{@render loading()}{:else}{select.loadingText}{/if}</span
				>
			{/snippet}
		</ZVirtualList>
		{#if select.loading && select.view.size > 0}
			<div class={statusClass} data-slot="status" role="presentation">
				<span role="status"
					>{#if loading}{@render loading()}{:else}{select.loadingText}{/if}</span
				>
			</div>
		{/if}
	</ZPopoverContent>
{:else}
	<ZPopoverContent
		{...rest}
		aria-activedescendant={select.activeId}
		aria-busy={select.loading || undefined}
		ariaLabelledBy={popover.triggerId}
		bind:ref
		class={[sizingClass, className]}
		initialFocus={() => ref}
		role="listbox"
		{style}
		onkeydown={handleKeydown}
	>
		{#if select.dataMode}
			{#if select.loading && select.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if loading}{@render loading()}{:else}{select.loadingText}{/if}</span
					>
				</div>
			{:else if select.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if empty}{@render empty()}{:else}{select.emptyText}{/if}</span
					>
				</div>
			{:else}
				{#each select.view.groups as group (group.key)}
					<div
						data-slot="group"
						role={group.key ? 'group' : undefined}
						aria-label={group.key || undefined}
					>
						{#if group.key}
							<div class={groupLabelClass} data-slot="group-label">
								{#if groupLabel}{@render groupLabel(group.key)}{:else}{group.key}{/if}
							</div>
						{/if}
						{#each group.items as item (item.key)}
							<ZSelectItem disabled={item.disabled} textValue={item.textValue} value={item.key}>
								{#if option && item.value.option}
									{@render option(item.value.option)}
								{:else}
									{item.textValue}
								{/if}
							</ZSelectItem>
						{/each}
					</div>
				{/each}
				{#if select.loading}
					<div class={statusClass} data-slot="status" role="presentation">
						<span role="status"
							>{#if loading}{@render loading()}{:else}{select.loadingText}{/if}</span
						>
					</div>
				{/if}
			{/if}
		{:else}
			{@render children?.()}
		{/if}
	</ZPopoverContent>
{/if}
