<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZContainerGutter = 'large' | 'medium' | 'none' | 'small';
	export type ZContainerSize = 'full' | 'large' | 'medium' | 'small';

	export interface ZContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly gutter?: ZContainerGutter;
		readonly size?: ZContainerSize;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [{ description: '真实div容器引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		category: 'layout',
		dependencies: [],
		events: [],
		id: 'container',
		importStatement: "import { ZContainer } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZContainer',
		parts: [],
		props: [
			{
				default: "'medium'",
				description: '内容最大宽度预设。',
				name: 'size',
				type: "'small' | 'medium' | 'large' | 'full'"
			},
			{
				default: "'medium'",
				description: '逻辑内联方向留白。',
				name: 'gutter',
				type: "'none' | 'small' | 'medium' | 'large'"
			},
			{ default: '—', description: '容器内容。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实div容器引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '容器内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/layout/ZContainer.svelte',
		states: [
			{
				description: '最大宽度预设。',
				name: 'data-size',
				values: ['small', 'medium', 'large', 'full']
			},
			{
				description: '逻辑内联gutter。',
				name: 'data-gutter',
				values: ['none', 'small', 'medium', 'large']
			}
		],
		status: 'stable',
		summary: '提供居中最大宽度和逻辑内联留白，不与ZStack重复布局职责。'
	} as const satisfies ZuiComponentMetadata;

	const containerRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.marginInline.auto;
			s.maxWidth.percent(100);
			s.minWidth.px(0);
			s.width._full;
		},
		variants: {
			gutter: {
				large: (s) => s.paddingInline._large,
				medium: (s) => s.paddingInline._medium,
				none: (s) => s.paddingInline._none,
				small: (s) => s.paddingInline._small
			},
			size: {
				full: (s) => s.maxWidth._full,
				large: (s) => s.maxWidth.rem(80),
				medium: (s) => s.maxWidth.rem(64),
				small: (s) => s.maxWidth.rem(40)
			}
		},
		defaultVariants: { gutter: 'medium', size: 'medium' }
	});

	registerRecipeHmr(import.meta, containerRecipe);
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

	let {
		children,
		class: className,
		gutter = 'medium',
		ref = $bindable(null),
		size = 'medium',
		style,
		...rest
	}: ZContainerProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(containerRecipe, { gutter, size }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-gutter={gutter}
	data-size={size}
>
	{@render children?.()}
</div>
