<script module lang="ts">
	import {
		disabledControlStyles,
		nativeDisabledControlStyles
	} from '../../runtime/foundation/control-styles.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { IcssFactory } from '../../icss/types.js';
	import type { ZuiTheme } from '../../theme/types.js';
	import type { ZSemanticTone } from '../../theme/semantics.js';
	import type { RecipeVariants } from '../../recipes/types.js';
	import {
		controlSizeStyles,
		resolveControlSize,
		type ZControlSize
	} from '../../runtime/foundation/control-size.js';

	export type ButtonSize = ZControlSize;
	export type ButtonShape = 'circle' | 'default' | 'square';
	export type ButtonTone = ZSemanticTone | 'primary';
	export type ButtonVariant = 'ghost' | 'solid' | 'outline';

	export interface ButtonDesignProps {
		disabled?: boolean;
		loading?: boolean;
		shape?: ButtonShape;
		size?: ButtonSize;
		tone?: ButtonTone;
		variant?: ButtonVariant;
	}

	function buttonTone(tone: ButtonTone): IcssFactory<ZuiTheme> {
		const color = `_${tone}` as const;
		const hover = `_${tone}Hover` as const;
		const subtle = `_${tone}Subtle` as const;
		const onColor = {
			primary: '_onPrimary',
			neutral: '_onNeutral',
			info: '_onInfo',
			success: '_onSuccess',
			warning: '_onWarning',
			danger: '_onDanger'
		} as const;
		const interactive = ':not(:disabled):not([aria-disabled="true"])';
		const pressed = ':is([aria-pressed="true"], [aria-pressed="mixed"])';
		return (s) => {
			s._selector('&[data-variant="solid"]', (solid) => {
				solid.backgroundColor[color];
				solid.borderColor[color];
				solid.color[onColor[tone]];
				solid._selector(`&${interactive}:hover, &${pressed}`, (active) => {
					active.backgroundColor[hover];
					active.borderColor[hover];
				});
			});
			s._selector('&[data-variant="outline"]', (outline) => {
				outline.backgroundColor._canvas;
				outline.borderColor[tone === 'neutral' ? '_border' : color];
				outline.color[color];
				outline._selector(`&${interactive}:hover`, (active) => active.backgroundColor[subtle]);
				outline._selector(`&${pressed}`, (active) => {
					active.backgroundColor[color];
					active.borderColor[color];
					active.color[onColor[tone]];
				});
			});
			s._selector('&[data-variant="ghost"]', (ghost) => {
				ghost.backgroundColor.transparent;
				ghost.borderColor.transparent;
				ghost.color[color];
				ghost._selector(
					`&${interactive}:hover, &${pressed}`,
					(active) => active.backgroundColor[subtle]
				);
				ghost._selector(`&${pressed}`, (active) => active.borderColor[color]);
			});
		};
	}

	/** Shared visual recipe for native buttons and button-shaped links. */
	export const buttonRecipe = defineRecipe({
		base: (s) => {
			nativeDisabledControlStyles(s);
			s.display.inlineFlex;
			s.alignItems.center;
			s.justifyContent.center;
			s.boxSizing.borderBox;
			s.borderWidth._hairline;
			s.borderStyle.solid;
			s.borderRadius._medium;
			s.fontWeight._semibold;
			s.fontFamily._sans;
			s.lineHeight(1);
			s.position.relative;
			s.cursor.pointer;
			s.transitionDuration._fast;
			s.transitionProperty.raw('background-color, border-color, color, opacity');
			s.transitionTimingFunction._standard;
			s.userSelect.none;
			s._focusVisible((focus) => {
				focus.outlineWidth._medium;
				focus.outlineStyle.solid;
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: disabledControlStyles
			},
			fullWidth: { false: () => undefined, true: (s) => s.width.percent(100) },
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			size: {
				xsmall: (s) => {
					controlSizeStyles.xsmall(s);
					s.paddingBlock.px(0);
					s._selector('&[data-shape="square"], &[data-shape="circle"]', (shape) => {
						shape.height._xsmall;
						shape.width._xsmall;
						shape.paddingInline.px(0);
					});
				},
				small: (s) => {
					controlSizeStyles.small(s);
					s.paddingBlock.px(0);
					s._selector('&[data-shape="square"], &[data-shape="circle"]', (shape) => {
						shape.height._small;
						shape.width._small;
						shape.paddingInline.px(0);
					});
				},
				medium: (s) => {
					controlSizeStyles.medium(s);
					s.paddingBlock.px(0);
					s._selector('&[data-shape="square"], &[data-shape="circle"]', (shape) => {
						shape.height._medium;
						shape.width._medium;
						shape.paddingInline.px(0);
					});
				},
				large: (s) => {
					controlSizeStyles.large(s);
					s.paddingBlock.px(0);
					s._selector('&[data-shape="square"], &[data-shape="circle"]', (shape) => {
						shape.height._large;
						shape.width._large;
						shape.paddingInline.px(0);
					});
				},
				xlarge: (s) => {
					controlSizeStyles.xlarge(s);
					s.paddingBlock.px(0);
					s._selector('&[data-shape="square"], &[data-shape="circle"]', (shape) => {
						shape.height._xlarge;
						shape.width._xlarge;
						shape.paddingInline.px(0);
					});
				}
			},
			shape: {
				circle: (s) => {
					s.borderRadius.percent(50);
					s.flexShrink(0);
				},
				default: () => undefined,
				square: (s) => s.flexShrink(0)
			},
			pressed: { false: () => undefined, true: () => undefined },
			tone: {
				primary: buttonTone('primary'),
				neutral: buttonTone('neutral'),
				info: buttonTone('info'),
				success: buttonTone('success'),
				warning: buttonTone('warning'),
				danger: buttonTone('danger')
			},
			variant: { solid: () => undefined, outline: () => undefined, ghost: () => undefined }
		},
		defaultVariants: {
			disabled: false,
			fullWidth: false,
			motion: 'auto',
			pressed: false,
			shape: 'default',
			size: 'medium',
			tone: 'primary',
			variant: 'solid'
		}
	});
	const buttonContentRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.gap._small;
			s.justifyContent.center;
		},
		variants: {
			loading: {
				false: () => undefined,
				true: (s) => {
					s.opacity(0);
					s.pointerEvents.none;
				}
			}
		},
		defaultVariants: { loading: false }
	});
	const buttonLoadingRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.inset.px(0);
			s.justifyContent.center;
			s.position.absolute;
		},
		variants: {}
	});

	registerRecipeHmr(import.meta, buttonRecipe);
	registerRecipeHmr(import.meta, buttonContentRecipe);
	registerRecipeHmr(import.meta, buttonLoadingRecipe);

	export type ZButtonVariants = Omit<
		RecipeVariants<typeof buttonRecipe>,
		'disabled' | 'motion' | 'pressed'
	>;

	export type ZButtonProps = Omit<HTMLButtonAttributes, 'children' | 'disabled'> &
		ZButtonVariants & {
			readonly children?: Snippet;
			readonly disabled?: boolean;
			readonly end?: Snippet;
			readonly loading?: boolean;
			readonly loadingIndicator?: Snippet;
			readonly loadingLabel?: string;
			readonly start?: Snippet;
			ref?: HTMLButtonElement | null;
		};

	export const zuiMetadata = {
		category: 'gene',
		id: 'button',
		importStatement: "import { ZButton } from '@zadmin/zui';",
		name: 'ZButton',
		bindings: [
			{ description: '真实button元素引用。', name: 'ref', type: 'HTMLButtonElement | null' }
		],
		dependencies: ['ZSpinner', 'ReducedMotionState'],
		events: [
			{
				description: '原生click回调；disabled或loading时浏览器不会派发用户click。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '在按钮获得焦点时触发原生click。', key: 'Enter' },
			{ description: '在按钮获得焦点时触发原生click。', key: 'Space' }
		],
		parts: [
			{ description: '按钮前置内容容器。', name: 'start' },
			{ description: '保持固有宽度的正常内容容器。', name: 'content' },
			{ description: '绝对居中的ZSpinner或自定义加载指示器。', name: 'loading' },
			{ description: '按钮后置内容容器。', name: 'end' }
		],
		props: [
			{
				default: "'solid'",
				description: '只表达视觉强调层级。',
				name: 'variant',
				type: 'ButtonVariant'
			},
			{
				default: "'primary'",
				description: '与variant正交的有限语义色调。',
				name: 'tone',
				type: 'ButtonTone'
			},
			{
				default: "Provider density（默认把 'comfortable' 映射为 'medium'）",
				description: '按钮尺寸；显式值优先于Provider density。',
				name: 'size',
				type: 'ButtonSize'
			},
			{
				default: "'default'",
				description: '默认内容宽度或与size一致的方形图标按钮。',
				name: 'shape',
				type: "'default' | 'square' | 'circle'"
			},
			{ default: 'false', description: '扩展到父容器宽度。', name: 'fullWidth', type: 'boolean' },
			{
				default: 'false',
				description: '设置aria-busy、阻止重复操作，并以覆盖层保持原内容宽度。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: '—',
				description: 'loading时的可访问名称。',
				name: 'loadingLabel',
				type: 'string'
			},
			{
				default: '—',
				description: '替换默认ZSpinner；容器始终aria-hidden，按钮拥有busy语义。',
				name: 'loadingIndicator',
				type: 'Snippet'
			},
			{ default: '—', description: '按钮内容前的Snippet。', name: 'start', type: 'Snippet' },
			{ default: '—', description: '按钮内容后的Snippet。', name: 'end', type: 'Snippet' },
			{ default: 'false', description: '映射到原生disabled。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: '0.1.0',
		snippets: [
			{ description: '按钮主体内容。', name: 'children', type: 'Snippet' },
			{ description: '主体内容之前的图标或内容。', name: 'start', type: 'Snippet' },
			{ description: '主体内容之后的图标或内容。', name: 'end', type: 'Snippet' },
			{ description: '替换内置加载指示器。', name: 'loadingIndicator', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/gene/ZButton.svelte',
		states: [
			{ description: '按钮正在执行异步操作。', name: 'data-loading', values: ['true'] },
			{
				description: '按钮解析后的尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '按钮形状。', name: 'data-shape', values: ['default', 'square', 'circle'] },
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['primary', 'neutral', 'info', 'success', 'warning', 'danger']
			},
			{
				description: '视觉层级。',
				name: 'data-variant',
				values: ['solid', 'outline', 'ghost']
			},
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary:
			'保留原生button/form/callback语义，以正交variant、tone、size、shape和宽度稳定ZSpinner loading构成生产操作组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import ZSpinner from '../feedback/ZSpinner.svelte';

	let {
		'aria-busy': ariaBusy,
		'aria-label': ariaLabel,
		'aria-pressed': ariaPressed,
		children,
		class: className,
		disabled = false,
		end,
		fullWidth,
		loading = false,
		loadingIndicator,
		loadingLabel,
		ref = $bindable(null),
		shape,
		size,
		style,
		start,
		tone,
		type = 'button',
		variant,
		...rest
	}: ZButtonProps = $props();

	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const reduced = $derived(reducedMotion.current);
	const resolvedSize = $derived(
		resolveControlSize(size ?? zui.componentDefaults.button?.size, zui.density)
	);
	const resolvedShape = $derived(shape ?? zui.componentDefaults.button?.shape ?? 'default');
	const resolvedTone = $derived(tone ?? zui.componentDefaults.button?.tone ?? 'primary');
	const resolvedVariant = $derived(variant ?? zui.componentDefaults.button?.variant ?? 'solid');
	const resolvedFullWidth = $derived(fullWidth ?? zui.componentDefaults.button?.fullWidth ?? false);
	const pressed = $derived(
		ariaPressed === true || ariaPressed === 'true' || ariaPressed === 'mixed'
	);
	const rootClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			fullWidth: resolvedFullWidth,
			motion: reduced ? 'reduced' : 'full',
			pressed,
			shape: resolvedShape,
			size: resolvedSize,
			tone: resolvedTone,
			variant: resolvedVariant
		})
	);
	const contentClass = $derived(zui.recipe(buttonContentRecipe, { loading }));
	const loadingClass = $derived(zui.recipe(buttonLoadingRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	{type}
	disabled={disabled || loading}
	aria-busy={loading ? true : ariaBusy}
	aria-label={loading && loadingLabel ? loadingLabel : ariaLabel}
	aria-pressed={ariaPressed}
	data-loading={loading || undefined}
	data-reduced-motion={reduced || undefined}
	data-size={resolvedSize}
	data-shape={resolvedShape}
	data-tone={resolvedTone}
	data-variant={resolvedVariant}
>
	<span class={contentClass} data-slot="content">
		{#if start}<span data-slot="start">{@render start()}</span>{/if}
		{@render children?.()}
		{#if end}<span data-slot="end">{@render end()}</span>{/if}
	</span>
	{#if loading}
		<span aria-hidden="true" class={loadingClass} data-slot="loading">
			{#if loadingIndicator}
				{@render loadingIndicator()}
			{:else}
				<ZSpinner aria-hidden="true" size={resolvedSize} tone="inherit" />
			{/if}
		</span>
	{/if}
</button>
