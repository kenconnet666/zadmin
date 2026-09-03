<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey as SegmentedSelectionKey } from '../../runtime/collection/selection.js';

	export interface ZSegmentedOption {
		readonly disabled?: boolean;
		readonly label: string;
		readonly value: SegmentedSelectionKey;
	}

	/** @deprecated Use ZSegmentedOption and the options prop. */
	export type SegmentedItem = ZSegmentedOption;

	export interface ZSegmentedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'aria-disabled'
		| 'aria-invalid'
		| 'aria-readonly'
		| 'aria-required'
		| 'onchange'
		| 'readonly'
		| 'role'
	> {
		readonly defaultValue?: SegmentedSelectionKey;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		/** @deprecated Use options. */
		readonly items?: readonly ZSegmentedOption[];
		readonly loop?: boolean;
		readonly name?: string;
		readonly onchange?: (event: Event) => void;
		readonly onValueChange?: (value: SegmentedSelectionKey) => void;
		readonly options?: readonly ZSegmentedOption[];
		readonly orientation?: 'horizontal' | 'vertical';
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		value?: SegmentedSelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'segmented',
		importStatement: "import { ZSegmented } from '@zadmin/zui';",
		name: 'ZSegmented',
		bindings: [
			{ description: '当前typed单选值。', name: 'value', type: 'SelectionKey | undefined' },
			{ description: '真实radiogroup引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'LogicalCollection',
			'MountedElements',
			'CollectionNavigation',
			'SelectionModel',
			'FormValueBridge'
		],
		events: [
			{
				description: '真实用户选择新值后调用一次；owner清空、动态options与reset不调用。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			},
			{
				description: '仅在真实用户改变选择时转发原始pointer或keyboard事件。',
				name: 'onchange',
				type: '(event: Event) => void'
			}
		],
		keyboard: [
			{
				description: '按方向与RTL在可用segment间移动焦点；可编辑时同步选择。',
				key: 'Arrow keys / Home / End'
			},
			{ description: '可编辑时选择当前segment。', key: 'Enter / Space' }
		],
		parts: [{ description: '单个segment按钮。', name: 'item' }],
		props: [
			{
				default: '必填（或兼容items）',
				description: '权威typed value、文本与disabled配置；支持动态替换。',
				name: 'options',
				type: 'readonly ZSegmentedOption[]'
			},
			{
				default: 'undefined',
				description: '兼容旧API的options别名；不能与options同时提供。',
				name: 'items',
				type: 'readonly ZSegmentedOption[]'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前typed value；绑定建立后可由owner显式清为undefined。',
				name: 'value',
				type: 'SelectionKey'
			},
			{
				default: 'undefined',
				description: '非受控初始值，也是表单reset目标。',
				name: 'defaultValue',
				type: 'SelectionKey'
			},
			{
				default: "'horizontal'",
				description: '视觉与键盘方向。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{ default: 'true', description: '方向键到边界时循环。', name: 'loop', type: 'boolean' },
			{
				default: 'false',
				description: '禁用全部segments和FormValueBridge成功值。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: '自身或Field/Form任一readonly',
				description: '保持焦点浏览与FormValue，只阻止pointer和键盘改变选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '同步aria-invalid和危险边框。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '同步radiogroup的aria-required。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '继承Field或undefined',
				description: 'FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			},
			{ default: 'undefined', description: '关联DOM外部form的id。', name: 'form', type: 'string' },
			{
				bindable: true,
				default: 'null',
				description: '真实radiogroup引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZSegmented.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary:
			'以LogicalCollection统一typed options、roving焦点、SelectionModel和FormValue的Segmented。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- DOM id slots are a non-reactive identity cache. */
	import { untrack } from 'svelte';

	import { CollectionNavigation } from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../runtime/collection/selection-model.js';
	import {
		singleSelection,
		type Selection,
		type SelectionKey
	} from '../../runtime/collection/selection.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.gap._xsmall;
			s.padding._xsmall;
		},
		variants: {
			invalid: {
				false: () => undefined,
				true: (s) => s.borderColor._danger
			},
			orientation: {
				horizontal: (s) => s.flexDirection.row,
				vertical: (s) => s.flexDirection.column
			}
		},
		defaultVariants: { invalid: false, orientation: 'horizontal' }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor.transparent;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.fontWeight._semibold;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(1);
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
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.color._primary;
					s.boxShadow._small;
				}
			}
		},
		defaultVariants: { disabled: false, readonly: false, selected: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, itemRecipe);

	interface SegmentMountRegistration {
		readonly disabled: boolean;
		readonly id: string;
		readonly key: SelectionKey;
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		class: className,
		defaultValue,
		disabled: disabledProp = false,
		form,
		id,
		invalid,
		items,
		loop = true,
		name: nameProp,
		onchange,
		onfocusin,
		onfocusout,
		onValueChange,
		options,
		orientation = 'horizontal',
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		style,
		value = $bindable(),
		...rest
	}: ZSegmentedProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'segmented'));
	const controlId = $derived(id ?? field?.controlId ?? idBase);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const required = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(
		ariaLabelledBy ?? (ariaLabel === undefined ? field?.labelId : undefined)
	);
	const sourceOptions = $derived.by(() => {
		if (options !== undefined && items !== undefined) {
			throw new TypeError('ZSegmented accepts either options or items, not both.');
		}
		const source = options ?? items;
		if (source === undefined) throw new TypeError('ZSegmented requires options.');
		return source;
	});
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	const collection = $derived(
		new LogicalCollection<SelectionKey, ZSegmentedOption>(
			sourceOptions,
			{
				disabled: (option) => option.disabled ?? false,
				key: (option) => option.value,
				textValue: (option) => option.label
			},
			{ name: 'ZSegmented options' }
		)
	);
	const view = $derived(collection.full);
	const mounted = new MountedElements<SelectionKey, HTMLButtonElement>();
	const optionSlots = new Map<SelectionKey, number>();
	let nextOptionSlot = 0;
	let activeKey = $state<SelectionKey>();
	let focusWithin = $state(false);
	const navigation = new CollectionNavigation<SelectionKey, ZSegmentedOption>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => orientation,
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const selection = new SelectionModel<SelectionKey, ZSegmentedOption>({
		collection: () => collection,
		mode: () => 'single',
		read: () => singleSelection(valueState.current),
		view: () => view,
		write: ({ selection: next }) => valueState.setFromUser(readSingleValue(next))
	});
	const rootClass = $derived(zui.recipe(rootRecipe, { invalid: resolvedInvalid, orientation }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function readSingleValue(next: Selection<SelectionKey>): SelectionKey | undefined {
		if (next === 'all') return undefined;
		for (const key of next) return key;
		return undefined;
	}

	function optionId(key: SelectionKey): string {
		let slot = optionSlots.get(key);
		if (slot === undefined) {
			slot = nextOptionSlot += 1;
			optionSlots.set(key, slot);
		}
		return `${idBase}-option-${slot}`;
	}

	function preferredFocusKey(): SelectionKey | undefined {
		const current = navigation.currentKey;
		if (current !== undefined) return current;
		const selected = valueState.current;
		const selectedItem = selected === undefined ? undefined : view.get(selected);
		return selectedItem && !selectedItem.disabled ? selected : view.first();
	}

	function focusPreferred(): void {
		const key = preferredFocusKey();
		if (key === undefined) return;
		navigation.set(key, 'programmatic');
		mounted.focus(key);
	}

	function restoreNearestFocus(): void {
		queueMicrotask(() => {
			const key = navigation.reconcile();
			if (key !== undefined) mounted.focus(key);
		});
	}

	function mountSegment(element: HTMLButtonElement, registration: SegmentMountRegistration) {
		let current = registration;
		let dispose = mounted.mount(current.key, element, current.id);
		return {
			destroy() {
				const previousView = view;
				const restoreFocus = mounted.ownsFocus(current.key);
				dispose();
				if (restoreFocus) {
					const removed = current.key;
					queueMicrotask(() => {
						const key = navigation.reconcileRemoved(previousView, removed);
						if (key !== undefined) mounted.focus(key);
					});
				}
			},
			update(next: SegmentMountRegistration) {
				const restoreFocus = mounted.ownsFocus(current.key) && !current.disabled && next.disabled;
				if (!Object.is(current.key, next.key) || current.id !== next.id) {
					dispose();
					dispose = mounted.mount(next.key, element, next.id);
				}
				current = next;
				if (restoreFocus) restoreNearestFocus();
			}
		};
	}

	function select(key: SelectionKey, originalEvent: Event): void {
		if (disabled || readonly) return;
		navigation.set(key, 'pointer');
		if (selection.replace(key)) onchange?.(originalEvent);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (!navigation.handleKey(event)) return;
		const next = navigation.currentKey;
		if (next === undefined) return;
		mounted.focus(next);
		if (!readonly && selection.replace(next)) onchange?.(event);
	}

	function tabIndex(key: SelectionKey): 0 | -1 {
		return disabled || !Object.is(preferredFocusKey(), key) ? -1 : 0;
	}

	$effect(() => fieldOwner.registerFocusOwner(focusPreferred));
	$effect(() => {
		const currentView = view;
		const retained = new Set(currentView.keys);
		for (const key of optionSlots.keys()) if (!retained.has(key)) optionSlots.delete(key);
		const selected = valueState.current;
		const selectedItem = selected === undefined ? undefined : currentView.get(selected);
		const focusInside = ref?.contains(ref.ownerDocument.activeElement) ?? false;
		untrack(() => {
			const previous = activeKey;
			if (!focusInside && selectedItem && !selectedItem.disabled) {
				navigation.set(selected, 'collection-change');
			} else if (activeKey === undefined) {
				const preferred = preferredFocusKey();
				if (preferred !== undefined) navigation.set(preferred, 'collection-change');
			} else {
				navigation.reconcile();
			}
			const target = activeKey;
			if (focusWithin && !Object.is(previous, target) && target !== undefined) {
				mounted.scheduleFocus(target);
			}
		});
	});

	function handleFocusout(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		focusWithin = Boolean(
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		);
		onfocusout?.(event);
	}

	function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		focusWithin = true;
		onfocusin?.(event);
	}

	function resetFromForm(): void {
		valueState.reset();
		selection.resetTransient();
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={controlId}
	role="radiogroup"
	aria-label={ariaLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={disabled || undefined}
	aria-invalid={resolvedInvalid || undefined}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	aria-orientation={orientation}
	data-disabled={disabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={readonly || undefined}
	data-orientation={orientation}
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
>
	{#each view.items as record (record.key)}
		{@const option = record.value}
		{@const segmentId = optionId(record.key)}
		<button
			use:mountSegment={{ disabled: record.disabled, id: segmentId, key: record.key }}
			id={segmentId}
			class={zui.recipe(itemRecipe, {
				disabled: Boolean(disabled || record.disabled),
				readonly,
				selected: selection.isSelected(record.key)
			})}
			type="button"
			role="radio"
			aria-checked={selection.isSelected(record.key)}
			disabled={disabled || record.disabled}
			tabindex={tabIndex(record.key)}
			data-disabled={record.disabled || undefined}
			data-state={selection.isSelected(record.key) ? 'selected' : 'unselected'}
			data-readonly={readonly || undefined}
			onfocus={() => navigation.set(record.key, 'pointer')}
			onclick={(event) => select(record.key, event)}
			onkeydown={handleKeydown}>{option.label}</button
		>
	{/each}
</div>
<FormValueBridge
	{disabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={valueState.current}
/>
