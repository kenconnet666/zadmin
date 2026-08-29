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
				'preferences',
				'preferencesSummary',
				'preferencesLabel',
				'preferencesPanel',
				'preference',
				'select',
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
				preference: (s) => {
					s.alignItems.center;
					s.display.grid;
					s.fontSize._small;
					s.gap._medium;
					s.gridTemplateColumns.raw('4.5rem minmax(8rem, 1fr)');
				},
				preferences: (s) => s.position.relative,
				preferencesLabel: (s) => s._media('(max-width: 68rem)', (compact) => compact.display.none),
				preferencesPanel: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._medium;
					s.display.grid;
					s.gap._medium;
					s.insetBlockStart.px(44);
					s.insetInlineEnd.px(0);
					s.minWidth.rem(15);
					s.padding._large;
					s.position.absolute;
					s.zIndex(70);
				},
				preferencesSummary: (s) => {
					s.alignItems.center;
					s.backgroundColor._surface;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.cursor.pointer;
					s.display.inlineFlex;
					s.fontSize._small;
					s.fontWeight._semibold;
					s.gap._small;
					s.minHeight.rem(2.35);
					s.paddingInline._medium;
					s._hover((hover) => hover.borderColor._accent);
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
					});
					s._selector('&::-webkit-details-marker', (marker) => marker.display.none);
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
				select: (s) => {
					s.backgroundColor._surface;
					s.borderColor._border;
					s.borderRadius._small;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.fontFamily._sans;
					s.minHeight.rem(2.25);
					s.paddingInline._small;
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
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
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import Sun from '@lucide/svelte/icons/sun';
	import {
		ZButton,
		ZIcon,
		ZInput,
		useZui,
		type ZuiContrast,
		type ZuiDensity,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';
	import type { DocsThemeMode } from '../app/theme.js';

	let {
		contrast = $bindable('normal'),
		density = $bindable('comfortable'),
		direction = $bindable('ltr'),
		motion = $bindable('auto'),
		query = $bindable(''),
		themeMode = $bindable('light')
	}: {
		contrast?: ZuiContrast;
		density?: ZuiDensity;
		direction?: ZuiDirection;
		motion?: ZuiMotion;
		query?: string;
		themeMode?: DocsThemeMode;
	} = $props();
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
		<ZInput
			bind:value={query}
			aria-label="搜索组件"
			id="zui-docs-component-search"
			name="component-search"
			placeholder="搜索组件…"
		/>
	</label>
	<div class={classes.actions}>
		<ZButton
			aria-label={themeMode === 'dark' ? '切换到亮色主题' : '切换到赛博朋克暗色主题'}
			size="small"
			variant="secondary"
			onclick={() => (themeMode = themeMode === 'dark' ? 'light' : 'dark')}
		>
			{#if themeMode === 'dark'}
				<Sun aria-hidden="true" size={16} />
			{:else}
				<Moon aria-hidden="true" size={16} />
			{/if}
			<span class={classes.themeLabel}>{themeMode === 'dark' ? '亮色' : '暗色'}</span>
		</ZButton>
		<details class={classes.preferences}>
			<summary class={classes.preferencesSummary} aria-label="调整显示偏好">
				<SlidersHorizontal aria-hidden="true" size={16} />
				<span class={classes.preferencesLabel}>显示</span>
			</summary>
			<div class={classes.preferencesPanel}>
				<label class={classes.preference}>
					<span>密度</span>
					<select class={classes.select} bind:value={density} id="zui-docs-density" name="density">
						<option value="compact">紧凑</option>
						<option value="comfortable">舒适</option>
						<option value="spacious">宽松</option>
					</select>
				</label>
				<label class={classes.preference}>
					<span>对比度</span>
					<select
						class={classes.select}
						bind:value={contrast}
						id="zui-docs-contrast"
						name="contrast"
					>
						<option value="normal">标准</option>
						<option value="high">高对比</option>
						<option value="auto">跟随系统</option>
					</select>
				</label>
				<label class={classes.preference}>
					<span>动画</span>
					<select class={classes.select} bind:value={motion} id="zui-docs-motion" name="motion">
						<option value="auto">跟随系统</option>
						<option value="full">完整</option>
						<option value="reduced">减少</option>
					</select>
				</label>
				<label class={classes.preference}>
					<span>方向</span>
					<select
						class={classes.select}
						bind:value={direction}
						id="zui-docs-direction"
						name="direction"
					>
						<option value="ltr">从左到右</option>
						<option value="rtl">从右到左</option>
					</select>
				</label>
			</div>
		</details>
		<a class={classes.github} href="https://github.com/kenconnet666/zadmin">
			GitHub
			<ExternalLink aria-hidden="true" size={14} />
		</a>
	</div>
</header>
