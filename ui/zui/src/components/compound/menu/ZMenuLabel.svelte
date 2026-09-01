<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	export interface ZMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-label',
		importStatement: "import { ZMenuLabel } from '@zadmin/zui';",
		name: 'ZMenuLabel',
		bindings: [{ description: '真实label引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMenu'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实label引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '分组标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuLabel.svelte',
		states: [],
		status: 'experimental',
		summary: '为Menu分组提供不可聚焦的视觉标签。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useOptionalZMenuGroup } from './context.svelte.js';
	const recipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
			s.fontWeight._semibold;
			s.paddingBlock._xsmall;
			s.paddingInline._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZMenuLabelProps = $props();
	const zui = useZui();
	const group = useOptionalZMenuGroup();
	const resolvedId = $derived(rest.id ?? group?.labelId);
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => (resolvedId === undefined ? undefined : group?.registerLabel(resolvedId)));
</script>

<div
	{...rest}
	bind:this={ref}
	id={resolvedId}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	{@render children?.()}
</div>
