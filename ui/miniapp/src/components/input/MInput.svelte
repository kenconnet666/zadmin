<script lang="ts">
	import { mergeMiniStyles } from '../../styles/index.ts';
	import { useMiniappTheme } from '../../theme/index.ts';
	import type { MiniappEvent } from '../types.ts';
	import type { MInputProps } from './types.ts';

	let {
		class: className,
		confirmHold,
		confirmType = 'done',
		disabled,
		id,
		maxlength = 140,
		onConfirm,
		onValueChange,
		password,
		placeholder,
		style,
		type = 'text',
		value = $bindable('')
	}: MInputProps = $props();
	const context = useMiniappTheme();
	const mergedStyle = $derived(
		mergeMiniStyles(style, {
			backgroundColor: context.theme.color.canvas,
			borderColor: context.theme.color.border,
			borderRadius: context.theme.radius.medium,
			borderStyle: 'solid',
			borderWidth: '2rpx',
			boxSizing: 'border-box',
			color: context.theme.color.text,
			fontSize: context.theme.fontSize.medium,
			minHeight: context.theme.touch.minTarget,
			padding: `0 ${context.theme.space.medium}`,
			width: '100%'
		})
	);

	function handleInput(rawEvent: unknown): void {
		const event = rawEvent as MiniappEvent<{ value: string }>;
		value = event.detail.value;
		onValueChange?.(value, event);
	}

	function handleConfirm(rawEvent: unknown): void {
		const event = rawEvent as MiniappEvent<{ value: string }>;
		onConfirm?.(event.detail.value, event);
	}
	const nativeAttributes = $derived({
		'confirm-hold': confirmHold,
		'confirm-type': confirmType,
		disabled,
		maxlength,
		onconfirm: handleConfirm,
		oninput: handleInput,
		password,
		placeholder,
		type,
		value
	} as Record<string, unknown>);
</script>

<input {...nativeAttributes} {id} class={['m-input', className]} style={mergedStyle} />
