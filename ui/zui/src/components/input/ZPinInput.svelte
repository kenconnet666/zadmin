<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type PinInputAutocomplete = 'off' | 'one-time-code';
	export type PinInputLabelFormatter = (index: number, length: number) => string;
	export type PinInputMode = 'numeric' | 'text';
	export type PinInputSize = ZControlSize;

	export interface ZPinInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly autocomplete?: PinInputAutocomplete;
		readonly defaultValue?: string;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly inputLabel?: PinInputLabelFormatter;
		readonly invalid?: boolean;
		readonly length?: number;
		readonly mask?: boolean;
		readonly mode?: PinInputMode;
		readonly name?: string;
		readonly onComplete?: (value: string) => void;
		readonly onValueChange?: (value: string) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: PinInputSize;
		readonly validateCharacter?: (character: string) => boolean;
		value?: string | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'pin-input',
		importStatement: "import { ZPinInput } from '@zadmin/zui';",
		name: 'ZPinInput',
		bindings: [
			{ description: '连续PIN字符串；null是显式外部空值。', name: 'value', type: 'string | null' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ControllableState',
			'FieldControl owner',
			'FormValueBridge',
			'Intl.Segmenter',
			'owner-realm microtask',
			'native composition/input/clipboard'
		],
		events: [
			{
				description: '用户编辑或外部值规范化后返回连续PIN。',
				name: 'onValueChange',
				type: '(value: string) => void'
			},
			{
				description: '用户编辑首次形成当前完整值时调用。',
				name: 'onComplete',
				type: '(value: string) => void'
			}
		],
		keyboard: [
			{ description: '按Provider direction移动槽位焦点。', key: 'ArrowLeft / ArrowRight' },
			{ description: '移动到首尾槽。', key: 'Home / End' },
			{ description: '删除当前或前一逻辑字符。', key: 'Backspace / Delete' },
			{ description: '从当前槽分配合法grapheme。', key: 'Paste / OTP autofill' },
			{ description: 'composition期间不拦截IME键盘。', key: 'IME composition keys' }
		],
		parts: [{ description: '单个原生input槽。', name: 'input' }],
		props: [
			{
				bindable: true,
				default: "''",
				description: '连续PIN；null显式清空，外部非法或超长值会规范化并通知owner。',
				name: 'value',
				type: 'string | null'
			},
			{
				default: "''",
				description: '非受控初始值；按当前字符合同规范化。',
				name: 'defaultValue',
				type: 'string'
			},
			{
				default: '6',
				description: '1–32动态整数槽位数；缩短时值与焦点安全收敛。',
				name: 'length',
				type: 'number'
			},
			{
				default: "'numeric'",
				description: 'numeric只接受ASCII OTP数字；text按Unicode grapheme处理。',
				name: 'mode',
				type: "'numeric' | 'text'"
			},
			{
				default: "'one-time-code'",
				description: '只投射到首槽；其余槽始终off。',
				name: 'autocomplete',
				type: "'one-time-code' | 'off'"
			},
			{
				default: 'false',
				description: '仅隐藏显示，不改变回调或FormData原值。',
				name: 'mask',
				type: 'boolean'
			},
			{
				default: 'Field > Provider density',
				description: '显式size优先于Field和Provider density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: 'mode规则',
				description: '按完整Unicode grapheme校验；返回false的字符会被过滤。',
				name: 'validateCharacter',
				type: '(character: string) => boolean'
			},
			{
				default: 'localePack.form.pinInputPosition',
				description: '显式位置名称formatter；省略时使用Provider typed locale与本地化数字。',
				name: 'inputLabel',
				type: 'PinInputLabelFormatter'
			},
			{
				default: 'Field context',
				description: '禁用所有槽和FormValueBridge成功值。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '只读仍可聚焦和选择，但不可编辑。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '所有槽参与原生required约束。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '无效视觉与aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '单一FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '关联外部form ID；输入约束和隐藏值使用同一form。',
				name: 'form',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZPinInput.svelte',
		states: [
			{ description: 'PIN达到当前length。', name: 'data-complete', values: ['true'] },
			{ description: '当前roving槽。', name: 'data-active', values: ['true'] },
			{ description: '当前IME composition槽。', name: 'data-composing', values: ['true'] },
			{ description: 'Field或显式禁用。', name: 'data-disabled', values: ['true'] },
			{ description: 'Field或显式无效。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读。', name: 'data-readonly', values: ['true'] },
			{ description: 'Field或显式必填。', name: 'data-required', values: ['true'] },
			{ description: '输入模式。', name: 'data-mode', values: ['numeric', 'text'] },
			{ description: '遮罩显示。', name: 'data-mask', values: ['true'] },
			{ description: '解析尺寸。', name: 'data-size', values: ['small', 'medium', 'large'] }
		],
		status: 'stable',
		summary:
			'以单一nullable字符串和FormValueBridge拥有OTP/PIN值，支持Unicode grapheme、IME、粘贴/autofill、动态length、Field焦点与受控清空。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.maxWidth._full;
			s.overflowX.auto;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			size: {
				large: (s) => s.gap._medium,
				medium: (s) => s.gap._small,
				small: (s) => s.gap._xsmall
			}
		},
		defaultVariants: { disabled: false, size: 'medium' }
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.flexShrink(0);
			s.fontFamily._mono;
			s.fontWeight._semibold;
			s.textAlign.center;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			invalid: { false: (s) => s.borderColor._border, true: (s) => s.borderColor._danger },
			size: {
				large: (s) => {
					s.fontSize._large;
					s.height._large;
					s.width._large;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.height._medium;
					s.width._medium;
				},
				small: (s) => {
					s.fontSize._small;
					s.height._small;
					s.width._small;
				}
			}
		},
		defaultVariants: { invalid: false, size: 'medium' }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
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
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		autocomplete = 'one-time-code',
		class: className,
		defaultValue = '',
		disabled = false,
		form,
		inputLabel,
		invalid,
		length = 6,
		mask = false,
		mode = 'numeric',
		name,
		onComplete,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		style,
		validateCharacter,
		value = $bindable(),
		...rest
	}: ZPinInputProps = $props();
	const zui = useZui();
	const positionNumberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'pin-input'));
	const idBase = $derived(field?.controlId ?? generatedId);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedLength = $derived.by(() => {
		if (!Number.isInteger(length) || length < 1 || length > 32)
			throw new TypeError('ZPinInput length must be an integer from 1 through 32.');
		return length;
	});
	const resolvedMode = $derived.by<PinInputMode>(() => {
		if (mode !== 'numeric' && mode !== 'text')
			throw new TypeError('ZPinInput mode must be "numeric" or "text".');
		return mode;
	});
	const resolvedAutocomplete = $derived.by<PinInputAutocomplete>(() => {
		if (autocomplete !== 'off' && autocomplete !== 'one-time-code')
			throw new TypeError('ZPinInput autocomplete must be "off" or "one-time-code".');
		return autocomplete;
	});

	function splitCharacters(source: string): string[] {
		const ownerIntl = ref?.ownerDocument.defaultView?.Intl ?? Intl;
		if (typeof ownerIntl.Segmenter !== 'function') return Array.from(source);
		const segmenter = new ownerIntl.Segmenter(undefined, { granularity: 'grapheme' });
		return Array.from(segmenter.segment(source), ({ segment }) => segment);
	}

	function isAllowed(character: string): boolean {
		return validateCharacter
			? validateCharacter(character)
			: resolvedMode === 'numeric'
				? /^[0-9]$/u.test(character)
				: character.trim().length > 0;
	}

	function normalize(source: string): string {
		return splitCharacters(source).filter(isAllowed).slice(0, resolvedLength).join('');
	}

	function normalizedDefaultValue(): string {
		if (typeof defaultValue !== 'string')
			throw new TypeError('ZPinInput defaultValue must be a string.');
		return normalize(defaultValue);
	}

	const valueState = new ControllableState<string | null>({
		defaultValue: normalizedDefaultValue,
		onChange: () => (next) => onValueChange?.(next ?? ''),
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived.by(() => {
		const current = valueState.current;
		if (current !== null && typeof current !== 'string')
			throw new TypeError('ZPinInput value must be a string or null.');
		return normalize(current ?? '');
	});
	const characters = $derived(splitCharacters(resolvedValue));
	const complete = $derived(characters.length === resolvedLength);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	let activeIndex = $state(
		untrack(() => {
			const initial =
				value === null
					? ''
					: typeof value === 'string'
						? normalize(value)
						: normalizedDefaultValue();
			return Math.min(splitCharacters(initial).length, resolvedLength - 1);
		})
	);
	let composingIndex = $state<number | null>(null);
	let focusWithin = $state(false);
	let normalizationGeneration = 0;
	const tabIndex = $derived(Math.min(activeIndex, resolvedLength - 1));
	const rootClass = $derived(
		zui.recipe(rootRecipe, { disabled: resolvedDisabled, size: resolvedSize })
	);
	const inputClass = $derived(
		zui.recipe(inputRecipe, { invalid: resolvedInvalid, size: resolvedSize })
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function queueOwnerMicrotask(callback: () => void): void {
		const ownerWindow = ref?.ownerDocument.defaultView;
		if (ownerWindow) ownerWindow.queueMicrotask(callback);
		else globalThis.queueMicrotask(callback);
	}

	function resetFromForm(): void {
		normalizationGeneration += 1;
		valueState.reset();
		activeIndex = 0;
		composingIndex = null;
		const resetCharacters = splitCharacters(resolvedValue);
		for (let index = 0; index < inputs.length; index += 1) {
			const input = inputs[index];
			if (input) input.value = resetCharacters[index] ?? '';
		}
	}

	function focus(index: number): void {
		const next = Math.max(0, Math.min(resolvedLength - 1, index));
		activeIndex = next;
		inputs[next]?.focus({ preventScroll: true });
		inputs[next]?.select();
	}

	function focusPreferred(): void {
		focus(Math.min(characters.length, resolvedLength - 1));
	}

	function resolvedInputLabel(index: number): string | undefined {
		const explicit = inputLabel?.(index, resolvedLength);
		if (explicit !== undefined && explicit.trim().length === 0)
			throw new TypeError('ZPinInput inputLabel must return a non-empty string.');
		return (
			explicit ??
			(field && index === 0
				? undefined
				: zui.localePack.form.pinInputPosition(
						positionNumberFormatter.format(index + 1),
						positionNumberFormatter.format(resolvedLength)
					))
		);
	}

	function commit(next: string, nextFocus?: number): void {
		const normalized = normalize(next);
		const changed = normalized !== resolvedValue;
		valueState.setFromUser(normalized);
		if (changed && splitCharacters(normalized).length === resolvedLength) onComplete?.(normalized);
		if (nextFocus !== undefined) queueOwnerMicrotask(() => focus(nextFocus));
	}

	function distribute(source: string, index: number): void {
		const incoming = splitCharacters(normalize(source));
		if (incoming.length === 0) {
			const input = inputs[index];
			if (input) input.value = characters[index] ?? '';
			return;
		}
		const next = [...characters];
		const start = Math.min(index, next.length);
		for (const [offset, character] of incoming.entries()) {
			if (start + offset >= resolvedLength) break;
			next[start + offset] = character;
		}
		const inserted = Math.min(incoming.length, resolvedLength - start);
		commit(next.join(''), Math.min(start + inserted, resolvedLength - 1));
	}

	function replaceAt(index: number, character: string): void {
		const next = [...characters];
		const target = Math.min(index, next.length);
		if (character) next[target] = character;
		else if (target < next.length) next.splice(target, 1);
		commit(next.join(''), character ? Math.min(target + 1, resolvedLength - 1) : target);
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }, index: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		if (('isComposing' in event && event.isComposing === true) || composingIndex === index) return;
		distribute(event.currentTarget.value, index);
	}

	function handleCompositionEnd(
		event: CompositionEvent & { currentTarget: HTMLInputElement },
		index: number
	): void {
		if (composingIndex === index) composingIndex = null;
		if (!resolvedDisabled && !resolvedReadonly) distribute(event.currentTarget.value, index);
	}

	function handleKeydown(event: KeyboardEvent, index: number): void {
		if (event.isComposing || composingIndex === index) return;
		const previous = zui.direction === 'rtl' ? index + 1 : index - 1;
		const next = zui.direction === 'rtl' ? index - 1 : index + 1;
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				focus(previous);
				return;
			case 'ArrowRight':
				event.preventDefault();
				focus(next);
				return;
			case 'Home':
				event.preventDefault();
				focus(0);
				return;
			case 'End':
				event.preventDefault();
				focus(resolvedLength - 1);
				return;
			case 'Backspace':
				event.preventDefault();
				if (characters[index]) replaceAt(index, '');
				else if (index > 0) replaceAt(index - 1, '');
				return;
			case 'Delete':
				event.preventDefault();
				replaceAt(index, '');
				return;
			default:
				return;
		}
	}

	function handlePaste(event: ClipboardEvent, index: number): void {
		if (resolvedDisabled || resolvedReadonly || composingIndex !== null) return;
		const pasted = event.clipboardData?.getData('text') ?? '';
		if (!normalize(pasted)) return;
		event.preventDefault();
		distribute(pasted, index);
	}

	$effect(() => {
		const next = Math.min(activeIndex, resolvedLength - 1);
		if (next !== activeIndex) {
			const restoreFocus = focusWithin;
			activeIndex = next;
			if (restoreFocus) queueOwnerMicrotask(() => focus(next));
		}
	});

	$effect(() => {
		const preferred = Math.min(characters.length, resolvedLength - 1);
		if (!focusWithin && preferred !== activeIndex) activeIndex = preferred;
	});

	$effect.pre(() => {
		const nextLength = resolvedLength;
		if (activeIndex < nextLength) return;
		const nextIndex = nextLength - 1;
		const activeElement = ref?.ownerDocument.activeElement;
		const restoreFocus = Boolean(activeElement && ref?.contains(activeElement));
		activeIndex = nextIndex;
		if (restoreFocus) queueOwnerMicrotask(() => focus(nextIndex));
	});

	$effect(() => {
		const source = valueState.current;
		if (source === null) return;
		const normalized = normalize(source);
		if (source === normalized) return;
		const ticket = (normalizationGeneration += 1);
		queueOwnerMicrotask(() => {
			if (ticket !== normalizationGeneration || valueState.current !== source) return;
			value = normalized;
			onValueChange?.(normalized);
		});
	});

	onDestroy(fieldOwner.registerFocusOwner(focusPreferred));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-label={resolvedLabelledBy ? undefined : ariaLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={resolvedDisabled || undefined}
	data-complete={complete || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-mask={mask || undefined}
	data-mode={resolvedMode}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	onfocusin={() => (focusWithin = true)}
	onfocusout={() =>
		queueOwnerMicrotask(() => {
			if (!ref?.contains(ref.ownerDocument.activeElement)) focusWithin = false;
		})}
>
	{#each Array.from({ length: resolvedLength }, (_, index) => index) as index (index)}
		<input
			bind:this={inputs[index]}
			class={inputClass}
			id={index === 0 ? idBase : `${idBase}-${index + 1}`}
			type={mask ? 'password' : 'text'}
			inputmode={resolvedMode === 'numeric' ? 'numeric' : 'text'}
			autocomplete={index === 0 ? resolvedAutocomplete : 'off'}
			{form}
			defaultValue={splitCharacters(normalizedDefaultValue())[index] ?? ''}
			value={characters[index] ?? ''}
			disabled={resolvedDisabled}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			tabindex={index === tabIndex ? 0 : -1}
			aria-label={resolvedInputLabel(index)}
			aria-describedby={resolvedDescribedBy}
			aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
			data-slot="input"
			data-active={activeIndex === index || undefined}
			data-composing={composingIndex === index || undefined}
			oncompositionstart={() => (composingIndex = index)}
			oncompositionend={(event) => handleCompositionEnd(event, index)}
			onfocus={() => {
				activeIndex = index;
				inputs[index]?.select();
			}}
			oninput={(event) => handleInput(event, index)}
			onkeydown={(event) => handleKeydown(event, index)}
			onpaste={(event) => handlePaste(event, index)}
		/>
	{/each}
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValue}
/>
