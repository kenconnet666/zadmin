<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ToastQueue } from '../../runtime/toast.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type ToasterPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
	export interface ZToasterProps extends HTMLAttributes<HTMLElement> {
		readonly label?: string;
		readonly maxVisible?: number;
		readonly placement?: ToasterPlacement;
		readonly queue: ToastQueue;
		ref?: HTMLElement | null;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'toaster',
		importStatement: "import { ZToaster, createToastQueue } from '@zadmin/zui';",
		name: 'ZToaster',
		bindings: [{ description: '真实通知region引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ToastQueue', 'ZToast', 'Portal', 'Presence', 'ReducedMotionState'],
		events: [],
		keyboard: [{ description: '进入Toast操作；焦点内暂停超时。', key: 'Tab' }],
		parts: [{ description: 'Toast堆栈。', name: 'viewport' }],
		props: [
			{
				default: '必填',
				description: '显式队列实例。',
				name: 'queue',
				required: true,
				type: 'ToastQueue'
			},
			{
				default: '3',
				description:
					'同时进入viewport的最大数量；其余消息按FIFO等待且不开始计时，动态缩小时最新项重新排队。',
				name: 'maxVisible',
				type: 'number'
			},
			{
				default: "'top-end'",
				description: '逻辑方向位置。',
				name: 'placement',
				type: 'ToasterPlacement'
			},
			{
				default: "'Notifications'",
				description: '通知viewport的可访问名称。',
				name: 'label',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: 'Portal后的真实通知region引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZToaster.svelte',
		states: [
			{
				description: '逻辑视口位置。',
				name: 'data-placement',
				values: ['bottom-end', 'bottom-start', 'top-end', 'top-start']
			},
			{ description: '等待入场的Toast数量。', name: 'data-queued', values: ['0', '1', 'n'] }
		],
		status: 'experimental',
		summary: 'Portal消费显式ToastQueue，以FIFO入场、Presence退出和多原因暂停管理通知生命周期。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
			s.maxWidth.rem(24);
			s.position.fixed;
			s.width.raw('calc(100% - 2rem)');
			s.zIndex._toast;
		},
		variants: {
			placement: {
				'bottom-end': (s) => {
					s.insetBlockEnd._large;
					s.insetInlineEnd._large;
				},
				'bottom-start': (s) => {
					s.insetBlockEnd._large;
					s.insetInlineStart._large;
				},
				'top-end': (s) => {
					s.insetBlockStart._large;
					s.insetInlineEnd._large;
				},
				'top-start': (s) => {
					s.insetBlockStart._large;
					s.insetInlineStart._large;
				}
			}
		},
		defaultVariants: { placement: 'top-end' }
	});
	registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { portal } from '../../runtime/layer/portal.js';
	import QueuedToast from './QueuedToast.svelte';
	let {
		class: className,
		label = 'Notifications',
		maxVisible = 3,
		placement = 'top-end',
		queue,
		ref = $bindable(null),
		style,
		...rest
	}: ZToasterProps = $props();
	const zui = useZui();
	let mounted = $state(false);
	const limit = $derived.by(() => {
		if (!Number.isInteger(maxVisible) || maxVisible < 1) {
			throw new TypeError('ZToaster maxVisible must be a positive integer.');
		}
		return maxVisible;
	});
	queue.setMaxVisible(untrack(() => limit));
	const visible = $derived(queue.presentedItems);
	const rootClass = $derived(zui.recipe(recipe, { placement }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const portalTarget = $derived(
		zui.portalContainer ?? (typeof document === 'undefined' ? null : document)
	);
	onMount(() => {
		mounted = true;
		return () => {
			mounted = false;
		};
	});
	$effect(() => {
		const currentQueue = queue;
		const currentLimit = limit;
		untrack(() => currentQueue.setMaxVisible(currentLimit));
		if (!mounted) return;
		const ownerDocument = ref?.ownerDocument;
		const disconnectViewport = untrack(() => currentQueue.connectViewport(currentLimit));
		const disconnectVisibility = untrack(() => currentQueue.connectVisibility(ownerDocument));
		return () => {
			disconnectVisibility();
			disconnectViewport();
		};
	});
</script>

<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	use:portal={{ target: portalTarget }}
	aria-label={label}
	data-slot="viewport"
	data-placement={placement}
	data-queued={queue.queuedCount}
>
	{#each visible as item (item.id)}<QueuedToast {item} {queue} />{/each}
</section>
