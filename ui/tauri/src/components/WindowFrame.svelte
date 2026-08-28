<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Box, defaultTheme, icss } from '@zadmin/zui';

	import type { DesktopError } from '../runtime/error.js';
	import WindowControls from './WindowControls.svelte';
	import WindowTitleBar from './WindowTitleBar.svelte';

	interface Props {
		children?: Snippet;
		class?: string;
		onerror?: (error: DesktopError) => void;
		title?: string;
		titlebar?: Snippet;
	}

	let { children, class: className, onerror, title = 'ZAdmin Desktop', titlebar }: Props = $props();
	const frameClass = icss(defaultTheme, (css) => {
		css.display.flex;
		css.flexDirection.column;
		css.minHeight('100vh');
		css.backgroundColor._canvas;
		css.color._text;
		css.overflow.hidden;
	});
	const contentClass = icss(defaultTheme, (css) => {
		css.flex(1);
		css.minHeight.px(0);
		css.overflow.auto;
	});
</script>

<Box class={[frameClass, className]} data-tauri-window-frame>
	{#if titlebar}
		{@render titlebar()}
	{:else}
		<WindowTitleBar {title} {onerror}><WindowControls {onerror} /></WindowTitleBar>
	{/if}
	<main class={contentClass}>
		{@render children?.()}
	</main>
</Box>
