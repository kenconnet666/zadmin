<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZButtonProps } from '../../gene/ZButton.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type ZTooltipTriggerProps = Omit<
		ZButtonProps,
		'aria-describedby' | 'onblur' | 'onclick' | 'onfocus' | 'onpointerenter' | 'onpointerleave'
	> & {
		readonly onblur?: ZButtonProps['onblur'];
		readonly onclick?: ZButtonProps['onclick'];
		readonly onfocus?: ZButtonProps['onfocus'];
		readonly onpointerenter?: ZButtonProps['onpointerenter'];
		readonly onpointerleave?: ZButtonProps['onpointerleave'];
	};
	const wrapperRecipe = defineRecipe({
		base: (s) => s.display.inlineFlex,
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, wrapperRecipe);

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tooltip-trigger',
		importStatement: "import { ZTooltipTrigger } from '@zadmin/zui';",
		name: 'ZTooltipTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZTooltip', 'ZButton', 'disabled trigger wrapper'],
		events: [
			{
				description: '激活Trigger后转发；未取消时立即关闭Tooltip。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [{ description: 'focus后显示Tooltip，blur后关闭。', key: 'Tab / Shift+Tab' }],
		parts: [
			{
				description: '仅disabled原生button时渲染的非Tab pointer/Floating包装。',
				name: 'disabled-trigger'
			}
		],
		props: [
			{
				default: 'false',
				description:
					'保留原生disabled button；非Tab wrapper只补pointer说明，键盘原因必须另有常驻内容。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实button引用。',
				name: 'ref',
				type: 'HTMLButtonElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tooltip/ZTooltipTrigger.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '合并hover与focus触发并关联aria-describedby的Tooltip按钮。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZButton from '../../gene/ZButton.svelte';
	import { useZTooltip } from './context.svelte.js';

	let {
		disabled = false,
		onblur,
		onclick,
		onfocus,
		onpointerenter,
		onpointerleave,
		ref = $bindable(null),
		...rest
	}: ZTooltipTriggerProps = $props();
	const zui = useZui();
	const tooltip = useZTooltip();
	const wrapperClass = $derived(zui.recipe(wrapperRecipe));
	let wrapper = $state<HTMLSpanElement | null>(null);
	let focused = false;
	let hovered = false;

	$effect(() => {
		const anchor = disabled ? wrapper : ref;
		tooltip.setTrigger(anchor);
		return () => {
			focused = false;
			hovered = false;
			tooltip.setTriggerFocused(false);
			if (tooltip.trigger === anchor) tooltip.setTrigger(null);
		};
	});

	function pointerEnter(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
		onpointerenter?.(event);
		if (!event.defaultPrevented) {
			hovered = true;
			tooltip.openAfterDelay();
		}
	}

	function pointerLeave(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
		onpointerleave?.(event);
		if (!event.defaultPrevented) {
			hovered = false;
			if (!focused) tooltip.close();
		}
	}

	function focus(event: FocusEvent & { currentTarget: HTMLButtonElement }): void {
		onfocus?.(event);
		if (!event.defaultPrevented) {
			focused = true;
			tooltip.setTriggerFocused(true);
			tooltip.openAfterDelay(true);
		}
	}

	function blur(event: FocusEvent & { currentTarget: HTMLButtonElement }): void {
		onblur?.(event);
		if (!event.defaultPrevented) {
			focused = false;
			tooltip.setTriggerFocused(false);
			if (!hovered) tooltip.close();
		}
	}

	function click(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) tooltip.close(true);
	}

	function disabledTrigger(node: HTMLSpanElement): { destroy(): void } {
		const enter = (): void => tooltip.openAfterDelay();
		const leave = (): void => tooltip.close();
		node.addEventListener('pointerenter', enter);
		node.addEventListener('pointerleave', leave);
		return {
			destroy() {
				node.removeEventListener('pointerenter', enter);
				node.removeEventListener('pointerleave', leave);
			}
		};
	}

	function disabledPointerEnter(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
		onpointerenter?.(event);
	}

	function disabledPointerLeave(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
		onpointerleave?.(event);
	}
</script>

{#if disabled}
	<span
		bind:this={wrapper}
		class={wrapperClass}
		data-slot="disabled-trigger"
		data-state={tooltip.open ? 'open' : 'closed'}
		use:disabledTrigger
	>
		<ZButton
			{...rest}
			bind:ref
			{disabled}
			aria-describedby={tooltip.open ? tooltip.contentId : undefined}
			data-state={tooltip.open ? 'open' : 'closed'}
			onpointerenter={disabledPointerEnter}
			onpointerleave={disabledPointerLeave}
		/>
	</span>
{:else}
	<ZButton
		{...rest}
		bind:ref
		aria-describedby={tooltip.open ? tooltip.contentId : undefined}
		data-state={tooltip.open ? 'open' : 'closed'}
		onblur={blur}
		onclick={click}
		onfocus={focus}
		onpointerenter={pointerEnter}
		onpointerleave={pointerLeave}
	/>
{/if}
