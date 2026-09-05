<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZTabsListProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}

	const tabsListRecipe = defineRecipe({
		base: (s) => {
			s.borderColor._border;
			s.display.flex;
			s.gap._small;
		},
		variants: {
			orientation: {
				horizontal: (s) => {
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.flexDirection.row;
					s.overflowX.auto;
					s.overflowY.hidden;
				},
				vertical: (s) => {
					s.borderInlineEndStyle.solid;
					s.borderInlineEndWidth._hairline;
					s.flexDirection.column;
				}
			}
		},
		defaultVariants: { orientation: 'horizontal' }
	});

	registerRecipeHmr(import.meta, tabsListRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tabs-list',
		importStatement: "import { ZTabsList } from '@zadmin/zui';",
		name: 'ZTabsList',
		bindings: [
			{ description: '真实tablist元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZTabs'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实tablist元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'ZTabsTrigger集合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tabs/ZTabsList.svelte',
		states: [
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] }
		],
		status: 'stable',
		summary: '提供tablist角色、方向轴和Trigger布局的Tabs列表。'
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
		...rest
	}: ZTabsListProps = $props();
	const zui = useZui();
	const tabs = useZTabs();
	const rootClass = $derived(zui.recipe(tabsListRecipe, { orientation: tabs.orientation }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	role="tablist"
	aria-orientation={tabs.orientation}
	data-orientation={tabs.orientation}
>
	{@render children?.()}
</div>
