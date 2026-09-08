<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
	import type { ZLayoutSpacing } from '../../../runtime/foundation/layout.js';
	import { defineRecipe } from '../../../recipes/define.js';

	export interface ZMenubarProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-disabled' | 'aria-orientation' | 'children' | 'role' | 'tabindex'
	> {
		readonly children?: Snippet;
		readonly defaultValue?: SelectionKey | null;
		readonly disabled?: boolean;
		readonly gap?: ZLayoutSpacing;
		readonly loop?: boolean;
		readonly onValueChange?: (value: SelectionKey | null) => void;
		readonly size?: ZControlSize;
		value?: SelectionKey | null;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menubar',
		name: 'ZMenubar',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/compound/menubar/ZMenubar.svelte',
		importStatement:
			"import { ZMenubar, ZMenubarMenu, ZMenubarTrigger, ZMenubarContent } from '@zadmin/zui';",
		summary:
			'协调多个既有DropdownMenu的单开状态和根级menuitem焦点；命令、选择、typeahead与submenu继续由ZMenu拥有。',
		dependencies: [
			'ZDropdownMenu',
			'ZMenu',
			'LogicalCollection',
			'MountedElements',
			'CollectionNavigation'
		],
		bindings: [
			{ name: 'value', type: 'SelectionKey | null', description: '唯一打开的根菜单key。' },
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实role=menubar根。' }
		],
		events: [
			{
				name: 'onValueChange',
				type: '(value: SelectionKey | null) => void',
				description: '用户打开、关闭、跨trigger或可用性变化导致的根级单开状态变化。'
			}
		],
		keyboard: [
			{ key: 'ArrowLeft / ArrowRight', description: '按实际LTR/RTL在根trigger间移动。' },
			{ key: 'Home / End', description: '移动到首个或末个可用根trigger。' },
			{ key: 'ArrowDown / ArrowUp', description: '打开当前菜单并聚焦首项或末项。' },
			{ key: 'Escape', description: '关闭当前菜单并恢复对应trigger。' },
			{ key: 'Tab / Shift+Tab', description: '关闭全部菜单并离开整个menubar。' }
		],
		parts: [{ name: 'root', description: '有名称且只有一个Tab入口的原生menubar。' }],
		props: [
			{
				name: 'value',
				type: 'SelectionKey | null',
				default: 'defaultValue → null',
				bindable: true,
				description: '唯一打开菜单；null表示全部关闭，与trigger焦点key独立。'
			},
			{
				name: 'defaultValue',
				type: 'SelectionKey | null',
				default: 'null',
				description: '非受控初始打开菜单。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '关闭并禁用全部根trigger。'
			},
			{
				name: 'loop',
				type: 'boolean',
				default: 'true',
				description: '根trigger方向导航是否循环。'
			},
			{
				name: 'gap',
				type: 'ZLayoutSpacing',
				default: 'xsmall',
				description: '根trigger间Theme间距。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'componentDefaults.menubar → Button默认 → Provider density',
				description: '根trigger与菜单行共享的五档尺寸。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实menubar根引用。'
			}
		],
		snippets: [{ name: 'children', type: 'Snippet', description: '一个或多个ZMenubarMenu。' }],
		states: [
			{ name: 'data-disabled', values: ['true'], description: '整个menubar停用。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的控件尺寸。'
			},
			{ name: 'data-value-type', values: ['string', 'number'], description: '打开key的原始类型。' }
		]
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.display.inlineFlex;
			s.maxWidth.percent(100);
			s.minWidth.px(0);
			s.padding._xsmall;
		},
		variants: {}
	});
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { tabbable } from 'tabbable';
	import {
		CollectionNavigation,
		isKeyboardComposing,
		type CollectionNavigationReason
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import type { LogicalCollectionView } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { assertSelectionKey } from '../../../runtime/collection/selection.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { resolveControlSize } from '../../../runtime/foundation/control-size.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { applyLayoutSpacing } from '../../../runtime/foundation/layout.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { getElementDirection, isDomHtmlElement } from '../../../runtime/layer/dom-realm.js';
	import type { DropdownMenuFocusStrategy } from '../dropdown-menu/context.svelte.js';
	import {
		provideZMenubar,
		type MenubarCollectionItem,
		type ZMenubarContext
	} from './context.svelte.js';

	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className,
		defaultValue = null,
		dir,
		disabled = false,
		gap = 'xsmall',
		loop = true,
		onfocusin,
		onfocusout,
		onValueChange,
		ref = $bindable(null),
		size,
		style,
		value = $bindable(),
		...rest
	}: ZMenubarProps = $props();
	const zui = useZui();
	const accessibleName = $derived.by(() => {
		if (
			!(typeof ariaLabel === 'string' && ariaLabel.trim()) &&
			!(typeof ariaLabelledBy === 'string' && ariaLabelledBy.trim())
		)
			throw new TypeError('ZMenubar requires aria-label or aria-labelledby.');
		return { label: ariaLabel, labelledBy: ariaLabelledBy };
	});
	const resolvedSize = $derived(
		resolveControlSize(
			size ?? zui.componentDefaults.menubar?.size ?? zui.componentDefaults.button?.size,
			zui.density
		)
	);
	const mounted = new MountedElements<SelectionKey, HTMLButtonElement>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, MenubarCollectionItem>(
		mounted
	);
	const collection = $derived(compound.collection);
	const view = $derived(collection.full);
	const openState = new ControllableState<SelectionKey | null>({
		defaultValue: () => {
			if (defaultValue !== null) assertSelectionKey(defaultValue, 'ZMenubar defaultValue');
			return defaultValue;
		},
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedOpenValue = $derived.by(() => {
		const current = openState.current;
		if (current !== null) assertSelectionKey(current, 'ZMenubar value');
		return current;
	});
	let activeKey = $state<SelectionKey>();
	let initialTabStopKey: SelectionKey | undefined;
	let focusWithin = $state(false);
	let alive = true;
	let previousView: LogicalCollectionView<SelectionKey, MenubarCollectionItem> = untrack(
		() => view
	);
	/* eslint-disable svelte/prefer-svelte-reactivity -- Imperative child focus callbacks; entries do not drive rendering and are released on unregister/destroy. */
	const prepareByValue = new Map<SelectionKey, (strategy: DropdownMenuFocusStrategy) => void>();
	const restoreByValue = new Map<SelectionKey, (target: HTMLElement | null) => void>();
	/* eslint-enable svelte/prefer-svelte-reactivity */
	const navigation = new CollectionNavigation<SelectionKey, MenubarCollectionItem>({
		direction: () => getElementDirection(ref, zui.direction),
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => 'horizontal',
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const rootClass = $derived(zui.recipe(recipe));
	const gapClass = $derived(
		zui.icss((s) => {
			applyLayoutSpacing(s, 'gap', gap);
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function focus(
		value: SelectionKey,
		reason: CollectionNavigationReason = 'programmatic'
	): boolean {
		const changed = navigation.set(value, reason);
		if (!changed && !Object.is(navigation.currentKey, value)) return false;
		return reason === 'pointer' || mounted.focus(value);
	}

	function tabIndex(value: SelectionKey, itemDisabled = false): 0 | -1 {
		assertSelectionKey(value, 'ZMenubarMenu');
		if (disabled || itemDisabled) return -1;
		if (view.size === 0) {
			initialTabStopKey ??= value;
			return Object.is(initialTabStopKey, value) ? 0 : -1;
		}
		const preferred = navigation.currentKey ?? view.first();
		return Object.is(preferred, value) ? 0 : -1;
	}

	function setOpen(value: SelectionKey, open: boolean, strategy?: DropdownMenuFocusStrategy): void {
		assertSelectionKey(value, 'ZMenubarMenu');
		if (!open) {
			if (Object.is(resolvedOpenValue, value)) openState.setFromUser(null);
			return;
		}
		const item = view.get(value);
		if (disabled || !item || item.disabled) return;
		const previous = resolvedOpenValue;
		if (previous !== null && !Object.is(previous, value)) {
			restoreByValue.get(previous)?.(mounted.get(value)?.element ?? null);
		}
		if (strategy) prepareByValue.get(value)?.(strategy);
		navigation.set(value, 'open');
		openState.setFromUser(value);
	}

	function close(value?: SelectionKey): void {
		if (value === undefined || Object.is(resolvedOpenValue, value)) openState.setFromUser(null);
	}

	function moveTrigger(event: KeyboardEvent): void {
		if (!navigation.handleKey(event)) return;
		const next = navigation.currentKey;
		if (next === undefined) return;
		if (resolvedOpenValue !== null) setOpen(next, true, 'first');
		else mounted.scheduleFocus(next);
	}

	function handleTriggerKeydown(value: SelectionKey, event: KeyboardEvent): void {
		if (
			event.defaultPrevented ||
			isKeyboardComposing(event) ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			disabled
		)
			return;
		if (event.key === 'Tab') {
			close();
			return;
		}
		if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) moveTrigger(event);
	}

	function handleContentKeydown(value: SelectionKey, event: KeyboardEvent): void {
		if (
			event.defaultPrevented ||
			isKeyboardComposing(event) ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return;
		if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
		event.preventDefault();
		navigation.set(value, 'keyboard');
		moveTrigger(event);
	}

	function pointerMove(value: SelectionKey): void {
		if (resolvedOpenValue === null || Object.is(resolvedOpenValue, value)) return;
		setOpen(value, true, 'first');
	}

	function register(read: () => MenubarCollectionItem): () => void {
		if (!alive) return () => undefined;
		const current = read();
		const stopLogical = compound.register(read);
		const stopMount = current.element
			? mounted.mount(current.key, current.element, String(current.key))
			: () => undefined;
		return () => {
			const before = previousView;
			const removedOpen = Object.is(resolvedOpenValue, current.key);
			const ownedFocus = mounted.ownsFocus(current.key);
			stopMount();
			stopLogical();
			if (!removedOpen && !ownedFocus) return;
			(current.element?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() => {
				if (!alive) return;
				const next = navigation.reconcileRemoved(before, current.key);
				if (removedOpen) {
					restoreByValue.get(current.key)?.(
						next === undefined ? null : (mounted.get(next)?.element ?? null)
					);
				}
				if (removedOpen) openState.setFromUser(null);
				if (next !== undefined) mounted.focus(next);
			});
		};
	}

	function registerPrepare(
		value: SelectionKey,
		prepare: (strategy: DropdownMenuFocusStrategy) => void
	): () => void {
		prepareByValue.set(value, prepare);
		return () => {
			if (prepareByValue.get(value) === prepare) prepareByValue.delete(value);
		};
	}

	function registerRestore(
		value: SelectionKey,
		restore: (target: HTMLElement | null) => void
	): () => void {
		restoreByValue.set(value, restore);
		return () => {
			if (restoreByValue.get(value) === restore) restoreByValue.delete(value);
		};
	}

	function leaveTarget(backward: boolean): HTMLElement | null {
		if (!ref) return null;
		const candidates = tabbable(ref.ownerDocument.body, {
			getShadowRoot: (element) => element.shadowRoot ?? false
		})
			.filter(isDomHtmlElement)
			.filter((element) => !ref?.contains(element) && element.closest('[role="menu"]') === null);
		const relation = backward ? 2 : 4;
		const related = candidates.filter(
			(element) => (ref!.compareDocumentPosition(element) & relation) !== 0
		);
		return (backward ? related.at(-1) : related[0]) ?? null;
	}

	function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		onfocusin?.(event);
		focusWithin = true;
	}

	function handleFocusout(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		onfocusout?.(event);
		focusWithin =
			isDomHtmlElement(event.relatedTarget) && event.currentTarget.contains(event.relatedTarget);
	}

	const context: ZMenubarContext = {
		close,
		get direction() {
			return getElementDirection(ref, zui.direction);
		},
		get disabled() {
			return disabled;
		},
		focus,
		handleContentKeydown,
		handleTriggerKeydown,
		leaveTarget,
		get openValue() {
			return resolvedOpenValue;
		},
		pointerMove,
		register,
		registerPrepare,
		registerRestore,
		setOpen,
		get size() {
			return resolvedSize;
		},
		tabIndex
	};
	provideZMenubar(context);

	$effect(() => {
		const currentView = view;
		const currentDisabled = disabled;
		const currentOpen = resolvedOpenValue;
		untrack(() => {
			if (currentDisabled && currentOpen !== null) {
				const open = currentOpen;
				const target = leaveTarget(false) ?? leaveTarget(true);
				restoreByValue.get(open)?.(target);
				close();
				if (target) target.focus({ preventScroll: true });
			} else if (currentOpen !== null && currentView.get(currentOpen)?.disabled) {
				const next = currentView.next(currentOpen) ?? currentView.previous(currentOpen);
				const target =
					next === undefined ? leaveTarget(false) : (mounted.get(next)?.element ?? null);
				restoreByValue.get(currentOpen)?.(target);
				close();
				if (next !== undefined) mounted.scheduleFocus(next);
				else if (target) queueMicrotask(() => target.focus({ preventScroll: true }));
			}
			const previous = activeKey;
			if (activeKey === undefined) navigation.set(currentView.first(), 'collection-change');
			else navigation.reconcile();
			const next = activeKey;
			if (focusWithin && next !== undefined && !Object.is(previous, next)) {
				mounted.scheduleFocus(next);
			}
			previousView = currentView;
		});
	});

	onDestroy(() => {
		alive = false;
		mounted.clear();
		prepareByValue.clear();
		restoreByValue.clear();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, gapClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={dir ?? zui.direction}
	role="menubar"
	aria-label={accessibleName.label}
	aria-labelledby={accessibleName.labelledBy}
	aria-disabled={disabled || undefined}
	aria-orientation="horizontal"
	data-disabled={disabled || undefined}
	data-size={resolvedSize}
	data-value-type={resolvedOpenValue === null ? undefined : typeof resolvedOpenValue}
	data-slot="root"
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
>
	{@render children?.()}
</div>
