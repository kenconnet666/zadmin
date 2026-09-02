<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const sidebarRecipe = defineSlotRecipe(
		{
			slots: ['root', 'nav', 'category', 'link', 'icon', 'footer'] as const,
			base: {
				category: (s) => {
					s.color._accent;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.08);
					s.margin.raw('1.4rem 0.75rem 0.45rem');
					s.textTransform.uppercase;
				},
				footer: (s) => {
					s.borderTopColor._border;
					s.borderTopStyle.solid;
					s.borderTopWidth._hairline;
					s.color._textMuted;
					s.display.flex;
					s.flexDirection.column;
					s.fontSize._small;
					s.gap._small;
					s.padding.raw('1rem 0.75rem 0');
				},
				icon: (s) => {
					s.color._textMuted;
					s.transform.raw('rotate(-90deg)');
				},
				link: (s) => {
					s.alignItems.center;
					s.borderLeftColor.transparent;
					s.borderLeftStyle.solid;
					s.borderLeftWidth._medium;
					s.borderRadius._medium;
					s.color._textMuted;
					s.display.flex;
					s.fontSize._medium;
					s.fontWeight._medium;
					s.gap._medium;
					s.justifyContent.spaceBetween;
					s.paddingBlock._medium;
					s.paddingInline._medium;
					s.textDecoration.none;
					s._hover((hover) => {
						hover.backgroundColor._canvas;
						hover.color._primaryHover;
					});
				},
				nav: (s) => {
					s.overflowY.auto;
					s.scrollbarGutter.stable;
					s.scrollbarWidth.thin;
				},
				root: (s) => {
					s.backgroundColor._surface;
					s.borderRightColor._border;
					s.borderRightStyle.solid;
					s.borderRightWidth._hairline;
					s.display.grid;
					s.gridTemplateRows.raw('1fr auto');
					s.height.raw('calc(100vh - 4.25rem)');
					s.overflow.hidden;
					s.padding.raw('1.5rem 0.9rem 1rem');
					s.position.sticky;
					s.top.rem(4.25);
				}
			},
			variants: {
				active: {
					false: {},
					true: {
						link: (s) => {
							s.backgroundColor._canvas;
							s.borderLeftColor._accent;
							s.color._primaryHover;
							s.boxShadow._small;
						}
					}
				},
				surface: {
					desktop: {
						root: (s) => s._media('(max-width: 48rem)', (mobile) => mobile.display.none)
					},
					drawer: {
						root: (s) => {
							s.backgroundColor._canvas;
							s.borderRightWidth.px(0);
							s.flex.raw('1 1 auto');
							s.height.auto;
							s.minHeight.px(0);
							s.padding.raw('0.5rem 0 0');
							s.position.raw('static');
						},
						footer: (s) => s.padding.raw('1rem 0.75rem'),
						nav: (s) => s.paddingInline._small
					}
				}
			},
			defaultVariants: { active: false, surface: 'desktop' }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZIcon, ZLink, useZui } from '@zadmin/zui';
	import { guideDocs } from '../content/guides.js';
	import { componentCategories, type ComponentDoc } from '../framework/catalog.js';
	import { guideRoute } from '../framework/router.js';

	let {
		docs,
		currentGuideId,
		currentId,
		onNavigate,
		surface = 'desktop'
	}: {
		docs: readonly ComponentDoc[];
		currentGuideId?: string;
		currentId?: string;
		onNavigate?: () => void;
		surface?: 'desktop' | 'drawer';
	} = $props();
	const zui = useZui();
	const baseClasses = $derived(zui.slots(sidebarRecipe, { surface }));
	const homeClasses = $derived(
		zui.slots(sidebarRecipe, { active: !currentId && !currentGuideId, surface })
	);
	const themeClasses = $derived(
		zui.slots(sidebarRecipe, { active: currentGuideId === 'theme', surface })
	);
	const navigationId = $derived(
		surface === 'drawer' ? 'zui-docs-mobile-component-nav' : 'zui-docs-component-nav'
	);
	const navigationLabel = $derived(surface === 'drawer' ? '移动组件导航' : '组件导航');
</script>

<aside class={baseClasses.root} data-surface={surface}>
	<nav class={baseClasses.nav} aria-label={navigationLabel} id={navigationId}>
		<ZLink
			class={homeClasses.link}
			aria-current={!currentId && !currentGuideId ? 'page' : undefined}
			href="#/"
			onclick={() => onNavigate?.()}
			underline="none"
			>概览
		</ZLink>
		<p class={baseClasses.category}>指南</p>
		<ZLink
			class={themeClasses.link}
			aria-current={currentGuideId === 'theme' ? 'page' : undefined}
			href="#/guides/theme"
			onclick={() => onNavigate?.()}
			underline="none"
		>
			<span>Theme Lab</span>
			<ZIcon class={themeClasses.icon} name="chevronDown" size={14} />
		</ZLink>
		{#each guideDocs as guide (guide.id)}
			{@const guideClasses = zui.slots(sidebarRecipe, {
				active: currentGuideId === guide.id,
				surface
			})}
			<ZLink
				class={guideClasses.link}
				aria-current={currentGuideId === guide.id ? 'page' : undefined}
				href={guideRoute(guide.id)}
				onclick={() => onNavigate?.()}
				underline="none"
			>
				<span>{guide.eyebrow}</span>
				<ZIcon class={guideClasses.icon} name="chevronDown" size={14} />
			</ZLink>
		{/each}
		{#each componentCategories as category (category.id)}
			{@const categoryDocs = docs.filter((doc) => doc.category === category.id)}
			{#if categoryDocs.length > 0}
				<p class={baseClasses.category}>{category.label}</p>
				{#each categoryDocs as doc (doc.id)}
					{@const linkClasses = zui.slots(sidebarRecipe, {
						active: currentId === doc.id,
						surface
					})}
					<ZLink
						class={linkClasses.link}
						aria-current={currentId === doc.id ? 'page' : undefined}
						href={`#/components/${doc.id}`}
						onclick={() => onNavigate?.()}
						underline="none"
					>
						<span>{doc.name}</span>
						<ZIcon class={linkClasses.icon} name="chevronDown" size={14} />
					</ZLink>
				{/each}
			{/if}
		{/each}
	</nav>
	<footer class={baseClasses.footer}>
		<span>Svelte 5 · TypeScript</span>
		<span>Runtime CSS · class-only API</span>
	</footer>
</aside>
