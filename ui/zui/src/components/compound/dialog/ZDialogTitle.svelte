<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	export interface ZDialogTitleProps extends Omit<
		HTMLAttributes<HTMLHeadingElement>,
		'children' | 'id'
	> {
		readonly children?: Snippet;
		ref?: HTMLHeadingElement | null;
	}
	const recipe = defineRecipe({
		base: (s) => {
			s.fontSize._large;
			s.fontWeight._bold;
			s.margin.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog-title',
		importStatement: "import { ZDialogTitle } from '@zadmin/zui';",
		name: 'ZDialogTitle',
		bindings: [
			{ description: '真实heading引用。', name: 'ref', type: 'HTMLHeadingElement | null' }
		],
		dependencies: ['ZDialog'],
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
		since: '0.2.0',
		snippets: [{ description: 'Dialog标题。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dialog/ZDialogTitle.svelte',
		states: [],
		status: 'stable',
		summary: '注册aria-labelledby并提供标题语义的Dialog heading。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZDialog } from './context.svelte.js';
	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZDialogTitleProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const unregisterTitle = dialog.registerTitle();
	onDestroy(unregisterTitle);
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		dialog.setTitle(ref);
		return () => {
			if (dialog.title === ref) dialog.setTitle(null);
		};
	});
</script>

<h2
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={dialog.titleId}
>
	{@render children?.()}
</h2>
