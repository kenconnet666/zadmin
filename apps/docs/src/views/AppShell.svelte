<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const appRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: [
				'shell',
				'skipNavigation',
				'skipLink',
				'main',
				'notFound',
				'eyebrow',
				'copy'
			] as const,
			base: {
				copy: (s) => {
					s.color._textMuted;
					s.marginBlock.px(20, 32);
				},
				eyebrow: (s) => {
					s.color._primary;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.margin.px(0);
					s.textTransform.uppercase;
				},
				main: (s) => {
					s.minWidth.px(0);
					s.padding.raw('3rem clamp(1.25rem, 3vw, 3.5rem) 6rem');
					s._media({ max: 'medium' }, (mobile) => mobile.padding.raw('2rem 1rem 4rem'));
				},
				skipLink: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._focus;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._medium;
					s.color._text;
					s.fontWeight._semibold;
					s.insetInlineStart.rem(1);
					s.paddingBlock._small;
					s.paddingInline._medium;
					s.position.fixed;
					s.top.rem(1);
					s.transform.raw('translateY(-200%)');
					s.transitionDuration._fast;
					s.transitionProperty.raw('transform');
					s.zIndex._modal;
					s._focusVisible((focus) => focus.transform.raw('translateY(0)'));
				},
				notFound: (s) => {
					s.maxWidth.rem(45);
					s.paddingTop.rem(6);
				},
				shell: (s) => {
					s.fontFamily._sans;
					s.fontSize._medium;
					s.lineHeight._normal;
					s.backgroundColor._surface;
					s.color._text;
					s.display.grid;
					s.gridTemplateColumns.raw('16.5rem minmax(0, 1fr)');
					s.gridTemplateRows.raw('4.25rem 1fr');
					s.minHeight.vh(100);
					s.transitionDuration._normal;
					s.transitionProperty.raw('background-color, color');
					s.transitionTimingFunction._standard;
					s._media({ max: 'medium' }, (mobile) => mobile.display.block);
				},
				skipNavigation: (s) => {
					s.position.fixed;
					s.zIndex._modal;
				}
			},
			variants: {
				density: {
					compact: {
						main: (s) => s.padding.raw('2rem clamp(1rem, 2vw, 2rem) 4rem')
					},
					comfortable: {},
					spacious: {
						main: (s) => s.padding.raw('4rem clamp(2rem, 4vw, 5rem) 8rem')
					}
				},
				motion: {
					auto: {},
					full: {},
					reduced: {
						skipLink: (s) => s.transitionDuration.ms(0),
						shell: (s) => s.transitionDuration.ms(0)
					}
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZAlert,
		ZBox,
		ZHeading,
		ZLink,
		ZSpinner,
		ZStack,
		ZText,
		useZui,
		type ZuiContrast,
		type ZuiDensity,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';
	import type { DocsThemeId } from '../app/theme.js';
	import { guideDocsById } from '../content/guides.js';
	import {
		componentCatalogManifest,
		componentCatalogManifestById
	} from '../framework/catalog-manifest.generated.js';
	import { componentDocLoaders } from '../framework/component-doc-loaders.generated.js';
	import type { ComponentDoc } from '../framework/component-doc.js';
	import { docsRouter } from '../framework/router-runtime.svelte.js';
	import type { DocsPalette } from '../app/theme.js';
	import GuidePage from './GuidePage.svelte';
	import HomePage from './HomePage.svelte';
	import ThemeLabPage from './ThemeLabPage.svelte';
	import AppHeader from './AppHeader.svelte';
	import AppSidebar from './AppSidebar.svelte';

	let {
		contrast = 'normal',
		density = 'comfortable',
		direction = 'ltr',
		motion = 'auto',
		highContrast = false,
		onContrastChange,
		onDensityChange,
		onDirectionChange,
		onMotionChange,
		onPaletteChange,
		onThemeChange,
		themeId = 'aurora-light',
		palette = 'preset'
	}: {
		readonly contrast?: ZuiContrast;
		readonly density?: ZuiDensity;
		readonly direction?: ZuiDirection;
		readonly motion?: ZuiMotion;
		readonly highContrast?: boolean;
		readonly onContrastChange?: (value: ZuiContrast) => void;
		readonly onDensityChange?: (value: ZuiDensity) => void;
		readonly onDirectionChange?: (value: ZuiDirection) => void;
		readonly onMotionChange?: (value: ZuiMotion) => void;
		readonly onPaletteChange?: (value: DocsPalette) => void;
		readonly onThemeChange?: (value: DocsThemeId) => void;
		readonly themeId?: DocsThemeId;
		readonly palette?: DocsPalette;
	} = $props();

	const route = $derived(docsRouter.current);
	const zui = useZui();
	const classes = $derived(zui.slots(appRecipe, { density, motion }));
	const currentId = $derived(route.kind === 'component' ? route.componentId : undefined);
	const currentGuideId = $derived(route.kind === 'guide' ? route.guideId : undefined);
	let loadedDoc = $state<ComponentDoc | null>(null);
	let ComponentPage = $state<typeof import('./ComponentPage.svelte').default | null>(null);
	let loadingDoc = $state(false);
	let docError = $state<string | null>(null);
	let loadGeneration = 0;
	$effect(() => {
		const id = currentId;
		const generation = ++loadGeneration;
		loadedDoc = null;
		docError = null;
		if (!id) {
			loadingDoc = false;
			return;
		}
		const loader = componentDocLoaders[id as keyof typeof componentDocLoaders];
		if (!loader) {
			loadingDoc = false;
			return;
		}
		loadingDoc = true;
		// Fetch the route view and its document together; the overview must not eagerly
		// ship the API table, disclosure and live-demo renderer in its entry chunk.
		void Promise.all([loader(), import('./ComponentPage.svelte')])
			.then(([doc, page]) => {
				if (generation === loadGeneration) {
					ComponentPage = page.default;
					loadedDoc = doc;
				}
			})
			.catch((error: unknown) => {
				if (generation === loadGeneration)
					docError = error instanceof Error ? error.message : '文档加载失败。';
			})
			.finally(() => {
				if (generation === loadGeneration) loadingDoc = false;
			});
	});
	const currentDoc = $derived(loadedDoc);
	$effect(() => {
		const targetRoute = route;
		// One scroll owner, after the requested lazy document has actually mounted.
		if (
			targetRoute.kind === 'component' &&
			componentCatalogManifestById.has(targetRoute.componentId) &&
			!docError &&
			(loadingDoc || currentDoc?.id !== targetRoute.componentId)
		)
			return;
		const view = globalThis.window;
		if (!view) return;
		const frame = view.requestAnimationFrame(() => {
			const section =
				targetRoute.kind === 'component' && targetRoute.section
					? view.document.getElementById(targetRoute.section)
					: null;
			if (section) section.scrollIntoView({ block: 'start' });
			else view.scrollTo({ top: 0 });
		});
		return () => view.cancelAnimationFrame(frame);
	});
	const currentGuide = $derived(
		currentGuideId && currentGuideId !== 'theme' ? guideDocsById.get(currentGuideId) : undefined
	);
	const invalidRoute = $derived(
		route.kind === 'not-found' ||
			(currentId !== undefined && !componentCatalogManifestById.has(currentId)) ||
			(currentGuideId !== undefined && currentGuideId !== 'theme' && currentGuide === undefined)
	);
	const currentHref = $derived.by(() => {
		void route;
		return globalThis.location?.href ?? '#/';
	});
	const pageTitle = $derived.by(() => {
		switch (route.kind) {
			case 'component':
				return currentDoc ? `${currentDoc.name} · ZUI Components` : 'ZUI Components';
			case 'guide':
				return route.guideId === 'theme'
					? 'Theme Lab · ZUI Components'
					: currentGuide
						? `${currentGuide.eyebrow} · ZUI Components`
						: 'ZUI Components';
			case 'home':
			case 'not-found':
				return 'ZUI Components';
		}
	});

	function skipToMain(event: MouseEvent): void {
		event.preventDefault();
		const main = document.getElementById('zui-main-content');
		main?.focus({ preventScroll: true });
		main?.scrollIntoView({ block: 'start' });
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<ZBox class={classes.shell}>
	<nav class={classes.skipNavigation} aria-label="快捷跳转">
		<ZLink class={classes.skipLink} href={currentHref} underline="none" onclick={skipToMain}
			>跳到主要内容
		</ZLink>
	</nav>
	<AppHeader
		{contrast}
		{density}
		{direction}
		{motion}
		{highContrast}
		{onContrastChange}
		{onDensityChange}
		{onDirectionChange}
		{onMotionChange}
		{onPaletteChange}
		{onThemeChange}
		docs={componentCatalogManifest}
		{currentGuideId}
		{currentId}
		{themeId}
		{palette}
	/>
	<AppSidebar docs={componentCatalogManifest} {currentGuideId} {currentId} />
	<main class={classes.main} id="zui-main-content" tabindex="-1">
		{#if currentId && loadingDoc}
			<ZStack direction="row" align="center" gap="medium"
				><ZSpinner label="正在加载组件文档" size="small" /><ZText>正在加载组件文档…</ZText></ZStack
			>
		{:else if currentId && docError}
			<ZAlert tone="danger" title="组件文档加载失败">{docError}</ZAlert>
		{:else if currentDoc && ComponentPage}
			<ComponentPage doc={currentDoc} />
		{:else if currentGuideId === 'theme'}
			<ThemeLabPage {onThemeChange} {themeId} {palette} />
		{:else if currentGuide}
			<GuidePage guide={currentGuide} />
		{:else if invalidRoute}
			<section class={classes.notFound}>
				<ZText as="p" class={classes.eyebrow}>404</ZText>
				<ZHeading level={1} size="xxlarge">没有这个页面。</ZHeading>
				<ZText as="p" class={classes.copy}>当前展示站只列出已经实现的ZUI组件与生产指南。</ZText>
				<ZLink appearance="button" href="#/">返回文档概览</ZLink>
			</section>
		{:else}
			<HomePage docs={componentCatalogManifest} />
		{/if}
	</main>
</ZBox>
