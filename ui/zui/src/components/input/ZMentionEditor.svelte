<script lang="ts">
	import { useZPopover } from '../compound/popover/context.svelte.js';
	import ZTextarea, { type ZTextareaProps } from './ZTextarea.svelte';

	interface ZMentionEditorProps extends Omit<
		ZTextareaProps,
		| 'aria-activedescendant'
		| 'aria-controls'
		| 'aria-expanded'
		| 'aria-haspopup'
		| 'resetOnForm'
		| 'value'
	> {
		readonly activeId?: string;
		readonly listId: string;
		readonly onEditorInput: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => void;
		readonly onEditorKeydown: (
			event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }
		) => void;
		readonly onEditorReset: () => void;
		ref?: HTMLTextAreaElement | null;
		readonly value: string;
	}

	let {
		activeId,
		class: className,
		oncompositionend,
		defaultValue,
		listId,
		onEditorInput,
		onEditorKeydown,
		onEditorReset,
		oninput,
		onkeydown,
		ref = $bindable(null),
		style,
		value,
		...rest
	}: ZMentionEditorProps = $props();
	const popover = useZPopover();
	$effect(() => {
		popover.setTrigger(ref);
		return () => {
			if (popover.trigger === ref) popover.setTrigger(null);
		};
	});
</script>

<ZTextarea
	{...rest}
	bind:ref
	class={className}
	{style}
	id={popover.triggerId}
	{defaultValue}
	{value}
	onFormReset={onEditorReset}
	resetOnForm={false}
	aria-activedescendant={popover.open ? activeId : undefined}
	aria-autocomplete="list"
	aria-controls={popover.open ? listId : undefined}
	aria-haspopup="listbox"
	data-state={popover.open ? 'open' : 'closed'}
	oncompositionend={(event) => {
		oncompositionend?.(event);
		if (!event.defaultPrevented)
			onEditorInput(event as unknown as InputEvent & { currentTarget: HTMLTextAreaElement });
	}}
	oninput={(event) => {
		oninput?.(event);
		if (!event.defaultPrevented) {
			onEditorInput(event as unknown as InputEvent & { currentTarget: HTMLTextAreaElement });
		}
	}}
	onkeydown={(event) => {
		onkeydown?.(event);
		if (!event.defaultPrevented) onEditorKeydown(event);
	}}
/>
