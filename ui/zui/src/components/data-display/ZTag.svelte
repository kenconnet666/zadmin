<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type TagSize = 'medium' | 'small';
	export type TagTone = 'accent' | 'danger' | 'default' | 'success' | 'warning';
	export interface ZTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onRemove?: (event: MouseEvent) => void;
		readonly removeLabel?: string;
		readonly removeTabIndex?: -1 | 0;
		ref?: HTMLSpanElement | null;
		readonly removable?: boolean;
		readonly size?: TagSize;
		readonly textValue?: string;
		readonly tone?: TagTone;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'tag',
		importStatement: "import { ZTag } from '@zadmin/zui';",
		name: 'ZTag',
		bindings: [{ description: '真实span引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: ['semantic Theme tones', 'internal action style', 'typed Tag locale'],
		events: [
			{
				description: '点击移除按钮；Tag状态所有权由调用方管理。',
				name: 'onRemove',
				type: '(event: MouseEvent) => void'
			}
		],
		keyboard: [{ description: '激活移除按钮。', key: 'Enter / Space' }],
		parts: [
			{ description: '安全换行的Tag正文。', name: 'content' },
			{ description: '移除按钮。', name: 'remove' }
		],
		props: [
			{ default: 'false', description: '显示移除按钮。', name: 'removable', type: 'boolean' },
			{
				default: 'false',
				description: '仅禁用可选remove按钮；静态Tag本身没有disabled交互状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'localePack.tag.removeTag(textValue)',
				description: '移除按钮名称；显式值优先于typed locale。',
				name: 'removeLabel',
				type: 'string'
			},
			{
				default: '0',
				description: '仅允许0或-1；独立Tag为0，TagsInput等复合owner可设-1。',
				name: 'removeTabIndex',
				type: '-1 | 0'
			},
			{
				default: 'Provider density',
				description: '有限small/medium尺寸；显式值优先，compact density解析为small。',
				name: 'size',
				type: "'small' | 'medium'"
			},
			{
				default: 'undefined',
				description: '供typed locale生成上下文移除名称的可读文本；不控制视觉children。',
				name: 'textValue',
				type: 'string'
			},
			{ default: "'default'", description: '语义tone。', name: 'tone', type: 'TagTone' }
		],
		since: 'unreleased',
		snippets: [{ description: 'Tag内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/data-display/ZTag.svelte',
		states: [
			{ description: '禁用移除。', name: 'data-disabled', values: ['true'] },
			{ description: '是否包含移除动作。', name: 'data-removable', values: ['true'] },
			{ description: '解析后的尺寸。', name: 'data-size', values: ['small', 'medium'] },
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['default', 'accent', 'success', 'warning', 'danger']
			}
		],
		status: 'stable',
		summary:
			'以有限size、语义tone表面、长内容安全换行和typed locale移除动作表达静态分类；独立Tag与复合集合拥有明确Tab、焦点和冒泡边界。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.maxWidth.percent(100);
			s.minWidth.px(0);
			s.overflowWrap.raw('anywhere');
		},
		variants: {
			size: {
				medium: (s) => {
					s.gap._small;
					s.paddingBlock._xsmall;
					s.paddingInline._medium;
				},
				small: (s) => {
					s.fontSize._small;
					s.gap._xsmall;
					s.paddingBlock._xsmall;
					s.paddingInline._small;
				}
			},
			tone: {
				accent: (s) => {
					s.backgroundColor.raw('color-mix(in srgb, currentColor 10%, transparent)');
					s.borderColor._accent;
					s.color._accent;
				},
				danger: (s) => {
					s.backgroundColor.raw('color-mix(in srgb, currentColor 10%, transparent)');
					s.borderColor._danger;
					s.color._danger;
				},
				default: (s) => s.color._text,
				success: (s) => {
					s.backgroundColor.raw('color-mix(in srgb, currentColor 10%, transparent)');
					s.borderColor._success;
					s.color._success;
				},
				warning: (s) => {
					s.backgroundColor.raw('color-mix(in srgb, currentColor 10%, transparent)');
					s.borderColor._warning;
					s.color._warning;
				}
			}
		},
		defaultVariants: { size: 'medium', tone: 'default' }
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.minWidth.px(0);
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const removeRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.color._textMuted;
			s.minHeight._small;
			s.minWidth._small;
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, removeRecipe);
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { captureClick } from '../../runtime/foundation/capture-click.js';
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
		dir,
		disabled = false,
		onRemove,
		ref = $bindable(null),
		removable = false,
		removeLabel,
		removeTabIndex = 0,
		size,
		style,
		textValue,
		tone,
		...rest
	}: ZTagProps = $props();
	const zui = useZui();
	const componentDefaults = $derived(zui.componentDefaults.tag);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedDisabled = $derived.by(() => {
		if (typeof disabled !== 'boolean') throw new TypeError('ZTag disabled must be boolean.');
		return disabled;
	});
	const resolvedRemovable = $derived.by(() => {
		if (typeof removable !== 'boolean') throw new TypeError('ZTag removable must be boolean.');
		return removable;
	});
	const resolvedSize = $derived.by(() => {
		const next =
			size ?? componentDefaults?.size ?? (zui.density === 'compact' ? 'small' : 'medium');
		if (!['medium', 'small'].includes(next)) {
			throw new TypeError('ZTag size must be small or medium.');
		}
		return next;
	});
	const resolvedTone = $derived.by(() => {
		const next = tone ?? componentDefaults?.tone ?? 'default';
		if (!['accent', 'danger', 'default', 'success', 'warning'].includes(next)) {
			throw new TypeError('ZTag tone must be default, accent, success, warning or danger.');
		}
		return next;
	});
	const resolvedRemoveTabIndex = $derived.by(() => {
		if (removeTabIndex !== 0 && removeTabIndex !== -1) {
			throw new TypeError('ZTag removeTabIndex must be 0 or -1.');
		}
		return removeTabIndex;
	});
	const resolvedTextValue = $derived(textValue?.trim() || undefined);
	const resolvedRemoveLabel = $derived.by(() => {
		const next = removeLabel ?? zui.localePack.tag.removeTag(resolvedTextValue);
		if (resolvedRemovable && next.trim().length === 0) {
			throw new TypeError('ZTag removeLabel must be non-empty when removable.');
		}
		return next;
	});
	const rootClass = $derived(zui.recipe(recipe, { size: resolvedSize, tone: resolvedTone }));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const removeClass = $derived(zui.recipe(removeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function handleRemove(event: MouseEvent): void {
		event.stopPropagation();
		onRemove?.(event);
	}
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	dir={resolvedDirection}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-disabled={resolvedDisabled || undefined}
	data-removable={resolvedRemovable || undefined}
	data-size={resolvedSize}
	data-tone={resolvedTone}
	><span class={contentClass} data-slot="content">{@render children?.()}</span
	>{#if resolvedRemovable}<button
			type="button"
			class={removeClass}
			aria-label={resolvedRemoveLabel}
			data-slot="remove"
			use:captureClick={handleRemove}
			disabled={resolvedDisabled}
			tabindex={resolvedRemoveTabIndex}
			><X aria-hidden="true" size={resolvedSize === 'small' ? 12 : 14} /></button
		>{/if}</span
>
