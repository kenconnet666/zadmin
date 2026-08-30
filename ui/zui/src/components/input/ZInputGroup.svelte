<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZInputGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'prefix'
	> {
		readonly children: Snippet;
		readonly disabled?: boolean;
		readonly invalid?: boolean;
		readonly prefix?: Snippet;
		ref?: HTMLDivElement | null;
		readonly suffix?: Snippet;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'input-group',
		importStatement: "import { ZInputGroup } from '@zadmin/zui';",
		name: 'ZInputGroup',
		bindings: [{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['InputGroupContext', 'ICSS child selectors', 'focus-within'],
		events: [],
		keyboard: [{ description: '不拦截control与action的原生键盘行为。', key: 'Native child keys' }],
		parts: [
			{ description: '前置内容或action。', name: 'prefix' },
			{ description: '直接control区域。', name: 'control' },
			{ description: '后置内容或action。', name: 'suffix' }
		],
		props: [
			{
				default: '必填',
				description: '一个或多个真实输入control。',
				name: 'children',
				required: true,
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '前置文本、图标或按钮。',
				name: 'prefix',
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '后置文本、图标或按钮。',
				name: 'suffix',
				type: 'Snippet'
			},
			{
				default: 'false',
				description: '通过Context禁用ZInput/ZTextarea。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '通过Context标记control无效。',
				name: 'invalid',
				type: 'boolean'
			}
		],
		since: '0.5.0',
		snippets: [
			{ description: '直接输入control。', name: 'children', type: 'Snippet' },
			{ description: '前置内容或action。', name: 'prefix', type: 'Snippet' },
			{ description: '后置内容或action。', name: 'suffix', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/input/ZInputGroup.svelte',
		states: [
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '以单一focus-within边界组合prefix、真实输入control、suffix与action的Input Group。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.backgroundColor._canvas;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.overflow.hidden;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s.width._full;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
			s._selector('& > input, & > textarea', (control) => {
				control.borderRadius._none;
				control.borderStyle.none;
				control.flex.raw('1 1 auto');
				control.minWidth.px(0);
				control.outlineStyle.none;
			});
			s._selector('& > input:focus-visible, & > textarea:focus-visible', (control) => {
				control.outlineStyle.none;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: {
				false: (s) => s.borderColor._border,
				true: (s) => s.borderColor._danger
			}
		},
		defaultVariants: { disabled: false, invalid: false }
	});
	const slotRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.color._textMuted;
			s.display.inlineFlex;
			s.flex.raw('0 0 auto');
			s.gap._small;
			s.paddingInline._large;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, slotRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { provideZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		children,
		class: className,
		disabled = false,
		invalid = false,
		prefix,
		ref = $bindable(null),
		style,
		suffix,
		...rest
	}: ZInputGroupProps = $props();
	const zui = useZui();
	provideZInputGroup({
		get disabled() {
			return disabled;
		},
		get invalid() {
			return invalid;
		}
	});
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled, invalid }));
	const slotClass = $derived(zui.recipe(slotRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	data-invalid={invalid || undefined}
>
	{#if prefix}<span class={slotClass} data-slot="prefix">{@render prefix()}</span>{/if}
	{@render children()}
	{#if suffix}<span class={slotClass} data-slot="suffix">{@render suffix()}</span>{/if}
</div>
