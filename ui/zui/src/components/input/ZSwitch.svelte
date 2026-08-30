<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { PrimitiveFormValue } from '../../runtime/form/form-value.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { RecipeVariants } from '../../recipes/types.js';

	export type SwitchValue = Exclude<PrimitiveFormValue, boolean>;

	const switchRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor._border;
			s.blockSize._switchMediumBlock;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.cursor.pointer;
			s.flexShrink(0);
			s.inlineSize._switchMediumInline;
			s.margin.px(0);
			s.padding._xsmall;
			s.transitionDuration._fast;
			s.transitionProperty.raw('background-color, border-color');
			s.transitionTimingFunction.ease;
			s._before((thumb) => {
				thumb.backgroundColor._canvas;
				thumb.blockSize._switchThumbMedium;
				thumb.borderRadius._large;
				thumb.boxShadow._small;
				thumb.content.raw('""');
				thumb.display.block;
				thumb.inlineSize._switchThumbMedium;
				thumb.transform.raw('translateX(0)');
				thumb.transitionDuration._fast;
				thumb.transitionProperty.raw('transform');
				thumb.transitionTimingFunction.ease;
			});
			s._selector('&:checked', (checked) => {
				checked.backgroundColor._primary;
				checked.borderColor._primary;
				checked._before((thumb) => thumb.transform.raw('translateX(100%)'));
			});
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			direction: {
				ltr: () => undefined,
				rtl: (s) => {
					s._before((thumb) => thumb.transform.raw('translateX(100%)'));
					s._selector('&:checked', (checked) => {
						checked._before((thumb) => thumb.transform.raw('translateX(0)'));
					});
				}
			},
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			invalid: {
				false: () => undefined,
				true: (s) => s.borderColor._danger
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => {
					s.transitionDuration.ms(0);
					s._before((thumb) => thumb.transitionDuration.ms(0));
				}
			},
			size: {
				large: (s) => {
					s.blockSize._switchLargeBlock;
					s.inlineSize._switchLargeInline;
					s._before((thumb) => {
						thumb.blockSize._switchThumbLarge;
						thumb.inlineSize._switchThumbLarge;
					});
				},
				medium: () => undefined,
				small: (s) => {
					s.blockSize._switchSmallBlock;
					s.inlineSize._switchSmallInline;
					s._before((thumb) => {
						thumb.blockSize._switchThumbSmall;
						thumb.inlineSize._switchThumbSmall;
					});
				}
			}
		},
		defaultVariants: {
			direction: 'ltr',
			disabled: false,
			invalid: false,
			motion: 'auto',
			size: 'medium'
		}
	});

	registerRecipeHmr(import.meta, switchRecipe);

	export type ZSwitchVariants = Omit<
		RecipeVariants<typeof switchRecipe>,
		'direction' | 'disabled' | 'invalid' | 'motion'
	>;

	export type ZSwitchProps = Omit<
		HTMLInputAttributes,
		| 'aria-checked'
		| 'checked'
		| 'defaultChecked'
		| 'disabled'
		| 'onchange'
		| 'role'
		| 'size'
		| 'type'
		| 'value'
	> &
		ZSwitchVariants & {
			checked?: boolean;
			readonly defaultChecked?: boolean;
			readonly disabled?: boolean;
			readonly invalid?: boolean;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly onCheckedChange?: (checked: boolean) => void;
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
		dependencies: ['ControllableState', 'form-control', 'form-value'],
		events: [
			{
				description: '用户切换状态后调用一次。',
				name: 'onCheckedChange',
				type: '(checked: boolean) => void'
			},
			{
				description: '原生change回调。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [{ description: '切换开关状态。', key: 'Space' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前开关状态。',
				name: 'checked',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控模式的初始状态，也是表单reset目标。',
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
				default: "'medium'",
				description: '开关尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '禁用原生控件。', name: 'disabled', type: 'boolean' },
			{
				default: 'false',
				description: '设置无效状态并继承Field合同。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZSwitch.svelte',
		states: [
			{ description: '开关状态。', name: 'data-state', values: ['checked', 'unchecked'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '以原生checkbox表单语义和role=switch表达的双态开关。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		checked = $bindable(),
		class: className,
		defaultChecked = false,
		disabled = false,
		id,
		invalid,
		name,
		onchange,
		onCheckedChange,
		ref = $bindable(null),
		required = false,
		size = 'medium',
		style,
		value = 'on',
		...rest
	}: ZSwitchProps = $props();

	const zui = useZui();
	const field = useZField();
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const rootClass = $derived(
		zui.recipe(switchRecipe, {
			direction: zui.direction,
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			motion: zui.motion,
			size
		})
	);
	const state = new ControllableState<boolean>({
		defaultValue: () => defaultChecked,
		onChange: () => onCheckedChange,
		read: () => checked,
		write: (next) => (checked = next)
	});
	const resolvedChecked = $derived(state.current);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedValue = $derived(serializeFormValue(value) ?? 'on');
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		state.setFromUser(event.currentTarget.checked);
		onchange?.(event);
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	use:formReset={() => state.reset()}
	id={id ?? field?.controlId}
	name={name ?? field?.name}
	type="checkbox"
	role="switch"
	value={resolvedValue}
	{defaultChecked}
	checked={resolvedChecked}
	disabled={resolvedDisabled}
	required={required || field?.required}
	onchange={handleChange}
	aria-checked={resolvedChecked}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
	data-state={resolvedChecked ? 'checked' : 'unchecked'}
/>
