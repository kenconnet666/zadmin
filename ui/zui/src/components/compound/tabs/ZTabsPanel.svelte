<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZTabsPanelProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-labelledby' | 'children' | 'hidden' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
		readonly value: string;
	}

	const tabsPanelRecipe = defineRecipe({
		base: (s) => {
			s.paddingBlock._large;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, tabsPanelRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tabs-panel',
		importStatement: "import { ZTabsPanel } from '@zadmin/zui';",
		name: 'ZTabsPanel',
		bindings: [
			{ description: '真实tabpanel元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZTabs', 'ZTabsTrigger'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '必填',
				description: '与Trigger配对的稳定值。',
				name: 'value',
				required: true,
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实tabpanel元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'Panel内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tabs/ZTabsPanel.svelte',
		states: [{ description: '激活状态。', name: 'data-state', values: ['active', 'inactive'] }],
		status: 'experimental',
		summary: '与Trigger建立稳定ARIA关联并使用hidden控制可见性的tabpanel。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/root-style.js';
	import { useZui } from '../../../runtime/context.js';
	import { readIcssCarrier } from '../../../runtime/compiler-bridge.js';
	import { useZTabs } from './context.svelte.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		value,
		...rest
	}: ZTabsPanelProps = $props();
	const zui = useZui();
	const tabs = useZTabs();
	const selected = $derived(tabs.isSelected(value));
	const rootClass = $derived(zui.recipe(tabsPanelRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={tabs.panelId(value)}
	role="tabpanel"
	tabindex={0}
	hidden={!selected}
	aria-labelledby={tabs.triggerId(value)}
	data-state={selected ? 'active' : 'inactive'}
>
	{@render children?.()}
</div>
