<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { MenuActionEvent, MenuItemRole } from './context.svelte.js';

	export interface ZMenuItemProps extends Omit<
		HTMLAttributes<HTMLElement>,
		'aria-checked' | 'children' | 'role'
	> {
		readonly checked?: boolean | 'mixed';
		readonly children?: Snippet;
		readonly closeOnSelect?: boolean;
		readonly danger?: boolean;
		readonly disabled?: boolean;
		readonly download?: HTMLAnchorAttributes['download'];
		readonly href?: string;
		readonly itemRole?: MenuItemRole;
		readonly leading?: Snippet;
		readonly onSelect?: (event: MenuActionEvent) => void;
		ref?: HTMLElement | null;
		readonly rel?: string;
		readonly shortcut?: string;
		readonly target?: HTMLAnchorAttributes['target'];
		readonly textValue?: string;
		readonly trailing?: Snippet;
		readonly value: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-item',
		importStatement: "import { ZMenuItem } from '@zadmin/zui';",
		name: 'ZMenuItem',
		bindings: [
			{ description: '真实button或anchor引用。', name: 'ref', type: 'HTMLElement | null' }
		],
		dependencies: ['ZMenu', 'LogicalCollection', 'MountedElements', 'CollectionNavigation', 'ZKbd'],
		events: [
			{
				description: '激活时收到可取消事件；取消同时阻止action冒泡、dismiss和链接导航。',
				name: 'onSelect',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [{ description: '激活action或原生link。', key: 'Enter / Space' }],
		parts: [
			{ description: '用于typeahead回退的可见标签。', name: 'label' },
			{ description: '固定宽度的图标或选择指示器。', name: 'indicator' },
			{ description: '逻辑末端内容与快捷键容器。', name: 'trailing' },
			{ description: '可选快捷键提示。', name: 'shortcut' }
		],
		props: [
			{
				default: '必填',
				description: 'string与number严格区分的稳定LogicalCollection key与action值。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			},
			{
				default: 'label textContent',
				description: 'locale-reactive typeahead文本。',
				name: 'textValue',
				type: 'string'
			},
			{
				default: "'menuitem'",
				description: '低层ARIA角色；优先使用ZMenuCheckboxItem或ZMenuRadioItem而不是手动组合。',
				name: 'itemRole',
				type: 'MenuItemRole'
			},
			{
				default: 'undefined',
				description: '低层selection状态，仅在checkbox/radio角色投射aria-checked。',
				name: 'checked',
				type: "boolean | 'mixed'"
			},
			{
				default: 'undefined',
				description: '存在时渲染真实anchor；取消action或disabled会阻止导航。',
				name: 'href',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '真实anchor的浏览上下文目标。',
				name: 'target',
				type: "HTMLAnchorAttributes['target']"
			},
			{ default: 'undefined', description: '真实anchor的链接关系。', name: 'rel', type: 'string' },
			{
				default: 'undefined',
				description: '真实anchor的download属性。',
				name: 'download',
				type: "HTMLAnchorAttributes['download']"
			},
			{
				default: 'undefined',
				description: '用ZKbd渲染的可见快捷键提示。',
				name: 'shortcut',
				type: 'string'
			},
			{ default: 'false', description: '危险动作视觉语义。', name: 'danger', type: 'boolean' },
			{
				default: 'false',
				description: '禁用交互并跳过键盘导航。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'Popup Menu在action成功后是否dismiss；选择Item默认覆盖为false。',
				name: 'closeOnSelect',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实div或anchor引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Item可见标签。', name: 'children', type: 'Snippet' },
			{ description: '固定宽度的逻辑起点图标或选择指示器。', name: 'leading', type: 'Snippet' },
			{ description: '位于shortcut之前的逻辑末端内容。', name: 'trailing', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/menu/ZMenuItem.svelte',
		states: [
			{ description: '当前roving焦点项。', name: 'data-highlighted', values: ['true'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '危险动作状态。', name: 'data-danger', values: ['true'] }
		],
		status: 'experimental',
		summary: '注册typed key、支持真实link、快捷键提示与可取消action的Menu Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZKbd from '../../gene/ZKbd.svelte';
	import { isKeyboardComposing } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useOptionalZMenuGroup, useZMenu } from './context.svelte.js';

	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.borderRadius._small;
			s.boxSizing.borderBox;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.textAlign.start;
			s.textDecoration.none;
			s.userSelect.none;
			s.width._full;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			danger: { false: () => undefined, true: (s) => s.color._danger },
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			highlighted: { false: () => undefined, true: (s) => s.backgroundColor._surface }
		},
		defaultVariants: { danger: false, disabled: false, highlighted: false }
	});
	const labelRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._medium;
			s.minWidth.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const indicatorRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.flexShrink(0);
			s.inlineSize._medium;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	const trailingRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.flexShrink(0);
			s.gap._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, itemRecipe);
	registerRecipeHmr(import.meta, labelRecipe);
	registerRecipeHmr(import.meta, indicatorRecipe);
	registerRecipeHmr(import.meta, trailingRecipe);

	let {
		checked,
		children,
		class: className,
		closeOnSelect = true,
		danger = false,
		disabled = false,
		download,
		href,
		id,
		itemRole = 'menuitem',
		leading,
		onclick,
		onfocus,
		onkeydown,
		onpointermove,
		onSelect,
		ref = $bindable(null),
		rel,
		shortcut,
		style,
		target,
		textValue,
		trailing,
		value,
		...rest
	}: ZMenuItemProps = $props();
	const zui = useZui();
	const menu = useZMenu();
	const group = useOptionalZMenuGroup();
	const uid = $props.id();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'menu-item'));
	const resolvedId = $derived(id ?? generatedId);
	const resolvedDisabled = $derived(disabled || menu.disabled);
	const highlighted = $derived(Object.is(menu.activeKey, value));
	const label = $derived(
		textValue ?? ref?.querySelector('[data-slot="label"]')?.textContent?.trim() ?? String(value)
	);
	const rootClass = $derived(
		zui.recipe(itemRecipe, { danger, disabled: resolvedDisabled, highlighted })
	);
	const labelClass = $derived(zui.recipe(labelRecipe));
	const indicatorClass = $derived(zui.recipe(indicatorRecipe));
	const trailingClass = $derived(zui.recipe(trailingRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	$effect(() =>
		menu.register(() => ({
			closeOnSelect,
			disabled: resolvedDisabled,
			element: ref,
			groupKey: group?.key,
			id: resolvedId,
			key: value,
			onSelect,
			role: itemRole,
			selectionDisabled: false,
			textValue: label
		}))
	);

	function activate(originalEvent: MouseEvent | KeyboardEvent): boolean {
		if (resolvedDisabled) return false;
		return !menu.activate(value, originalEvent).defaultPrevented;
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLElement }): void {
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (!activate(event)) event.preventDefault();
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLElement }): void {
		menu.focus(value, 'programmatic');
		onfocus?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || isKeyboardComposing(event)) return;
		switch (event.key) {
			case 'Enter':
				if (href === undefined) {
					event.preventDefault();
					activate(event);
				}
				break;
			case ' ':
				event.preventDefault();
				if (href !== undefined) ref?.click();
				else activate(event);
				break;
		}
	}

	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLElement }): void {
		onpointermove?.(event);
		if (event.defaultPrevented || resolvedDisabled) return;
		menu.hover(value);
		menu.focus(value, 'pointer');
	}
</script>

{#snippet content()}
	<span class={labelClass} data-slot="label">
		{#if leading}
			<span class={indicatorClass} data-slot="indicator" aria-hidden="true">
				{@render leading()}
			</span>
		{/if}
		<span>{@render children?.()}</span>
	</span>
	{#if trailing || shortcut}
		<span class={trailingClass} data-slot="trailing">
			{@render trailing?.()}
			{#if shortcut}<ZKbd data-slot="shortcut">{shortcut}</ZKbd>{/if}
		</span>
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		id={resolvedId}
		{href}
		{download}
		{rel}
		{target}
		role={itemRole}
		aria-checked={itemRole === 'menuitem' ? undefined : checked}
		aria-disabled={resolvedDisabled || undefined}
		tabindex={resolvedDisabled ? -1 : menu.tabIndex(value)}
		data-danger={danger || undefined}
		data-disabled={resolvedDisabled || undefined}
		data-highlighted={highlighted || undefined}
		onclick={handleClick}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		onpointermove={handlePointerMove}
	>
		{@render content()}
	</a>
{:else}
	<button
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		id={resolvedId}
		type="button"
		role={itemRole}
		aria-checked={itemRole === 'menuitem' ? undefined : checked}
		aria-disabled={resolvedDisabled || undefined}
		tabindex={resolvedDisabled ? -1 : menu.tabIndex(value)}
		data-danger={danger || undefined}
		data-disabled={resolvedDisabled || undefined}
		data-highlighted={highlighted || undefined}
		onclick={handleClick}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		onpointermove={handlePointerMove}
	>
		{@render content()}
	</button>
{/if}
