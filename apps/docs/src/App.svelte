<script lang="ts">
	import { ZProvider } from '@zadmin/zui';
	import {
		docsDarkTheme,
		docsLightTheme,
		resolveDocsThemeMode,
		type DocsThemeMode
	} from './lib/docs-theme.js';
	import AppShell from './lib/shell/AppShell.svelte';

	const storageKey = 'zui-docs-theme';
	const initialMode = (() => {
		if (typeof window === 'undefined') return 'light';
		try {
			return resolveDocsThemeMode(
				window.localStorage.getItem(storageKey),
				window.matchMedia('(prefers-color-scheme: dark)').matches
			);
		} catch {
			return 'light';
		}
	})();
	let themeMode = $state<DocsThemeMode>(initialMode);
	const theme = $derived(themeMode === 'dark' ? docsDarkTheme : docsLightTheme);

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = themeMode;
		document.documentElement.style.colorScheme = themeMode;
		try {
			window.localStorage.setItem(storageKey, themeMode);
		} catch {
			// Storage can be unavailable in privacy-restricted browser contexts.
		}
	});
</script>

<ZProvider {theme} colorScheme={themeMode} locale="zh-CN">
	<AppShell bind:themeMode />
</ZProvider>
