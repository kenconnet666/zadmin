<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZAppShellLayout = 'alternative' | 'default';
	export type ZAppShellMainAs = 'div' | 'main';
	export type ZAppShellScroll = 'main' | 'root';
	export type ZAppShellLength = number | string;

	export interface ZAppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly aside?: Snippet;
		readonly asideCollapsed?: ResponsiveValue<boolean>;
		readonly asideLabel?: string;
		readonly asideWidth?: ResponsiveValue<ZAppShellLength>;
		readonly children?: Snippet;
		readonly footer?: Snippet;
		readonly footerHeight?: ResponsiveValue<ZAppShellLength>;
		readonly header?: Snippet;
		readonly headerHeight?: ResponsiveValue<ZAppShellLength>;
		readonly layout?: ZAppShellLayout;
		readonly mainAs?: ZAppShellMainAs;
		readonly mainPadding?: ResponsiveValue<ZLayoutSpacing>;
		readonly navbar?: Snippet;
		readonly navbarCollapsed?: ResponsiveValue<boolean>;
		readonly navbarLabel?: string;
		readonly navbarWidth?: ResponsiveValue<ZAppShellLength>;
		readonly query?: ResponsiveQuery;
		readonly scroll?: ZAppShellScroll;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实应用壳div引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		category: 'layout',
		dependencies: ['native header/nav/aside/main/footer', 'CSS Grid', 'typed responsive CSS'],
		events: [],
		id: 'app-shell',
		importStatement: "import { ZAppShell } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZAppShell',
		parts: [
			{ description: '原生header区域。', name: 'header' },
			{ description: '带名称的原生nav区域。', name: 'navbar' },
			{ description: '原生aside辅助区域。', name: 'aside' },
			{ description: 'mainAs决定的main或div正文区域。', name: 'main' },
			{ description: '原生footer区域。', name: 'footer' }
		],
		props: [
			{
				default: "'default'",
				description: 'default让header/footer跨越侧栏；alternative让它们位于两侧区域之间。',
				name: 'layout',
				type: "'default' | 'alternative'"
			},
			{
				default: "'main'",
				description: '正文区域的原生元素。嵌入已有main时使用div，避免嵌套landmark。',
				name: 'mainAs',
				type: "'main' | 'div'"
			},
			{
				default: "'main'",
				description: 'main让正文承担滚动且根裁剪；root让有界应用壳根承担滚动。',
				name: 'scroll',
				type: "'main' | 'root'"
			},
			{
				default: 'Theme.size.appShellHeaderHeight（存在header时）',
				description: 'header存在时的逻辑块尺寸；数字为px，字符串由CSS解析，支持响应式配置。',
				name: 'headerHeight',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: 'Theme.size.appShellFooterHeight（存在footer时）',
				description: 'footer存在时的逻辑块尺寸；数字为px，字符串由CSS解析，支持响应式配置。',
				name: 'footerHeight',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: 'Theme.size.appShellNavbarWidth（存在navbar时）',
				description: 'navbar存在且未折叠时的逻辑内联尺寸，支持响应式配置。',
				name: 'navbarWidth',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: 'Theme.size.appShellAsideWidth（存在aside时）',
				description: 'aside存在且未折叠时的逻辑内联尺寸，支持响应式配置。',
				name: 'asideWidth',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: 'false',
				description: 'navbar的响应式折叠状态；例如base=true、medium=false用于移动端收起。',
				name: 'navbarCollapsed',
				type: 'ResponsiveValue<boolean>'
			},
			{
				default: 'false',
				description: 'aside的响应式折叠状态；例如base=true、medium=false用于移动端收起。',
				name: 'asideCollapsed',
				type: 'ResponsiveValue<boolean>'
			},
			{
				default: "'medium'",
				description: '正文逻辑内/块方向padding；可见区域的Grid轨道本身是正文确定性offset。',
				name: 'mainPadding',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: "'viewport'",
				description: '尺寸、折叠与正文padding的响应式参照；viewport或命名祖先CSS容器。',
				name: 'query',
				type: 'ResponsiveQuery'
			},
			{
				default: 'Provider localePack.common.primaryNavigation',
				description: 'navbar的原生nav名称；显式值优先于Provider本地化默认。',
				name: 'navbarLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'aside的可选原生区域名称。',
				name: 'asideLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实应用壳div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '原生header中的内容。', name: 'header', type: 'Snippet' },
			{ description: '原生nav中的内容。', name: 'navbar', type: 'Snippet' },
			{ description: '原生aside中的内容。', name: 'aside', type: 'Snippet' },
			{ description: '正文内容。', name: 'children', type: 'Snippet' },
			{ description: '原生footer中的内容。', name: 'footer', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/layout/ZAppShell.svelte',
		states: [
			{ description: '区域网格模式。', name: 'data-layout', values: ['default', 'alternative'] },
			{ description: '滚动owner。', name: 'data-scroll', values: ['main', 'root'] },
			{ description: '正文语义元素。', name: 'data-main-as', values: ['main', 'div'] },
			{
				description: 'navbar在当前base规则折叠。',
				name: 'data-navbar-collapsed',
				values: ['true']
			},
			{ description: 'aside在当前base规则折叠。', name: 'data-aside-collapsed', values: ['true'] }
		],
		status: 'experimental',
		summary: '用原生区域和CSS Grid构建可响应折叠的应用布局壳，明确视觉轨道offset与唯一滚动owner。'
	} as const satisfies ZuiComponentMetadata;

	const appShellRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.display.grid;
			s.maxInlineSize.percent(100);
			s.minBlockSize.px(0);
			s.minInlineSize.px(0);
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, appShellRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import type { IcssStyle } from '../../icss/types.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyResponsiveStyles,
		resolveResponsiveValue,
		type ZuiBreakpoint
	} from '../../runtime/foundation/responsive.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import type { ZuiTheme } from '../../theme/types.js';
	import { cssLengthExpression } from '../../theme/units.js';

	type AppShellBreakpoint = 'base' | ZuiBreakpoint;

	let {
		aside,
		asideCollapsed = false,
		asideLabel,
		asideWidth,
		children,
		class: className,
		dir,
		footer,
		footerHeight,
		header,
		headerHeight,
		layout = 'default',
		mainAs = 'main',
		mainPadding = 'medium',
		navbar,
		navbarCollapsed = false,
		navbarLabel,
		navbarWidth,
		query = 'viewport',
		ref = $bindable(null),
		scroll = 'main',
		style,
		tabindex: tabIndexProp,
		...rest
	}: ZAppShellProps = $props();

	const zui = useZui();
	const rootClass = $derived(zui.recipe(appShellRecipe));
	const hasHeader = $derived(header !== undefined);
	const hasFooter = $derived(footer !== undefined);
	const hasNavbar = $derived(navbar !== undefined);
	const hasAside = $derived(aside !== undefined);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedNavbarLabel = $derived(navbarLabel ?? zui.localePack.common.primaryNavigation);
	const resolvedLayout = $derived.by(() => {
		if (layout !== 'default' && layout !== 'alternative') {
			throw new TypeError('ZAppShell layout must be default or alternative.');
		}
		return layout;
	});
	const resolvedMainAs = $derived.by(() => {
		if (mainAs !== 'main' && mainAs !== 'div') {
			throw new TypeError('ZAppShell mainAs must be main or div.');
		}
		return mainAs;
	});
	const resolvedScroll = $derived.by(() => {
		if (scroll !== 'main' && scroll !== 'root') {
			throw new TypeError('ZAppShell scroll must be main or root.');
		}
		return scroll;
	});

	function valueAt<TValue extends string | number | boolean>(
		value: ResponsiveValue<TValue> | undefined,
		breakpoint: AppShellBreakpoint,
		fallback: TValue
	): TValue {
		return resolveResponsiveValue(value, breakpoint, fallback);
	}

	function regionTrack(
		present: boolean,
		collapsed: ResponsiveValue<boolean> | undefined,
		size: ResponsiveValue<ZAppShellLength> | undefined,
		breakpoint: AppShellBreakpoint,
		fallback: ZAppShellLength
	): string {
		if (!present || valueAt(collapsed, breakpoint, false)) return '0px';
		return cssLengthExpression(valueAt(size, breakpoint, fallback));
	}

	function applyMainPadding(s: IcssStyle<ZuiTheme>, value: ZLayoutSpacing): void {
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value < 0) {
				throw new TypeError('AppShell mainPadding must be non-negative and finite.');
			}
			s.padding.px(value);
			return;
		}
		switch (value) {
			case 'none':
				s.padding._none;
				break;
			case 'xsmall':
				s.padding._xsmall;
				break;
			case 'small':
				s.padding._small;
				break;
			case 'medium':
				s.padding._medium;
				break;
			case 'large':
				s.padding._large;
				break;
			case 'xlarge':
				s.padding._xlarge;
				break;
			default:
				throw new TypeError(`Unknown AppShell mainPadding "${String(value)}".`);
		}
	}

	const trackValues = $derived.by(() => {
		const at = (breakpoint: AppShellBreakpoint) => {
			const headerTrack = hasHeader
				? cssLengthExpression(
						valueAt(headerHeight, breakpoint, zui.theme.size.appShellHeaderHeight)
					)
				: '0px';
			const footerTrack = hasFooter
				? cssLengthExpression(
						valueAt(footerHeight, breakpoint, zui.theme.size.appShellFooterHeight)
					)
				: '0px';
			const navbarTrack = regionTrack(
				hasNavbar,
				navbarCollapsed,
				navbarWidth,
				breakpoint,
				zui.theme.size.appShellNavbarWidth
			);
			const asideTrack = regionTrack(
				hasAside,
				asideCollapsed,
				asideWidth,
				breakpoint,
				zui.theme.size.appShellAsideWidth
			);
			return Object.freeze({
				columns: `${navbarTrack} minmax(0, 1fr) ${asideTrack}`,
				rows: `${headerTrack} ${resolvedScroll === 'main' ? 'minmax(0, 1fr)' : 'minmax(max-content, 1fr)'} ${footerTrack}`
			});
		};
		return Object.freeze({
			base: at('base'),
			small: at('small'),
			medium: at('medium'),
			large: at('large')
		});
	});
	const columnTracks = $derived(
		Object.freeze({
			base: trackValues.base.columns,
			small: trackValues.small.columns,
			medium: trackValues.medium.columns,
			large: trackValues.large.columns
		})
	);
	const rowTracks = $derived(
		Object.freeze({
			base: trackValues.base.rows,
			small: trackValues.small.rows,
			medium: trackValues.medium.rows,
			large: trackValues.large.rows
		})
	);
	const baseNavbarCollapsed = $derived(!hasNavbar || valueAt(navbarCollapsed, 'base', false));
	const baseAsideCollapsed = $derived(!hasAside || valueAt(asideCollapsed, 'base', false));
	const layoutClass = $derived(
		zui.icss((s) => {
			s.gridTemplateAreas.raw(
				resolvedLayout === 'default'
					? '"header header header" "navbar main aside" "footer footer footer"'
					: '"navbar header aside" "navbar main aside" "navbar footer aside"'
			);
			applyResponsiveStyles(s, columnTracks, (s, value) => s.gridTemplateColumns.raw(value), query);
			applyResponsiveStyles(s, rowTracks, (s, value) => s.gridTemplateRows.raw(value), query);
			s.overflow[resolvedScroll === 'main' ? 'hidden' : 'auto'];
			s._selector('& > [data-region="header"]', (s) => {
				s.gridArea.raw('header');
				s.minInlineSize.px(0);
			});
			s._selector('& > [data-region="navbar"]', (s) => {
				s.gridArea.raw('navbar');
				s.minBlockSize.px(0);
				s.minInlineSize.px(0);
				s.overflow.auto;
			});
			s._selector('& > [data-region="aside"]', (s) => {
				s.gridArea.raw('aside');
				s.minBlockSize.px(0);
				s.minInlineSize.px(0);
				s.overflow.auto;
			});
			s._selector('& > [data-region="main"]', (s) => {
				s.gridArea.raw('main');
				if (resolvedScroll === 'main') s.minBlockSize.px(0);
				else s.minBlockSize.raw('auto');
				s.minInlineSize.px(0);
				s.overflow[resolvedScroll === 'main' ? 'auto' : 'visible'];
				applyResponsiveStyles(s, mainPadding, (s, value) => applyMainPadding(s, value), query);
			});
			s._selector('& > [data-region="footer"]', (s) => {
				s.gridArea.raw('footer');
				s.minInlineSize.px(0);
			});
			if (hasNavbar) {
				const collapsed = Object.freeze({
					base: valueAt(navbarCollapsed, 'base', false),
					small: valueAt(navbarCollapsed, 'small', false),
					medium: valueAt(navbarCollapsed, 'medium', false),
					large: valueAt(navbarCollapsed, 'large', false)
				});
				applyResponsiveStyles(
					s,
					collapsed,
					(s, value) =>
						s._selector('& > [data-region="navbar"]', (s) => {
							s.display[value ? 'none' : 'block'];
						}),
					query
				);
			}
			if (hasAside) {
				const collapsed = Object.freeze({
					base: valueAt(asideCollapsed, 'base', false),
					small: valueAt(asideCollapsed, 'small', false),
					medium: valueAt(asideCollapsed, 'medium', false),
					large: valueAt(asideCollapsed, 'large', false)
				});
				applyResponsiveStyles(
					s,
					collapsed,
					(s, value) =>
						s._selector('& > [data-region="aside"]', (s) => {
							s.display[value ? 'none' : 'block'];
						}),
					query
				);
			}
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- the active scroll owner is a named keyboard region -->
<div
	{...rest}
	bind:this={ref}
	class={[rootClass, layoutClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-layout={resolvedLayout}
	data-main-as={resolvedMainAs}
	data-scroll={resolvedScroll}
	data-navbar-collapsed={baseNavbarCollapsed || undefined}
	data-aside-collapsed={baseAsideCollapsed || undefined}
	dir={resolvedDirection}
	tabindex={tabIndexProp ?? (resolvedScroll === 'root' ? 0 : undefined)}
>
	{#if header}
		<header data-region="header" data-slot="header">{@render header()}</header>
	{/if}
	{#if navbar}
		<nav aria-label={resolvedNavbarLabel} data-region="navbar" data-slot="navbar" tabindex="0">
			{@render navbar()}
		</nav>
	{/if}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -- the main scroll owner is keyboard accessible -->
	<svelte:element
		this={resolvedMainAs}
		data-region="main"
		data-slot="main"
		tabindex={resolvedScroll === 'main' ? 0 : undefined}
	>
		{@render children?.()}
	</svelte:element>
	{#if aside}
		<aside aria-label={asideLabel} data-region="aside" data-slot="aside" tabindex="0">
			{@render aside()}
		</aside>
	{/if}
	{#if footer}
		<footer data-region="footer" data-slot="footer">{@render footer()}</footer>
	{/if}
</div>
