<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type AvatarShape = 'circle' | 'rounded' | 'square';
	export type AvatarSize = 'large' | 'medium' | 'small';
	export type AvatarImageEvent = Event & { currentTarget: HTMLImageElement };

	export interface ZAvatarProps extends Omit<
		HTMLAttributes<HTMLSpanElement>,
		'children' | 'draggable'
	> {
		readonly alt: string;
		readonly crossorigin?: '' | 'anonymous' | 'use-credentials';
		readonly decoding?: 'async' | 'auto' | 'sync';
		readonly draggable?: boolean;
		readonly fallback?: Snippet;
		readonly fallbackText?: string;
		imageRef?: HTMLImageElement | null;
		readonly loading?: 'eager' | 'lazy';
		readonly onImageError?: (event: AvatarImageEvent) => void;
		readonly onImageLoad?: (event: AvatarImageEvent) => void;
		readonly referrerpolicy?: ReferrerPolicy;
		readonly shape?: AvatarShape;
		readonly size?: AvatarSize;
		readonly sizes?: string;
		readonly src?: string;
		readonly srcset?: string;
		ref?: HTMLSpanElement | null;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'avatar',
		importStatement: "import { ZAvatar } from '@zadmin/zui';",
		name: 'ZAvatar',
		bindings: [
			{ description: '稳定span根引用。', name: 'ref', type: 'HTMLSpanElement | null' },
			{
				description: '当前真实img引用；无图片源时为null。',
				name: 'imageRef',
				type: 'HTMLImageElement | null'
			}
		],
		dependencies: ['native img', 'keyed image attempt', 'fallback state'],
		events: [
			{
				description: '当前图片尝试加载成功后调用。',
				name: 'onImageLoad',
				type: '(event: AvatarImageEvent) => void'
			},
			{
				description: '当前图片尝试失败并切换fallback后调用；旧图片事件会被忽略。',
				name: 'onImageError',
				type: '(event: AvatarImageEvent) => void'
			}
		],
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
			{ default: 'undefined', description: '原生图片URL。', name: 'src', type: 'string' },
			{ default: 'undefined', description: '原生响应式图片候选。', name: 'srcset', type: 'string' },
			{
				default: 'undefined',
				description: '原生响应式图片尺寸提示。',
				name: 'sizes',
				type: 'string'
			},
			{
				default: 'undefined（浏览器默认eager）',
				description: '原生图片加载策略。',
				name: 'loading',
				type: "'eager' | 'lazy'"
			},
			{
				default: 'undefined（浏览器默认auto）',
				description: '原生图片解码提示。',
				name: 'decoding',
				type: "'async' | 'auto' | 'sync'"
			},
			{
				default: 'undefined',
				description: '原生CORS凭据策略。',
				name: 'crossorigin',
				type: "'' | 'anonymous' | 'use-credentials'"
			},
			{
				default: 'undefined',
				description: '原生referrer policy。',
				name: 'referrerpolicy',
				type: 'ReferrerPolicy'
			},
			{
				default: 'undefined（浏览器默认）',
				description: '原生图片拖拽能力。',
				name: 'draggable',
				type: 'boolean'
			},
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
		states: [
			{ description: '图片加载失败或缺失。', name: 'data-fallback', values: ['true'] },
			{ description: '当前视觉来源。', name: 'data-state', values: ['image', 'fallback'] }
		],
		status: 'stable',
		summary: '原生响应式img属性、图片引用和事件、竞态隔离、稳定尺寸与可访问fallback组成的Avatar。'
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
		crossorigin,
		decoding,
		draggable,
		fallback,
		fallbackText,
		imageRef = $bindable(null),
		loading,
		onImageError,
		onImageLoad,
		ref = $bindable(null),
		referrerpolicy,
		shape = 'circle',
		size = 'medium',
		sizes,
		src,
		srcset,
		style,
		...rest
	}: ZAvatarProps = $props();
	const zui = useZui();
	let failedImage = $state<HTMLImageElement | null>(null);
	const hasImageSource = $derived(Boolean(src || srcset));
	const showFallback = $derived(
		!hasImageSource || (failedImage !== null && failedImage === imageRef)
	);
	const imageIdentity = $derived(
		JSON.stringify([
			src ?? null,
			srcset ?? null,
			sizes ?? null,
			crossorigin ?? null,
			referrerpolicy ?? null
		])
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { shape, size }));
	const imageClass = $derived(zui.recipe(imageRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		imageIdentity;
		failedImage = null;
	});

	function currentImageEvent(event: Event): AvatarImageEvent | null {
		if (imageRef === null || event.currentTarget !== imageRef) return null;
		return event as AvatarImageEvent;
	}

	function handleImageLoad(event: Event): void {
		const imageEvent = currentImageEvent(event);
		if (imageEvent === null) return;
		failedImage = null;
		onImageLoad?.(imageEvent);
	}

	function handleImageError(event: Event): void {
		const imageEvent = currentImageEvent(event);
		if (imageEvent === null) return;
		failedImage = imageEvent.currentTarget;
		onImageError?.(imageEvent);
	}
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-fallback={showFallback || undefined}
	data-state={showFallback ? 'fallback' : 'image'}
>
	<span
		data-slot="fallback"
		role={alt ? 'img' : undefined}
		aria-label={alt || undefined}
		aria-hidden={!alt || undefined}
		hidden={!showFallback}
	>
		{#if fallback}{@render fallback()}{:else}{fallbackText ?? Array.from(alt)[0] ?? '?'}{/if}
	</span>
	{#if hasImageSource}
		{#key imageIdentity}<img
				bind:this={imageRef}
				data-slot="image"
				class={imageClass}
				{src}
				{srcset}
				{sizes}
				{alt}
				{loading}
				{decoding}
				{crossorigin}
				{referrerpolicy}
				{draggable}
				hidden={showFallback}
				onload={handleImageLoad}
				onerror={handleImageError}
			/>{/key}
	{/if}
</span>
