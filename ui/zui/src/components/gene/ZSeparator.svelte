<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZSeparatorOrientation = 'horizontal' | 'vertical';

	export interface ZSeparatorProps extends HTMLAttributes<HTMLElement> {
		readonly decorative?: boolean;
		readonly orientation?: ZSeparatorOrientation;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实hr或div元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		category: 'gene',
		dependencies: [],
		events: [],
		id: 'separator',
		importStatement: "import { ZSeparator } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZSeparator',
		parts: [],
		props: [
			{
				default: 'false',
				description: '从可访问树隐藏纯视觉分隔线。',
				name: 'decorative',
				type: 'boolean'
			},
			{
				default: "'horizontal'",
				description: '水平时使用原生hr，垂直时使用ARIA separator。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实hr或div元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/gene/ZSeparator.svelte',
		states: [
			{
				description: '分隔线当前书写方向。',
				name: 'data-orientation',
				values: ['horizontal', 'vertical']
			}
		],
		status: 'experimental',
		summary: '以原生hr或ARIA separator表达水平、垂直内容边界。'
	} as const satisfies ZuiComponentMetadata;

	const separatorRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._border;
			s.borderWidth.px(0);
			s.margin.px(0);
		},
		variants: {
			orientation: {
				horizontal: (s) => {
					s.height.px(1);
					s.width._full;
				},
				vertical: (s) => {
					s.alignSelf.stretch;
					s.minHeight.rem(1);
					s.width.px(1);
				}
			}
		},
		defaultVariants: { orientation: 'horizontal' }
	});

	registerRecipeHmr(import.meta, separatorRecipe);
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

	let {
		class: className,
		decorative = false,
		orientation = 'horizontal',
		ref = $bindable(null),
		style,
		...rest
	}: ZSeparatorProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(separatorRecipe, { orientation }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

{#if orientation === 'horizontal'}
	<hr
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-hidden={decorative || undefined}
		aria-orientation={decorative ? undefined : 'horizontal'}
		data-orientation="horizontal"
		role={decorative ? 'presentation' : undefined}
	/>
{:else}
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-hidden={decorative || undefined}
		aria-orientation={decorative ? undefined : 'vertical'}
		data-orientation="vertical"
		role={decorative ? 'presentation' : 'separator'}
	></div>
{/if}
