<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	type ListItemIdentity =
		| { readonly id?: never; readonly key: SelectionKey }
		| {
				/** @deprecated Use key. */
				readonly id: SelectionKey;
				readonly key?: never;
		  };

	export type ListItem = ListItemIdentity & {
		readonly description?: string;
		readonly label: string;
	};

	interface ZListBaseProps extends HTMLAttributes<HTMLElement> {
		readonly empty?: Snippet;
		readonly emptyText?: string;
		readonly loading?: boolean;
		readonly loadingContent?: Snippet;
		readonly loadingCount?: number;
		readonly loadingText?: string;
		readonly ordered?: boolean;
		ref?: HTMLOListElement | HTMLUListElement | null;
		readonly reversed?: boolean | null;
		readonly start?: number | null;
		readonly type?: '1' | 'A' | 'I' | 'a' | 'i' | null;
	}

	interface ZListDataProps {
		readonly action?: Snippet<[item: ListItem, index: number]>;
		readonly children?: never;
		readonly item?: Snippet<[item: ListItem, index: number]>;
		readonly items: readonly ListItem[];
	}

	interface ZListManualProps {
		readonly action?: never;
		readonly children: Snippet;
		readonly item?: never;
		readonly items?: never;
	}

	export type ZListProps = ZListBaseProps & (ZListDataProps | ZListManualProps);

	export const zuiMetadata = {
		category: 'data-display',
		id: 'list',
		importStatement: "import { ZList } from '@zadmin/zui';",
		name: 'ZList',
		bindings: [
			{
				description: '真实ol/ul引用。',
				name: 'ref',
				type: 'HTMLOListElement | HTMLUListElement | null'
			}
		],
		dependencies: ['typed SelectionKey', 'ZEmpty', 'ZSkeleton', 'SSR-stable status ids'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '真实li。', name: 'item' },
			{ description: '默认或自定义Item正文。', name: 'content' },
			{ description: 'Item逻辑末端操作。', name: 'action' },
			{ description: '不进入ul/ol的empty/loading状态。', name: 'status' }
		],
		props: [
			{
				default: '与children二选一',
				description: '数据便利模式；每项使用typed key，deprecated id仅兼容迁移。',
				name: 'items',
				requiredWhen: '未提供children手写模式时',
				type: 'readonly ListItem[]',
				members: [
					{
						description: '与legacy id二选一；新代码必须使用key。',
						name: 'key',
						type: 'SelectionKey',
						requiredWhen: '使用推荐的keyed identity分支'
					},
					{ description: '列表项展示标题。', name: 'label', type: 'string', required: true },
					{ description: '列表项补充说明。', name: 'description', type: 'string', required: false },
					{
						description: 'pre-1.0兼容身份别名；与key二选一。',
						name: 'id',
						type: 'SelectionKey',
						deprecatedSince: 'unreleased',
						replacement: 'key',
						requiredWhen: '迁移期间仍使用deprecated legacy identity分支'
					}
				]
			},
			{
				default: 'false',
				description: '使用真实ol；否则使用真实ul。',
				name: 'ordered',
				type: 'boolean'
			},
			{
				default: 'false',
				description: 'ordered时转发原生ol reversed属性。',
				name: 'reversed',
				type: 'boolean | null'
			},
			{
				default: 'undefined',
				description: 'ordered时转发原生ol起始序号。',
				name: 'start',
				type: 'number | null'
			},
			{
				default: 'undefined',
				description: 'ordered时转发原生ol编号样式。',
				name: 'type',
				type: "'1' | 'a' | 'A' | 'i' | 'I' | null"
			},
			{
				default: 'false',
				description: '清空列表并在外部状态区展示加载反馈。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: '3',
				description: '默认loading状态的ZSkeleton行数。',
				name: 'loadingCount',
				type: 'number'
			},
			{
				default: 'Provider localePack.collection.loading',
				description: 'loading状态的可访问名称。',
				name: 'loadingText',
				type: 'string'
			},
			{
				default: 'Provider localePack.collection.empty',
				description: '数据模式空数组的默认ZEmpty标题。',
				name: 'emptyText',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实ol/ul引用。',
				name: 'ref',
				type: 'HTMLOListElement | HTMLUListElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '手写模式的真实li集合；不得与items同时提供。',
				name: 'children',
				requiredWhen: '未提供items数据模式时',
				type: 'Snippet'
			},
			{ description: '数据模式Item正文。', name: 'item', type: 'Snippet<[ListItem, number]>' },
			{ description: '数据模式Item操作。', name: 'action', type: 'Snippet<[ListItem, number]>' },
			{ description: '完整empty状态替代默认ZEmpty。', name: 'empty', type: 'Snippet' },
			{
				description: '完整loading状态替代默认ZSkeleton组。',
				name: 'loadingContent',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/data-display/ZList.svelte',
		states: [
			{ description: '数据正在加载。', name: 'data-loading', values: ['true'] },
			{ description: '数据模式没有Item。', name: 'data-empty', values: ['true'] },
			{ description: '数据或手写结构模式。', name: 'data-mode', values: ['data', 'manual'] },
			{ description: '列表语义。', name: 'data-ordered', values: ['true', 'false'] }
		],
		status: 'stable',
		summary:
			'保持真实ul/ol/li语义，在typed data convenience与调用方手写li之间建立互斥边界，并把empty/loading放在列表项之外。'
	} as const satisfies ZuiComponentMetadata;

	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
			s.margin.px(0);
			s.paddingInlineStart._xlarge;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => s.paddingBlock._small,
		variants: {},
		defaultVariants: {}
	});
	const rowRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.start;
			s.display.grid;
			s.gap._medium;
			s.gridTemplateColumns.raw('minmax(0, 1fr) auto');
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.minWidth.px(0);
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.marginTop._xsmall;
		},
		variants: {},
		defaultVariants: {}
	});
	const actionRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexShrink(0);
			s.gap._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const statusRecipe = defineRecipe({
		base: (s) => s.paddingBlock._medium,
		variants: {},
		defaultVariants: {}
	});
	const skeletonRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, listRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
	registerRecipeHmr(import.meta, rowRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, actionRecipe);
	registerRecipeHmr(import.meta, statusRecipe);
	registerRecipeHmr(import.meta, skeletonRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZEmpty from './ZEmpty.svelte';
	import ZSkeleton from './ZSkeleton.svelte';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		'aria-describedby': ariaDescribedBy,
		action,
		children,
		class: className,
		empty,
		emptyText,
		item,
		items,
		loading = false,
		loadingContent,
		loadingCount = 3,
		loadingText,
		ordered = false,
		ref = $bindable(null),
		style,
		...rest
	}: ZListProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const statusId = $derived(createZuiId(zui.idPrefix, uid, 'list-status'));
	const tag = $derived(ordered ? 'ol' : 'ul');
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const dataMode = $derived(items !== undefined);
	const emptyState = $derived(items !== undefined && !loading && items.length === 0);
	const describedBy = $derived(
		[ariaDescribedBy, loading || emptyState ? statusId : undefined].filter(Boolean).join(' ') ||
			undefined
	);
	const rootClass = $derived(zui.recipe(listRecipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const rowClass = $derived(zui.recipe(rowRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
	const statusClass = $derived(zui.recipe(statusRecipe));
	const skeletonClass = $derived(zui.recipe(skeletonRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	const validatedItems = $derived.by(() => {
		if (items !== undefined && children !== undefined) {
			throw new TypeError('ZList accepts either items or children, not both.');
		}
		if (items === undefined && children === undefined) {
			throw new TypeError('ZList requires items or children.');
		}
		if (!Number.isInteger(loadingCount) || loadingCount < 1) {
			throw new TypeError('ZList loadingCount must be a positive integer.');
		}
		if (items === undefined) return [];
		// Validation-local set is not rendered state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keys = new Set<SelectionKey>();
		for (const entry of items) {
			if (entry.key !== undefined && entry.id !== undefined) {
				throw new TypeError('ZList items cannot provide both key and deprecated id.');
			}
			const key = entry.key ?? entry.id;
			if (typeof key !== 'string' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError('ZList keys must be strings or finite numbers other than -0.');
			}
			if (keys.has(key)) throw new Error(`Duplicate ZList key "${String(key)}".`);
			if (item === undefined && typeof entry.label !== 'string') {
				throw new TypeError('ZList default items require a string label.');
			}
			if (entry.description !== undefined && typeof entry.description !== 'string') {
				throw new TypeError('ZList item descriptions must be strings when provided.');
			}
			keys.add(key);
		}
		return items;
	});

	function itemKey(entry: ListItem): SelectionKey {
		return entry.key ?? entry.id;
	}
</script>

<svelte:element
	this={tag}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-busy={loading || undefined}
	aria-describedby={describedBy}
	data-empty={emptyState || undefined}
	data-loading={loading || undefined}
	data-mode={validatedItems && dataMode ? 'data' : 'manual'}
	data-ordered={ordered}
>
	{#if !loading}
		{#if items !== undefined}
			{#each validatedItems as entry, index (itemKey(entry))}
				<li class={itemClass} data-slot="item">
					<div class={rowClass} data-slot="row">
						<div class={contentClass} data-slot="content">
							{#if item}
								{@render item(entry, index)}
							{:else}
								<span>{entry.label}</span>
								{#if entry.description}
									<div class={descriptionClass}>{entry.description}</div>
								{/if}
							{/if}
						</div>
						{#if action}
							<div class={actionClass} data-slot="action">{@render action(entry, index)}</div>
						{/if}
					</div>
				</li>
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	{/if}
</svelte:element>

{#if loading}
	<div
		class={[statusClass, skeletonClass]}
		id={statusId}
		role="status"
		aria-label={resolvedLoadingText}
		aria-live="polite"
		data-slot="status"
		data-state="loading"
	>
		{#if loadingContent}
			{@render loadingContent()}
		{:else}
			{#each Array.from({ length: loadingCount }, (_, index) => index) as index (`skeleton-${index}`)}
				<ZSkeleton height="2.25rem" />
			{/each}
		{/if}
	</div>
{:else if emptyState}
	<div class={statusClass} id={statusId} data-slot="status" data-state="empty">
		{#if empty}
			{@render empty()}
		{:else}
			<ZEmpty headingLevel={3} title={resolvedEmptyText} />
		{/if}
	</div>
{/if}
