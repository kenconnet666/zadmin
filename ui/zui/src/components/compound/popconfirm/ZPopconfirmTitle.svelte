<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	export interface ZPopconfirmTitleProps extends Omit<
		HTMLAttributes<HTMLHeadingElement>,
		'children' | 'id'
	> {
		readonly children?: Snippet;
		ref?: HTMLHeadingElement | null;
	}
	const recipe = defineRecipe({
		base: (s) => {
			s.fontSize._medium;
			s.fontWeight._bold;
			s.margin.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-title',
		importStatement: "import { ZPopconfirmTitle } from '@zadmin/zui';",
		name: 'ZPopconfirmTitle',
		bindings: [
			{ description: '真实heading引用。', name: 'ref', type: 'HTMLHeadingElement | null' }
		],
		dependencies: ['ZPopconfirm'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实heading引用。',
				name: 'ref',
				type: 'HTMLHeadingElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '确认问题标题。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmTitle.svelte',
		states: [],
		status: 'experimental',
		summary: '提供Popconfirm稳定可访问名称的标题。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZPopconfirm } from './context.svelte.js';
	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZPopconfirmTitleProps = $props();
	const zui = useZui();
	const popconfirm = useZPopconfirm();
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<h2
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={popconfirm.titleId}
>
	{@render children?.()}
</h2>
