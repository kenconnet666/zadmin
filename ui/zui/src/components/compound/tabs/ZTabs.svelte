<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../../runtime/collection/selection.js';
	import type {
		TabsActivationMode as TabsActivationModeValue,
		TabsOrientation as TabsOrientationValue,
		TabsPanelMount as TabsPanelMountValue
	} from './context.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type TabsActivationMode = TabsActivationModeValue;
	export type TabsOrientation = TabsOrientationValue;
	export type TabsPanelMount = TabsPanelMountValue;

	export interface ZTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly activationMode?: TabsActivationMode;
		activeValue?: PublicSelectionKey | null;
		readonly children?: Snippet;
		readonly defaultActiveValue?: PublicSelectionKey | null;
		readonly defaultValue?: PublicSelectionKey | null;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly onActiveValueChange?: (value: PublicSelectionKey | null) => void;
		readonly onValueChange?: (value: PublicSelectionKey) => void;
		readonly orientation?: TabsOrientation;
		readonly panelMount?: TabsPanelMount;
		ref?: HTMLDivElement | null;
		value?: PublicSelectionKey | null;
	}

	const tabsRecipe = defineRecipe({
		base: (s) => s.display.block,
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, tabsRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tabs',
		importStatement: "import { ZTabs, ZTabsList, ZTabsTrigger, ZTabsPanel } from '@zadmin/zui';",
		name: 'ZTabs',
		bindings: [
			{
				description: '选中typed key；null是显式无选择。',
				name: 'value',
				type: 'SelectionKey | null'
			},
			{
				description: '与selection分离的roving active key；manual模式焦点移动不改value。',
				name: 'activeValue',
				type: 'SelectionKey | null'
			},
			{ description: '真实Tabs根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZTabsList',
			'ZTabsTrigger',
			'ZTabsPanel',
			'LogicalCollection',
			'MountedElements',
			'CollectionNavigation'
		],
		events: [
			{
				description: '用户激活新Tab后调用；owner清空与动态恢复不调用。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			},
			{
				description: '用户移动active tab后调用；collection恢复不调用。',
				name: 'onActiveValueChange',
				type: '(value: SelectionKey | null) => void'
			}
		],
		keyboard: [
			{ description: '按orientation与RTL在enabled tabs间移动active焦点。', key: 'Arrow keys' },
			{ description: '移动到首尾enabled tab。', key: 'Home / End' },
			{ description: 'manual模式激活active tab。', key: 'Enter / Space' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '当前选中typed key。',
				name: 'value',
				type: 'SelectionKey | null'
			},
			{
				default: 'null',
				description: '非受控初始选中key。',
				name: 'defaultValue',
				type: 'SelectionKey | null'
			},
			{
				bindable: true,
				default: 'selected key或第一enabled key',
				description: '独立roving active key。',
				name: 'activeValue',
				type: 'SelectionKey | null'
			},
			{
				default: 'null',
				description: '非受控初始active key。',
				name: 'defaultActiveValue',
				type: 'SelectionKey | null'
			},
			{
				default: "'automatic'",
				description: '焦点移动自动激活，或等待Enter/Space。',
				name: 'activationMode',
				type: "'automatic' | 'manual'"
			},
			{
				default: "'horizontal'",
				description: 'TabList布局和方向键轴。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				default: "'keep-mounted'",
				description: '默认预挂载隐藏panel；lazy访问后保留；active-only切换即卸载。',
				name: 'panelMount',
				type: "'keep-mounted' | 'lazy' | 'active-only'"
			},
			{ default: 'true', description: '方向键边界循环。', name: 'loop', type: 'boolean' },
			{
				default: 'false',
				description: '禁用整个Tabs和全部trigger交互。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实Tabs根引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'List、typed Trigger与Panel组合。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/tabs/ZTabs.svelte',
		states: [
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{
				description: 'Panel挂载策略。',
				name: 'data-panel-mount',
				values: ['keep-mounted', 'lazy', 'active-only']
			},
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'stable',
		summary:
			'以LogicalCollection统一typed triggers、分离active/selection，并提供automatic/manual与显式panel生命周期策略的Tabs。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import type { LogicalCollectionView } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { provideZTabs, type TabsCollectionItem, type ZTabsContext } from './context.svelte.js';

	let {
		activationMode = 'automatic',
		activeValue = $bindable(),
		children,
		class: className,
		defaultActiveValue = null,
		defaultValue = null,
		disabled = false,
		loop = true,
		onActiveValueChange,
		onfocusin,
		onfocusout,
		onValueChange,
		orientation = 'horizontal',
		panelMount = 'keep-mounted',
		ref = $bindable(null),
		style,
		value = $bindable(),
		...rest
	}: ZTabsProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tabs'));
	const rootClass = $derived(zui.recipe(tabsRecipe));
	const mounted = new MountedElements<SelectionKey, HTMLButtonElement>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, TabsCollectionItem>(mounted);
	const collection = $derived(compound.collection);
	const view = $derived(collection.full);
	// Opaque key slots are a stable-id cache; collection state owns UI reactivity.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const slots = new Map<SelectionKey, number>();
	let nextSlot = 0;
	let focusWithin = $state(false);
	let initialTabStopKey: SelectionKey | undefined;
	let reconcileTicket = 0;
	let alive = true;

	function assertKey(key: SelectionKey | null): void {
		if (key === null || typeof key === 'string') return;
		if (!Number.isFinite(key) || Object.is(key, -0))
			throw new TypeError('ZTabs values must be strings or finite numbers other than -0.');
	}
	const contract = $derived.by(() => {
		assertKey(defaultActiveValue);
		assertKey(defaultValue);
		assertKey(activeValue ?? null);
		assertKey(value ?? null);
		return { activationMode, disabled, loop, orientation, panelMount };
	});
	const valueState = new ControllableState<SelectionKey | null>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== null) onValueChange?.(next);
		},
		read: () => value,
		write: (next) => (value = next)
	});
	const activeState = new ControllableState<SelectionKey | null>({
		defaultValue: () => defaultActiveValue,
		onChange: () => onActiveValueChange,
		read: () => activeValue,
		write: (next) => (activeValue = next)
	});
	const initialSelected = untrack(() => valueState.current);
	const visited = new SvelteSet<SelectionKey>(initialSelected === null ? [] : [initialSelected]);
	let previousView: LogicalCollectionView<SelectionKey, TabsCollectionItem> = untrack(() => view);
	const navigation = new CollectionNavigation<SelectionKey, TabsCollectionItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => orientation,
		readActive: () => activeState.current ?? undefined,
		view: () => view,
		writeActive: (next, reason) => {
			if (reason === 'collection-change') activeValue = next ?? null;
			else activeState.setFromUser(next ?? null);
		}
	});
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function slotFor(key: SelectionKey): number {
		let slot = slots.get(key);
		if (slot === undefined) {
			slot = nextSlot += 1;
			slots.set(key, slot);
		}
		return slot;
	}

	function itemId(key: SelectionKey, part: 'panel' | 'trigger'): string {
		return `${idBase}-${slotFor(key)}-${part}`;
	}

	function ownerMicrotask(element: HTMLElement | null, callback: () => void): void {
		(element?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() => {
			if (alive) callback();
		});
	}

	function navigable(key: SelectionKey | null, source = view): key is SelectionKey {
		if (key === null) return false;
		const item = source.get(key);
		return Boolean(item && !item.disabled);
	}

	function nearestSelected(
		key: SelectionKey,
		before: LogicalCollectionView<SelectionKey, TabsCollectionItem>,
		after: LogicalCollectionView<SelectionKey, TabsCollectionItem>
	): SelectionKey | null {
		const index = before.indexOf(key);
		if (index >= 0) {
			for (let offset = index + 1; offset < before.size; offset += 1) {
				const candidate = before.keys[offset];
				if (candidate !== undefined && navigable(candidate, after)) return candidate;
			}
			for (let offset = index - 1; offset >= 0; offset -= 1) {
				const candidate = before.keys[offset];
				if (candidate !== undefined && navigable(candidate, after)) return candidate;
			}
		}
		return after.first() ?? null;
	}

	function reconcileCollection(
		before: LogicalCollectionView<SelectionKey, TabsCollectionItem>,
		after: LogicalCollectionView<SelectionKey, TabsCollectionItem>
	): void {
		const retained = new Set(after.keys);
		for (const key of slots.keys()) if (!retained.has(key)) slots.delete(key);
		for (const key of visited) if (!retained.has(key)) visited.delete(key);
		const selected = valueState.current;
		if (selected !== null && !navigable(selected, after)) {
			const replacement = nearestSelected(selected, before, after);
			value = replacement;
			if (replacement !== null) visited.add(replacement);
		}
		const active = activeState.current;
		if (active === null) {
			const preferred = navigable(valueState.current, after) ? valueState.current : after.first();
			if (preferred !== undefined && preferred !== null)
				navigation.set(preferred, 'collection-change');
		} else navigation.reconcile();
		const next = navigation.currentKey;
		if (focusWithin && next !== undefined && !Object.is(active, next)) mounted.focus(next);
		previousView = after;
	}

	function scheduleReconcile(): void {
		const ticket = (reconcileTicket += 1);
		const before = previousView;
		ownerMicrotask(ref, () => {
			if (ticket !== reconcileTicket) return;
			reconcileCollection(before, view);
		});
	}

	function selectUser(itemValue: SelectionKey): void {
		const item = collection.get(itemValue);
		if (disabled || !item || item.disabled) return;
		navigation.set(itemValue, 'pointer');
		visited.add(itemValue);
		valueState.setFromUser(itemValue);
	}

	const context: ZTabsContext = {
		get activationMode() {
			return activationMode;
		},
		get disabled() {
			return disabled;
		},
		focus(itemValue) {
			if (!navigation.set(itemValue, 'pointer') && !Object.is(navigation.currentKey, itemValue))
				return;
			if (activationMode === 'automatic') selectUser(itemValue);
		},
		handleKey(event) {
			if (disabled || isKeyboardComposing(event)) return false;
			if (navigation.handleKey(event)) {
				const next = navigation.currentKey;
				if (next !== undefined) {
					if (activationMode === 'automatic') selectUser(next);
					mounted.focus(next);
				}
				return true;
			}
			if (event.key !== 'Enter' && event.key !== ' ') return false;
			const active = navigation.currentKey;
			if (active === undefined) return false;
			event.preventDefault();
			selectUser(active);
			return true;
		},
		isActive(itemValue) {
			return Object.is(navigation.currentKey, itemValue);
		},
		isSelected(itemValue) {
			return Object.is(valueState.current, itemValue);
		},
		get orientation() {
			return orientation;
		},
		panelId(itemValue) {
			return itemId(itemValue, 'panel');
		},
		register(read) {
			const current = read();
			const stopLogical = compound.register(read);
			const stopMount = current.element
				? mounted.mount(current.key, current.element, current.id)
				: () => undefined;
			return () => {
				const before = view;
				const rootOwnsFocus = ref?.contains(ref.ownerDocument.activeElement) ?? focusWithin;
				const restoreFocus =
					mounted.ownsFocus(current.key) ||
					(rootOwnsFocus && Object.is(navigation.currentKey, current.key));
				stopMount();
				stopLogical();
				scheduleReconcile();
				if (restoreFocus)
					ownerMicrotask(current.element, () => {
						reconcileCollection(before, view);
						const next = navigation.currentKey;
						if (next !== undefined) mounted.focus(next);
					});
			};
		},
		restoreFocusFromPanel() {
			const selected = valueState.current;
			const target = navigable(selected) ? selected : (navigation.currentKey ?? view.first());
			if (target === undefined || target === null) return;
			navigation.set(target, 'collection-change');
			mounted.focus(target);
		},
		select(itemValue) {
			selectUser(itemValue);
		},
		shouldMountPanel(itemValue) {
			if (panelMount === 'keep-mounted') return true;
			if (context.isSelected(itemValue)) return true;
			return panelMount === 'lazy' && visited.has(itemValue);
		},
		tabIndex(itemValue) {
			if (disabled) return -1;
			if (view.size === 0) {
				const preferred = activeState.current ?? valueState.current;
				if (preferred !== null) return Object.is(preferred, itemValue) ? 0 : -1;
				initialTabStopKey ??= itemValue;
				return Object.is(initialTabStopKey, itemValue) ? 0 : -1;
			}
			const preferred =
				navigation.currentKey ??
				(navigable(valueState.current) ? valueState.current : view.first());
			return !Object.is(preferred, itemValue) ? -1 : 0;
		},
		triggerId(itemValue) {
			return itemId(itemValue, 'trigger');
		}
	};
	provideZTabs(context);

	$effect(() => {
		const current = valueState.current;
		if (current !== null) visited.add(current);
	});
	$effect(() => {
		const currentView = view;
		const currentContract = contract;
		void currentView;
		void currentContract;
		scheduleReconcile();
	});

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
	onDestroy(() => {
		alive = false;
		reconcileTicket += 1;
		mounted.clear();
		slots.clear();
		visited.clear();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={disabled || undefined}
	data-orientation={orientation}
	data-panel-mount={panelMount}
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
>
	{@render children?.()}
</div>
