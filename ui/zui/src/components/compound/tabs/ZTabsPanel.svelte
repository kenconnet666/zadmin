<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZTabsPanelProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-labelledby' | 'children' | 'hidden' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
		readonly value: SelectionKey;
	}

	const tabsPanelRecipe = defineRecipe({
		base: (s) => {
			s.paddingBlock._large;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
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
				type: 'SelectionKey'
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
		status: 'stable',
		summary:
			'与typed Trigger稳定关联，并按Tabs的keep-mounted、lazy或active-only策略管理tabpanel；关系id由Tabs Root统一生成。'
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
	import { useZTabs } from './context.svelte.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		tabindex = 0,
		value,
		...rest
	}: ZTabsPanelProps = $props();
	const zui = useZui();
	const tabs = useZTabs();
	const selected = $derived(tabs.isSelected(value));
	const mounted = $derived(tabs.shouldMountPanel(value));
	const rootClass = $derived(zui.recipe(tabsPanelRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	$effect.pre(() => {
		const element = ref;
		if (!selected && element?.contains(element.ownerDocument.activeElement)) {
			tabs.restoreFocusFromPanel();
		}
	});
</script>

{#if mounted}
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		id={tabs.panelId(value)}
		role="tabpanel"
		{tabindex}
		hidden={!selected}
		aria-labelledby={tabs.triggerId(value)}
		data-state={selected ? 'active' : 'inactive'}
	>
		{@render children?.()}
	</div>
{/if}
