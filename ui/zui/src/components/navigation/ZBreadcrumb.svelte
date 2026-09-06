<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface BreadcrumbItem {
		readonly current?: boolean;
		readonly href?: string;
		readonly key: SelectionKey;
		readonly label: string;
	}

	export interface ZBreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly item?: Snippet<[item: BreadcrumbItem, index: number]>;
		readonly items: readonly BreadcrumbItem[];
		readonly separator?: Snippet<[item: BreadcrumbItem, index: number]>;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实nav元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		category: 'navigation',
		dependencies: ['native nav/ol/li', 'ZLink', 'typed SelectionKey', 'logical CSS'],
		events: [],
		id: 'breadcrumb',
		importStatement: "import { ZBreadcrumb } from '@zadmin/zui';",
		keyboard: [{ description: '非当前的真实链接由浏览器以Enter激活。', key: 'Enter' }],
		name: 'ZBreadcrumb',
		parts: [
			{ description: '真实有序列表。', name: 'list' },
			{ description: '真实层级li。', name: 'item' },
			{ description: '默认真实anchor。', name: 'link' },
			{ description: '当前层级或无href层级的文本。', name: 'label' },
			{ description: '始终对辅助技术隐藏的项间分隔符。', name: 'separator' }
		],
		props: [
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
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function assertKey(item: BreadcrumbItem): SelectionKey {
		const { key } = item;
		if (
			typeof key !== 'string' &&
			(typeof key !== 'number' || !Number.isFinite(key) || Object.is(key, -0))
		)
			throw new TypeError('ZBreadcrumb keys must be strings or finite numbers other than -0.');
		return key;
	}

	const validatedItems = $derived.by(() => {
		const keys = new Set<SelectionKey>();
		let currentCount = 0;
		for (const entry of items) {
			const key = assertKey(entry);
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
</script>

<nav
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	aria-label={ariaLabel ?? zui.localePack.common.breadcrumb}
>
	<ol class={classes.list} data-slot="list">
		{#each validatedItems as entry, index (entry.key)}
			<li
				class={classes.item}
				data-slot="item"
				data-current={entry.current || undefined}
				data-key={String(entry.key)}
				data-key-type={typeof entry.key}
			>
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
				{#if index < validatedItems.length - 1}
					<span aria-hidden="true" class={classes.separator} data-slot="separator">
						{#if separator}{@render separator(entry, index)}{:else}/{/if}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
