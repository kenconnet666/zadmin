<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	import type { ZComboboxOption } from './ZCombobox.svelte';

	export type ZComboboxContentProps = Omit<
		ZPopoverContentProps,
		'aria-label' | 'ariaLabelledBy' | 'children' | 'manageFocus' | 'role'
	> & {
		readonly 'aria-label'?: string;
		/** @deprecated Use the native `aria-label` spelling. */
		readonly ariaLabel?: string;
		readonly children?: Snippet;
		readonly empty?: Snippet;
		readonly groupLabel?: Snippet<[group: string]>;
		readonly loading?: Snippet;
		readonly option?: Snippet<[option: ZComboboxOption]>;
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	};

	export const zuiMetadata = {
		category: 'input',
		id: 'combobox-content',
		importStatement: "import { ZComboboxContent } from '@zadmin/zui';",
		name: 'ZComboboxContent',
		bindings: [
			{
				description: '真实Popover shell引用；非虚拟模式下也是listbox。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		dependencies: [
			'ZCombobox',
			'ZPopoverContent',
			'LogicalCollection',
			'ActiveDescendant',
			'ZVirtualList'
		],
		events: [],
		keyboard: [],
		parts: [
			{ description: '数据模式的option分组。', name: 'group' },
			{ description: '数据模式的分组标题。', name: 'group-label' },
			{ description: '空结果或加载状态。', name: 'status' }
		],
		props: [
			{
				default: 'Provider localePack.collection.selectOptions',
				description: 'listbox原生可访问名称。',
				name: 'aria-label',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'deprecated兼容别名；请改用aria-label。',
				name: 'ariaLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实Popover shell引用；非虚拟模式下也是listbox。',
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
			{ description: 'compound模式的ZComboboxItem集合。', name: 'children', type: 'Snippet' },
			{
				description: 'options数据模式的自定义option内容。',
				name: 'option',
				type: 'Snippet<[ZComboboxOption]>'
			},
			{ description: 'options数据模式的分组标题。', name: 'groupLabel', type: 'Snippet<[string]>' },
			{ description: '覆盖空结果状态。', name: 'empty', type: 'Snippet' },
			{ description: '覆盖加载状态。', name: 'loading', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/combobox/ZComboboxContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary:
			'不移动输入DOM焦点、按真实过滤view挂载option，并为无分组options提供可选固定行虚拟窗口的listbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZVirtualList from '../../data-display/ZVirtualList.svelte';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { choiceGroupLabelRecipe, choiceStatusRecipe } from '../choice-content.js';
	import {
		assertChoiceContentContract,
		type ChoiceVirtualController
	} from '../choice-virtualization.js';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import ZComboboxItem from './ZComboboxItem.svelte';
	import { useZCombobox } from './context.svelte.js';

	let {
		'aria-label': ariaLabelNative,
		ariaLabel,
		children,
		class: className,
		empty,
		groupLabel,
		loading,
		option,
		ref = $bindable(null),
		style,
		virtual = false,
		virtualHeight = 240,
		virtualItemSize = 40,
		virtualOverscan = 4,
		...rest
	}: ZComboboxContentProps = $props();
	const zui = useZui();
	const combo = useZCombobox();
	const resolvedAriaLabel = $derived(
		ariaLabelNative ?? ariaLabel ?? zui.localePack.collection.selectOptions
	);
	const groupLabelClass = $derived(zui.recipe(choiceGroupLabelRecipe));
	const statusClass = $derived(zui.recipe(choiceStatusRecipe));
	let virtualRef = $state<HTMLDivElement | null>(null);
	let controller = $state<ChoiceVirtualController | null>(null);

	function assertContentContract(): void {
		assertChoiceContentContract('ZCombobox', {
			dataMode: combo.dataMode,
			grouped: combo.grouped,
			hasChildren: children !== undefined,
			virtual
		});
	}

	untrack(assertContentContract);
	$effect(assertContentContract);
	$effect(() => {
		combo.setVirtualizer(virtual ? controller : null);
		return () => combo.setVirtualizer(null);
	});
</script>

{#if virtual}
	<ZPopoverContent
		{...rest}
		ariaLabelledBy={null}
		bind:ref
		class={className}
		manageFocus={false}
		role="presentation"
		{style}
	>
		<ZVirtualList
			aria-label={resolvedAriaLabel}
			aria-busy={combo.loading || undefined}
			bind:controller
			bind:ref={virtualRef}
			height={virtualHeight}
			itemKey={(item) => item.key}
			itemRole="presentation"
			itemSize={virtualItemSize}
			items={combo.view.items}
			loading={combo.loading}
			overscan={virtualOverscan}
			role="listbox"
			tabindex={-1}
		>
			{#snippet item(item, index)}
				<ZComboboxItem
					aria-posinset={index + 1}
					aria-setsize={combo.view.size}
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
				</ZComboboxItem>
			{/snippet}
			{#snippet empty()}
				<span role="status"
					>{#if empty}{@render empty()}{:else}{combo.emptyText}{/if}</span
				>
			{/snippet}
			{#snippet loadingContent()}
				<span role="status"
					>{#if loading}{@render loading()}{:else}{combo.loadingText}{/if}</span
				>
			{/snippet}
		</ZVirtualList>
		{#if combo.loading && combo.view.size > 0}
			<div class={statusClass} data-slot="status" role="presentation">
				<span role="status"
					>{#if loading}{@render loading()}{:else}{combo.loadingText}{/if}</span
				>
			</div>
		{/if}
	</ZPopoverContent>
{:else}
	<ZPopoverContent
		{...rest}
		aria-label={resolvedAriaLabel}
		aria-busy={combo.loading || undefined}
		ariaLabelledBy={null}
		bind:ref
		class={className}
		manageFocus={false}
		role="listbox"
		{style}
	>
		{#if combo.dataMode}
			{#if combo.loading && combo.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if loading}{@render loading()}{:else}{combo.loadingText}{/if}</span
					>
				</div>
			{:else if combo.view.size === 0}
				<div class={statusClass} data-slot="status" role="presentation">
					<span role="status"
						>{#if empty}{@render empty()}{:else}{combo.emptyText}{/if}</span
					>
				</div>
			{:else}
				{#each combo.view.groups as group (group.key)}
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
							<ZComboboxItem disabled={item.disabled} textValue={item.textValue} value={item.key}>
								{#if option && item.value.option}
									{@render option(item.value.option)}
								{:else}
									{item.textValue}
								{/if}
							</ZComboboxItem>
						{/each}
					</div>
				{/each}
				{#if combo.loading}
					<div class={statusClass} data-slot="status" role="presentation">
						<span role="status"
							>{#if loading}{@render loading()}{:else}{combo.loadingText}{/if}</span
						>
					</div>
				{/if}
			{/if}
		{:else}
			{@render children?.()}
		{/if}
	</ZPopoverContent>
{/if}
