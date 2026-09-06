<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZSimpleGridMinItemWidth = number | string;

	interface ZSimpleGridBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly columnGap?: ResponsiveValue<ZLayoutSpacing>;
		readonly gap?: ResponsiveValue<ZLayoutSpacing>;
		readonly query?: ResponsiveQuery;
		readonly rowGap?: ResponsiveValue<ZLayoutSpacing>;
		ref?: HTMLDivElement | null;
	}

	interface ZSimpleGridColumnsProps {
		readonly columns?: ResponsiveValue<number>;
		readonly minItemWidth?: never;
	}

	interface ZSimpleGridMinItemWidthProps {
		readonly columns?: never;
		readonly minItemWidth: ResponsiveValue<ZSimpleGridMinItemWidth>;
	}

	export type ZSimpleGridProps = ZSimpleGridBaseProps &
		(ZSimpleGridColumnsProps | ZSimpleGridMinItemWidthProps);

	export const zuiMetadata = {
		bindings: [{ description: '真实网格div引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		category: 'layout',
		dependencies: ['CSS Grid', 'typed responsive CSS', 'named container queries'],
		events: [],
		id: 'simple-grid',
		importStatement: "import { ZSimpleGrid } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZSimpleGrid',
		parts: [],
		props: [
			{
				default: '3',
				description: '每个断点的正整数等宽列数；不能与minItemWidth同时提供。',
				name: 'columns',
				type: 'ResponsiveValue<number>'
			},
			{
				default: '—',
				description:
					'每个断点的最小列宽，切换到CSS auto-fit；数字按px，支持CSS长度、百分比和var/calc/min/max/clamp；未给base时使用Theme.size.gridItemMinWidth，不能与columns同时提供。',
				name: 'minItemWidth',
				requiredWhen: '使用auto-fit模式时必填，并且不能同时提供columns。',
				type: 'ResponsiveValue<number | string>'
			},
			{
				default: "'medium'",
				description: '双轴Theme间距或非负px值，支持断点配置。',
				name: 'gap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: '—',
				description: '独立覆盖行间距，支持断点配置。',
				name: 'rowGap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: '—',
				description: '独立覆盖列间距，支持断点配置。',
				name: 'columnGap',
				type: 'ResponsiveValue<ZLayoutSpacing>'
			},
			{
				default: "'viewport'",
				description: '响应式参照；viewport或已命名的祖先CSS容器。',
				name: 'query',
				type: 'ResponsiveQuery'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实网格div引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '普通等宽网格子项；不使用ZGridItem或布局上下文。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/layout/ZSimpleGrid.svelte',
		states: [
			{
				description: '固定列数或自适应最小列宽策略。',
				name: 'data-mode',
				values: ['columns', 'min-item-width']
			}
		],
		status: 'experimental',
		summary:
			'用普通children提供固定等宽列或纯CSS auto-fit最小列宽，不承担ZGridItem跨列与布局上下文。'
	} as const satisfies ZuiComponentMetadata;

	const simpleGridRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.display.grid;
			s.minWidth.px(0);
			s._selector('& > *', (s) => s.minWidth.px(0));
		},
		defaultVariants: {},
		variants: {}
	});

	registerRecipeHmr(import.meta, simpleGridRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyLayoutSpacing } from '../../runtime/foundation/layout.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { UNIT_FAMILIES } from '../../theme/units.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	const CSS_LENGTH_UNIT = `(?:%|${Object.values(UNIT_FAMILIES.length).join('|')})`;
	const CSS_LENGTH_LITERAL = new RegExp(
		`^(?:0|(?:\\d+(?:\\.\\d*)?|\\.\\d+)${CSS_LENGTH_UNIT})$`,
		'u'
	);

	let {
		children,
		class: className,
		columnGap,
		columns,
		gap = 'medium',
		minItemWidth,
		query = 'viewport',
		ref = $bindable(null),
		rowGap,
		style,
		...rest
	}: ZSimpleGridProps = $props();

	function assertColumnCount(value: number): void {
		if (!Number.isSafeInteger(value) || value < 1) {
			throw new TypeError('SimpleGrid columns must be a positive safe integer.');
		}
	}

	function formatMinItemWidth(value: ZSimpleGridMinItemWidth): string {
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value < 0) {
				throw new TypeError('SimpleGrid minItemWidth number must be non-negative and finite.');
			}
			return `${value}px`;
		}
		const normalized = value.trim();
		// CSS resolves expressions and variables. Validate the value boundary without
		// reading browser geometry or pretending that a JS parser can resolve CSS units.
		const expression = /^(?:var|calc|min|max|clamp)\(.+\)$/su.test(normalized);
		let depth = 0;
		let balanced = true;
		for (const character of normalized) {
			if (character === '(') depth += 1;
			if (character === ')') depth -= 1;
			if (depth < 0) balanced = false;
		}
		if (
			(!CSS_LENGTH_LITERAL.test(normalized) && !expression) ||
			/[;{}]/u.test(normalized) ||
			!balanced ||
			depth !== 0
		) {
			throw new TypeError(
				'SimpleGrid minItemWidth must be a CSS length or a balanced CSS sizing expression.'
			);
		}
		return normalized;
	}

	const zui = useZui();
	const rootClass = $derived(zui.recipe(simpleGridRecipe));
	const resolvedColumns = $derived(columns ?? 3);
	const mode = $derived(minItemWidth === undefined ? 'columns' : 'min-item-width');
	const layoutClass = $derived(
		zui.icss((s) => {
			if (columns !== undefined && minItemWidth !== undefined) {
				throw new TypeError('ZSimpleGrid accepts either columns or minItemWidth, not both.');
			}
			s.gap._medium;
			if (minItemWidth === undefined) {
				s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
				applyResponsiveStyles(
					s,
					resolvedColumns,
					(s, value) => {
						assertColumnCount(value);
						s.gridTemplateColumns.raw(`repeat(${value}, minmax(0, 1fr))`);
					},
					query
				);
			} else {
				s.gridTemplateColumns.raw(
					`repeat(auto-fit, minmax(min(100%, ${formatMinItemWidth(zui.theme.size.gridItemMinWidth)}), 1fr))`
				);
				applyResponsiveStyles(
					s,
					minItemWidth,
					(s, value) => {
						const width = formatMinItemWidth(value);
						s.gridTemplateColumns.raw(`repeat(auto-fit, minmax(min(100%, ${width}), 1fr))`);
					},
					query
				);
			}
			applyResponsiveStyles(s, gap, (s, value) => applyLayoutSpacing(s, 'gap', value), query);
			applyResponsiveStyles(s, rowGap, (s, value) => applyLayoutSpacing(s, 'rowGap', value), query);
			applyResponsiveStyles(
				s,
				columnGap,
				(s, value) => applyLayoutSpacing(s, 'columnGap', value),
				query
			);
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
	data-mode={mode}
>
	{@render children?.()}
</div>
