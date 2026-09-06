<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';

	export interface ZNativeSelectOption {
		readonly disabled?: boolean;
		readonly label: string;
		readonly value: string;
	}

	export interface ZNativeSelectGroup {
		readonly disabled?: boolean;
		readonly label: string;
		readonly options: readonly ZNativeSelectOption[];
	}

	export type ZNativeSelectItem = ZNativeSelectOption | ZNativeSelectGroup;

	interface ZNativeSelectBaseProps extends Omit<
		HTMLSelectAttributes,
		'children' | 'defaultValue' | 'multiple' | 'readonly' | 'size' | 'value'
	> {
		readonly invalid?: boolean;
		readonly nativeSize?: number;
		readonly onFormReset?: () => void;
		readonly readonly?: boolean;
		readonly resetOnForm?: boolean;
		readonly size?: ZControlSize;
		ref?: HTMLSelectElement | null;
	}

	type ZNativeSelectSource =
		| { readonly items: readonly ZNativeSelectItem[]; readonly children?: never }
		| { readonly children: Snippet; readonly items?: never };

	type ZNativeSelectSingleProps = {
		readonly defaultValue?: string;
		readonly multiple?: false;
		readonly onValueChange?: (value: string) => void;
		readonly placeholder?: string;
		value?: string;
	};

	type ZNativeSelectMultipleProps = {
		readonly defaultValue?: readonly string[];
		readonly multiple: true;
		readonly onValueChange?: (value: readonly string[]) => void;
		readonly placeholder?: never;
		value?: readonly string[];
	};

	export type ZNativeSelectProps = ZNativeSelectBaseProps &
		ZNativeSelectSource &
		(ZNativeSelectSingleProps | ZNativeSelectMultipleProps);

	export const zuiMetadata = {
		bindings: [
			{
				name: 'value',
				type: 'string | readonly string[]',
				description: '原生单选字符串或多选字符串数组。'
			},
			{ name: 'ref', type: 'HTMLSelectElement | null', description: '真实select引用。' }
		],
		category: 'input',
		dependencies: [
			'native select/option/optgroup',
			'ControllableState',
			'FieldContext',
			'inputControlRecipe'
		],
		events: [
			{
				name: 'onValueChange',
				type: '(value: string | readonly string[]) => void',
				description: '仅原生用户选择变化时调用；多选数组按selectedOptions DOM顺序冻结。'
			},
			{
				name: 'onFormReset',
				type: '() => void',
				description: '原生default action后状态恢复完成回调。'
			}
		],
		id: 'native-select',
		importStatement: "import { ZNativeSelect } from '@zadmin/zui';",
		keyboard: [
			{ key: 'Arrow / Home / End / Page', description: '非readonly时保留浏览器原生select导航。' },
			{ key: 'Space / Enter', description: '保留浏览器原生select弹出与选择行为。' }
		],
		name: 'ZNativeSelect',
		parts: [
			{ name: 'option', description: 'items模式的真实option。' },
			{ name: 'group', description: 'items模式的真实optgroup。' }
		],
		props: [
			{
				name: 'items',
				type: 'readonly ZNativeSelectItem[]',
				default: '与children二选一',
				requiredWhen: '未提供children手写模式时',
				description: '生成真实option/optgroup的数据源。',
				members: [
					{
						name: 'label',
						type: 'string',
						required: true,
						description: 'option或optgroup的非空可见标签。'
					},
					{
						name: 'value',
						type: 'string',
						requiredWhen: 'ZNativeSelectOption分支',
						description: '全局唯一的原生字符串option值。'
					},
					{
						name: 'disabled',
						type: 'boolean',
						required: false,
						description: '禁用option或整个optgroup。'
					},
					{
						name: 'options',
						type: 'readonly ZNativeSelectOption[]',
						requiredWhen: 'ZNativeSelectGroup分支',
						description: 'optgroup拥有的原生option数据。',
						members: [
							{
								name: 'label',
								type: 'string',
								requiredWhen: 'ZNativeSelectGroup.options中的option',
								description: '非空option标签。'
							},
							{
								name: 'value',
								type: 'string',
								requiredWhen: 'ZNativeSelectGroup.options中的option',
								description: '全局唯一的原生字符串值。'
							},
							{
								name: 'disabled',
								type: 'boolean',
								required: false,
								description: '禁用当前option。'
							}
						]
					}
				]
			},
			{
				name: 'multiple',
				type: 'false | true',
				default: 'false',
				requiredWhen: 'multiple readonly string[]分支为true；single string分支省略或false',
				description: '切换原生single string或multiple readonly string[]合同。'
			},
			{
				name: 'value',
				type: 'string | readonly string[]',
				default: 'undefined',
				description: '受控或可绑定原生选择；undefined保留浏览器首项/selected默认。',
				bindable: true
			},
			{
				name: 'defaultValue',
				type: 'string | readonly string[]',
				default: 'undefined',
				description: '非受控初值和form reset目标；undefined不强写空值。'
			},
			{
				name: 'onValueChange',
				type: '(value: string | readonly string[]) => void',
				default: 'undefined',
				description: '用户选择值回调。'
			},
			{
				name: 'placeholder',
				type: 'string',
				default: 'undefined',
				description: 'single模式首个空值option；required时不可重新选择。'
			},
			{
				name: 'nativeSize',
				type: 'number',
				default: 'undefined',
				description: '原生select size可见行数，与视觉size分离。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Field → componentDefaults.nativeSelect → input → density',
				description: '共享input chrome的五档视觉尺寸。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: '继承Field/InputGroup或false',
				description: '原生disabled并退出FormData。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: '继承Field/InputGroup或false',
				description: '保持focus与FormData，阻止用户选择写入。'
			},
			{
				name: 'required',
				type: 'boolean',
				default: '继承Field/InputGroup或false',
				description: '原生required有效性。'
			},
			{
				name: 'invalid',
				type: 'boolean',
				default: '继承Field/InputGroup或false',
				description: '共享input invalid chrome与aria-invalid。'
			},
			{
				name: 'name',
				type: 'string',
				default: '继承Field/InputGroup或undefined',
				description: '原生FormData字段名。'
			},
			{ name: 'form', type: 'string', default: 'undefined', description: '原生外部form关联。' },
			{
				name: 'resetOnForm',
				type: 'boolean',
				default: 'true',
				description: '是否恢复defaultValue。'
			},
			{
				name: 'onFormReset',
				type: '() => void',
				default: 'undefined',
				description: 'reset完成回调。'
			},
			{
				name: 'ref',
				type: 'HTMLSelectElement | null',
				default: 'null',
				description: '真实select引用。',
				bindable: true
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'children',
				type: 'Snippet',
				requiredWhen: '未提供items数据模式时',
				description: '直接提供原生option/optgroup；不得与items同时提供。'
			}
		],
		source: 'ui/zui/src/components/input/ZNativeSelect.svelte',
		states: [
			{ name: 'data-multiple', values: ['true'], description: '原生multiple模式。' },
			{ name: 'data-disabled', values: ['true'], description: 'Field/InputGroup或显式禁用。' },
			{ name: 'data-readonly', values: ['true'], description: '阻止用户选择写入但保留表单值。' },
			{ name: 'data-invalid', values: ['true'], description: 'Field/InputGroup或显式无效。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的五档视觉尺寸。'
			}
		],
		status: 'experimental',
		summary: '以真实select/option/optgroup保留浏览器选择、FormData和有效性，并共享ZInput视觉基础。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { useZField } from '../../runtime/form/field-context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import { inputControlRecipe } from './input-control.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		children,
		class: className,
		defaultValue,
		disabled = false,
		form,
		id,
		invalid,
		items,
		multiple = false,
		name,
		nativeSize,
		onchange,
		onFormReset,
		oninput,
		onkeydown,
		onpointerdown,
		onValueChange,
		placeholder,
		readonly = false,
		ref = $bindable(null),
		required = false,
		resetOnForm = true,
		size,
		style,
		value = $bindable(),
		...rest
	}: ZNativeSelectProps = $props();
	const zui = useZui();
	const field = useZField();
	const inputGroup = useZInputGroup();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const resolvedDisabled = $derived(disabled || inputGroup?.disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || inputGroup?.readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || inputGroup?.required || field?.required || false);
	const resolvedInvalid = $derived(invalid ?? inputGroup?.invalid ?? field?.invalid ?? false);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				inputGroup?.size ??
				field?.size ??
				zui.componentDefaults.nativeSelect?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const sourceItems = $derived(validateItems(items, children));
	const resolvedNativeSize = $derived.by(() => {
		if (placeholder !== undefined && (typeof placeholder !== 'string' || !placeholder.trim()))
			throw new TypeError('ZNativeSelect placeholder must not be empty.');
		if (multiple && placeholder !== undefined)
			throw new TypeError('ZNativeSelect placeholder is only available in single mode.');
		if (nativeSize !== undefined && (!Number.isSafeInteger(nativeSize) || nativeSize < 1))
			throw new TypeError('ZNativeSelect nativeSize must be a positive safe integer.');
		return nativeSize;
	});
	// Native selected attributes establish SSR output and the browser reset baseline.
	// They are construction-time defaults; the select value property owns later updates.
	const initialSelection = untrack(() => normalize(value ?? defaultValue, 'initial value'));
	const valueState = new ControllableState<string | readonly string[] | undefined>({
		defaultValue: () => normalize(defaultValue, 'defaultValue'),
		onChange: () => (next) => {
			if (multiple)
				(onValueChange as ((value: readonly string[]) => void) | undefined)?.(
					next as readonly string[]
				);
			else (onValueChange as ((value: string) => void) | undefined)?.(next as string);
		},
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next as never)
	});
	const resolvedValue = $derived(normalize(valueState.current, 'value'));
	const uid = $props.id();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'native-select'));
	const resolvedName = $derived(name ?? inputGroup?.name ?? field?.name);
	const resolvedDescribedBy = $derived(
		mergeAriaIds(ariaDescribedBy, inputGroup?.describedBy, field?.describedBy)
	);
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(
		zui.recipe(inputControlRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			motion: reduced ? 'reduced' : 'full',
			readonly: resolvedReadonly,
			size: resolvedSize
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const unregisterInputGroupControl = inputGroup?.registerControl({
		focus() {
			ref?.focus({ preventScroll: true });
		}
	});
	let browserMounted = false;
	let readonlySnapshot: string | readonly string[] | undefined;

	function normalize(
		candidate: string | readonly string[] | undefined,
		name: string
	): string | readonly string[] | undefined {
		if (candidate === undefined) return undefined;
		if (multiple) {
			if (!Array.isArray(candidate) || candidate.some((entry) => typeof entry !== 'string'))
				throw new TypeError(`ZNativeSelect ${name} must be a string array in multiple mode.`);
			if (new Set(candidate).size !== candidate.length)
				throw new TypeError(`ZNativeSelect ${name} values must be unique.`);
			return Object.freeze([...candidate]);
		}
		if (typeof candidate !== 'string')
			throw new TypeError(`ZNativeSelect ${name} must be a string in single mode.`);
		return candidate;
	}
	function validateOption(option: ZNativeSelectOption, values: Set<string>): void {
		if (!option || typeof option !== 'object')
			throw new TypeError('ZNativeSelect options must be objects.');
		if (typeof option.value !== 'string')
			throw new TypeError('ZNativeSelect option values must be strings.');
		if (values.has(option.value))
			throw new TypeError('ZNativeSelect option values must be unique.');
		values.add(option.value);
		if (typeof option.label !== 'string' || !option.label.trim())
			throw new TypeError('ZNativeSelect option labels must not be empty.');
	}
	function validateItems(
		candidate: readonly ZNativeSelectItem[] | undefined,
		content: Snippet | undefined
	): readonly ZNativeSelectItem[] | undefined {
		if ((candidate === undefined) === (content === undefined))
			throw new TypeError('ZNativeSelect requires exactly one of items or children.');
		if (candidate === undefined) return undefined;
		if (!Array.isArray(candidate)) throw new TypeError('ZNativeSelect items must be an array.');
		const values = new Set<string>();
		for (const entry of candidate) {
			if (!entry || typeof entry !== 'object')
				throw new TypeError('ZNativeSelect items must contain objects.');
			if ('options' in entry) {
				if (typeof entry.label !== 'string' || !entry.label.trim())
					throw new TypeError('ZNativeSelect group labels must not be empty.');
				if (!Array.isArray(entry.options))
					throw new TypeError('ZNativeSelect group options must be an array.');
				for (const option of entry.options) validateOption(option, values);
			} else validateOption(entry, values);
		}
		if (placeholder !== undefined && values.has(''))
			throw new TypeError('ZNativeSelect placeholder conflicts with an empty option value.');
		return candidate;
	}
	function readNative(target: HTMLSelectElement): string | readonly string[] {
		return multiple
			? Object.freeze([...target.selectedOptions].map((option) => option.value))
			: target.value;
	}
	function initiallySelected(optionValue: string): boolean | undefined {
		if (!multiple || !Array.isArray(initialSelection)) return undefined;
		return initialSelection.includes(optionValue);
	}
	function synchronize(
		target: HTMLSelectElement,
		selected: string | readonly string[] | undefined
	): void {
		if (selected === undefined) return;
		const values = new Set(Array.isArray(selected) ? selected : [selected]);
		for (const option of target.options) option.selected = values.has(option.value);
	}
	function commit(event: Event & { currentTarget: HTMLSelectElement }): void {
		if (resolvedReadonly) {
			synchronize(event.currentTarget, readonlySnapshot ?? resolvedValue);
			return;
		}
		valueState.setFromUser(readNative(event.currentTarget));
	}
	function handleInput(event: Event & { currentTarget: HTMLSelectElement }): void {
		commit(event);
		oninput?.(event);
	}
	function handleChange(event: Event & { currentTarget: HTMLSelectElement }): void {
		commit(event);
		onchange?.(event);
	}
	function handlePointerdown(event: PointerEvent & { currentTarget: HTMLSelectElement }): void {
		onpointerdown?.(event);
		if (!event.defaultPrevented && resolvedReadonly) {
			readonlySnapshot = readNative(event.currentTarget);
			event.preventDefault();
		}
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLSelectElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			!resolvedReadonly ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey
		)
			return;
		readonlySnapshot = readNative(event.currentTarget);
		if (
			[
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
				'ArrowUp',
				'End',
				'Home',
				'PageDown',
				'PageUp',
				' ',
				'Enter'
			].includes(event.key) ||
			event.key.length === 1
		)
			event.preventDefault();
	}
	function reset(): void {
		if (resetOnForm) valueState.reset();
		onFormReset?.();
	}

	onMount(() => {
		browserMounted = true;
		return reducedMotion.connect(ref?.ownerDocument.defaultView);
	});
	onDestroy(() => {
		if (browserMounted) unregisterInputGroupControl?.();
	});
</script>

<select
	{...rest}
	dir={rest.dir ?? (inputGroup ? undefined : zui.direction)}
	bind:this={ref}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	aria-readonly={resolvedReadonly || undefined}
	class={[rootClass, className]}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-multiple={multiple || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-reduced-motion={reduced || undefined}
	data-size={resolvedSize}
	data-zui-input-group-control={inputGroup ? '' : undefined}
	disabled={resolvedDisabled}
	{form}
	id={id ?? inputGroup?.controlId ?? field?.controlId ?? generatedId}
	{multiple}
	name={resolvedName}
	onchange={handleChange}
	oninput={handleInput}
	onkeydown={handleKeydown}
	onpointerdown={handlePointerdown}
	required={resolvedRequired}
	size={resolvedNativeSize}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	value={resolvedValue}
>
	{#if placeholder !== undefined}<option
			value=""
			disabled={resolvedRequired}
			selected={initiallySelected('')}>{placeholder}</option
		>{/if}
	{#if sourceItems}
		{#each sourceItems as entry, index (`${'options' in entry ? 'group' : 'option'}:${index}`)}
			{#if 'options' in entry}
				<optgroup label={entry.label} disabled={entry.disabled} data-slot="group">
					{#each entry.options as option (option.value)}
						<option
							value={option.value}
							disabled={option.disabled}
							selected={initiallySelected(option.value)}
							data-slot="option">{option.label}</option
						>
					{/each}
				</optgroup>
			{:else}<option
					value={entry.value}
					disabled={entry.disabled}
					selected={initiallySelected(entry.value)}
					data-slot="option">{entry.label}</option
				>{/if}
		{/each}
	{:else}{@render children?.()}{/if}
</select>
{#if resetOnForm || onFormReset}
	<FormResetSignal association={form} control={ref} onReset={reset} />
{/if}
