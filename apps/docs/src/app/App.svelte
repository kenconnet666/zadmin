<script lang="ts">
	import { onMount } from 'svelte';
	import { withPrimaryPalette, ZProvider, zhCNLocalePack } from '@zadmin/zui';
	import {
		resolveDocsPreferences,
		resolveDocsTheme,
		resolveDocsThemeId,
		type DocsPreferences
	} from './theme.js';
	import AppShell from '../views/AppShell.svelte';

	const preferencesStorageKey = 'zui-docs-preferences-v1';
	const initialPreferences = (() => {
		if (typeof window === 'undefined') {
			return resolveDocsPreferences(undefined, 'aurora-light');
		}
		try {
			const fallbackThemeId = resolveDocsThemeId(
				undefined,
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
	let palette = $state<DocsPreferences['palette']>(initialPreferences.palette);
	let themeId = $state<DocsPreferences['themeId']>(initialPreferences.themeId);
	let prefersHighContrast = $state(false);
	const highContrast = $derived(
		contrast === 'high' || (contrast === 'auto' && prefersHighContrast)
	);
	const resolvedBaseTheme = $derived(resolveDocsTheme(themeId, highContrast));
	const paletteLocked = $derived(resolvedBaseTheme.highContrast);
	const resolvedTheme = $derived(
		!paletteLocked && palette !== 'preset'
			? {
					...resolvedBaseTheme,
					theme: withPrimaryPalette(resolvedBaseTheme.theme, palette, resolvedBaseTheme.scheme)
				}
			: resolvedBaseTheme
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
		document.documentElement.dataset.theme = themeId;
		document.documentElement.dataset.resolvedTheme = resolvedTheme.label;
		document.documentElement.dataset.scheme = resolvedTheme.scheme;
		document.documentElement.dataset.contrast = contrast;
		document.documentElement.dataset.density = density;
		document.documentElement.dataset.motion = motion;
		document.documentElement.dataset.palette = palette;
		document.documentElement.dir = direction;
		document.documentElement.style.colorScheme = resolvedTheme.scheme;
		try {
			window.localStorage.setItem(
				preferencesStorageKey,
				JSON.stringify({
					contrast,
					density,
					direction,
					motion,
					palette,
					themeId
				} satisfies DocsPreferences)
			);
		} catch {
			// Storage can be unavailable in privacy-restricted browser contexts.
		}
	});
</script>

<ZProvider
	contrast={paletteLocked ? 'high' : contrast}
	{density}
	{direction}
	idPrefix="zui-docs"
	locale="zh-CN"
	localePack={zhCNLocalePack}
	{motion}
	theme={resolvedTheme.theme}
	timeZone="Asia/Shanghai"
	colorScheme={resolvedTheme.scheme}
>
	<AppShell
		{contrast}
		{density}
		{direction}
		{motion}
		highContrast={paletteLocked}
		{themeId}
		{palette}
		onContrastChange={(next) => (contrast = next)}
		onDensityChange={(next) => (density = next)}
		onDirectionChange={(next) => (direction = next)}
		onMotionChange={(next) => (motion = next)}
		onPaletteChange={(next) => (palette = next)}
		onThemeChange={(next) => (themeId = next)}
	/>
</ZProvider>
