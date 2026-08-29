<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { RecipeVariants } from '../../recipes/types.js';

	export type ButtonSize = 'large' | 'medium' | 'small';
	export type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

	export interface ButtonDesignProps {
		disabled?: boolean;
		loading?: boolean;
		size?: ButtonSize;
		variant?: ButtonVariant;
	}

	const buttonRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.alignItems.center;
			s.justifyContent.center;
			s.gap._medium;
			s.borderWidth._hairline;
			s.borderStyle.solid;
			s.borderRadius._medium;
			s.fontWeight._semibold;
			s.lineHeight(1);
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
			size: {
				large: (s) => {
					s.minHeight._large;
					s.paddingBlock.px(0);
					s.paddingInline._xlarge;
					s.fontSize._large;
				},
				medium: (s) => {
					s.minHeight._medium;
					s.paddingBlock.px(0);
					s.paddingInline._large;
					s.fontSize._medium;
				},
				small: (s) => {
					s.minHeight._small;
					s.paddingBlock.px(0);
					s.paddingInline._medium;
					s.fontSize._small;
				}
			},
			variant: {
				danger: (s) => {
					s.backgroundColor._danger;
					s.borderColor._danger;
					s.color._canvas;
					s._hover((hover) => hover.backgroundColor._dangerHover);
				},
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
			}
		],
		defaultVariants: {
			disabled: false,
			fullWidth: false,
			size: 'medium',
			variant: 'primary'
		}
	});

	registerRecipeHmr(import.meta, buttonRecipe);

	export type ZButtonVariants = Omit<RecipeVariants<typeof buttonRecipe>, 'disabled'>;

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
		dependencies: [],
		events: [],
		keyboard: [
			{ description: '在按钮获得焦点时触发原生click。', key: 'Enter' },
			{ description: '在按钮获得焦点时触发原生click。', key: 'Space' }
		],
		parts: [
			{ description: '按钮前置内容容器。', name: 'start' },
			{ description: '加载指示器容器。', name: 'loading' },
			{ description: '按钮后置内容容器。', name: 'end' }
		],
		props: [
			{
				default: "'primary'",
				description: '视觉与语义变体。',
				name: 'variant',
				type: "'primary' | 'secondary' | 'danger' | 'ghost'"
			},
			{
				default: "'medium'",
				description: '按钮尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '扩展到父容器宽度。', name: 'fullWidth', type: 'boolean' },
			{
				default: 'false',
				description: '设置busy状态并禁用交互。',
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
				description: '自定义loading指示内容。',
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
		states: [{ description: '按钮正在执行异步操作。', name: 'data-loading', values: ['true'] }],
		status: 'stable',
		summary: '原生button语义、稳定recipe变体和Svelte 5 callback props的操作组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-label': ariaLabel,
		children,
		class: className,
		disabled = false,
		end,
		fullWidth = false,
		loading = false,
		loadingIndicator,
		loadingLabel,
		ref = $bindable(null),
		size = 'medium',
		style,
		start,
		type = 'button',
		variant = 'primary',
		...rest
	}: ZButtonProps = $props();

	const zui = useZui();
	const rootClass = $derived(
		zui.recipe(buttonRecipe, {
			disabled: disabled || loading,
			fullWidth,
			size,
			variant
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	{type}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	aria-label={loading && loadingLabel ? loadingLabel : ariaLabel}
	data-loading={loading || undefined}
>
	{#if start}<span data-slot="start">{@render start()}</span>{/if}
	{#if loading}
		<span aria-hidden="true" data-slot="loading">
			{#if loadingIndicator}{@render loadingIndicator()}{:else}…{/if}
		</span>
	{/if}
	{@render children?.()}
	{#if end}<span data-slot="end">{@render end()}</span>{/if}
</button>
