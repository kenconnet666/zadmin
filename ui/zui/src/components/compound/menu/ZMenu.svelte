<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { MenuActionEvent as MenuActionEventType } from './context.svelte.js';

	export interface ZMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
		readonly appearance?: 'bare' | 'menu';
		readonly children?: Snippet;
		readonly loop?: boolean;
		readonly onAction?: (event: MenuActionEventType) => void;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu',
		importStatement:
			"import { ZMenu, ZMenuItem, ZMenuGroup, ZMenuLabel, ZMenuSeparator } from '@zadmin/zui';",
		name: 'ZMenu',
		bindings: [{ description: '真实menu引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['Collection', 'RovingFocus', 'Typeahead'],
		events: [
			{
				description: 'Item激活后收到可取消的MenuActionEvent。',
				name: 'onAction',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [
			{ description: '在enabled Item之间移动焦点。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到第一个或最后一个enabled Item。', key: 'Home / End' },
			{ description: '按本地化文本前缀移动焦点。', key: 'Printable characters' },
			{ description: '激活当前Item。', key: 'Enter / Space' }
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
				bindable: true,
				default: 'null',
				description: '真实menu引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Item、Group、Label与Separator。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/menu/ZMenu.svelte',
		states: [],
		status: 'experimental',
		summary: '拥有DOM顺序Collection、roving focus、typeahead和可取消action的垂直Menu。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		MenuActionEvent,
		provideZMenu,
		type MenuItemRecord,
		type ZMenuContext
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
		loop = true,
		onAction,
		onkeydown,
		ref = $bindable(null),
		style,
		...rest
	}: ZMenuProps = $props();
	const zui = useZui();
	const collection = new CollectionStore<MenuItemRecord>();
	let focusKey = $state<SelectionKey>();
	const roving = new RovingFocus({
		collection,
		direction: () => zui.direction,
		loop: () => loop,
		orientation: () => 'vertical',
		read: () => focusKey,
		write: (key) => (focusKey = key)
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	const context: ZMenuContext = {
		activate(value, originalEvent, onSelect) {
			const event = new MenuActionEvent(originalEvent, value);
			onSelect?.(event);
			if (!event.defaultPrevented) onAction?.(event);
			return event;
		},
		collection,
		roving,
		typeahead
	};
	provideZMenu(context);
	const rootClass = $derived(zui.recipe(menuRecipe, { appearance }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || roving.handleKey(event) !== undefined) return;
		const match = typeahead.search(event.key, collection.items, roving.currentKey);
		if (match !== undefined) {
			event.preventDefault();
			roving.set(match, true);
		}
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="menu"
	aria-orientation="vertical"
	tabindex={-1}
	onkeydown={handleKeydown}
>
	{@render children?.()}
</div>
