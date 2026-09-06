<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { indicatorSizeStyles } from '../gene/indicator-size.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import {
		controlSizes,
		controlSizeStyles,
		resolveControlSize,
		type ZControlSize
	} from '../../runtime/foundation/control-size.js';
	import { semanticTones, type ZSemanticTone } from '../../theme/semantics.js';

	export type TagSize = ZControlSize;
	export type TagTone = ZSemanticTone;

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
				default: 'componentDefaults.tag.size或Provider density',
				description: '五档控件尺寸；显式值优先于Provider组件默认和density，移除按钮保持同一高度。',
				name: 'size',
				type: 'TagSize'
			},
			{
				default: 'undefined',
				description: '供typed locale生成上下文移除名称的可读文本；不控制视觉children。',
				name: 'textValue',
				type: 'string'
			},
			{
				default: "componentDefaults.tag.tone或'neutral'",
				description: '有限语义tone；显式值优先于Provider组件默认。',
				name: 'tone',
				type: 'TagTone'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Tag内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/data-display/ZTag.svelte',
		states: [
			{ description: '禁用移除。', name: 'data-disabled', values: ['true'] },
			{ description: '是否包含移除动作。', name: 'data-removable', values: ['true'] },
			{
				description: '解析后的尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['neutral', 'info', 'success', 'warning', 'danger']
			}
		],
		status: 'stable',
		summary:
			'以有限size、语义tone表面、长内容安全换行和typed locale移除动作表达静态分类；独立Tag与复合集合拥有明确Tab、焦点和冒泡边界。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.fontFamily._sans;
			s.lineHeight._normal;
			s.alignItems.center;
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.maxWidth.percent(100);
			s.minWidth.px(0);
			s.overflowWrap.anywhere;
		},
		variants: {
			size: {
				xsmall: (s) => {
					controlSizeStyles.xsmall(s);
					s.paddingBlock.px(0);
					s.gap._xsmall;
				},
				small: (s) => {
					controlSizeStyles.small(s);
					s.paddingBlock.px(0);
					s.gap._small;
				},
				medium: (s) => {
					controlSizeStyles.medium(s);
					s.paddingBlock.px(0);
					s.gap._small;
				},
				large: (s) => {
					controlSizeStyles.large(s);
					s.paddingBlock.px(0);
					s.gap._small;
				},
				xlarge: (s) => {
					controlSizeStyles.xlarge(s);
					s.paddingBlock.px(0);
					s.gap._small;
				}
			},
			tone: {
				neutral: (s) => {
					s.backgroundColor._neutralSubtle;
					s.borderColor._neutral;
					s.color._text;
				},
				info: (s) => {
					s.backgroundColor._infoSubtle;
					s.borderColor._info;
					s.color._info;
				},
				success: (s) => {
					s.backgroundColor._successSubtle;
					s.borderColor._success;
					s.color._success;
				},
				warning: (s) => {
					s.backgroundColor._warningSubtle;
					s.borderColor._warning;
					s.color._warning;
				},
				danger: (s) => {
					s.backgroundColor._dangerSubtle;
					s.borderColor._danger;
					s.color._danger;
				}
			}
		},
		defaultVariants: { size: 'medium', tone: 'neutral' }
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.minWidth.px(0);
			s.overflowWrap.anywhere;
		},
		variants: {},
		defaultVariants: {}
	});
	const removeRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.color._textMuted;
			s.alignSelf.stretch;
			s.minHeight.px(0);
			s.minWidth._xsmall;
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const removeIconRecipe = defineRecipe({ variants: { size: indicatorSizeStyles } });
	registerRecipeHmr(import.meta, removeIconRecipe);
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
		const next = resolveControlSize(size ?? componentDefaults?.size, zui.density);
		if (!controlSizes.includes(next)) {
			throw new TypeError('ZTag size must be xsmall, small, medium, large or xlarge.');
		}
		return next;
	});
	const resolvedTone = $derived.by(() => {
		const next = tone ?? componentDefaults?.tone ?? 'neutral';
		if (!semanticTones.includes(next)) {
			throw new TypeError('ZTag tone must be neutral, info, success, warning or danger.');
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
	const removeIconClass = $derived(zui.recipe(removeIconRecipe, { size: resolvedSize }));
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
	><span class={contentClass} data-slot="content">{@render children?.()}</span>
	{#if resolvedRemovable}<button
			type="button"
			class={removeClass}
			aria-label={resolvedRemoveLabel}
			data-slot="remove"
			use:captureClick={handleRemove}
			disabled={resolvedDisabled}
			tabindex={resolvedRemoveTabIndex}><X aria-hidden="true" class={removeIconClass} /></button
		>{/if}</span
>
