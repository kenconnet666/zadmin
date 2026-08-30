<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZNumberFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly clampOnBlur?: boolean;
		readonly decrementLabel?: string;
		readonly defaultValue?: number;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formatOptions?: Intl.NumberFormatOptions;
		readonly incrementLabel?: string;
		readonly inputId?: string;
		readonly inputLabel?: string;
		inputRef?: HTMLInputElement | null;
		readonly invalid?: boolean;
		readonly locale?: string;
		readonly max?: number;
		readonly min?: number;
		readonly name?: string;
		readonly onValueChange?: (value: number | undefined) => void;
		readonly placeholder?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly step?: number;
		value?: number;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'number-field',
		importStatement: "import { ZNumberField } from '@zadmin/zui';",
		name: 'ZNumberField',
		bindings: [
			{ description: '已解析有限数值。', name: 'value', type: 'number | undefined' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实spinbutton输入引用。', name: 'inputRef', type: 'HTMLInputElement | null' }
		],
		dependencies: ['Intl.NumberFormat', 'localized parser', 'ControllableState', 'FormValue'],
		events: [
			{
				description: '用户输入可解析数值或清空后调用。',
				name: 'onValueChange',
				type: '(value: number | undefined) => void'
			}
		],
		keyboard: [
			{ description: '按step增减；Shift使用10倍步长。', key: 'ArrowUp / ArrowDown' },
			{ description: '按10倍step增减。', key: 'PageUp / PageDown' },
			{ description: '有边界时跳到min/max。', key: 'Home / End' }
		],
		parts: [
			{ description: '减少按钮。', name: 'decrement' },
			{ description: '文本编辑spinbutton。', name: 'input' },
			{ description: '增加按钮。', name: 'increment' }
		],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前有限数值。',
				name: 'value',
				type: 'number'
			},
			{ default: 'undefined', description: '非受控初始值。', name: 'defaultValue', type: 'number' },
			{ default: '1', description: '正有限步长。', name: 'step', type: 'number' },
			{ default: 'undefined', description: '最小值。', name: 'min', type: 'number' },
			{ default: 'undefined', description: '最大值。', name: 'max', type: 'number' },
			{
				default: 'Provider locale',
				description: '解析和格式化locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: '{}',
				description: '非编辑态Intl.NumberFormat选项。',
				name: 'formatOptions',
				type: 'Intl.NumberFormatOptions'
			},
			{
				default: 'true',
				description: 'blur时把已解析值夹紧到边界。',
				name: 'clampOnBlur',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '无效视觉和aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{ default: 'undefined', description: '隐藏表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.5.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZNumberField.svelte',
		states: [
			{ description: '编辑文本不可解析。', name: 'data-invalid', values: ['true'] },
			{ description: '输入获得焦点。', name: 'data-editing', values: ['true'] }
		],
		status: 'experimental',
		summary: '使用Intl本地数字解析、spinbutton语义、精确step与表单桥接的Number Field。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.backgroundColor._canvas;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.overflow.hidden;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: { false: (s) => s.borderColor._border, true: (s) => s.borderColor._danger }
		},
		defaultVariants: { disabled: false, invalid: false }
	});
	const buttonRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderStyle.none;
			s.color._text;
			s.cursor.pointer;
			s.fontWeight._semibold;
			s.minWidth._medium;
			s.paddingInline._medium;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.cursor.notAllowed } },
		defaultVariants: { disabled: false }
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.flex.raw('1 1 auto');
			s.fontSize._medium;
			s.minHeight._medium;
			s.minWidth.rem(8);
			s.outlineStyle.none;
			s.paddingInline._medium;
			s.textAlign.end;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, buttonRecipe);
	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { listenForFormReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import { clampNumber, parseLocalizedNumber, stepNumber } from '../../runtime/number.js';
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
		clampOnBlur = true,
		class: className,
		decrementLabel = 'Decrease value',
		defaultValue,
		disabled = false,
		form,
		formatOptions = {},
		incrementLabel = 'Increase value',
		inputId,
		inputLabel = 'Number',
		inputRef = $bindable(null),
		invalid,
		locale,
		max,
		min,
		name,
		onValueChange,
		placeholder,
		readonly = false,
		ref = $bindable(null),
		required = false,
		step = 1,
		style,
		value = $bindable(),
		...rest
	}: ZNumberFieldProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const generatedInputId = $derived(createZuiId(zui.idPrefix, uid, 'number-field'));
	const field = useZField();
	const resolvedLocale = $derived(locale ?? zui.locale);
	const constraints = $derived.by(() => {
		if (!Number.isFinite(step) || step <= 0)
			throw new TypeError('ZNumberField step must be positive and finite.');
		if (min !== undefined && !Number.isFinite(min))
			throw new TypeError('ZNumberField min must be finite.');
		if (max !== undefined && !Number.isFinite(max))
			throw new TypeError('ZNumberField max must be finite.');
		if (min !== undefined && max !== undefined && min > max)
			throw new RangeError('ZNumberField min cannot exceed max.');
		return { max, min, step };
	});
	const valueState = new ControllableState<number | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	let draft = $state('');
	let editing = $state(false);
	let draftInvalid = $state(false);
	let proxy = $state<HTMLInputElement | null>(null);
	const formatted = $derived(
		valueState.current === undefined
			? ''
			: new Intl.NumberFormat(resolvedLocale, formatOptions).format(valueState.current)
	);
	const editFormatted = $derived(
		valueState.current === undefined
			? ''
			: new Intl.NumberFormat(resolvedLocale, {
					maximumFractionDigits: 20,
					useGrouping: false
				}).format(valueState.current)
	);
	const displayed = $derived(editing ? draft : formatted);
	const resolvedInvalid = $derived(draftInvalid || (invalid ?? field?.invalid ?? false));
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const rootClass = $derived(
		zui.recipe(rootRecipe, { disabled: resolvedDisabled, invalid: resolvedInvalid })
	);
	const buttonClass = $derived(
		zui.recipe(buttonRecipe, { disabled: resolvedDisabled || resolvedReadonly })
	);
	const inputClass = $derived(zui.recipe(inputRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (!proxy) return;
		return listenForFormReset(proxy, () => {
			valueState.reset();
			draft = '';
			draftInvalid = false;
			editing = false;
		});
	});
	function commit(next: number | undefined): void {
		if (next !== undefined && !Number.isFinite(next)) return;
		valueState.setFromUser(next);
		draftInvalid = false;
	}
	function changeBy(direction: -1 | 1, multiplier = 1): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? constraints.min ?? 0;
		commit(
			stepNumber(base, direction, constraints.step, constraints.min, constraints.max, multiplier)
		);
		draft = '';
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		draft = event.currentTarget.value;
		const parsed = parseLocalizedNumber(draft, resolvedLocale);
		draftInvalid = !parsed.valid && !parsed.partial;
		if (parsed.valid) commit(parsed.value);
	}
	function handleFocus(): void {
		editing = true;
		draft = editFormatted;
		draftInvalid = false;
		queueMicrotask(() => inputRef?.select());
	}
	function handleBlur(): void {
		const parsed = parseLocalizedNumber(draft, resolvedLocale);
		if (parsed.valid) {
			const next =
				parsed.value === undefined || !clampOnBlur
					? parsed.value
					: clampNumber(parsed.value, constraints.min, constraints.max);
			commit(next);
		}
		draftInvalid = false;
		editing = false;
		draft = '';
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		const direction =
			event.key === 'ArrowUp' || event.key === 'PageUp'
				? 1
				: event.key === 'ArrowDown' || event.key === 'PageDown'
					? -1
					: undefined;
		if (direction) {
			event.preventDefault();
			changeBy(direction, event.key.startsWith('Page') || event.shiftKey ? 10 : 1);
			draft = new Intl.NumberFormat(resolvedLocale, {
				maximumFractionDigits: 20,
				useGrouping: false
			}).format(valueState.current ?? 0);
		} else if (event.key === 'Home' && constraints.min !== undefined) {
			event.preventDefault();
			commit(constraints.min);
			draft = new Intl.NumberFormat(resolvedLocale, { useGrouping: false }).format(constraints.min);
		} else if (event.key === 'End' && constraints.max !== undefined) {
			event.preventDefault();
			commit(constraints.max);
			draft = new Intl.NumberFormat(resolvedLocale, { useGrouping: false }).format(constraints.max);
		}
	}
	const serialized = $derived(
		valueState.current === undefined ? undefined : serializeFormValue(valueState.current)
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-editing={editing || undefined}
>
	<button
		type="button"
		class={buttonClass}
		data-slot="decrement"
		aria-label={decrementLabel}
		disabled={resolvedDisabled ||
			resolvedReadonly ||
			(constraints.min !== undefined && (valueState.current ?? constraints.min) <= constraints.min)}
		onclick={() => changeBy(-1)}>−</button
	>
	<input
		bind:this={inputRef}
		class={inputClass}
		id={inputId ?? field?.controlId ?? generatedInputId}
		type="text"
		inputmode="decimal"
		value={displayed}
		{form}
		{placeholder}
		disabled={resolvedDisabled}
		readonly={resolvedReadonly}
		required={resolvedRequired}
		role="spinbutton"
		aria-label={field ? undefined : inputLabel}
		aria-valuemin={constraints.min}
		aria-valuemax={constraints.max}
		aria-valuenow={valueState.current}
		aria-valuetext={formatted || undefined}
		aria-describedby={resolvedDescribedBy}
		aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
		onfocus={handleFocus}
		onblur={handleBlur}
		oninput={handleInput}
		onkeydown={handleKeydown}
	/>
	<button
		type="button"
		class={buttonClass}
		data-slot="increment"
		aria-label={incrementLabel}
		disabled={resolvedDisabled ||
			resolvedReadonly ||
			(constraints.max !== undefined && (valueState.current ?? constraints.max) >= constraints.max)}
		onclick={() => changeBy(1)}>+</button
	>
</div>
<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
{#if resolvedName && !resolvedDisabled && serialized !== undefined}<input
		type="hidden"
		{form}
		name={resolvedName}
		value={serialized}
	/>{/if}
