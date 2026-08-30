<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const themeLabRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'eyebrow',
				'title',
				'lead',
				'section',
				'sectionTitle',
				'axisGrid',
				'axis',
				'axisName',
				'axisValue',
				'presetGrid',
				'preset',
				'presetColors',
				'presetSwatch',
				'presetName',
				'presetMeta',
				'tokenGrid',
				'token',
				'swatch',
				'tokenName',
				'tokenValue',
				'preview',
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
				axis: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.padding._large;
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
				preview: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._small;
					s.padding._xlarge;
				},
				preset: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.display.grid;
					s.gap._medium;
					s.padding._large;
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
				title: (s) => {
					s.fontSize.raw('clamp(2.5rem, 5vw, 4.5rem)');
					s.letterSpacing.em(-0.05);
					s.lineHeight._compact;
					s.margin.px(0);
				},
				token: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.padding._medium;
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
		ZButton,
		ZContainer,
		ZField,
		ZInput,
		ZKbd,
		ZLink,
		ZSeparator,
		ZStack,
		ZText,
		useZui
	} from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import { docsThemeById, docsThemes, type DocsThemeId } from '../app/theme.js';

	let { themeId = $bindable('aurora-light') }: { themeId?: DocsThemeId } = $props();

	const zui = useZui();
	const classes = $derived(zui.slots(themeLabRecipe));
	const colors = $derived(Object.entries(zui.theme.color));
	const currentTheme = $derived(docsThemeById[themeId]);
</script>

<article class={classes.root}>
	<header>
		<p class={classes.eyebrow}>THEME LAB</p>
		<h1 class={classes.title}>主题不是一组颜色，而是一套系统合同。</h1>
		<p class={classes.lead}>
			使用顶部主题选择器切换六套官方预设，并在“显示”面板调整对比度、密度、动画和RTL。本页直接读取当前ZProvider上下文和Theme语义token，所有预览均为真实ZUI组件。
		</p>
	</header>

	<section class={classes.section} aria-labelledby="official-presets">
		<h2 class={classes.sectionTitle} id="official-presets">官方主题预设</h2>
		<div class={classes.presetGrid}>
			{#each docsThemes as preset (preset.id)}
				<article class={classes.preset} aria-current={themeId === preset.id ? 'true' : undefined}>
					<div class={classes.presetColors} aria-hidden="true">
						{#each [preset.theme.color.canvas, preset.theme.color.surface, preset.theme.color.primary, preset.theme.color.accent] as color}
							<span class={classes.presetSwatch} style={`background:${color}`}></span>
						{/each}
					</div>
					<strong class={classes.presetName}>{preset.label}</strong>
					<span class={classes.presetMeta}>{preset.id} · {preset.scheme}</span>
					<ZButton
						disabled={themeId === preset.id}
						onclick={() => (themeId = preset.id)}
						variant={themeId === preset.id ? 'secondary' : 'primary'}
					>
						{themeId === preset.id ? '当前主题' : `应用${preset.label}`}
					</ZButton>
				</article>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="theme-axes">
		<h2 class={classes.sectionTitle} id="theme-axes">当前偏好轴</h2>
		<div class={classes.axisGrid}>
			{#each [['Theme', currentTheme.label], ['Scheme', zui.colorScheme], ['Contrast', zui.contrast], ['Density', zui.density], ['Motion', zui.motion], ['Direction', zui.direction], ['Locale', zui.locale]] as axis (axis[0])}
				<div class={classes.axis}>
					<span class={classes.axisName}>{axis[0]}</span>
					<strong class={classes.axisValue}>{axis[1]}</strong>
				</div>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="semantic-colors">
		<h2 class={classes.sectionTitle} id="semantic-colors">语义颜色</h2>
		<div class={classes.tokenGrid}>
			{#each colors as [name, value] (name)}
				<div class={classes.token}>
					<div class={classes.swatch} style={`background:${value}`}></div>
					<strong class={classes.tokenName}>{name}</strong>
					<ZCode class={classes.tokenValue} code={String(value)} inline />
				</div>
			{/each}
		</div>
	</section>

	<section class={classes.section} aria-labelledby="component-surfaces">
		<h2 class={classes.sectionTitle} id="component-surfaces">真实组件表面</h2>
		<ZContainer class={classes.preview} gutter="large" size="medium">
			<ZStack gap="large">
				<ZStack direction="row" gap="medium" wrap>
					<ZButton>主要操作</ZButton>
					<ZButton variant="secondary">次要操作</ZButton>
					<ZButton variant="danger">危险操作</ZButton>
					<ZLink href="#/guides/theme">主题链接</ZLink>
				</ZStack>
				<ZSeparator />
				<ZField description="焦点、边框和错误色都来自当前Theme。" label="主题输入">
					<ZInput placeholder="输入以检查当前表面" />
				</ZField>
				<ZText tone="muted">快捷键示例：<ZKbd>Ctrl</ZKbd> + <ZKbd>K</ZKbd></ZText>
				<ZAspectRatio class={classes.aspectPreview} ratio="16 / 9">当前主色比例区域</ZAspectRatio>
			</ZStack>
		</ZContainer>
	</section>
</article>
