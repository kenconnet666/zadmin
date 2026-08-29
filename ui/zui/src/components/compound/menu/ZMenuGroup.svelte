<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	export interface ZMenuGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-group',
		importStatement: "import { ZMenuGroup } from '@zadmin/zui';",
		name: 'ZMenuGroup',
		bindings: [{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMenu'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实group引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: 'Label和Items。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuGroup.svelte',
		states: [],
		status: 'experimental',
		summary: '使用原生ARIA group组织相关Menu Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	let { children, ref = $bindable(null), ...rest }: ZMenuGroupProps = $props();
</script>

<div {...rest} bind:this={ref} role="group">{@render children?.()}</div>
