<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	export interface ZDialogDescriptionProps extends Omit<
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
		id: 'dialog-description',
		importStatement: "import { ZDialogDescription } from '@zadmin/zui';",
		name: 'ZDialogDescription',
		bindings: [
			{ description: '真实paragraph引用。', name: 'ref', type: 'HTMLParagraphElement | null' }
		],
		dependencies: ['ZDialog'],
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
		since: 'unreleased',
		snippets: [{ description: 'Dialog说明。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dialog/ZDialogDescription.svelte',
		states: [],
		status: 'experimental',
		summary: '注册aria-describedby并提供说明语义的Dialog paragraph。'
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
	}: ZDialogDescriptionProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const unregisterDescription = dialog.registerDescription();
	onDestroy(unregisterDescription);
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		dialog.setDescription(ref);
		return () => {
			if (dialog.description === ref) dialog.setDescription(null);
		};
	});
</script>

<p
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={dialog.descriptionId}
>
	{@render children?.()}
</p>
