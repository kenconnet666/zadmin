<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
	import type { CheckboxGroupValue } from '../../../runtime/form/checkbox-group.js';
	import type { CheckboxGroupTone } from './context.svelte.js';
	import { defineRecipe } from '../../../recipes/define.js';

	export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

	export interface ZCheckboxGroupOption<TKey extends PublicSelectionKey = PublicSelectionKey> {
		readonly disabled?: boolean;
		readonly label: string;
		readonly textValue?: string;
		readonly value: TKey;
	}

	interface ZCheckboxGroupBaseProps<
		TKey extends PublicSelectionKey = PublicSelectionKey
	> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-disabled' | 'aria-invalid' | 'aria-readonly' | 'aria-required' | 'children' | 'role'
	> {
		readonly defaultValue?: CheckboxGroupValue<TKey>;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly maxSelected?: number;
		readonly minSelected?: number;
		readonly name?: string;
		readonly onValueChange?: (value: CheckboxGroupValue<TKey>) => void;
		readonly orientation?: CheckboxGroupOrientation;
		readonly preserveUnknownValues?: boolean;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly tone?: CheckboxGroupTone;
		readonly validationMessage?: string;
		value?: CheckboxGroupValue<TKey>;
	}

	export type ZCheckboxGroupProps<TKey extends PublicSelectionKey = PublicSelectionKey> =
		ZCheckboxGroupBaseProps<TKey> &
			(
				| {
						readonly children?: never;
						readonly options: readonly ZCheckboxGroupOption<TKey>[];
				  }
				| {
						readonly children: Snippet;
						readonly options?: never;
				  }
			);

	const checkboxGroupRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.flex;
				s.minWidth.px(0);
			},
			variants: {
				orientation: {
					horizontal: (s) => {
						s.alignItems.center;
						s.flexDirection.row;
						s.flexWrap.wrap;
					},
					vertical: (s) => s.flexDirection.column
				},
				size: {
					xsmall: (s) => s.gap._xsmall,
					small: (s) => s.gap._small,
					medium: (s) => s.gap._medium,
					large: (s) => s.gap._large,
					xlarge: (s) => s.gap._xlarge
				}
			},
			defaultVariants: { orientation: 'vertical', size: 'medium' }
		},
		import.meta
	);

	export const zuiMetadata = {
		bindings: [
			{
				description: '按集合顺序规范化的typed选择数组。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{ description: '真实group根div。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'ZCheckbox',
			'FormControlState',
			'LogicalCollection',
			'SelectionModel',
			'MountedElements',
			'FormResetSignal',
			'Field'
		],
		events: [
			{
				description: '真实用户选择变化后调用一次；reset、外部同步与移除项协调不调用。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			}
		],
		id: 'checkbox-group',
		importStatement:
			"import { ZCheckboxGroup, ZCheckboxGroupItem, ZCheckboxGroupSelectAll } from '@zadmin/zui';",
		keyboard: [
			{ description: '每项保持普通原生Tab顺序。', key: 'Tab / Shift+Tab' },
			{ description: '可编辑时切换当前真实checkbox。', key: 'Space' }
		],
		name: 'ZCheckboxGroup',
		parts: [{ description: '拥有组名、状态和公开class/style/ref的group根。', name: 'root' }],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前typed选择数组；已挂载值按集合顺序输出。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初值和form reset基线。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'undefined（compound模式）',
				description: '数据化选项；不能与children同时提供。',
				name: 'options',
				requiredWhen: '未提供children compound模式时',
				type: 'readonly ZCheckboxGroupOption[]',
				members: [
					{ description: '稳定typed业务值。', name: 'value', required: true, type: 'SelectionKey' },
					{ description: '可见且可访问的项标签。', name: 'label', required: true, type: 'string' },
					{ description: '禁用当前真实checkbox。', name: 'disabled', type: 'boolean' },
					{ description: '集合诊断文本；省略时使用label。', name: 'textValue', type: 'string' }
				]
			},
			{
				default: 'undefined',
				description: '所有已选真实checkbox共享的FormData name。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '各真实checkbox关联的外部form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: '0',
				description: '用户取消选择时保持的最小选择数。',
				name: 'minSelected',
				type: 'number'
			},
			{
				default: 'undefined',
				description: '允许的最大选择数；达到后仍可取消。',
				name: 'maxSelected',
				type: 'number'
			},
			{
				default: 'false',
				description: '要求至少选择一项，并向第一个可用真实input投射native required。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用所有真实checkbox和FormData参与。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保留焦点与FormData但阻止用户修改。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '组与各项的错误语义。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'vertical',
				description: '视觉排列方向；不改变原生Tab顺序。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				default: 'false',
				description: 'options移除或compound item卸载后是否保留未知typed值。',
				name: 'preserveUnknownValues',
				type: 'boolean'
			},
			{
				default: 'Field → componentDefaults.checkboxGroup → componentDefaults.checkbox → density',
				description: '组内默认checkbox尺寸和间距。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'componentDefaults.checkboxGroup → componentDefaults.checkbox → primary',
				description: '组内默认checkbox语义色调。',
				name: 'tone',
				type: 'CheckboxGroupTone'
			},
			{
				default: '内建min/max英文消息',
				description: '组选择数不满足边界时写入真实input customValidity的消息。',
				name: 'validationMessage',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实group根div。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: 'compound模式的Item、SelectAll及其label。',
				name: 'children',
				requiredWhen: '未提供options数据模式时',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/checkbox-group/ZCheckboxGroup.svelte',
		states: [
			{
				name: 'data-required',
				values: ['true'],
				description: '组有最小选择要求；原生validity由可用input拥有。'
			},
			{
				description: '视觉排列方向。',
				name: 'data-orientation',
				values: ['horizontal', 'vertical']
			},
			{ description: '禁用组。', name: 'data-disabled', values: ['true'] },
			{ description: '只读组。', name: 'data-readonly', values: ['true'] },
			{ description: '显式或Field错误状态。', name: 'data-invalid', values: ['true'] },
			{
				description: '当前选择数不满足min/max。',
				name: 'data-selection-invalid',
				values: ['true']
			},
			{
				description: '五档组内control尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{
				description: '组内checkbox语义色调。',
				name: 'data-tone',
				values: ['primary', 'neutral', 'info', 'success', 'warning', 'danger']
			}
		],
		status: 'experimental',
		summary: '以真实ZCheckbox重复提交、typed多选、组约束和mixed全选组成的CheckboxGroup。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { onDestroy, untrack } from 'svelte';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../../runtime/collection/selection-model.js';
	import type { Selection } from '../../../runtime/collection/selection.js';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../../runtime/form/form-value-adapter.svelte.js';
	import { resolveControlSize } from '../../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import {
		checkboxGroupSelectionState,
		normalizeCheckboxGroupValue,
		orderCheckboxGroupValue,
		toggleAllCheckboxGroupValues
	} from '../../../runtime/form/checkbox-group.js';
	import FormResetSignal from '../../../runtime/form/FormResetSignal.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZCheckboxGroupItem from './ZCheckboxGroupItem.svelte';
	import {
		provideZCheckboxGroup,
		type CheckboxGroupCollectionItem,
		type CheckboxGroupLogicalItem,
		type ZCheckboxGroupContext
	} from './context.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className,
		defaultValue = [],
		disabled: disabledProp = false,
		form,
		id,
		invalid,
		maxSelected,
		minSelected = 0,
		name: nameProp,
		onValueChange,
		options,
		orientation = 'vertical',
		preserveUnknownValues = false,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		size: sizeProp,
		style,
		tone: toneProp,
		validationMessage,
		value = $bindable(),
		...rest
	}: ZCheckboxGroupProps<TKey> = $props();

	const zui = useZui();
	const valueScope = claimFormValueScope();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'checkbox-group'));
	const controlId = $derived(id ?? field?.controlId ?? idBase);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const required = $derived(requiredProp || (field?.required ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			sizeProp ??
				field?.size ??
				zui.componentDefaults.checkboxGroup?.size ??
				zui.componentDefaults.checkbox?.size,
			zui.density
		)
	);
	const resolvedTone = $derived(
		toneProp ??
			zui.componentDefaults.checkboxGroup?.tone ??
			zui.componentDefaults.checkbox?.tone ??
			'primary'
	);
	const minimum = $derived.by(() => {
		if (!Number.isSafeInteger(minSelected) || minSelected < 0)
			throw new TypeError('ZCheckboxGroup minSelected must be a non-negative safe integer.');
		return Math.max(minSelected, required ? 1 : 0);
	});
	const maximum = $derived.by(() => {
		if (maxSelected === undefined) return undefined;
		if (!Number.isSafeInteger(maxSelected) || maxSelected < 0)
			throw new TypeError('ZCheckboxGroup maxSelected must be a non-negative safe integer.');
		if (maxSelected < minimum)
			throw new TypeError(
				'ZCheckboxGroup maxSelected must be greater than or equal to its effective minimum.'
			);
		return maxSelected;
	});
	const valueState = createFormControlState<CheckboxGroupValue<TKey>>(
		{
			defaultValue: () => normalizeCheckboxGroupValue(defaultValue),
			element: () => ref,
			normalizeModelValue: (candidate) => {
				if (candidate === undefined) return Object.freeze([]);
				if (!Array.isArray(candidate))
					throw new TypeError(
						'ZCheckboxGroup model value must be a SelectionKey array or undefined.'
					);
				return normalizeCheckboxGroupValue(
					candidate as CheckboxGroupValue<TKey>,
					'ZCheckboxGroup model'
				);
			},
			onChange: () => onValueChange,
			owner: 'ZCheckboxGroup',
			read: () => value,
			syncNative: (next) => synchronizeNative(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	const resolvedValue = $derived(normalizeCheckboxGroupValue(valueState.current));
	const selected = $derived(new Set(resolvedValue));
	const mounted = new MountedElements<TKey, HTMLInputElement>();
	// Select-all elements are imperative reset mirrors; membership never drives rendering.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const selectAllControls = new Set<() => HTMLInputElement | null>();
	const compound = new CompoundLogicalCollectionRegistry<TKey, CheckboxGroupLogicalItem<TKey>>(
		mounted
	);
	const collection = $derived.by(() => {
		if (options === undefined) return compound.collection;
		if (children !== undefined)
			throw new TypeError('ZCheckboxGroup accepts either options or children, not both.');
		return new LogicalCollection<TKey, CheckboxGroupLogicalItem<TKey>>(
			options.map((option) => ({
				disabled: option.disabled ?? false,
				key: option.value,
				label: option.label,
				selectionDisabled: false,
				textValue: option.textValue ?? option.label
			})),
			{
				disabled: (item) => item.disabled ?? false,
				key: (item) => item.key,
				selectionDisabled: (item) => item.selectionDisabled ?? false,
				textValue: (item) => item.textValue
			},
			{ name: 'ZCheckboxGroup options' }
		);
	});
	const view = $derived(collection.full);
	const enabledKeys = $derived(
		view.items.filter((item) => !item.disabled && !item.selectionDisabled).map((item) => item.key)
	);
	let nativeDisabledRevision = $state(0);
	const actionableKeys = $derived.by(() => {
		nativeDisabledRevision;
		const mountedKeys = enabledKeys.filter((key) => mounted.has(key));
		if (mountedKeys.length === 0) return enabledKeys;
		return mountedKeys.filter((key) => !mounted.get(key)?.element.matches(':disabled'));
	});
	const selectionState = $derived(
		checkboxGroupSelectionState(resolvedValue, actionableKeys, maximum)
	);
	const nativeSelectedCount = $derived(actionableKeys.filter((key) => selected.has(key)).length);
	const allLogicalItemsDisabled = $derived(view.items.length > 0 && actionableKeys.length === 0);
	const selectionInvalid = $derived(
		!disabled &&
			!allLogicalItemsDisabled &&
			(nativeSelectedCount < minimum || (maximum !== undefined && nativeSelectedCount > maximum))
	);
	const resolvedValidationMessage = $derived.by(() => {
		if (validationMessage !== undefined && validationMessage.trim().length === 0)
			throw new TypeError('ZCheckboxGroup validationMessage must not be empty.');
		return validationMessage;
	});
	const classes = $derived(zui.recipe(checkboxGroupRecipe, { orientation, size: resolvedSize }));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(
		ariaLabelledBy ?? (ariaLabel === undefined ? field?.labelId : undefined)
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const resetControl = $derived.by(() => {
		for (const key of view.keys) {
			const element = mounted.get(key)?.element;
			if (element) return element;
		}
		return null;
	});
	const selection = new SelectionModel<TKey, CheckboxGroupLogicalItem<TKey>>({
		collection: () => collection,
		mode: () => 'multiple',
		read: () => new Set(resolvedValue),
		view: () => view,
		write: ({ selection: next }) => commitSelection(next)
	});
	let selectionChanged = false;
	let ownerActive = true;
	let validityOwner: HTMLInputElement | null = null;
	let firstRequiredKey: TKey | undefined;
	onDestroy(() => {
		ownerActive = false;
		validityOwner?.setCustomValidity('');
		validityOwner = null;
	});

	function valuesFromSelection(next: Selection<TKey>): CheckboxGroupValue<TKey> {
		if (next === 'all') return actionableKeys;
		return orderCheckboxGroupValue([...next], view.keys, true);
	}

	function mayMoveTo(candidate: CheckboxGroupValue<TKey>): boolean {
		if (
			maximum !== undefined &&
			candidate.length > maximum &&
			candidate.length > resolvedValue.length
		)
			return false;
		if (candidate.length < minimum && candidate.length < resolvedValue.length) return false;
		return true;
	}

	function commitSelection(next: Selection<TKey>): void {
		const candidate = valuesFromSelection(next);
		selectionChanged =
			mayMoveTo(candidate) &&
			!sameValue(candidate, resolvedValue) &&
			valueState.setFromUser(candidate);
	}

	function sameValue(left: CheckboxGroupValue<TKey>, right: CheckboxGroupValue<TKey>): boolean {
		return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
	}

	function writeSilently(next: CheckboxGroupValue<TKey>): void {
		if (!sameValue(resolvedValue, next)) valueState.reconcile(next);
	}

	function removeUnknownValues(): void {
		if (preserveUnknownValues) return;
		writeSilently(orderCheckboxGroupValue(resolvedValue, view.keys, false));
	}

	function focusPreferred(): void {
		for (const key of actionableKeys) {
			const element = mounted.get(key)?.element;
			if (element && !element.matches(':disabled')) {
				element.focus({ preventScroll: true });
				return;
			}
		}
	}

	function synchronizeNative(next: CheckboxGroupValue<TKey>): void {
		const nextSelected = new Set(next);
		for (const key of view.keys) {
			const element = mounted.get(key)?.element;
			if (!element) continue;
			element.checked = nextSelected.has(key);
			element.indeterminate = false;
		}
		const nextState = checkboxGroupSelectionState(next, actionableKeys, maximum);
		for (const readControl of selectAllControls) {
			const element = readControl();
			if (!element) continue;
			element.checked = nextState.all;
			element.indeterminate = nextState.mixed;
		}
	}

	const context: ZCheckboxGroupContext<TKey> = {
		get defaultValue() {
			return normalizeCheckboxGroupValue(defaultValue);
		},
		defaultChecked(itemValue) {
			return normalizeCheckboxGroupValue(defaultValue).some((key) => Object.is(key, itemValue));
		},
		get disabled() {
			return disabled;
		},
		get form() {
			return form;
		},
		get invalid() {
			return resolvedInvalid || selectionInvalid;
		},
		isNativeRequired(itemValue, itemDisabled) {
			if (minimum === 0 || !selectionState.empty) return false;
			if (mounted.size === 0) {
				if (!itemDisabled && firstRequiredKey === undefined) firstRequiredKey = itemValue;
				return Object.is(firstRequiredKey, itemValue);
			}
			return Object.is(actionableKeys[0], itemValue);
		},
		isSelected(itemValue) {
			return selected.has(itemValue);
		},
		get name() {
			return resolvedName;
		},
		get readonly() {
			return readonly;
		},
		register(read) {
			const current = read();
			const stopLogical =
				options === undefined
					? compound.register(() => {
							const item = read();
							return {
								disabled: item.disabled,
								key: item.key,
								selectionDisabled: item.selectionDisabled,
								textValue: item.textValue
							};
						})
					: () => undefined;
			if (options !== undefined && collection.get(current.key) === undefined) {
				stopLogical();
				throw new Error(
					`ZCheckboxGroupItem value "${String(current.key)}" is not present in authoritative options.`
				);
			}
			const stopMount = current.element
				? mounted.mount(current.key, current.element, current.id)
				: () => undefined;
			return () => {
				stopMount();
				stopLogical();
				if (options === undefined && !preserveUnknownValues) {
					queueMicrotask(() => {
						if (ownerActive) removeUnknownValues();
					});
				}
			};
		},
		registerSelectAll(element) {
			selectAllControls.add(element);
			return () => {
				selectAllControls.delete(element);
			};
		},
		restoreNativeSelection() {
			synchronizeNative(resolvedValue);
		},
		get size() {
			return resolvedSize;
		},
		selectAllState() {
			return selectionState.all ? true : selectionState.mixed ? 'indeterminate' : false;
		},
		get tone() {
			return resolvedTone;
		},
		toggle(itemValue) {
			if (disabled || readonly) return false;
			const input = mounted.get(itemValue)?.element;
			if (!input || input.matches(':disabled')) return false;
			selectionChanged = false;
			selection.toggle(itemValue);
			return selectionChanged;
		},
		toggleAll() {
			if (disabled || readonly || actionableKeys.length === 0) return false;
			const candidate = orderCheckboxGroupValue(
				toggleAllCheckboxGroupValues(resolvedValue, actionableKeys, minimum, maximum),
				view.keys,
				true
			);
			if (!mayMoveTo(candidate) || sameValue(candidate, resolvedValue)) return false;
			return valueState.setFromUser(candidate);
		}
	};
	provideZCheckboxGroup(context);

	$effect(() => fieldOwner.registerFocusOwner(focusPreferred));
	$effect(() => {
		if (options === undefined || preserveUnknownValues) return;
		const currentKeys = view.keys;
		untrack(() => {
			writeSilently(orderCheckboxGroupValue(resolvedValue, currentKeys, false));
		});
	});
	$effect(() => {
		const owner =
			actionableKeys
				.map((key) => mounted.get(key)?.element)
				.find((element): element is HTMLInputElement => element !== undefined) ?? null;
		const invalidSelection = selectionInvalid;
		const currentMinimum = minimum;
		const currentMaximum = maximum;
		const currentCount = nativeSelectedCount;
		const message =
			resolvedValidationMessage ??
			(currentCount < currentMinimum
				? zui.localePack.form.minimumSelections(currentMinimum)
				: zui.localePack.form.maximumSelections(currentMaximum ?? currentCount));
		untrack(() => {
			if (validityOwner && validityOwner !== owner) validityOwner.setCustomValidity('');
			validityOwner = owner;
			if (!owner) return;
			owner.setCustomValidity(invalidSelection ? message : '');
		});
	});
	$effect(() => {
		const node = ref;
		if (!node) return;
		const MutationObserverConstructor = node.ownerDocument.defaultView?.MutationObserver;
		if (!MutationObserverConstructor) return;
		const observer = new MutationObserverConstructor(() => {
			nativeDisabledRevision += 1;
		});
		observer.observe(node, {
			attributeFilter: ['disabled'],
			attributes: true,
			childList: true,
			subtree: true
		});
		for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
			if (ancestor.localName === 'fieldset')
				observer.observe(ancestor, { attributeFilter: ['disabled'], attributes: true });
		}
		return () => observer.disconnect();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={controlId}
	role="group"
	dir={rest.dir ?? zui.direction}
	aria-label={ariaLabel}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	aria-disabled={disabled || undefined}
	data-required={minimum > 0 || undefined}
	data-slot="root"
	data-disabled={disabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-selection-invalid={selectionInvalid || undefined}
	data-readonly={readonly || undefined}
	data-size={resolvedSize}
	data-tone={resolvedTone}
	data-orientation={orientation}
>
	{#if options}
		{#each view.items as record (record.key)}
			<ZCheckboxGroupItem
				disabled={record.disabled}
				textValue={record.textValue}
				value={record.key}
			>
				{record.value.label ?? record.textValue}
			</ZCheckboxGroupItem>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>
<FormResetSignal
	association={form}
	control={resetControl}
	onReset={() => {
		valueState.reset();
		selection.resetTransient();
	}}
/>
