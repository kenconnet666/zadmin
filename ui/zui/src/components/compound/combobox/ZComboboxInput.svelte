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
		| 'oninput'
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
		dependencies: ['ZCombobox', 'ZInput', 'active-descendant'],
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
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/compound/combobox/ZComboboxInput.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '保持DOM焦点并通过aria-activedescendant驱动filtered listbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZInput from '../../input/ZInput.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZCombobox } from './context.svelte.js';
	let {
		onclick,
		onfocus,
		oninput,
		onkeydown,
		ref = $bindable(null),
		...rest
	}: ZComboboxInputProps = $props();
	const combo = useZCombobox();
	const popover = useZPopover();
	$effect(() => {
		popover.setTrigger(ref);
		return () => {
			if (popover.trigger === ref) popover.setTrigger(null);
		};
	});
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		combo.setInputValue(event.currentTarget.value);
		oninput?.(event);
	}
	function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement }): void {
		onfocus?.(event);
		if (!event.defaultPrevented) combo.setOpen(true);
	}
	function handleClick(event: MouseEvent & { currentTarget: HTMLInputElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) combo.setOpen(true);
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (
			event.key === 'ArrowDown' ||
			event.key === 'ArrowUp' ||
			event.key === 'Home' ||
			event.key === 'End'
		) {
			event.preventDefault();
			combo.setOpen(true);
			combo.move(event.key);
		} else if (event.key === 'Enter' && combo.open && combo.activeKey !== undefined) {
			event.preventDefault();
			combo.choose(combo.activeKey, event);
		}
	}
</script>

<ZInput
	{...rest}
	aria-activedescendant={combo.open ? combo.activeId : undefined}
	aria-autocomplete="list"
	aria-controls={popover.contentId}
	aria-expanded={combo.open}
	aria-haspopup="listbox"
	autocomplete="off"
	bind:ref
	defaultValue={combo.inputDefaultValue}
	disabled={combo.disabled}
	role="combobox"
	resetOnForm={false}
	value={combo.inputValue}
	data-state={combo.open ? 'open' : 'closed'}
	onclick={handleClick}
	onfocus={handleFocus}
	oninput={handleInput}
	onkeydown={handleKeydown}
/>
