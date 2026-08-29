<script lang="ts">
	import { ZBox, defaultTheme, icss } from '@zadmin/zui';

	import WindowControls from '../window-controls/WindowControls.svelte';
	import WindowTitleBar from '../window-title-bar/WindowTitleBar.svelte';
	import type { WindowFrameProps } from './types.js';

	let {
		children,
		class: className,
		onerror,
		title = 'ZAdmin Desktop',
		titlebar
	}: WindowFrameProps = $props();
	const frameClass = icss(defaultTheme, (s) => {
		s.display.flex;
		s.flexDirection.column;
		s.minHeight('100vh');
		s.backgroundColor._canvas;
		s.color._text;
		s.overflow.hidden;
	});
	const contentClass = icss(defaultTheme, (s) => {
		s.flex(1);
		s.minHeight.px(0);
		s.overflow.auto;
	});
</script>

<ZBox class={[frameClass, className]} data-webview-window-frame>
	{#if titlebar}
		{@render titlebar()}
	{:else}
		<WindowTitleBar {title} {onerror}><WindowControls {onerror} /></WindowTitleBar>
	{/if}
	<main class={contentClass}>{@render children?.()}</main>
</ZBox>
