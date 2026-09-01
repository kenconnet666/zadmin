<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZAccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		ref?: HTMLDivElement | null;
		readonly value: string;
	}

	const accordionItemRecipe = defineRecipe({
		base: (s) => {
			s.borderBottomColor._border;
			s.borderBottomStyle.solid;
			s.borderBottomWidth._hairline;
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.opacity._disabled } },
		defaultVariants: { disabled: false }
	});

	registerRecipeHmr(import.meta, accordionItemRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'accordion-item',
		importStatement: "import { ZAccordionItem } from '@zadmin/zui';",
		name: 'ZAccordionItem',
		bindings: [{ description: '真实Item根元素引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZAccordion'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '必填',
				description: '稳定Item值与Collection key。',
				name: 'value',
				required: true,
				type: 'string'
			},
			{ default: 'false', description: '禁用当前Item。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实Item根元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/accordion/ZAccordionItem.svelte',
		states: [
			{ description: '展开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '为Trigger和Content提供稳定value与disabled边界的Accordion Item。'
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
	import { provideZAccordionItem, useZAccordion } from './context.svelte.js';

	let {
		children,
		class: className,
		disabled = false,
		ref = $bindable(null),
		style,
		value,
		...rest
	}: ZAccordionItemProps = $props();
	const zui = useZui();
	const accordion = useZAccordion();
	const resolvedDisabled = $derived(disabled || accordion.disabled);
	const open = $derived(accordion.isOpen(value));
	provideZAccordionItem({
		get disabled() {
			return resolvedDisabled;
		},
		get value() {
			return value;
		}
	});
	const rootClass = $derived(zui.recipe(accordionItemRecipe, { disabled: resolvedDisabled }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={resolvedDisabled || undefined}
	data-state={open ? 'open' : 'closed'}
>
	{@render children?.()}
</div>
