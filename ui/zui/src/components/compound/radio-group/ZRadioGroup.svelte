<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type RadioGroupOrientation = 'horizontal' | 'vertical';

	export interface ZRadioGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly defaultValue?: string;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly loop?: boolean;
		readonly name?: string;
		readonly onValueChange?: (value: string) => void;
		readonly orientation?: RadioGroupOrientation;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		value?: string;
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
			{ description: '当前选中Item的value。', name: 'value', type: 'string' },
			{ description: '真实radiogroup元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZRadioGroupItem', 'CollectionStore', 'Selection', 'RovingFocus'],
		events: [
			{
				description: '用户选择新Item后调用一次。',
				name: 'onValueChange',
				type: '(value: string) => void'
			}
		],
		keyboard: [
			{ description: '按方向与RTL移动焦点并选择前一项。', key: 'ArrowLeft / ArrowUp' },
			{ description: '按方向与RTL移动焦点并选择后一项。', key: 'ArrowRight / ArrowDown' },
			{ description: '移动并选择第一项。', key: 'Home' },
			{ description: '移动并选择最后一项。', key: 'End' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前选中Item的value。',
				name: 'value',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '非受控初值，也是表单reset目标。',
				name: 'defaultValue',
				type: 'string'
			},
			{
				default: "'vertical'",
				description: '布局和方向键轴。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{ default: 'true', description: '方向键到边界时循环。', name: 'loop', type: 'boolean' },
			{ default: 'undefined', description: '原生radio组name。', name: 'name', type: 'string' },
			{ default: 'undefined', description: '关联外部form的id。', name: 'form', type: 'string' },
			{ default: 'false', description: '禁用整个组。', name: 'disabled', type: 'boolean' },
			{
				default: 'false',
				description: '要求组内必须选择一项。',
				name: 'required',
				type: 'boolean'
			},
			{ default: 'false', description: '设置组级无效状态。', name: 'invalid', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实radiogroup引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'ZRadioGroupItem与标签内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/radio-group/ZRadioGroup.svelte',
		states: [
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '组合原生radio、单选状态、roving focus、RTL方向键与表单reset的单选组。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../../runtime/form/field-context.js';
	import { listenToFormReset, mergeAriaIds } from '../../../runtime/form/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
	import { isSelected, singleSelection } from '../../../runtime/collection/selection.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		provideZRadioGroup,
		type RadioGroupCollectionItem,
		type ZRadioGroupContext
	} from './context.svelte.js';

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
		loop = true,
		name,
		onValueChange,
		orientation = 'vertical',
		ref = $bindable(null),
		required = false,
		style,
		value = $bindable(),
		...rest
	}: ZRadioGroupProps = $props();

	const zui = useZui();
	const field = useZField();
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const rootClass = $derived(zui.recipe(radioGroupRecipe, { orientation }));
	const valueState = new ControllableState<string | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		write: (next) => (value = next)
	});
	const collection = new CollectionStore<RadioGroupCollectionItem>();
	let focusKey = $state<string | undefined>();
	const roving = new RovingFocus({
		collection,
		direction: () => zui.direction,
		loop: () => loop,
		orientation: () => orientation,
		read: () => focusKey ?? valueState.current,
		write: (key) => (focusKey = key)
	});
	const context: ZRadioGroupContext = {
		collection,
		get defaultValue() {
			return defaultValue;
		},
		get disabled() {
			return resolvedDisabled;
		},
		get form() {
			return form;
		},
		get invalid() {
			return resolvedInvalid;
		},
		get name() {
			return resolvedName;
		},
		get orientation() {
			return orientation;
		},
		get required() {
			return resolvedRequired;
		},
		focus(itemValue) {
			roving.set(itemValue);
		},
		handleKey(event) {
			if (resolvedDisabled) return;
			const next = roving.handleKey(event);
			if (next !== undefined) context.select(next);
		},
		isSelected(itemValue) {
			return isSelected(singleSelection(valueState.current), itemValue);
		},
		register(read) {
			return collection.register(read);
		},
		select(itemValue) {
			const item = collection.get(itemValue);
			if (resolvedDisabled || !item || item.disabled) return;
			focusKey = itemValue;
			valueState.setFromUser(itemValue);
		},
		tabIndex(itemValue) {
			return resolvedDisabled ? -1 : roving.tabIndex(itemValue);
		}
	};
	provideZRadioGroup(context);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() => {
		if (!ref) return;
		const candidate = form ? ref.ownerDocument.getElementById(form) : ref.closest('form');
		const owner = candidate instanceof HTMLFormElement ? candidate : null;
		return listenToFormReset(owner, () => valueState.reset());
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	{id}
	role="radiogroup"
	aria-orientation={orientation}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	aria-required={resolvedRequired || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-orientation={orientation}
>
	{@render children?.()}
</div>
