<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { PrimitiveFormValue } from '../../runtime/form/form-value.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { RecipeVariants } from '../../recipes/types.js';

	export type CheckboxState = boolean | 'indeterminate';
	export type CheckboxValue = Exclude<PrimitiveFormValue, boolean>;

	const checkboxRecipe = defineRecipe({
		base: (s) => {
			s.accentColor._primary;
			s.appearance.auto;
			s.blockSize._medium;
			s.cursor.pointer;
			s.flexShrink(0);
			s.inlineSize._medium;
			s.margin.px(0);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			readonly: {
				false: () => undefined,
				true: (s) => s.cursor.default
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
				true: (s) => s.accentColor._danger
			},
			size: {
				large: (s) => {
					s.blockSize._large;
					s.inlineSize._large;
				},
				medium: () => undefined,
				small: (s) => {
					s.blockSize._small;
					s.inlineSize._small;
				}
			}
		},
		defaultVariants: { disabled: false, invalid: false, readonly: false, size: 'medium' }
	});

	registerRecipeHmr(import.meta, checkboxRecipe);

	export type ZCheckboxVariants = Omit<
		RecipeVariants<typeof checkboxRecipe>,
		'disabled' | 'invalid' | 'readonly'
	>;

	export type ZCheckboxProps = Omit<
		HTMLInputAttributes,
		| 'aria-checked'
		| 'aria-readonly'
		| 'checked'
		| 'defaultChecked'
		| 'disabled'
		| 'onchange'
		| 'onclick'
		| 'readonly'
		| 'size'
		| 'type'
		| 'value'
	> &
		ZCheckboxVariants & {
			checked?: CheckboxState;
			readonly defaultChecked?: CheckboxState;
			readonly disabled?: boolean;
			readonly invalid?: boolean;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly onclick?: HTMLInputAttributes['onclick'];
			readonly onCheckedChange?: (checked: CheckboxState) => void;
			readonly readonly?: boolean;
			ref?: HTMLInputElement | null;
			readonly value?: CheckboxValue;
		};

	export const zuiMetadata = {
		category: 'input',
		id: 'checkbox',
		importStatement: "import { ZCheckbox } from '@zadmin/zui';",
		name: 'ZCheckbox',
		bindings: [
			{ description: '当前选中或混合状态。', name: 'checked', type: "boolean | 'indeterminate'" },
			{ description: '真实input元素引用。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		dependencies: ['ControllableState', 'form-control', 'form-value'],
		events: [
			{
				description: '可编辑状态下，用户切换状态后调用一次。',
				name: 'onCheckedChange',
				type: "(checked: boolean | 'indeterminate') => void"
			},
			{
				description: '原生change回调。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			},
			{
				description: '仅可编辑状态转发原生click；只读时不触发状态型回调。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [{ description: '可编辑时切换选中状态；只读时仅保留焦点。', key: 'Space' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前选中状态；indeterminate表达混合值。',
				name: 'checked',
				type: "boolean | 'indeterminate'"
			},
			{
				default: 'false',
				description: '非受控模式的初始状态，也是表单reset目标。',
				name: 'defaultChecked',
				type: "boolean | 'indeterminate'"
			},
			{
				default: "'on'",
				description: '选中时写入原生FormData的标量值。',
				name: 'value',
				type: 'string | number | bigint'
			},
			{
				default: 'Field size，其次为 Provider density',
				description: '显式值优先，其次继承Field，最后由Provider density解析。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '禁用原生控件。', name: 'disabled', type: 'boolean' },
			{
				default: '自身或Field/Form任一readonly',
				description: '保持可聚焦和FormData，阻止用户切换并设置aria-readonly。',
				name: 'readonly',
				type: 'boolean'
			},
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
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCheckbox.svelte',
		states: [
			{
				description: '选中状态。',
				name: 'data-state',
				values: ['checked', 'unchecked', 'indeterminate']
			},
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析后的control尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			}
		],
		status: 'experimental',
		summary: '支持混合值、Field继承和原生FormData/reset的checkbox控件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
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
		onclick,
		onCheckedChange,
		readonly,
		ref = $bindable(null),
		required = false,
		size,
		style,
		value = 'on',
		...rest
	}: ZCheckboxProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const rootClass = $derived(
		zui.recipe(checkboxRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			readonly: resolvedReadonly,
			size: resolvedSize
		})
	);
	const state = new ControllableState<CheckboxState>({
		defaultValue: () => defaultChecked,
		onChange: () => onCheckedChange,
		read: () => checked,
		write: (next) => (checked = next)
	});
	const resolvedChecked = $derived(state.current);
	const isIndeterminate = $derived(resolvedChecked === 'indeterminate');
	const nativeChecked = $derived(resolvedChecked === true);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedValue = $derived(serializeFormValue(value) ?? 'on');
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'checkbox'));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() => {
		if (ref) ref.indeterminate = isIndeterminate;
	});

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.currentTarget.checked = nativeChecked;
			event.currentTarget.indeterminate = isIndeterminate;
			return;
		}
		state.setFromUser(event.currentTarget.checked);
		onchange?.(event);
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.preventDefault();
			event.currentTarget.checked = nativeChecked;
			event.currentTarget.indeterminate = isIndeterminate;
			return;
		}
		onclick?.(event);
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	use:formReset={() => state.reset()}
	id={id ?? field?.controlId ?? generatedId}
	name={name ?? field?.name}
	type="checkbox"
	value={resolvedValue}
	defaultChecked={defaultChecked === true}
	checked={nativeChecked}
	disabled={resolvedDisabled}
	required={required || field?.required}
	onchange={handleChange}
	onclick={handleClick}
	aria-checked={isIndeterminate ? 'mixed' : nativeChecked}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	aria-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid ? 'true' : undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={resolvedSize}
	data-state={isIndeterminate ? 'indeterminate' : nativeChecked ? 'checked' : 'unchecked'}
/>
