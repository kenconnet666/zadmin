<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLOlAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type TimelineStatus = 'current' | 'done' | 'pending';
	export interface TimelineItem {
		readonly datetime?: string;
		readonly description?: string;
		readonly id: number | string;
		readonly status?: TimelineStatus;
		readonly time?: string;
		readonly title: string;
	}
	export interface ZTimelineProps extends Omit<HTMLOlAttributes, 'children'> {
		readonly item?: Snippet<[TimelineItem]>;
		readonly items: readonly TimelineItem[];
		readonly label?: string;
		ref?: HTMLOListElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'timeline',
		importStatement: "import { ZTimeline } from '@zadmin/zui';",
		name: 'ZTimeline',
		bindings: [{ description: '真实ol引用。', name: 'ref', type: 'HTMLOListElement | null' }],
		dependencies: ['native ol/time', 'stable item ids'],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'li。', name: 'item' },
			{ description: '状态marker。', name: 'marker' },
			{ description: '时间。', name: 'time' }
		],
		props: [
			{
				default: '必填',
				description: '稳定id、状态、标题与可选时间。',
				name: 'items',
				required: true,
				type: 'readonly TimelineItem[]'
			},
			{ default: "'Timeline'", description: '列表名称。', name: 'label', type: 'string' }
		],
		since: '0.7.0',
		snippets: [{ description: '自定义li正文。', name: 'item', type: 'Snippet<[TimelineItem]>' }],
		source: 'ui/zui/src/components/data-display/ZTimeline.svelte',
		states: [
			{ description: '步骤状态。', name: 'data-status', values: ['done', 'current', 'pending'] }
		],
		status: 'experimental',
		summary: '保持ol/li/time语义与稳定状态顺序的Timeline。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._large;
			s.listStyleType.raw('none');
			s.margin.px(0);
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
			s.gridTemplateColumns.raw('var(--zui-timeline-marker-size) minmax(0, 1fr)');
		},
		variants: {},
		defaultVariants: {}
	});
	const markerRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._border;
			s.borderRadius.percent(50);
			s.height._timelineMarker;
			s.marginTop._small;
			s.width._timelineMarker;
		},
		variants: {
			status: {
				current: (s) => s.backgroundColor._accent,
				done: (s) => s.backgroundColor._success,
				pending: (s) => s.backgroundColor._border
			}
		},
		defaultVariants: { status: 'pending' }
	});
	const timeRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, itemRecipe);
	registerRecipeHmr(import.meta, markerRecipe);
	registerRecipeHmr(import.meta, timeRecipe);
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Keys are local validation scratch state. */
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		class: className,
		item,
		items,
		label = 'Timeline',
		ref = $bindable(null),
		style,
		...rest
	}: ZTimelineProps = $props();
	const zui = useZui();
	const validated = $derived.by(() => {
		const keys = new Set<number | string>();
		for (const entry of items) {
			if (keys.has(entry.id)) throw new Error(`Duplicate ZTimeline id "${entry.id}".`);
			keys.add(entry.id);
		}
		return items;
	});
	const rootClass = $derived(zui.recipe(recipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const timeClass = $derived(zui.recipe(timeRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-timeline-marker-size': `${zui.theme.size.timelineMarker}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<ol
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-label={label}
>
	{#each validated as entry (entry.id)}<li
			class={itemClass}
			data-slot="item"
			data-status={entry.status ?? 'pending'}
		>
			<span
				class={zui.recipe(markerRecipe, { status: entry.status ?? 'pending' })}
				data-slot="marker"
				aria-hidden="true"
			></span>
			<div>
				{#if item}{@render item(entry)}{:else}<strong>{entry.title}</strong
					>{#if entry.description}<div>{entry.description}</div>{/if}{#if entry.time}<time
							class={timeClass}
							datetime={entry.datetime}>{entry.time}</time
						>{/if}{/if}
			</div>
		</li>{/each}
</ol>
