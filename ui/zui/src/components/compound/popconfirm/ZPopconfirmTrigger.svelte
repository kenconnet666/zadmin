<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZPopconfirmTriggerProps = ZPopoverTriggerProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-trigger',
		importStatement: "import { ZPopconfirmTrigger } from '@zadmin/zui';",
		name: 'ZPopconfirmTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZPopconfirm', 'ZPopoverTrigger'],
		events: [
			{
				description: 'preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '切换Popconfirm。', key: 'Enter / Space' }],
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
		since: 'unreleased',
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '切换所属Popconfirm并建立aria关系。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	let { ref = $bindable(null), ...rest }: ZPopconfirmTriggerProps = $props();
</script>

<ZPopoverTrigger {...rest} bind:ref />
