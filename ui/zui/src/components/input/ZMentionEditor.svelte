<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { listenForFormReset } from '../../runtime/form/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { useZPopover } from '../compound/popover/context.svelte.js';

	interface ZMentionEditorProps extends Omit<
		HTMLTextareaAttributes,
		'aria-activedescendant' | 'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'value'
	> {
		readonly activeId?: string;
		readonly onEditorInput: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => void;
		readonly onEditorKeydown: (
			event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }
		) => void;
		readonly onEditorReset: () => void;
		ref?: HTMLTextAreaElement | null;
		readonly value: string;
	}

	const editorRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.lineHeight._normal;
			s.minHeight.rem(6);
			s.padding._medium;
			s.resize.vertical;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s.width._full;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, editorRecipe);

	let {
		activeId,
		class: className,
		oncompositionend,
		defaultValue,
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
	const zui = useZui();
	const popover = useZPopover();
	const rootClass = $derived(zui.recipe(editorRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		popover.setTrigger(ref);
		return () => {
			if (popover.trigger === ref) popover.setTrigger(null);
		};
	});
	$effect(() => {
		if (!ref) return;
		return listenForFormReset(ref, onEditorReset);
	});
</script>

<textarea
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={popover.triggerId}
	{defaultValue}
	{value}
	aria-activedescendant={popover.open ? activeId : undefined}
	aria-autocomplete="list"
	aria-controls={popover.open ? popover.contentId : undefined}
	aria-expanded={popover.open}
	aria-haspopup="listbox"
	data-state={popover.open ? 'open' : 'closed'}
	oncompositionend={(event) => {
		oncompositionend?.(event);
		if (!event.defaultPrevented)
			onEditorInput(event as unknown as InputEvent & { currentTarget: HTMLTextAreaElement });
	}}
	oninput={(event) => {
		oninput?.(event);
		if (!event.defaultPrevented) onEditorInput(event);
	}}
	onkeydown={(event) => {
		onkeydown?.(event);
		if (!event.defaultPrevented) onEditorKeydown(event);
	}}></textarea>
