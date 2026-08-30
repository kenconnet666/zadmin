<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const appRecipe = defineSlotRecipe(
		{
			slots: ['shell', 'main', 'notFound', 'eyebrow', 'title', 'copy', 'action'] as const,
			base: {
				action: (s) => {
					s.backgroundColor._primary;
					s.borderRadius._medium;
					s.color._canvas;
					s.display.inlineFlex;
					s.fontWeight._semibold;
					s.minHeight._medium;
					s.paddingInline._large;
					s.textDecoration.none;
				},
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
					s._media('(max-width: 48rem)', (mobile) => mobile.padding.raw('2rem 1rem 4rem'));
				},
				notFound: (s) => {
					s.maxWidth.rem(45);
					s.paddingTop.rem(6);
				},
				shell: (s) => {
					s.backgroundColor._surface;
					s.color._text;
					s.display.grid;
					s.gridTemplateColumns.raw('16.5rem minmax(0, 1fr)');
					s.gridTemplateRows.raw('4.25rem 1fr');
					s.minHeight.vh(100);
					s.transitionDuration._normal;
					s.transitionProperty.raw('background-color, color');
					s.transitionTimingFunction.ease;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.block);
				},
				title: (s) => {
					s.fontSize.raw('clamp(2.5rem, 5vw, 4.5rem)');
					s.letterSpacing.em(-0.05);
					s.lineHeight._compact;
					s.margin.px(0);
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
						shell: (s) => s.transitionDuration.ms(0)
					}
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ZLink,
		useZui,
		type ZuiContrast,
		type ZuiDensity,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';
	import type { DocsThemeId } from '../app/theme.js';
	import { componentDocs, componentDocsById } from '../framework/catalog.js';
	import { parseDocsRoute } from '../framework/router.js';
	import ComponentPage from './ComponentPage.svelte';
	import HomePage from './HomePage.svelte';
	import ThemeLabPage from './ThemeLabPage.svelte';
	import AppHeader from './AppHeader.svelte';
	import AppSidebar from './AppSidebar.svelte';

	let {
		contrast = $bindable('normal'),
		density = $bindable('comfortable'),
		direction = $bindable('ltr'),
		motion = $bindable('auto'),
		themeId = $bindable('aurora-light')
	}: {
		contrast?: ZuiContrast;
		density?: ZuiDensity;
		direction?: ZuiDirection;
		motion?: ZuiMotion;
		themeId?: DocsThemeId;
	} = $props();

	let route = $state(parseDocsRoute(globalThis.location?.hash ?? '#/'));
	let query = $state('');
	const zui = useZui();
	const classes = $derived(zui.slots(appRecipe, { density, motion }));
	const currentId = $derived(route.kind === 'component' ? route.componentId : undefined);
	const currentGuideId = $derived(route.kind === 'guide' ? route.guideId : undefined);
	const currentDoc = $derived(currentId ? componentDocsById.get(currentId) : undefined);
	const invalidRoute = $derived(
		route.kind === 'not-found' ||
			(currentId !== undefined && currentDoc === undefined) ||
			(currentGuideId !== undefined && currentGuideId !== 'theme')
	);

	onMount(() => {
		const syncRoute = async () => {
			route = parseDocsRoute(window.location.hash);
			await tick();
			if (route.kind === 'component' && route.section) {
				document.getElementById(route.section)?.scrollIntoView({ block: 'start' });
			} else {
				window.scrollTo({ top: 0 });
			}
		};
		window.addEventListener('hashchange', syncRoute);
		void syncRoute();
		return () => window.removeEventListener('hashchange', syncRoute);
	});

	$effect(() => {
		document.title = currentDoc
			? `${currentDoc.name} · ZUI Components`
			: currentGuideId === 'theme'
				? 'Theme Lab · ZUI Components'
				: 'ZUI Components';
	});
</script>

<div class={classes.shell}>
	<AppHeader bind:contrast bind:density bind:direction bind:motion bind:query bind:themeId />
	<AppSidebar docs={componentDocs} {currentGuideId} {currentId} {query} />
	<main class={classes.main}>
		{#if currentDoc}
			<ComponentPage doc={currentDoc} />
		{:else if currentGuideId === 'theme'}
			<ThemeLabPage bind:themeId />
		{:else if invalidRoute}
			<section class={classes.notFound}>
				<p class={classes.eyebrow}>404</p>
				<h1 class={classes.title}>没有这个组件。</h1>
				<p class={classes.copy}>当前展示站只列出已经实现并通过验收的ZUI基础组件。</p>
				<ZLink class={classes.action} href="#/" underline="none">返回组件概览</ZLink>
			</section>
		{:else}
			<HomePage docs={componentDocs} />
		{/if}
	</main>
</div>
