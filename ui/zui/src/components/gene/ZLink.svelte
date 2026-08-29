<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZLinkTone = 'danger' | 'muted' | 'primary';
	export type ZLinkUnderline = 'always' | 'hover' | 'none';

	export interface ZLinkProps extends Omit<HTMLAnchorAttributes, 'children' | 'href'> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly href?: string;
		readonly tone?: ZLinkTone;
		readonly underline?: ZLinkUnderline;
		ref?: HTMLAnchorElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '真实anchor元素引用。', name: 'ref', type: 'HTMLAnchorElement | null' }
		],
		category: 'gene',
		dependencies: [],
		events: [],
		id: 'link',
		importStatement: "import { ZLink } from '@zadmin/zui';",
		keyboard: [{ description: '有href且未禁用时跟随原生链接。', key: 'Enter' }],
		name: 'ZLink',
		parts: [],
		props: [
			{ default: '—', description: '链接目标；禁用时不会写入DOM。', name: 'href', type: 'string' },
			{
				default: 'false',
				description: '移除导航能力并声明aria-disabled。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'primary'",
				description: '用途明确的语义颜色。',
				name: 'tone',
				type: "'primary' | 'muted' | 'danger'"
			},
			{
				default: "'hover'",
				description: '下划线显示策略。',
				name: 'underline',
				type: "'always' | 'hover' | 'none'"
			},
			{ default: '—', description: '链接内容。', name: 'children', type: 'Snippet' },
			{
				bindable: true,
				default: 'null',
				description: '真实anchor元素引用。',
				name: 'ref',
				type: 'HTMLAnchorElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '链接内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZLink.svelte',
		states: [{ description: '链接不可导航。', name: 'data-disabled', values: ['true'] }],
		status: 'experimental',
		summary: '保持原生anchor导航与属性，提供正交tone、下划线和禁用合同。'
	} as const satisfies ZuiComponentMetadata;

	const linkRecipe = defineRecipe({
		base: (s) => {
			s.borderRadius._small;
			s.cursor.pointer;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			tone: {
				danger: (s) => s.color._danger,
				muted: (s) => s.color._textMuted,
				primary: (s) => s.color._primary
			},
			underline: {
				always: (s) => s.textDecoration.underline,
				hover: (s) => {
					s.textDecoration.none;
					s._hover((hover) => hover.textDecoration.underline);
				},
				none: (s) => s.textDecoration.none
			}
		},
		defaultVariants: { disabled: false, tone: 'primary', underline: 'hover' }
	});

	registerRecipeHmr(import.meta, linkRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { readIcssCarrier } from '../../runtime/compiler-bridge.js';
	import { useZui } from '../../runtime/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/root-style.js';

	let {
		children,
		class: className,
		disabled = false,
		href,
		onclick,
		ref = $bindable(null),
		rel,
		style,
		tabindex,
		target,
		tone = 'primary',
		underline = 'hover',
		...rest
	}: ZLinkProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(linkRecipe, { disabled, tone, underline }));
	const resolvedRel = $derived(rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleClick(event: MouseEvent & { currentTarget: HTMLAnchorElement }): void {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}
</script>

<!-- svelte-ignore no-navigation-without-resolve (library links preserve caller-owned native and external hrefs) -->
<a
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	aria-disabled={disabled ? 'true' : undefined}
	data-disabled={disabled ? 'true' : undefined}
	href={disabled ? undefined : href}
	onclick={handleClick}
	rel={resolvedRel}
	tabindex={disabled ? -1 : tabindex}
	{target}
>
	{@render children?.()}
</a>
