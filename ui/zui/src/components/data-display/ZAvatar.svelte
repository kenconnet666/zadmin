<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type AvatarShape = 'circle' | 'rounded' | 'square';
	export type AvatarSize = 'large' | 'medium' | 'small';
	export interface ZAvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly alt: string;
		readonly fallback?: Snippet;
		readonly fallbackText?: string;
		readonly shape?: AvatarShape;
		readonly size?: AvatarSize;
		readonly src?: string;
		ref?: HTMLSpanElement | null;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'avatar',
		importStatement: "import { ZAvatar } from '@zadmin/zui';",
		name: 'ZAvatar',
		bindings: [{ description: '稳定span根引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: ['native img', 'fallback state'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '图片。', name: 'image' },
			{ description: '加载失败fallback。', name: 'fallback' }
		],
		props: [
			{
				default: '必填',
				description: '图片和fallback可访问名称。',
				name: 'alt',
				required: true,
				type: 'string'
			},
			{ default: 'undefined', description: '图片URL。', name: 'src', type: 'string' },
			{ default: 'alt首字符', description: '文本fallback。', name: 'fallbackText', type: 'string' },
			{
				default: "'medium'",
				description: '视觉尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: "'circle'",
				description: '形状。',
				name: 'shape',
				type: "'circle' | 'rounded' | 'square'"
			}
		],
		since: 'unreleased',
		snippets: [{ description: '自定义fallback。', name: 'fallback', type: 'Snippet' }],
		source: 'ui/zui/src/components/data-display/ZAvatar.svelte',
		states: [{ description: '图片加载失败或缺失。', name: 'data-fallback', values: ['true'] }],
		status: 'experimental',
		summary: '原生img、稳定尺寸与可访问文本fallback的Avatar。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.color._text;
			s.display.inlineFlex;
			s.fontWeight._semibold;
			s.justifyContent.center;
			s.overflow.hidden;
		},
		variants: {
			shape: {
				circle: (s) => s.borderRadius.percent(50),
				rounded: (s) => s.borderRadius._medium,
				square: (s) => s.borderRadius._none
			},
			size: {
				large: (s) => {
					s.fontSize._large;
					s.height._large;
					s.width._large;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.height._medium;
					s.width._medium;
				},
				small: (s) => {
					s.fontSize._small;
					s.height._small;
					s.width._small;
				}
			}
		},
		defaultVariants: { shape: 'circle', size: 'medium' }
	});
	const imageRecipe = defineRecipe({
		base: (s) => {
			s.height.percent(100);
			s.objectFit.cover;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, imageRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		alt,
		class: className,
		fallback,
		fallbackText,
		ref = $bindable(null),
		shape = 'circle',
		size = 'medium',
		src,
		style,
		...rest
	}: ZAvatarProps = $props();
	const zui = useZui();
	let failed = $state(false);
	const showFallback = $derived(!src || failed);
	const rootClass = $derived(zui.recipe(rootRecipe, { shape, size }));
	const imageClass = $derived(zui.recipe(imageRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		src;
		failed = false;
	});
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-fallback={showFallback || undefined}
>
	{#if showFallback}<span data-slot="fallback" role="img" aria-label={alt}
			>{#if fallback}{@render fallback()}{:else}{fallbackText ??
					Array.from(alt)[0] ??
					'?'}{/if}</span
		>{:else}<img
			data-slot="image"
			class={imageClass}
			{src}
			{alt}
			onerror={() => (failed = true)}
		/>{/if}
</span>
