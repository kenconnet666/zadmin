<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';
	export type ZSelectTriggerProps = Omit<
		ZPopoverTriggerProps,
		'aria-required' | 'children' | 'disabled' | 'popupRole'
	> & { readonly children?: Snippet };
	export const zuiMetadata = {
		category: 'input',
		id: 'select-trigger',
		importStatement: "import { ZSelectTrigger } from '@zadmin/zui';",
		name: 'ZSelectTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZSelect', 'ZPopoverTrigger'],
		events: [
			{
				description: 'preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '打开listbox。', key: 'Enter / Space / ArrowUp / ArrowDown' }],
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
		snippets: [
			{
				description: '自定义Trigger内容；省略时显示选中项文本。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/select/ZSelectTrigger.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '是否已有值。', name: 'data-placeholder', values: ['true'] }
		],
		status: 'experimental',
		summary: '显示当前值并以aria-haspopup=listbox打开Select Content。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import { useZSelect } from './context.svelte.js';
	let {
		children,
		onkeydown,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZSelectTriggerProps = $props();
	const select = useZSelect();
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			event.preventDefault();
			select.setOpen(true);
		}
	}
</script>

<ZPopoverTrigger
	{...rest}
	aria-required={select.required || undefined}
	bind:ref
	disabled={select.disabled}
	popupRole="listbox"
	{variant}
	onkeydown={handleKeydown}
	data-placeholder={select.value === undefined || undefined}
>
	{#if children}{@render children()}{:else}{select.selectedText}{/if}
</ZPopoverTrigger>
