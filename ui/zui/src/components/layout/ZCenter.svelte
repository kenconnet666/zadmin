<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZCenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly inline?: boolean;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实div中心容器引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'layout',
		dependencies: ['native flexbox', 'logical CSS'],
		events: [],
		id: 'center',
		importStatement: "import { ZCenter } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZCenter',
		parts: [],
		props: [
			{
				default: 'false',
				description: 'false使用块级flex，true使用inline-flex；两者都在两轴居中children。',
				name: 'inline',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实div中心容器引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '居中内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/layout/ZCenter.svelte',
		states: [{ description: '布局外部格式。', name: 'data-inline', values: ['true'] }],
		status: 'experimental',
		summary: '用原生flex或inline-flex在两个轴上居中普通children，不增加语义、焦点或测量行为。'
	} as const satisfies ZuiComponentMetadata;

	const centerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.boxSizing.borderBox;
			s.justifyContent.center;
			s.minWidth.px(0);
		},
		variants: {
			inline: {
				false: (s) => s.display.flex,
				true: (s) => s.display.inlineFlex
			}
		},
		defaultVariants: { inline: false }
	});

	registerRecipeHmr(import.meta, centerRecipe);
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
		children,
		class: className,
		inline = false,
		ref = $bindable(null),
		style,
		...rest
	}: ZCenterProps = $props();

	const zui = useZui();
	const rootClass = $derived(zui.recipe(centerRecipe, { inline }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-inline={inline || undefined}
>
	{@render children?.()}
</div>
