<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	type DescriptionIdentity =
		| { readonly id?: never; readonly key: SelectionKey }
		| {
				/** @deprecated Use key. */
				readonly id: SelectionKey;
				readonly key?: never;
		  };

	export type DescriptionItem = DescriptionIdentity & {
		readonly description: string;
		readonly term: string;
	};

	interface ZDescriptionListBaseProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
		readonly empty?: Snippet;
		readonly emptyText?: string;
		readonly loading?: boolean;
		readonly loadingContent?: Snippet;
		readonly loadingCount?: number;
		readonly loadingText?: string;
		ref?: HTMLDListElement | null;
		readonly responsive?: boolean;
	}

	interface ZDescriptionListDataProps {
		readonly action?: Snippet<[item: DescriptionItem, index: number]>;
		readonly children?: never;
		readonly description?: Snippet<[item: DescriptionItem, index: number]>;
		readonly items: readonly DescriptionItem[];
		readonly term?: Snippet<[item: DescriptionItem, index: number]>;
	}

	interface ZDescriptionListManualProps {
		readonly action?: never;
		readonly children: Snippet;
		readonly description?: never;
		readonly items?: never;
		readonly term?: never;
	}

	export type ZDescriptionListProps = ZDescriptionListBaseProps &
		(ZDescriptionListDataProps | ZDescriptionListManualProps);

	export const zuiMetadata = {
		category: 'data-display',
		id: 'description-list',
		importStatement: "import { ZDescriptionList } from '@zadmin/zui';",
		name: 'ZDescriptionList',
		bindings: [{ description: '真实dl引用。', name: 'ref', type: 'HTMLDListElement | null' }],
		dependencies: ['typed SelectionKey', 'ZEmpty', 'ZSkeleton', 'SSR-stable status ids'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '数据模式的dt/dd分组。', name: 'item' },
			{ description: '真实dt。', name: 'term' },
			{ description: '真实dd。', name: 'description' },
			{ description: 'description逻辑末端操作。', name: 'action' },
			{ description: '不进入dl的empty/loading状态。', name: 'status' }
		],
		props: [
			{
				default: '与children二选一',
				description: '数据便利模式；每项使用typed key，deprecated id仅兼容迁移。',
				name: 'items',
				type: 'readonly DescriptionItem[]'
			},
			{
				default: 'true',
				description: '使用auto-fit响应式多列；false保持单列。',
				name: 'responsive',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '清空dl并在外部状态区展示加载反馈。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: '3',
				description: '默认loading状态的ZSkeleton键值组数。',
				name: 'loadingCount',
				type: 'number'
			},
			{
				default: 'Provider localePack.collection.loading',
				description: 'loading状态可访问名称。',
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
				description: '真实dl引用。',
				name: 'ref',
				type: 'HTMLDListElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '手写模式的dt/dd或div分组；不得与items同时提供。',
				name: 'children',
				type: 'Snippet'
			},
			{
				description: '数据模式rich term。',
				name: 'term',
				type: 'Snippet<[DescriptionItem, number]>'
			},
			{
				description: '数据模式rich description。',
				name: 'description',
				type: 'Snippet<[DescriptionItem, number]>'
			},
			{
				description: '数据模式description操作。',
				name: 'action',
				type: 'Snippet<[DescriptionItem, number]>'
			},
			{ description: '完整empty状态替代默认ZEmpty。', name: 'empty', type: 'Snippet' },
			{
				description: '完整loading状态替代默认ZSkeleton组。',
				name: 'loadingContent',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/data-display/ZDescriptionList.svelte',
		states: [
			{ description: '数据正在加载。', name: 'data-loading', values: ['true'] },
			{ description: '数据模式没有键值组。', name: 'data-empty', values: ['true'] },
			{ description: '数据或手写结构模式。', name: 'data-mode', values: ['data', 'manual'] },
			{ description: '使用响应式auto-fit布局。', name: 'data-responsive', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'保持真实dl/dt/dd，在typed data convenience与手写语义结构之间建立互斥边界，并提供rich snippets、响应式长内容和外置状态。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._large;
			s.margin.px(0);
		},
		variants: {
			responsive: {
				false: (s) => s.gridTemplateColumns.raw('minmax(0, 1fr)'),
				true: (s) => s.gridTemplateColumns.raw('repeat(auto-fit, minmax(min(100%, 16rem), 1fr))')
			}
		},
		defaultVariants: { responsive: true }
	});
	const groupRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
			s.minWidth.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const termRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.marginInlineStart.px(0);
			s.minWidth.px(0);
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRowRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.start;
			s.display.grid;
			s.gap._medium;
			s.gridTemplateColumns.raw('minmax(0, 1fr) auto');
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
	const loadingRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._large;
			s.gridTemplateColumns.raw('repeat(auto-fit, minmax(min(100%, 16rem), 1fr))');
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, groupRecipe);
	registerRecipeHmr(import.meta, termRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, descriptionRowRecipe);
	registerRecipeHmr(import.meta, actionRecipe);
	registerRecipeHmr(import.meta, statusRecipe);
	registerRecipeHmr(import.meta, loadingRecipe);
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
		description,
		empty,
		emptyText,
		items,
		loading = false,
		loadingContent,
		loadingCount = 3,
		loadingText,
		ref = $bindable(null),
		responsive = true,
		style,
		term,
		...rest
	}: ZDescriptionListProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const statusId = $derived(createZuiId(zui.idPrefix, uid, 'description-list-status'));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const dataMode = $derived(items !== undefined);
	const emptyState = $derived(dataMode && !loading && items.length === 0);
	const describedBy = $derived(
		[ariaDescribedBy, loading || emptyState ? statusId : undefined].filter(Boolean).join(' ') ||
			undefined
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { responsive }));
	const groupClass = $derived(zui.recipe(groupRecipe));
	const termClass = $derived(zui.recipe(termRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const descriptionRowClass = $derived(zui.recipe(descriptionRowRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
	const statusClass = $derived(zui.recipe(statusRecipe));
	const loadingClass = $derived(zui.recipe(loadingRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	const validatedItems = $derived.by(() => {
		if (items !== undefined && children !== undefined) {
			throw new TypeError('ZDescriptionList accepts either items or children, not both.');
		}
		if (items === undefined && children === undefined) {
			throw new TypeError('ZDescriptionList requires items or children.');
		}
		if (!Number.isInteger(loadingCount) || loadingCount < 1) {
			throw new TypeError('ZDescriptionList loadingCount must be a positive integer.');
		}
		if (items === undefined) return [];
		const keys = new Set<SelectionKey>();
		for (const entry of items) {
			if (entry.key !== undefined && entry.id !== undefined) {
				throw new TypeError('ZDescriptionList items cannot provide both key and deprecated id.');
			}
			const key = entry.key ?? entry.id;
			if (typeof key !== 'string' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError(
					'ZDescriptionList keys must be strings or finite numbers other than -0.'
				);
			}
			if (keys.has(key)) throw new Error(`Duplicate ZDescriptionList key "${String(key)}".`);
			if (term === undefined && typeof entry.term !== 'string') {
				throw new TypeError('ZDescriptionList default terms must be strings.');
			}
			if (description === undefined && typeof entry.description !== 'string') {
				throw new TypeError('ZDescriptionList default descriptions must be strings.');
			}
			keys.add(key);
		}
		return items;
	});

	function itemKey(entry: DescriptionItem): SelectionKey {
		return entry.key ?? entry.id;
	}
</script>

<dl
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
	data-responsive={responsive || undefined}
>
	{#if !loading}
		{#if items !== undefined}
			{#each validatedItems as entry, index (itemKey(entry))}
				<div class={groupClass} data-slot="item">
					<dt class={termClass} data-slot="term">
						{#if term}{@render term(entry, index)}{:else}{entry.term}{/if}
					</dt>
					<dd class={[descriptionClass, descriptionRowClass]} data-slot="description">
						<div>
							{#if description}{@render description(entry, index)}{:else}{entry.description}{/if}
						</div>
						{#if action}
							<div class={actionClass} data-slot="action">{@render action(entry, index)}</div>
						{/if}
					</dd>
				</div>
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	{/if}
</dl>

{#if loading}
	<div
		class={[statusClass, loadingClass]}
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
			{#each Array.from({ length: loadingCount }) as _, index (`description-skeleton-${index}`)}
				<div class={groupClass}>
					<ZSkeleton height="1rem" width="40%" />
					<ZSkeleton height="1.5rem" />
				</div>
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
