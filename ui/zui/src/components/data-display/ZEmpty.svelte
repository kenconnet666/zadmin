<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZHeadingLevel } from '../gene/ZHeading.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZEmptyProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
		readonly actions?: Snippet;
		readonly children?: Snippet;
		readonly description?: Snippet;
		readonly headingLevel?: ZHeadingLevel;
		readonly icon?: Snippet | null;
		ref?: HTMLElement | null;
		readonly title: string;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'empty',
		importStatement: "import { ZEmpty } from '@zadmin/zui';",
		name: 'ZEmpty',
		bindings: [{ description: '真实section引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ZHeading', '@lucide/svelte', 'SSR-stable labelled section'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '装饰图形。', name: 'icon' },
			{ description: '标题。', name: 'title' },
			{ description: '空状态说明。', name: 'description' },
			{ description: '操作。', name: 'actions' }
		],
		props: [
			{
				default: '必填',
				description: '空状态标题。',
				name: 'title',
				required: true,
				type: 'string'
			},
			{
				default: '2',
				description: '真实空状态标题层级。',
				name: 'headingLevel',
				type: '1 | 2 | 3 | 4 | 5 | 6'
			},
			{
				default: 'Inbox Lucide图标；null隐藏',
				description: '自定义装饰图标；不会参与可访问名称。',
				name: 'icon',
				type: 'Snippet | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '替换默认装饰图形；传null可隐藏。', name: 'icon', type: 'Snippet' },
			{
				description: '空集合原因或恢复提示；优先于兼容children。',
				name: 'description',
				type: 'Snippet'
			},
			{ description: '兼容的空状态说明。', name: 'children', type: 'Snippet' },
			{ description: '恢复操作。', name: 'actions', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZEmpty.svelte',
		states: [],
		status: 'experimental',
		summary: '以真实ZHeading、中性默认或自定义装饰图标、原因说明和恢复操作组成的集合Empty。'
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
		variants: {},
		defaultVariants: {}
	});
	const iconRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.color._textMuted;
			s.display.flex;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.lineHeight._normal;
			s.maxWidth.rem(40);
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const actionRecipe = defineRecipe({
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
	registerRecipeHmr(import.meta, iconRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, actionRecipe);
</script>

<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
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
	let {
		actions,
		children,
		class: className,
		description,
		headingLevel = 2,
		icon,
		ref = $bindable(null),
		style,
		title,
		...rest
	}: ZEmptyProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'empty-title'));
	const resolvedDescription = $derived.by(() => {
		if (description && children)
			throw new TypeError('ZEmpty accepts either description or children, not both.');
		return description ?? children;
	});
	const rootClass = $derived(zui.recipe(recipe));
	const iconClass = $derived(zui.recipe(iconRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
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
>
	{#if icon !== null}<div class={iconClass} data-slot="icon" aria-hidden="true">
			{#if icon}{@render icon()}{:else}<Inbox
					aria-hidden="true"
					size={40}
					strokeWidth={1.75}
				/>{/if}
		</div>{/if}
	<ZHeading id={titleId} data-slot="title" level={headingLevel} size="large" weight="semibold">
		{title}
	</ZHeading>
	{#if resolvedDescription}<div class={contentClass} data-slot="description">
			{@render resolvedDescription()}
		</div>{/if}{#if actions}<div class={actionClass} data-slot="actions">
			{@render actions()}
		</div>{/if}
</section>
