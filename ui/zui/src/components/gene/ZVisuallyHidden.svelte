<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZVisuallyHiddenProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly children?: Snippet;
		ref?: HTMLSpanElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实span元素引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		category: 'gene',
		dependencies: [],
		events: [],
		id: 'visually-hidden',
		importStatement: "import { ZVisuallyHidden } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZVisuallyHidden',
		parts: [],
		props: [
			{ default: '—', description: '仅辅助技术可读的内容。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实span元素引用。',
				name: 'ref',
				type: 'HTMLSpanElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '仅辅助技术可读的内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZVisuallyHidden.svelte',
		states: [],
		status: 'experimental',
		summary: '在不移出可访问树的前提下从视觉布局中隐藏说明文本。'
	} as const satisfies ZuiComponentMetadata;

	const visuallyHiddenRecipe = defineRecipe({
		base: (s) => {
			s.borderWidth.px(0);
			s.clip.raw('rect(0 0 0 0)');
			s.clipPath.raw('inset(50%)');
			s.height.px(1);
			s.margin.px(-1);
			s.overflow.hidden;
			s.padding.px(0);
			s.position.absolute;
			s.whiteSpace.nowrap;
			s.width.px(1);
		},
		variants: {}
	});

	registerRecipeHmr(import.meta, visuallyHiddenRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { readIcssCarrier } from '../../runtime/compiler-bridge.js';
	import { useZui } from '../../runtime/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/root-style.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZVisuallyHiddenProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(visuallyHiddenRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</span>
