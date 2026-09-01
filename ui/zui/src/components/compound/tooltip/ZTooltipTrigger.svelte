<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';

	export type ZTooltipTriggerProps = Omit<
		ZButtonProps,
		'aria-describedby' | 'onblur' | 'onfocus' | 'onpointerenter' | 'onpointerleave'
	> & {
		readonly onblur?: ZButtonProps['onblur'];
		readonly onfocus?: ZButtonProps['onfocus'];
		readonly onpointerenter?: ZButtonProps['onpointerenter'];
		readonly onpointerleave?: ZButtonProps['onpointerleave'];
	};

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tooltip-trigger',
		importStatement: "import { ZTooltipTrigger } from '@zadmin/zui';",
		name: 'ZTooltipTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZTooltip', 'ZButton'],
		events: [],
		keyboard: [{ description: 'focus后显示Tooltip，blur后关闭。', key: 'Tab / Shift+Tab' }],
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
		source: 'ui/zui/src/components/compound/tooltip/ZTooltipTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '合并hover与focus触发并关联aria-describedby的Tooltip按钮。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZTooltip } from './context.svelte.js';

	let {
		onblur,
		onfocus,
		onpointerenter,
		onpointerleave,
		ref = $bindable(null),
		...rest
	}: ZTooltipTriggerProps = $props();
	const tooltip = useZTooltip();

	$effect(() => {
		tooltip.setTrigger(ref);
		return () => {
			if (tooltip.trigger === ref) tooltip.setTrigger(null);
		};
	});
</script>

<ZButton
	{...rest}
	bind:ref
	aria-describedby={tooltip.open ? tooltip.contentId : undefined}
	data-state={tooltip.open ? 'open' : 'closed'}
	onpointerenter={(event) => {
		onpointerenter?.(event);
		if (!event.defaultPrevented) tooltip.openAfterDelay();
	}}
	onpointerleave={(event) => {
		onpointerleave?.(event);
		if (!event.defaultPrevented) tooltip.close();
	}}
	onfocus={(event) => {
		onfocus?.(event);
		if (!event.defaultPrevented) tooltip.openAfterDelay();
	}}
	onblur={(event) => {
		onblur?.(event);
		if (!event.defaultPrevented) tooltip.close();
	}}
/>
