<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { assertSelectionKey, type SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface BreadcrumbItem {
		readonly current?: boolean;
		readonly href?: string;
		readonly key: SelectionKey;
		readonly label: string;
	}
	export interface BreadcrumbCollapseOptions {
		readonly maxItems?: number;
		readonly maxRows?: number;
		readonly keepFirst?: boolean;
	}

	export interface ZBreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly collapse?: boolean | BreadcrumbCollapseOptions;
		readonly item?: Snippet<[item: BreadcrumbItem, index: number]>;
		readonly items: readonly BreadcrumbItem[];
		readonly separator?: Snippet<[item: BreadcrumbItem, index: number]>;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实nav元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		category: 'navigation',
		dependencies: [
			'native nav/ol/li',
			'ZLink',
			'ZOverflowList',
			'ZPopover',
			'typed SelectionKey',
			'logical CSS'
		],
		events: [],
		id: 'breadcrumb',
		importStatement: "import { ZBreadcrumb } from '@zadmin/zui';",
		keyboard: [
			{
				description: '真实链接由浏览器以Enter激活，折叠入口支持Enter/Space。',
				key: 'Enter / Space'
			},
			{ description: '关闭折叠祖先弹层并恢复入口焦点。', key: 'Escape' }
		],
		name: 'ZBreadcrumb',
		parts: [
			{ description: '真实有序列表。', name: 'list' },
			{ description: '真实层级li。', name: 'item' },
			{ description: '默认真实anchor。', name: 'link' },
			{ description: '当前层级或无href层级的文本。', name: 'label' },
			{ description: '折叠祖先入口所在li，由OverflowList维护唯一测量实例。', name: 'overflow' },
			{ description: '始终对辅助技术隐藏的项间分隔符。', name: 'separator' }
		],
		props: [
			{
				name: 'collapse',
				type: 'boolean | BreadcrumbCollapseOptions',
				default: 'false',
				description:
					'true启用真实宽度折叠，或设置maxItems/maxRows/keepFirst；当前项和末项始终保留。',
				members: [
					{
						name: 'maxItems',
						type: 'number',
						required: false,
						description: '可见数量预算；固定端点优先，容纳不了时自然换行。'
					},
					{
						name: 'maxRows',
						type: 'number',
						required: false,
						default: '1',
						description: '正整数flex行数预算。'
					},
					{
						name: 'keepFirst',
						type: 'boolean',
						required: false,
						default: 'true',
						description: '保留首项，如站点首页。'
					}
				]
			},
			{
				default: '必填',
				description:
					'按路径顺序提供稳定key；未指定current时最后一项为当前页，当前项有href时保留原生链接。',
				members: [
					{
						description: '稳定typed身份；number 1与string "1"不同。',
						name: 'key',
						required: true,
						type: 'SelectionKey'
					},
					{ description: '默认文本内容。', name: 'label', required: true, type: 'string' },
					{
						description: '真实anchor目标；没有真实路由时可省略。',
						name: 'href',
						required: false,
						type: 'string'
					},
					{
						description: '显式标记当前页；最多一项，未提供时选择末项。',
						name: 'current',
						required: false,
						type: 'boolean'
					}
				],
				name: 'items',
				required: true,
				type: 'readonly BreadcrumbItem[]'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实nav元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '定制链接或文本内部的可见内容；组件继续拥有链接与aria-current语义。',
				name: 'item',
				type: 'Snippet<[BreadcrumbItem, number]>'
			},
			{
				description: '替换每个非末项后的装饰分隔符，接收前一层item与原始数组index。',
				name: 'separator',
				type: 'Snippet<[BreadcrumbItem, number]>'
			}
		],
		source: 'ui/zui/src/components/navigation/ZBreadcrumb.svelte',
		states: [
			{ description: '唯一当前层级。', name: 'data-current', values: ['true'] },
			{
				description: '按类型保留的稳定项身份。',
				name: 'data-key-type',
				values: ['string', 'number']
			}
		],
		status: 'experimental',
		summary: '用真实nav/ol/li、typed items、真实链接与唯一当前文本呈现可自然换行的路径层级。'
	} as const satisfies ZuiComponentMetadata;

	const breadcrumbRecipe = defineSlotRecipe(
		{
			slots: ['root', 'list', 'item', 'label', 'separator'] as const,
			variants: {},
			base: {
				item: (s) => {
					s.alignItems.baseline;
					s.display.inlineFlex;
					s.gap._small;
					s.maxWidth.percent(100);
					s.minWidth.px(0);
				},
				label: (s) => {
					s.color._textMuted;
					s.minWidth.px(0);
					s.overflowWrap.anywhere;
				},
				list: (s) => {
					s.alignItems.baseline;
					s.columnGap._small;
					s.display.flex;
					s.flexWrap.wrap;
					s.listStyleType.none;
					s.margin.px(0);
					s.maxWidth.percent(100);
					s.padding.px(0);
					s.rowGap._xsmall;
				},
				root: (s) => {
					s.maxWidth.percent(100);
					s.minWidth.px(0);
				},
				separator: (s) => {
					s.color._textMuted;
					s.flexShrink(0);
				}
			}
		},
		import.meta
	);
	const currentLabelRecipe = defineRecipe({
		base: (s) => {
			s.color._text;
			s.fontWeight._medium;
		},
		defaultVariants: {},
		variants: {}
	});

	registerRecipeHmr(import.meta, currentLabelRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { assertOverflowCount } from '../../runtime/collection/overflow-layout.js';
	import ZOverflowList from '../layout/ZOverflowList.svelte';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';

	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import ZLink from '../gene/ZLink.svelte';

	let {
		'aria-label': ariaLabel,
		class: className,
		dir,
		collapse = false,
		item,
		items,
		ref = $bindable(null),
		separator,
		style,
		...rest
	}: ZBreadcrumbProps = $props();

	const zui = useZui();
	const classes = $derived(zui.slots(breadcrumbRecipe));
	const currentLabelClass = $derived(zui.recipe(currentLabelRecipe));
	const iconClass = $derived(
		zui.icss((s) => {
			s.inlineSize._small;
			s.blockSize._small;
		})
	);
	const popupListClass = $derived(
		zui.icss((s) => {
			s.display.grid;
			s.gap._small;
			s.padding.px(0);
			s.margin.px(0);
			s.listStyleType.none;
		})
	);
	const collapseOptions = $derived.by(() => {
		if (typeof collapse === 'boolean') return {} as BreadcrumbCollapseOptions;
		if (!collapse || typeof collapse !== 'object' || Array.isArray(collapse))
			throw new TypeError('Breadcrumb collapse must be a boolean or options object.');
		if (collapse.maxItems !== undefined)
			assertOverflowCount(collapse.maxItems, 'Breadcrumb maxItems', 0);
		if (collapse.maxRows !== undefined)
			assertOverflowCount(collapse.maxRows, 'Breadcrumb maxRows', 1);
		if (collapse.keepFirst !== undefined && typeof collapse.keepFirst !== 'boolean')
			throw new TypeError('Breadcrumb keepFirst must be a boolean.');
		return collapse;
	});
	let moreOpen = $state(false);
	let previousIdentity: string | undefined;
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	const validatedItems = $derived.by(() => {
		const keys = new Set<SelectionKey>();
		let currentCount = 0;
		for (const entry of items) {
			const { key } = entry;
			assertSelectionKey(key, 'ZBreadcrumb');
			if (keys.has(key)) throw new TypeError(`Duplicate ZBreadcrumb key "${String(key)}".`);
			keys.add(key);
			if (typeof entry.label !== 'string') {
				throw new TypeError('ZBreadcrumb items require a string label.');
			}
			if (entry.current) currentCount += 1;
		}
		if (currentCount > 1) throw new TypeError('ZBreadcrumb accepts at most one current item.');
		return items.map((entry, index) => ({
			...entry,
			current: currentCount === 0 ? index === items.length - 1 : entry.current === true
		}));
	});
	const protectedKeys = $derived(
		validatedItems
			.filter(
				(entry, index) =>
					entry.current ||
					index === validatedItems.length - 1 ||
					(index === 0 && collapseOptions.keepFirst !== false)
			)
			.map((entry) => entry.key)
	);
	$effect(() => {
		const identity = JSON.stringify(
			validatedItems.map((entry) => [entry.key, entry.current, entry.href])
		);
		if (collapse === false || (previousIdentity !== undefined && identity !== previousIdentity))
			moreOpen = false;
		previousIdentity = identity;
	});
</script>

{#snippet label(entry: BreadcrumbItem, index: number)}
	{#if entry.href === undefined}
		<span
			aria-current={entry.current ? 'page' : undefined}
			class={[classes.label, entry.current ? currentLabelClass : undefined]}
			data-slot="label"
			>{#if item}{@render item(entry, index)}{:else}{entry.label}{/if}</span
		>
	{:else}
		<ZLink
			appearance="text"
			data-slot="link"
			href={entry.href}
			aria-current={entry.current ? 'page' : undefined}
			underline="hover"
			>{#if item}{@render item(entry, index)}{:else}{entry.label}{/if}</ZLink
		>
	{/if}
{/snippet}
{#snippet divider(entry: BreadcrumbItem, index: number)}
	<span aria-hidden="true" class={classes.separator} data-slot="separator"
		>{#if separator}{@render separator(entry, index)}{:else}/{/if}</span
	>
{/snippet}
<nav
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	aria-label={ariaLabel ?? zui.localePack.common.breadcrumb}
	dir={dir ?? zui.direction}
>
	<ZPopover bind:open={moreOpen} modal={false} placement="bottom-start">
		<ZOverflowList
			as="ol"
			data-slot="list"
			dir={dir ?? zui.direction}
			class={classes.list}
			items={validatedItems}
			itemKey={(entry) => entry.key}
			collapse={collapse !== false || moreOpen}
			suspended={moreOpen}
			maxRows={collapseOptions.maxRows ?? 1}
			maxVisibleItems={collapseOptions.maxItems}
			pinnedKeys={protectedKeys}
			collapseFrom="start"
			gap="small"
			rowGap="xsmall"
		>
			{#snippet item(entry, index)}
				<span class={classes.item} data-current={entry.current || undefined}>
					{@render label(entry, index)}
					{#if index < validatedItems.length - 1}{@render divider(entry, index)}{/if}
				</span>
			{/snippet}
			{#snippet overflow(state)}
				<span class={classes.item}>
					<ZPopoverTrigger
						aria-label={zui.localePack.common.breadcrumbMore}
						shape="square"
						size="small"
						variant="ghost"
						tone="neutral"
						fullWidth={false}><Ellipsis aria-hidden="true" class={iconClass} /></ZPopoverTrigger
					>
					{#if state.overflowItems.length > 0}
						{@const last = state.overflowItems.at(-1)!}
						{@render divider(
							last,
							validatedItems.findIndex((entry) => entry.key === last.key)
						)}
					{/if}
				</span>
				<ZPopoverContent aria-label={zui.localePack.common.breadcrumbMore}>
					<ol class={popupListClass} role="list">
						{#each state.overflowItems as entry (entry.key)}
							<li>
								{#if entry.href}<ZLink
										appearance="text"
										href={entry.href}
										onclick={() => (moreOpen = false)}>{entry.label}</ZLink
									>{:else}<span>{entry.label}</span>{/if}
							</li>
						{/each}
					</ol>
				</ZPopoverContent>
			{/snippet}
		</ZOverflowList>
	</ZPopover>
</nav>
