<script module lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export const iconManifest = {
		check: ['M9.55 18 3.85 12.3l1.4-1.4 4.3 4.3 9.2-9.2 1.4 1.4z'],
		chevronDown: ['m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6z'],
		close: [
			'M18.3 5.7 12 12l6.3 6.3-1.4 1.4-6.3-6.3-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4 6.3 6.3 6.3-6.3z'
		],
		menu: ['M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z'],
		plus: ['M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z'],
		search: [
			'M10 3a7 7 0 1 0 4.9 12l4.55 4.55 1.4-1.4L16.3 13.6A7 7 0 0 0 10 3m0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10'
		],
		user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5'],
		warning: ['M12 2 1 21h22zm1 15h-2v2h2zm0-7h-2v5h2z']
	} as const satisfies Readonly<Record<string, readonly string[]>>;

	export type ZIconName = keyof typeof iconManifest;

	export function getIconPaths(name: ZIconName): readonly string[] {
		const paths = iconManifest[name];
		if (paths === undefined) throw new TypeError(`Unknown ZIcon name "${String(name)}".`);
		return paths;
	}

	export interface ZIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
		readonly label?: string;
		readonly name: ZIconName;
		readonly size?: keyof ZuiTheme['size'] | number;
		ref?: SVGSVGElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'icon',
		importStatement: "import { ZIcon } from '@zadmin/zui';",
		name: 'ZIcon',
		props: [
			{
				default: '必填',
				description: '受控manifest图标名。',
				name: 'name',
				required: true,
				type: 'keyof typeof iconManifest'
			},
			{
				default: "'small'",
				description: 'Theme尺寸token或明确px值。',
				name: 'size',
				type: "keyof ZuiTheme['size'] | number"
			},
			{ default: '—', description: '可访问图像名称。', name: 'label', type: 'string' },
			{
				bindable: true,
				default: 'null',
				description: '真实svg引用。',
				name: 'ref',
				type: 'SVGSVGElement | null'
			}
		],
		source: 'ui/zui/src/lib/components/gene/ZIcon.svelte',
		status: 'stable',
		summary: '由受控manifest生成的SVG图标，不接受任意SVG字符串。'
	} as const satisfies ZuiComponentMetadata;

	const iconRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineBlock;
			s.flexShrink(0);
			s.verticalAlign.middle;
		},
		variants: {
			size: {
				custom: () => undefined,
				full: (s) => {
					s.width._full;
					s.height._full;
				},
				large: (s) => {
					s.width._large;
					s.height._large;
				},
				medium: (s) => {
					s.width._medium;
					s.height._medium;
				},
				small: (s) => {
					s.width._small;
					s.height._small;
				}
			}
		},
		defaultVariants: { size: 'small' }
	});

	registerRecipeHmr(import.meta, iconRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

	let {
		'aria-label': ariaLabel,
		class: className,
		label,
		name,
		ref = $bindable(null),
		size = 'small',
		style,
		...rest
	}: ZIconProps = $props();

	const zui = useZui();
	const recipeClass = $derived(
		zui.recipe(iconRecipe, { size: typeof size === 'number' ? 'custom' : size })
	);
	const numericSizeClass = $derived(
		typeof size === 'number'
			? zui.icss((s) => {
					s.width.px(size);
					s.height.px(size);
				})
			: undefined
	);
	const accessibleLabel = $derived(label ?? ariaLabel);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svg
	{...rest}
	bind:this={ref}
	class={[recipeClass, numericSizeClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	viewBox="0 0 24 24"
	fill="currentColor"
	role={accessibleLabel ? 'img' : undefined}
	aria-label={accessibleLabel}
	aria-hidden={accessibleLabel ? undefined : 'true'}
	focusable="false"
>
	{#each getIconPaths(name) as path (path)}
		<path d={path}></path>
	{/each}
</svg>
