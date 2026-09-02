<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZInputProps } from '../../input/ZInput.svelte';

	export type ZComboboxInputProps = Omit<
		ZInputProps,
		| 'aria-activedescendant'
		| 'aria-autocomplete'
		| 'aria-controls'
		| 'aria-expanded'
		| 'aria-haspopup'
		| 'disabled'
		| 'form'
		| 'invalid'
		| 'name'
		| 'oninput'
		| 'required'
		| 'resetOnForm'
		| 'role'
		| 'value'
	> & { readonly oninput?: ZInputProps['oninput'] };
	export const zuiMetadata = {
		category: 'input',
		id: 'combobox-input',
		importStatement: "import { ZComboboxInput } from '@zadmin/zui';",
		name: 'ZComboboxInput',
		bindings: [{ description: '真实input引用。', name: 'ref', type: 'HTMLInputElement | null' }],
		dependencies: ['ZCombobox', 'ZInput', 'LogicalCollection', 'ActiveDescendant'],
		events: [
			{
				description: '原生input回调。',
				name: 'oninput',
				type: 'FormEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [
			{ description: '移动active option。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '选择active option。', key: 'Enter' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/combobox/ZComboboxInput.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'stable',
		summary: '保持DOM焦点并通过aria-activedescendant驱动filtered listbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import { useZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import ZInput from '../../input/ZInput.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZCombobox } from './context.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		id,
		onclick,
		onfocus,
		oninput,
		onkeydown,
		ref = $bindable(null),
		...rest
	}: ZComboboxInputProps = $props();
	const combo = useZCombobox();
	const fieldOwner = useZFieldControlOwner();
	const popover = useZPopover();
	$effect(() => {
		popover.setTrigger(ref);
		return () => {
			if (popover.trigger === ref) popover.setTrigger(null);
		};
	});
	$effect(() => {
		const owner = ref;
		if (!owner || !fieldOwner) return;
		return fieldOwner.registerFocusOwner(() => owner.focus({ preventScroll: true }));
	});

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		combo.setInputValue(event.currentTarget.value);
		oninput?.(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement }): void {
		onfocus?.(event);
		if (!event.defaultPrevented && combo.openOnFocus) combo.setOpen(true, 'selected');
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLInputElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) combo.setOpen(true);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || combo.readonly || isKeyboardComposing(event)) return;
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				if (!combo.open) {
					combo.setOpen(true, event.key === 'ArrowUp' ? 'last' : 'first');
				} else {
					combo.handleKey(event);
				}
				return;
			case 'Home':
			case 'End':
				if (combo.open) combo.handleKey(event);
				return;
			case 'Enter':
				if (!combo.open || combo.activeKey === undefined) return;
				event.preventDefault();
				combo.choose(combo.activeKey, event);
				return;
			case 'Escape':
				if (combo.open) {
					event.preventDefault();
					combo.setOpen(false);
				}
				return;
			default:
				return;
		}
	}
</script>

<ZInput
	{...rest}
	aria-activedescendant={combo.open ? combo.activeId : undefined}
	aria-autocomplete="list"
	aria-busy={combo.loading || undefined}
	aria-controls={popover.contentId}
	aria-describedby={mergeAriaIds(ariaDescribedBy, combo.describedBy)}
	aria-expanded={combo.open}
	aria-haspopup="listbox"
	aria-invalid={combo.invalid || undefined}
	aria-required={combo.required || undefined}
	autocomplete="off"
	bind:ref
	defaultValue={combo.inputDefaultValue}
	disabled={combo.disabled}
	form={undefined}
	id={id ?? combo.controlId}
	invalid={combo.invalid}
	name={undefined}
	readonly={combo.readonly}
	role="combobox"
	resetOnForm={false}
	value={combo.inputValue}
	data-state={combo.open ? 'open' : 'closed'}
	onclick={handleClick}
	onfocus={handleFocus}
	oninput={handleInput}
	onkeydown={handleKeydown}
/>
