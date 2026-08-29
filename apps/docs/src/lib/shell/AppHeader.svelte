<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const headerRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'brand',
				'brandText',
				'brandSmall',
				'mark',
				'search',
				'actions',
				'themeLabel',
				'github'
			] as const,
			base: {
				actions: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.gap._medium;
					s.justifySelf.end;
				},
				brand: (s) => {
					s.alignItems.center;
					s.color._primary;
					s.display.inlineFlex;
					s.gap._medium;
					s.textDecoration.none;
				},
				brandSmall: (s) => {
					s.color._textMuted;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.08);
					s.marginTop._xsmall;
					s.textTransform.uppercase;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				brandText: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.lineHeight._compact;
				},
				github: (s) => {
					s.alignItems.center;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.display.inlineFlex;
					s.fontSize._small;
					s.fontWeight._semibold;
					s.gap._small;
					s.paddingBlock._small;
					s.paddingInline._medium;
					s.textDecoration.none;
					s._hover((hover) => {
						hover.borderColor._accent;
						hover.color._accent;
					});
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				mark: (s) => {
					s.backgroundColor._primary;
					s.borderRadius._medium;
					s.color._canvas;
					s.display.grid;
					s.fontWeight._bold;
					s.height.rem(2.15);
					s.placeItems.center;
					s.boxShadow._small;
					s.width.rem(2.15);
				},
				root: (s) => {
					s.alignItems.center;
					s.backgroundColor._canvas;
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.boxShadow._small;
					s.display.grid;
					s.gap._xlarge;
					s.gridColumn.raw('1 / -1');
					s.gridTemplateColumns.raw('16.5rem minmax(18rem, 42rem) 1fr');
					s.height.rem(4.25);
					s.paddingInline._xlarge;
					s.position.sticky;
					s.top.px(0);
					s.zIndex(50);
					s._media('(max-width: 48rem)', (mobile) => {
						mobile.gap._medium;
						mobile.gridTemplateColumns.raw('auto minmax(0, 1fr) auto');
						mobile.paddingInline._medium;
					});
				},
				search: (s) => {
					s.alignItems.center;
					s.backgroundColor._surface;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._textMuted;
					s.display.flex;
					s.gap._medium;
					s.paddingInlineStart._medium;
					s._selector('&:focus-within', (focus) => {
						focus.borderColor._focus;
						focus.boxShadow._small;
					});
					s._selector('& input', (input) => {
						input.backgroundColor.transparent;
						input.borderWidth.px(0);
						input.minHeight.rem(2.35);
						input.paddingInlineStart.px(0);
					});
				},
				themeLabel: (s) => s._media('(max-width: 68rem)', (compact) => compact.display.none)
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { ZButton, ZIcon, ZInput, useZui } from '@zadmin/zui';
	import type { DocsThemeMode } from '../docs-theme.js';

	let {
		query = $bindable(''),
		themeMode = $bindable('light')
	}: { query?: string; themeMode?: DocsThemeMode } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(headerRecipe));
</script>

<header class={classes.root}>
	<a class={classes.brand} href="#/" aria-label="ZUI组件展示站首页">
		<span class={classes.mark}>Z</span>
		<span class={classes.brandText}
			><strong>ZUI</strong><small class={classes.brandSmall}>Components</small></span
		>
	</a>
	<label class={classes.search}>
		<ZIcon name="search" size={18} />
		<ZInput bind:value={query} aria-label="搜索组件" placeholder="搜索组件…" />
	</label>
	<div class={classes.actions}>
		<ZButton
			aria-label={themeMode === 'dark' ? '切换到亮色主题' : '切换到赛博朋克暗色主题'}
			size="small"
			variant="secondary"
			onclick={() => (themeMode = themeMode === 'dark' ? 'light' : 'dark')}
		>
			{#if themeMode === 'dark'}<Sun aria-hidden="true" size={16} />{:else}<Moon
					aria-hidden="true"
					size={16}
				/>
			{/if}
			<span class={classes.themeLabel}>{themeMode === 'dark' ? '亮色' : '暗色'}</span>
		</ZButton>
		<a class={classes.github} href="https://github.com/kenconnet666/zadmin">
			GitHub <ExternalLink aria-hidden="true" size={14} />
		</a>
	</div>
</header>
