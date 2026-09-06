<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { buttonRecipe, type ButtonSize, type ButtonVariant } from './ZButton.svelte';
	import { controlSizeStyles, resolveControlSize } from '../../runtime/foundation/control-size.js';

	import { typographyTones, type TypographyTone } from './typography.js';

	export type ZLinkTone = TypographyTone;
	export type ZLinkUnderline = 'always' | 'hover' | 'none';

	export interface ZLinkProps extends Omit<HTMLAnchorAttributes, 'children' | 'href'> {
		readonly appearance?: 'text' | 'button' | 'navigation';
		readonly size?: ButtonSize;
		readonly variant?: ButtonVariant;
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly external?: boolean;
		readonly href: string;
		readonly newWindowLabel?: string;
		readonly tone?: ZLinkTone;
		readonly underline?: ZLinkUnderline;
		ref?: HTMLAnchorElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实anchor元素引用。', name: 'ref', type: 'HTMLAnchorElement | null' }
		],
		category: 'gene',
		dependencies: ['ZVisuallyHidden', '@lucide/svelte/icons/external-link', 'typed locale'],
		events: [
			{
				description: '原生click；disabled时不会调用并会阻止导航和冒泡。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLAnchorElement>'
			}
		],
		id: 'link',
		importStatement: "import { ZLink } from '@zadmin/zui';",
		keyboard: [{ description: '未禁用时由真实anchor使用Enter跟随href。', key: 'Enter' }],
		name: 'ZLink',
		parts: [
			{ description: 'external=true时的装饰性Lucide图标。', name: 'external-icon' },
			{ description: 'target=_blank时的本地化隐藏提示或说明。', name: 'new-window-hint' }
		],
		props: [
			{
				default: "componentDefaults.link.appearance → 'text'",
				description:
					'文本、链接按钮或导航项；始终保留anchor语义，navigation从aria-current派生当前项视觉。',
				name: 'appearance',
				type: "'text' | 'button' | 'navigation'"
			},
			{
				default: 'componentDefaults.link.size → 按钮外观时button.size → Provider density',
				description: '按钮和导航链接的控件尺寸。',
				name: 'size',
				type: 'ButtonSize'
			},
			{
				default: "componentDefaults.link.variant → 按钮外观时button.variant → 'solid'",
				description: '链接按钮的视觉层级；仅appearance=button时使用。',
				name: 'variant',
				type: 'ButtonVariant'
			},
			{
				default: '必填',
				description: '真实anchor目标；禁用时暂不写入DOM，但公开合同仍要求提供。',
				name: 'href',
				required: true,
				type: 'string'
			},
			{
				default: 'false',
				description: '显式展示Lucide external-link；不会自动设置target=_blank。',
				name: 'external',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.link.opensInNewWindow',
				description: 'target=_blank时提供本地化隐藏提示；显式名称存在时通过describedby关联。',
				name: 'newWindowLabel',
				type: 'string'
			},
			{
				default: 'false',
				description: '移除href/target/rel与Tab停靠，并阻止click导航和冒泡。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "componentDefaults.link.tone → 按钮外观时button.tone → 'primary'",
				description:
					'文本和按钮链接支持五种语义色及primary；muted用于正文，在按钮外观映射为neutral。navigation由aria-current决定颜色。',
				name: 'tone',
				type: 'ZLinkTone'
			},
			{
				default: "componentDefaults.link.underline → 'always'",
				description: '仅文本链接的下划线显示策略；默认不只依赖颜色识别链接。',
				name: 'underline',
				type: "'always' | 'hover' | 'none'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实anchor元素引用。',
				name: 'ref',
				type: 'HTMLAnchorElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '描述目标的链接内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZLink.svelte',
		states: [
			{ description: '链接不可导航。', name: 'data-disabled', values: ['true'] },
			{ description: '显式外链视觉。', name: 'data-external', values: ['true'] },
			{ description: '在新浏览上下文打开。', name: 'data-new-window', values: ['true'] }
		],
		status: 'stable',
		summary:
			'保持必填href和真实anchor语义，显式区分外链视觉、新窗口安全提示与不可导航disabled状态。'
	} as const satisfies ZuiComponentMetadata;

	const linkRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.inlineFlex;
			s.gap._xsmall;
			s.maxWidth.percent(100);
			s.overflowWrap.anywhere;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			tone: typographyTones,
			underline: {
				always: (s) => s.textDecoration.underline,
				hover: (s) => {
					s.textDecoration.none;
					s._selector(
						'&:not(:disabled):not([aria-disabled="true"]):hover',
						(hover) => hover.textDecoration.underline
					);
				},
				none: (s) => s.textDecoration.none
			}
		},
		defaultVariants: { disabled: false, tone: 'primary', underline: 'always' }
	});
	const externalIconRecipe = defineRecipe({
		base: (s) => s.flexShrink(0),
		variants: {},
		defaultVariants: {}
	});
	const buttonLinkRecipe = defineRecipe({
		base: (s) => {
			s.textDecoration.none;
			s.gap._medium;
		},
		variants: {}
	});
	const navigationRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.boxSizing.borderBox;
			s.borderInlineStartColor.transparent;
			s.borderInlineStartStyle.solid;
			s.borderInlineStartWidth._medium;
			s.borderRadius._medium;
			s.color._textMuted;
			s.display.flex;
			s.fontFamily._sans;
			s.lineHeight._normal;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.minWidth.px(0);
			s.textDecoration.none;
			s._selector('&:not(:disabled):not([aria-disabled="true"]):hover', (hover) => {
				hover.backgroundColor._surfaceHover;
				hover.color._primaryHover;
			});
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
				focus.outlineOffset._outer;
			});
		},
		variants: {
			size: {
				xsmall: (s) => {
					controlSizeStyles.xsmall(s);
					s.paddingBlock._xsmall;
				},
				small: (s) => {
					controlSizeStyles.small(s);
					s.paddingBlock._xsmall;
				},
				medium: (s) => {
					controlSizeStyles.medium(s);
					s.paddingBlock._small;
				},
				large: (s) => {
					controlSizeStyles.large(s);
					s.paddingBlock._small;
				},
				xlarge: (s) => {
					controlSizeStyles.xlarge(s);
					s.paddingBlock._small;
				}
			},
			current: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primarySubtle;
					s.borderInlineStartColor._accent;
					s.color._primary;
					s.fontWeight._semibold;
					s._selector('&:not(:disabled):not([aria-disabled="true"]):hover', (hover) => {
						hover.backgroundColor._primarySubtleHover;
						hover.color._primaryHover;
					});
				}
			},
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.opacity._disabled;
					s.cursor.notAllowed;
				}
			}
		},
		defaultVariants: { size: 'medium', current: false, disabled: false }
	});

	registerRecipeHmr(import.meta, linkRecipe);
	registerRecipeHmr(import.meta, externalIconRecipe);
	registerRecipeHmr(import.meta, buttonLinkRecipe);
	registerRecipeHmr(import.meta, navigationRecipe);
</script>

<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { untrack } from 'svelte';
	import { captureClick } from '../../runtime/foundation/capture-click.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import ZVisuallyHidden from './ZVisuallyHidden.svelte';
	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';

	let {
		'aria-current': ariaCurrent,
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		appearance,
		class: className,
		disabled = false,
		external = false,
		href,
		newWindowLabel,
		onclick,
		ref = $bindable(null),
		rel,
		style,
		size,
		tabindex,
		target,
		tone,
		underline,
		variant,
		...rest
	}: ZLinkProps = $props();
	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.link);
	const resolvedAppearance = $derived(
		resolveComponentDefault(appearance, defaults?.appearance, 'text')
	);
	const sharedDefaults = $derived(
		resolvedAppearance === 'button' ? zui.componentDefaults.button : undefined
	);
	const resolvedTone = $derived(
		resolveComponentDefault(tone, defaults?.tone ?? sharedDefaults?.tone, 'primary')
	);
	const resolvedVariant = $derived(
		resolveComponentDefault(variant, defaults?.variant ?? sharedDefaults?.variant, 'solid')
	);
	const resolvedUnderline = $derived(
		resolveComponentDefault(underline, defaults?.underline, 'always')
	);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	$effect(() => {
		if (resolvedAppearance === 'button' && ref)
			return reducedMotion.connect(ref.ownerDocument.defaultView);
	});
	const uid = $props.id();
	const hintId = $derived(createZuiId(zui.idPrefix, uid, 'link-new-window'));
	const targetBlank = $derived(target?.toLowerCase() === '_blank');
	const newWindow = $derived(!disabled && targetBlank);
	const explicitAccessibleName = $derived(Boolean(ariaLabel?.trim() || ariaLabelledBy?.trim()));
	const resolvedNewWindowLabel = $derived(newWindowLabel ?? zui.localePack.link.opensInNewWindow);
	const resolvedRel = $derived.by(() => {
		if (disabled) return undefined;
		let tokens = (rel ?? '').trim().split(/\s+/u).filter(Boolean);
		if (targetBlank) {
			tokens = tokens.filter((token) => token.toLowerCase() !== 'opener');
			const lower = new Set(tokens.map((token) => token.toLowerCase()));
			if (!lower.has('noopener')) tokens.push('noopener');
			if (!lower.has('noreferrer')) tokens.push('noreferrer');
		}
		return tokens.length > 0 ? tokens.join(' ') : undefined;
	});
	const resolvedDescribedBy = $derived(
		[ariaDescribedBy, newWindow && explicitAccessibleName ? hintId : undefined]
			.filter(Boolean)
			.join(' ') || undefined
	);
	const resolvedSize = $derived(
		resolveControlSize(
			resolveComponentDefault(size, defaults?.size ?? sharedDefaults?.size, undefined),
			zui.density
		)
	);
	const rootClass = $derived(
		resolvedAppearance === 'button'
			? [
					zui.recipe(buttonRecipe, {
						disabled,
						size: resolvedSize,
						variant: resolvedVariant,
						tone: resolvedTone === 'muted' ? 'neutral' : resolvedTone,
						motion: reducedMotion.current ? 'reduced' : 'full'
					}),
					zui.recipe(buttonLinkRecipe)
				]
			: resolvedAppearance === 'navigation'
				? zui.recipe(navigationRecipe, {
						disabled,
						size: resolvedSize,
						current: Boolean(ariaCurrent && ariaCurrent !== 'false')
					})
				: zui.recipe(linkRecipe, { disabled, tone: resolvedTone, underline: resolvedUnderline })
	);
	const externalIconClass = $derived(zui.recipe(externalIconRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleClick(event: MouseEvent & { currentTarget: HTMLAnchorElement }): void {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}

	function interceptDisabledClick(event: MouseEvent): void {
		if (!disabled) return;
		event.preventDefault();
		event.stopPropagation();
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- library links preserve caller-owned native and external hrefs -->
<a
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	use:captureClick={interceptDisabledClick}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={disabled ? 'true' : undefined}
	aria-current={ariaCurrent}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledBy}
	data-disabled={disabled || undefined}
	data-appearance={resolvedAppearance}
	data-variant={resolvedAppearance === 'button' ? resolvedVariant : undefined}
	data-tone={resolvedAppearance !== 'navigation' ? resolvedTone : undefined}
	data-size={resolvedAppearance !== 'text' ? resolvedSize : undefined}
	data-external={external || undefined}
	data-new-window={newWindow || undefined}
	href={disabled ? undefined : href}
	onclick={handleClick}
	rel={resolvedRel}
	tabindex={disabled ? -1 : tabindex}
	target={disabled ? undefined : target}
>
	{@render children?.()}
	{#if external}
		<ExternalLink
			aria-hidden="true"
			class={externalIconClass}
			data-slot="external-icon"
			size={14}
		/>
	{/if}
	{#if newWindow}
		<ZVisuallyHidden id={hintId} data-slot="new-window-hint">
			({resolvedNewWindowLabel})
		</ZVisuallyHidden>
	{/if}
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
