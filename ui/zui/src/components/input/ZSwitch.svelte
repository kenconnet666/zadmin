<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { PrimitiveFormValue } from '../../runtime/form/form-value.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';
	import type { SlotRecipeSelection } from '../../recipes/slots.js';

	export type SwitchValue = Exclude<PrimitiveFormValue, boolean>;
	// The native checkbox remains the only focus/form owner; every visual slot is decorative.
	const interactiveHoverSelector =
		'&:not([data-disabled="true"]):not([data-loading="true"]):not([data-readonly="true"]):hover';

	const switchRecipe = defineSlotRecipe({
		slots: ['root', 'control', 'thumb', 'indicator', 'spinner'] as const,
		base: {
			control: (s) => {
				s.appearance.none;
				s.cursor.pointer;
				s.height.percent(100);
				s.inset.px(0);
				s.margin.px(0);
				s.opacity(0);
				s.position.absolute;
				s.width.percent(100);
			},
			indicator: (s) => {
				s.alignItems.center;
				s.color._primary;
				s.display.inlineFlex;
				s.height.percent(100);
				s.justifyContent.center;
				s.pointerEvents.none;
				s.width.percent(100);
			},
			root: (s) => {
				s.alignItems.center;
				s.backgroundColor._border;
				s.borderColor._border;
				s.borderRadius._large;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.boxSizing.borderBox;
				s.cursor.pointer;
				s.display.inlineFlex;
				s.flexShrink(0);
				s.padding._xsmall;
				s.position.relative;
				s.transitionProperty.raw('background-color, border-color, opacity');
				s.transitionTimingFunction.ease;
				s.userSelect.none;
				s.verticalAlign.middle;
				s._selector('&:focus-within', (focus) => {
					focus.outlineColor._focus;
					focus.outlineOffset.px(2);
					focus.outlineStyle.solid;
					focus.outlineWidth._medium;
				});
			},
			spinner: (s) => {
				s.display.inlineFlex;
				s.height.percent(60);
				s.width.percent(60);
				s._selector('& > [role="status"]', (status) => {
					status.height.percent(100);
					status.width.percent(100);
				});
			},
			thumb: (s) => {
				s.alignItems.center;
				s.backgroundColor._canvas;
				s.borderRadius._large;
				s.boxShadow._small;
				s.display.grid;
				s.justifyContent.center;
				s.pointerEvents.none;
				s.transitionProperty.raw('transform');
				s.transitionTimingFunction.ease;
			}
		},
		variants: {
			checked: {
				false: {
					root: (s) => s._selector(interactiveHoverSelector, (hover) => hover.borderColor._primary)
				},
				true: {
					root: (s) => {
						s.backgroundColor._primary;
						s.borderColor._primary;
						s._selector(interactiveHoverSelector, (hover) => {
							hover.backgroundColor._primaryHover;
						});
					}
				}
			},
			disabled: {
				false: {},
				true: {
					control: (s) => s.cursor.notAllowed,
					root: (s) => {
						s.backgroundColor._border;
						s.borderColor._border;
						s.cursor.notAllowed;
						s.opacity._disabled;
					}
				}
			},
			invalid: {
				false: {},
				true: {
					root: (s) => {
						s.borderColor._danger;
						s._selector(interactiveHoverSelector, (hover) => hover.borderColor._danger);
					}
				}
			},
			loading: {
				false: {},
				true: {
					control: (s) => s.cursor.wait,
					root: (s) => s.cursor.wait
				}
			},
			motion: {
				full: {
					root: (s) => s.transitionDuration._fast,
					thumb: (s) => s.transitionDuration._fast
				},
				reduced: {
					root: (s) => s.transitionDuration.ms(0),
					thumb: (s) => s.transitionDuration.ms(0)
				}
			},
			readonly: {
				false: {},
				true: {
					control: (s) => s.cursor.default,
					root: (s) => s.cursor.default
				}
			},
			size: {
				large: {
					root: (s) => {
						s.blockSize._switchLargeBlock;
						s.inlineSize._switchLargeInline;
					},
					thumb: (s) => {
						s.blockSize._switchThumbLarge;
						s.inlineSize._switchThumbLarge;
					}
				},
				medium: {
					root: (s) => {
						s.blockSize._switchMediumBlock;
						s.inlineSize._switchMediumInline;
					},
					thumb: (s) => {
						s.blockSize._switchThumbMedium;
						s.inlineSize._switchThumbMedium;
					}
				},
				small: {
					root: (s) => {
						s.blockSize._switchSmallBlock;
						s.inlineSize._switchSmallInline;
					},
					thumb: (s) => {
						s.blockSize._switchThumbSmall;
						s.inlineSize._switchThumbSmall;
					}
				}
			},
			travel: {
				large: { thumb: (s) => s.transform._switchThumbTravelLarge },
				medium: { thumb: (s) => s.transform._switchThumbTravelMedium },
				none: { thumb: (s) => s.transform.raw('translateX(0)') },
				small: { thumb: (s) => s.transform._switchThumbTravelSmall }
			}
		},
		defaultVariants: {
			checked: false,
			disabled: false,
			invalid: false,
			loading: false,
			motion: 'full',
			readonly: false,
			size: 'medium',
			travel: 'none'
		}
	});

	registerSlotRecipeHmr(import.meta, switchRecipe);

	export type ZSwitchVariants = Pick<SlotRecipeSelection<typeof switchRecipe>, 'size'>;

	export type ZSwitchProps = Omit<
		HTMLInputAttributes,
		| 'aria-checked'
		| 'aria-readonly'
		| 'checked'
		| 'defaultChecked'
		| 'disabled'
		| 'onchange'
		| 'onclick'
		| 'readonly'
		| 'role'
		| 'size'
		| 'type'
		| 'value'
	> &
		ZSwitchVariants & {
			checked?: boolean;
			readonly defaultChecked?: boolean;
			readonly disabled?: boolean;
			readonly indicator?: Snippet<[checked: boolean]>;
			readonly invalid?: boolean;
			readonly loading?: boolean;
			readonly loadingIndicator?: Snippet;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly onclick?: HTMLInputAttributes['onclick'];
			readonly onCheckedChange?: (checked: boolean) => void;
			readonly readonly?: boolean;
			ref?: HTMLInputElement | null;
			readonly value?: SwitchValue;
		};

	export const zuiMetadata = {
		category: 'input',
		id: 'switch',
		importStatement: "import { ZSwitch } from '@zadmin/zui';",
		name: 'ZSwitch',
		bindings: [
			{ description: '当前开关状态。', name: 'checked', type: 'boolean' },
			{ description: '真实input元素引用。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		dependencies: [
			'ControllableState',
			'ReducedMotionState',
			'ZSpinner',
			'form-control',
			'form-value'
		],
		events: [
			{
				description: '用户切换状态后调用一次；外部同步与reset不调用。',
				name: 'onCheckedChange',
				type: '(checked: boolean) => void'
			},
			{
				description: '原生change回调。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			},
			{
				description: '仅可编辑状态转发原生click；preventDefault可取消状态转换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [{ description: '在可编辑状态切换开关。', key: 'Space' }],
		parts: [
			{ description: '视觉轨道根节点。', name: 'root' },
			{ description: '透明但真实可交互的checkbox。', name: 'control' },
			{ description: '状态滑块。', name: 'thumb' },
			{ description: '状态或加载指示内容。', name: 'indicator' },
			{ description: '内建Spinner尺寸容器。', name: 'spinner' }
		],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前开关状态；传入或绑定后作为受控值。',
				name: 'checked',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控模式初值，也是原生form reset目标。',
				name: 'defaultChecked',
				type: 'boolean'
			},
			{
				default: "'on'",
				description: '开启时写入原生FormData的标量值。',
				name: 'value',
				type: 'string | number | bigint'
			},
			{
				default: '继承Field或—',
				description: '真实checkbox的FormData字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: '继承Field或false',
				description: '映射原生required与Constraint Validation。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '最近祖先form',
				description: '关联DOM外部原生form的id。',
				name: 'form',
				type: 'string'
			},
			{
				default: "Provider density（默认 'comfortable' → 'medium'）",
				description: '显式尺寸优先，否则响应最近Provider的density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '禁用原生控件。', name: 'disabled', type: 'boolean' },
			{
				default: '继承Field或false',
				description: '保持可聚焦与FormData，但阻止用户修改并设置aria-readonly。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '设置busy与临时不可编辑语义，但保留当前FormData。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: '—',
				description: '在thumb内按当前checked状态渲染装饰内容。',
				name: 'indicator',
				type: 'Snippet<[checked: boolean]>'
			},
			{
				default: 'ZSpinner',
				description: '替换内置加载指示器。',
				name: 'loadingIndicator',
				type: 'Snippet'
			},
			{
				default: '继承Field或false',
				description: '设置无效状态并同步aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实input引用，可调用focus与blur。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '按当前checked状态渲染的thumb装饰内容。',
				name: 'indicator',
				type: 'Snippet<[checked: boolean]>'
			},
			{ description: '替换内置加载指示器。', name: 'loadingIndicator', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/input/ZSwitch.svelte',
		states: [
			{ description: '开关状态。', name: 'data-state', values: ['checked', 'unchecked'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{ description: '异步busy状态。', name: 'data-loading', values: ['true'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '系统或Provider减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary: '以真实checkbox、稳定受控合同和可访问busy/readonly语义表达的双态设置开关。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZSpinner from '../feedback/ZSpinner.svelte';

	let {
		'aria-busy': ariaBusy,
		'aria-describedby': ariaDescribedBy,
		'aria-disabled': ariaDisabled,
		'aria-invalid': ariaInvalid,
		checked = $bindable(),
		class: className,
		defaultChecked = false,
		disabled = false,
		id,
		indicator,
		invalid,
		loading = false,
		loadingIndicator,
		name,
		onchange,
		onclick,
		onCheckedChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		style,
		value = 'on',
		...rest
	}: ZSwitchProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedSize = $derived(resolveControlSize(size, zui.density));
	const state = new ControllableState<boolean>({
		defaultValue: () => defaultChecked,
		onChange: () => onCheckedChange,
		read: () => checked,
		write: (next) => (checked = next)
	});
	const resolvedChecked = $derived(state.current);
	const reduced = $derived(reducedMotion.current);
	const shouldTravel = $derived(zui.direction === 'ltr' ? resolvedChecked : !resolvedChecked);
	const classes = $derived(
		zui.slots(switchRecipe, {
			checked: resolvedChecked,
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			loading,
			motion: reduced ? 'reduced' : 'full',
			readonly: resolvedReadonly,
			size: resolvedSize,
			travel: shouldTravel ? resolvedSize : 'none'
		})
	);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedValue = $derived(serializeFormValue(value) ?? 'on');
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'switch'));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	onMount(() => reducedMotion.connect());

	function handleClick(event: MouseEvent & { currentTarget: HTMLInputElement }): void {
		if (loading || resolvedReadonly) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
	}

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		if (loading || resolvedReadonly) {
			event.currentTarget.checked = resolvedChecked;
			return;
		}
		state.setFromUser(event.currentTarget.checked);
		onchange?.(event);
	}
</script>

<span
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-loading={loading || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-reduced-motion={reduced || undefined}
	data-slot="root"
	data-state={resolvedChecked ? 'checked' : 'unchecked'}
>
	<input
		{...rest}
		bind:this={ref}
		class={classes.control}
		use:formReset={() => state.reset()}
		id={id ?? field?.controlId ?? generatedId}
		name={name ?? field?.name}
		type="checkbox"
		role="switch"
		value={resolvedValue}
		{defaultChecked}
		checked={resolvedChecked}
		disabled={resolvedDisabled}
		required={resolvedRequired}
		onchange={handleChange}
		onclick={handleClick}
		aria-busy={loading ? true : ariaBusy}
		aria-checked={resolvedChecked}
		aria-describedby={resolvedDescribedBy}
		aria-disabled={loading ? true : ariaDisabled}
		aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
		aria-readonly={resolvedReadonly || undefined}
		data-disabled={resolvedDisabled || undefined}
		data-invalid={resolvedInvalid || undefined}
		data-loading={loading || undefined}
		data-readonly={resolvedReadonly || undefined}
		data-slot="control"
		data-state={resolvedChecked ? 'checked' : 'unchecked'}
	/>
	<span class={classes.thumb} aria-hidden="true" data-slot="thumb">
		{#if loading}
			<span class={classes.indicator} data-slot="indicator">
				{#if loadingIndicator}
					{@render loadingIndicator()}
				{:else}
					<span class={classes.spinner} data-slot="spinner">
						<ZSpinner label="Loading" size="small" />
					</span>
				{/if}
			</span>
		{:else if indicator}
			<span class={classes.indicator} data-slot="indicator"
				>{@render indicator(resolvedChecked)}</span
			>
		{/if}
	</span>
</span>
