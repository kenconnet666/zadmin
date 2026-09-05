<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const headerRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
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
				'preferencesLabel',
				'preferencesPanel',
				'preference',
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
				preferencesLabel: (s) => s._media('(max-width: 80rem)', (compact) => compact.display.none),
				preferencesPanel: (s) => {
					s.display.grid;
					s.gap._medium;
					s.minWidth.rem(15);
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
	import {
		ZIcon,
		ZStack,
		ZText,
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
			<ZText class={classes.mark}>Z</ZText>
			<ZStack class={classes.brandText} gap="none"
				><ZText as="strong" weight="bold">ZUI</ZText><ZText as="small" class={classes.brandSmall}
					>Components</ZText
				></ZStack
			>
		</ZLink>
	</div>
	<AppCommandSearch {docs} />
	<div class={classes.actions}>
		<div class={classes.themePicker}>
			<ZIcon name="palette" size={16} />
			<ZText class={classes.themeLabel} tone="muted">主题</ZText>
			<ZSelect
				matchWidth={false}
				value={themeId}
				valueLabel={themeValueLabel}
				onValueChange={setTheme}
				placement="bottom-end"
			>
				<ZSelectTrigger aria-label="选择文档主题" size="medium" />
				<ZSelectContent>
					{#each docsThemes as theme (theme.id)}
						<ZSelectItem value={theme.id}>{theme.label}</ZSelectItem>
					{/each}
				</ZSelectContent>
			</ZSelect>
		</div>
		<ZPopover placement="bottom-end">
			<ZPopoverTrigger aria-label="调整显示偏好" size="small" variant="secondary">
				<ZIcon name="sliders" size={16} />
				<ZText class={classes.preferencesLabel} size="small">显示</ZText>
			</ZPopoverTrigger>
			<ZPopoverContent class={classes.preferencesPanel}>
				<div class={classes.preference}>
					<ZText>密度</ZText>
					<ZSelect value={density} valueLabel={densityValueLabel} onValueChange={setDensity}>
						<ZSelectTrigger aria-label="密度" />
						<ZSelectContent>
							<ZSelectItem value="compact">紧凑</ZSelectItem>
							<ZSelectItem value="comfortable">舒适</ZSelectItem>
							<ZSelectItem value="spacious">宽松</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<ZText>对比度</ZText>
					<ZSelect value={contrast} valueLabel={contrastValueLabel} onValueChange={setContrast}>
						<ZSelectTrigger aria-label="对比度" />
						<ZSelectContent>
							<ZSelectItem value="normal">标准</ZSelectItem>
							<ZSelectItem value="high">高对比</ZSelectItem>
							<ZSelectItem value="auto">跟随系统</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<ZText>动画</ZText>
					<ZSelect value={motion} valueLabel={motionValueLabel} onValueChange={setMotion}>
						<ZSelectTrigger aria-label="动画" />
						<ZSelectContent>
							<ZSelectItem value="auto">跟随系统</ZSelectItem>
							<ZSelectItem value="full">完整</ZSelectItem>
							<ZSelectItem value="reduced">减少</ZSelectItem>
						</ZSelectContent>
					</ZSelect>
				</div>
				<div class={classes.preference}>
					<ZText>方向</ZText>
					<ZSelect value={direction} valueLabel={directionValueLabel} onValueChange={setDirection}>
						<ZSelectTrigger aria-label="方向" />
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
			appearance="button"
			variant="secondary"
			size="small"
			external
			href="https://github.com/kenconnet666/zadmin"
			underline="none"
		>
			GitHub
		</ZLink>
	</div>
</header>
