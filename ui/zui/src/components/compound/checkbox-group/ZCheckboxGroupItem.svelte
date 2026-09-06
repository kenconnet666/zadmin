<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../../runtime/collection/selection.js';
	import type { ZCheckboxProps } from '../../input/ZCheckbox.svelte';
	import { defineRecipe } from '../../../recipes/define.js';

	export type ZCheckboxGroupItemProps<TKey extends PublicSelectionKey = PublicSelectionKey> = Omit<
		ZCheckboxProps,
		| 'checked'
		| 'defaultChecked'
		| 'disabled'
		| 'form'
		| 'invalid'
		| 'name'
		| 'onCheckedChange'
		| 'readonly'
		| 'required'
		| 'value'
	> & {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly textValue?: string;
		readonly value: TKey;
	};

	const checkboxGroupItemRecipe = defineRecipe(
		{
			base: (s) => {
				s.alignItems.center;
				s.cursor.pointer;
				s.display.inlineFlex;
				s.gap._small;
				s.lineHeight._normal;
				s.minWidth.px(0);
				s.overflowWrap.anywhere;
				s._selector('&:has(input:disabled)', (s) => {
					s.color._textMuted;
					s.cursor.notAllowed;
				});
				s._selector('&[data-readonly="true"]', (s) => s.cursor.default);
			},
			defaultVariants: {},
			variants: {}
		},
		import.meta
	);

	export const zuiMetadata = {
		bindings: [
			{ description: '当前真实checkbox input。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		category: 'input',
		dependencies: ['ZCheckboxGroup', 'ZCheckbox'],
		events: [
			{
				description: 'ZCheckbox处理后的原生change；组级typed变化使用onValueChange。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			},
			{
				description: '真实checkbox click；preventDefault可取消原生切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLInputElement>'
			}
		],
		id: 'checkbox-group-item',
		importStatement: "import { ZCheckboxGroupItem } from '@zadmin/zui';",
		keyboard: [
			{ description: '作为普通原生checkbox进入或离开Tab序列。', key: 'Tab / Shift+Tab' },
			{ description: '可编辑时切换当前项。', key: 'Space' }
		],
		name: 'ZCheckboxGroupItem',
		parts: [
			{ description: '隐式命名真实checkbox的原生label。', name: 'root' },
			{ description: '复用ZCheckbox的真实input。', name: 'input' },
			{ description: '可见item标签。', name: 'label' }
		],
		props: [
			{
				default: '必填',
				description: '稳定的string/number选择值和原生checkbox value来源。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			},
			{ default: 'value', description: '集合诊断文本。', name: 'textValue', type: 'string' },
			{
				default: 'false',
				description: '禁用当前真实checkbox。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'CheckboxGroup.size',
				description: '覆盖组内默认checkbox尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'CheckboxGroup.tone',
				description: '覆盖组内默认checkbox色调。',
				name: 'tone',
				type: "'primary' | ZSemanticTone"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实checkbox input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '原生label中的可见item名称；省略时需提供aria-label。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/checkbox-group/ZCheckboxGroupItem.svelte',
		states: [
			{ description: '当前是否选中。', name: 'data-state', values: ['checked', 'unchecked'] },
			{
				description: '当前真实input被自身、组或原生fieldset禁用。',
				name: 'data-disabled',
				values: ['true']
			},
			{ description: '继承组级只读。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary: '以ZCheckbox真实input加入typed CheckboxGroup，并保留普通Tab和重复FormData。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZCheckbox from '../../input/ZCheckbox.svelte';
	import { useZCheckboxGroup } from './context.svelte.js';

	let {
		children,
		disabled = false,
		id,
		ref = $bindable(null),
		size,
		textValue,
		tone,
		value,
		...rest
	}: ZCheckboxGroupItemProps<TKey> = $props();
	const zui = useZui();
	const uid = $props.id();
	const group = useZCheckboxGroup<TKey>();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'checkbox-group-item'));
	const resolvedDisabled = $derived(disabled || group.disabled);
	const selected = $derived(group.isSelected(value));
	const rootClass = $derived(zui.recipe(checkboxGroupItemRecipe));

	$effect(() =>
		group.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			id: id ?? generatedId,
			key: value,
			selectionDisabled: false,
			textValue: textValue ?? String(value)
		}))
	);

	function handleCheckedChange(): void {
		// The function binding keeps Checkbox's local write from bypassing group constraints.
		if (ref?.matches(':disabled') || !group.toggle(value)) group.restoreNativeSelection();
	}
</script>

<label
	class={rootClass}
	data-slot="item"
	data-disabled={resolvedDisabled || undefined}
	data-readonly={group.readonly || undefined}
	data-state={selected ? 'checked' : 'unchecked'}
>
	<ZCheckbox
		{...rest}
		bind:ref
		bind:checked={() => selected, () => undefined}
		defaultChecked={group.defaultChecked(value)}
		disabled={resolvedDisabled}
		form={group.form}
		invalid={group.invalid}
		name={group.name}
		onCheckedChange={handleCheckedChange}
		readonly={group.readonly}
		required={group.isNativeRequired(value, resolvedDisabled)}
		size={size ?? group.size}
		tone={tone ?? group.tone}
		{value}
		id={id ?? generatedId}
		data-slot="input"
	/>
	{#if children}<span data-slot="label">{@render children()}</span>{/if}
</label>
