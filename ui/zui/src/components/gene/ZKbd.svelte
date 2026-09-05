<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZKbdProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly children?: Snippet;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实kbd元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		category: 'gene',
		dependencies: [],
		events: [],
		id: 'kbd',
		importStatement: "import { ZKbd } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZKbd',
		parts: [],
		props: [
			{ default: '—', description: '键盘按键或输入序列。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实kbd元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '键盘按键或输入序列。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZKbd.svelte',
		states: [],
		status: 'stable',
		summary: '使用原生kbd语义展示快捷键、按键和需要用户输入的键盘序列。'
	} as const satisfies ZuiComponentMetadata;

	const kbdRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._small;
			s.color._text;
			s.display.inlineBlock;
			s.fontFamily._mono;
			s.fontSize._small;
			s.lineHeight._normal;
			s.paddingBlock._xsmall;
			s.paddingInline._small;
			s.whiteSpace.nowrap;
		},
		variants: {}
	});

	registerRecipeHmr(import.meta, kbdRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let { children, class: className, ref = $bindable(null), style, ...rest }: ZKbdProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(kbdRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<kbd
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</kbd>
