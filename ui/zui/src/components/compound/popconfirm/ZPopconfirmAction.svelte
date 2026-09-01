<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';
	export type ZPopconfirmActionProps = Omit<ZButtonProps, 'onclick'> & {
		readonly onclick?: ZButtonProps['onclick'];
	};
	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm-action',
		importStatement: "import { ZPopconfirmAction } from '@zadmin/zui';",
		name: 'ZPopconfirmAction',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZPopconfirm', 'ZButton', 'async generation'],
		events: [
			{
				description: '先执行操作；preventDefault可保持Popconfirm打开。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: '显式确认并关闭。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				default: "'primary'",
				description: '继承ZButton视觉强调层级。',
				name: 'variant',
				type: "'primary' | 'secondary' | 'ghost'"
			},
			{
				default: "'danger'",
				description: '默认使用危险语义，可由调用方明确覆盖。',
				name: 'tone',
				type: "'default' | 'danger'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '确认操作内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirmAction.svelte',
		states: [{ description: '确认Promise尚未settle。', name: 'data-pending', values: ['true'] }],
		status: 'experimental',
		summary: '默认danger视觉并显式确认Popconfirm。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZButton from '../../gene/ZButton.svelte';
	import { useZPopconfirm } from './context.svelte.js';
	let {
		'aria-describedby': ariaDescribedBy,
		disabled = false,
		loading = false,
		onclick,
		ref = $bindable(null),
		tone = 'danger',
		variant = 'primary',
		...rest
	}: ZPopconfirmActionProps = $props();
	const popconfirm = useZPopconfirm();
	const resolvedDescribedBy = $derived(
		[ariaDescribedBy, popconfirm.errorMessage ? popconfirm.errorId : undefined]
			.filter(Boolean)
			.join(' ') || undefined
	);
	$effect(() => {
		popconfirm.setAction(ref);
		return () => popconfirm.setAction(null);
	});
	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented && !popconfirm.pending) popconfirm.confirm(event);
	}
</script>

<ZButton
	{...rest}
	bind:ref
	disabled={disabled || popconfirm.pending}
	loading={loading || popconfirm.pending}
	{tone}
	{variant}
	aria-describedby={resolvedDescribedBy}
	data-pending={popconfirm.pending || undefined}
	onclick={handleClick}
/>
