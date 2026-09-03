<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const homeRecipe = defineSlotRecipe(
		{
			slots: [
				'hero',
				'eyebrow',
				'title',
				'copy',
				'primaryAction',
				'secondaryAction',
				'principles',
				'principle',
				'metric',
				'principleLabel',
				'principleCopy',
				'catalog',
				'catalogTitle',
				'group',
				'groupTitle',
				'grid',
				'card',
				'cardIcon',
				'cardTitle',
				'learnMore'
			] as const,
			base: {
				card: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._small;
					s.color._text;
					s.display.block;
					s.padding._large;
					s.textDecoration.none;
					s.transitionDuration._fast;
					s.transitionProperty.raw('transform, border-color, box-shadow');
					s._hover((hover) => {
						hover.borderColor._primary;
						hover.boxShadow._medium;
						hover.transform.raw('translateY(-2px)');
					});
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
					s._media('(max-width: 48rem)', (mobile) => mobile.gridTemplateColumns.raw('1fr'));
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
					s._media('(max-width: 48rem)', (mobile) => mobile.paddingTop.rem(1));
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
				metric: (s) => {
					s.color._primary;
					s.display.block;
					s.fontFamily._mono;
					s.fontSize._xlarge;
				},
				primaryAction: (s) => {
					s.backgroundColor._primary;
					s.borderRadius._medium;
					s.color._canvas;
					s.display.inlineFlex;
					s.fontWeight._semibold;
					s.minHeight._medium;
					s.paddingInline._large;
					s.textDecoration.none;
				},
				principle: (s) => {
					s.height.percent(100);
				},
				principleCopy: (s) => {
					s.color._textMuted;
					s.lineHeight._relaxed;
				},
				principleLabel: (s) => {
					s.display.block;
					s.fontWeight._bold;
					s.marginTop._large;
				},
				principles: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
					s.maxWidth.rem(72);
					s._media('(max-width: 48rem)', (mobile) => mobile.gridTemplateColumns.raw('1fr'));
				},
				secondaryAction: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.display.inlineFlex;
					s.fontWeight._semibold;
					s.minHeight._medium;
					s.paddingInline._large;
					s.textDecoration.none;
				},
				title: (s) => {
					s.fontSize.raw('clamp(2.55rem, 6vw, 5.2rem)');
					s.letterSpacing.em(-0.06);
					s.lineHeight(0.98);
					s.margin.px(0);
					s.textShadow._small;
				}
			},
			variants: {
				motion: {
					auto: {},
					full: {},
					reduced: {
						card: (s) => {
							s.transitionDuration.ms(0);
							s._hover((hover) => hover.transform.raw('none'));
						}
					}
				}
			},
			defaultVariants: { motion: 'auto' }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZBox, ZCard, ZHeading, ZIcon, ZLink, ZStack, ZText, useZui } from '@zadmin/zui';
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
	const classes = $derived(zui.slots(homeRecipe, { motion: zui.motion }));
</script>

<section class={classes.hero}>
	<p class={classes.eyebrow}>ZADMIN UI SYSTEM</p>
	<ZHeading class={classes.title} data-doc-page-title="true" level={1} size="xlarge"
		>看见组件，运行组件，复制真实源码。</ZHeading
	>
	<p class={classes.copy}>
		ZUI是面向浏览器与WebView的Svelte
		5组件库。展示站直接运行工作区组件，每个示例的源码来自同一个Svelte文件；Props类型和必填性逐步由公开TypeScript
		AST生成，教学说明由Docs拥有。
	</p>
	<ZStack direction="row" gap="small" wrap>
		<ZLink class={classes.primaryAction} href="#/components/button" underline="none"
			>开始浏览组件</ZLink
		>
		<ZLink
			class={classes.secondaryAction}
			external
			href="https://github.com/kenconnet666/zadmin/tree/master/ui/zui"
			underline="none">GitHub源码</ZLink
		>
	</ZStack>
</section>

<section class={classes.principles} aria-label="设计原则">
	<ZCard class={classes.principle}>
		<strong class={classes.metric}>{publicComponentCount}</strong><span
			class={classes.principleLabel}>公开组件</span
		>
		<p class={classes.principleCopy}>
			组件族路由统一呈现根组件与compound members；数量由公开metadata自动核对。
		</p>
	</ZCard>
	<ZCard class={classes.principle}>
		<strong class={classes.metric}>{demoCount}</strong><span class={classes.principleLabel}
			>真实Demo</span
		>
		<p class={classes.principleCopy}>页面运行的Svelte文件就是复制按钮提供的源码。</p>
	</ZCard>
	<ZCard class={classes.principle}>
		<strong class={classes.metric}>{stableCount}</strong><span class={classes.principleLabel}
			>稳定组件族</span
		>
		<p class={classes.principleCopy}>
			每个组件族均逐项通过API、运行时、视觉和production门禁，兼容状态在页面明确展示。
		</p>
	</ZCard>
</section>

<section class={classes.catalog}>
	<header>
		<p class={classes.eyebrow}>PRODUCTION GUIDES</p>
		<ZHeading class={classes.catalogTitle} level={2} size="xlarge">生产指南</ZHeading>
	</header>
	<div class={classes.grid}>
		{#each guideDocs as guide (guide.id)}
			<ZLink
				class={classes.card}
				data-testid="guide-card"
				href={guideRoute(guide.id)}
				underline="none"
			>
				<ZBox>
					<div class={classes.cardIcon}><ZIcon name="chevronDown" size={18} /></div>
					<ZHeading class={classes.cardTitle} level={3} size="large">{guide.eyebrow}</ZHeading>
					<ZText tone="muted">{guide.summary}</ZText>
					<span class={classes.learnMore}>阅读指南 <ZIcon name="arrowRight" size={14} /></span>
				</ZBox>
			</ZLink>
		{/each}
	</div>

	<header class={classes.group}>
		<p class={classes.eyebrow}>COMPONENT CATALOG</p>
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
							class={classes.card}
							data-testid="component-card"
							href={`#/components/${doc.id}`}
							underline="none"
						>
							<ZBox>
								<div class={classes.cardIcon}>
									<ZIcon name="plus" size={18} />
								</div>
								<ZHeading class={classes.cardTitle} level={4} size="large">{doc.name}</ZHeading>
								<ZText tone="muted">{doc.summary}</ZText>
								<span class={classes.learnMore}
									>查看Demo与API <ZIcon name="arrowRight" size={14} /></span
								>
							</ZBox>
						</ZLink>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</section>
