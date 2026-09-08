<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ZIconName } from '../gene/ZIcon.svelte';
	import { CancelableEvent } from '../../runtime/foundation/cancelable-event.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';
	import { styleInternalFocusRing } from '../gene/internal-action.js';

	export type StepsStatus = 'pending' | 'complete' | 'error';
	export type StepsOrientation = 'horizontal' | 'vertical';
	interface StepsItemBase<TKey extends SelectionKey> {
		readonly key: TKey;
		readonly title: string;
		readonly description?: string;
		readonly icon?: ZIconName;
		readonly status?: StepsStatus;
		readonly disabled?: boolean;
		readonly loading?: boolean;
	}
	export type StepsItem<TKey extends SelectionKey = SelectionKey> = StepsItemBase<TKey> &
		(
			| {
					readonly href: string;
					readonly target?: HTMLAnchorAttributes['target'];
					readonly rel?: string;
					readonly clickable?: never;
			  }
			| {
					readonly href?: never;
					readonly target?: never;
					readonly rel?: never;
					readonly clickable?: boolean;
			  }
		);
	export interface StepsItemContext {
		readonly index: number;
		readonly current: boolean;
		readonly status: StepsStatus;
		readonly disabled: boolean;
		readonly loading: boolean;
	}
	export class StepRequestEvent<TKey extends SelectionKey = SelectionKey> extends CancelableEvent {
		readonly item: StepsItem<TKey>;
		readonly previousKey: TKey | null;
		readonly originalEvent: MouseEvent;
		constructor(item: StepsItem<TKey>, previousKey: TKey | null, originalEvent: MouseEvent) {
			super();
			this.item = item;
			this.previousKey = previousKey;
			this.originalEvent = originalEvent;
		}
		get key(): TKey {
			return this.item.key;
		}
	}
	export interface ZStepsProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLOListElement>,
		'children' | 'title' | 'reversed' | 'role' | 'start' | 'type'
	> {
		readonly items: readonly StepsItem<TKey>[];
		currentKey?: TKey | null;
		readonly defaultCurrentKey?: TKey | null;
		readonly onStepRequest?: (event: StepRequestEvent<TKey>) => void;
		readonly onCurrentKeyChange?: (key: TKey | null) => void;
		readonly orientation?: StepsOrientation;
		readonly size?: ZControlSize;
		readonly indicator?: Snippet<[item: StepsItem<TKey>, context: StepsItemContext]>;
		readonly title?: Snippet<[item: StepsItem<TKey>, context: StepsItemContext]>;
		readonly description?: Snippet<[item: StepsItem<TKey>, context: StepsItemContext]>;
		ref?: HTMLOListElement | null;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'steps',
		name: 'ZSteps',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/navigation/ZSteps.svelte',
		importStatement: "import { ZSteps } from '@zadmin/zui';",
		summary:
			'用稳定key、原生有序列表和可取消切换请求呈现流程状态；步骤可为被动内容、按钮或真实链接。',
		dependencies: [
			'native ol/li/button/a',
			'ControllableState',
			'CancelableEvent',
			'ZIcon',
			'ZSpinner'
		],
		bindings: [
			{ name: 'currentKey', type: 'TKey | null', description: '唯一当前步骤；null表示无当前项。' },
			{ name: 'ref', type: 'HTMLOListElement | null', description: '真实有序列表引用。' }
		],
		events: [
			{
				name: 'onStepRequest',
				type: '(event: StepRequestEvent<TKey>) => void',
				description: '同步可取消的用户切换请求；异步校验先取消再由消费者写currentKey。'
			},
			{
				name: 'onCurrentKeyChange',
				type: '(key: TKey | null) => void',
				description: '被接受的用户切换后调用；外部写入与reset不调用。'
			}
		],
		keyboard: [
			{
				key: 'Tab / Shift+Tab',
				description: '按文档顺序访问可操作步骤；被动和禁用项不进入Tab序列。'
			},
			{ key: 'Enter', description: '激活真实按钮或链接。' },
			{ key: 'Space', description: '按浏览器规则激活按钮；不覆盖链接的原生行为。' }
		],
		parts: [
			{ name: 'item', description: '保留稳定key的原生li；最多一个aria-current=step。' },
			{ name: 'action', description: 'button、anchor或被动内容容器。' },
			{ name: 'indicator', description: '对辅助技术隐藏的序号、状态或自定义图标。' },
			{ name: 'content', description: '标题和描述的可收缩内容区。' },
			{ name: 'title', description: '步骤标题。' },
			{ name: 'description', description: '可选步骤描述。' },
			{ name: 'status', description: '辅助技术可读的业务状态。' }
		],
		props: [
			{
				name: 'items',
				type: 'readonly StepsItem<TKey>[]',
				default: '必填',
				required: true,
				description:
					'稳定typed key的步骤数据；status不按当前位置推断，href项为链接，否则clickable项为按钮。',
				members: [
					{
						name: 'key',
						type: 'TKey',
						required: true,
						description: '唯一字符串或有限数字；number 1和string "1"不同。'
					},
					{
						name: 'title',
						type: 'string',
						required: true,
						description: '非空标题和定制内容的文本后备。'
					},
					{ name: 'description', type: 'string', description: '可选的完整说明。' },
					{ name: 'icon', type: 'ZIconName', description: '默认指示器图标。' },
					{
						name: 'status',
						type: 'StepsStatus',
						default: 'pending',
						description: 'pending、complete或error，由业务明确提供。'
					},
					{ name: 'disabled', type: 'boolean', default: 'false', description: '禁止步骤激活。' },
					{
						name: 'loading',
						type: 'boolean',
						default: 'false',
						description: '显示加载指示并暂时禁止激活；不自动变更业务状态。'
					},
					{
						name: 'clickable',
						type: 'boolean',
						default: 'false',
						description: '无href时渲染button；有href时不能提供此字段。'
					},
					{
						name: 'href',
						type: 'string',
						requiredWhen: '链接步骤分支；该分支禁止clickable。',
						description: '真实链接目标；保留修饰键与浏览器原生导航。'
					},
					{
						name: 'target',
						type: "HTMLAnchorAttributes['target']",
						description: '仅用于href项的原生目标窗口。'
					},
					{
						name: 'rel',
						type: 'string',
						description: '仅用于href项的原生关系；_blank自动隔离opener。'
					}
				]
			},
			{
				name: 'currentKey',
				type: 'TKey | null',
				default: 'defaultCurrentKey → null',
				bindable: true,
				description: '唯一当前步骤；外部设null清空，key不在items中时保留值且不标记其他项。'
			},
			{
				name: 'defaultCurrentKey',
				type: 'TKey | null',
				default: 'null',
				description: '未提供currentKey时的一次性初始值；后续变化不重置当前步骤。'
			},
			{
				name: 'orientation',
				type: 'StepsOrientation',
				default: 'horizontal',
				description: '横向等分或纵向步骤与连接线。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Provider density',
				description: '五档指示器、字号和最小操作高度。'
			},
			{
				name: 'ref',
				type: 'HTMLOListElement | null',
				default: 'null',
				bindable: true,
				description: '真实ol引用。'
			}
		],
		snippets: [
			{
				name: 'indicator',
				type: 'Snippet<[StepsItem<TKey>, StepsItemContext]>',
				description: '定制装饰指示器；loading时仍使用可停止的Spinner。'
			},
			{
				name: 'title',
				type: 'Snippet<[StepsItem<TKey>, StepsItemContext]>',
				description: '定制标题内部内容，不替换外层按钮/链接。'
			},
			{
				name: 'description',
				type: 'Snippet<[StepsItem<TKey>, StepsItemContext]>',
				description: '定制描述内部内容。'
			}
		],
		states: [
			{ name: 'data-orientation', values: ['horizontal', 'vertical'], description: '列表方向。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的五档尺寸。'
			},
			{ name: 'data-current', values: ['true'], description: '唯一当前步骤。' },
			{ name: 'data-status', values: ['pending', 'complete', 'error'], description: '业务状态。' },
			{ name: 'data-loading', values: ['true'], description: '步骤正在等待业务工作。' },
			{ name: 'data-disabled', values: ['true'], description: '禁用或加载期间禁止激活。' },
			{ name: 'data-key-type', values: ['string', 'number'], description: '稳定key的原始类型。' },
			{ name: 'data-reduced-motion', values: ['true'], description: '已解析的减少动画偏好。' }
		]
	} as const satisfies ZuiComponentMetadata;

	const stepsRecipe = defineSlotRecipe(
		{
			slots: ['root', 'item', 'action', 'indicator', 'content', 'title', 'description'] as const,
			variants: {},
			base: {
				root: (s) => {
					s.display.grid;
					s.gap._large;
					s.gridTemplateColumns.raw(
						'repeat(auto-fit, minmax(min(100%, calc(var(--zui-steps-marker-size) * 3)), 1fr))'
					);
					s.listStyleType.none;
					s.margin.px(0);
					s.padding.px(0);
					s.maxWidth.percent(100);
					s.minWidth.px(0);
					s.fontFamily._sans;
					s.fontSize.raw('var(--zui-steps-font-size)');
					s.lineHeight._normal;
					s._selector('&[data-orientation="vertical"]', (s) =>
						s.gridTemplateColumns.raw('minmax(0, 1fr)')
					);
				},
				item: (s) => {
					s.position.relative;
					s.minWidth.px(0);
					s._selector('&:not(:last-child)::after', (s) => {
						s.content.raw('""');
						s.position.absolute;
						s.pointerEvents.none;
						s.backgroundColor._border;
						s.insetBlockStart.raw('calc(var(--zui-steps-marker-size) / 2)');
						s.insetInlineStart.raw('calc(var(--zui-steps-marker-size) + var(--zui-steps-gap))');
						s.insetInlineEnd.px(0);
						s.blockSize.raw('var(--zui-steps-line-width)');
						s.transitionProperty.raw('background-color');
						s.transitionDuration._fast;
						s.transitionTimingFunction._standard;
					});
					s._selector('&[data-status="complete"]::after', (s) => s.backgroundColor._success);
					s._selector('[data-orientation="vertical"] > &:not(:last-child)::after', (s) => {
						s.insetInlineStart.raw('calc(var(--zui-steps-marker-size) / 2)');
						s.insetInlineEnd.raw('auto');
						s.inlineSize.raw('var(--zui-steps-line-width)');
						s.blockSize.raw('auto');
						s.insetBlockStart.raw('calc(var(--zui-steps-marker-size) + var(--zui-steps-gap))');
						s.insetBlockEnd.raw('calc(0px - var(--zui-steps-gap))');
					});
					s._selector('[data-reduced-motion="true"] > &::after', (s) => s.transitionDuration.ms(0));
				},
				action: (s) => {
					s.appearance.none;
					s.backgroundColor.transparent;
					s.borderWidth.px(0);
					s.borderRadius._small;
					s.boxSizing.borderBox;
					s.color._text;
					s.display.flex;
					s.flexDirection.column;
					s.alignItems.start;
					s.gap._medium;
					s.font.inherit;
					s.textAlign.start;
					s.textDecoration.none;
					s.minHeight.raw('var(--zui-steps-marker-size)');
					s.minWidth.px(0);
					s.width.percent(100);
					s.padding.px(0);
					s.overflowWrap.anywhere;
					styleInternalFocusRing(s);
					s._selector('&[data-interactive="true"]', (s) => s.cursor.pointer);
					s._selector(
						'&[data-interactive="true"]:not([aria-disabled="true"]):hover [data-slot="title"]',
						(s) => s.color._primary
					);
					s._selector('&[aria-disabled="true"]', (s) => {
						s.cursor.notAllowed;
						s.opacity._disabled;
					});
					s._selector('ol[data-orientation="vertical"] > li > &', (s) => s.flexDirection.row);
				},
				indicator: (s) => {
					s.alignItems.center;
					s.justifyContent.center;
					s.display.inlineFlex;
					s.flexShrink(0);
					s.boxSizing.borderBox;
					s.inlineSize.raw('var(--zui-steps-marker-size)');
					s.blockSize.raw('var(--zui-steps-marker-size)');
					s.borderRadius.percent(50);
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.borderColor._border;
					s.backgroundColor._surface;
					s.color._textMuted;
					s.fontWeight._medium;
					s.transitionProperty.raw('color, background-color, border-color');
					s.transitionDuration._fast;
					s.transitionTimingFunction._standard;
					s._selector('[data-slot="item"][data-current="true"] > [data-slot="action"] > &', (s) => {
						s.backgroundColor._primarySubtle;
						s.borderColor._primary;
						s.color._primary;
					});
					s._selector(
						'[data-slot="item"][data-status="complete"] > [data-slot="action"] > &',
						(s) => {
							s.backgroundColor._successSubtle;
							s.borderColor._success;
							s.color._success;
						}
					);
					s._selector('[data-slot="item"][data-status="error"] > [data-slot="action"] > &', (s) => {
						s.backgroundColor._dangerSubtle;
						s.borderColor._danger;
						s.color._danger;
					});
					s._selector('ol[data-reduced-motion="true"] > li > [data-slot="action"] > &', (s) =>
						s.transitionDuration.ms(0)
					);
				},
				content: (s) => {
					s.minWidth.px(0);
					s.maxWidth.percent(100);
				},
				title: (s) => {
					s.display.block;
					s.fontWeight._medium;
					s.overflowWrap.anywhere;
					s._selector(
						'[data-slot="item"][data-current="true"] > [data-slot="action"] > [data-slot="content"] > &',
						(s) => s.fontWeight._semibold
					);
					s._selector(
						'[data-slot="item"][data-status="error"] > [data-slot="action"] > [data-slot="content"] > &',
						(s) => s.color._danger
					);
				},
				description: (s) => {
					s.display.block;
					s.color._textMuted;
					s.marginBlockStart._xsmall;
					s.overflowWrap.anywhere;
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		controlSizes,
		controlSizeMetrics,
		resolveControlSize
	} from '../../runtime/foundation/control-size.js';
	import { cssLength } from '../../theme/units.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import ZIcon from '../gene/ZIcon.svelte';
	import ZSpinner from '../feedback/ZSpinner.svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';

	let {
		'aria-label': ariaLabel,
		class: className,
		currentKey = $bindable(),
		defaultCurrentKey = null,
		description,
		dir,
		indicator,
		items,
		onCurrentKeyChange,
		onStepRequest,
		orientation = 'horizontal',
		ref = $bindable(null),
		size,
		style,
		title,
		...rest
	}: ZStepsProps<TKey> = $props();
	const zui = useZui();
	const motion = new ReducedMotionState(() => zui.motion);
	$effect(() => motion.connect(ref?.ownerDocument.defaultView));
	const currentState = new ControllableState<TKey | null>({
		read: () => currentKey,
		defaultValue: () => defaultCurrentKey,
		resetToInitialValue: true,
		write: (key) => (currentKey = key),
		onChange: () => onCurrentKeyChange
	});
	/** Explicit lifecycle reset; Steps does not own a native form value. */
	export function reset(): void {
		currentState.reset();
	}
	const resolvedSize = $derived(resolveControlSize(size, zui.density));
	const classes = $derived(zui.slots(stepsRecipe));
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const formatter = $derived(new Intl.NumberFormat(zui.locale));
	const icssVariables = $derived({
		...readIcssCarrier(rest),
		'--zui-steps-marker-size': metrics.height,
		'--zui-steps-font-size': metrics.fontSize,
		'--zui-steps-gap': cssLength(zui.theme.space.medium),
		'--zui-steps-line-width': cssLength(zui.theme.borderWidth.hairline)
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	function assertKey(key: SelectionKey | null): void {
		if (
			key !== null &&
			typeof key !== 'string' &&
			(typeof key !== 'number' || !Number.isFinite(key) || Object.is(key, -0))
		) {
			throw new TypeError('ZSteps keys must be strings or finite numbers other than -0.');
		}
	}
	const entries = $derived.by(() => {
		assertKey(currentState.current);
		assertKey(defaultCurrentKey);
		if (!controlSizes.includes(resolvedSize))
			throw new TypeError('ZSteps size must be one of the five control sizes.');
		if (orientation !== 'horizontal' && orientation !== 'vertical')
			throw new TypeError('ZSteps orientation must be horizontal or vertical.');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Rebuilt for each validated item projection.
		const keys = new Set<TKey>();
		return items.map((entry, index) => {
			assertKey(entry.key);
			if (entry.key === null || keys.has(entry.key))
				throw new TypeError('ZSteps items require unique non-null keys.');
			keys.add(entry.key);
			if (typeof entry.title !== 'string' || !entry.title.trim())
				throw new TypeError('ZSteps items require a non-empty title.');
			if (entry.description !== undefined && typeof entry.description !== 'string')
				throw new TypeError('ZSteps description must be a string.');
			for (const field of ['clickable', 'disabled', 'loading'] as const) {
				if (entry[field] !== undefined && typeof entry[field] !== 'boolean')
					throw new TypeError(`ZSteps ${field} must be a boolean.`);
			}
			if (entry.status !== undefined && !['pending', 'complete', 'error'].includes(entry.status))
				throw new TypeError('ZSteps status must be pending, complete or error.');
			if (
				entry.href !== undefined &&
				(typeof entry.href !== 'string' || !entry.href.trim() || entry.clickable !== undefined)
			)
				throw new TypeError('ZSteps href must be non-empty and cannot be combined with clickable.');
			if (entry.href === undefined && (entry.target !== undefined || entry.rel !== undefined))
				throw new TypeError('ZSteps target and rel require href.');
			const context: StepsItemContext = {
				index,
				current: Object.is(entry.key, currentState.current),
				status: entry.status ?? 'pending',
				disabled: Boolean(entry.disabled || entry.loading),
				loading: entry.loading === true
			};
			return { item: entry, context };
		});
	});
	function request(entry: StepsItem<TKey>, event: MouseEvent): void {
		if (entry.disabled || entry.loading) {
			event.preventDefault();
			return;
		}
		if (event.defaultPrevented) return;
		if (
			entry.href !== undefined &&
			(event.button !== 0 ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				event.altKey ||
				(entry.target && entry.target.toLowerCase() !== '_self'))
		)
			return;
		if (Object.is(entry.key, currentState.current)) return;
		const next = new StepRequestEvent(entry, currentState.current, event);
		onStepRequest?.(next);
		if (next.defaultPrevented || event.defaultPrevented) {
			event.preventDefault();
			return;
		}
		currentState.setFromUser(entry.key);
	}
	function linkRel(entry: StepsItem<TKey>): string | undefined {
		if (entry.target?.toLowerCase() !== '_blank') return entry.rel;
		const tokens = (entry.rel ?? '')
			.split(/\s+/u)
			.filter((token) => token && token.toLowerCase() !== 'opener');
		for (const token of ['noopener', 'noreferrer'])
			if (!tokens.some((value) => value.toLowerCase() === token)) tokens.push(token);
		return tokens.join(' ');
	}
</script>

{#snippet contents(entry: StepsItem<TKey>, context: StepsItemContext)}
	<span class={classes.indicator} data-slot="indicator" aria-hidden="true">
		{#if context.loading}<ZSpinner size={resolvedSize} tone="inherit" aria-hidden="true" />
		{:else if indicator}{@render indicator(entry, context)}
		{:else if entry.icon}<ZIcon name={entry.icon} size={resolvedSize} />
		{:else if context.status === 'complete'}<ZIcon name="check" size={resolvedSize} />
		{:else if context.status === 'error'}<ZIcon name="warning" size={resolvedSize} />
		{:else}{formatter.format(context.index + 1)}{/if}
	</span>
	<span class={classes.content} data-slot="content">
		<span class={classes.title} data-slot="title"
			>{#if title}{@render title(entry, context)}{:else}{entry.title}{/if}</span
		>
		{#if description || entry.description}<span class={classes.description} data-slot="description"
				>{#if description}{@render description(entry, context)}{:else}{entry.description}{/if}</span
			>{/if}
		{#if context.loading || !context.current || context.status !== 'pending'}
			<ZVisuallyHidden data-slot="status"
				>{context.loading
					? zui.localePack.steps.loading
					: zui.localePack.steps[context.status]}</ZVisuallyHidden
			>
		{/if}
		{#if entry.target?.toLowerCase() === '_blank'}<ZVisuallyHidden
				>{zui.localePack.link.opensInNewWindow}</ZVisuallyHidden
			>{/if}
	</span>
{/snippet}

<ol
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	role="list"
	aria-label={ariaLabel ?? zui.localePack.steps.label}
	dir={dir ?? zui.direction}
	data-size={resolvedSize}
	data-orientation={orientation}
	data-reduced-motion={motion.current || undefined}
>
	{#each entries as { item: entry, context } (entry.key)}
		<li
			class={classes.item}
			data-slot="item"
			data-key={String(entry.key)}
			data-key-type={typeof entry.key}
			data-current={context.current || undefined}
			data-status={context.status}
			data-loading={context.loading || undefined}
			data-disabled={context.disabled || undefined}
			aria-current={context.current ? 'step' : undefined}
			aria-busy={context.loading || undefined}
		>
			{#if entry.href !== undefined}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- Library links preserve caller-owned native destinations. -->
				<a
					class={classes.action}
					data-slot="action"
					data-interactive="true"
					href={context.disabled ? undefined : entry.href}
					target={entry.target}
					rel={linkRel(entry)}
					role={context.disabled ? 'link' : undefined}
					aria-disabled={context.disabled || undefined}
					tabindex={context.disabled ? -1 : undefined}
					onclick={(event) => request(entry, event)}>{@render contents(entry, context)}</a
				>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else if entry.clickable}
				<button
					type="button"
					class={classes.action}
					data-slot="action"
					data-interactive="true"
					disabled={context.disabled}
					aria-disabled={context.disabled || undefined}
					onclick={(event) => request(entry, event)}>{@render contents(entry, context)}</button
				>
			{:else}<div
					class={classes.action}
					data-slot="action"
					aria-disabled={context.disabled || undefined}
				>
					{@render contents(entry, context)}
				</div>{/if}
		</li>
	{/each}
</ol>
