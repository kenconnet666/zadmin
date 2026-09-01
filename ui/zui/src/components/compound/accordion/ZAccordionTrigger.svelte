<script module lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type ZAccordionTriggerProps = Omit<
		HTMLButtonAttributes,
		| 'aria-controls'
		| 'aria-expanded'
		| 'children'
		| 'disabled'
		| 'onclick'
		| 'onfocus'
		| 'onkeydown'
		| 'type'
	> & {
		readonly children?: Snippet;
		readonly onclick?: HTMLButtonAttributes['onclick'];
		readonly onfocus?: HTMLButtonAttributes['onfocus'];
		readonly onkeydown?: HTMLButtonAttributes['onkeydown'];
		ref?: HTMLButtonElement | null;
		readonly textValue?: string;
	};

	const accordionTriggerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor.transparent;
			s.borderWidth.px(0);
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.fontWeight._semibold;
			s.justifyContent.spaceBetween;
			s.paddingBlock._large;
			s.paddingInline.px(0);
			s.textAlign.start;
			s.width._full;
			s._hover((hover) => hover.color._primary);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => s.cursor.notAllowed
			},
			open: {
				false: () => undefined,
				true: (s) => s.color._primary
			}
		},
		defaultVariants: { disabled: false, open: false }
	});
	const accordionIndicatorRecipe = defineRecipe({
		base: (s) => {
			s.flexShrink(0);
			s.transitionDuration._fast;
			s.transitionProperty.raw('transform');
			s.transitionTimingFunction.ease;
		},
		variants: {
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: {
				false: () => undefined,
				true: (s) => s.transform.raw('rotate(180deg)')
			}
		},
		defaultVariants: { motion: 'auto', open: false }
	});

	registerRecipeHmr(import.meta, accordionTriggerRecipe);
	registerRecipeHmr(import.meta, accordionIndicatorRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'accordion-trigger',
		importStatement: "import { ZAccordionTrigger } from '@zadmin/zui';",
		name: 'ZAccordionTrigger',
		bindings: [{ description: '真实button引用。', name: 'ref', type: 'HTMLButtonElement | null' }],
		dependencies: ['ZAccordion', 'ZAccordionItem'],
		events: [
			{
				description: '原生click回调；preventDefault可取消切换。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>'
			}
		],
		keyboard: [
			{ description: '展开或折叠当前Item。', key: 'Enter / Space' },
			{ description: '在Trigger间移动焦点。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到首尾Trigger。', key: 'Home / End' }
		],
		parts: [],
		props: [
			{
				default: 'Item value',
				description: 'Collection文本值。',
				name: 'textValue',
				type: 'string'
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
		snippets: [{ description: 'Trigger标签内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/accordion/ZAccordionTrigger.svelte',
		states: [
			{ description: '展开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '拥有aria-expanded、roving focus和原生button激活语义的Accordion Trigger。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZAccordion, useZAccordionItem } from './context.svelte.js';

	let {
		children,
		class: className,
		onclick,
		onfocus,
		onkeydown,
		ref = $bindable(null),
		style,
		textValue,
		...rest
	}: ZAccordionTriggerProps = $props();
	const zui = useZui();
	const accordion = useZAccordion();
	const item = useZAccordionItem();
	const open = $derived(accordion.isOpen(item.value));
	const rootClass = $derived(zui.recipe(accordionTriggerRecipe, { disabled: item.disabled, open }));
	const indicatorClass = $derived(
		zui.recipe(accordionIndicatorRecipe, { motion: zui.motion, open })
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() =>
		accordion.register(() => ({
			disabled: item.disabled,
			element: ref,
			key: item.value,
			textValue: textValue ?? item.value
		}))
	);

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) accordion.toggle(item.value);
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLButtonElement }): void {
		accordion.focus(item.value);
		onfocus?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented) accordion.handleKey(event);
	}
</script>

<button
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={accordion.triggerId(item.value)}
	type="button"
	disabled={item.disabled}
	tabindex={item.disabled ? -1 : accordion.tabIndex(item.value)}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	aria-controls={accordion.contentId(item.value)}
	aria-expanded={open}
	data-disabled={item.disabled || undefined}
	data-state={open ? 'open' : 'closed'}
>
	{@render children?.()}
	<ChevronDown aria-hidden="true" class={indicatorClass} size={16} />
</button>
