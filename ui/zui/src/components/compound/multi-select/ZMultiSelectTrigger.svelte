<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverTriggerProps } from '../popover/ZPopoverTrigger.svelte';

	export type ZMultiSelectTriggerProps = Omit<
		ZPopoverTriggerProps,
		'aria-required' | 'children' | 'disabled' | 'id' | 'popupRole'
	> & { readonly children?: Snippet };

	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select-trigger',
		importStatement: "import { ZMultiSelectTrigger } from '@zadmin/zui';",
		name: 'ZMultiSelectTrigger',
		bindings: [
			{ description: '唯一真实button焦点owner。', name: 'ref', type: 'HTMLButtonElement | null' }
		],
		dependencies: ['ZMultiSelect', 'ZPopoverTrigger', 'ZTag'],
		events: [],
		keyboard: [
			{ description: '打开listbox。', key: 'Enter / Space / ArrowUp / ArrowDown' },
			{ description: '移除最后一个tag。', key: 'Backspace / Delete' },
			{ description: 'clearable时清空全部tag。', key: 'Control/Command + Backspace' }
		],
		parts: [
			{ description: '复用ZTag的选中值标签。', name: 'tag' },
			{ description: '不创建第二焦点点位的指针移除图标。', name: 'tag-remove' },
			{ description: 'maxTagCount折叠摘要。', name: 'overflow' },
			{ description: 'clearable清空图标。', name: 'clear' }
		],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '唯一真实button焦点owner。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '完全替换内置tag、overflow与clear外观；键盘移除合同仍保留。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectTrigger.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '空选择。', name: 'data-placeholder', values: ['true'] },
			{ description: '业务选择值无效。', name: 'data-invalid', values: ['true'] },
			{ description: '保持可聚焦但不可修改。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary: '复用ZTag显示多值，以单一button焦点owner提供溢出、移除与打开合同。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Attachment } from 'svelte/attachments';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import { useZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import ZTag from '../../data-display/ZTag.svelte';
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import { useZMultiSelect } from './context.svelte.js';

	const removeRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.color._textMuted;
			s.cursor.pointer;
			s.display.inlineFlex;
			s.justifyContent.center;
			s.marginInlineStart._xsmall;
			s.touchAction.manipulation;
		},
		variants: {},
		defaultVariants: {}
	});
	const triggerRecipe = defineRecipe({
		base: (s) => {
			s.flexWrap.wrap;
			s.justifyContent.start;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, removeRecipe);
	registerRecipeHmr(import.meta, triggerRecipe);

	let {
		'aria-describedby': ariaDescribedBy,
		children,
		class: className,
		onclick,
		onkeydown,
		ref = $bindable(null),
		variant = 'secondary',
		...rest
	}: ZMultiSelectTriggerProps = $props();
	const multi = useZMultiSelect();
	const fieldOwner = useZFieldControlOwner();
	const zui = useZui();
	const removeClass = $derived(zui.recipe(removeRecipe));
	const triggerClass = $derived(zui.recipe(triggerRecipe));
	const visibleTags = $derived(
		multi.maxTagCount === undefined ? multi.tags : multi.tags.slice(0, multi.maxTagCount)
	);
	const hiddenCount = $derived(multi.tags.length - visibleTags.length);

	$effect(() => {
		const owner = ref;
		if (!owner || !fieldOwner) return;
		return fieldOwner.registerFocusOwner(() => owner.focus({ preventScroll: true }));
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				multi.setOpen(true, event.key === 'ArrowUp' ? 'last' : 'first');
				return;
			case 'Backspace':
			case 'Delete': {
				if ((event.ctrlKey || event.metaKey) && multi.clearable) {
					if (multi.clear()) event.preventDefault();
					return;
				}
				const last = multi.values.at(-1);
				if (last !== undefined && multi.remove(last)) event.preventDefault();
				return;
			}
		}
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (multi.readonly) event.preventDefault();
	}

	function attachPointerAction(action: () => void): Attachment<HTMLSpanElement> {
		return (node) => {
			const stopPointer = (event: PointerEvent): void => {
				event.preventDefault();
				event.stopPropagation();
			};
			const activate = (event: MouseEvent): void => {
				event.preventDefault();
				event.stopPropagation();
				action();
				ref?.focus({ preventScroll: true });
			};
			node.addEventListener('click', activate);
			node.addEventListener('pointerdown', stopPointer);
			return () => {
				node.removeEventListener('click', activate);
				node.removeEventListener('pointerdown', stopPointer);
			};
		};
	}
</script>

<ZPopoverTrigger
	{...rest}
	aria-describedby={mergeAriaIds(ariaDescribedBy, multi.describedBy)}
	aria-disabled={multi.readonly || undefined}
	aria-invalid={multi.invalid || undefined}
	aria-keyshortcuts={multi.values.length > 0
		? 'Backspace Delete Control+Backspace Meta+Backspace'
		: undefined}
	bind:ref
	class={[triggerClass, className]}
	disabled={multi.disabled}
	id={multi.controlId}
	popupRole="listbox"
	{variant}
	onkeydown={handleKeydown}
	data-invalid={multi.invalid || undefined}
	data-placeholder={multi.values.length === 0 || undefined}
	data-readonly={multi.readonly || undefined}
	data-required={multi.required || undefined}
	onclick={handleClick}
>
	{#if children}
		{@render children()}
	{:else if multi.tags.length === 0}
		{multi.placeholder}
	{:else}
		{#each visibleTags as tag (tag.value)}
			<ZTag data-slot="tag">
				<span data-slot="tag-label">{tag.label}</span>
				{#if !tag.disabled && !multi.disabled && !multi.readonly}
					<span
						{@attach attachPointerAction(() => multi.remove(tag.value))}
						aria-hidden="true"
						class={removeClass}
						data-slot="tag-remove"
					>
						<X size={13} />
					</span>
				{/if}
			</ZTag>
		{/each}
		{#if hiddenCount > 0}
			<ZTag data-slot="overflow">{multi.overflowLabel(hiddenCount)}</ZTag>
		{/if}
		{#if multi.clearable && !multi.disabled && !multi.readonly}
			<span
				{@attach attachPointerAction(() => multi.clear())}
				aria-hidden="true"
				class={removeClass}
				data-slot="clear"
			>
				<X size={15} />
			</span>
		{/if}
	{/if}
</ZPopoverTrigger>
