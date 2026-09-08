<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';

	export type ZSelectTriggerProps = Omit<
		ZPopoverTriggerProps,
		'aria-required' | 'children' | 'disabled' | 'id' | 'popupRole'
	> & { readonly children?: Snippet; readonly disabled?: boolean };
	export const zuiMetadata = {
		category: 'input',
		id: 'select-trigger',
		importStatement: "import { ZSelectTrigger } from '@zadmin/zui';",
		name: 'ZSelectTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZSelect', 'ZPopoverTrigger', 'ActiveDescendant'],
		events: [
			{
				description: 'preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '通过原生button激活切换listbox。', key: 'Enter / Space' },
			{
				description:
					'打开或返回已打开的listbox，ArrowDown定位首项，ArrowUp定位末项；不改变选中值。',
				key: 'ArrowUp / ArrowDown'
			}
		],
		parts: [],
		props: [
			{
				default: '继承Select；显式true可进一步禁用Trigger',
				description: 'Trigger局部禁用状态，与Select disabled取逻辑或。',
				name: 'disabled',
				type: 'boolean'
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
			{ description: '是否已有值。', name: 'data-placeholder', values: ['true'] },
			{ description: '业务选择值无效。', name: 'data-invalid', values: ['true'] },
			{ description: '保持可聚焦但不可打开或修改。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary: '显示当前值并以aria-haspopup=listbox打开Select Content。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import { useZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import { useZSelect } from './context.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		children,
		disabled: disabledProp = false,
		onclick,
		onkeydown,
		ref = $bindable(null),
		size,
		variant = 'outline',
		...rest
	}: ZSelectTriggerProps = $props();
	const select = useZSelect();
	const zui = useZui();
	const fieldOwner = useZFieldControlOwner();
	$effect(() => {
		const owner = ref;
		if (!owner || !fieldOwner) return;
		return fieldOwner.registerFocusOwner(() => owner.focus({ preventScroll: true }));
	});
	$effect(() => select.registerValueElement(() => ref));

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			disabledProp ||
			select.disabled ||
			select.readonly ||
			isKeyboardComposing(event)
		)
			return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			select.setOpen(true, event.key === 'ArrowUp' ? 'last' : 'first');
		}
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (select.readonly) event.preventDefault();
	}
</script>

<ZPopoverTrigger
	{...rest}
	aria-describedby={mergeAriaIds(ariaDescribedBy, select.describedBy)}
	aria-disabled={select.readonly || undefined}
	aria-invalid={select.invalid || undefined}
	bind:ref
	disabled={disabledProp || select.disabled}
	dir={rest.dir ?? zui.direction}
	popupRole="listbox"
	size={size ?? select.size}
	{variant}
	onkeydown={handleKeydown}
	data-invalid={select.invalid || undefined}
	data-placeholder={select.value === undefined || undefined}
	data-readonly={select.readonly || undefined}
	onclick={handleClick}
>
	{#if children}{@render children()}{:else}{select.selectedText}{/if}
</ZPopoverTrigger>
