<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { RecipeVariants } from '../../recipes/types.js';
	import { resolveControlSize, type ZControlSize } from '../../runtime/foundation/control-size.js';

	export type ButtonSize = ZControlSize;
	export type ButtonShape = 'circle' | 'default' | 'square';
	export type ButtonTone = 'danger' | 'default';
	export type ButtonVariant = 'ghost' | 'primary' | 'secondary';

	export interface ButtonDesignProps {
		disabled?: boolean;
		loading?: boolean;
		shape?: ButtonShape;
		size?: ButtonSize;
		tone?: ButtonTone;
		variant?: ButtonVariant;
	}

	const buttonRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.alignItems.center;
			s.justifyContent.center;
			s.borderWidth._hairline;
			s.borderStyle.solid;
			s.borderRadius._medium;
			s.fontWeight._semibold;
			s.lineHeight(1);
			s.position.relative;
			s.cursor.pointer;
			s.transitionDuration._fast;
			// A property list is structural CSS, not a theme value or single keyword.
			s.transitionProperty.raw('background-color, border-color, color, opacity');
			s.transitionTimingFunction.ease;
			s.userSelect.none;
			s._focusVisible((focus) => {
				focus.outlineWidth._medium;
				focus.outlineStyle.solid;
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
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
			fullWidth: {
				false: () => undefined,
				true: (s) => s.width.percent(100)
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			size: {
				large: (s) => {
					s.minHeight._large;
					s.paddingBlock.px(0);
					s.fontSize._large;
				},
				medium: (s) => {
					s.minHeight._medium;
					s.paddingBlock.px(0);
					s.fontSize._medium;
				},
				small: (s) => {
					s.minHeight._small;
					s.paddingBlock.px(0);
					s.fontSize._small;
				}
			},
			shape: {
				circle: (s) => {
					s.borderRadius.percent(50);
					s.flexShrink(0);
					s.paddingInline.px(0);
				},
				default: () => undefined,
				square: (s) => {
					s.flexShrink(0);
					s.paddingInline.px(0);
				}
			},
			pressed: { false: () => undefined, true: () => undefined },
			tone: { danger: () => undefined, default: () => undefined },
			variant: {
				ghost: (s) => {
					s.backgroundColor.transparent;
					s.borderColor.transparent;
					s.color._primary;
					s._hover((hover) => hover.backgroundColor._surface);
				},
				primary: (s) => {
					s.backgroundColor._primary;
					s.borderColor._primary;
					s.color._canvas;
					s._hover((hover) => hover.backgroundColor._primaryHover);
				},
				secondary: (s) => {
					s.backgroundColor._surface;
					s.borderColor._border;
					s.color._text;
					s._hover((hover) => hover.backgroundColor._canvas);
				}
			}
		},
		compoundVariants: [
			{
				style: (s) => s.backgroundColor._surface,
				when: { disabled: true, variant: 'ghost' }
			},
			{
				style: (s) => {
					s.backgroundColor._danger;
					s.borderColor._danger;
					s.color._canvas;
					s._hover((hover) => hover.backgroundColor._dangerHover);
				},
				when: { tone: 'danger', variant: 'primary' }
			},
			{
				style: (s) => {
					s.backgroundColor._surface;
					s.borderColor._danger;
					s.color._danger;
					s._hover((hover) => hover.backgroundColor._canvas);
				},
				when: { tone: 'danger', variant: 'secondary' }
			},
			{
				style: (s) => {
					s.backgroundColor.transparent;
					s.borderColor.transparent;
					s.color._danger;
					s._hover((hover) => hover.backgroundColor._surface);
				},
				when: { tone: 'danger', variant: 'ghost' }
			},
			{
				style: (s) => s.backgroundColor._primaryHover,
				when: { pressed: true, tone: 'default', variant: 'primary' }
			},
			{
				style: (s) => {
					s.backgroundColor._primary;
					s.borderColor._primary;
					s.color._canvas;
				},
				when: { pressed: true, tone: 'default', variant: 'secondary' }
			},
			{
				style: (s) => {
					s.backgroundColor._surface;
					s.borderColor._primary;
					s.color._primary;
				},
				when: { pressed: true, tone: 'default', variant: 'ghost' }
			},
			{
				style: (s) => s.backgroundColor._dangerHover,
				when: { pressed: true, tone: 'danger', variant: 'primary' }
			},
			{
				style: (s) => {
					s.backgroundColor._danger;
					s.borderColor._danger;
					s.color._canvas;
				},
				when: { pressed: true, tone: 'danger', variant: 'secondary' }
			},
			{
				style: (s) => {
					s.backgroundColor._surface;
					s.borderColor._danger;
					s.color._danger;
				},
				when: { pressed: true, tone: 'danger', variant: 'ghost' }
			},
			{
				style: (s) => s.paddingInline._medium,
				when: { shape: 'default', size: 'small' }
			},
			{
				style: (s) => s.paddingInline._large,
				when: { shape: 'default', size: 'medium' }
			},
			{
				style: (s) => s.paddingInline._xlarge,
				when: { shape: 'default', size: 'large' }
			},
			{
				style: (s) => {
					s.height._small;
					s.width._small;
				},
				when: { shape: 'square', size: 'small' }
			},
			{
				style: (s) => {
					s.height._medium;
					s.width._medium;
				},
				when: { shape: 'square', size: 'medium' }
			},
			{
				style: (s) => {
					s.height._large;
					s.width._large;
				},
				when: { shape: 'square', size: 'large' }
			},
			{
				style: (s) => {
					s.height._small;
					s.width._small;
				},
				when: { shape: 'circle', size: 'small' }
			},
			{
				style: (s) => {
					s.height._medium;
					s.width._medium;
				},
				when: { shape: 'circle', size: 'medium' }
			},
			{
				style: (s) => {
					s.height._large;
					s.width._large;
				},
				when: { shape: 'circle', size: 'large' }
			}
		],
		defaultVariants: {
			disabled: false,
			fullWidth: false,
			motion: 'auto',
			pressed: false,
			shape: 'default',
			size: 'medium',
			tone: 'default',
			variant: 'primary'
		}
	});
	const buttonContentRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.gap._medium;
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
		variants: {
			indicatorTone: {
				canvas: (s) =>
					s._selector('& [data-slot="indicator"]', (indicator) => indicator.color._canvas),
				danger: (s) =>
					s._selector('& [data-slot="indicator"]', (indicator) => indicator.color._danger),
				primary: (s) =>
					s._selector('& [data-slot="indicator"]', (indicator) => indicator.color._primary)
			}
		},
		defaultVariants: { indicatorTone: 'primary' }
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
				default: "'primary'",
				description: '只表达视觉强调层级。',
				name: 'variant',
				type: "'primary' | 'secondary' | 'ghost'"
			},
			{
				default: "'default'",
				description: '与variant正交的有限语义色调。',
				name: 'tone',
				type: "'default' | 'danger'"
			},
			{
				default: "Provider density（默认把 'comfortable' 映射为 'medium'）",
				description: '按钮尺寸；显式值优先于Provider density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
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
				values: ['small', 'medium', 'large']
			},
			{ description: '按钮形状。', name: 'data-shape', values: ['default', 'square', 'circle'] },
			{ description: '语义tone。', name: 'data-tone', values: ['default', 'danger'] },
			{
				description: '视觉层级。',
				name: 'data-variant',
				values: ['primary', 'secondary', 'ghost']
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
	const resolvedTone = $derived(tone ?? zui.componentDefaults.button?.tone ?? 'default');
	const resolvedVariant = $derived(variant ?? zui.componentDefaults.button?.variant ?? 'primary');
	const resolvedFullWidth = $derived(fullWidth ?? zui.componentDefaults.button?.fullWidth ?? false);
	const pressed = $derived(
		ariaPressed === true || ariaPressed === 'true' || ariaPressed === 'mixed'
	);
	const spinnerSize = $derived(resolvedSize === 'large' ? 'medium' : 'small');
	const spinnerTone = $derived(
		resolvedVariant === 'primary' ? 'canvas' : resolvedTone === 'danger' ? 'danger' : 'primary'
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
	const loadingClass = $derived(zui.recipe(buttonLoadingRecipe, { indicatorTone: spinnerTone }));
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
				<ZSpinner aria-hidden="true" size={spinnerSize} tone="inherit" />
			{/if}
		</span>
	{/if}
</button>
