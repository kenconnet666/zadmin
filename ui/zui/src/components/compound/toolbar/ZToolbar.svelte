<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZLayoutSpacing } from '../../../runtime/foundation/layout.js';
	import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import type { ToolbarOrientation } from './context.svelte.js';
	export type { ToolbarOrientation } from './context.svelte.js';

	export interface ZToolbarProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-disabled' | 'aria-orientation' | 'children' | 'role' | 'tabindex'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly gap?: ZLayoutSpacing;
		readonly loop?: boolean;
		readonly orientation?: ToolbarOrientation;
		ref?: HTMLDivElement | null;
		readonly size?: ZControlSize;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实toolbar根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'navigation',
		dependencies: ['LogicalCollection', 'MountedElements', 'CollectionNavigation', 'ZToolbarItem'],
		events: [],
		id: 'toolbar',
		importStatement: "import { ZToolbar, ZToolbarItem } from '@zadmin/zui';",
		keyboard: [
			{ description: 'horizontal按逻辑方向移动，RTL反转。', key: 'ArrowLeft / ArrowRight' },
			{ description: 'vertical移动；control策略保留控件冲突键。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到首个或末个enabled item；control策略可保留。', key: 'Home / End' },
			{ description: '进入或离开整个Toolbar，内部仅一个Tab stop。', key: 'Tab / Shift+Tab' }
		],
		name: 'ZToolbar',
		parts: [{ description: '具名role=toolbar焦点owner。', name: 'root' }],
		props: [
			{
				default: 'undefined',
				description: '直接命名Toolbar；与aria-labelledby至少提供一个非空值。',
				name: 'aria-label',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '引用可见名称；与aria-label至少提供一个非空值。',
				name: 'aria-labelledby',
				type: 'string'
			},
			{
				default: 'false',
				description: '停用内部方向导航并令所有ToolbarItem退出Tab序列。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'small'",
				description: '子控件之间的Theme间距。',
				name: 'gap',
				type: 'ZLayoutSpacing'
			},
			{
				default: 'true',
				description: '方向导航是否首尾循环。',
				name: 'loop',
				type: 'boolean'
			},
			{
				default: "'horizontal'",
				description: 'Toolbar逻辑方向和aria-orientation。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				default: 'Provider componentDefaults.toolbar.size或density',
				description:
					'通过无DOM Provider提供Button、ToggleGroup和Input默认尺寸；显式子尺寸优先，原生子项由调用方设置视觉。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '由ZToolbarItem显式注册的异构原生或第一方控件。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/compound/toolbar/ZToolbar.svelte',
		states: [
			{ description: '整个Toolbar停用。', name: 'data-disabled', values: ['true'] },
			{ description: '方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{
				description: '解析后的五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'experimental',
		summary: '以一个Tab stop组合异构命令控件，并把焦点、激活、选择和弹层所有权保持分离。'
	} as const satisfies ZuiComponentMetadata;

	const toolbarRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.maxWidth.percent(100);
			s.minWidth.px(0);
		},
		variants: {
			orientation: {
				horizontal: (s) => s.flexDirection.row,
				vertical: (s) => {
					s.alignItems.stretch;
					s.flexDirection.column;
				}
			}
		},
		defaultVariants: { orientation: 'horizontal' }
	});
	registerRecipeHmr(import.meta, toolbarRecipe);
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	import {
		CollectionNavigation,
		isKeyboardComposing,
		type CollectionNavigationReason
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import type {
		LogicalCollectionItem,
		LogicalCollectionView
	} from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { assertSelectionKey, type SelectionKey } from '../../../runtime/collection/selection.js';
	import { resolveControlSize } from '../../../runtime/foundation/control-size.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { applyLayoutSpacing } from '../../../runtime/foundation/layout.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import {
		containsComposedNode,
		getActiveElement,
		getElementDirection,
		isDomHtmlElement,
		isDomShadowRoot
	} from '../../../runtime/layer/dom-realm.js';
	import {
		provideZToolbar,
		type ToolbarCollectionItem,
		type ZToolbarContext
	} from './context.svelte.js';
	import ZProvider from '../../gene/ZProvider.svelte';

	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className,
		dir,
		disabled = false,
		gap = 'small',
		loop = true,
		onfocusin,
		onfocusout,
		onkeydown,
		orientation = 'horizontal',
		ref = $bindable(null),
		size,
		style,
		...rest
	}: ZToolbarProps = $props();
	const zui = useZui();
	const accessibleName = $derived.by(() => {
		if (
			!(typeof ariaLabel === 'string' && ariaLabel.trim()) &&
			!(typeof ariaLabelledBy === 'string' && ariaLabelledBy.trim())
		)
			throw new TypeError('ZToolbar requires aria-label or aria-labelledby.');
		return { label: ariaLabel, labelledBy: ariaLabelledBy };
	});
	const resolvedDirection = $derived(dir === 'ltr' || dir === 'rtl' ? dir : zui.direction);
	const resolvedSize = $derived(
		resolveControlSize(
			size ?? zui.componentDefaults.toolbar?.size ?? zui.componentDefaults.button?.size,
			zui.density
		)
	);
	const resolvedOrientation = $derived.by<ToolbarOrientation>(() => {
		if (orientation !== 'horizontal' && orientation !== 'vertical')
			throw new TypeError('ZToolbar orientation must be horizontal or vertical.');
		return orientation;
	});
	const mounted = new MountedElements<SelectionKey>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, ToolbarCollectionItem>(
		mounted
	);
	const collection = $derived(compound.collection);
	let physicalVersion = $state(0);
	let physicalRegistrations = $state<
		readonly { readonly element: HTMLElement; readonly token: symbol }[]
	>([]);
	const view = $derived.by(() => {
		physicalVersion;
		return collection.view({ include: (item) => isPhysicallyAvailable(item.value.element) });
	});
	let activeKey = $state<SelectionKey>();
	let focusWithin = $state(false);
	let initialTabStopKey: SelectionKey | undefined;
	let alive = true;
	let previousView: LogicalCollectionView<SelectionKey, ToolbarCollectionItem> = untrack(
		() => view
	);
	const navigation = new CollectionNavigation<SelectionKey, ToolbarCollectionItem>({
		direction: () => getElementDirection(ref, resolvedDirection),
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => resolvedOrientation,
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const rootClass = $derived(zui.recipe(toolbarRecipe, { orientation: resolvedOrientation }));
	const gapClass = $derived(
		zui.icss((s) => {
			applyLayoutSpacing(s, 'gap', gap);
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function ownerMicrotask(element: HTMLElement | null, callback: () => void): void {
		(
			element?.ownerDocument.defaultView ??
			ref?.ownerDocument.defaultView ??
			globalThis
		).queueMicrotask(() => {
			if (alive) callback();
		});
	}

	function ownsElement(element: HTMLElement): boolean {
		if (!containsComposedNode(ref, element)) return false;
		let current: Element | null = element;
		while (current) {
			const toolbar = current.closest('[role="toolbar"]');
			if (toolbar) return toolbar === ref;
			const tree = current.getRootNode();
			current = isDomShadowRoot(tree) ? tree.host : null;
		}
		return false;
	}

	function isPhysicallyAvailable(element: HTMLElement | null): boolean {
		if (!element?.isConnected || !ownsElement(element)) return false;
		let current: Element | null = element;
		while (current) {
			if (
				current.hasAttribute('hidden') ||
				current.hasAttribute('inert') ||
				current.getAttribute('aria-hidden') === 'true' ||
				current.getAttribute('aria-disabled') === 'true' ||
				current.getAttribute('data-overflow-hidden') === 'true'
			)
				return false;
			const parent: Element | null = current.parentElement;
			if (parent) {
				current = parent;
				continue;
			}
			const tree = current.getRootNode();
			current = isDomShadowRoot(tree) ? tree.host : null;
		}
		if (element.matches(':disabled')) return false;
		const css = element.ownerDocument.defaultView?.getComputedStyle(element);
		return (
			element.getClientRects().length > 0 &&
			css?.display !== 'none' &&
			css?.visibility === 'visible'
		);
	}

	function currentItem(): LogicalCollectionItem<SelectionKey, ToolbarCollectionItem> | undefined {
		const key = navigation.currentKey;
		return key === undefined ? undefined : view.get(key);
	}

	function focus(value: SelectionKey, reason: CollectionNavigationReason = 'pointer'): boolean {
		const changed = navigation.set(value, reason);
		return changed || Object.is(navigation.currentKey, value);
	}

	function register(read: () => ToolbarCollectionItem): () => void {
		if (!alive) return () => undefined;
		const current = read();
		if (current.element && ref && !ownsElement(current.element)) {
			throw new TypeError('ZToolbarItem must attach to an element owned by its current ZToolbar.');
		}
		const stopLogical = compound.register(read);
		const stopMount = current.element
			? mounted.mount(current.key, current.element, String(current.key))
			: () => undefined;
		const physicalToken = Symbol('zui-toolbar-physical-item');
		if (current.element) {
			physicalRegistrations = [
				...untrack(() => physicalRegistrations),
				{ element: current.element, token: physicalToken }
			];
		}
		return () => {
			const before = previousView;
			const restoreFocus = mounted.ownsFocus(current.key);
			stopMount();
			stopLogical();
			physicalRegistrations = untrack(() => physicalRegistrations).filter(
				(registration) => registration.token !== physicalToken
			);
			if (!restoreFocus) return;
			ownerMicrotask(current.element, () => {
				if (current.element?.isConnected && !ownsElement(current.element)) return;
				const active = ref ? getActiveElement(ref) : null;
				const document = ref?.ownerDocument;
				const removalGap =
					active === null ||
					active === ref ||
					active === document?.body ||
					active === document?.documentElement;
				if (!removalGap && !containsComposedNode(current.element, active)) return;
				const next = navigation.reconcileRemoved(before, current.key);
				if (next !== undefined) mounted.focus(next);
			});
		};
	}

	function tabIndex(value: SelectionKey, itemDisabled = false): 0 | -1 {
		assertSelectionKey(value, 'ZToolbarItem');
		if (disabled || itemDisabled) return -1;
		if (view.size === 0) {
			initialTabStopKey ??= value;
			return Object.is(initialTabStopKey, value) ? 0 : -1;
		}
		const preferred = navigation.currentKey ?? view.first();
		return Object.is(preferred, value) ? 0 : -1;
	}

	const context: ZToolbarContext = {
		get direction() {
			return getElementDirection(ref, resolvedDirection);
		},
		get disabled() {
			return disabled;
		},
		focus,
		get orientation() {
			return resolvedOrientation;
		},
		owns: (element) => {
			physicalVersion;
			return element !== null && ownsElement(element);
		},
		register,
		get size() {
			return resolvedSize;
		},
		tabIndex
	};
	provideZToolbar(context);

	$effect(() => {
		const root = ref;
		zui.portalContainer;
		const registrations = physicalRegistrations;
		if (!root) return;
		const ownerWindow = root.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const invalidate = () => (physicalVersion += 1);
		const Resize = ownerWindow.ResizeObserver;
		const resize = Resize ? new Resize(invalidate) : undefined;
		resize?.observe(root);
		for (const { element } of registrations) resize?.observe(element);
		const Mutation = ownerWindow.MutationObserver;
		const mutation = Mutation ? new Mutation(invalidate) : undefined;
		const mutationOptions: MutationObserverInit = {
			attributeFilter: [
				'aria-disabled',
				'aria-hidden',
				'class',
				'data-overflow-hidden',
				'disabled',
				'hidden',
				'inert',
				'style'
			],
			attributes: true,
			childList: true,
			subtree: true
		};
		mutation?.observe(root, mutationOptions);
		let ancestor: Element | null =
			root.parentElement ??
			(isDomShadowRoot(root.getRootNode()) ? (root.getRootNode() as ShadowRoot).host : null);
		while (ancestor) {
			mutation?.observe(ancestor, {
				attributes: true,
				attributeFilter: mutationOptions.attributeFilter
			});
			const tree = ancestor.getRootNode();
			ancestor = ancestor.parentElement ?? (isDomShadowRoot(tree) ? tree.host : null);
		}
		const shadowRoots = new Set<ShadowRoot>();
		for (const { element } of registrations) {
			const tree = element.getRootNode();
			if (isDomShadowRoot(tree) && tree !== root.getRootNode()) shadowRoots.add(tree);
		}
		for (const shadowRoot of shadowRoots) mutation?.observe(shadowRoot, mutationOptions);
		ownerWindow.addEventListener('resize', invalidate);
		return () => {
			ownerWindow.removeEventListener('resize', invalidate);
			mutation?.disconnect();
			resize?.disconnect();
		};
	});

	function controlOwnsKey(element: HTMLElement, key: string): boolean {
		if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home'].includes(key))
			return false;
		if (element.isContentEditable || element.localName === 'textarea') return true;
		if (element.localName === 'select')
			return ['ArrowDown', 'ArrowUp', 'End', 'Home'].includes(key);
		const role = element.getAttribute('role');
		if (role === 'combobox' || role === 'slider') return true;
		if (role === 'spinbutton') return ['ArrowDown', 'ArrowUp', 'End', 'Home'].includes(key);
		if (element.localName !== 'input') return false;
		const type = (element as HTMLInputElement).type;
		if (type === 'range' || ['date', 'datetime-local', 'month', 'time', 'week'].includes(type))
			return true;
		if (type === 'number') return ['ArrowDown', 'ArrowUp', 'End', 'Home'].includes(key);
		return ['ArrowLeft', 'ArrowRight', 'End', 'Home'].includes(key);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			isKeyboardComposing(event) ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return;
		const item = currentItem();
		if (!item?.value.element || !event.composedPath().includes(item.value.element)) return;
		if (item.value.keyPolicy === 'control' && controlOwnsKey(item.value.element, event.key)) return;
		if (!navigation.handleKey(event)) return;
		const next = navigation.currentKey;
		if (next !== undefined) mounted.scheduleFocus(next);
	}

	function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		onfocusin?.(event);
		const key = navigation.currentKey;
		focusWithin = key !== undefined && mounted.ownsFocus(key);
	}

	function handleFocusout(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		onfocusout?.(event);
		focusWithin = isDomHtmlElement(event.relatedTarget) && ownsElement(event.relatedTarget);
		if (!focusWithin && event.relatedTarget !== null) {
			// A last-position text input must not monopolize keyboard re-entry.
			navigation.set(view.first(), 'collection-change');
		}
	}

	$effect(() => {
		const currentView = view;
		const currentDisabled = disabled;
		void currentDisabled;
		untrack(() => {
			const previous = activeKey;
			if (activeKey === undefined) {
				const first = currentView.first();
				if (first !== undefined) navigation.set(first, 'collection-change');
			} else navigation.reconcile();
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
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, gapClass, className]}
	dir={dir ?? zui.direction}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="toolbar"
	aria-label={accessibleName.label}
	aria-labelledby={accessibleName.labelledBy}
	aria-disabled={disabled || undefined}
	aria-orientation={resolvedOrientation}
	tabindex={-1}
	data-disabled={disabled || undefined}
	data-orientation={resolvedOrientation}
	data-size={resolvedSize}
	data-slot="root"
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
	onkeydown={handleKeydown}
>
	<ZProvider
		componentDefaults={{
			button: { size: resolvedSize },
			input: { size: resolvedSize },
			toggleGroup: { size: resolvedSize }
		}}
	>
		{@render children?.()}
	</ZProvider>
</div>
