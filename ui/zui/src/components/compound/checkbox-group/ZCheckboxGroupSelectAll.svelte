<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZCheckboxProps } from '../../input/ZCheckbox.svelte';
	import { defineRecipe } from '../../../recipes/define.js';

	export type ZCheckboxGroupSelectAllProps = Omit<
		ZCheckboxProps,
		| 'checked'
		| 'defaultChecked'
		| 'form'
		| 'invalid'
		| 'name'
		| 'onCheckedChange'
		| 'readonly'
		| 'required'
		| 'value'
	> & {
		readonly children?: Snippet;
	};

	const checkboxGroupSelectAllRecipe = defineRecipe(
		{
			base: (s) => {
				s.alignItems.center;
				s.cursor.pointer;
				s.display.inlineFlex;
				s.gap._small;
				s.fontWeight._medium;
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
			{
				description: '不参与FormData的真实select-all checkbox。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		category: 'input',
		dependencies: ['ZCheckboxGroup', 'ZCheckbox', 'SelectionModel'],
		events: [
			{
				description: '真实select-all checkbox change。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			},
			{
				description: '真实select-all checkbox click；preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLInputElement>'
			}
		],
		id: 'checkbox-group-select-all',
		importStatement: "import { ZCheckboxGroupSelectAll } from '@zadmin/zui';",
		keyboard: [
			{ description: '作为普通checkbox进入Tab序列。', key: 'Tab / Shift+Tab' },
			{ description: '选择允许的全部项，或按minSelected清除。', key: 'Space' }
		],
		name: 'ZCheckboxGroupSelectAll',
		parts: [
			{ description: '隐式命名select-all control的原生label。', name: 'root' },
			{ description: '不带name的真实checkbox。', name: 'input' },
			{ description: '可见select-all标签。', name: 'label' }
		],
		props: [
			{
				default: 'false',
				description: '额外禁用select-all control。',
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
				description: '真实select-all checkbox引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '原生label中的可见名称；省略时需提供aria-label。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/checkbox-group/ZCheckboxGroupSelectAll.svelte',
		states: [
			{
				description: '无选择、部分选择或达到当前max允许容量。',
				name: 'data-state',
				values: ['unchecked', 'indeterminate', 'checked']
			},
			{ description: '自身、组或原生fieldset禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '继承组级只读。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary: '复用组内同一selection并以mixed原生checkbox表达部分选择的SelectAll。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZCheckbox from '../../input/ZCheckbox.svelte';
	import { useZCheckboxGroup } from './context.svelte.js';

	let {
		children,
		disabled = false,
		ref = $bindable(null),
		size,
		tone,
		...rest
	}: ZCheckboxGroupSelectAllProps = $props();
	const zui = useZui();
	const group = useZCheckboxGroup();
	const state = $derived(group.selectAllState());
	const resolvedDisabled = $derived(disabled || group.disabled);
	const rootClass = $derived(zui.recipe(checkboxGroupSelectAllRecipe));
	$effect(() => group.registerSelectAll(() => ref));

	function handleCheckedChange(): void {
		// Checkbox projects group state; rejected writes must not leave a local checked value.
		if (!ref?.matches(':disabled') && group.toggleAll()) return;
		if (ref) {
			ref.checked = state === true;
			ref.indeterminate = state === 'indeterminate';
		}
	}
</script>

<label
	class={rootClass}
	data-slot="select-all"
	data-disabled={resolvedDisabled || undefined}
	data-readonly={group.readonly || undefined}
	data-state={state === 'indeterminate' ? 'indeterminate' : state ? 'checked' : 'unchecked'}
>
	<ZCheckbox
		{...rest}
		bind:ref
		bind:checked={() => state, () => undefined}
		disabled={resolvedDisabled}
		invalid={group.invalid}
		onCheckedChange={handleCheckedChange}
		readonly={group.readonly}
		size={size ?? group.size}
		tone={tone ?? group.tone}
		data-slot="select-all-input"
	/>
	{#if children}<span data-slot="label">{@render children()}</span>{/if}
</label>
