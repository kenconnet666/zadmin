<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type TableDensity = 'compact' | 'comfortable';
	export interface ZTableProps extends Omit<HTMLTableAttributes, 'children'> {
		readonly caption: string;
		readonly captionHidden?: boolean;
		readonly children?: Snippet;
		readonly footer?: Snippet;
		readonly header?: Snippet;
		readonly density?: TableDensity;
		ref?: HTMLTableElement | null;
		readonly striped?: boolean;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'table',
		importStatement: "import { ZTable } from '@zadmin/zui';",
		name: 'ZTable',
		bindings: [{ description: '真实table引用。', name: 'ref', type: 'HTMLTableElement | null' }],
		dependencies: ['native table semantics'],
		events: [],
		keyboard: [],
		parts: [
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
				default: "'comfortable'",
				description: '单元格密度。',
				name: 'density',
				type: "'compact' | 'comfortable'"
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
		states: [],
		status: 'experimental',
		summary: '只负责原生table结构、caption和视觉密度，不拥有数据状态的Table。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.borderCollapse.collapse;
			s.width.percent(100);
			s._selector('& caption', (caption) => {
				caption.fontWeight._semibold;
				caption.paddingBlock._medium;
				caption.textAlign.start;
			});
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
	const hiddenRecipe = defineRecipe({
		base: (s) => {
			s.clip.raw('rect(0 0 0 0)');
			s.clipPath.raw('inset(50%)');
			s.height.px(1);
			s.overflow.hidden;
			s.position.absolute;
			s.whiteSpace.nowrap;
			s.width.px(1);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, hiddenRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
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
		density = 'comfortable',
		footer,
		header,
		ref = $bindable(null),
		striped = false,
		style,
		...rest
	}: ZTableProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { density, striped }));
	const captionClass = $derived(captionHidden ? zui.recipe(hiddenRecipe) : undefined);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<table
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	<caption class={captionClass} data-slot="caption">{caption}</caption>{#if header}<thead
			data-slot="header">{@render header()}</thead
		>{/if}<tbody data-slot="body">{@render children?.()}</tbody>{#if footer}<tfoot
			data-slot="footer">{@render footer()}</tfoot
		>{/if}
</table>
