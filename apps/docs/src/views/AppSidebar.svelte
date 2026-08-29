<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const sidebarRecipe = defineSlotRecipe(
		{
			slots: ['root', 'nav', 'category', 'link', 'icon', 'footer', 'empty'] as const,
			base: {
				category: (s) => {
					s.color._accent;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.08);
					s.margin.raw('1.4rem 0.75rem 0.45rem');
					s.textTransform.uppercase;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				empty: (s) => {
					s.color._textMuted;
					s.display.block;
					s.fontSize._small;
					s.padding._medium;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
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
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				icon: (s) => {
					s.color._textMuted;
					s.transform.raw('rotate(-90deg)');
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
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
					s._media('(max-width: 48rem)', (mobile) => {
						mobile.flex.raw('0 0 auto');
						mobile.fontSize._small;
						mobile.paddingBlock._small;
						mobile.paddingInline._medium;
					});
				},
				nav: (s) => {
					s.overflowY.auto;
					s._media('(max-width: 48rem)', (mobile) => {
						mobile.display.flex;
						mobile.gap._xsmall;
						mobile.overflow.visible;
					});
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
					s._media('(max-width: 48rem)', (mobile) => {
						mobile.borderBottomColor._border;
						mobile.borderBottomStyle.solid;
						mobile.borderBottomWidth._hairline;
						mobile.borderRightWidth.px(0);
						mobile.display.block;
						mobile.height.auto;
						mobile.overflowX.auto;
						mobile.padding.raw('0.55rem 0.75rem');
						mobile.top.rem(4.25);
						mobile.zIndex(30);
					});
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
				}
			},
			defaultVariants: { active: false }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZIcon, useZui } from '@zadmin/zui';
	import { componentCategories, type ComponentDoc } from '../framework/catalog.js';
	import { searchComponentDocs } from '../framework/search.js';

	let {
		docs,
		currentId,
		query
	}: { docs: readonly ComponentDoc[]; currentId?: string; query: string } = $props();
	const filtered = $derived(searchComponentDocs(docs, query));
	const zui = useZui();
	const baseClasses = $derived(zui.slots(sidebarRecipe));
	const homeClasses = $derived(zui.slots(sidebarRecipe, { active: !currentId }));
</script>

<aside class={baseClasses.root}>
	<nav class={baseClasses.nav} aria-label="组件导航">
		<a class={homeClasses.link} aria-current={!currentId ? 'page' : undefined} href="#/">概览</a>
		{#each componentCategories as category (category.id)}
			{@const categoryDocs = filtered.filter((doc) => doc.category === category.id)}
			{#if categoryDocs.length > 0}
				<p class={baseClasses.category}>{category.label}</p>
				{#each categoryDocs as doc (doc.id)}
					{@const linkClasses = zui.slots(sidebarRecipe, { active: currentId === doc.id })}
					<a
						class={linkClasses.link}
						aria-current={currentId === doc.id ? 'page' : undefined}
						href={`#/components/${doc.id}`}
					>
						<span>{doc.name}</span>
						<ZIcon class={linkClasses.icon} name="chevronDown" size={14} />
					</a>
				{/each}
			{/if}
		{/each}
		{#if filtered.length === 0}<span class={baseClasses.empty}>没有匹配组件</span>{/if}
	</nav>
	<footer class={baseClasses.footer}>
		<span>Svelte 5 · TypeScript</span>
		<span>Runtime CSS · class-only API</span>
	</footer>
</aside>
