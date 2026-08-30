<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { BadgeTone } from './ZBadge.svelte';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onRemove?: (event: MouseEvent) => void;
		readonly removeLabel?: string;
		ref?: HTMLSpanElement | null;
		readonly removable?: boolean;
		readonly tone?: BadgeTone;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'tag',
		importStatement: "import { ZTag } from '@zadmin/zui';",
		name: 'ZTag',
		bindings: [{ description: '真实span引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: ['ZBadge tone', 'internal action style'],
		events: [
			{
				description: '点击移除按钮；Tag状态所有权由调用方管理。',
				name: 'onRemove',
				type: '(event: MouseEvent) => void'
			}
		],
		keyboard: [{ description: '激活移除按钮。', key: 'Enter / Space' }],
		parts: [{ description: '移除按钮。', name: 'remove' }],
		props: [
			{ default: 'false', description: '显示移除按钮。', name: 'removable', type: 'boolean' },
			{
				default: "'Remove tag'",
				description: '移除按钮名称。',
				name: 'removeLabel',
				type: 'string'
			},
			{ default: "'default'", description: '语义tone。', name: 'tone', type: 'BadgeTone' }
		],
		since: '0.7.0',
		snippets: [{ description: 'Tag内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/data-display/ZTag.svelte',
		states: [{ description: '禁用移除。', name: 'data-disabled', values: ['true'] }],
		status: 'experimental',
		summary: '带可选、调用方持有状态的移除动作与语义文本的Tag。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.gap._small;
			s.paddingBlock._xsmall;
			s.paddingInline._medium;
		},
		variants: {
			tone: {
				accent: (s) => s.color._accent,
				danger: (s) => s.color._danger,
				default: (s) => s.color._text,
				success: (s) => s.color._success,
				warning: (s) => s.color._warning
			}
		},
		defaultVariants: { tone: 'default' }
	});
	const removeRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.color._textMuted;
			s.minHeight.px(0);
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, removeRecipe);
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		children,
		class: className,
		disabled = false,
		onRemove,
		ref = $bindable(null),
		removable = false,
		removeLabel = 'Remove tag',
		style,
		tone = 'default',
		...rest
	}: ZTagProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const removeClass = $derived(zui.recipe(removeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-disabled={disabled || undefined}
	>{@render children?.()}{#if removable}<button
			type="button"
			class={removeClass}
			aria-label={removeLabel}
			{disabled}
			onclick={(event) => onRemove?.(event)}><X aria-hidden="true" size={14} /></button
		>{/if}</span
>
