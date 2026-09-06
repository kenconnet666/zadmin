<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZSpacerSize = ZControlSize | 'none' | number | string;

	export interface ZSpacerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly blockSize?: ResponsiveValue<ZSpacerSize>;
		readonly inlineSize?: ResponsiveValue<ZSpacerSize>;
		readonly query?: ResponsiveQuery;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实div留白元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'layout',
		dependencies: ['typed responsive CSS', 'Theme space tokens'],
		events: [],
		id: 'spacer',
		importStatement: "import { ZSpacer } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZSpacer',
		parts: [],
		props: [
			{
				default: "'medium'",
				description:
					'逻辑内联尺寸；通用Theme spacing token、非负px数字或必须解析为长度的CSS sizing expression，支持响应式配置。',
				name: 'inlineSize',
				type: 'ResponsiveValue<ZSpacerSize>'
			},
			{
				default: "'none'",
				description:
					'逻辑块尺寸；通用Theme spacing token、非负px数字或必须解析为长度的CSS sizing expression，支持响应式配置。',
				name: 'blockSize',
				type: 'ResponsiveValue<ZSpacerSize>'
			},
			{
				default: "'viewport'",
				description: '尺寸响应式参照；viewport或已命名的祖先CSS容器。',
				name: 'query',
				type: 'ResponsiveQuery'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实div留白元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/layout/ZSpacer.svelte',
		states: [],
		status: 'experimental',
		summary: '以逻辑inlineSize/blockSize创建固定留白元素；它不是父容器gap，也不声明弹性填充策略。'
	} as const satisfies ZuiComponentMetadata;

	const spacerRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.display.block;
			s.flexShrink(0);
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, spacerRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { cssLength, cssLengthExpression } from '../../theme/units.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	const SPACE_TOKENS = ['none', 'xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	let {
		blockSize = 'none',
		class: className,
		dir,
		inlineSize = 'medium',
		query = 'viewport',
		ref = $bindable(null),
		style,
		...rest
	}: ZSpacerProps = $props();

	function isSpaceToken(value: string): value is (typeof SPACE_TOKENS)[number] {
		return SPACE_TOKENS.includes(value as (typeof SPACE_TOKENS)[number]);
	}

	function formatSpacerSize(value: ZSpacerSize): string {
		return typeof value === 'string' && isSpaceToken(value)
			? cssLength(zui.theme.space[value])
			: cssLengthExpression(value);
	}

	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	const rootClass = $derived(zui.recipe(spacerRecipe));
	const sizeClass = $derived(
		zui.icss((s) => {
			s.inlineSize.raw(cssLength(zui.theme.space.medium));
			s.blockSize.raw(cssLength(zui.theme.space.none));
			applyResponsiveStyles(
				s,
				inlineSize,
				(s, value) => s.inlineSize.raw(formatSpacerSize(value)),
				query
			);
			applyResponsiveStyles(
				s,
				blockSize,
				(s, value) => s.blockSize.raw(formatSpacerSize(value)),
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
	class={[rootClass, sizeClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	dir={resolvedDirection}
></div>
