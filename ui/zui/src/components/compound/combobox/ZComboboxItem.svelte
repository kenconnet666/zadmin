<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { ComboboxSelectEvent } from './context.svelte.js';

	export interface ZComboboxItemProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onSelect?: (event: ComboboxSelectEvent) => void;
		ref?: HTMLDivElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'combobox-item',
		importStatement: "import { ZComboboxItem } from '@zadmin/zui';",
		name: 'ZComboboxItem',
		bindings: [{ description: '真实option引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZCombobox', 'LogicalCollection', 'MountedElements', 'ActiveDescendant'],
		events: [
			{
				description: '选择前收到可取消事件。',
				name: 'onSelect',
				type: '(event: ComboboxSelectEvent) => void'
			}
		],
		keyboard: [],
		parts: [{ description: '用于过滤和输入回填的可见标签。', name: 'label' }],
		props: [
			{
				default: '必填',
				description: 'string与number严格区分的稳定业务key。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			},
			{
				default: 'textContent',
				description: '过滤、输入回填与异步标签缓存文本。',
				name: 'textValue',
				type: 'string'
			},
			{
				default: 'false',
				description: '禁用并跳过active导航和选择。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实option引用；compound过滤项以hidden保留以读取文本。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Option标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/combobox/ZComboboxItem.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] },
			{ description: 'active-descendant状态。', name: 'data-highlighted', values: ['true'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'stable',
		summary:
			'逻辑metadata持续存在；数据模式按view挂载，compound兼容模式用hidden保留文本发现的Combobox option。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZCombobox } from './context.svelte.js';

	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
			s.whiteSpace.nowrap;
		},
		variants: {
			visible: {
				false: (s) => s.display.none,
				true: () => undefined
			},
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			highlighted: { false: () => undefined, true: (s) => s.backgroundColor._surfaceHover },
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primarySubtle;
					s.color._primary;
				}
			}
		},
		compoundVariants: [
			{
				when: { disabled: false, highlighted: true, selected: true },
				style: (s) => {
					s.backgroundColor._primarySubtleHover;
					s.color._primaryHover;
				}
			}
		],
		defaultVariants: { disabled: false, highlighted: false, selected: false, visible: true }
	});
	registerRecipeHmr(import.meta, recipe);

	let {
		children,
		class: className,
		disabled = false,
		onclick,
		onpointerdown,
		onpointermove,
		onSelect,
		ref = $bindable(null),
		style,
		textValue,
		value,
		...rest
	}: ZComboboxItemProps = $props();
	const zui = useZui();
	const combo = useZCombobox();
	const label = $derived(
		textValue ?? ref?.querySelector('[data-slot="label"]')?.textContent?.trim() ?? String(value)
	);
	const visible = $derived(combo.isVisible(value));
	const resolvedDisabled = $derived(disabled || combo.disabled);
	const selected = $derived(combo.isSelected(value));
	const highlighted = $derived(Object.is(combo.activeKey, value));
	const rootClass = $derived(
		zui.recipe(recipe, {
			disabled: resolvedDisabled,
			highlighted: highlighted && !resolvedDisabled,
			selected,
			visible
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	$effect(() =>
		combo.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			key: value,
			onSelect,
			selectionDisabled: false,
			textValue: label
		}))
	);

	function handleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) combo.choose(value, event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointerdown?.(event);
		if (!event.defaultPrevented) event.preventDefault();
	}

	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) combo.setActive(value);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={combo.idFor(value)}
	role="option"
	aria-disabled={resolvedDisabled || undefined}
	aria-selected={selected}
	hidden={!visible}
	data-disabled={resolvedDisabled || undefined}
	data-highlighted={highlighted || undefined}
	data-state={selected ? 'selected' : 'unselected'}
	onclick={handleClick}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
>
	<span data-slot="label">{@render children?.()}</span><span aria-hidden="true"
		>{#if selected}<Check size={15} />{/if}</span
	>
</div>
