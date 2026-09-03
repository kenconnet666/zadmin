<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLOlAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type TimelineMode = 'alternate' | 'start';
	export type TimelineStatus = 'current' | 'done' | 'error' | 'pending';
	export type TimelineTone = 'danger' | 'default' | 'muted' | 'primary' | 'success';

	interface TimelineItemContent {
		readonly datetime?: string;
		readonly description?: string;
		readonly status?: TimelineStatus;
		readonly time?: string;
		readonly title: string;
		readonly tone?: TimelineTone;
	}

	interface TimelineKeyedItem {
		/** Preferred typed collection identity. */
		readonly key: PublicSelectionKey;
		readonly id?: never;
	}

	interface TimelineLegacyItem {
		/** @deprecated Use key. Retained during the pre-1.0 consumer migration. */
		readonly id: PublicSelectionKey;
		readonly key?: never;
	}

	export type TimelineItem = TimelineItemContent & (TimelineKeyedItem | TimelineLegacyItem);

	export interface ZTimelineProps extends Omit<HTMLOlAttributes, 'children'> {
		readonly content?: Snippet<[item: TimelineItem, index: number]>;
		readonly icon?: Snippet<[item: TimelineItem, index: number]>;
		/** @deprecated Use content. */
		readonly item?: Snippet<[item: TimelineItem]>;
		readonly items: readonly TimelineItem[];
		readonly label?: string;
		readonly mode?: TimelineMode;
		readonly pending?: Snippet;
		readonly pendingIcon?: Snippet;
		ref?: HTMLOListElement | null;
		readonly reverse?: boolean;
		readonly time?: Snippet<[item: TimelineItem, index: number]>;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'timeline',
		importStatement: "import { ZTimeline } from '@zadmin/zui';",
		name: 'ZTimeline',
		bindings: [{ description: '真实ol引用。', name: 'ref', type: 'HTMLOListElement | null' }],
		dependencies: ['native ol/li/time', 'typed SelectionKey', 'ZSpinner', 'logical CSS'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '真实事件li。', name: 'item' },
			{ description: 'marker与connector轴。', name: 'axis' },
			{ description: '状态marker或icon snippet。', name: 'marker' },
			{ description: '事件间装饰连接线。', name: 'connector' },
			{ description: '事件正文。', name: 'content' },
			{ description: '原生time或time snippet。', name: 'time' },
			{ description: '可选pending事件li。', name: 'pending' }
		],
		props: [
			{
				default: '必填',
				description: '以typed key标识的事件；id仅为pre-1.0迁移别名，key与id不可同时提供。',
				name: 'items',
				required: true,
				type: 'readonly TimelineItem[]'
			},
			{
				default: "'Timeline'",
				description: 'ol可访问名称；原生aria-label优先。',
				name: 'label',
				type: 'string'
			},
			{
				default: "'start'",
				description: 'start单轴或响应式alternate布局。',
				name: 'mode',
				type: "'start' | 'alternate'"
			},
			{
				default: 'false',
				description: '反转视觉事件顺序；pending仍位于时间流末端。',
				name: 'reverse',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '事件正文，接收事件与原始数组index。',
				name: 'content',
				type: 'Snippet<[TimelineItem, number]>'
			},
			{
				description: '装饰marker内容，接收事件与原始数组index。',
				name: 'icon',
				type: 'Snippet<[TimelineItem, number]>'
			},
			{
				description: '自定义时间区域，接收事件与原始数组index。',
				name: 'time',
				type: 'Snippet<[TimelineItem, number]>'
			},
			{ description: '时间流尚未完成的尾项正文。', name: 'pending', type: 'Snippet' },
			{ description: 'pending marker；默认使用ZSpinner。', name: 'pendingIcon', type: 'Snippet' },
			{
				description: '已弃用的content单参数别名。',
				name: 'item',
				type: 'Snippet<[TimelineItem]>',
				deprecatedSince: 'unreleased',
				replacement: 'content'
			}
		],
		source: 'ui/zui/src/components/data-display/ZTimeline.svelte',
		states: [
			{
				description: '事件状态。',
				name: 'data-status',
				values: ['done', 'current', 'pending', 'error']
			},
			{
				description: '解析后的有限语义tone。',
				name: 'data-tone',
				values: ['default', 'muted', 'primary', 'success', 'danger']
			},
			{ description: 'pending尾项。', name: 'data-pending', values: ['true'] },
			{ description: '布局模式。', name: 'data-mode', values: ['start', 'alternate'] },
			{ description: '视觉倒序。', name: 'data-reverse', values: ['true'] }
		],
		status: 'stable',
		summary:
			'以真实ol/li、typed key、独立content/icon/time snippets、状态tone、pending与RTL响应式alternate呈现历史事件，不复制Steps导航。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._none;
			s.listStyleType.raw('none');
			s.margin.px(0);
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const timelineItemRecipe = defineRecipe({
		base: (s) => {
			s.columnGap._medium;
			s.display.grid;
			s.minWidth.px(0);
		},
		variants: {
			mode: {
				alternate: (s) => {
					s.gridTemplateColumns.raw('minmax(0, 1fr) var(--zui-timeline-axis-size) minmax(0, 1fr)');
					s._media('(max-width: 30rem)', (s) => {
						s.gridTemplateColumns.raw('var(--zui-timeline-axis-size) minmax(0, 1fr)');
					});
				},
				start: (s) => s.gridTemplateColumns.raw('var(--zui-timeline-axis-size) minmax(0, 1fr)')
			}
		},
		defaultVariants: { mode: 'start' }
	});
	const axisRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexDirection.column;
			s.gridRow.raw('1');
		},
		variants: {
			mode: {
				alternate: (s) => {
					s.gridColumn.raw('2');
					s._media('(max-width: 30rem)', (s) => s.gridColumn.raw('1'));
				},
				start: (s) => s.gridColumn.raw('1')
			}
		},
		defaultVariants: { mode: 'start' }
	});
	const markerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius.percent(50);
			s.display.inlineFlex;
			s.flexShrink(0);
			s.height._timelineMarker;
			s.justifyContent.center;
			s.marginTop._small;
			s.width._timelineMarker;
		},
		variants: {
			custom: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor.transparent;
					s.height._small;
					s.marginTop.px(0);
					s.width._small;
				}
			},
			tone: {
				danger: (s) => s.backgroundColor._danger,
				default: (s) => s.backgroundColor._border,
				muted: (s) => s.backgroundColor._textMuted,
				primary: (s) => s.backgroundColor._primary,
				success: (s) => s.backgroundColor._success
			}
		},
		compoundVariants: [
			{
				when: { custom: true },
				style: (s) => s.backgroundColor.transparent
			}
		],
		defaultVariants: { custom: false, tone: 'default' }
	});
	const connectorRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._border;
			s.flexGrow(1);
			s.minHeight._large;
			s.width.px(2);
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.gridRow.raw('1');
			s.minWidth.px(0);
			s.paddingBlockEnd._large;
		},
		variants: {
			side: {
				after: (s) => {
					s.gridColumn.raw('3');
					s.textAlign.start;
					s._media('(max-width: 30rem)', (s) => s.gridColumn.raw('2'));
				},
				before: (s) => {
					s.gridColumn.raw('1');
					s.textAlign.end;
					s._media('(max-width: 30rem)', (s) => {
						s.gridColumn.raw('2');
						s.textAlign.start;
					});
				},
				start: (s) => {
					s.gridColumn.raw('2');
					s.textAlign.start;
				}
			}
		},
		defaultVariants: { side: 'start' }
	});
	const titleRecipe = defineRecipe({
		base: (s) => {
			s.color._text;
			s.fontWeight._semibold;
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.marginTop._small;
			s.minWidth.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const timeRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.display.block;
			s.fontSize._small;
			s.fontVariantNumeric.raw('tabular-nums');
			s.marginTop._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, timelineItemRecipe);
	registerRecipeHmr(import.meta, axisRecipe);
	registerRecipeHmr(import.meta, markerRecipe);
	registerRecipeHmr(import.meta, connectorRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, timeRecipe);
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Set is immutable validation scratch state. */
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import ZSpinner from '../feedback/ZSpinner.svelte';

	type ItemRow = Readonly<{
		entry: TimelineItem;
		index: number;
		key: SelectionKey;
		kind: 'item';
	}>;
	type PendingRow = Readonly<{ kind: 'pending' }>;
	type TimelineRow = ItemRow | PendingRow;
	type TimelineSide = 'after' | 'before' | 'start';

	let {
		'aria-label': ariaLabel,
		class: className,
		content,
		icon,
		item,
		items,
		label = 'Timeline',
		mode = 'start',
		pending,
		pendingIcon,
		ref = $bindable(null),
		reverse = false,
		style,
		time,
		...rest
	}: ZTimelineProps = $props();
	const zui = useZui();
	const pendingRowKey = Symbol('zui-timeline-pending');

	function resolveKey(entry: TimelineItem): SelectionKey {
		const key = entry.key ?? entry.id;
		if (key === undefined)
			throw new TypeError('ZTimeline items require exactly one typed key (key, or deprecated id).');
		if (entry.key !== undefined && entry.id !== undefined)
			throw new TypeError('ZTimeline items cannot provide both key and deprecated id.');
		if (typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0)))
			throw new TypeError('ZTimeline numeric keys must be finite and cannot be -0.');
		return key;
	}

	function resolveTone(entry: TimelineItem): TimelineTone {
		if (entry.tone !== undefined) return entry.tone;
		switch (entry.status) {
			case 'current':
				return 'primary';
			case 'done':
				return 'success';
			case 'error':
				return 'danger';
			case 'pending':
				return 'muted';
			default:
				return 'default';
		}
	}

	function resolveSide(visualIndex: number): TimelineSide {
		if (mode === 'start') return 'start';
		return visualIndex % 2 === 0 ? 'before' : 'after';
	}

	const validatedItems = $derived.by<ItemRow[]>(() => {
		if (content && item)
			throw new TypeError('ZTimeline accepts either content or deprecated item, not both.');
		if (pendingIcon && !pending)
			throw new TypeError('ZTimeline pendingIcon requires a pending snippet.');
		const keys = new Set<SelectionKey>();
		return items.map((entry, index) => {
			const key = resolveKey(entry);
			if (keys.has(key)) throw new Error(`Duplicate ZTimeline key "${String(key)}".`);
			keys.add(key);
			return Object.freeze({ entry, index, key, kind: 'item' as const });
		});
	});
	const rows = $derived.by<TimelineRow[]>(() => {
		const ordered: TimelineRow[] = reverse ? [...validatedItems].reverse() : [...validatedItems];
		if (!pending) return ordered;
		const pendingRow = Object.freeze({ kind: 'pending' as const });
		return reverse ? [pendingRow, ...ordered] : [...ordered, pendingRow];
	});
	const rootClass = $derived(zui.recipe(rootRecipe));
	const rowClass = $derived(zui.recipe(timelineItemRecipe, { mode }));
	const axisClass = $derived(zui.recipe(axisRecipe, { mode }));
	const connectorClass = $derived(zui.recipe(connectorRecipe));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const timeClass = $derived(zui.recipe(timeRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-timeline-axis-size': `${zui.theme.size.small}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<ol
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-busy={pending ? 'true' : undefined}
	aria-label={ariaLabel ?? label}
	data-mode={mode}
	data-reverse={reverse || undefined}
>
	{#each rows as row, visualIndex (row.kind === 'pending' ? pendingRowKey : row.key)}
		{@const side = resolveSide(visualIndex)}
		{@const rowTone = row.kind === 'pending' ? 'muted' : resolveTone(row.entry)}
		{@const rowStatus = row.kind === 'pending' ? 'pending' : row.entry.status}
		<li
			class={rowClass}
			data-slot={row.kind === 'pending' ? 'pending' : 'item'}
			data-pending={row.kind === 'pending' || undefined}
			data-status={rowStatus}
			data-tone={rowTone}
			data-key={row.kind === 'item' ? String(row.key) : undefined}
			data-key-type={row.kind === 'item' ? typeof row.key : undefined}
			aria-current={row.kind === 'item' && rowStatus === 'current' ? 'true' : undefined}
		>
			<div class={axisClass} data-slot="axis" aria-hidden="true">
				<span
					class={zui.recipe(markerRecipe, {
						custom: row.kind === 'pending' ? pendingIcon !== undefined : icon !== undefined,
						tone: rowTone
					})}
					data-slot="marker"
				>
					{#if row.kind === 'pending'}
						{#if pendingIcon}{@render pendingIcon()}{:else}<ZSpinner
								aria-hidden="true"
								size="small"
								tone="inherit"
							/>{/if}
					{:else if icon}
						{@render icon(row.entry, row.index)}
					{/if}
				</span>
				{#if visualIndex < rows.length - 1}
					<span class={connectorClass} data-slot="connector"></span>
				{/if}
			</div>
			<div class={zui.recipe(contentRecipe, { side })} data-slot="content">
				{#if row.kind === 'pending'}
					{@render pending?.()}
				{:else}
					{#if content}
						{@render content(row.entry, row.index)}
					{:else if item}
						{@render item(row.entry)}
					{:else}
						<strong class={titleClass}>{row.entry.title}</strong>
						{#if row.entry.description}
							<div class={descriptionClass}>{row.entry.description}</div>
						{/if}
					{/if}
					{#if time}
						<div class={timeClass} data-slot="time">{@render time(row.entry, row.index)}</div>
					{:else if row.entry.time}
						<time class={timeClass} data-slot="time" datetime={row.entry.datetime}
							>{row.entry.time}</time
						>
					{/if}
				{/if}
			</div>
		</li>
	{/each}
</ol>
