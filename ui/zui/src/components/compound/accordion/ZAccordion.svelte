<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type {
		AccordionType as AccordionTypeValue,
		AccordionValue as AccordionPublicValue
	} from './context.svelte.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type AccordionType = AccordionTypeValue;
	export type AccordionValue = AccordionPublicValue;

	export interface ZAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly collapsible?: boolean;
		readonly defaultValue?: AccordionValue;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly onValueChange?: (value: AccordionValue | undefined) => void;
		ref?: HTMLDivElement | null;
		readonly type?: AccordionType;
		value?: AccordionValue;
	}

	const accordionRecipe = defineRecipe({
		base: (s) => s.display.block,
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, accordionRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'accordion',
		importStatement:
			"import { ZAccordion, ZAccordionItem, ZAccordionTrigger, ZAccordionContent } from '@zadmin/zui';",
		name: 'ZAccordion',
		bindings: [
			{
				description: '单选字符串或多选字符串数组。',
				name: 'value',
				type: 'string | readonly string[]'
			},
			{ description: '真实Accordion根元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZAccordionItem',
			'ZAccordionTrigger',
			'ZAccordionContent',
			'CollectionStore',
			'RovingFocus',
			'Presence'
		],
		events: [
			{
				description: '用户展开或折叠Item后调用一次。',
				name: 'onValueChange',
				type: '(value: string | readonly string[] | undefined) => void'
			}
		],
		keyboard: [
			{ description: '在Trigger间移动焦点。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到首尾Trigger。', key: 'Home / End' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '单选字符串或多选字符串数组。',
				name: 'value',
				type: 'string | readonly string[]'
			},
			{
				default: 'undefined',
				description: '非受控模式初始展开值。',
				name: 'defaultValue',
				type: 'string | readonly string[]'
			},
			{
				default: "'single'",
				description: '单项或多项展开模式。',
				name: 'type',
				type: "'single' | 'multiple'"
			},
			{
				default: 'true',
				description: 'single模式允许关闭最后一项。',
				name: 'collapsible',
				type: 'boolean'
			},
			{ default: 'true', description: '方向键在边界循环。', name: 'loop', type: 'boolean' },
			{ default: 'false', description: '禁用整个Accordion。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实Accordion根元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'Item组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/accordion/ZAccordion.svelte',
		states: [{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }],
		status: 'experimental',
		summary: '支持single/multiple、受控状态、roving focus与退出Presence的Accordion根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { hashString } from '../../../icss/hash.js';
	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { durationMilliseconds } from '../../../runtime/foundation/presence.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		provideZAccordion,
		type AccordionCollectionItem,
		type ZAccordionContext
	} from './context.svelte.js';

	let {
		children,
		class: className,
		collapsible = true,
		defaultValue,
		disabled = false,
		loop = true,
		onValueChange,
		ref = $bindable(null),
		style,
		type = 'single',
		value = $bindable(),
		...rest
	}: ZAccordionProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'accordion'));
	const rootClass = $derived(zui.recipe(accordionRecipe));
	const normalize = (source: AccordionValue | undefined): readonly string[] => {
		if (source === undefined) return [];
		const values = typeof source === 'string' ? [source] : [...source];
		return type === 'single'
			? values.slice(0, 1)
			: values.filter((entry, index) => values.indexOf(entry) === index);
	};
	const toPublicValue = (values: readonly string[]): AccordionValue | undefined =>
		type === 'single' ? values[0] : Object.freeze([...values]);
	const valueState = new ControllableState<AccordionValue | undefined>({
		defaultValue: () => toPublicValue(normalize(defaultValue)),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const collection = new CollectionStore<AccordionCollectionItem>();
	let focusKey = $state<string | undefined>();
	const roving = new RovingFocus({
		collection,
		loop: () => loop,
		orientation: () => 'vertical',
		read: () => focusKey,
		write: (key) => (focusKey = key)
	});
	const itemId = (itemValue: string, part: 'content' | 'trigger') =>
		`${idBase}-${hashString(itemValue)}-${part}`;
	const context: ZAccordionContext = {
		collection,
		get disabled() {
			return disabled;
		},
		get exitDuration() {
			return zui.motion === 'reduced' ? 0 : durationMilliseconds(zui.theme.duration.normal);
		},
		contentId(itemValue) {
			return itemId(itemValue, 'content');
		},
		focus(itemValue) {
			roving.set(itemValue);
		},
		handleKey(event) {
			if (!disabled) roving.handleKey(event);
		},
		isOpen(itemValue) {
			return normalize(valueState.current).includes(itemValue);
		},
		register(read) {
			return collection.register(read);
		},
		tabIndex(itemValue) {
			return disabled ? -1 : roving.tabIndex(itemValue);
		},
		toggle(itemValue) {
			const item = collection.get(itemValue);
			if (disabled || !item || item.disabled) return;
			const current = normalize(valueState.current);
			const open = current.includes(itemValue);
			if (type === 'single') {
				if (open && !collapsible) return;
				valueState.setFromUser(open ? undefined : itemValue);
			} else {
				valueState.setFromUser(
					Object.freeze(
						open ? current.filter((entry) => entry !== itemValue) : [...current, itemValue]
					)
				);
			}
		},
		triggerId(itemValue) {
			return itemId(itemValue, 'trigger');
		}
	};
	provideZAccordion(context);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</div>
