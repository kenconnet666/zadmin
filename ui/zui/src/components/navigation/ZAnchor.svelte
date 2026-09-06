<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type {
		AnchorItem,
		AnchorNavigateRequest,
		AnchorScrollContainer
	} from '../../runtime/navigation-anchor.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ZLinkTone } from '../gene/ZLink.svelte';
	import { defineSlotRecipe } from '../../recipes/slots.js';
	export type { AnchorItem, AnchorNavigateRequest, AnchorScrollContainer };
	export interface ZAnchorProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLElement>,
		'children'
	> {
		readonly items: readonly AnchorItem<TKey>[];
		activeKey?: NoInfer<TKey> | null;
		readonly defaultActiveKey?: NoInfer<TKey> | null;
		readonly onActiveKeyChange?: (key: TKey | null) => void;
		readonly onNavigateRequest?: (request: AnchorNavigateRequest<TKey>) => void;
		readonly scrollContainer?: AnchorScrollContainer | null;
		readonly getTarget?: (item: AnchorItem<TKey>) => HTMLElement | null;
		readonly offset?: number;
		readonly behavior?: ScrollBehavior | false;
		readonly history?: false | 'push' | 'replace';
		readonly focusTarget?: boolean;
		readonly orientation?: 'horizontal' | 'vertical';
		readonly size?: ZControlSize;
		readonly tone?: ZLinkTone;
		readonly disabled?: boolean;
		readonly item?: Snippet<[item: AnchorItem<TKey>, active: boolean]>;
		ref?: HTMLElement | null;
	}
	export const zuiMetadata = {
		id: 'anchor',
		name: 'ZAnchor',
		category: 'navigation',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/navigation/ZAnchor.svelte',
		summary: '原生页内链接、嵌套目录与可替换滚动容器的活动章节追踪，复用浏览器滚动和主题导航外观。',
		importStatement: "import { ZAnchor } from '@zadmin/zui';",
		dependencies: [
			'ZLink',
			'native scroll',
			'ResizeObserver',
			'MutationObserver',
			'ReducedMotionState'
		],
		props: [
			{
				name: 'items',
				type: 'readonly AnchorItem<TKey>[]',
				default: '必填',
				required: true,
				description: '全局唯一typed key的目录树，真实href与定位targetId分开；disabled向后代传播。',
				members: [
					{ name: 'key', type: 'TKey', required: true, description: '全树唯一string/number身份。' },
					{ name: 'label', type: 'string', required: true, description: '非空可见名称。' },
					{
						name: 'href',
						type: 'string',
						required: true,
						description: '真实anchor链接，修饰点击与找不到目标时保留原生导航。'
					},
					{
						name: 'targetId',
						type: 'string',
						description: '可选目标ID，适配hash路由；默认解码href片段。'
					},
					{ name: 'disabled', type: 'boolean', description: '禁用该节点及子树。' },
					{
						name: 'children',
						type: 'readonly AnchorItem<TKey>[]',
						description: '嵌套目录，所有链接自然参与Tab顺序。'
					}
				]
			},
			{
				name: 'activeKey',
				type: 'NoInfer<TKey> | null',
				bindable: true,
				default: 'defaultActiveKey',
				description: '可绑定活动章节；滚动观测更新此状态，不改写URL。'
			},
			{
				name: 'defaultActiveKey',
				type: 'NoInfer<TKey> | null',
				default: 'null',
				description: '首次真实测量前的非受控初始章节。'
			},
			{
				name: 'scrollContainer',
				type: 'AnchorScrollContainer | null',
				default: 'owner Window',
				description: '实际HTMLElement或Window滚动所有者；null使用nav所属Window。'
			},
			{
				name: 'getTarget',
				type: '(item: AnchorItem<TKey>) => HTMLElement | null',
				default: 'undefined',
				description: '覆盖目标解析，支持已知ShadowRoot与自定义内容；结果须属于滚动容器。'
			},
			{
				name: 'offset',
				type: 'number',
				default: '0',
				description: '额外顶部像素偏移；浏览器scroll-padding-top/scroll-margin-top另行保留。'
			},
			{
				name: 'behavior',
				type: 'ScrollBehavior | false',
				default: "'smooth'",
				description:
					'原生滚动行为；false只追踪章节，保留原生链接或外部路由滚动。减少动画下强制instant。'
			},
			{
				name: 'history',
				type: "false | 'push' | 'replace'",
				default: "'push'",
				description:
					'找到真实同页目标并接受导航后是否更新URL，不等待原生平滑滚动结束；滚动观测不改URL。'
			},
			{
				name: 'focusTarget',
				type: 'boolean',
				default: 'true',
				description: '激活链接时将焦点交给目标；滚动观测不移动焦点。'
			},
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: "'vertical'",
				description: '横向自然换行或纵向目录。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider anchor → link defaults → density',
				description: '五档导航链接尺寸。'
			},
			{
				name: 'tone',
				type: 'ZLinkTone',
				default: 'Provider anchor → link defaults',
				description: '复用Link主题文字与当前项色彩。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '禁用全部链接和实例导航。'
			},
			{
				name: 'ref',
				type: 'HTMLElement | null',
				bindable: true,
				default: 'null',
				description: '真实nav根。'
			}
		],
		bindings: [
			{ name: 'activeKey', type: 'TKey | null', description: '当前观测章节。' },
			{ name: 'ref', type: 'HTMLElement | null', description: '真实nav引用。' }
		],
		events: [
			{
				name: 'onActiveKeyChange',
				type: '(key: TKey | null) => void',
				description: '实际滚动观测或成功定位改变活动章节；外部赋值不回调。'
			},
			{
				name: 'onNavigateRequest',
				type: '(request: AnchorNavigateRequest<TKey>) => void',
				description: '普通同页激活且找到目标后发出可取消请求；取消后不滚动、不改历史、不移动焦点。'
			}
		],
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[AnchorItem<TKey>, boolean]>',
				description: '替换标签内容，组件继续拥有真实链接与aria-current。'
			}
		],
		parts: [
			{ name: 'list', description: '根目录原生ul。' },
			{ name: 'item', description: '带层级深度的原生li。' },
			{ name: 'link', description: '真实导航anchor。' }
		],
		states: [
			{
				name: 'data-orientation',
				values: ['horizontal', 'vertical'],
				description: '目录布局方向。'
			},
			{ name: 'aria-current', values: ['location'], description: '当前活动章节，最多一项。' }
		],
		keyboard: [
			{ key: 'Tab / Shift+Tab', description: '按原生链接顺序移动，禁用项跳过。' },
			{ key: 'Enter', description: '激活同页目标；修饰点击保持浏览器行为。' }
		]
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'list', 'item'] as const,
			base: {
				root: (s) => {
					s.minInlineSize.px(0);
					s.maxInlineSize.percent(100);
				},
				list: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._xsmall;
					s.padding.px(0);
					s.margin.px(0);
					s.listStyleType.none;
					s.minInlineSize.px(0);
					s._selector('&[data-nested="true"]', (s) => {
						s.flexDirection.column;
						s.paddingInlineStart._medium;
					});
				},
				item: (s) => {
					s.minInlineSize.px(0);
					s.maxInlineSize.percent(100);
					s.overflowWrap.anywhere;
				}
			},
			variants: {
				orientation: {
					horizontal: {
						list: (s) => {
							s.flexDirection.row;
							s.flexWrap.wrap;
							s.alignItems.start;
						}
					},
					vertical: {}
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { onDestroy, untrack } from 'svelte';
	import ZLink from '../gene/ZLink.svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { assertSelectionKey } from '../../runtime/collection/selection.js';
	import {
		anchorContainsTarget,
		anchorLocalUrl,
		anchorScrollElement,
		anchorTargetPosition,
		findAnchorTarget,
		indexAnchorItems
	} from '../../runtime/navigation-anchor.js';
	import { containsComposedNode, isDomHtmlElement } from '../../runtime/layer/dom-realm.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		items,
		activeKey = $bindable(),
		defaultActiveKey = null,
		onActiveKeyChange,
		onNavigateRequest,
		scrollContainer,
		getTarget,
		offset = 0,
		behavior = 'smooth',
		history = 'push',
		focusTarget = true,
		orientation = 'vertical',
		size,
		tone,
		disabled = false,
		item: itemContent,
		ref = $bindable(null),
		class: className,
		style,
		dir,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		...rest
	}: ZAnchorProps<TKey> = $props();
	const zui = useZui();
	const records = $derived(indexAnchorItems(items));
	const recordByKey = $derived(new Map(records.map((record) => [record.item.key, record])));
	const classes = $derived(zui.slots(recipe, { orientation }));
	const valueState = new ControllableState<TKey | null>({
		defaultValue: () => defaultActiveKey,
		read: () => activeKey,
		write: (next) => (activeKey = next),
		onChange: () => onActiveKeyChange
	});
	const reduced = new ReducedMotionState(() => zui.motion);
	const active = $derived.by(() => {
		const key = valueState.current;
		if (key !== null) assertSelectionKey(key, 'Anchor activeKey');
		return key;
	});
	const container = $derived(scrollContainer ?? ref?.ownerDocument.defaultView ?? null);
	let refreshVersion = $state(0);
	let alive = true;
	let stopFocusCleanup: (() => void) | undefined;
	let commandedScroll: AnchorScrollContainer | null = null;
	function targetFor(entry: AnchorItem<TKey>): HTMLElement | null {
		if (!ref || !container) return null;
		const target = getTarget ? getTarget(entry) : findAnchorTarget(entry, ref);
		return target && isDomHtmlElement(target) && anchorContainsTarget(target, container)
			? target
			: null;
	}
	function updateActive(): void {
		if (!alive || !container) return;
		const scroll = anchorScrollElement(container);
		const found = records
			.flatMap((record) => {
				const target = !record.disabled && !disabled ? targetFor(record.item) : null;
				return target && target.getClientRects().length
					? [{ record, position: anchorTargetPosition(target, container, offset) }]
					: [];
			})
			.sort((a, b) => a.position - b.position || a.record.depth - b.record.depth);
		if (!found.length) {
			valueState.setFromUser(null);
			return;
		}
		const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
		const passed = found.filter((entry) => entry.position <= scroll.scrollTop + 1);
		const selected =
			max > 1 && scroll.scrollTop >= max - 1 ? found.at(-1) : (passed.at(-1) ?? found[0]);
		valueState.setFromUser(selected!.record.item.key);
	}
	function focusSection(target: HTMLElement): void {
		stopFocusCleanup?.();
		const added = !target.hasAttribute('tabindex') && target.tabIndex < 0;
		if (added) target.setAttribute('tabindex', '-1');
		const cleanup = () => {
			target.removeEventListener('blur', cleanup);
			if (added && target.getAttribute('tabindex') === '-1') target.removeAttribute('tabindex');
			if (stopFocusCleanup === cleanup) stopFocusCleanup = undefined;
		};
		if (added) {
			target.addEventListener('blur', cleanup, { once: true });
			stopFocusCleanup = cleanup;
		}
		target.focus({ preventScroll: true });
	}
	function moveTo(entry: AnchorItem<TKey>, target: HTMLElement): void {
		if (!container || behavior === false || disabled) return;
		const scroll = anchorScrollElement(container);
		const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
		const top = Math.max(0, Math.min(max, anchorTargetPosition(target, container, offset)));
		if (focusTarget) focusSection(target);
		container.scrollTo({
			top,
			behavior: zui.motion === 'reduced' || reduced.current ? 'instant' : behavior
		});
		commandedScroll = container;
		if (history) {
			const url = anchorLocalUrl(entry.href, target.ownerDocument);
			const view = target.ownerDocument.defaultView;
			if (url && view && url.href !== view.location.href)
				view.history[history === 'push' ? 'pushState' : 'replaceState'](
					view.history.state,
					'',
					url.href
				);
		}
		valueState.setFromUser(entry.key);
	}
	function activate(entry: AnchorItem<TKey>, event: MouseEvent): void {
		if (
			event.defaultPrevented ||
			disabled ||
			behavior === false ||
			event.button !== 0 ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			event.altKey
		)
			return;
		const target = targetFor(entry);
		if (!target || !anchorLocalUrl(entry.href, target.ownerDocument)) return;
		let canceled = false;
		onNavigateRequest?.(
			Object.freeze({
				item: entry,
				target,
				originalEvent: event,
				get defaultPrevented() {
					return canceled || event.defaultPrevented;
				},
				preventDefault() {
					canceled = true;
					event.preventDefault();
				}
			})
		);
		if (canceled || event.defaultPrevented) return;
		event.preventDefault();
		moveTo(entry, target);
	}
	$effect(() => {
		if (!Number.isFinite(offset)) throw new TypeError('Anchor offset must be finite.');
		if (!['horizontal', 'vertical'].includes(orientation))
			throw new TypeError('Invalid Anchor orientation.');
		if (behavior !== false && !['auto', 'instant', 'smooth'].includes(behavior))
			throw new TypeError('Invalid Anchor behavior.');
		if (history !== false && !['push', 'replace'].includes(history))
			throw new TypeError('Invalid Anchor history.');
	});
	$effect(() =>
		reduced.connect(container ? anchorScrollElement(container).ownerDocument.defaultView : null)
	);
	$effect(() => {
		if (!reduced.current || !commandedScroll) return;
		const scroll = anchorScrollElement(commandedScroll);
		commandedScroll.scrollTo({
			top: scroll.scrollTop,
			left: scroll.scrollLeft,
			behavior: 'instant'
		});
		commandedScroll = null;
	});
	$effect(() => {
		const root = ref;
		const host = container;
		const currentRecords = records;
		disabled;
		offset;
		getTarget;
		refreshVersion;
		if (!root || !host) return;
		const scroll = anchorScrollElement(host);
		const view = scroll.ownerDocument.defaultView;
		if (!view) return;
		let frame = 0;
		let stopped = false;
		const schedule = () => {
			if (!frame && !stopped)
				frame = view.requestAnimationFrame(() => {
					frame = 0;
					untrack(updateActive);
				});
		};
		const resize = view.ResizeObserver ? new view.ResizeObserver(schedule) : undefined;
		const observed = new Set<Element>();
		const refreshTargets = () => {
			const targets = new Set<Element>([
				scroll,
				...currentRecords.flatMap((record) => {
					const target = targetFor(record.item);
					return target ? [target] : [];
				})
			]);
			for (const target of observed)
				if (!targets.has(target)) {
					resize?.unobserve(target);
					observed.delete(target);
				}
			for (const target of targets)
				if (!observed.has(target)) {
					resize?.observe(target);
					observed.add(target);
				}
			schedule();
		};
		untrack(refreshTargets);
		const mutation = view.MutationObserver
			? new view.MutationObserver((changes) => {
					if (changes.some((change) => !containsComposedNode(root, change.target)))
						untrack(refreshTargets);
				})
			: undefined;
		mutation?.observe(isDomHtmlElement(host) ? host : root.getRootNode(), {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['id', 'hidden']
		});
		const finish = () => {
			if (commandedScroll === host) commandedScroll = null;
			schedule();
		};
		const interrupt = () => {
			if (commandedScroll === host) commandedScroll = null;
		};
		host.addEventListener('scroll', schedule, { passive: true });
		host.addEventListener('scrollend', finish);
		for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
			host.addEventListener(type, interrupt, { passive: true });
		view.addEventListener('resize', schedule);
		view.addEventListener('hashchange', schedule);
		return () => {
			stopped = true;
			view.cancelAnimationFrame(frame);
			resize?.disconnect();
			mutation?.disconnect();
			host.removeEventListener('scroll', schedule);
			host.removeEventListener('scrollend', finish);
			for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'])
				host.removeEventListener(type, interrupt);
			view.removeEventListener('resize', schedule);
			view.removeEventListener('hashchange', schedule);
		};
	});
	onDestroy(() => {
		alive = false;
		stopFocusCleanup?.();
	});
	export function refresh(): void {
		refreshVersion += 1;
	}
	export function scrollTo(key: TKey): boolean {
		const record = records.find((record) => record.item.key === key);
		if (!record || record.disabled || disabled || behavior === false) return false;
		const target = targetFor(record.item);
		if (!target) return false;
		moveTo(record.item, target);
		return true;
	}
	export function focus(key?: TKey): void {
		const links = ref?.querySelectorAll<HTMLElement>('[data-slot="link"]');
		const index =
			key === undefined
				? records.findIndex((record) => !record.disabled)
				: records.findIndex((record) => record.item.key === key && !record.disabled);
		if (!disabled && index >= 0) links?.[index]?.focus({ preventScroll: true });
	}
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

{#snippet list(entries: readonly AnchorItem<TKey>[], nested = false)}
	<ul class={classes.list} role="list" data-slot="list" data-nested={nested || undefined}>
		{#each entries as entry (entry.key)}
			{@const record = recordByKey.get(entry.key)!}
			<li class={classes.item} data-slot="item" data-depth={record.depth}>
				<ZLink
					appearance="navigation"
					href={record.item.href}
					disabled={disabled || record.disabled}
					size={size ?? zui.componentDefaults.anchor?.size}
					tone={tone ?? zui.componentDefaults.anchor?.tone}
					aria-label={record.item.label}
					aria-current={active === record.item.key ? 'location' : undefined}
					data-slot="link"
					data-key={String(record.item.key)}
					data-key-type={typeof record.item.key}
					onclick={(event) => activate(record.item, event)}
				>
					{#if itemContent}{@render itemContent(
							record.item,
							active === record.item.key
						)}{:else}{record.item.label}{/if}
				</ZLink>
				{#if entry.children?.length}{@render list(entry.children, true)}{/if}
			</li>
		{/each}
	</ul>
{/snippet}
<nav
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={dir ?? zui.direction}
	aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : zui.localePack.common.tableOfContents)}
	aria-labelledby={ariaLabelledBy}
	data-orientation={orientation}
>
	{@render list(items)}
</nav>
