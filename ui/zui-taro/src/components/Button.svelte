<script lang="ts">
	import { mergeTaroStyles, useZuiTaroTheme } from '../runtime/index.ts';
	import type { ButtonProps } from './types.ts';

	let {
		appParameter,
		children,
		class: className,
		disabled = false,
		formType,
		hoverClass,
		id,
		lang,
		loading = false,
		name,
		onAgreePrivacyAuthorization,
		onChooseAvatar,
		onContact,
		onError,
		onGetPhoneNumber,
		onGetRealTimePhoneNumber,
		onGetUserInfo,
		onLaunchApp,
		onOpenSetting,
		onclick,
		openType,
		sessionFrom,
		showMessageCard,
		size = 'medium',
		style,
		variant = 'primary'
	}: ButtonProps = $props();

	const context = useZuiTaroTheme();
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
	const metrics = $derived.by(() => {
		switch (size) {
			case 'large':
				return { font: 16, height: 44, horizontal: 20 };
			case 'small':
				return { font: 12, height: 28, horizontal: 10 };
			default:
				return { font: 14, height: 36, horizontal: 16 };
		}
	});
	const mergedStyle = $derived(
		mergeTaroStyles(style, {
			backgroundColor: palette.background,
			borderColor: palette.border,
			color: palette.foreground,
			fontSize: `${metrics.font}px`,
			minHeight: `${metrics.height}px`,
			opacity: disabled || loading ? context.theme.opacity.disabled : undefined,
			padding: `0 ${metrics.horizontal}px`
		})
	);
	const nativeAttributes = $derived({
		'app-parameter': appParameter,
		'form-type': formType,
		'hover-class': hoverClass,
		lang,
		loading,
		name,
		onagreeprivacyauthorization: onAgreePrivacyAuthorization,
		onchooseavatar: onChooseAvatar,
		oncontact: onContact,
		onerror: onError,
		ongetphonenumber: onGetPhoneNumber,
		ongetrealtimephonenumber: onGetRealTimePhoneNumber,
		ongetuserinfo: onGetUserInfo,
		onlaunchapp: onLaunchApp,
		onopensetting: onOpenSetting,
		'open-type': openType,
		'session-from': sessionFrom,
		'show-message-card': showMessageCard
	} as Record<string, unknown>);
</script>

<button
	{...nativeAttributes}
	{id}
	class={['zui-button', `zui-button--${size}`, `zui-button--${variant}`, className]}
	style={mergedStyle}
	disabled={disabled || loading}
	{onclick}
>
	{#if loading}<text aria-hidden="true">…</text>{/if}
	{@render children?.()}
</button>

<style>
	.zui-button {
		display: inline-flex;
		box-sizing: border-box;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 0;
		border-width: 1px;
		border-style: solid;
		border-radius: 8px;
		font-weight: 600;
		line-height: 1;
	}

	.zui-button::after {
		border: 0;
	}
</style>
