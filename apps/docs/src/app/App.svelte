<script lang="ts">
	import { onMount } from 'svelte';
	import { ZProvider } from '@zadmin/zui';
	import {
		resolveDocsPreferences,
		resolveDocsTheme,
		resolveDocsThemeId,
		type DocsPreferences
	} from './theme.js';
	import AppShell from '../views/AppShell.svelte';

	const legacyThemeStorageKey = 'zui-docs-theme';
	const preferencesStorageKey = 'zui-docs-preferences-v1';
	const initialPreferences = (() => {
		if (typeof window === 'undefined') {
			return resolveDocsPreferences(undefined, 'aurora-light');
		}
		try {
			const fallbackThemeId = resolveDocsThemeId(
				window.localStorage.getItem(legacyThemeStorageKey),
				window.matchMedia('(prefers-color-scheme: dark)').matches
			);
			return resolveDocsPreferences(
				window.localStorage.getItem(preferencesStorageKey),
				fallbackThemeId
			);
		} catch {
			return resolveDocsPreferences(undefined, 'aurora-light');
		}
	})();
	let contrast = $state<DocsPreferences['contrast']>(initialPreferences.contrast);
	let density = $state<DocsPreferences['density']>(initialPreferences.density);
	let direction = $state<DocsPreferences['direction']>(initialPreferences.direction);
	let motion = $state<DocsPreferences['motion']>(initialPreferences.motion);
	let themeId = $state<DocsPreferences['themeId']>(initialPreferences.themeId);
	let prefersHighContrast = $state(false);
	const highContrast = $derived(
		contrast === 'high' || (contrast === 'auto' && prefersHighContrast)
	);
	const resolvedTheme = $derived(resolveDocsTheme(themeId, highContrast));

	onMount(() => {
		const media = window.matchMedia('(prefers-contrast: more)');
		const syncContrast = () => (prefersHighContrast = media.matches);
		syncContrast();
		media.addEventListener('change', syncContrast);
		return () => media.removeEventListener('change', syncContrast);
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = themeId;
		document.documentElement.dataset.resolvedTheme = resolvedTheme.label;
		document.documentElement.dataset.scheme = resolvedTheme.scheme;
		document.documentElement.dataset.contrast = contrast;
		document.documentElement.dataset.density = density;
		document.documentElement.dataset.motion = motion;
		document.documentElement.dir = direction;
		document.documentElement.style.colorScheme = resolvedTheme.scheme;
		try {
			window.localStorage.setItem(legacyThemeStorageKey, resolvedTheme.scheme);
			window.localStorage.setItem(
				preferencesStorageKey,
				JSON.stringify({
					contrast,
					density,
					direction,
					motion,
					themeId
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
	theme={resolvedTheme.theme}
	colorScheme={resolvedTheme.scheme}
>
	<AppShell
		{contrast}
		{density}
		{direction}
		{motion}
		{themeId}
		onContrastChange={(next) => (contrast = next)}
		onDensityChange={(next) => (density = next)}
		onDirectionChange={(next) => (direction = next)}
		onMotionChange={(next) => (motion = next)}
		onThemeChange={(next) => (themeId = next)}
	/>
</ZProvider>
