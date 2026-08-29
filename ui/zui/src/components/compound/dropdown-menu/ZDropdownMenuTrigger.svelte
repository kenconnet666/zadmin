<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZDropdownMenuTriggerProps = Omit<ZPopoverTriggerProps, 'popupRole'>;
	export const zuiMetadata = {
		category: 'navigation',
		id: 'dropdown-menu-trigger',
		importStatement: "import { ZDropdownMenuTrigger } from '@zadmin/zui';",
		name: 'ZDropdownMenuTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZDropdownMenu', 'ZPopoverTrigger'],
		events: [
			{
				description: 'preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '切换Menu。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dropdown-menu/ZDropdownMenuTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '使用aria-haspopup=menu切换Dropdown Menu。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	let { ref = $bindable(null), ...rest }: ZDropdownMenuTriggerProps = $props();
</script>

<ZPopoverTrigger {...rest} bind:ref popupRole="menu" />
