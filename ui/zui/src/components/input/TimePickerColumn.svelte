<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	type TimePickerColumnDirection = NonNullable<HTMLAttributes<HTMLElement>['dir']>;

	export interface TimePickerColumnItem {
		readonly disabled: boolean;
		readonly key: SelectionKey;
		readonly label: string;
	}

	export interface TimePickerColumnController {
		readonly element: HTMLDivElement | null;

		focus(): boolean;
	}

	export interface TimePickerColumnProps {
		readonly columnId: string;
		readonly disabled: boolean;
		readonly direction?: TimePickerColumnDirection;
		readonly height: string;
		readonly items: readonly TimePickerColumnItem[];
		readonly label: string;
		readonly onChoose: (item: TimePickerColumnItem, commit: boolean) => void;
		readonly onControllerChange: (controller: TimePickerColumnController | null) => void;
		readonly onFocusSibling: (direction: -1 | 1) => void;
		readonly selectedKey?: SelectionKey;
		readonly size: ZControlSize;
	}

	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.padding._small;
			s.outlineStyle.none;
		},
		variants: {}
	});
	const optionRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.fontFamily._mono;
			s.justifyContent.center;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
		},
		variants: {
			active: { false: () => undefined, true: (s) => s.backgroundColor._surfaceHover },
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
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
				when: { active: true, disabled: false, selected: true },
				style: (s) => {
					s.backgroundColor._primarySubtleHover;
					s.color._primaryHover;
				}
			}
		],
		defaultVariants: { active: false, disabled: false, selected: false }
	});
	registerRecipeHmr(import.meta, listRecipe);
	registerRecipeHmr(import.meta, optionRecipe);
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { controlSizeMetrics } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import ZScrollArea from '../layout/ZScrollArea.svelte';

	let {
		columnId,
		disabled,
		direction,
		height,
		items,
		label,
		onChoose,
		onControllerChange,
		onFocusSibling,
		selectedKey,
		size
	}: TimePickerColumnProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(direction ?? zui.direction);
	const collection = $derived(
		new LogicalCollection(
			items,
			{
				disabled: (item) => item.disabled,
				key: (item) => item.key,
				textValue: (item) => item.label
			},
			{ name: 'ZTimePicker column' }
		)
	);
	const view = $derived(collection.full);
	const mounted = new MountedElements<SelectionKey>();
	const navigation = new CollectionNavigation({
		direction: () => getElementDirection(listRef, zui.direction),
		disabled: () => disabled,
		loop: () => false,
		orientation: () => 'vertical',
		view: () => view
	});
	const scrollBridge = {
		ensureKey(key: SelectionKey): void {
			mounted.get(key)?.element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		},
		isRendered: (key: SelectionKey): boolean => mounted.has(key),
		scrollToKey(key: SelectionKey): void {
			mounted.get(key)?.element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		}
	};
	const active = new ActiveDescendant({
		idBase: () => columnId,
		mounted,
		navigation,
		virtualizer: scrollBridge
	});
	let listRef = $state<HTMLDivElement | null>(null);
	const listClass = $derived(zui.recipe(listRecipe));
	const geometryClass = $derived(
		zui.icss((s) => {
			const metrics = controlSizeMetrics(zui.theme, size);
			s.flexGrow(1);
			s.flexShrink(1);
			s.minWidth.px(0);
			s.width.percent(100);
			s._selector('& > [role="option"]', (s) => s.minHeight.raw(metrics.contentHeight));
		})
	);
	const controller: TimePickerColumnController = {
		get element() {
			return listRef;
		},
		focus() {
			if (selectedKey !== undefined) active.set(selectedKey, 'programmatic');
			else active.reconcile();
			listRef?.focus({ preventScroll: true });
			return listRef !== null;
		}
	};
	$effect(() => {
		active.prune(view.keys);
		if (selectedKey !== undefined && view.get(selectedKey)?.disabled !== true)
			active.set(selectedKey, 'programmatic');
		else active.reconcile();
	});
	$effect(() => {
		onControllerChange(controller);
		return () => onControllerChange(null);
	});

	function attachOption(item: TimePickerColumnItem): Attachment<HTMLDivElement> {
		return (element) => {
			const unmount = active.mount(item.key, element);
			const handlePointerDown = (event: PointerEvent) => {
				if (disabled || item.disabled) return;
				event.preventDefault();
				listRef?.focus({ preventScroll: true });
				active.set(item.key, 'pointer');
			};
			const handlePointerMove = () => {
				if (!disabled && !item.disabled) active.set(item.key, 'pointer');
			};
			const handleClick = () => {
				if (!disabled && !item.disabled) onChoose(item, false);
			};
			element.addEventListener('click', handleClick);
			element.addEventListener('pointerdown', handlePointerDown);
			element.addEventListener('pointermove', handlePointerMove);
			return () => {
				unmount();
				element.removeEventListener('click', handleClick);
				element.removeEventListener('pointerdown', handlePointerDown);
				element.removeEventListener('pointermove', handlePointerMove);
			};
		};
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		if (event.target === event.currentTarget) active.reconcile();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (disabled || isKeyboardComposing(event)) return;
		if (active.handleKey(event)) return;
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			const forward = event.key === 'ArrowRight';
			const direction = getElementDirection(listRef, zui.direction);
			onFocusSibling((forward === (direction === 'ltr') ? 1 : -1) as -1 | 1);
			return;
		}
		const key = active.activeKey;
		const item = key === undefined ? undefined : view.get(key)?.value;
		if (!item) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onChoose(item, event.key === 'Enter');
		}
	}
</script>

<ZScrollArea
	aria-activedescendant={active.activeId}
	aria-label={label}
	bind:ref={listRef}
	class={[listClass, geometryClass]}
	data-slot="column"
	dir={resolvedDirection}
	maxHeight={height}
	overscroll="contain"
	role="listbox"
	scrollbarGutter="stable"
	scrollbarWidth="thin"
	tabindex={disabled ? -1 : 0}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
>
	{#each items as item, index (item.key)}
		<div
			{@attach attachOption(item)}
			aria-disabled={disabled || item.disabled || undefined}
			aria-posinset={index + 1}
			aria-selected={Object.is(selectedKey, item.key)}
			aria-setsize={items.length}
			class={zui.recipe(optionRecipe, {
				active: Object.is(active.activeKey, item.key),
				disabled: disabled || item.disabled,
				selected: Object.is(selectedKey, item.key)
			})}
			data-active={Object.is(active.activeKey, item.key) || undefined}
			data-selected={Object.is(selectedKey, item.key) || undefined}
			data-slot="option"
			id={active.idFor(item.key)}
			role="option"
			tabindex={-1}
		>
			{item.label}
		</div>
	{/each}
</ZScrollArea>
