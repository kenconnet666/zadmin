<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { MenuActionEvent } from './context.svelte.js';
	export interface ZMenuItemProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onSelect?: (event: MenuActionEvent) => void;
		ref?: HTMLDivElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-item',
		importStatement: "import { ZMenuItem } from '@zadmin/zui';",
		name: 'ZMenuItem',
		bindings: [{ description: '真实menuitem引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMenu', 'Collection', 'RovingFocus'],
		events: [
			{
				description: '激活时收到可取消事件。',
				name: 'onSelect',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [{ description: '激活Item。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				default: '必填',
				description: '稳定Collection key与action值。',
				name: 'value',
				required: true,
				type: 'string | number'
			},
			{ default: 'textContent', description: 'typeahead文本。', name: 'textValue', type: 'string' },
			{
				default: 'false',
				description: '禁用交互并跳过键盘导航。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实menuitem引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Item内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuItem.svelte',
		states: [
			{ description: '当前roving焦点项。', name: 'data-highlighted', values: ['true'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '注册稳定key、支持typeahead与可取消action的Menu Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZMenu } from './context.svelte.js';

	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.gap._medium;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
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
			highlighted: { false: () => undefined, true: (s) => s.backgroundColor._surface }
		},
		defaultVariants: { disabled: false, highlighted: false }
	});
	registerRecipeHmr(import.meta, itemRecipe);

	let {
		children,
		class: className,
		disabled = false,
		onclick,
		onfocus,
		onkeydown,
		onpointermove,
		onSelect,
		ref = $bindable(null),
		style,
		textValue,
		value,
		...rest
	}: ZMenuItemProps = $props();
	const zui = useZui();
	const menu = useZMenu();
	const highlighted = $derived(Object.is(menu.roving.currentKey, value));
	const rootClass = $derived(zui.recipe(itemRecipe, { disabled, highlighted }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() =>
		menu.collection.register(() => ({
			disabled,
			element: ref,
			key: value,
			textValue: textValue ?? ref?.textContent?.trim() ?? String(value)
		}))
	);

	function activate(originalEvent: MouseEvent | KeyboardEvent): void {
		if (!disabled) menu.activate(value, originalEvent, onSelect);
	}
	function handleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) activate(event);
	}
	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		menu.roving.set(value);
		onfocus?.(event);
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			activate(event);
		}
	}
	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !disabled) menu.roving.set(value, true);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="menuitem"
	aria-disabled={disabled || undefined}
	tabindex={disabled ? -1 : menu.roving.tabIndex(value)}
	data-disabled={disabled || undefined}
	data-highlighted={highlighted || undefined}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	onpointermove={handlePointerMove}
>
	{@render children?.()}
</div>
