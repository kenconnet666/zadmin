<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		HTMLAnchorAttributes,
		HTMLAttributes,
		KeyboardEventHandler,
		MouseEventHandler
	} from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { IcssFactory } from '../../icss/types.js';
	import type { ZuiTheme } from '../../theme/types.js';
	import type { ZSemanticTone } from '../../theme/semantics.js';
	import { controlSizeStyles, type ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export type NavLinkIndicator = 'none' | 'start' | 'end';
	export type NavLinkTone = ZSemanticTone | 'primary';
	export type NavLinkVariant = 'subtle' | 'solid' | 'outline';

	type NativeNavLinkAttributes = Omit<
		HTMLAttributes<HTMLElement>,
		'aria-controls' | 'aria-current' | 'aria-expanded' | 'children' | 'onclick' | 'onkeydown'
	> &
		Pick<
			HTMLAnchorAttributes,
			'download' | 'hreflang' | 'media' | 'ping' | 'referrerpolicy' | 'rel' | 'target' | 'type'
		>;

	export interface ZNavLinkProps extends NativeNavLinkAttributes {
		readonly active?: boolean;
		readonly compact?: boolean;
		readonly contentId?: string;
		readonly description?: string;
		readonly disabled?: boolean;
		readonly disclosureId?: string;
		readonly disclosureLabel?: string;
		readonly end?: Snippet;
		readonly expanded?: boolean;
		readonly external?: boolean;
		readonly href?: string;
		readonly indicator?: NavLinkIndicator;
		readonly label: string;
		readonly labelContent?: Snippet;
		readonly newWindowLabel?: string;
		readonly onExpandedChange?: (expanded: boolean) => void;
		readonly onclick?: MouseEventHandler<HTMLElement>;
		readonly onkeydown?: KeyboardEventHandler<HTMLElement>;
		readonly size?: ZControlSize;
		readonly start?: Snippet;
		readonly tone?: NavLinkTone;
		readonly variant?: NavLinkVariant;
		disclosureRef?: HTMLButtonElement | null;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'nav-link',
		name: 'ZNavLink',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/navigation/ZNavLink.svelte',
		importStatement: "import { ZNavLink } from '@zadmin/zui';",
		summary:
			'以真实anchor、button或被动内容呈现完整导航行，并把当前页、子级展开与禁用保持为独立状态。',
		dependencies: ['ZLink', 'native button', 'ReducedMotionState', 'Theme semantic tones'],
		bindings: [
			{
				name: 'ref',
				type: 'HTMLElement | null',
				description: '真实主导航元素引用：anchor、button或div；不指向布局包装。'
			},
			{
				name: 'disclosureRef',
				type: 'HTMLButtonElement | null',
				description: '负责展开的真实button；无href时与ref指向同一元素。'
			}
		],
		events: [
			{
				name: 'onclick',
				type: 'MouseEventHandler<HTMLElement>',
				description: '主链接或展开按钮的原生click；链接保留修饰键、target和浏览器默认行为。'
			},
			{
				name: 'onExpandedChange',
				type: '(expanded: boolean) => void',
				description: '用户请求切换子级面板；状态和面板仍由导航容器拥有。'
			}
		],
		keyboard: [
			{ key: 'Enter', description: '真实anchor导航，或真实button请求切换子级。' },
			{ key: 'Space', description: '仅按原生button规则请求切换；链接不覆盖Space。' },
			{
				key: 'ArrowRight / ArrowLeft',
				description: '展开控件按实际LTR/RTL方向请求打开或关闭，不移动导航焦点。'
			}
		],
		parts: [
			{ name: 'row', description: '链接与独立展开控件需要并列时使用的内部布局包装。' },
			{ name: 'primary', description: '接收ref、原生属性、class、style与ICSS的主导航元素。' },
			{ name: 'active-indicator', description: '可选的逻辑起始或结束侧当前页色条。' },
			{ name: 'start', description: '标签之前的图标或内容。' },
			{ name: 'content', description: '可收缩的标签和说明区域。' },
			{ name: 'label', description: '必需标签或labelContent的可见容器。' },
			{ name: 'description', description: '可选的补充说明。' },
			{ name: 'end', description: '标签内容之后的状态或内容。' },
			{ name: 'disclosure', description: '链接拥有子级时与anchor并列的原生展开按钮。' },
			{ name: 'disclosure-icon', description: '随展开状态和实际书写方向变化的装饰箭头。' }
		],
		props: [
			{
				name: 'label',
				type: 'string',
				required: true,
				default: '必填',
				description: '非空命名标签；默认也作为可见标签。'
			},
			{
				name: 'labelContent',
				type: 'Snippet',
				default: 'undefined',
				description: '仅替换非compact状态的可见标签内容；label继续拥有可访问名称与折叠后备。'
			},
			{
				name: 'description',
				type: 'string',
				default: 'undefined',
				description: '可选说明；空字符串不渲染。'
			},
			{
				name: 'href',
				type: 'string',
				default: 'undefined',
				description: '提供时主元素为真实anchor；不提供时根据expanded分支为button或div。'
			},
			{
				name: 'active',
				type: 'boolean',
				default: 'false',
				description: '仅映射aria-current=page和当前页视觉。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '阻止链接导航或禁用展开按钮；不改变active/expanded。'
			},
			{
				name: 'expanded',
				type: 'boolean',
				default: 'undefined',
				description: '存在即声明该项拥有子级；只映射到负责展开的button。'
			},
			{
				name: 'onExpandedChange',
				type: '(expanded: boolean) => void',
				default: 'undefined',
				description: '展开请求回调；组件不拥有子级内容或面板状态。'
			},
			{
				name: 'contentId',
				type: 'string',
				default: 'undefined',
				description: '面板ID；作为aria-controls只写到负责展开的button。'
			},
			{
				name: 'disclosureId',
				type: 'string',
				default: 'undefined',
				description:
					'负责展开的真实button ID；链接双控件分支不占用primary原生id，单button分支优先于原生id。'
			},
			{
				name: 'disclosureLabel',
				type: 'string',
				default: 'undefined',
				description: '独立展开按钮的可访问名称；默认复用可见label。'
			},
			{
				name: 'variant',
				type: 'NavLinkVariant',
				default: 'subtle',
				description: '轻量、实底或描边surface外观。'
			},
			{
				name: 'compact',
				type: 'boolean',
				default: 'false',
				description:
					'隐藏label/description但保留完整可访问名称；没有start时显示标签首字符，主元素保持当前size的方形。'
			},
			{
				name: 'tone',
				type: 'NavLinkTone',
				default: 'primary',
				description: '当前页和交互反馈的品牌或语义色。'
			},
			{
				name: 'indicator',
				type: 'NavLinkIndicator',
				default: 'start',
				description: '当前页色条位于逻辑起始、结束或隐藏。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider density',
				description:
					'五档导航行、说明字号和展开控件尺寸；普通行只设min-height，双行内容可自然增高。'
			},
			{
				name: 'external',
				type: 'boolean',
				default: 'false',
				description: '链接分支复用ZLink的显式外链图标。'
			},
			{
				name: 'newWindowLabel',
				type: 'string',
				default: 'undefined',
				description: '链接target=_blank时覆盖ZLink的本地化隐藏提示。'
			},
			{
				name: 'ref',
				type: 'HTMLElement | null',
				bindable: true,
				default: 'null',
				description: '真实主导航元素引用。'
			},
			{
				name: 'disclosureRef',
				type: 'HTMLButtonElement | null',
				bindable: true,
				default: 'null',
				description: '真实展开按钮引用。'
			}
		],
		snippets: [
			{
				name: 'labelContent',
				type: 'Snippet',
				description: '富文本可见标签；不替换必填label的命名职责。'
			},
			{ name: 'start', type: 'Snippet', description: '标签之前的图标或内容。' },
			{ name: 'end', type: 'Snippet', description: '标签之后、内置展开箭头之前的状态或内容。' }
		],
		states: [
			{ name: 'data-active', values: ['true'], description: '当前页；与expanded独立。' },
			{
				name: 'data-expanded',
				values: ['true', 'false'],
				description: '拥有子级时的受控展开状态。'
			},
			{ name: 'data-disabled', values: ['true'], description: '导航与展开均不可操作。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的控件尺寸。'
			},
			{ name: 'data-variant', values: ['subtle', 'solid', 'outline'], description: '导航行外观。' },
			{ name: 'data-compact', values: ['true'], description: '折叠导航的紧凑图标/首字符形态。' },
			{
				name: 'data-tone',
				values: ['primary', 'neutral', 'info', 'success', 'warning', 'danger'],
				description: '导航行色调。'
			},
			{
				name: 'data-indicator',
				values: ['none', 'start', 'end'],
				description: '当前页指示器位置。'
			}
		]
	} as const satisfies ZuiComponentMetadata;

	function toneStyles(tone: NavLinkTone): IcssFactory<ZuiTheme> {
		const color = `_${tone}` as const;
		const subtle = `_${tone}Subtle` as const;
		const onColor = {
			primary: '_onPrimary',
			neutral: '_onNeutral',
			info: '_onInfo',
			success: '_onSuccess',
			warning: '_onWarning',
			danger: '_onDanger'
		} as const;
		return (s) => {
			s._selector('&[data-active="true"]', (s) => {
				s.backgroundColor[subtle];
				s.color[color];
				s.fontWeight._semibold;
				s._selector('&[data-variant="outline"]', (s) => s.borderColor[color]);
				s._selector('&[data-variant="solid"]', (s) => {
					s.backgroundColor[color];
					s.borderColor[color];
					s.color[onColor[tone]];
				});
				s._selector('& > [data-slot="active-indicator"]', (s) => {
					s.backgroundColor[color];
				});
				s._selector('&[data-variant="solid"] > [data-slot="active-indicator"]', (s) => {
					s.backgroundColor[onColor[tone]];
				});
			});
		};
	}

	function squareSize(size: ZControlSize): IcssFactory<ZuiTheme> {
		const token = `_${size}` as const;
		return (s) => {
			controlSizeStyles[size](s);
			s.height[token];
			s.minHeight[token];
			s.paddingBlock.px(0);
			s.paddingInline.px(0);
			s.width[token];
		};
	}

	function primarySize(size: ZControlSize, padding: IcssFactory<ZuiTheme>): IcssFactory<ZuiTheme> {
		const token = `_${size}` as const;
		return (s) => {
			controlSizeStyles[size](s);
			padding(s);
			s._selector('&[data-compact="true"]', (s) => {
				s.boxSizing.borderBox;
				s.height[token];
				s.minHeight[token];
				s.paddingBlock.px(0);
				s.width[token];
			});
		};
	}

	const navLinkRecipe = defineSlotRecipe(
		{
			slots: [
				'row',
				'primary',
				'indicator',
				'start',
				'content',
				'label',
				'description',
				'end',
				'disclosure',
				'disclosureIcon'
			] as const,
			base: {
				row: (s) => {
					s.alignItems.stretch;
					s.display.grid;
					s.gap._xsmall;
					s.gridTemplateColumns.raw('minmax(0, 1fr) auto');
					s.minWidth.px(0);
					s.width.percent(100);
				},
				primary: (s) => {
					s.alignItems.center;
					s.appearance.none;
					s.backgroundColor.transparent;
					s.borderColor.transparent;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxSizing.borderBox;
					s.color._text;
					s.display.flex;
					s.font.inherit;
					s.fontFamily._sans;
					s.gap._medium;
					s.lineHeight._normal;
					s.maxWidth.percent(100);
					s.minWidth.px(0);
					s.overflowWrap.anywhere;
					s.position.relative;
					s.textAlign.start;
					s.textDecoration.none;
					s.transitionDuration._fast;
					s.transitionProperty.raw('background-color, border-color, color, opacity');
					s.transitionTimingFunction._standard;
					s.width.percent(100);
					s._selector('&:is(a, button):not(:disabled):not([aria-disabled="true"])', (s) => {
						s.cursor.pointer;
						s._hover((s) => s.backgroundColor._surfaceHover);
					});
					s._selector('&[aria-disabled="true"], &:disabled', (s) => {
						s.cursor.notAllowed;
						s.opacity._disabled;
					});
					s._focusVisible((s) => {
						s.outlineColor._focus;
						s.outlineOffset._outer;
						s.outlineStyle.solid;
						s.outlineWidth._medium;
					});
				},
				indicator: (s) => {
					s.blockSize.percent(60);
					s.borderRadius._small;
					s.inlineSize.raw('var(--zui-nav-link-indicator-width)');
					s.insetBlockStart.percent(20);
					s.pointerEvents.none;
					s.position.absolute;
					s._selector('[data-indicator="start"] > &', (s) => s.insetInlineStart.px(0));
					s._selector('[data-indicator="end"] > &', (s) => s.insetInlineEnd.px(0));
				},
				start: (s) => {
					s.alignItems.center;
					s.display.inlineFlex;
					s.flexShrink(0);
				},
				content: (s) => {
					s.flexGrow(1);
					s.minWidth.px(0);
				},
				label: (s) => {
					s.display.block;
					s.overflowWrap.anywhere;
				},
				description: (s) => {
					s.color._textMuted;
					s.display.block;
					s.fontWeight._normal;
					s.marginBlockStart._xsmall;
					s.overflowWrap.anywhere;
				},
				end: (s) => {
					s.alignItems.center;
					s.display.inlineFlex;
					s.flexShrink(0);
				},
				disclosure: (s) => {
					s.alignItems.center;
					s.appearance.none;
					s.backgroundColor.transparent;
					s.borderColor.transparent;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxSizing.borderBox;
					s.color._textMuted;
					s.cursor.pointer;
					s.display.inlineFlex;
					s.justifyContent.center;
					s.transitionDuration._fast;
					s.transitionProperty.raw('background-color, color, opacity');
					s.transitionTimingFunction._standard;
					s._selector('&:not(:disabled):hover', (s) => {
						s.backgroundColor._surfaceHover;
						s.color._primary;
					});
					s._selector('&:disabled', (s) => {
						s.cursor.notAllowed;
						s.opacity._disabled;
					});
					s._focusVisible((s) => {
						s.outlineColor._focus;
						s.outlineOffset._outer;
						s.outlineStyle.solid;
						s.outlineWidth._medium;
					});
				},
				disclosureIcon: (s) => {
					s.display.inlineFlex;
					s.transitionDuration._fast;
					s.transitionProperty.raw('transform');
					s.transitionTimingFunction._standard;
					s._selector('[aria-expanded="true"] > &', (s) => s.transform.raw('rotate(90deg)'));
					s._selector('[data-direction="rtl"][aria-expanded="true"] > &', (s) =>
						s.transform.raw('rotate(-90deg)')
					);
				}
			},
			variants: {
				compact: {
					false: {},
					true: {
						row: (s) => s.width.fitContent,
						primary: (s) => {
							s.flexShrink(0);
							s.justifyContent.center;
							s.paddingInline.px(0);
						}
					}
				},
				variant: {
					subtle: {},
					solid: { primary: (s) => s.backgroundColor._surface },
					outline: {
						primary: (s) => {
							s.backgroundColor._surface;
							s.borderColor._border;
						}
					}
				},
				motion: {
					full: {},
					reduced: {
						primary: (s) => s.transitionDuration.ms(0),
						disclosure: (s) => s.transitionDuration.ms(0),
						disclosureIcon: (s) => s.transitionDuration.ms(0)
					}
				},
				size: {
					xsmall: {
						primary: primarySize('xsmall', (s) => s.paddingBlock._xsmall),
						disclosure: squareSize('xsmall'),
						description: (s) => s.fontSize._xsmall
					},
					small: {
						primary: primarySize('small', (s) => s.paddingBlock._xsmall),
						disclosure: squareSize('small'),
						description: (s) => s.fontSize._xsmall
					},
					medium: {
						primary: primarySize('medium', (s) => s.paddingBlock._small),
						disclosure: squareSize('medium'),
						description: (s) => s.fontSize._small
					},
					large: {
						primary: primarySize('large', (s) => s.paddingBlock._small),
						disclosure: squareSize('large'),
						description: (s) => s.fontSize._medium
					},
					xlarge: {
						primary: primarySize('xlarge', (s) => s.paddingBlock._medium),
						disclosure: squareSize('xlarge'),
						description: (s) => s.fontSize._large
					}
				},
				tone: {
					primary: { primary: toneStyles('primary') },
					neutral: { primary: toneStyles('neutral') },
					info: { primary: toneStyles('info') },
					success: { primary: toneStyles('success') },
					warning: { primary: toneStyles('warning') },
					danger: { primary: toneStyles('danger') }
				}
			},
			defaultVariants: {
				compact: false,
				motion: 'full',
				size: 'medium',
				tone: 'primary',
				variant: 'subtle'
			}
		},
		import.meta
	);
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { tick, untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		controlSizeMetrics,
		controlSizes,
		resolveControlSize
	} from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { cssLength } from '../../theme/units.js';
	import {
		containsComposedNode,
		getActiveElement,
		getElementDirection,
		isDomHtmlElement
	} from '../../runtime/layer/dom-realm.js';
	import ZLink from '../gene/ZLink.svelte';

	let {
		'aria-label': ariaLabel,
		active = false,
		class: className,
		compact = false,
		contentId,
		description,
		disabled = false,
		disclosureId,
		disclosureRef = $bindable(null),
		disclosureLabel,
		download,
		end,
		expanded,
		external = false,
		href,
		hreflang,
		id: nativeId,
		indicator: indicatorProp,
		label,
		labelContent,
		media,
		newWindowLabel,
		onclick,
		onkeydown,
		onExpandedChange,
		ping,
		ref = $bindable(null),
		referrerpolicy,
		rel,
		size,
		start,
		style,
		target,
		tone: toneProp,
		type,
		variant: variantProp,
		...rest
	}: ZNavLinkProps = $props();

	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.navLink);
	const indicator = $derived(indicatorProp ?? defaults?.indicator ?? 'start');
	const tone = $derived(toneProp ?? defaults?.tone ?? 'primary');
	const variant = $derived(variantProp ?? defaults?.variant ?? 'subtle');
	const motion = new ReducedMotionState(() => zui.motion);
	let row = $state<HTMLDivElement | null>(null);
	let anchor = $state<HTMLAnchorElement | null>(null);
	let primaryButton = $state<HTMLButtonElement | null>(null);
	let passive = $state<HTMLDivElement | null>(null);
	let siblingDisclosure = $state<HTMLButtonElement | null>(null);
	const expandable = $derived(expanded !== undefined || onExpandedChange !== undefined);
	const resolvedExpanded = $derived(expanded === true);
	const resolvedSize = $derived(
		resolveControlSize(size ?? defaults?.size ?? zui.componentDefaults.link?.size, zui.density)
	);
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const validated = $derived.by(() => {
		if (typeof label !== 'string' || !label.trim())
			throw new TypeError('ZNavLink label must be a non-empty string.');
		if (description !== undefined && typeof description !== 'string')
			throw new TypeError('ZNavLink description must be a string.');
		if (href !== undefined && (typeof href !== 'string' || !href.trim()))
			throw new TypeError('ZNavLink href must be a non-empty string when provided.');
		if (contentId !== undefined && (typeof contentId !== 'string' || !contentId.trim()))
			throw new TypeError('ZNavLink contentId must be a non-empty string when provided.');
		if (disclosureId !== undefined && (typeof disclosureId !== 'string' || !disclosureId.trim()))
			throw new TypeError('ZNavLink disclosureId must be a non-empty string when provided.');
		if (!['subtle', 'solid', 'outline'].includes(variant))
			throw new TypeError('ZNavLink variant must be subtle, solid or outline.');
		if (!['none', 'start', 'end'].includes(indicator))
			throw new TypeError('ZNavLink indicator must be none, start or end.');
		if (!['primary', 'neutral', 'info', 'success', 'warning', 'danger'].includes(tone))
			throw new TypeError('ZNavLink tone must be primary or a semantic tone.');
		if (!controlSizes.includes(resolvedSize))
			throw new TypeError('ZNavLink size must be one of the five control sizes.');
		return true;
	});
	const classes = $derived.by(() => {
		void validated;
		return zui.slots(navLinkRecipe, {
			compact,
			motion: motion.current ? 'reduced' : 'full',
			size: resolvedSize,
			tone,
			variant
		});
	});
	const internalVariables = $derived({
		'--zui-nav-link-indicator-width': cssLength(zui.theme.borderWidth.medium)
	} as const);
	const icssVariables = $derived({
		...readIcssCarrier(rest),
		...internalVariables
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const linkStyle = $derived(mergeStyles(style, serializeIcssVariables(internalVariables)));
	const compactFallback = $derived(Array.from(label.trim())[0] ?? '');
	const resolvedAccessibleName = $derived(
		ariaLabel ?? (compact || labelContent ? label : undefined)
	);

	$effect(() => {
		const primary = href !== undefined ? anchor : expandable ? primaryButton : passive;
		const disclosure = expandable ? (href !== undefined ? siblingDisclosure : primaryButton) : null;
		ref = primary;
		disclosureRef = disclosure;
		return () => {
			if (ref === primary) ref = null;
			if (disclosureRef === disclosure) disclosureRef = null;
		};
	});
	$effect(() => motion.connect(ref?.ownerDocument.defaultView));

	function callNativeClick(event: MouseEvent & { currentTarget: HTMLElement }): void {
		onclick?.(event);
	}

	async function requestExpanded(
		next: boolean,
		event: MouseEvent | KeyboardEvent,
		fallbackOnRemoval = false
	): Promise<void> {
		if (disabled || next === resolvedExpanded) return;
		const trigger = isDomHtmlElement(event.currentTarget) ? event.currentTarget : null;
		const focusedInside = trigger
			? containsComposedNode(row ?? trigger, getActiveElement(trigger))
			: false;
		onExpandedChange?.(next);
		if (!fallbackOnRemoval || !focusedInside || !trigger) return;
		await tick();
		if (!trigger.isConnected) ref?.focus();
	}

	function handlePrimaryClick(event: MouseEvent & { currentTarget: HTMLElement }): void {
		callNativeClick(event);
		if (event.defaultPrevented || href !== undefined || !expandable) return;
		void requestExpanded(!resolvedExpanded, event);
	}

	function handleDisclosureClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		void requestExpanded(!resolvedExpanded, event, true);
	}

	function handleDisclosureKeydown(
		event: KeyboardEvent & { currentTarget: HTMLButtonElement }
	): void {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return;
		const direction = getElementDirection(ref, zui.direction);
		const openKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
		const closeKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
		const next = event.key === openKey ? true : event.key === closeKey ? false : undefined;
		if (next === undefined || next === resolvedExpanded) return;
		event.preventDefault();
		void requestExpanded(next, event, true);
	}

	function handlePrimaryKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented) handleDisclosureKeydown(event);
	}
</script>

{#snippet contents(showDisclosure: boolean)}
	{#if active && indicator !== 'none'}
		<span aria-hidden="true" class={classes.indicator} data-slot="active-indicator"></span>
	{/if}
	{#if start}<span class={classes.start} data-slot="start">{@render start()}</span>{/if}
	{#if compact}
		{#if !start}<span aria-hidden="true" class={classes.label} data-slot="compact-fallback"
				>{compactFallback}</span
			>{/if}
	{:else}
		<span class={classes.content} data-slot="content">
			<span class={classes.label} data-slot="label">
				{#if labelContent}{@render labelContent()}{:else}{label}{/if}
			</span>
			{#if description?.trim()}<span class={classes.description} data-slot="description"
					>{description}</span
				>{/if}
		</span>
		{#if end}<span class={classes.end} data-slot="end">{@render end()}</span>{/if}
	{/if}
	{#if showDisclosure}
		<span aria-hidden="true" class={classes.disclosureIcon} data-slot="disclosure-icon">
			{#if getElementDirection(ref, zui.direction) === 'rtl'}
				<ChevronLeft size={metrics.indicatorSize} />
			{:else}
				<ChevronRight size={metrics.indicatorSize} />
			{/if}
		</span>
	{/if}
{/snippet}

{#if href !== undefined && expandable}
	<div bind:this={row} class={classes.row} data-slot="row" data-expanded={resolvedExpanded}>
		<ZLink
			{...rest}
			bind:ref={anchor}
			appearance="navigation"
			aria-current={active ? 'page' : undefined}
			aria-label={resolvedAccessibleName}
			class={[classes.primary, className]}
			data-active={active || undefined}
			data-compact={compact || undefined}
			data-disabled={disabled || undefined}
			data-expanded={resolvedExpanded}
			data-indicator={indicator}
			data-size={resolvedSize}
			data-slot="primary"
			data-tone={tone}
			data-variant={variant}
			{disabled}
			{download}
			{external}
			{href}
			{hreflang}
			id={nativeId}
			{media}
			{newWindowLabel}
			onclick={handlePrimaryClick}
			{onkeydown}
			{ping}
			{referrerpolicy}
			{rel}
			style={linkStyle}
			size={resolvedSize}
			{target}
			{type}
		>
			{@render contents(false)}
		</ZLink>
		<button
			bind:this={siblingDisclosure}
			type="button"
			id={disclosureId}
			class={classes.disclosure}
			data-slot="disclosure"
			data-direction={getElementDirection(ref, zui.direction)}
			{disabled}
			aria-controls={contentId}
			aria-expanded={resolvedExpanded}
			aria-label={disclosureLabel ?? label}
			onclick={handleDisclosureClick}
			onkeydown={handleDisclosureKeydown}
		>
			<span aria-hidden="true" class={classes.disclosureIcon} data-slot="disclosure-icon">
				{#if getElementDirection(ref, zui.direction) === 'rtl'}
					<ChevronLeft size={metrics.indicatorSize} />
				{:else}
					<ChevronRight size={metrics.indicatorSize} />
				{/if}
			</span>
		</button>
	</div>
{:else if href !== undefined}
	<ZLink
		{...rest}
		bind:ref={anchor}
		appearance="navigation"
		aria-current={active ? 'page' : undefined}
		aria-label={resolvedAccessibleName}
		class={[classes.primary, className]}
		data-active={active || undefined}
		data-compact={compact || undefined}
		data-disabled={disabled || undefined}
		data-indicator={indicator}
		data-size={resolvedSize}
		data-slot="primary"
		data-tone={tone}
		data-variant={variant}
		{disabled}
		{download}
		{external}
		{href}
		{hreflang}
		id={nativeId}
		{media}
		{newWindowLabel}
		onclick={handlePrimaryClick}
		{onkeydown}
		{ping}
		{referrerpolicy}
		{rel}
		style={linkStyle}
		size={resolvedSize}
		{target}
		{type}
	>
		{@render contents(false)}
	</ZLink>
{:else if expandable}
	<button
		{...rest}
		bind:this={primaryButton}
		type="button"
		id={disclosureId ?? nativeId}
		class={[classes.primary, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		{disabled}
		aria-controls={contentId}
		aria-current={active ? 'page' : undefined}
		aria-expanded={resolvedExpanded}
		aria-label={resolvedAccessibleName}
		data-active={active || undefined}
		data-compact={compact || undefined}
		data-disabled={disabled || undefined}
		data-direction={getElementDirection(ref, zui.direction)}
		data-expanded={resolvedExpanded}
		data-indicator={indicator}
		data-size={resolvedSize}
		data-slot="primary"
		data-tone={tone}
		data-variant={variant}
		onclick={handlePrimaryClick}
		onkeydown={handlePrimaryKeydown}
	>
		{@render contents(true)}
	</button>
{:else}
	<div
		{...rest}
		bind:this={passive}
		id={nativeId}
		class={[classes.primary, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		aria-current={active ? 'page' : undefined}
		aria-disabled={disabled || undefined}
		aria-label={resolvedAccessibleName}
		data-active={active || undefined}
		data-compact={compact || undefined}
		data-disabled={disabled || undefined}
		data-indicator={indicator}
		data-size={resolvedSize}
		data-slot="primary"
		data-tone={tone}
		data-variant={variant}
		onclick={callNativeClick}
		{onkeydown}
	>
		{@render contents(false)}
	</div>
{/if}
