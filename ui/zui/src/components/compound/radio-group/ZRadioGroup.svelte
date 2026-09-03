<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as RadioSelectionKey } from '../../../runtime/collection/selection.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type RadioGroupOrientation = 'horizontal' | 'vertical';

	export interface ZRadioGroupOption {
		readonly disabled?: boolean;
		readonly label: string;
		readonly textValue?: string;
		readonly value: RadioSelectionKey;
	}

	export interface ZRadioGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-disabled' | 'aria-invalid' | 'aria-readonly' | 'aria-required' | 'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly defaultValue?: RadioSelectionKey;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly loop?: boolean;
		readonly name?: string;
		readonly onValueChange?: (value: RadioSelectionKey) => void;
		readonly options?: readonly ZRadioGroupOption[];
		readonly orientation?: RadioGroupOrientation;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		value?: RadioSelectionKey;
	}

	const radioGroupRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.gap._medium;
		},
		variants: {
			orientation: {
				horizontal: (s) => {
					s.alignItems.center;
					s.flexDirection.row;
					s.flexWrap.wrap;
				},
				vertical: (s) => s.flexDirection.column
			}
		},
		defaultVariants: { orientation: 'vertical' }
	});

	registerRecipeHmr(import.meta, radioGroupRecipe);

	export const zuiMetadata = {
		category: 'input',
		id: 'radio-group',
		importStatement: "import { ZRadioGroup, ZRadioGroupItem } from '@zadmin/zui';",
		name: 'ZRadioGroup',
		bindings: [
			{
				description: '当前选中Item的typed value。',
				name: 'value',
				type: 'SelectionKey | undefined'
			},
			{ description: '真实radiogroup元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZRadioGroupItem',
			'LogicalCollection',
			'MountedElements',
			'CollectionNavigation',
			'SelectionModel',
			'FormResetSignal'
		],
		events: [
			{
				description: '真实用户选择新值后调用一次；owner清空、动态项与reset不调用。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			}
		],
		keyboard: [
			{
				description: '按方向与RTL移动焦点；可编辑时同步选择，只读时仅浏览。',
				key: 'Arrow keys'
			},
			{ description: '移动到第一或最后一个可用Item。', key: 'Home / End' },
			{ description: '可编辑时选择当前Item。', key: 'Space' }
		],
		parts: [],
		props: [
			{
				default: 'undefined（compound模式）',
				description: '可选的数据化稳定value、文本与disabled配置；不能与children同时提供。',
				name: 'options',
				type: 'readonly ZRadioGroupOption[]',
				members: [
					{
						description: '单选项唯一值。',
						name: 'value',
						type: 'RadioSelectionKey',
						required: true
					},
					{ description: '单选项显示文本。', name: 'label', type: 'string', required: true },
					{ description: '禁用该单选项。', name: 'disabled', type: 'boolean' },
					{ description: 'typeahead文本；省略时回退label。', name: 'textValue', type: 'string' }
				]
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
				description: '非受控初值，也是表单reset目标。',
				name: 'defaultValue',
				type: 'SelectionKey'
			},
			{
				default: "'vertical'",
				description: '布局和方向键轴。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{ default: 'true', description: '方向键到边界时循环。', name: 'loop', type: 'boolean' },
			{
				default: '继承Field或undefined',
				description: '原生radio组name。',
				name: 'name',
				type: 'string'
			},
			{ default: 'undefined', description: '关联外部form的id。', name: 'form', type: 'string' },
			{
				default: 'false',
				description: '禁用整个组及原生成功提交。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: '自身或Field/Form任一readonly',
				description: '保持radio可聚焦与成功提交，只允许方向键浏览焦点而不改变选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '要求同名原生radio组必须选择一项。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '设置组级aria-invalid并投射Item视觉。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实radiogroup引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: 'compound模式的ZRadioGroupItem与标签内容。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/radio-group/ZRadioGroup.svelte',
		states: [
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary: '以LogicalCollection统一typed选项、原生radio表单语义和roving焦点的生产单选组。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	import { CollectionNavigation } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../../runtime/collection/selection-model.js';
	import {
		singleSelection,
		type Selection,
		type SelectionKey
	} from '../../../runtime/collection/selection.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import FormResetSignal from '../../../runtime/form/FormResetSignal.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import ZRadioGroupItem from './ZRadioGroupItem.svelte';
	import {
		provideZRadioGroup,
		type RadioGroupLogicalItem,
		type ZRadioGroupContext
	} from './context.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className,
		defaultValue,
		disabled: disabledProp = false,
		form,
		id,
		invalid,
		loop = true,
		name: nameProp,
		onfocusin,
		onfocusout,
		onValueChange,
		options,
		orientation = 'vertical',
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		style,
		value = $bindable(),
		...rest
	}: ZRadioGroupProps = $props();

	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'radio-group'));
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
	const rootClass = $derived(zui.recipe(radioGroupRecipe, { orientation }));
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	const mounted = new MountedElements<SelectionKey, HTMLInputElement>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, RadioGroupLogicalItem>(
		mounted
	);
	const collection = $derived.by(() => {
		if (options === undefined) return compound.collection;
		if (children !== undefined) {
			throw new TypeError('ZRadioGroup accepts either options or children, not both.');
		}
		return new LogicalCollection<SelectionKey, RadioGroupLogicalItem>(
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
			{ name: 'ZRadioGroup options' }
		);
	});
	const view = $derived(collection.full);
	let activeKey = $state<SelectionKey>();
	let focusWithin = $state(false);
	const navigation = new CollectionNavigation<SelectionKey, RadioGroupLogicalItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => orientation,
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	// A child cleanup can queue reconciliation while the whole group is being
	// destroyed. Do not let that deferred callback read the group's derived view
	// after its owner effects have been torn down (notably WebKit/Svelte 5).
	let ownerActive = true;
	onDestroy(() => {
		ownerActive = false;
	});
	const selection = new SelectionModel<SelectionKey, RadioGroupLogicalItem>({
		collection: () => collection,
		mode: () => 'single',
		read: () => singleSelection(valueState.current),
		view: () => view,
		write: ({ selection: next }) => valueState.setFromUser(readSingleValue(next))
	});
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const resetControl = $derived.by(() => {
		for (const key of view.keys) {
			const element = mounted.get(key)?.element;
			if (element) return element;
		}
		return null;
	});

	function readSingleValue(next: Selection<SelectionKey>): SelectionKey | undefined {
		if (next === 'all') return undefined;
		for (const key of next) return key;
		return undefined;
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

	const context: ZRadioGroupContext = {
		get defaultValue() {
			return defaultValue;
		},
		get disabled() {
			return disabled;
		},
		get form() {
			return form;
		},
		focus(itemValue) {
			navigation.set(itemValue, 'pointer');
		},
		handleKey(event) {
			if (!navigation.handleKey(event)) return false;
			const next = navigation.currentKey;
			if (next === undefined) return true;
			mounted.focus(next);
			if (!readonly) selection.replace(next);
			return true;
		},
		get invalid() {
			return resolvedInvalid;
		},
		isSelected(itemValue) {
			return selection.isSelected(itemValue);
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
					`ZRadioGroupItem value "${String(current.key)}" is not present in authoritative options.`
				);
			}
			const stopMount = current.element
				? mounted.mount(current.key, current.element, current.id)
				: () => undefined;
			return () => {
				const previousView = view;
				const restoreFocus = mounted.ownsFocus(current.key);
				stopMount();
				stopLogical();
				if (restoreFocus) {
					queueMicrotask(() => {
						if (!ownerActive) return;
						const key = navigation.reconcileRemoved(previousView, current.key);
						if (key !== undefined) mounted.focus(key);
					});
				}
			};
		},
		get required() {
			return required;
		},
		restoreNativeSelection() {
			for (const key of view.keys) {
				const element = mounted.get(key)?.element;
				if (element) element.checked = selection.isSelected(key);
			}
		},
		select(itemValue) {
			if (disabled || readonly) return false;
			navigation.set(itemValue, 'pointer');
			return selection.replace(itemValue);
		},
		tabIndex(itemValue) {
			return disabled || !Object.is(preferredFocusKey(), itemValue) ? -1 : 0;
		}
	};
	provideZRadioGroup(context);

	$effect(() => fieldOwner.registerFocusOwner(focusPreferred));
	$effect(() => {
		const currentView = view;
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
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={controlId}
	role="radiogroup"
	aria-label={ariaLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-orientation={orientation}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={disabled || undefined}
	aria-invalid={resolvedInvalid || undefined}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	data-disabled={disabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={readonly || undefined}
	data-orientation={orientation}
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
>
	{#if options}
		{#each view.items as record (record.key)}
			<label>
				<ZRadioGroupItem
					disabled={record.disabled}
					textValue={record.textValue}
					value={record.key}
				/>
				{record.value.label ?? record.textValue}
			</label>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>
<FormResetSignal association={form} control={resetControl} onReset={resetFromForm} />
