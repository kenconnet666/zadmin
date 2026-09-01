<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	export interface ZMenuSeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-separator',
		importStatement: "import { ZMenuSeparator } from '@zadmin/zui';",
		name: 'ZMenuSeparator',
		bindings: [{ description: '真实separator引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMenu'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实separator引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/menu/ZMenuSeparator.svelte',
		states: [],
		status: 'experimental',
		summary: '使用separator语义分隔Menu分组。'
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
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._border;
			s.height.px(1);
			s.marginBlock._xsmall;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	let { class: className, ref = $bindable(null), style, ...rest }: ZMenuSeparatorProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="separator"
></div>
