<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';

	export type ZContainerGutter = ZLayoutSpacing;
	export type ZContainerSize = ZControlSize | 'full';

	export interface ZContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly gutter?: ResponsiveValue<ZContainerGutter>;
		readonly size?: ResponsiveValue<ZContainerSize>;
		readonly maxWidth?: ResponsiveValue<string | number>;
		readonly queryName?: string;
		readonly query?: ResponsiveQuery;
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
				type: 'ResponsiveValue<ZContainerSize>'
			},
			{
				default: "'medium'",
				description: '逻辑内联方向留白。',
				name: 'gutter',
				type: 'ResponsiveValue<ZContainerGutter>'
			},
			{ default: '—', description: '容器内容。', name: 'children', type: 'Snippet' },
			{
				default: '—',
				description: '覆盖预设最大宽度，数字为px，字符串为CSS长度或关键字。',
				name: 'maxWidth',
				type: 'ResponsiveValue<string | number>'
			},
			{
				default: '—',
				description: '建立命名inline-size查询容器，供后代query使用。',
				name: 'queryName',
				type: 'string'
			},
			{
				default: "'viewport'",
				description: '本容器响应式size/gutter的参照；与给后代使用的queryName分开。',
				name: 'query',
				type: 'ResponsiveQuery'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实div容器引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '容器内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/layout/ZContainer.svelte',
		states: [
			{
				description: '最大宽度预设。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge', 'full', 'responsive']
			},
			{
				description: '逻辑内联gutter。',
				name: 'data-gutter',
				values: ['none', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'custom', 'responsive']
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
		variants: {}
	});

	registerRecipeHmr(import.meta, containerRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { applyLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { assertContainerName } from '../../icss/container-name.js';
	import { cssLength } from '../../theme/units.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		children,
		class: className,
		dir,
		gutter = 'medium',
		maxWidth,
		queryName,
		query = 'viewport',
		ref = $bindable(null),
		size = 'medium',
		style,
		...rest
	}: ZContainerProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	const rootClass = $derived(zui.recipe(containerRecipe));
	const layoutClass = $derived(
		zui.icss((s) => {
			s.maxWidth._containerMedium;
			s.paddingInline._medium;
			applyResponsiveStyles(
				s,
				size,
				(s, value) => {
					switch (value) {
						case 'full':
							s.maxWidth._full;
							break;
						case 'xsmall':
							s.maxWidth._containerXsmall;
							break;
						case 'small':
							s.maxWidth._containerSmall;
							break;
						case 'medium':
							s.maxWidth._containerMedium;
							break;
						case 'large':
							s.maxWidth._containerLarge;
							break;
						case 'xlarge':
							s.maxWidth._containerXlarge;
							break;
						default:
							throw new TypeError('Invalid Container size.');
					}
				},
				query
			);
			applyResponsiveStyles(
				s,
				gutter,
				(s, value) => applyLayoutSpacing(s, 'paddingInline', value),
				query
			);
			applyResponsiveStyles(
				s,
				maxWidth,
				(s, value) => {
					if (
						typeof value === 'number'
							? !Number.isFinite(value) || value < 0
							: value.trim().length === 0
					)
						throw new TypeError(
							'Container maxWidth must be a CSS length or a non-negative finite number.'
						);
					s.maxWidth.raw(cssLength(value));
				},
				query
			);
			if (queryName !== undefined) {
				assertContainerName(queryName);
				s.containerType.inlineSize;
				s.containerName(queryName);
			}
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, layoutClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	dir={resolvedDirection}
	data-gutter={typeof gutter === 'object'
		? 'responsive'
		: typeof gutter === 'number'
			? 'custom'
			: gutter}
	data-size={typeof size === 'object' ? 'responsive' : size}
>
	{@render children?.()}
</div>
