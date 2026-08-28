<script lang="ts">
	import { mergeMiniStyles } from '../../styles/index.ts';
	import { useMiniappTheme } from '../../theme/index.ts';
	import type { MButtonProps } from './types.ts';

	let {
		appParameter,
		children,
		class: className,
		disabled = false,
		formType,
		hoverClass = 'm-button--active',
		id,
		lang,
		loading = false,
		name,
		onclick,
		onOpenType,
		openType,
		sessionFrom,
		showMessageCard,
		size = 'medium',
		style,
		variant = 'primary'
	}: MButtonProps = $props();
	const context = useMiniappTheme();
	const palette = $derived.by(() => {
		const color = context.theme.color;
		switch (variant) {
			case 'danger':
				return { background: color.danger, border: color.danger, foreground: color.canvas };
			case 'ghost':
				return { background: 'transparent', border: 'transparent', foreground: color.primary };
			case 'secondary':
				return { background: color.surface, border: color.border, foreground: color.text };
			default:
				return { background: color.primary, border: color.primary, foreground: color.canvas };
		}
	});
	const mergedStyle = $derived(
		mergeMiniStyles(style, {
			backgroundColor: palette.background,
			borderColor: palette.border,
			borderRadius: context.theme.radius.medium,
			color: palette.foreground,
			fontSize: context.theme.fontSize[size],
			minHeight: context.theme.touch.minTarget,
			opacity: disabled || loading ? context.theme.opacity.disabled : undefined,
			padding: `0 ${context.theme.space.large}`
		})
	);
	const nativeAttributes = $derived({
		'app-parameter': appParameter,
		'form-type': formType,
		'hover-class': disabled || loading ? 'none' : hoverClass,
		lang,
		loading,
		name,
		onagreeprivacyauthorization: onOpenType,
		onchooseavatar: onOpenType,
		oncontact: onOpenType,
		onerror: onOpenType,
		ongetphonenumber: onOpenType,
		ongetrealtimephonenumber: onOpenType,
		ongetuserinfo: onOpenType,
		onlaunchapp: onOpenType,
		onopensetting: onOpenType,
		'open-type': openType,
		'session-from': sessionFrom,
		'show-message-card': showMessageCard
	} as Record<string, unknown>);

	function handleClick(event: unknown): void {
		onclick?.(event as Parameters<NonNullable<MButtonProps['onclick']>>[0]);
	}
</script>

<button
	{...nativeAttributes}
	{id}
	class={['m-button', `m-button--${size}`, `m-button--${variant}`, className]}
	style={mergedStyle}
	disabled={disabled || loading}
	onclick={handleClick}
>
	{#if loading}<text aria-hidden="true">…</text>{/if}
	{@render children?.()}
</button>

<style>
	.m-button {
		display: inline-flex;
		box-sizing: border-box;
		align-items: center;
		justify-content: center;
		border-width: 2rpx;
		border-style: solid;
		font-weight: 600;
		line-height: 1;
	}

	.m-button::after {
		border: 0;
	}

	.m-button--active {
		opacity: 0.72;
	}
</style>
