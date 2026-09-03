<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { type ZControlSize } from '../../runtime/foundation/control-size.js';

	export type ZNumberFieldSize = ZControlSize;

	export interface ZNumberFieldParseResult {
		readonly partial: boolean;
		readonly valid: boolean;
		readonly value?: number;
	}

	export interface ZNumberFieldParserContext {
		readonly locale: string;
		readonly defaultParse: (input: string) => ZNumberFieldParseResult;
	}

	export interface ZNumberFieldFormatterContext {
		readonly editing: boolean;
		readonly locale: string;
		readonly options: Intl.NumberFormatOptions;
		readonly defaultFormat: (value: number, options?: Intl.NumberFormatOptions) => string;
	}

	export type ZNumberFieldParser = (
		input: string,
		context: ZNumberFieldParserContext
	) => ZNumberFieldParseResult;
	export type ZNumberFieldFormatter = (
		value: number,
		context: ZNumberFieldFormatterContext
	) => string;

	export interface ZNumberFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly allowOutOfRange?: boolean;
		/** @deprecated Use `allowOutOfRange`; `false` is equivalent to allowing out-of-range text. */
		readonly clampOnBlur?: boolean;
		readonly decrementLabel?: string;
		readonly defaultValue?: number;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formatOptions?: Intl.NumberFormatOptions;
		readonly formatter?: ZNumberFieldFormatter;
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
		readonly pageStep?: number;
		readonly parser?: ZNumberFieldParser;
		readonly placeholder?: string;
		readonly precision?: number;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZNumberFieldSize;
		readonly step?: number;
		value?: number;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'number-field',
		importStatement: "import { ZNumberField } from '@zadmin/zui';",
		name: 'ZNumberField',
		bindings: [
			{
				description: '已解析的有限数值；undefined表示空值。',
				name: 'value',
				type: 'number | undefined'
			},
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实spinbutton输入引用。', name: 'inputRef', type: 'HTMLInputElement | null' }
		],
		dependencies: [
			'Intl.NumberFormat',
			'localized parser',
			'ControllableState',
			'FieldContext',
			'FormValueBridge',
			'ReducedMotionState'
		],
		events: [
			{
				description: '用户输入、清空或步进产生不同数值后调用。',
				name: 'onValueChange',
				type: '(value: number | undefined) => void'
			}
		],
		keyboard: [
			{ description: '按step增减；Shift使用pageStep。', key: 'ArrowUp / ArrowDown' },
			{ description: '按pageStep增减。', key: 'PageUp / PageDown' },
			{ description: '有边界时跳到min/max。', key: 'Home / End' }
		],
		parts: [
			{ description: '减少按钮。', name: 'decrement' },
			{ description: '可编辑的spinbutton。', name: 'input' },
			{ description: '增加按钮。', name: 'increment' }
		],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前有限数值；外部写回undefined可清空已建立的值。',
				name: 'value',
				type: 'number'
			},
			{
				default: 'undefined',
				description: '非受控初始值和form reset目标。',
				name: 'defaultValue',
				type: 'number'
			},
			{ default: '1', description: '方向键与按钮使用的正有限步长。', name: 'step', type: 'number' },
			{
				default: 'step的10倍',
				description: 'Page键和Shift+方向键使用的正有限步长。',
				name: 'pageStep',
				type: 'number'
			},
			{
				default: 'undefined',
				description: '提交值的小数位数，范围0到20。',
				name: 'precision',
				type: 'number'
			},
			{ default: 'undefined', description: '最小值。', name: 'min', type: 'number' },
			{ default: 'undefined', description: '最大值。', name: 'max', type: 'number' },
			{
				default: 'false',
				description: '允许直接输入保留越界值；所有步进交互仍会夹紧。',
				name: 'allowOutOfRange',
				type: 'boolean'
			},
			{
				default: '!allowOutOfRange',
				description: 'deprecated兼容别名；新代码使用allowOutOfRange。',
				name: 'clampOnBlur',
				type: 'boolean',
				deprecatedSince: 'unreleased',
				replacement: 'allowOutOfRange'
			},
			{
				default: '本地化默认文案',
				description: '减少按钮的可访问名称与title；未提供时使用当前locale文案。',
				name: 'decrementLabel',
				type: 'string'
			},
			{
				default: 'false（继承Field）',
				description: '禁用输入和步进按钮，并通过原生disabled及data-disabled表达。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '把内部原生input关联到外部form元素；FormValueBridge也使用该form归属。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Provider locale',
				description: '默认解析、编辑文本和显示格式使用的locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: '{}',
				description: '非编辑态Intl.NumberFormat选项；precision覆盖其小数位数。',
				name: 'formatOptions',
				type: 'Intl.NumberFormatOptions'
			},
			{
				default: '本地数字解析器',
				description: '把草稿解析为valid、partial或invalid结果；空值以valid且无value表达。',
				name: 'parser',
				type: 'ZNumberFieldParser'
			},
			{
				default: 'Intl.NumberFormat',
				description: '格式化已提交值；context区分编辑初始化与静态显示。',
				name: 'formatter',
				type: 'ZNumberFieldFormatter'
			},
			{
				default: '本地化默认文案',
				description: '增加按钮的可访问名称与title；未提供时使用当前locale文案。',
				name: 'incrementLabel',
				type: 'string'
			},
			{
				default: '自动生成或Field controlId',
				description: '内部spinbutton的id，并供步进按钮aria-controls引用。',
				name: 'inputId',
				type: 'string'
			},
			{
				default: '本地化默认文案',
				description: 'spinbutton的可访问名称；存在Field label关联时由Field label优先。',
				name: 'inputLabel',
				type: 'string'
			},
			{
				default: "Provider density（默认把 'comfortable' 映射为 'medium'）",
				description: '显式值优先于Field和Provider density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: 'Field context',
				description: '无效视觉和aria-invalid；内部非法草稿或越界值也会置为无效。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: 'FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '空值编辑态的原生input占位提示。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'false（继承Field）',
				description: '禁止编辑和步进交互，并通过原生readonly及data-readonly表达。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false（继承Field）',
				description: '将字段标记为必填并设置原生required；Field required会一并生效。',
				name: 'required',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZNumberField.svelte',
		states: [
			{ description: '当前草稿不可解析或已提交值越界。', name: 'data-invalid', values: ['true'] },
			{ description: '已提交值位于min/max之外。', name: 'data-out-of-range', values: ['true'] },
			{ description: '输入获得焦点并展示编辑文本。', name: 'data-editing', values: ['true'] },
			{
				description: '解析后的control尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			},
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: '本地化解析与显示、精确步进、可选越界策略和原生表单语义完整闭合的Number Field。'
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
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: { false: (s) => s.borderColor._border, true: (s) => s.borderColor._danger },
			motion: {
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			}
		},
		defaultVariants: { disabled: false, invalid: false, motion: 'full' }
	});
	const buttonRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.backgroundColor._surface;
			s.borderStyle.none;
			s.borderRadius.px(0);
			s.color._text;
			s.fontWeight._semibold;
			s._focusVisible((focus) => {
				focus.outlineOffset.px(-2);
			});
		},
		variants: {
			size: {
				large: (s) => {
					s.minWidth._large;
					s.paddingInline._large;
				},
				medium: (s) => {
					s.minWidth._medium;
					s.paddingInline._medium;
				},
				small: (s) => {
					s.minWidth._small;
					s.paddingInline._small;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.flex.raw('1 1 auto');
			s.minWidth.rem(8);
			s.outlineStyle.none;
			s.textAlign.end;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
		},
		variants: {
			size: {
				large: (s) => {
					s.fontSize._large;
					s.minHeight._large;
					s.paddingInline._xlarge;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.minHeight._medium;
					s.paddingInline._large;
				},
				small: (s) => {
					s.fontSize._small;
					s.minHeight._small;
					s.paddingInline._medium;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, buttonRecipe);
	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import { onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		clampNumber,
		isNumberOutOfRange,
		parseLocalizedNumber,
		roundNumber,
		stepNumber
	} from '../../runtime/number.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-errormessage': ariaErrorMessage,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowOutOfRange = false,
		clampOnBlur,
		class: className,
		decrementLabel,
		defaultValue,
		disabled = false,
		form,
		formatOptions = {},
		formatter,
		incrementLabel,
		inputId,
		inputLabel,
		inputRef = $bindable(null),
		invalid,
		locale,
		max,
		min,
		name,
		onValueChange,
		pageStep,
		parser,
		placeholder,
		precision,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		step = 1,
		style,
		value = $bindable(),
		...rest
	}: ZNumberFieldProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const uid = $props.id();
	const generatedInputId = $derived(createZuiId(zui.idPrefix, uid, 'number-field'));
	const field = useZField();
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedInputId = $derived(inputId ?? field?.controlId ?? generatedInputId);
	const resolvedClampOnBlur = $derived(clampOnBlur ?? !allowOutOfRange);
	const constraints = $derived.by(() => {
		if (!Number.isFinite(step) || step <= 0)
			throw new TypeError('ZNumberField step must be positive and finite.');
		const resolvedPageStep = pageStep ?? step * 10;
		if (!Number.isFinite(resolvedPageStep) || resolvedPageStep <= 0)
			throw new TypeError('ZNumberField pageStep must be positive and finite.');
		if (
			precision !== undefined &&
			(!Number.isInteger(precision) || precision < 0 || precision > 20)
		)
			throw new RangeError('ZNumberField precision must be an integer from 0 through 20.');
		if (min !== undefined && !Number.isFinite(min))
			throw new TypeError('ZNumberField min must be finite.');
		if (max !== undefined && !Number.isFinite(max))
			throw new TypeError('ZNumberField max must be finite.');
		if (min !== undefined && max !== undefined && min > max)
			throw new RangeError('ZNumberField min cannot exceed max.');
		return { max, min, pageStep: resolvedPageStep, precision, step };
	});
	const valueState = new ControllableState<number | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	const currentValue = $derived.by(() => {
		const current = valueState.current;
		if (current !== undefined && !Number.isFinite(current))
			throw new TypeError('ZNumberField value and defaultValue must be finite when provided.');
		return current;
	});
	const presentationOptions = $derived.by(() =>
		constraints.precision === undefined
			? formatOptions
			: {
					...formatOptions,
					maximumFractionDigits: constraints.precision,
					minimumFractionDigits: constraints.precision
				}
	);
	const editOptions = $derived({
		maximumFractionDigits: constraints.precision ?? 20,
		useGrouping: false
	} satisfies Intl.NumberFormatOptions);

	function formatNumber(next: number, editing: boolean, options: Intl.NumberFormatOptions): string {
		const defaultFormat = (
			formattedValue: number,
			overrides: Intl.NumberFormatOptions = options
		): string => new Intl.NumberFormat(resolvedLocale, overrides).format(formattedValue);
		return (
			formatter?.(next, {
				defaultFormat,
				editing,
				locale: resolvedLocale,
				options
			}) ?? defaultFormat(next)
		);
	}

	function formatEditValue(next: number | undefined): string {
		return next === undefined ? '' : formatNumber(next, true, editOptions);
	}

	const formatted = $derived(
		currentValue === undefined ? '' : formatNumber(currentValue, false, presentationOptions)
	);
	const editFormatted = $derived(formatEditValue(currentValue));
	let draft = $state('');
	let editing = $state(false);
	let composing = $state(false);
	let draftInvalid = $state(false);
	let synchronizedValue = $state<number | undefined>(untrack(() => currentValue));
	let synchronizedLocale = $state(untrack(() => resolvedLocale));
	const displayed = $derived(editing ? draft : formatted);
	const outOfRange = $derived(isNumberOutOfRange(currentValue, constraints.min, constraints.max));
	const resolvedInvalid = $derived(
		draftInvalid || outOfRange || (invalid ?? field?.invalid ?? false)
	);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			motion: reduced ? 'reduced' : 'full'
		})
	);
	const buttonClass = $derived(zui.recipe(buttonRecipe, { size: resolvedSize }));
	const inputClass = $derived(zui.recipe(inputRecipe, { size: resolvedSize }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const internalValidityMessage = $derived.by(() => {
		if (draftInvalid) return zui.localePack.numberField.invalidValue;
		if (
			currentValue !== undefined &&
			constraints.min !== undefined &&
			currentValue < constraints.min
		) {
			return zui.localePack.numberField.minimum(
				new Intl.NumberFormat(resolvedLocale, presentationOptions).format(constraints.min)
			);
		}
		if (
			currentValue !== undefined &&
			constraints.max !== undefined &&
			currentValue > constraints.max
		) {
			return zui.localePack.numberField.maximum(
				new Intl.NumberFormat(resolvedLocale, presentationOptions).format(constraints.max)
			);
		}
		return '';
	});

	$effect(() => {
		inputRef?.setCustomValidity(internalValidityMessage);
	});
	$effect(() => {
		const nextValue = currentValue;
		const nextLocale = resolvedLocale;
		if (Object.is(nextValue, synchronizedValue) && nextLocale === synchronizedLocale) return;
		synchronizedValue = nextValue;
		synchronizedLocale = nextLocale;
		if (editing && !composing) {
			draft = formatEditValue(nextValue);
			draftInvalid = false;
		}
	});
	onMount(() => {
		const disconnectMotion = reducedMotion.connect(inputRef?.ownerDocument.defaultView);
		const unregisterFocusOwner = field?.registerFocusOwner(() =>
			inputRef?.focus({ preventScroll: true })
		);
		return () => {
			disconnectMotion();
			unregisterFocusOwner?.();
		};
	});

	function resetFromForm(): void {
		valueState.reset();
		const resetValue = valueState.current;
		synchronizedValue = resetValue;
		draft = '';
		draftInvalid = false;
		composing = false;
		editing = false;
		if (inputRef)
			inputRef.value =
				resetValue === undefined ? '' : formatNumber(resetValue, false, presentationOptions);
	}

	function parseDraft(input: string): ZNumberFieldParseResult {
		const defaultParse = (candidate: string): ZNumberFieldParseResult =>
			parseLocalizedNumber(candidate, resolvedLocale);
		const parsed = parser?.(input, { defaultParse, locale: resolvedLocale }) ?? defaultParse(input);
		if (parsed.value !== undefined && !Number.isFinite(parsed.value)) {
			return { partial: false, valid: false };
		}
		return parsed;
	}

	function normalizeValue(next: number | undefined): number | undefined {
		return next === undefined ? undefined : roundNumber(next, constraints.precision);
	}

	function commit(next: number | undefined): number | undefined {
		const normalized = normalizeValue(next);
		synchronizedValue = normalized;
		valueState.setFromUser(normalized);
		draftInvalid = false;
		return normalized;
	}

	function stepFromEmpty(direction: -1 | 1, amount: number): number {
		const zeroInRange = clampNumber(0, constraints.min, constraints.max);
		return zeroInRange === 0
			? stepNumber(0, direction, amount, constraints.min, constraints.max, 1, constraints.precision)
			: roundNumber(zeroInRange, constraints.precision);
	}

	function changeBy(
		direction: -1 | 1,
		amount = constraints.step,
		baseValue = currentValue
	): number | undefined {
		if (resolvedDisabled || resolvedReadonly) return currentValue;
		const next =
			baseValue === undefined
				? stepFromEmpty(direction, amount)
				: stepNumber(
						baseValue,
						direction,
						amount,
						constraints.min,
						constraints.max,
						1,
						constraints.precision
					);
		return commit(next);
	}

	function updateFromDraft(): void {
		const parsed = parseDraft(draft);
		draftInvalid = !parsed.valid && !parsed.partial;
		if (parsed.valid) commit(parsed.value);
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		draft = event.currentTarget.value;
		const isComposing = 'isComposing' in event && event.isComposing === true;
		if (!composing && !isComposing) updateFromDraft();
	}

	function handleCompositionStart(): void {
		composing = true;
	}

	function handleCompositionEnd(
		event: CompositionEvent & { currentTarget: HTMLInputElement }
	): void {
		composing = false;
		draft = event.currentTarget.value;
		updateFromDraft();
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement }): void {
		const nextDraft = editFormatted;
		editing = true;
		draft = nextDraft;
		draftInvalid = false;
		// Synchronize the edit presentation before an immediate native fill/type action.
		// Waiting for the reactive value attribute can append to the formatted display.
		event.currentTarget.value = nextDraft;
		event.currentTarget.select();
	}

	function handleBlur(): void {
		composing = false;
		const parsed = parseDraft(draft);
		if (parsed.valid) {
			const parsedValue = normalizeValue(parsed.value);
			const next =
				parsedValue === undefined || !resolvedClampOnBlur
					? parsedValue
					: roundNumber(
							clampNumber(parsedValue, constraints.min, constraints.max),
							constraints.precision
						);
			commit(next);
		}
		draftInvalid = false;
		editing = false;
		draft = '';
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (composing || event.isComposing) return;
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowDown':
			case 'PageUp':
			case 'PageDown': {
				event.preventDefault();
				const direction = event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : -1;
				const amount =
					event.key.startsWith('Page') || event.shiftKey ? constraints.pageStep : constraints.step;
				// Keyboard steps prefer the latest valid reactive draft. A controlled render can
				// overwrite the DOM value for one flush after a browser `fill()` event.
				const parsedDraft = parseDraft(draft);
				const liveDraft = parsedDraft.valid ? parsedDraft : parseDraft(event.currentTarget.value);
				const baseValue = liveDraft.valid ? liveDraft.value : undefined;
				draft = formatEditValue(changeBy(direction, amount, baseValue));
				break;
			}
			case 'Home':
				if (constraints.min !== undefined && !resolvedDisabled && !resolvedReadonly) {
					event.preventDefault();
					draft = formatEditValue(commit(constraints.min));
				}
				break;
			case 'End':
				if (constraints.max !== undefined && !resolvedDisabled && !resolvedReadonly) {
					event.preventDefault();
					draft = formatEditValue(commit(constraints.max));
				}
				break;
		}
	}

	function handleStepButton(direction: -1 | 1): void {
		changeBy(direction);
		inputRef?.focus({ preventScroll: true });
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-disabled={resolvedDisabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-out-of-range={outOfRange || undefined}
	data-editing={editing || undefined}
	data-size={resolvedSize}
	data-reduced-motion={reduced || undefined}
>
	<button
		type="button"
		class={buttonClass}
		data-slot="decrement"
		tabindex={-1}
		aria-controls={resolvedInputId}
		aria-label={decrementLabel ?? zui.localePack.numberField.decrement}
		title={decrementLabel ?? zui.localePack.numberField.decrement}
		disabled={resolvedDisabled ||
			resolvedReadonly ||
			(constraints.min !== undefined &&
				currentValue !== undefined &&
				currentValue <= constraints.min)}
		onclick={() => handleStepButton(-1)}
	>
		<Minus aria-hidden="true" size={16} />
	</button>
	<input
		bind:this={inputRef}
		class={inputClass}
		id={resolvedInputId}
		type="text"
		inputmode="decimal"
		defaultValue={defaultValue === undefined
			? ''
			: formatNumber(defaultValue, false, presentationOptions)}
		value={displayed}
		{form}
		{placeholder}
		disabled={resolvedDisabled}
		readonly={resolvedReadonly}
		required={resolvedRequired}
		role="spinbutton"
		aria-label={resolvedLabelledBy
			? undefined
			: (ariaLabel ?? inputLabel ?? zui.localePack.numberField.inputLabel)}
		aria-labelledby={resolvedLabelledBy}
		aria-valuemin={constraints.min}
		aria-valuemax={constraints.max}
		aria-valuenow={currentValue}
		aria-valuetext={formatted || undefined}
		aria-describedby={resolvedDescribedBy}
		aria-errormessage={ariaErrorMessage}
		aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
		onfocus={handleFocus}
		onblur={handleBlur}
		oninput={handleInput}
		oncompositionstart={handleCompositionStart}
		oncompositionend={handleCompositionEnd}
		onkeydown={handleKeydown}
	/>
	<button
		type="button"
		class={buttonClass}
		data-slot="increment"
		tabindex={-1}
		aria-controls={resolvedInputId}
		aria-label={incrementLabel ?? zui.localePack.numberField.increment}
		title={incrementLabel ?? zui.localePack.numberField.increment}
		disabled={resolvedDisabled ||
			resolvedReadonly ||
			(constraints.max !== undefined &&
				currentValue !== undefined &&
				currentValue >= constraints.max)}
		onclick={() => handleStepButton(1)}
	>
		<Plus aria-hidden="true" size={16} />
	</button>
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	value={currentValue}
	onReset={resetFromForm}
/>
