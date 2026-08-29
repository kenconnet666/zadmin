<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	export interface ZPopconfirmDescriptionProps extends Omit<
		HTMLAttributes<HTMLParagraphElement>,
		'children' | 'id'
	> {
		readonly children?: Snippet;
		ref?: HTMLParagraphElement | null;
	}
	const recipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.marginBlock._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-description',
		importStatement: "import { ZPopconfirmDescription } from '@zadmin/zui';",
		name: 'ZPopconfirmDescription',
		bindings: [
			{ description: '真实paragraph引用。', name: 'ref', type: 'HTMLParagraphElement | null' }
		],
		dependencies: ['ZPopconfirm'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实paragraph引用。',
				name: 'ref',
				type: 'HTMLParagraphElement | null'
			}
		],
		since: '0.3.0',
		snippets: [{ description: '操作后果说明。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmDescription.svelte',
		states: [],
		status: 'experimental',
		summary: '提供Popconfirm稳定可访问说明的段落。'
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
	}: ZPopconfirmDescriptionProps = $props();
	const zui = useZui();
	const popconfirm = useZPopconfirm();
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<p
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={popconfirm.descriptionId}
>
	{@render children?.()}
</p>
