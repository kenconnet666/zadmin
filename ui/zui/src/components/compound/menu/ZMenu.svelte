<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent as MenuActionEventType } from './context.svelte.js';

	export interface ZMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		readonly appearance?: 'bare' | 'menu';
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly onAction?: (event: MenuActionEventType) => void;
		readonly onDismissRequest?: () => void;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu',
		importStatement:
			"import { ZMenu, ZMenuItem, ZMenuCheckboxItem, ZMenuRadioGroup, ZMenuRadioItem, ZMenuSub, ZMenuSubTrigger, ZMenuSubContent, ZMenuGroup, ZMenuLabel, ZMenuSeparator } from '@zadmin/zui';",
		name: 'ZMenu',
		bindings: [{ description: '真实menu引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['LogicalCollection', 'MountedElements', 'CollectionNavigation', 'Typeahead'],
		events: [
			{
				description: 'Item激活后收到跨submenu冒泡且可取消的MenuActionEvent。',
				name: 'onAction',
				type: '(event: MenuActionEvent) => void'
			},
			{
				description: '供Popup adapter在nested outside交互时关闭根浮层。',
				name: 'onDismissRequest',
				type: '() => void'
			}
		],
		keyboard: [
			{ description: '在enabled Item之间移动真实DOM焦点。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到第一个或最后一个enabled Item。', key: 'Home / End' },
			{ description: '按Provider locale文本前缀移动焦点。', key: 'Printable characters' },
			{ description: '激活当前Item或进入submenu。', key: 'Enter / Space / ArrowRight' },
			{ description: 'submenu中按逻辑反向键返回父Item。', key: 'ArrowLeft（RTL反转）' }
		],
		parts: [],
		props: [
			{
				default: "'menu'",
				description: '独立Menu shell或浮层内部bare布局。',
				name: 'appearance',
				type: "'menu' | 'bare'"
			},
			{ default: 'true', description: '键盘导航是否首尾循环。', name: 'loop', type: 'boolean' },
			{
				default: 'false',
				description: '禁用整个菜单并从roving顺序移除所有Item。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实menu引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: 'Item、选择Item、Submenu、Group、Label与Separator。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/menu/ZMenu.svelte',
		states: [{ description: '整个Menu禁用。', name: 'data-disabled', values: ['true'] }],
		status: 'stable',
		summary:
			'以LogicalCollection为唯一顺序事实、MountedElements只管理真实节点，并统一action、selection与submenu冒泡的Menu。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { isDomNode } from '../../../runtime/layer/dom-realm.js';
	import {
		MenuActionEvent,
		provideZMenu,
		type MenuItemRecord,
		type ZMenuContext,
		useOptionalZMenu
	} from './context.svelte.js';

	const menuRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.minWidth._menu;
		},
		variants: {
			appearance: {
				bare: () => undefined,
				menu: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._small;
					s.padding._small;
					s.width.fitContent;
				}
			}
		},
		defaultVariants: { appearance: 'menu' }
	});
	registerRecipeHmr(import.meta, menuRecipe);

	let {
		appearance = 'menu',
		children,
		class: className,
		disabled = false,
		loop = true,
		onAction,
		onDismissRequest,
		onfocusin,
		onfocusout,
		onkeydown,
		ref = $bindable(null),
		style,
		...rest
	}: ZMenuProps = $props();
	const zui = useZui();
	const parentMenu = useOptionalZMenu();
	const mounted = new MountedElements<SelectionKey>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, MenuItemRecord>(mounted);
	const collection = $derived(compound.collection);
	const view = $derived(collection.full);
	let activeKey = $state<SelectionKey>();
	let focusWithin = $state(false);
	let openSubmenu:
		| { readonly close: () => void; readonly token: symbol; readonly value: SelectionKey }
		| undefined;
	const navigation = new CollectionNavigation<SelectionKey, MenuItemRecord>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => 'vertical',
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });

	function closeSubmenuUnless(value: SelectionKey): void {
		if (openSubmenu && !Object.is(openSubmenu.value, value)) openSubmenu.close();
	}

	function focus(
		value: SelectionKey,
		reason: 'pointer' | 'programmatic' = 'programmatic'
	): boolean {
		const changed = navigation.set(value, reason);
		if (!changed && !Object.is(navigation.currentKey, value)) return false;
		closeSubmenuUnless(value);
		return mounted.focus(value);
	}

	const context: ZMenuContext = {
		activate(value, originalEvent) {
			const item = collection.get(value);
			const event = new MenuActionEvent(originalEvent, value, item?.value.closeOnSelect ?? true);
			if (disabled || !item || item.disabled) {
				event.preventDefault();
				return event;
			}
			item.value.onSelect?.(event);
			if (!event.defaultPrevented) {
				context.relayAction(event);
				event.commitDefaultActions();
			}
			return event;
		},
		get activeKey() {
			return navigation.currentKey;
		},
		claimSubmenu(value, close) {
			openSubmenu?.close();
			const token = Symbol('zui-menu-submenu');
			openSubmenu = { close, token, value };
			return () => {
				if (openSubmenu?.token === token) openSubmenu = undefined;
			};
		},
		contains(target) {
			return (
				(ref !== null && isDomNode(target) && ref.contains(target)) ||
				(parentMenu?.contains(target) ?? false)
			);
		},
		get direction() {
			return zui.direction;
		},
		get disabled() {
			return disabled;
		},
		dismissPopup() {
			if (onDismissRequest) onDismissRequest();
			else parentMenu?.dismissPopup();
		},
		focus,
		hover(value) {
			closeSubmenuUnless(value);
		},
		register(read) {
			const current = read();
			const stopLogical = compound.register(read);
			const stopMount = current.element
				? mounted.mount(current.key, current.element, current.id)
				: () => undefined;
			return () => {
				const previousView = view;
				const menuRoot = ref;
				const restoreFocus = mounted.ownsFocus(current.key);
				stopMount();
				stopLogical();
				if (restoreFocus) {
					queueMicrotask(() => {
						if (!menuRoot?.isConnected) return;
						const nearest = navigation.reconcileRemoved(previousView, current.key);
						if (nearest !== undefined) mounted.focus(nearest);
					});
				}
			};
		},
		relayAction(event) {
			onAction?.(event);
		},
		tabIndex(value) {
			return disabled || !Object.is(navigation.currentKey, value) ? -1 : 0;
		}
	};
	provideZMenu(context);
	const rootClass = $derived(zui.recipe(menuRecipe, { appearance }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	$effect(() => {
		const currentView = view;
		untrack(() => {
			const previous = activeKey;
			if (activeKey === undefined) {
				const first = currentView.first();
				if (first !== undefined) navigation.set(first, 'collection-change');
			} else {
				navigation.reconcile();
			}
			const next = activeKey;
			if (focusWithin && next !== undefined && !Object.is(previous, next)) {
				mounted.scheduleFocus(next);
			}
		});
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || isKeyboardComposing(event)) return;
		if (navigation.handleKey(event)) {
			const next = navigation.currentKey;
			if (next !== undefined) {
				closeSubmenuUnless(next);
				mounted.focus(next);
			}
			return;
		}
		const match = typeahead.search(event.key, view.items, navigation.currentKey);
		if (match === undefined) return;
		event.preventDefault();
		focus(match);
	}

	function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		focusWithin = true;
		onfocusin?.(event);
	}

	function handleFocusout(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		focusWithin = Boolean(
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		);
		onfocusout?.(event);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="menu"
	aria-disabled={disabled || undefined}
	aria-orientation="vertical"
	tabindex={-1}
	data-disabled={disabled || undefined}
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
	onkeydown={handleKeydown}
>
	{@render children?.()}
</div>
