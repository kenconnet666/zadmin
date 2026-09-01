<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZAspectRatioValue = number | `${number} / ${number}`;

	export interface ZAspectRatioProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly ratio?: ZAspectRatioValue;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实div比例容器引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'layout',
		dependencies: [],
		events: [],
		id: 'aspect-ratio',
		importStatement: "import { ZAspectRatio } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZAspectRatio',
		parts: [],
		props: [
			{
				default: "'16 / 9'",
				description: '正有限数或明确的宽/高比例。',
				name: 'ratio',
				type: 'number | `${number} / ${number}`'
			},
			{ default: '—', description: '比例容器内容。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实div比例容器引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '比例容器内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/layout/ZAspectRatio.svelte',
		states: [
			{ description: '规范化后的CSS比例。', name: 'data-ratio', values: ['positive ratio'] }
		],
		status: 'experimental',
		summary: '使用原生aspect-ratio建立稳定比例，不用padding hack或ResizeObserver。'
	} as const satisfies ZuiComponentMetadata;

	const aspectRatioRecipe = defineRecipe({
		base: (s) => {
			s.aspectRatio.raw('var(--zui-aspect-ratio)');
			s.maxWidth.percent(100);
			s.minWidth.px(0);
			s.width._full;
		},
		variants: {}
	});

	registerRecipeHmr(import.meta, aspectRatioRecipe);

	export function normalizeAspectRatio(value: ZAspectRatioValue): string {
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value <= 0)
				throw new TypeError('ZAspectRatio ratio must be positive.');
			return String(value);
		}
		const match = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/u.exec(value);
		const width = Number(match?.[1]);
		const height = Number(match?.[2]);
		if (
			!match ||
			!Number.isFinite(width) ||
			!Number.isFinite(height) ||
			width <= 0 ||
			height <= 0
		) {
			throw new TypeError('ZAspectRatio ratio must be a positive width / height pair.');
		}
		return `${width} / ${height}`;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables,
		type IcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		children,
		class: className,
		ratio = '16 / 9',
		ref = $bindable(null),
		style,
		...rest
	}: ZAspectRatioProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(aspectRatioRecipe));
	untrack(() => normalizeAspectRatio(ratio));
	const normalizedRatio = $derived(normalizeAspectRatio(ratio));
	const icssVariables = $derived({
		...readIcssCarrier(rest),
		'--zui-aspect-ratio': normalizedRatio
	} satisfies IcssVariables);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-ratio={normalizedRatio}
>
	{@render children?.()}
</div>
