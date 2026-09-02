<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const headerRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'brandArea',
				'brand',
				'brandText',
				'brandSmall',
				'mark',
				'actions',
				'themePicker',
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
					s.minWidth.px(0);
					s.justifySelf.end;
					s.whiteSpace.nowrap;
					s._media('(max-width: 80rem)', (compact) => {
						compact.gap._small;
					});
				},
				brand: (s) => {
					s.alignItems.center;
					s.color._primary;
					s.display.inlineFlex;
					s.gap._medium;
					s.textDecoration.none;
				},
				brandArea: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.gap._small;
					s.minWidth.px(0);
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
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
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
					s.whiteSpace.nowrap;
					s._media('(max-width: 80rem)', (compact) => compact.paddingInline._small);
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
					s._media('(max-width: 80rem) and (min-width: 48.01rem)', (compact) => {
						compact.gap._medium;
						compact.gridTemplateColumns.raw('14rem minmax(0, 1fr) auto');
						compact.paddingInline._large;
					});
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
				preferencesLabel: (s) => s._media('(max-width: 80rem)', (compact) => compact.display.none),
				preferencesPanel: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._medium;
					s.display.grid;
					s.gap._medium;
					s.minWidth.rem(15);
					s.padding._large;
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
					s.whiteSpace.nowrap;
					s._media('(max-width: 80rem)', (compact) => compact.paddingInline._small);
					s._hover((hover) => hover.borderColor._accent);
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
					});
					s._selector('&::-webkit-details-marker', (marker) => marker.display.none);
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
					s.whiteSpace.nowrap;
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
					});
				},
				themePicker: (s) => {
					s.alignItems.center;
					s.color._textMuted;
					s.display.inlineFlex;
					s.gap._small;
					s.whiteSpace.nowrap;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				themeLabel: (s) => s._media('(max-width: 80rem)', (compact) => compact.display.none)
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import Palette from '@lucide/svelte/icons/palette';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import {
		ZLink,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		useZui,
		type SelectionKey,
		type ZuiContrast,
		type ZuiDensity,
		type ZuiDirection,
		type ZuiMotion
	} from '@zadmin/zui';
	import { docsThemeById, docsThemes, type DocsThemeId } from '../app/theme.js';
	import type { ComponentCatalogManifestEntry } from '../framework/catalog-manifest.generated.js';
	import AppCommandSearch from './AppCommandSearch.svelte';
	import AppMobileNavigation from './AppMobileNavigation.svelte';

	let {
		contrast = 'normal',
		currentGuideId,
		currentId,
		density = 'comfortable',
		direction = 'ltr',
		docs,
		motion = 'auto',
		onContrastChange,
		onDensityChange,
		onDirectionChange,
		onMotionChange,
		onThemeChange,
		themeId = 'aurora-light'
	}: {
		readonly contrast?: ZuiContrast;
		readonly currentGuideId?: string;
		readonly currentId?: string;
		readonly density?: ZuiDensity;
		readonly direction?: ZuiDirection;
		readonly docs: readonly ComponentCatalogManifestEntry[];
		readonly motion?: ZuiMotion;
		readonly onContrastChange?: (value: ZuiContrast) => void;
		readonly onDensityChange?: (value: ZuiDensity) => void;
		readonly onDirectionChange?: (value: ZuiDirection) => void;
		readonly onMotionChange?: (value: ZuiMotion) => void;
		readonly onThemeChange?: (value: DocsThemeId) => void;
		readonly themeId?: DocsThemeId;
	} = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(headerRecipe));
	const densityLabels = { compact: '紧凑', comfortable: '舒适', spacious: '宽松' } as const;
	const contrastLabels = { auto: '跟随系统', high: '高对比', normal: '标准' } as const;
	const motionLabels = { auto: '跟随系统', full: '完整', reduced: '减少' } as const;
	const directionLabels = { ltr: '从左到右', rtl: '从右到左' } as const;
	const labelFrom = (labels: Readonly<Record<string, string>>) => (value: SelectionKey) =>
		labels[String(value)] ?? String(value);
	const themeValueLabel = (value: SelectionKey) =>
		typeof value === 'string' && Object.hasOwn(docsThemeById, value)
			? docsThemeById[value as DocsThemeId].label
			: String(value);
	const densityValueLabel = labelFrom(densityLabels);
	const contrastValueLabel = labelFrom(contrastLabels);
	const motionValueLabel = labelFrom(motionLabels);
	const directionValueLabel = labelFrom(directionLabels);

	function setTheme(value: SelectionKey | undefined): void {
		if (typeof value === 'string' && docsThemes.some((theme) => theme.id === value)) {
			onThemeChange?.(value as DocsThemeId);
		}
	}

	function setDensity(value: SelectionKey | undefined): void {
		if (value === 'compact' || value === 'comfortable' || value === 'spacious')
			onDensityChange?.(value);
	}

	function setContrast(value: SelectionKey | undefined): void {
		if (value === 'auto' || value === 'high' || value === 'normal') onContrastChange?.(value);
	}

	function setMotion(value: SelectionKey | undefined): void {
		if (value === 'auto' || value === 'full' || value === 'reduced') onMotionChange?.(value);
	}

	function setDirection(value: SelectionKey | undefined): void {
		if (value === 'ltr' || value === 'rtl') onDirectionChange?.(value);
	}
</script>

<header class={classes.root}>
	<div class={classes.brandArea}>
		<AppMobileNavigation {docs} {currentGuideId} {currentId} />
		<ZLink class={classes.brand} href="#/" underline="none">
			<span class={classes.mark}>Z</span>
			<span class={classes.brandText}
				><strong>ZUI</strong><small class={classes.brandSmall}>Components</small></span
			>
		</ZLink>
	</div>
	<AppCommandSearch {docs} />
	<div class={classes.actions}>
		<div class={classes.themePicker}>
			<Palette aria-hidden="true" size={16} />
			<span class={classes.themeLabel}>主题</span>
			<ZSelect
				value={themeId}
				valueLabel={themeValueLabel}
				onValueChange={setTheme}
				placement="bottom-end"
			>
				<ZSelectTrigger aria-label="选择文档主题" class={classes.select} />
				<ZSelectContent>
					{#each docsThemes as theme (theme.id)}
						<ZSelectItem value={theme.id}>{theme.label}</ZSelectItem>
					{/each}
				</ZSelectContent>
			</ZSelect>
		</div>
		<ZPopover placement="bottom-end">
			<ZPopoverTrigger
				class={classes.preferencesSummary}
				aria-label="调整显示偏好"
				size="small"
				variant="secondary"
			>
				<SlidersHorizontal aria-hidden="true" size={16} />
				<span class={classes.preferencesLabel}>显示</span>
			</ZPopoverTrigger>
			<ZPopoverContent class={classes.preferencesPanel}>
				<div class={classes.preference}>
					<span>密度</span>
					<ZSelect value={density} valueLabel={densityValueLabel} onValueChange={setDensity}>
						<ZSelectTrigger aria-label="密度" class={classes.select} />
						<ZSelectContent>
							<ZSelectItem value="compact">紧凑</ZSelectItem>
							<ZSelectItem value="comfortable">舒适</ZSelectItem>
							<ZSelectItem value="spacious">宽松</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<span>对比度</span>
					<ZSelect value={contrast} valueLabel={contrastValueLabel} onValueChange={setContrast}>
						<ZSelectTrigger aria-label="对比度" class={classes.select} />
						<ZSelectContent>
							<ZSelectItem value="normal">标准</ZSelectItem>
							<ZSelectItem value="high">高对比</ZSelectItem>
							<ZSelectItem value="auto">跟随系统</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<span>动画</span>
					<ZSelect value={motion} valueLabel={motionValueLabel} onValueChange={setMotion}>
						<ZSelectTrigger aria-label="动画" class={classes.select} />
						<ZSelectContent>
							<ZSelectItem value="auto">跟随系统</ZSelectItem>
							<ZSelectItem value="full">完整</ZSelectItem>
							<ZSelectItem value="reduced">减少</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<span>方向</span>
					<ZSelect value={direction} valueLabel={directionValueLabel} onValueChange={setDirection}>
						<ZSelectTrigger aria-label="方向" class={classes.select} />
						<ZSelectContent>
							<ZSelectItem value="ltr">从左到右</ZSelectItem>
							<ZSelectItem value="rtl">从右到左</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
			</ZPopoverContent>
		</ZPopover>
		<ZLink
			class={classes.github}
			external
			href="https://github.com/kenconnet666/zadmin"
			underline="none"
		>
			GitHub
		</ZLink>
	</div>
</header>
