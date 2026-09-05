<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const pageRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: [
				'layout',
				'article',
				'header',
				'eyebrow',
				'lead',
				'meta',
				'importLine',
				'sourceLink',
				'demoSection',
				'sectionTitle',
				'accessibility',
				'api',
				'toc'
			] as const,
			base: {
				article: (s) => s.minWidth.px(0),
				accessibility: (s) => {
					s.marginTop.rem(4);
					s.scrollMarginTop.rem(5.5);
				},
				eyebrow: (s) => {
					s.color._accent;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.margin.raw('0 0 0.8rem');
					s.textTransform.uppercase;
				},
				demoSection: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._large;
					s.marginTop.rem(2);
					s.scrollMarginTop.rem(5.5);
				},
				header: (s) => {
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.paddingBottom.rem(2);
				},
				importLine: (s) => {
					s.marginTop._xlarge;
					s.maxWidth.rem(46);
				},
				layout: (s) => {
					s.display.grid;
					s.gap.raw('clamp(2rem, 3vw, 3rem)');
					s.gridTemplateColumns.raw('minmax(0, 64rem) minmax(10rem, 13rem)');
					s.justifyContent.center;
					s._media('(max-width: 78rem)', (tablet) =>
						tablet.gridTemplateColumns.raw('minmax(0, 1fr)')
					);
				},
				lead: (s) => {
					s.display.block;
					s.fontSize._large;
					s.lineHeight._relaxed;
					s.marginTop._large;
					s.maxWidth.rem(52);
				},
				meta: (s) => {
					s.display.flex;
					s.flexWrap.wrap;
					s.gap._small;
					s.marginTop._large;
				},
				api: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._xlarge;
					s.marginTop.rem(4);
					s.scrollMarginTop.rem(5.5);
				},
				sectionTitle: (s) => {
					s.margin.px(0);
				},
				sourceLink: (s) => {
					s.alignItems.center;
					s.color._primaryHover;
					s.display.inlineFlex;
					s.fontSize._small;
					s.fontWeight._semibold;
					s.gap._small;
					s.marginTop._large;
					s.textDecoration.none;
				},
				toc: (s) => {
					s.height.fitContent;
					s.maxHeight.raw('calc(100dvh - 8rem)');
					s.overflowY.auto;
					s.position.sticky;
					s.top.rem(6);
					s._media('(max-width: 78rem)', (tablet) => tablet.display.none);
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZCard, ZHeading, ZLink, ZList, ZStack, ZTag, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { ComponentDoc } from '../framework/component-doc.js';
	import { componentRoute } from '../framework/router.js';
	import ApiTable from './ApiTable.svelte';
	import DemoBlock from './DemoBlock.svelte';

	let { doc }: { doc: ComponentDoc } = $props();
	let activeSection = $state('demos');
	const zui = useZui();
	const classes = $derived(zui.slots(pageRecipe));

	$effect(() => {
		const ids = [
			'demos',
			...doc.demos.map((demo) => demo.id),
			'api',
			...doc.api.map((section) => `api-${section.id}`),
			'accessibility'
		];
		activeSection = 'demos';
		if (typeof IntersectionObserver === 'undefined') return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
				if (visible?.target.id) activeSection = visible.target.id;
			},
			{ rootMargin: '-18% 0px -70% 0px', threshold: 0 }
		);
		for (const id of ids) {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		}
		return () => observer.disconnect();
	});
</script>

<div class={classes.layout}>
	<article class={classes.article} data-doc-route={`component:${doc.id}`}>
		<header class={classes.header}>
			<ZText as="p" class={classes.eyebrow}>ZUI COMPONENTS</ZText>
			<ZStack direction="row" align="center" gap="large" wrap>
				<ZHeading data-doc-page-title="true" level={1} size="xxlarge">
					{doc.name}
				</ZHeading>
				<ZTag size="small" tone="accent">{doc.status}</ZTag>
			</ZStack>
			<ZText class={classes.lead} tone="muted">{doc.summary}</ZText>
			<div class={classes.meta} aria-label="组件发布信息">
				<ZTag size="small">{doc.since === 'unreleased' ? 'Unreleased' : `Since ${doc.since}`}</ZTag>
				<ZTag size="small">
					{doc.dependencies.length > 0 ? `依赖：${doc.dependencies.join('、')}` : '无额外组件依赖'}
				</ZTag>
			</div>
			<div class={classes.importLine}>
				<ZCode
					ariaLabel={`${doc.name}导入语句`}
					code={doc.importStatement}
					inline
					size="medium"
					lang="typescript"
					wrap
				/>
			</div>
			<ZLink
				class={classes.sourceLink}
				external
				href={`https://github.com/kenconnet666/zadmin/blob/master/${doc.source}`}
				underline="none"
			>
				查看组件源码
			</ZLink>
		</header>

		<section id="demos" class={classes.demoSection}>
			<ZHeading class={classes.sectionTitle} level={2} size="xlarge">实时演示</ZHeading>
			<ZStack gap="large">
				{#each doc.demos as demo (demo.id)}
					<DemoBlock {demo} />
				{/each}
			</ZStack>
		</section>

		<section id="api" class={classes.api}>
			{#each doc.api as section (section.title)}
				<ApiTable {section} />
			{/each}
		</section>

		<section id="accessibility" class={classes.accessibility}>
			<ZStack gap="large">
				<ZHeading class={classes.sectionTitle} level={2} size="xlarge">可访问性</ZHeading>
				<ZCard variant="outlined">
					<ZList items={doc.accessibility.map((label, key) => ({ key, label }))} />
				</ZCard>
			</ZStack>
		</section>
	</article>

	<aside class={classes.toc} aria-label="当前页目录">
		<ZCard variant="outlined">
			<ZStack gap="small">
				<ZText weight="semibold" tone="muted">当前页面</ZText>
				{#each [{ id: 'demos', label: '实时演示' }, ...doc.demos.map( (demo) => ({ id: demo.id, label: demo.title, nested: true }) ), { id: 'api', label: 'API' }, ...doc.api.map( (section) => ({ id: `api-${section.id}`, label: section.title, nested: true }) ), { id: 'accessibility', label: '可访问性' }] as entry (entry.id)}
					<ZLink
						appearance="navigation"
						size="medium"
						aria-current={activeSection === entry.id ? 'location' : undefined}
						href={componentRoute(doc.id, entry.id)}>{entry.label}</ZLink
					>
				{/each}
			</ZStack>
		</ZCard>
	</aside>
</div>
