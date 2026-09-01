<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZHeadingLevel } from '../gene/ZHeading.svelte';
	import type { AlertTone } from './ZAlert.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZResultProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
		readonly actions?: Snippet;
		readonly children?: Snippet;
		readonly content?: Snippet;
		readonly contentAlign?: 'center' | 'start';
		readonly headingLevel?: ZHeadingLevel;
		readonly icon?: Snippet | null;
		ref?: HTMLElement | null;
		readonly title: string;
		readonly tone?: AlertTone;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'result',
		importStatement: "import { ZResult } from '@zadmin/zui';",
		name: 'ZResult',
		bindings: [{ description: '真实section引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ZHeading', '@lucide/svelte', 'SSR-stable labelled section'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '图标。', name: 'icon' },
			{ description: '标题。', name: 'title' },
			{ description: '说明。', name: 'content' },
			{ description: '操作。', name: 'actions' }
		],
		props: [
			{ default: '必填', description: '结果标题。', name: 'title', required: true, type: 'string' },
			{
				default: '2',
				description: '结果标题层级。',
				name: 'headingLevel',
				type: '1 | 2 | 3 | 4 | 5 | 6'
			},
			{
				default: "'center'",
				description: '复杂正文可选择逻辑起点对齐；不改变标题和操作区居中。',
				name: 'contentAlign',
				type: "'center' | 'start'"
			},
			{
				default: 'tone对应Lucide图标；null隐藏',
				description: '自定义装饰图标；无论默认或自定义都不会重复读屏。',
				name: 'icon',
				type: 'Snippet | null'
			},
			{ default: "'info'", description: '语义tone。', name: 'tone', type: 'AlertTone' }
		],
		since: 'unreleased',
		snippets: [
			{ description: '替换默认装饰图形；传null可隐藏。', name: 'icon', type: 'Snippet' },
			{ description: '结果详细正文；优先于兼容children。', name: 'content', type: 'Snippet' },
			{ description: '兼容的结果正文。', name: 'children', type: 'Snippet' },
			{ description: '后续操作。', name: 'actions', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/feedback/ZResult.svelte',
		states: [
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['info', 'success', 'warning', 'danger']
			}
		],
		status: 'experimental',
		summary:
			'以真实ZHeading、四种反馈tone、默认或自定义装饰图标、详细正文和后续操作组成的操作Result。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.boxSizing.borderBox;
			s.display.flex;
			s.flexDirection.column;
			s.gap._large;
			s.maxWidth.percent(100);
			s.padding._xlarge;
			s.textAlign.center;
			s.width.percent(100);
		},
		variants: {
			tone: {
				danger: (s) => s.color._danger,
				info: (s) => s.color._accent,
				success: (s) => s.color._success,
				warning: (s) => s.color._warning
			}
		},
		defaultVariants: { tone: 'info' }
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.lineHeight._normal;
			s.maxWidth.rem(48);
			s.overflowWrap.raw('anywhere');
			s.width.percent(100);
		},
		variants: {
			align: {
				center: (s) => s.textAlign.center,
				start: (s) => s.textAlign.start
			}
		},
		defaultVariants: { align: 'center' }
	});
	const iconRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, iconRecipe);
	registerRecipeHmr(import.meta, actionsRecipe);
</script>

<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZHeading from '../gene/ZHeading.svelte';

	function defaultIconForTone(tone: AlertTone): typeof Info {
		switch (tone) {
			case 'danger':
				return CircleAlert;
			case 'success':
				return CircleCheck;
			case 'warning':
				return TriangleAlert;
			case 'info':
				return Info;
		}
	}
	let {
		actions,
		children,
		class: className,
		content,
		contentAlign = 'center',
		headingLevel = 2,
		icon,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZResultProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'result-title'));
	const resolvedContent = $derived.by(() => {
		if (content && children)
			throw new TypeError('ZResult accepts either content or children, not both.');
		return content ?? children;
	});
	const DefaultIcon = $derived(defaultIconForTone(tone));
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const contentClass = $derived(zui.recipe(contentRecipe, { align: contentAlign }));
	const iconClass = $derived(zui.recipe(iconRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-labelledby={titleId}
	data-tone={tone}
>
	{#if icon !== null}<div class={iconClass} data-slot="icon" aria-hidden="true">
			{#if icon}{@render icon()}{:else}<DefaultIcon
					aria-hidden="true"
					size={56}
					strokeWidth={1.75}
				/>{/if}
		</div>{/if}
	<ZHeading id={titleId} data-slot="title" level={headingLevel} size="xlarge">
		{title}
	</ZHeading>
	{#if resolvedContent}<div class={contentClass} data-slot="content">
			{@render resolvedContent()}
		</div>{/if}{#if actions}<div class={actionsClass} data-slot="actions">
			{@render actions()}
		</div>{/if}
</section>
