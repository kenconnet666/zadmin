<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type {
		NavigationMenuEntry,
		NavigationMenuItem,
		NavigationMenuMode,
		NavigationMenuNavigateRequest
	} from '../../../runtime/collection/navigation-menu.js';
	import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
	import type { NavLinkTone, NavLinkVariant } from '../../navigation/ZNavLink.svelte';
	import type { NavigationMenuItemContext } from './context.js';
	import { defineRecipe } from '../../../recipes/define.js';

	export interface ZNavigationMenuProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLElement>,
		'children' | 'role'
	> {
		readonly items: readonly NavigationMenuEntry<TKey>[];
		readonly currentKey?: NoInfer<TKey> | null;
		readonly defaultOpenKeys?: readonly NoInfer<TKey>[];
		openKeys?: readonly NoInfer<TKey>[];
		readonly onOpenKeysChange?: (keys: readonly TKey[]) => void;
		readonly onNavigateRequest?: (request: NavigationMenuNavigateRequest<TKey>) => void;
		readonly mode?: NavigationMenuMode;
		readonly expandMode?: 'single' | 'multiple';
		readonly collapsed?: boolean;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly keyboardNavigation?: boolean;
		readonly overflow?: boolean;
		readonly overflowLabel?: string;
		readonly size?: ZControlSize;
		readonly tone?: NavLinkTone;
		readonly variant?: NavLinkVariant;
		readonly item?: Snippet<
			[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
		>;
		readonly start?: Snippet<
			[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
		>;
		readonly end?: Snippet<
			[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
		>;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		id: 'navigation-menu',
		name: 'ZNavigationMenu',
		category: 'navigation',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/compound/navigation-menu/ZNavigationMenu.svelte',
		importStatement: "import { ZNavigationMenu } from '@zadmin/zui';",
		summary:
			'以原生导航列表、真实链接与独立disclosure呈现站点层级，路由current、展开和焦点由各自所有者管理。',
		dependencies: [
			'ZNavLink',
			'LogicalCollection',
			'CollectionNavigation',
			'MountedElements',
			'ZPopover',
			'Presence',
			'ZOverflowList'
		],
		bindings: [
			{ name: 'openKeys', type: 'readonly TKey[]', description: '当前展开key集合。' },
			{ name: 'ref', type: 'HTMLElement | null', description: '真实nav根。' }
		],
		events: [
			{
				name: 'onOpenKeysChange',
				type: '(keys: readonly TKey[]) => void',
				description: '仅用户或公开方法请求改变展开时调用。'
			},
			{
				name: 'onNavigateRequest',
				type: '(request: NavigationMenuNavigateRequest<TKey>) => void',
				description:
					'同上下文、同源、未修改的链接激活请求；preventDefault保留面板，SPA成功后调用close。当前页只由currentKey输入决定。'
			}
		],
		keyboard: [
			{ key: 'Tab / Shift+Tab', description: '保留可见链接和独立展开按钮的原生顺序。' },
			{
				key: 'Arrow keys / Home / End',
				description: '可关闭的增强导航；只移动焦点，方向尊重RTL。'
			},
			{ key: 'Enter / Space', description: 'Enter遵循链接或按钮语义；Space仅激活真实button。' },
			{ key: 'Escape', description: '关闭所在子层并恢复展开入口；浮层关闭由现有Popover管理。' }
		],
		parts: [
			{ name: 'list', description: '原生ul列表。' },
			{ name: 'item', description: '每个数据节点的li。' },
			{ name: 'group', description: '有名称的静态分组。' },
			{ name: 'group-label', description: '分组标题。' },
			{ name: 'panel', description: '内联或浮层内容。' }
		],
		states: [
			{ name: 'data-disabled', values: ['true'], description: '整个导航及其数据后代停用。' },
			{
				name: 'data-mode',
				values: ['inline', 'vertical', 'horizontal'],
				description: '布局模式。'
			},
			{ name: 'data-collapsed', values: ['true'], description: '紧凑导航；内联子层改用flyout。' },
			{
				name: 'data-current-ancestor',
				values: ['true'],
				description: '包含当前页的祖先，与aria-current分离。'
			}
		],
		props: [
			{
				name: 'items',
				type: 'readonly NavigationMenuEntry<TKey>[]',
				default: '必填',
				required: true,
				description:
					'全局唯一typed keys；item可有href和children或自定义panel，group是静态命名分组，separator不参与导航。',
				members: [
					{
						name: 'kind',
						type: "'item' | 'group' | 'separator'",
						requiredWhen: "kind === 'group' || kind === 'separator'",
						default: "'item'",
						description: '节点职责。'
					},
					{
						name: 'key',
						type: 'TKey',
						required: true,
						description: '全树唯一的string/number身份。'
					},
					{
						name: 'label',
						type: 'string',
						requiredWhen: "kind !== 'separator'",
						description: '稳定可访问名称。'
					},
					{ name: 'description', type: 'string', description: 'item的辅助描述。' },
					{
						name: 'icon',
						type: 'ZIconName',
						description: 'item的受控图标名称；start snippet可替代。'
					},
					{ name: 'href', type: 'string', description: '真实路由目标；可与独立disclosure并存。' },
					{
						name: 'target',
						type: "HTMLAnchorAttributes['target']",
						description: '原生链接浏览上下文。'
					},
					{ name: 'rel', type: 'string', description: '原生链接关系。' },
					{ name: 'external', type: 'boolean', description: '外链视觉提示，不改变target。' },
					{ name: 'disabled', type: 'boolean', description: '禁用节点及其数据后代。' },
					{
						name: 'children',
						type: 'readonly NavigationMenuEntry<TKey>[]',
						requiredWhen: "kind === 'group' 或 item 使用 children 分支",
						description: '递归使用同一节点结构；item与panel互斥。'
					},
					{
						name: 'panel',
						type: 'Snippet<[NavigationMenuPanelContext<TKey>]>',
						requiredWhen: 'item 使用自定义 panel 分支',
						description: '自定义惰性面板，获得key/currentKey/close；其中路由由调用方自己拥有。'
					}
				]
			},
			{
				name: 'currentKey',
				type: 'TKey | null',
				default: 'null',
				description: '路由拥有的当前页；焦点和展开不会改写此值。'
			},
			{
				name: 'openKeys',
				type: 'readonly TKey[]',
				default: 'undefined',
				bindable: true,
				description: '展开集合，保留暂不在数据中的key。'
			},
			{
				name: 'defaultOpenKeys',
				type: 'readonly TKey[]',
				default: '[]',
				description: '非受控初始展开集合。'
			},
			{
				name: 'mode',
				type: "'inline' | 'vertical' | 'horizontal'",
				default: "'inline'",
				description: '内联层级、侧向flyout、水平导航面板。'
			},
			{
				name: 'expandMode',
				type: "'single' | 'multiple'",
				default: 'inline为multiple，浮层为single',
				description: '用户展开时是否关闭同一层的兄弟分支，不改写current。'
			},
			{
				name: 'collapsed',
				type: 'boolean',
				default: 'false',
				description: '紧凑图标/首字符导航；子项仍通过真实flyout访问。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '禁用所有原生链接和展开按钮。'
			},
			{ name: 'loop', type: 'boolean', default: 'false', description: '增强方向键是否循环。' },
			{
				name: 'keyboardNavigation',
				type: 'boolean',
				default: 'true',
				description: '启用Arrow/Home/End增强；原生Tab始终保留。'
			},
			{
				name: 'overflow',
				type: 'boolean',
				default: 'true',
				description:
					'horizontal模式用OverflowList折叠；当前项及含自定义panel的根项固定显示。更多入口使用数据标签和图标，不复制消费者item/start/end/panel内容。'
			},
			{
				name: 'overflowLabel',
				type: 'string',
				default: 'localePack.common.navigationMore',
				description: '更多导航入口和独立导航区域的名称。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider defaults → density',
				description: '五档NavLink尺寸。'
			},
			{
				name: 'tone',
				type: 'NavLinkTone',
				default: "Provider navigationMenu → navLink → 'primary'",
				description: '当前页语义色。'
			},
			{
				name: 'variant',
				type: 'NavLinkVariant',
				default: "Provider navigationMenu → navLink → 'subtle'",
				description: '当前页subtle/solid/outline外观。'
			},
			{
				name: 'ref',
				type: 'HTMLElement | null',
				default: 'null',
				bindable: true,
				description: '真实nav引用。'
			}
		],
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[NavigationMenuItem<TKey>, NavigationMenuItemContext<TKey>]>',
				description: '仅替换可见标签，原生行为和label命名仍由组件拥有。'
			},
			{
				name: 'start',
				type: 'Snippet<[NavigationMenuItem<TKey>, NavigationMenuItemContext<TKey>]>',
				description: '前置图标或内容。'
			},
			{
				name: 'end',
				type: 'Snippet<[NavigationMenuItem<TKey>, NavigationMenuItemContext<TKey>]>',
				description: '末端徽标或内容，紧凑模式隐藏。'
			}
		]
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe(
		{
			base: (s) => {
				s.minInlineSize.px(0);
				s.maxInlineSize.percent(100);
				s.fontFamily._sans;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { onDestroy, tick, untrack } from 'svelte';
	import { tabbable } from 'tabbable';
	import {
		indexNavigationMenu,
		navigationMenuItem
	} from '../../../runtime/collection/navigation-menu.js';
	import { assertSelectionKey } from '../../../runtime/collection/selection.js';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { resolveControlSize } from '../../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import {
		containsComposedNode,
		getActiveElement,
		getElementDirection,
		isDomHtmlElement
	} from '../../../runtime/layer/dom-realm.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import type { NavigationMenuContext } from './context.js';
	import ZOverflowList from '../../layout/ZOverflowList.svelte';
	import ZPopover from '../popover/ZPopover.svelte';
	import ZPopoverTrigger from '../popover/ZPopoverTrigger.svelte';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import NavigationList from './NavigationList.svelte';
	import NavigationNode from './NavigationNode.svelte';
	import NavigationMenu from './ZNavigationMenu.svelte';

	let {
		items,
		currentKey = null,
		defaultOpenKeys = [],
		openKeys = $bindable(),
		onOpenKeysChange,
		onNavigateRequest,
		mode = 'inline',
		expandMode,
		collapsed = false,
		disabled = false,
		loop = false,
		keyboardNavigation = true,
		overflow = true,
		overflowLabel,
		size,
		tone: toneProp,
		variant: variantProp,
		item: itemContent,
		start,
		end,
		ref = $bindable(null),
		class: className,
		style,
		dir,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		...rest
	}: ZNavigationMenuProps<TKey> = $props();
	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.navigationMenu);
	const tone = $derived(
		toneProp ?? defaults?.tone ?? zui.componentDefaults.navLink?.tone ?? 'primary'
	);
	const variant = $derived(
		variantProp ?? defaults?.variant ?? zui.componentDefaults.navLink?.variant ?? 'subtle'
	);
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'navigation-menu'));
	const rootClass = $derived(zui.recipe(recipe));
	const tree = $derived(indexNavigationMenu(items));
	const inline = $derived(mode === 'inline' && !collapsed);
	const resolvedSize = $derived(
		resolveControlSize(size ?? defaults?.size ?? zui.componentDefaults.navLink?.size, zui.density)
	);
	const moreLabel = $derived(overflowLabel ?? zui.localePack.common.navigationMore);
	const config = $derived.by(() => {
		if (!['inline', 'vertical', 'horizontal'].includes(mode))
			throw new TypeError('Invalid NavigationMenu mode.');
		const expansion = expandMode ?? (inline ? 'multiple' : 'single');
		if (!['multiple', 'single'].includes(expansion))
			throw new TypeError('Invalid NavigationMenu expandMode.');
		if (currentKey !== null) assertSelectionKey(currentKey, 'NavigationMenu currentKey');
		return { mode, expansion };
	});
	function validateKeys(keys: readonly TKey[]): readonly TKey[] {
		if (!Array.isArray(keys)) throw new TypeError('NavigationMenu openKeys must be an array.');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Temporary uniqueness validation, not retained component state.
		const seen = new Set<SelectionKey>();
		for (const key of keys) {
			assertSelectionKey(key, 'NavigationMenu openKeys');
			if (seen.has(key)) throw new TypeError('NavigationMenu openKeys must be unique.');
			seen.add(key);
		}
		return keys;
	}
	const openState = new ControllableState<readonly TKey[]>({
		defaultValue: () => Object.freeze([...validateKeys(defaultOpenKeys)]),
		read: () => openKeys,
		write: (next) => (openKeys = next),
		onChange: () => onOpenKeysChange
	});
	const expanded = $derived(new Set(validateKeys(openState.current)));
	let hiddenRoots = $state.raw<ReadonlySet<TKey>>(new Set());
	let moreOpen = $state(false);
	let moreTrigger = $state<HTMLButtonElement | null>(null);
	let activeKey = $state<TKey>();
	let alive = true;
	const mounted = new MountedElements<TKey>();
	// Identity and DOM ownership caches do not own reactive collection data.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const disclosureRefs = new Map<TKey, HTMLButtonElement>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const panels = new Map<
		TKey,
		{ node: HTMLElement; restoreTarget?: (target: HTMLElement | null) => void }
	>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const slots = new Map<TKey, number>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const requestedEdge = new Map<TKey, 'first' | 'last'>();
	let nextSlot = 0;
	const collection = $derived(
		new LogicalCollection(
			tree.records,
			{
				key: (record) => record.key,
				textValue: (record) => (record.entry.kind === 'separator' ? '' : record.entry.label),
				disabled: (record) =>
					disabled ||
					record.disabled ||
					!navigationMenuItem(record) ||
					(!record.branch && !navigationMenuItem(record)?.href)
			},
			{ name: 'NavigationMenu' }
		)
	);
	const view = $derived(
		collection.view({
			include: (entry) =>
				entry.value.branches.every((key) => expanded.has(key)) &&
				!hiddenRoots.has(entry.value.rootKey)
		})
	);
	const navigation = new CollectionNavigation({
		view: () => view,
		readActive: () => activeKey,
		writeActive: (key) => (activeKey = key),
		loop: () => loop,
		direction: () => getElementDirection(ref, zui.direction)
	});
	let previousView = untrack(() => view);

	function id(key: TKey, part: 'primary' | 'disclosure' | 'content' | 'group'): string {
		let slot = slots.get(key);
		if (slot === undefined) {
			slot = ++nextSlot;
			slots.set(key, slot);
		}
		return `${idBase}-${slot}-${part}`;
	}
	function focusTarget(key: TKey, disclosure = false): HTMLElement | null {
		return (
			(disclosure ? disclosureRefs.get(key) : undefined) ??
			mounted.get(key)?.element ??
			disclosureRefs.get(key) ??
			null
		);
	}
	function focusKey(key: TKey | undefined, disclosure = false): void {
		if (key === undefined) return;
		const target = focusTarget(key, disclosure);
		if (target) {
			navigation.set(key, 'keyboard');
			target.focus({ preventScroll: true });
		}
	}
	function isOpen(key: TKey): boolean {
		const record = tree.byKey.get(key);
		return Boolean(
			record?.branch &&
			!disabled &&
			!record.disabled &&
			expanded.has(key) &&
			record.branches.every((ancestor) => expanded.has(ancestor)) &&
			!hiddenRoots.has(record.rootKey)
		);
	}
	function panelCandidates(node: HTMLElement | null): HTMLElement[] {
		return node
			? tabbable(node, { getShadowRoot: (element) => element.shadowRoot ?? false }).filter(
					isDomHtmlElement
				)
			: [];
	}
	function closeAll(key?: TKey): void {
		if (!alive) return;
		const record = tree.byKey.get(key ?? activeKey!);
		const stableKey = record?.branches[0] ?? record?.key;
		const target = moreOpen
			? moreTrigger
			: stableKey === undefined
				? null
				: focusTarget(stableKey, true);
		for (const panel of panels.values()) if (target) panel.restoreTarget?.(target);
		openState.setFromUser(Object.freeze([]));
		moreOpen = false;
	}
	function setExpanded(
		key: TKey,
		open: boolean,
		edge?: 'first' | 'last',
		restoreTarget?: HTMLElement
	): void {
		if (!alive) return;
		const record = tree.byKey.get(key);
		if (!record?.branch || disabled || record.disabled) return;
		const before = isOpen(key);
		let next = [...openState.current];
		if (!open && !next.includes(key)) return;
		if (open) {
			if (config.expansion === 'single') {
				const siblings = new Set(
					next.filter(
						(candidate) =>
							candidate !== key &&
							tree.byKey.get(candidate)?.parentBranch === record.parentBranch &&
							!record.branches.includes(candidate)
					)
				);
				const closes = (candidate: TKey) =>
					siblings.has(candidate) ||
					Boolean(tree.byKey.get(candidate)?.branches.some((ancestor) => siblings.has(ancestor)));
				for (const [candidate, panel] of panels)
					if (closes(candidate)) panel.restoreTarget?.(focusTarget(key, true));
				next = next.filter((candidate) => !closes(candidate));
			}
			for (const ancestor of [...record.branches, key])
				if (!next.includes(ancestor)) next.push(ancestor);
		} else {
			const target = restoreTarget ?? focusTarget(key, true);
			for (const [candidate, panel] of panels)
				if (candidate === key || tree.byKey.get(candidate)?.branches.includes(key))
					panel.restoreTarget?.(target);
			next = next.filter(
				(candidate) => candidate !== key && !tree.byKey.get(candidate)?.branches.includes(key)
			);
			requestedEdge.delete(key);
		}
		if (edge) requestedEdge.set(key, edge);
		openState.setFromUser(Object.freeze(next));
		if (open && edge && (inline || before))
			void tick().then(() => {
				if (!alive || !isOpen(key)) return;
				const target = initialFocus(key, panels.get(key)?.node ?? null);
				target?.focus({ preventScroll: true });
			});
	}
	function initialFocus(key: TKey, node: HTMLElement | null): HTMLElement | null {
		const candidates = panelCandidates(node);
		const edge = requestedEdge.get(key);
		requestedEdge.delete(key);
		return (edge === 'last' ? candidates.at(-1) : candidates[0]) ?? null;
	}
	function navigate(key: TKey, event: MouseEvent): void {
		const entry = navigationMenuItem(tree.byKey.get(key));
		if (
			!entry?.href ||
			disabled ||
			tree.byKey.get(key)?.disabled ||
			event.defaultPrevented ||
			event.button !== 0 ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			event.shiftKey
		)
			return;
		if (entry.target && entry.target.toLowerCase() !== '_self') return;
		const document = focusTarget(key)?.ownerDocument;
		if (document) {
			try {
				const destination = new URL(entry.href, document.baseURI);
				if (
					destination.origin !== new URL(document.baseURI).origin ||
					!['http:', 'https:'].includes(destination.protocol)
				)
					return;
			} catch {
				return;
			}
		}
		const request: NavigationMenuNavigateRequest<TKey> = Object.freeze({
			key,
			href: entry.href,
			item: entry,
			originalEvent: event,
			get defaultPrevented() {
				return event.defaultPrevented;
			},
			preventDefault: () => event.preventDefault(),
			close: () => closeAll(key)
		});
		onNavigateRequest?.(request);
		if (!event.defaultPrevented) closeAll(key);
	}
	function keydown(key: TKey, event: KeyboardEvent): void {
		if (
			event.defaultPrevented ||
			isKeyboardComposing(event) ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			disabled
		)
			return;
		const record = tree.byKey.get(key);
		if (!record || record.disabled) return;
		const rtl = getElementDirection(ref, zui.direction) === 'rtl';
		const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
		const back = rtl ? 'ArrowRight' : 'ArrowLeft';
		const horizontal = mode === 'horizontal' && record.parentBranch === undefined;
		if (event.key === 'Escape') {
			const branch = isOpen(key) ? key : record.parentBranch;
			if (branch !== undefined) {
				event.preventDefault();
				setExpanded(branch, false);
				focusKey(branch, true);
			}
			return;
		}
		if (!keyboardNavigation) return;
		if (
			record.branch &&
			((horizontal && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) ||
				(!horizontal && event.key === forward))
		) {
			event.preventDefault();
			setExpanded(key, true, event.key === 'ArrowUp' ? 'last' : 'first');
			return;
		}
		if (!horizontal && event.key === back) {
			const branch = isOpen(key) ? key : record.parentBranch;
			if (branch !== undefined) {
				event.preventDefault();
				setExpanded(branch, false);
				focusKey(branch, true);
			}
			return;
		}
		const intent =
			event.key === 'Home'
				? 'first'
				: event.key === 'End'
					? 'last'
					: event.key === (horizontal ? forward : 'ArrowDown')
						? 'next'
						: event.key === (horizontal ? back : 'ArrowUp')
							? 'previous'
							: undefined;
		if (!intent) return;
		const scope = inline
			? view
			: collection.view({
					include: (candidate) =>
						candidate.value.parentBranch === record.parentBranch &&
						!hiddenRoots.has(candidate.value.rootKey)
				});
		const target =
			intent === 'first'
				? scope.first()
				: intent === 'last'
					? scope.last()
					: intent === 'next'
						? scope.next(key, { loop })
						: scope.previous(key, { loop });
		if (
			horizontal &&
			hiddenRoots.size > 0 &&
			((intent === 'next' && scope.last() === key) || intent === 'last')
		) {
			event.preventDefault();
			moreTrigger?.focus({ preventScroll: true });
			return;
		}
		if (target !== undefined) {
			event.preventDefault();
			focusKey(target);
		}
	}
	function nextDocumentTarget(anchor: HTMLElement, backwards = false): HTMLElement | null {
		const candidates = tabbable(anchor.ownerDocument.body, {
			getShadowRoot: (element) => element.shadowRoot ?? false
		})
			.filter(isDomHtmlElement)
			.filter(
				(candidate) =>
					(anchor !== ref || !containsComposedNode(anchor, candidate)) &&
					![...panels.values()].some((panel) => containsComposedNode(panel.node, candidate))
			);
		const ordered = backwards ? [...candidates].reverse() : candidates;
		return (
			ordered.find(
				(candidate) =>
					candidate !== anchor &&
					(anchor.compareDocumentPosition(candidate) & (backwards ? 2 : 4)) !== 0
			) ?? null
		);
	}
	function panelKeydown(key: TKey, node: HTMLElement | null, event: KeyboardEvent): void {
		if (event.key !== 'Tab' || event.defaultPrevented || !node) return;
		const candidates = panelCandidates(node);
		const active = getActiveElement(node);
		if (active !== (event.shiftKey ? candidates[0] : candidates.at(-1))) return;
		const record = tree.byKey.get(key);
		if (!record) return;
		const trigger = focusTarget(key, true);
		const target = event.shiftKey ? trigger : trigger ? nextDocumentTarget(trigger) : null;
		if (!target) return;
		event.preventDefault();
		setExpanded(key, false, undefined, target);
		target.focus({ preventScroll: true });
	}
	function register(
		key: TKey,
		primary: HTMLElement | null,
		disclosure: HTMLButtonElement | null
	): () => void {
		const target = primary ?? disclosure;
		if (!target || !alive) return () => undefined;
		const release = untrack(() => mounted.mount(key, target, id(key, 'primary')));
		if (disclosure) disclosureRefs.set(key, disclosure);
		const focus = () => navigation.set(key, 'pointer');
		const handleDisclosure = (event: KeyboardEvent) => keydown(key, event);
		target.addEventListener('focus', focus);
		if (disclosure && disclosure !== target) {
			disclosure.addEventListener('focus', focus);
			disclosure.addEventListener('keydown', handleDisclosure, true);
		}
		return () => {
			const before = previousView;
			const restore = mounted.ownsFocus(key) || getActiveElement(target) === disclosure;
			release();
			target.removeEventListener('focus', focus);
			if (disclosure && disclosure !== target) {
				disclosure.removeEventListener('focus', focus);
				disclosure.removeEventListener('keydown', handleDisclosure, true);
			}
			if (disclosureRefs.get(key) === disclosure) disclosureRefs.delete(key);
			if (restore)
				(target.ownerDocument.defaultView ?? globalThis).queueMicrotask(() => {
					if (!alive) return;
					const active = getActiveElement(target);
					if (
						active &&
						active !== target.ownerDocument.body &&
						active !== target.ownerDocument.documentElement &&
						active !== target
					)
						return;
					const next = navigation.reconcileRemoved(before, key);
					focusKey(next);
				});
		};
	}
	function registerPanel(
		key: TKey,
		node: HTMLElement | null,
		restoreTarget?: (target: HTMLElement | null) => void
	): () => void {
		if (!node) return () => undefined;
		const value = { node, restoreTarget };
		panels.set(key, value);
		return () => {
			if (panels.get(key) === value) panels.delete(key);
		};
	}
	function returnFocus(key: TKey, node: HTMLElement | null): void {
		if (!node || !containsComposedNode(node, getActiveElement(node))) return;
		const record = tree.byKey.get(key);
		const candidate = [key, ...(record?.branches.toReversed() ?? [])].find(
			(candidate) => !disabled && tree.byKey.has(candidate) && !tree.byKey.get(candidate)!.disabled
		);
		const target =
			candidate === undefined
				? ref && (nextDocumentTarget(ref) ?? nextDocumentTarget(ref, true) ?? ref)
				: focusTarget(candidate, true);
		if (!target) return;
		for (const panel of panels.values()) panel.restoreTarget?.(target);
		target.focus({ preventScroll: true });
	}
	const menu: NavigationMenuContext<TKey> = {
		get mode() {
			return config.mode;
		},
		get inline() {
			return inline;
		},
		get compact() {
			return collapsed;
		},
		get direction() {
			return getElementDirection(ref, zui.direction);
		},
		get size() {
			return resolvedSize;
		},
		get tone() {
			return tone;
		},
		get variant() {
			return variant;
		},
		get currentKey() {
			return currentKey;
		},
		get emptyLabel() {
			return zui.localePack.collection.empty;
		},
		get item() {
			return itemContent;
		},
		get start() {
			return start;
		},
		get end() {
			return end;
		},
		record: (key) => tree.byKey.get(key)!,
		itemContext: (key) => {
			const record = tree.byKey.get(key)!;
			return {
				key,
				depth: record.depth,
				current: key === currentKey,
				expanded: isOpen(key),
				currentAncestor:
					currentKey !== null && (tree.byKey.get(currentKey)?.branches.includes(key) ?? false),
				disabled: disabled || record.disabled
			};
		},
		open: isOpen,
		id,
		setExpanded,
		navigate,
		keydown,
		register,
		registerPanel,
		initialFocus,
		panelKeydown,
		returnFocus,
		panelContext: (key) => ({ key, currentKey, close: () => setExpanded(key, false) })
	};
	const pinnedRoots = $derived([
		...new Set([
			...(currentKey === null || !tree.byKey.has(currentKey)
				? []
				: [tree.byKey.get(currentKey)!.rootKey]),
			...tree.records
				.filter((record) => navigationMenuItem(record)?.panel)
				.map((record) => record.rootKey)
		])
	]);
	$effect(() => {
		config;
		view;
		untrack(() => {
			navigation.reconcile();
			previousView = view;
		});
	});
	$effect.pre(() => {
		tree;
		disabled;
		untrack(() => {
			for (const [key, panel] of panels)
				if (disabled || !tree.byKey.has(key) || tree.byKey.get(key)!.disabled)
					returnFocus(key, panel.node);
		});
	});
	$effect(() => {
		if (mode !== 'horizontal' || !overflow) hiddenRoots = new Set();
	});
	onDestroy(() => {
		alive = false;
		mounted.clear();
		disclosureRefs.clear();
		panels.clear();
		requestedEdge.clear();
		slots.clear();
	});
	export function close(): void {
		closeAll();
	}
	export function expand(key: TKey): void {
		setExpanded(key, true);
	}
	export function collapse(key: TKey): void {
		setExpanded(key, false);
	}
	export function focus(key?: TKey): void {
		focusKey(key ?? view.first());
	}
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (programmatic focus fallback when every owned navigation control disappears) -->
<nav
	{...rest}
	tabindex={rest.tabindex ?? -1}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={dir ?? zui.direction}
	aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : zui.localePack.common.primaryNavigation)}
	aria-labelledby={ariaLabelledBy}
	data-disabled={disabled || undefined}
	data-mode={config.mode}
	data-collapsed={collapsed || undefined}
>
	{#if mode === 'horizontal' && overflow}
		<ZOverflowList
			as="ul"
			{items}
			itemKey={(entry) => entry.key}
			pinnedKeys={pinnedRoots}
			gap="xsmall"
			suspended={moreOpen || (!inline && openState.current.some((key) => isOpen(key)))}
			onVisibleItemsChange={(snapshot) => (hiddenRoots = new Set(snapshot.overflowKeys))}
		>
			{#snippet item(entry)}<NavigationNode {menu} {entry} horizontal />{/snippet}
			{#snippet overflow(snapshot)}
				<ZPopover bind:open={moreOpen} placement="bottom-start">
					<ZPopoverTrigger
						bind:ref={moreTrigger}
						aria-label={moreLabel}
						{disabled}
						variant="ghost"
						size={resolvedSize}
						onkeydown={(event) => {
							if (!keyboardNavigation || event.defaultPrevented) return;
							const top = collection.view({
								include: (entry) =>
									entry.value.parentBranch === undefined && !hiddenRoots.has(entry.value.rootKey)
							});
							if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
								event.preventDefault();
								focusKey(
									event.key === 'Home'
										? top.first()
										: getElementDirection(ref, zui.direction) === 'rtl'
											? event.key === 'ArrowRight'
												? top.last()
												: top.first()
											: event.key === 'ArrowLeft'
												? top.last()
												: top.first()
								);
							}
						}}>{moreLabel}</ZPopoverTrigger
					>
					<ZPopoverContent aria-label={moreLabel}>
						<NavigationMenu
							items={snapshot.overflowItems}
							{currentKey}
							openKeys={openState.current}
							onOpenKeysChange={(keys) => openState.setFromUser(keys)}
							onNavigateRequest={(request) => {
								onNavigateRequest?.(
									Object.freeze({
										...request,
										get defaultPrevented() {
											return request.defaultPrevented;
										},
										close() {
											request.close();
											closeAll();
										}
									})
								);
								if (!request.defaultPrevented) moreOpen = false;
							}}
							aria-label={moreLabel}
							dir={getElementDirection(ref, zui.direction)}
							expandMode={config.expansion}
							{size}
							{tone}
							{variant}
							{disabled}
							{keyboardNavigation}
							{loop}
						/>
					</ZPopoverContent>
				</ZPopover>
			{/snippet}
		</ZOverflowList>
	{:else}<NavigationList {menu} entries={items} horizontal={mode === 'horizontal'} />{/if}
</nav>
