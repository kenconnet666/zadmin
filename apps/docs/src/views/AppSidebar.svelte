<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';
	const sidebarRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['root', 'nav', 'category', 'footer'] as const,
			base: {
				root: (s) => {
					s.backgroundColor._canvas;
					s.borderInlineEndColor._border;
					s.borderInlineEndStyle.solid;
					s.borderInlineEndWidth._hairline;
					s.display.grid;
					s.gridTemplateRows.raw('minmax(0, 1fr) auto');
					s.height.raw('calc(100vh - 4.25rem)');
					s.padding.raw('1.5rem 0.9rem 1rem');
					s.position.sticky;
					s.top.rem(4.25);
				},
				nav: (s) => {
					s.overflowY.auto;
					s.scrollbarGutter.stable;
					s.scrollbarWidth.thin;
				},
				category: (s) => {
					s.marginBlockStart._xlarge;
					s.marginBlockEnd._medium;
					s.paddingInline._medium;
				},
				footer: (s) => {
					s.borderTopColor._border;
					s.borderTopStyle.solid;
					s.borderTopWidth._hairline;
					s.paddingBlockStart._large;
					s.paddingInline._medium;
					s.marginBlockStart._medium;
				}
			},
			variants: {
				surface: {
					desktop: { root: (s) => s._media('(max-width: 48rem)', (mobile) => mobile.display.none) },
					drawer: {
						root: (s) => {
							s.backgroundColor._canvas;
							s.borderInlineEndWidth.px(0);
							s.flex.raw('1 1 auto');
							s.height.auto;
							s.minHeight.px(0);
							s.padding._medium;
							s.position.raw('static');
						}
					}
				}
			},
			defaultVariants: { surface: 'desktop' }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZLink, ZStack, ZText, useZui } from '@zadmin/zui';
	import { guideDocs } from '../content/guides.js';
	import {
		componentCategories,
		type ComponentCatalogManifestEntry
	} from '../framework/catalog-manifest.generated.js';
	import { guideRoute } from '../framework/router.js';

	let {
		docs,
		currentGuideId,
		currentId,
		onNavigate,
		surface = 'desktop'
	}: {
		readonly docs: readonly ComponentCatalogManifestEntry[];
		readonly currentGuideId?: string;
		readonly currentId?: string;
		readonly onNavigate?: () => void;
		readonly surface?: 'desktop' | 'drawer';
	} = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(sidebarRecipe, { surface }));
	const navigationId = $derived(
		surface === 'drawer' ? 'zui-docs-mobile-component-nav' : 'zui-docs-component-nav'
	);
	const navigationLabel = $derived(surface === 'drawer' ? '移动组件导航' : '组件导航');
</script>

<aside class={classes.root} data-surface={surface}>
	<nav class={classes.nav} aria-label={navigationLabel} id={navigationId}>
		<ZLink
			appearance="navigation"
			aria-current={!currentId && !currentGuideId ? 'page' : undefined}
			href="#/"
			onclick={() => onNavigate?.()}>概览</ZLink
		>
		<ZText as="p" class={classes.category} size="small" weight="semibold" tone="muted">指南</ZText>
		<ZLink
			appearance="navigation"
			aria-current={currentGuideId === 'theme' ? 'page' : undefined}
			href="#/guides/theme"
			onclick={() => onNavigate?.()}
		>
			Theme Lab
		</ZLink>
		{#each guideDocs as guide (guide.id)}
			<ZLink
				appearance="navigation"
				aria-current={currentGuideId === guide.id ? 'page' : undefined}
				href={guideRoute(guide.id)}
				onclick={() => onNavigate?.()}
			>
				{guide.eyebrow}
			</ZLink>
		{/each}
		{#each componentCategories as category (category.id)}
			{@const categoryDocs = docs.filter((doc) => doc.category === category.id)}
			{#if categoryDocs.length > 0}
				<ZText as="p" class={classes.category} size="small" weight="semibold" tone="muted"
					>{category.label}</ZText
				>
				{#each categoryDocs as doc (doc.id)}
					<ZLink
						appearance="navigation"
						aria-current={currentId === doc.id ? 'page' : undefined}
						href={`#/components/${doc.id}`}
						onclick={() => onNavigate?.()}
					>
						{doc.name}
					</ZLink>
				{/each}
			{/if}
		{/each}
	</nav>
	<footer class={classes.footer}>
		<ZStack gap="small">
			<ZText size="small" tone="muted">Svelte 5 · TypeScript</ZText>
			<ZText size="small" tone="muted">Runtime CSS · class-only API</ZText>
		</ZStack>
	</footer>
</aside>
