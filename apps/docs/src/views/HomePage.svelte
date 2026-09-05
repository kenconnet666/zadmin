<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const homeRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: [
				'hero',
				'eyebrow',
				'copy',
				'principles',
				'principle',
				'principleCopy',
				'catalog',
				'catalogTitle',
				'group',
				'groupTitle',
				'grid',
				'card',
				'cardLink',
				'cardIcon',
				'cardTitle',
				'learnMore'
			] as const,
			base: {
				card: (s) => s.height.percent(100),
				cardLink: (s) => {
					s.display.block;
					s.textDecoration.none;
				},
				cardIcon: (s) => {
					s.backgroundColor._surface;
					s.borderRadius._medium;
					s.color._accent;
					s.display.grid;
					s.height._medium;
					s.placeItems.center;
					s.width._medium;
				},
				cardTitle: (s) => {
					s.fontSize._large;
					s.margin.raw('1rem 0 0.6rem');
				},
				catalog: (s) => {
					s.maxWidth.rem(72);
					s.paddingTop.rem(6);
				},
				catalogTitle: (s) => {
					s.fontSize._xlarge;
					s.letterSpacing.em(-0.03);
					s.margin.px(0);
				},
				copy: (s) => {
					s.color._textMuted;
					s.fontSize._large;
					s.lineHeight._relaxed;
					s.margin.raw('1.6rem 0 2rem');
					s.maxWidth.rem(48);
				},
				eyebrow: (s) => {
					s.color._accent;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.margin.raw('0 0 0.8rem');
					s.textTransform.uppercase;
				},
				grid: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
					s.marginTop._xlarge;
					s._media('(max-width: 68rem)', (tablet) =>
						tablet.gridTemplateColumns.raw('repeat(2, minmax(0, 1fr))')
					);
					s._media({ max: 'medium' }, (mobile) => mobile.gridTemplateColumns.raw('1fr'));
				},
				group: (s) => s.marginTop.rem(2.25),
				groupTitle: (s) => {
					s.color._textMuted;
					s.fontSize._small;
					s.letterSpacing.em(0.08);
					s.margin.px(0);
					s.textTransform.uppercase;
				},
				hero: (s) => {
					s.maxWidth.rem(65);
					s.padding.raw('2rem 0 5rem');
					s._media({ max: 'medium' }, (mobile) => mobile.paddingTop.rem(1));
				},
				learnMore: (s) => {
					s.alignItems.center;
					s.color._primaryHover;
					s.display.inlineFlex;
					s.fontSize._small;
					s.fontWeight._semibold;
					s.gap._xsmall;
					s.marginTop._large;
				},
				principle: (s) => {
					s.height.percent(100);
				},
				principleCopy: (s) => {
					s.color._textMuted;
					s.lineHeight._relaxed;
				},
				principles: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
					s.maxWidth.rem(72);
					s._media({ max: 'medium' }, (mobile) => mobile.gridTemplateColumns.raw('1fr'));
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZCard, ZHeading, ZIcon, ZLink, ZStack, ZStatistic, ZText, useZui } from '@zadmin/zui';
	import { guideDocs } from '../content/guides.js';
	import {
		componentCategories,
		type ComponentCatalogManifestEntry
	} from '../framework/catalog-manifest.generated.js';
	import { guideRoute } from '../framework/router.js';

	let { docs }: { docs: readonly ComponentCatalogManifestEntry[] } = $props();
	const demoCount = $derived(docs.reduce((total, doc) => total + doc.demoCount, 0));
	const publicComponentCount = $derived(
		docs.reduce((total, doc) => total + doc.publicComponentCount, 0)
	);
	const stableCount = $derived(docs.filter((doc) => doc.status === 'stable').length);
	const zui = useZui();
	const classes = $derived(zui.slots(homeRecipe));
</script>

<section class={classes.hero}>
	<ZText as="p" class={classes.eyebrow}>ZADMIN UI SYSTEM</ZText>
	<ZHeading data-doc-page-title="true" level={1} size="xxlarge"
		>看见组件，运行组件，复制真实源码。</ZHeading
	>
	<ZText as="p" class={classes.copy}>
		ZUI是面向浏览器与WebView的Svelte
		5组件库。展示站直接运行工作区组件，每个示例的源码来自同一个Svelte文件；Props类型和必填性逐步由公开TypeScript
		AST生成，教学说明由Docs拥有。
	</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZLink appearance="button" href="#/components/button">开始浏览组件</ZLink>
		<ZLink
			appearance="button"
			variant="secondary"
			external
			href="https://github.com/kenconnet666/zadmin/tree/master/ui/zui"
			underline="none">GitHub源码</ZLink
		>
	</ZStack>
</section>

<section class={classes.principles} aria-label="设计原则">
	<ZCard class={classes.principle}>
		<ZStatistic label="公开组件" tone="primary" value={publicComponentCount} />
		<ZText as="p" class={classes.principleCopy}>
			组件族路由统一呈现根组件与compound members；数量由公开metadata自动核对。
		</ZText>
	</ZCard>
	<ZCard class={classes.principle}>
		<ZStatistic label="真实Demo" tone="primary" value={demoCount} />
		<ZText as="p" class={classes.principleCopy}>页面运行的Svelte文件就是复制按钮提供的源码。</ZText>
	</ZCard>
	<ZCard class={classes.principle}>
		<ZStatistic label="稳定组件族" tone="primary" value={stableCount} />
		<ZText as="p" class={classes.principleCopy}>
			每个组件族均逐项通过API、运行时、视觉和production门禁，兼容状态在页面明确展示。
		</ZText>
	</ZCard>
</section>

<section class={classes.catalog}>
	<header>
		<ZText as="p" class={classes.eyebrow}>PRODUCTION GUIDES</ZText>
		<ZHeading class={classes.catalogTitle} level={2} size="xlarge">生产指南</ZHeading>
	</header>
	<div class={classes.grid}>
		{#each guideDocs as guide (guide.id)}
			<ZLink
				class={classes.cardLink}
				data-testid="guide-card"
				href={guideRoute(guide.id)}
				underline="none"
			>
				<ZCard class={classes.card}>
					<div class={classes.cardIcon}><ZIcon name="chevronDown" size={18} /></div>
					<ZHeading class={classes.cardTitle} level={3} size="large">{guide.eyebrow}</ZHeading>
					<ZText tone="muted">{guide.summary}</ZText>
					<ZText as="span" class={classes.learnMore}
						>阅读指南 <ZIcon name="arrowRight" size={14} /></ZText
					>
				</ZCard>
			</ZLink>
		{/each}
	</div>

	<header class={classes.group}>
		<ZText as="p" class={classes.eyebrow}>COMPONENT CATALOG</ZText>
		<ZHeading class={classes.catalogTitle} level={2} size="xlarge">组件目录</ZHeading>
	</header>
	{#each componentCategories as category (category.id)}
		{@const categoryDocs = docs.filter((doc) => doc.category === category.id)}
		{#if categoryDocs.length > 0}
			<div class={classes.group}>
				<ZHeading class={classes.groupTitle} level={3} size="large">{category.label}</ZHeading>
				<div class={classes.grid}>
					{#each categoryDocs as doc (doc.id)}
						<ZLink
							class={classes.cardLink}
							data-testid="component-card"
							href={`#/components/${doc.id}`}
							underline="none"
						>
							<ZCard class={classes.card}>
								<div class={classes.cardIcon}>
									<ZIcon name="plus" size={18} />
								</div>
								<ZHeading class={classes.cardTitle} level={4} size="large">{doc.name}</ZHeading>
								<ZText tone="muted">{doc.summary}</ZText>
								<ZText as="span" class={classes.learnMore}
									>查看Demo与API <ZIcon name="arrowRight" size={14} /></ZText
								>
							</ZCard>
						</ZLink>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</section>
