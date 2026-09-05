<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type ZTabsTriggerProps = Omit<
		HTMLButtonAttributes,
		| 'aria-controls'
		| 'aria-selected'
		| 'children'
		| 'disabled'
		| 'id'
		| 'onclick'
		| 'onfocus'
		| 'onkeydown'
		| 'role'
		| 'type'
		| 'value'
	> & {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onclick?: HTMLButtonAttributes['onclick'];
		readonly onfocus?: HTMLButtonAttributes['onfocus'];
		readonly onkeydown?: HTMLButtonAttributes['onkeydown'];
		ref?: HTMLButtonElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	};

	const tabsTriggerRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor.transparent;
			s.borderStyle.solid;
			s.borderWidth.px(0);
			s.color._textMuted;
			s.cursor.pointer;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.fontWeight._semibold;
			s.paddingBlock._medium;
			s.paddingInline._large;
			s.position.relative;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._inner;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			orientation: {
				horizontal: (s) => {
					s.borderBottomWidth._medium;
					s.marginBottom.px(-1);
				},
				vertical: (s) => {
					s.borderInlineEndWidth._medium;
					s.marginInlineEnd.px(-1);
				}
			},
			selected: {
				false: () => undefined,
				true: (s) => {
					s.borderColor._primary;
					s.color._primary;
				}
			}
		},
		defaultVariants: { disabled: false, orientation: 'horizontal', selected: false }
	});

	registerRecipeHmr(import.meta, tabsTriggerRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tabs-trigger',
		importStatement: "import { ZTabsTrigger } from '@zadmin/zui';",
		name: 'ZTabsTrigger',
		bindings: [{ description: '真实tab按钮引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZTabs', 'ZTabsList'],
		events: [
			{
				description: '原生click回调；preventDefault可取消激活。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '按Tabs方向移动焦点。', key: 'Arrow keys' },
			{ description: '手动模式激活当前Tab。', key: 'Space / Enter' },
			{ description: '移动到首尾Tab。', key: 'Home / End' }
		],
		parts: [],
		props: [
			{
				default: '必填',
				description: '稳定的Tab值与Collection key。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			},
			{ default: 'value', description: 'Collection文本值。', name: 'textValue', type: 'string' },
			{ default: 'false', description: '禁用当前Tab。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实tab按钮引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Tab标签内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tabs/ZTabsTrigger.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['active', 'inactive'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] }
		],
		status: 'stable',
		summary:
			'注册typed key到LogicalCollection并拥有独立active、roving tabindex与激活语义的原生button；关系id由Tabs Root统一生成。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZTabs } from './context.svelte.js';

	let {
		children,
		class: className,
		disabled = false,
		onclick,
		onfocus,
		onkeydown,
		ref = $bindable(null),
		style,
		textValue,
		value,
		...rest
	}: ZTabsTriggerProps = $props();
	const zui = useZui();
	const tabs = useZTabs();
	const resolvedDisabled = $derived(disabled || tabs.disabled);
	const selected = $derived(tabs.isSelected(value));
	const active = $derived(tabs.isActive(value));
	const rootClass = $derived(
		zui.recipe(tabsTriggerRecipe, {
			disabled: resolvedDisabled,
			orientation: tabs.orientation,
			selected
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() =>
		tabs.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			id: tabs.triggerId(value),
			key: value,
			selectionDisabled: false,
			textValue: textValue ?? String(value)
		}))
	);

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) tabs.select(value);
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLButtonElement }): void {
		tabs.focus(value);
		onfocus?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented) tabs.handleKey(event);
	}
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={tabs.triggerId(value)}
	type="button"
	role="tab"
	disabled={resolvedDisabled}
	tabindex={resolvedDisabled ? -1 : tabs.tabIndex(value)}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	aria-controls={tabs.shouldMountPanel(value) ? tabs.panelId(value) : undefined}
	aria-selected={selected}
	data-disabled={resolvedDisabled || undefined}
	data-active={active || undefined}
	data-orientation={tabs.orientation}
	data-state={selected ? 'active' : 'inactive'}
>
	{@render children?.()}
</button>
