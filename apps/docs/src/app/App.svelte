<script lang="ts">
	import { onMount } from 'svelte';
	import { ZProvider } from '@zadmin/zui';
	import {
		docsDarkTheme,
		docsHighContrastDarkTheme,
		docsHighContrastLightTheme,
		docsLightTheme,
		resolveDocsPreferences,
		resolveDocsThemeMode,
		type DocsPreferences
	} from './theme.js';
	import AppShell from '../views/AppShell.svelte';

	const legacyThemeStorageKey = 'zui-docs-theme';
	const preferencesStorageKey = 'zui-docs-preferences-v1';
	const initialPreferences = (() => {
		if (typeof window === 'undefined') {
			return resolveDocsPreferences(undefined, 'light');
		}
		try {
			const fallbackThemeMode = resolveDocsThemeMode(
				window.localStorage.getItem(legacyThemeStorageKey),
				window.matchMedia('(prefers-color-scheme: dark)').matches
			);
			return resolveDocsPreferences(
				window.localStorage.getItem(preferencesStorageKey),
				fallbackThemeMode
			);
		} catch {
			return resolveDocsPreferences(undefined, 'light');
		}
	})();
	let contrast = $state<DocsPreferences['contrast']>(initialPreferences.contrast);
	let density = $state<DocsPreferences['density']>(initialPreferences.density);
	let direction = $state<DocsPreferences['direction']>(initialPreferences.direction);
	let motion = $state<DocsPreferences['motion']>(initialPreferences.motion);
	let themeMode = $state<DocsPreferences['themeMode']>(initialPreferences.themeMode);
	let prefersHighContrast = $state(false);
	const highContrast = $derived(
		contrast === 'high' || (contrast === 'auto' && prefersHighContrast)
	);
	const theme = $derived(
		themeMode === 'dark'
			? highContrast
				? docsHighContrastDarkTheme
				: docsDarkTheme
			: highContrast
				? docsHighContrastLightTheme
				: docsLightTheme
	);

	onMount(() => {
		const media = window.matchMedia('(prefers-contrast: more)');
		const syncContrast = () => (prefersHighContrast = media.matches);
		syncContrast();
		media.addEventListener('change', syncContrast);
		return () => media.removeEventListener('change', syncContrast);
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = themeMode;
		document.documentElement.dataset.contrast = contrast;
		document.documentElement.dataset.density = density;
		document.documentElement.dataset.motion = motion;
		document.documentElement.dir = direction;
		document.documentElement.style.colorScheme = themeMode;
		try {
			window.localStorage.setItem(legacyThemeStorageKey, themeMode);
			window.localStorage.setItem(
				preferencesStorageKey,
				JSON.stringify({
					contrast,
					density,
					direction,
					motion,
					themeMode
				} satisfies DocsPreferences)
			);
		} catch {
			// Storage can be unavailable in privacy-restricted browser contexts.
		}
	});
</script>

<ZProvider
	{contrast}
	{density}
	{direction}
	idPrefix="zui-docs"
	locale="zh-CN"
	{motion}
	translations={{
		close: '关闭',
		copy: '复制',
		'pagination.label': '分页导航',
		'pagination.next': '下一页',
		'pagination.page': '第{page}页',
		'pagination.previous': '上一页'
	}}
	{theme}
	colorScheme={themeMode}
>
	<AppShell bind:contrast bind:density bind:direction bind:motion bind:themeMode />
</ZProvider>
