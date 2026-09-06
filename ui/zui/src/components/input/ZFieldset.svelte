<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type ZFieldsetVariant = 'outlined' | 'filled' | 'plain';
	export interface ZFieldsetProps extends Omit<HTMLFieldsetAttributes, 'children'> {
		readonly legend: string | Snippet;
		readonly description?: string | Snippet;
		readonly children?: Snippet;
		readonly size?: ZControlSize;
		readonly variant?: ZFieldsetVariant;
		readonly name?: string;
		readonly form?: string;
		ref?: HTMLFieldSetElement | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'fieldset',
		name: 'ZFieldset',
		importStatement: "import { ZFieldset } from '@zadmin/zui';",
		bindings: [
			{ name: 'ref', type: 'HTMLFieldSetElement | null', description: '真实 fieldset 元素。' }
		],
		dependencies: ['ZStack'],
		events: [],
		keyboard: [],
		parts: [
			{ name: 'legend', description: '第一原生 legend，为整个控件组命名。' },
			{ name: 'description', description: '通过 aria-describedby 关联分组的说明。' },
			{ name: 'content', description: '使用 ZStack 组织的控件内容。' }
		],
		props: [
			{
				name: 'name',
				type: 'string',
				default: '—',
				description: '原生 fieldset 名称；不会作为各个后代控件的提交 name。'
			},
			{
				name: 'form',
				type: 'string',
				default: '—',
				description: '关联 fieldset 本身的外部 form；后代控件的外部 form 关联仍需分别声明。'
			},
			{
				name: 'legend',
				type: 'string | Snippet',
				required: true,
				default: '必填',
				description: '整个组的名称；每个值控件仍由自己的 ZField 或 aria-label 命名。'
			},
			{
				name: 'description',
				type: 'string | Snippet',
				default: '—',
				description: '组级说明，与外部 aria-describedby 合并。'
			},
			{
				name: 'children',
				type: 'Snippet',
				default: '—',
				description: '组内控件；不创建或覆盖 Field 值所有者。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider density',
				description: '五档组内间距、框内边距与 legend 字号；不覆盖后代控件的独立 size。'
			},
			{
				name: 'variant',
				type: 'ZFieldsetVariant',
				default: "'outlined'",
				description: '边框、填充或无框布局。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description:
					'原生 fieldset 禁用；后代原生表单控件不能交互或提交，第一 legend 后代保留浏览器例外。'
			},
			{
				name: 'ref',
				type: 'HTMLFieldSetElement | null',
				bindable: true,
				default: 'null',
				description: '真实 fieldset 元素。'
			}
		],
		snippets: [
			{ name: 'legend', type: 'Snippet', description: '组名称；可放用于恢复分组的原生按钮。' },
			{ name: 'description', type: 'Snippet', description: '组级辅助说明。' },
			{ name: 'children', type: 'Snippet', description: '各自保有名称和值所有者的控件。' }
		],
		states: [
			{
				name: 'data-disabled',
				values: ['true'],
				description: '本组显式原生 disabled。祖先禁用由浏览器 :disabled 匹配。'
			},
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '已解析的组视觉尺寸。'
			},
			{ name: 'data-variant', values: ['outlined', 'filled', 'plain'], description: '组外观。' }
		],
		since: 'unreleased',
		status: 'experimental',
		source: 'ui/zui/src/components/input/ZFieldset.svelte',
		summary: '以原生 fieldset/legend 组合多个独立控件，复用 ZStack 布局与原生整组禁用。'
	} as const satisfies ZuiComponentMetadata;

	const fieldsetRecipe = defineSlotRecipe({
		slots: ['root', 'legend', 'description'] as const,
		base: {
			root: (s) => {
				s.boxSizing.borderBox;
				s.minWidth.px(0);
				s.margin.px(0);
				s.borderWidth._hairline;
				s.borderStyle.solid;
				s.borderColor._border;
				s.borderRadius._medium;
				s.color._text;
			},
			legend: (s) => {
				s.boxSizing.borderBox;
				s.maxWidth.percent(100);
				s.paddingInline._small;
				s.fontWeight._semibold;
				s.lineHeight._normal;
				s.whiteSpace.normal;
				s.overflowWrap.anywhere;
			},
			description: (s) => {
				s.margin.px(0);
				s.minWidth.px(0);
				s.color._textMuted;
				s.fontSize._small;
				s.lineHeight._normal;
				s.overflowWrap.anywhere;
			}
		},
		variants: {
			size: {
				xsmall: { root: (s) => s.padding._small, legend: (s) => s.fontSize._xsmall },
				small: { root: (s) => s.padding._medium, legend: (s) => s.fontSize._small },
				medium: { root: (s) => s.padding._large, legend: (s) => s.fontSize._medium },
				large: { root: (s) => s.padding._xlarge, legend: (s) => s.fontSize._large },
				xlarge: { root: (s) => s.padding._xlarge, legend: (s) => s.fontSize._xlarge }
			},
			variant: {
				outlined: {},
				filled: { root: (s) => s.backgroundColor._surface },
				plain: {
					root: (s) => {
						s.borderStyle.none;
						s.padding.px(0);
					},
					legend: (s) => s.padding.px(0)
				}
			}
		},
		defaultVariants: { size: 'medium', variant: 'outlined' }
	});
	registerSlotRecipeHmr(import.meta, fieldsetRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZStack from '../layout/ZStack.svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		legend,
		description,
		children,
		size,
		variant,
		disabled = false,
		ref = $bindable(null),
		class: className,
		style,
		'aria-describedby': ariaDescribedBy,
		...rest
	}: ZFieldsetProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const descriptionId = $derived(
		description ? `${createZuiId(zui.idPrefix, uid)}-description` : undefined
	);
	const resolvedSize = $derived(
		resolveControlSize(size ?? zui.componentDefaults.fieldset?.size, zui.density)
	);
	const resolvedVariant = $derived(
		variant ?? zui.componentDefaults.fieldset?.variant ?? 'outlined'
	);
	const classes = $derived(
		zui.slots(fieldsetRecipe, { size: resolvedSize, variant: resolvedVariant })
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<fieldset
	{...rest}
	{disabled}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-describedby={mergeAriaIds(ariaDescribedBy, descriptionId)}
	data-disabled={disabled || undefined}
	data-size={resolvedSize}
	data-variant={resolvedVariant}
>
	<legend class={classes.legend} data-slot="legend">
		{#if typeof legend === 'string'}{legend}{:else}{@render legend()}{/if}
	</legend>
	<ZStack gap={resolvedSize} data-slot="content">
		{#if description}
			<div class={classes.description} id={descriptionId} data-slot="description">
				{#if typeof description === 'string'}{description}{:else}{@render description()}{/if}
			</div>
		{/if}
		{@render children?.()}
	</ZStack>
</fieldset>
