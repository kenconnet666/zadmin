<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { RecipeVariants } from '../../recipes/types.js';

	const sliderRecipe = defineRecipe({
		base: (s) => {
			s.accentColor._primary;
			s.appearance.auto;
			s.blockSize._medium;
			s.cursor.pointer;
			s.margin.px(0);
			s.width._full;
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
				large: (s) => s.blockSize._large,
				medium: () => undefined,
				small: (s) => s.blockSize._small
			}
		},
		defaultVariants: { disabled: false, invalid: false, readonly: false, size: 'medium' }
	});

	registerRecipeHmr(import.meta, sliderRecipe);

	export type ZSliderVariants = Omit<
		RecipeVariants<typeof sliderRecipe>,
		'disabled' | 'invalid' | 'readonly'
	>;

	export type ZSliderProps = Omit<
		HTMLInputAttributes,
		| 'aria-readonly'
		| 'defaultValue'
		| 'disabled'
		| 'dir'
		| 'max'
		| 'min'
		| 'onchange'
		| 'oninput'
		| 'onkeydown'
		| 'onpointerdown'
		| 'readonly'
		| 'size'
		| 'step'
		| 'type'
		| 'value'
	> &
		ZSliderVariants & {
			readonly defaultValue?: number;
			readonly disabled?: boolean;
			readonly formatValue?: (value: number) => string;
			readonly invalid?: boolean;
			readonly max?: number;
			readonly min?: number;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly oninput?: HTMLInputAttributes['oninput'];
			readonly onkeydown?: HTMLInputAttributes['onkeydown'];
			readonly onpointerdown?: HTMLInputAttributes['onpointerdown'];
			readonly onValueChange?: (value: number) => void;
			readonly readonly?: boolean;
			ref?: HTMLInputElement | null;
			readonly step?: number;
			value?: number;
		};

	export const zuiMetadata = {
		category: 'input',
		id: 'slider',
		importStatement: "import { ZSlider } from '@zadmin/zui';",
		name: 'ZSlider',
		bindings: [
			{ description: '当前规范化数值。', name: 'value', type: 'number' },
			{ description: '真实range input引用。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		dependencies: ['ControllableState', 'form-control', 'slider model'],
		events: [
			{
				description: '可编辑状态下，用户拖动或键盘步进后调用一次。',
				name: 'onValueChange',
				type: '(value: number) => void'
			},
			{
				description: '原生input回调。',
				name: 'oninput',
				type: 'InputEventHandler<HTMLInputElement>'
			},
			{
				description: '原生change回调。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [
			{ description: '按step调整数值；水平轴遵循RTL。', key: 'Arrow keys' },
			{ description: '跳到最小值或最大值。', key: 'Home / End' },
			{ description: '按浏览器的大步长调整。', key: 'PageUp / PageDown' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前规范化数值。',
				name: 'value',
				type: 'number'
			},
			{
				default: '0',
				description: '非受控初值，也是表单reset目标。',
				name: 'defaultValue',
				type: 'number'
			},
			{ default: '0', description: '最小值。', name: 'min', type: 'number' },
			{ default: '100', description: '最大值。', name: 'max', type: 'number' },
			{ default: '1', description: '正数步长。', name: 'step', type: 'number' },
			{
				default: 'Field size，其次为 Provider density',
				description: '显式值优先，其次继承Field，最后由Provider density解析控件高度。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: 'undefined',
				description: '生成aria-valuetext。',
				name: 'formatValue',
				type: '(value: number) => string'
			},
			{ default: 'false', description: '禁用原生控件。', name: 'disabled', type: 'boolean' },
			{
				default: '自身或Field/Form任一readonly',
				description: '保持可聚焦和FormData，阻止pointer与键盘改值并设置aria-readonly。',
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
				description: '真实range input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZSlider.svelte',
		states: [
			{ description: '当前数值。', name: 'data-value', values: ['finite number'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析后的control尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			}
		],
		status: 'stable',
		summary: '使用原生range提供pointer、键盘、触摸、RTL和FormData合同的单值Slider。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { normalizeSliderValue } from '../../runtime/slider.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		class: className,
		defaultValue = 0,
		disabled = false,
		formatValue,
		id,
		invalid,
		max = 100,
		min = 0,
		name,
		onchange,
		oninput,
		onkeydown,
		onpointerdown,
		onValueChange,
		readonly,
		ref = $bindable(null),
		required = false,
		size,
		step = 1,
		style,
		value = $bindable(),
		...rest
	}: ZSliderProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const rootClass = $derived(
		zui.recipe(sliderRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			readonly: resolvedReadonly,
			size: resolvedSize
		})
	);
	const valueState = new ControllableState<number>({
		defaultValue: () => normalizeSliderValue(defaultValue, min, max, step),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalizeSliderValue(valueState.current, min, max, step));
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'slider'));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.currentTarget.value = String(resolvedValue);
			return;
		}
		valueState.setFromUser(normalizeSliderValue(event.currentTarget.valueAsNumber, min, max, step));
		oninput?.(event);
	}

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.currentTarget.value = String(resolvedValue);
			return;
		}
		onchange?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (!resolvedReadonly && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
			event.preventDefault();
			const increase =
				zui.direction === 'rtl' ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
			const next = normalizeSliderValue(resolvedValue + (increase ? step : -step), min, max, step);
			valueState.setFromUser(next);
			onkeydown?.(event);
			return;
		}
		if (resolvedReadonly) {
			switch (event.key) {
				case 'ArrowDown':
				case 'ArrowLeft':
				case 'ArrowRight':
				case 'ArrowUp':
				case 'End':
				case 'Home':
				case 'PageDown':
				case 'PageUp':
					event.preventDefault();
					return;
				default:
					break;
			}
		}
		onkeydown?.(event);
	}

	function handlePointerdown(event: PointerEvent & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.currentTarget.focus({ preventScroll: true });
			event.preventDefault();
			return;
		}
		onpointerdown?.(event);
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	use:formReset={() => valueState.reset()}
	id={id ?? field?.controlId ?? generatedId}
	name={name ?? field?.name}
	type="range"
	dir={zui.direction}
	{min}
	{max}
	{step}
	defaultValue={normalizeSliderValue(defaultValue, min, max, step)}
	value={resolvedValue}
	disabled={resolvedDisabled}
	required={required || field?.required}
	oninput={handleInput}
	onchange={handleChange}
	onkeydown={handleKeydown}
	onpointerdown={handlePointerdown}
	aria-valuetext={formatValue?.(resolvedValue)}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	aria-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid ? 'true' : undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={resolvedSize}
	data-value={resolvedValue}
/>
