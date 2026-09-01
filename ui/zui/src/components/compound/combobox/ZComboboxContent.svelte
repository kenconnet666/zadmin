<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZComboboxContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'manageFocus' | 'role'
	> & { readonly ariaLabel?: string; readonly children?: Snippet };
	export const zuiMetadata = {
		category: 'input',
		id: 'combobox-content',
		importStatement: "import { ZComboboxContent } from '@zadmin/zui';",
		name: 'ZComboboxContent',
		bindings: [{ description: '真实listbox引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZCombobox', 'ZPopoverContent'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "'Suggestions'",
				description: 'listbox可访问名称。',
				name: 'ariaLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实listbox引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '过滤后的Items。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/combobox/ZComboboxContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '不移动DOM焦点的定位listbox shell。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	let {
		ariaLabel = 'Suggestions',
		children,
		ref = $bindable(null),
		...rest
	}: ZComboboxContentProps = $props();
</script>

<ZPopoverContent
	{...rest}
	aria-label={ariaLabel}
	ariaLabelledBy={null}
	bind:ref
	manageFocus={false}
	role="listbox">{@render children?.()}</ZPopoverContent
>
