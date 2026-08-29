<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	export interface ZBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'box',
		importStatement: "import { ZBox } from '@zadmin/zui';",
		name: 'ZBox',
		props: [
			{ default: '—', description: '容器内容。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		source: 'ui/zui/src/components/gene/ZBox.svelte',
		status: 'stable',
		summary: '严格的div容器，class、style、ref和ICSS变量直接落到真实根元素。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/root-style.js';
	import { readIcssCarrier } from '../../runtime/compiler-bridge.js';

	let { children, class: className, ref = $bindable(null), style, ...rest }: ZBoxProps = $props();
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</div>
