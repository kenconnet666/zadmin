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
		dependencies: ['ToastQueue', 'ZToast', 'document visibility'],
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
			{ default: '3', description: '最多显示数量。', name: 'maxVisible', type: 'number' },
			{
				default: "'top-end'",
				description: '逻辑方向位置。',
				name: 'placement',
				type: 'ToasterPlacement'
			}
		],
		since: '0.7.0',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZToaster.svelte',
		states: [],
		status: 'experimental',
		summary: '在逻辑视口位置消费显式ToastQueue并协调隐藏页与交互暂停的Toaster。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
			s.maxWidth.rem(24);
			s.position.fixed;
			s.width.raw('calc(100% - 2rem)');
			s.zIndex(120);
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
	import ZToast from './ZToast.svelte';
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
	const limit = $derived.by(() => {
		if (!Number.isInteger(maxVisible) || maxVisible < 1) {
			throw new TypeError('ZToaster maxVisible must be a positive integer.');
		}
		return maxVisible;
	});
	const visible = $derived(queue.items.slice(-limit));
	const rootClass = $derived(zui.recipe(recipe, { placement }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => queue.connectVisibility());
</script>

<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-label={label}
	data-slot="viewport"
>
	{#each visible as item (item.id)}<ZToast
			title={item.title}
			description={item.description}
			tone={item.tone}
			priority={item.priority}
			actionLabel={item.actionLabel}
			dismissLabel={`Dismiss ${item.title}`}
			onAction={() => {
				item.onAction?.(item.id);
				queue.dismiss(item.id, 'action');
			}}
			onDismiss={() => queue.dismiss(item.id, 'close')}
			onPauseChange={(reason, paused) =>
				paused ? queue.pause(item.id, reason) : queue.resume(item.id, reason)}
		/>{/each}
</section>
