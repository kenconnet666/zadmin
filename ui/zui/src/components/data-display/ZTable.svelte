<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type TableDensity = 'compact' | 'comfortable' | 'spacious';
	export type TableScroll = 'auto' | 'none';
	export interface ZTableProps extends Omit<HTMLTableAttributes, 'children'> {
		readonly caption: string;
		readonly captionHidden?: boolean;
		readonly children?: Snippet;
		readonly footer?: Snippet;
		readonly header?: Snippet;
		readonly density?: TableDensity;
		ref?: HTMLTableElement | null;
		readonly scroll?: TableScroll;
		readonly scrollLabel?: string;
		readonly striped?: boolean;
		wrapperRef?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'table',
		importStatement: "import { ZTable } from '@zadmin/zui';",
		name: 'ZTable',
		bindings: [
			{ description: '真实table引用。', name: 'ref', type: 'HTMLTableElement | null' },
			{
				description: '稳定响应式滚动容器引用。',
				name: 'wrapperRef',
				type: 'HTMLDivElement | null'
			}
		],
		dependencies: ['native table semantics', 'ZVisuallyHidden', 'owner Window ResizeObserver'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '仅在真实横向溢出时可聚焦并命名的滚动owner。', name: 'wrapper' },
			{ description: 'caption。', name: 'caption' },
			{ description: 'thead。', name: 'header' },
			{ description: 'tbody。', name: 'body' },
			{ description: 'tfoot。', name: 'footer' }
		],
		props: [
			{
				default: '必填',
				description: '表格名称。',
				name: 'caption',
				required: true,
				type: 'string'
			},
			{
				default: 'false',
				description: '视觉隐藏caption但保留名称。',
				name: 'captionHidden',
				type: 'boolean'
			},
			{
				default: 'Provider density',
				description: '显式值优先，否则继承compact/comfortable/spacious Provider density。',
				name: 'density',
				type: "'compact' | 'comfortable' | 'spacious'"
			},
			{
				default: "'auto'",
				description: 'auto允许横向滚动并仅在真实溢出时建立可聚焦region；none不拥有滚动。',
				name: 'scroll',
				type: "'auto' | 'none'"
			},
			{
				default: 'caption',
				description: '真实溢出时滚动region的名称。',
				name: 'scrollLabel',
				type: 'string'
			},
			{ default: 'false', description: '交替tbody行背景。', name: 'striped', type: 'boolean' }
		],
		since: 'unreleased',
		snippets: [
			{ description: 'thead行。', name: 'header', type: 'Snippet' },
			{ description: 'tbody行。', name: 'children', type: 'Snippet' },
			{ description: 'tfoot行。', name: 'footer', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZTable.svelte',
		states: [
			{
				description: '解析后的单元格密度。',
				name: 'data-density',
				values: ['compact', 'comfortable', 'spacious']
			},
			{ description: '真实横向溢出。', name: 'data-overflowing', values: ['true'] },
			{ description: '滚动owner策略。', name: 'data-scroll', values: ['auto', 'none'] }
		],
		status: 'experimental',
		summary:
			'保持真实table/caption/thead/tbody/tfoot与native cell语义，并提供Provider density和只在真实溢出时可聚焦的有限横向scroll owner；不拥有数据状态。'
	} as const satisfies ZuiComponentMetadata;
	const wrapperRecipe = defineRecipe({
		base: (s) => {
			s.maxWidth.percent(100);
			s.width.percent(100);
		},
		variants: {
			scroll: {
				auto: (s) => s.overflowX.auto,
				none: (s) => s.overflowX.visible
			}
		},
		defaultVariants: { scroll: 'auto' }
	});
	const recipe = defineRecipe({
		base: (s) => {
			s.borderCollapse.collapse;
			s.width.percent(100);
			s._selector('& th, & td', (cell) => {
				cell.borderBottomColor._border;
				cell.borderBottomStyle.solid;
				cell.borderBottomWidth._hairline;
				cell.textAlign.start;
			});
			s._selector('& th', (header) => {
				header.color._textMuted;
				header.fontSize._small;
				header.fontWeight._semibold;
			});
		},
		variants: {
			density: {
				comfortable: (s) =>
					s._selector('& th, & td', (cell) => {
						cell.paddingBlock._medium;
						cell.paddingInline._large;
					}),
				compact: (s) =>
					s._selector('& th, & td', (cell) => {
						cell.paddingBlock._small;
						cell.paddingInline._medium;
					}),
				spacious: (s) =>
					s._selector('& th, & td', (cell) => {
						cell.paddingBlock._large;
						cell.paddingInline._xlarge;
					})
			},
			striped: {
				false: () => undefined,
				true: (s) =>
					s._selector('& tbody tr:nth-child(even)', (row) => row.backgroundColor._surface)
			}
		},
		defaultVariants: { density: 'comfortable', striped: false }
	});
	const captionRecipe = defineRecipe({
		base: (s) => {
			s.fontWeight._semibold;
			s.textAlign.start;
		},
		variants: {
			hidden: {
				false: (s) => s.paddingBlock._medium,
				true: (s) => s.padding.px(0)
			}
		},
		defaultVariants: { hidden: false }
	});
	registerRecipeHmr(import.meta, wrapperRecipe);
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, captionRecipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		caption,
		captionHidden = false,
		children,
		class: className,
		density,
		dir,
		footer,
		header,
		ref = $bindable(null),
		scroll = 'auto',
		scrollLabel,
		striped = false,
		style,
		wrapperRef = $bindable(null),
		...rest
	}: ZTableProps = $props();
	const zui = useZui();
	let overflowing = $state(false);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedCaptionHidden = $derived.by(() => {
		if (typeof captionHidden !== 'boolean') {
			throw new TypeError('ZTable captionHidden must be boolean.');
		}
		return captionHidden;
	});
	const resolvedStriped = $derived.by(() => {
		if (typeof striped !== 'boolean') throw new TypeError('ZTable striped must be boolean.');
		return striped;
	});
	const resolvedCaption = $derived.by(() => {
		if (typeof caption !== 'string' || caption.trim().length === 0) {
			throw new TypeError('ZTable caption must be a non-empty string.');
		}
		return caption;
	});
	const resolvedDensity = $derived.by(() => {
		const next = density ?? zui.density;
		if (!['compact', 'comfortable', 'spacious'].includes(next)) {
			throw new TypeError('ZTable density must be compact, comfortable or spacious.');
		}
		return next;
	});
	const resolvedScroll = $derived.by(() => {
		if (!['auto', 'none'].includes(scroll)) {
			throw new TypeError('ZTable scroll must be auto or none.');
		}
		return scroll;
	});
	const resolvedScrollLabel = $derived.by(() => {
		const next = scrollLabel ?? resolvedCaption;
		if (next.trim().length === 0) throw new TypeError('ZTable scrollLabel must be non-empty.');
		return next;
	});
	const wrapperClass = $derived(zui.recipe(wrapperRecipe, { scroll: resolvedScroll }));
	const rootClass = $derived(
		zui.recipe(recipe, { density: resolvedDensity, striped: resolvedStriped })
	);
	const captionClass = $derived(zui.recipe(captionRecipe, { hidden: resolvedCaptionHidden }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function updateOverflow(): void {
		const wrapper = wrapperRef;
		overflowing =
			resolvedScroll === 'auto' && !!wrapper && wrapper.scrollWidth > wrapper.clientWidth + 1;
	}

	$effect(() => {
		resolvedScroll;
		if (resolvedScroll === 'none') {
			overflowing = false;
			return;
		}
		updateOverflow();
	});

	onMount(() => {
		const wrapper = wrapperRef;
		const ownerWindow = wrapper?.ownerDocument.defaultView;
		if (!wrapper || !ownerWindow) return;
		const ResizeObserverConstructor = ownerWindow.ResizeObserver;
		const observer = ResizeObserverConstructor
			? new ResizeObserverConstructor(updateOverflow)
			: undefined;
		observer?.observe(wrapper);
		if (ref) observer?.observe(ref);
		ownerWindow.addEventListener('resize', updateOverflow);
		updateOverflow();
		return () => {
			observer?.disconnect();
			ownerWindow.removeEventListener('resize', updateOverflow);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable table viewport is intentionally focusable) -->
<div
	bind:this={wrapperRef}
	class={wrapperClass}
	dir={resolvedDirection}
	role={overflowing ? 'region' : undefined}
	aria-label={overflowing ? resolvedScrollLabel : undefined}
	data-overflowing={overflowing || undefined}
	data-scroll={resolvedScroll}
	data-slot="wrapper"
	tabindex={overflowing ? 0 : undefined}
>
	<table
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		data-density={resolvedDensity}
	>
		<caption class={captionClass} data-slot="caption">
			{#if resolvedCaptionHidden}<ZVisuallyHidden>{resolvedCaption}</ZVisuallyHidden
				>{:else}{resolvedCaption}{/if}
		</caption>{#if header}<thead data-slot="header">{@render header()}</thead>{/if}<tbody
			data-slot="body">{@render children?.()}</tbody
		>{#if footer}<tfoot data-slot="footer">{@render footer()}</tfoot>{/if}
	</table>
</div>
