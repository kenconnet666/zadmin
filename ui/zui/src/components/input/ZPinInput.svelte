<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type PinInputMode = 'numeric' | 'text';
	export interface ZPinInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly defaultValue?: string;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly inputLabel?: (index: number, length: number) => string;
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
		readonly validateCharacter?: (character: string) => boolean;
		value?: string;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'pin-input',
		importStatement: "import { ZPinInput } from '@zadmin/zui';",
		name: 'ZPinInput',
		bindings: [
			{ description: '连续PIN字符串。', name: 'value', type: 'string' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ControllableState', 'roving tabindex', 'clipboard', 'FormValue'],
		events: [
			{
				description: '用户编辑后返回规范化PIN。',
				name: 'onValueChange',
				type: '(value: string) => void'
			},
			{
				description: '用户输入达到length时调用。',
				name: 'onComplete',
				type: '(value: string) => void'
			}
		],
		keyboard: [
			{ description: '按direction移动槽位焦点。', key: 'ArrowLeft / ArrowRight / Home / End' },
			{ description: '删除当前或前一槽并移动焦点。', key: 'Backspace / Delete' },
			{ description: '从当前槽开始分配合法字符。', key: 'Paste' }
		],
		parts: [{ description: '单字符原生input。', name: 'input' }],
		props: [
			{ bindable: true, default: "''", description: '连续PIN值。', name: 'value', type: 'string' },
			{ default: "''", description: '非受控初始值。', name: 'defaultValue', type: 'string' },
			{ default: '6', description: '正整数槽位数。', name: 'length', type: 'number' },
			{
				default: "'numeric'",
				description: '默认字符集合与inputmode。',
				name: 'mode',
				type: "'numeric' | 'text'"
			},
			{
				default: 'false',
				description: '以password input隐藏字符。',
				name: 'mask',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '无效视觉和aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'mode规则',
				description: '覆盖字符合法性。',
				name: 'validateCharacter',
				type: '(character: string) => boolean'
			},
			{ default: 'undefined', description: '单一隐藏表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.5.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZPinInput.svelte',
		states: [
			{ description: 'PIN达到length。', name: 'data-complete', values: ['true'] },
			{ description: '当前roving槽。', name: 'data-active', values: ['true'] }
		],
		status: 'experimental',
		summary: '单一字符串状态、roving槽位、分配粘贴与表单桥接的PIN输入。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.gap._medium;
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.opacity._disabled } },
		defaultVariants: { disabled: false }
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
			s.fontFamily._mono;
			s.fontSize._large;
			s.fontWeight._semibold;
			s.height._large;
			s.textAlign.center;
			s.width._large;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			invalid: { false: (s) => s.borderColor._border, true: (s) => s.borderColor._danger }
		},
		defaultVariants: { invalid: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
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
		style,
		validateCharacter,
		value = $bindable(),
		...rest
	}: ZPinInputProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'pin-input'));
	const idBase = $derived(field?.controlId ?? generatedId);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLength = $derived.by(() => {
		if (!Number.isInteger(length) || length < 1)
			throw new TypeError('ZPinInput length must be a positive integer.');
		return length;
	});
	function isAllowed(character: string): boolean {
		return validateCharacter
			? validateCharacter(character)
			: mode === 'numeric'
				? /^[0-9]$/u.test(character)
				: character.trim().length > 0;
	}
	function normalize(source: string): string {
		return Array.from(source).filter(isAllowed).slice(0, resolvedLength).join('');
	}
	const valueState = new ControllableState<string>({
		defaultValue: () => normalize(defaultValue),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalize(valueState.current));
	const characters = $derived(Array.from(resolvedValue));
	const defaultCharacters = $derived(Array.from(normalize(defaultValue)));
	const complete = $derived(characters.length === resolvedLength);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	let activeIndex = $state(
		untrack(() => Math.min(Array.from(normalize(defaultValue)).length, resolvedLength - 1))
	);
	let proxy = $state<HTMLInputElement | null>(null);
	const tabIndex = $derived(Math.min(activeIndex, resolvedLength - 1));
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled: resolvedDisabled }));
	const inputClass = $derived(zui.recipe(inputRecipe, { invalid: resolvedInvalid }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		valueState.reset();
		activeIndex = 0;
	}
	function focus(index: number): void {
		const next = Math.max(0, Math.min(resolvedLength - 1, index));
		activeIndex = next;
		inputs[next]?.focus({ preventScroll: true });
		inputs[next]?.select();
	}
	function commit(next: string, nextFocus?: number): void {
		const normalized = normalize(next);
		const changed = normalized !== resolvedValue;
		valueState.setFromUser(normalized);
		if (changed && normalized.length === resolvedLength) onComplete?.(normalized);
		if (nextFocus !== undefined) queueMicrotask(() => focus(nextFocus));
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
		const character = Array.from(event.currentTarget.value).filter(isAllowed).at(-1) ?? '';
		replaceAt(index, character);
		if (!character) event.currentTarget.value = characters[index] ?? '';
	}
	function handleKeydown(event: KeyboardEvent, index: number): void {
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
		if (resolvedDisabled || resolvedReadonly) return;
		const pasted = normalize(event.clipboardData?.getData('text') ?? '');
		if (!pasted) return;
		event.preventDefault();
		const next = [...characters];
		const start = Math.min(index, next.length);
		for (const [offset, character] of Array.from(pasted).entries()) {
			if (start + offset >= resolvedLength) break;
			next[start + offset] = character;
		}
		const focusIndex = Math.min(start + Array.from(pasted).length, resolvedLength - 1);
		commit(next.join(''), focusIndex);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={resolvedDisabled || undefined}
	data-complete={complete || undefined}
	data-invalid={resolvedInvalid || undefined}
>
	{#each Array.from({ length: resolvedLength }, (_, index) => index) as index (index)}
		<input
			bind:this={inputs[index]}
			class={inputClass}
			id={index === 0 ? idBase : `${idBase}-${index + 1}`}
			type={mask ? 'password' : 'text'}
			inputmode={mode === 'numeric' ? 'numeric' : 'text'}
			autocomplete={index === 0 ? 'one-time-code' : 'off'}
			defaultValue={defaultCharacters[index] ?? ''}
			value={characters[index] ?? ''}
			maxlength={mode === 'numeric' ? 1 : undefined}
			disabled={resolvedDisabled}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			tabindex={index === tabIndex ? 0 : -1}
			aria-label={inputLabel?.(index, resolvedLength) ??
				(field && index === 0 ? undefined : `Digit ${index + 1} of ${resolvedLength}`)}
			aria-describedby={resolvedDescribedBy}
			aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
			data-slot="input"
			data-active={activeIndex === index || undefined}
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
<input
	bind:this={proxy}
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	disabled
	{form}
	use:formReset={resetFromForm}
/>
{#if resolvedName && !resolvedDisabled}<input
		type="hidden"
		{form}
		name={resolvedName}
		value={resolvedValue}
	/>{/if}
