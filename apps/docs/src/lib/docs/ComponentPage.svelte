<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const pageRecipe = defineSlotRecipe(
		{
			slots: [
				'layout',
				'header',
				'eyebrow',
				'titleLine',
				'title',
				'status',
				'lead',
				'importLine',
				'sourceLink',
				'section',
				'sectionTitle',
				'accessibility',
				'accessibilityList',
				'toc',
				'tocTitle',
				'tocButton',
				'tocNested'
			] as const,
			base: {
				accessibility: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.padding._large;
				},
				accessibilityList: (s) => {
					s.color._textMuted;
					s.lineHeight._relaxed;
					s.marginBottom.px(0);
					s.paddingInlineStart._xlarge;
				},
				eyebrow: (s) => {
					s.color._primary;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.margin.raw('0 0 0.8rem');
					s.textTransform.uppercase;
				},
				header: (s) => s.paddingBottom.rem(4),
				importLine: (s) => {
					s.marginTop._xlarge;
					s.maxWidth.rem(46);
				},
				layout: (s) => {
					s.display.grid;
					s.gap.raw('clamp(2rem, 5vw, 5rem)');
					s.gridTemplateColumns.raw('minmax(0, 56rem) 12rem');
					s.justifyContent.center;
					s._media('(max-width: 68rem)', (tablet) =>
						tablet.gridTemplateColumns.raw('minmax(0, 1fr)')
					);
				},
				lead: (s) => {
					s.display.block;
					s.fontSize._large;
					s.lineHeight._relaxed;
					s.marginTop._large;
					s.maxWidth.rem(46);
				},
				section: (s) => {
					s.paddingTop.rem(5);
					s.scrollMarginTop.rem(5.5);
				},
				sectionTitle: (s) => {
					s.fontSize._xlarge;
					s.letterSpacing.em(-0.03);
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
				status: (s) => {
					s.backgroundColor._surface;
					s.borderColor._border;
					s.borderRadius.rem(999);
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._primaryHover;
					s.fontSize._small;
					s.fontWeight._bold;
					s.paddingBlock._xsmall;
					s.paddingInline._medium;
					s.textTransform.uppercase;
				},
				title: (s) => {
					s.fontSize.raw('clamp(2.5rem, 5vw, 4.5rem)');
					s.letterSpacing.em(-0.05);
					s.lineHeight._compact;
					s.margin.px(0);
				},
				titleLine: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.gap._large;
				},
				toc: (s) => {
					s.borderLeftColor._border;
					s.borderLeftStyle.solid;
					s.borderLeftWidth._hairline;
					s.display.flex;
					s.flexDirection.column;
					s.gap._xsmall;
					s.height.fitContent;
					s.paddingInlineStart._large;
					s.position.sticky;
					s.top.rem(6);
					s._media('(max-width: 68rem)', (tablet) => tablet.display.none);
				},
				tocButton: (s) => {
					s.backgroundColor.transparent;
					s.borderWidth.px(0);
					s.color._textMuted;
					s.cursor.pointer;
					s.fontSize._small;
					s.paddingBlock._xsmall;
					s.paddingInline.px(0);
					s.textAlign.left;
					s.textDecoration.none;
					s._hover((hover) => hover.color._primaryHover);
				},
				tocNested: (s) => s.paddingInlineStart._medium,
				tocTitle: (s) => {
					s.fontSize._small;
					s.marginBottom._small;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZIcon, ZStack, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { ComponentDoc } from '../catalog/index.js';
	import { componentRoute } from '../router.js';
	import ApiTable from './ApiTable.svelte';
	import DemoBlock from './DemoBlock.svelte';

	let { doc }: { doc: ComponentDoc } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(pageRecipe));
</script>

<div class={classes.layout}>
	<article>
		<header class={classes.header}>
			<p class={classes.eyebrow}>ZUI FOUNDATION</p>
			<div class={classes.titleLine}>
				<h1 class={classes.title}>{doc.name}</h1>
				<span class={classes.status}>{doc.status}</span>
			</div>
			<ZText class={classes.lead} tone="muted">{doc.summary}</ZText>
			<div class={classes.importLine}>
				<ZCode
					ariaLabel={`${doc.name}导入语句`}
					code={doc.importStatement}
					inline
					lang="typescript"
				/>
			</div>
			<a
				class={classes.sourceLink}
				href={`https://github.com/kenconnet666/zadmin/blob/master/${doc.source}`}
			>
				<ZIcon name="plus" size={16} /> 查看组件源码
			</a>
		</header>

		<section id="demos" class={classes.section}>
			<h2 class={classes.sectionTitle}>实时演示</h2>
			<ZStack gap="large">
				{#each doc.demos as demo (demo.id)}
					<DemoBlock {demo} />
				{/each}
			</ZStack>
		</section>

		<section id="api" class={classes.section}>
			{#each doc.api as section (section.title)}
				<ApiTable {section} />
			{/each}
		</section>

		<section id="accessibility" class={[classes.section, classes.accessibility]}>
			<h2 class={classes.sectionTitle}>可访问性</h2>
			<ul class={classes.accessibilityList}>
				{#each doc.accessibility as item (item)}<li>{item}</li>{/each}
			</ul>
		</section>
	</article>

	<aside class={classes.toc} aria-label="当前页目录">
		<strong class={classes.tocTitle}>当前页面</strong>
		<a class={classes.tocButton} href={componentRoute(doc.id, 'demos')}>实时演示</a>
		{#each doc.demos as demo (demo.id)}
			<a class={[classes.tocButton, classes.tocNested]} href={componentRoute(doc.id, demo.id)}
				>{demo.title}</a
			>
		{/each}
		<a class={classes.tocButton} href={componentRoute(doc.id, 'api')}>API</a>
		<a class={classes.tocButton} href={componentRoute(doc.id, 'accessibility')}>可访问性</a>
	</aside>
</div>
