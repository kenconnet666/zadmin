<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const themeLabRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: [
				'root',
				'eyebrow',
				'lead',
				'section',
				'sectionTitle',
				'axisGrid',
				'axisName',
				'axisValue',
				'presetGrid',
				'preset',
				'presetColors',
				'presetSwatch',
				'presetName',
				'presetMeta',
				'tokenGrid',
				'swatch',
				'tokenName',
				'tokenValue',
				'aspectPreview'
			] as const,
			base: {
				aspectPreview: (s) => {
					s.backgroundColor._primary;
					s.borderRadius._large;
					s.color._canvas;
					s.display.grid;
					s.maxWidth.rem(28);
					s.placeItems.center;
				},
				axisGrid: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw('repeat(4, minmax(0, 1fr))');
					s._media('(max-width: 64rem)', (tablet) =>
						tablet.gridTemplateColumns.raw('repeat(2, minmax(0, 1fr))')
					);
					s._media('(max-width: 36rem)', (mobile) => mobile.gridTemplateColumns.raw('1fr'));
				},
				axisName: (s) => {
					s.color._textMuted;
					s.display.block;
					s.fontSize._small;
					s.textTransform.uppercase;
				},
				axisValue: (s) => {
					s.color._primary;
					s.display.block;
					s.fontFamily._mono;
					s.fontSize._large;
					s.fontWeight._bold;
					s.marginTop._small;
				},
				eyebrow: (s) => {
					s.color._accent;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.marginBottom._medium;
					s.textTransform.uppercase;
				},
				lead: (s) => {
					s.color._textMuted;
					s.fontSize._large;
					s.lineHeight._relaxed;
					s.maxWidth.rem(58);
				},
				preset: (s) => {
					s._selector('&[aria-current="true"]', (current) => {
						current.borderColor._primary;
						current.boxShadow._small;
					});
				},
				presetColors: (s) => {
					s.display.grid;
					s.gap._xsmall;
					s.gridTemplateColumns.raw('repeat(4, 1fr)');
				},
				presetGrid: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw('repeat(auto-fit, minmax(14rem, 1fr))');
				},
				presetMeta: (s) => {
					s.color._textMuted;
					s.fontFamily._mono;
					s.fontSize._small;
				},
				presetName: (s) => s.fontSize._large,
				presetSwatch: (s) => {
					s.borderColor._border;
					s.borderRadius._small;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.height.rem(2.5);
				},
				root: (s) => s.maxWidth.rem(72),
				section: (s) => s.marginTop.rem(4),
				sectionTitle: (s) => {
					s.fontSize._xlarge;
					s.marginBottom._xlarge;
				},
				swatch: (s) => {
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.height.rem(4);
				},
				tokenGrid: (s) => {
					s.display.grid;
					s.gap._medium;
					s.gridTemplateColumns.raw('repeat(auto-fit, minmax(10rem, 1fr))');
				},
				tokenName: (s) => {
					s.display.block;
					s.fontWeight._semibold;
					s.marginTop._medium;
				},
				tokenValue: (s) => {
					s.color._textMuted;
					s.display.block;
					s.fontFamily._mono;
					s.fontSize._small;
					s.marginTop._xsmall;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZAspectRatio,
		ZAlert,
		ZButton,
		ZCard,
		ZContainer,
		ZField,
		ZHeading,
		ZInput,
		ZKbd,
		ZLink,
		ZSeparator,
		ZStack,
		ZText,
		ZTag,
		useZui
	} from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import { docsThemeById, docsThemes, type DocsThemeId } from '../app/theme.js';

	let {
		onThemeChange,
		themeId = 'aurora-light'
	}: {
		readonly onThemeChange?: (value: DocsThemeId) => void;
		readonly themeId?: DocsThemeId;
	} = $props();

	const zui = useZui();
	const classes = $derived(zui.slots(themeLabRecipe));
	const colors = $derived(Object.entries(zui.theme.color));
	const currentTheme = $derived(docsThemeById[themeId]);
</script>

<article class={classes.root} data-doc-route="guide:theme">
	<header>
		<ZText as="p" class={classes.eyebrow}>THEME LAB</ZText>
		<ZHeading data-doc-page-title="true" level={1} size="xxlarge"
			>主题不是一组颜色，而是一套系统合同。</ZHeading
		>
		<ZText as="p" class={classes.lead}>
			使用顶部主题选择器切换六套官方预设，并在“显示”面板调整对比度、密度、动画和RTL。本页直接读取当前ZProvider上下文和Theme语义token，所有预览均为真实ZUI组件。
		</ZText>
	</header>

	<section class={classes.section} aria-labelledby="official-presets">
		<ZHeading class={classes.sectionTitle} id="official-presets" level={2} size="xlarge"
			>官方主题预设</ZHeading
		>
		<div class={classes.presetGrid}>
			{#each docsThemes as preset (preset.id)}
				<ZCard
					as="article"
					class={classes.preset}
					aria-current={themeId === preset.id ? 'true' : undefined}
					variant="outlined"
				>
					<ZStack gap="medium">
						<div class={classes.presetColors} aria-hidden="true">
							{#each [['canvas', preset.theme.color.canvas], ['surface', preset.theme.color.surface], ['primary', preset.theme.color.primary], ['accent', preset.theme.color.accent]] as [token, color] (token)}
								<span class={classes.presetSwatch} style={`background:${color}`}></span>
							{/each}
						</div>
						<ZText as="strong" class={classes.presetName}>{preset.label}</ZText>
						<ZText class={classes.presetMeta}>{preset.id} · {preset.scheme}</ZText>
						<ZButton
							disabled={themeId === preset.id}
							onclick={() => onThemeChange?.(preset.id)}
							variant={themeId === preset.id ? 'secondary' : 'primary'}
						>
							{themeId === preset.id ? '当前主题' : `应用${preset.label}`}
						</ZButton>
					</ZStack>
				</ZCard>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="theme-axes">
		<ZHeading class={classes.sectionTitle} id="theme-axes" level={2} size="xlarge"
			>当前偏好轴</ZHeading
		>
		<div class={classes.axisGrid}>
			{#each [['Theme', currentTheme.label], ['Scheme', zui.colorScheme], ['Contrast', zui.contrast], ['Density', zui.density], ['Motion', zui.motion], ['Direction', zui.direction], ['Locale', zui.locale]] as axis (axis[0])}
				<ZCard variant="outlined">
					<ZText class={classes.axisName}>{axis[0]}</ZText>
					<ZText as="strong" class={classes.axisValue}>{axis[1]}</ZText>
				</ZCard>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="semantic-colors" data-slot="semantic-colors">
		<ZHeading class={classes.sectionTitle} id="semantic-colors" level={2} size="xlarge"
			>语义颜色</ZHeading
		>
		<div class={classes.tokenGrid}>
			{#each colors as [name, value] (name)}
				<ZCard data-slot="semantic-color" variant="outlined">
					<div class={classes.swatch} style={`background:${value}`}></div>
					<ZText as="strong" class={classes.tokenName}>{name}</ZText>
					<ZCode class={classes.tokenValue} code={String(value)} inline />
				</ZCard>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="component-surfaces">
		<ZHeading class={classes.sectionTitle} id="component-surfaces" level={2} size="xlarge"
			>真实组件表面</ZHeading
		>
		<ZContainer gutter="large" size="medium">
			<ZCard>
				<ZStack gap="large">
					<ZStack direction="row" gap="medium" wrap>
						<ZButton>主要操作</ZButton>
						<ZButton variant="secondary">次要操作</ZButton>
						<ZButton tone="danger">危险操作</ZButton>
						<ZLink href="#/guides/theme">主题链接</ZLink>
					</ZStack>
					<ZSeparator />
					<ZStack gap="medium">
						<ZText tone="muted">悬停、选中和状态背景来自共享语义 token，可在主题中统一覆盖。</ZText>
						<ZStack direction="row" gap="medium" wrap>
							<ZTag tone="accent">分类</ZTag><ZTag tone="success">已完成</ZTag><ZTag tone="warning"
								>待确认</ZTag
							><ZTag tone="danger">需处理</ZTag>
						</ZStack>
						<ZAlert tone="info" title="统一主题来源" live="off"
							>提示、标签、按钮和导航共同消费主题语义颜色，不在文档页面另设一套配色。</ZAlert
						>
					</ZStack>
					<ZField description="焦点、边框和错误色都来自当前Theme。" label="主题输入">
						<ZInput placeholder="输入以检查当前表面" />
					</ZField>
					<ZText tone="muted">快捷键示例：<ZKbd>Ctrl</ZKbd> + <ZKbd>K</ZKbd></ZText>
					<ZAspectRatio class={classes.aspectPreview} ratio="16 / 9">当前主色比例区域</ZAspectRatio>
				</ZStack>
			</ZCard>
		</ZContainer>
	</section>
</article>
