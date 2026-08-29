<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export type ZTextElement = 'label' | 'p' | 'small' | 'span' | 'strong';
	export type ZTextTone = 'danger' | 'default' | 'muted' | 'primary';

	export interface ZTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly as?: ZTextElement;
		readonly children?: Snippet;
		readonly size?: keyof ZuiTheme['fontSize'];
		readonly tone?: ZTextTone;
		readonly truncate?: boolean;
		readonly weight?: keyof ZuiTheme['fontWeight'];
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'text',
		importStatement: "import { ZText } from '@zadmin/zui';",
		name: 'ZText',
		props: [
			{
				default: "'span'",
				description: '有限的真实语义元素。',
				name: 'as',
				type: "'label' | 'p' | 'small' | 'span' | 'strong'"
			},
			{
				default: "'medium'",
				description: 'Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "'normal'",
				description: 'Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "'default'",
				description: '语义颜色。',
				name: 'tone',
				type: "'default' | 'muted' | 'primary' | 'danger'"
			},
			{ default: 'false', description: '单行省略显示。', name: 'truncate', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实文本元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		source: 'ui/zui/src/components/gene/ZText.svelte',
		status: 'stable',
		summary: '在有限语义元素上应用字号、字重、tone和截断。'
	} as const satisfies ZuiComponentMetadata;

	const textRecipe = defineRecipe({
		variants: {
			size: {
				large: (s) => s.fontSize._large,
				medium: (s) => s.fontSize._medium,
				small: (s) => s.fontSize._small,
				xlarge: (s) => s.fontSize._xlarge
			},
			tone: {
				danger: (s) => s.color._danger,
				default: (s) => s.color._text,
				muted: (s) => s.color._textMuted,
				primary: (s) => s.color._primary
			},
			truncate: {
				false: () => undefined,
				true: (s) => {
					s.overflow.hidden;
					s.textOverflow.ellipsis;
					s.whiteSpace.nowrap;
				}
			},
			weight: {
				bold: (s) => s.fontWeight._bold,
				medium: (s) => s.fontWeight._medium,
				normal: (s) => s.fontWeight._normal,
				semibold: (s) => s.fontWeight._semibold
			}
		},
		defaultVariants: {
			size: 'medium',
			tone: 'default',
			truncate: false,
			weight: 'normal'
		}
	});

	registerRecipeHmr(import.meta, textRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/root-style.js';
	import { useZui } from '../../runtime/context.js';
	import { readIcssCarrier } from '../../runtime/compiler-bridge.js';

	let {
		as = 'span',
		children,
		class: className,
		ref = $bindable(null),
		size = 'medium',
		style,
		tone = 'default',
		truncate = false,
		weight = 'normal',
		...rest
	}: ZTextProps = $props();

	const zui = useZui();
	const rootClass = $derived(zui.recipe(textRecipe, { size, tone, truncate, weight }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
>
	{@render children?.()}
</svelte:element>
