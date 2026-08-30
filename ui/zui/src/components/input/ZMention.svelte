<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import type { ZTextareaProps } from './ZTextarea.svelte';

	export interface MentionItem {
		readonly description?: string;
		readonly disabled?: boolean;
		readonly key: SelectionKey;
		readonly keywords?: readonly string[];
		readonly label: string;
		readonly value?: string;
	}

	export interface ZMentionProps extends Omit<ZTextareaProps, 'onValueChange' | 'value'> {
		readonly appendSpace?: boolean;
		readonly defaultValue?: string;
		readonly emptyText?: string;
		readonly filter?: (item: MentionItem, query: string) => boolean;
		readonly items: readonly MentionItem[];
		readonly listLabel?: string;
		readonly maxSuggestions?: number;
		readonly minQueryLength?: number;
		readonly onMention?: (item: MentionItem, trigger: string) => void;
		readonly onSearchChange?: (query: string, trigger: string) => void;
		readonly onValueChange?: (value: string) => void;
		readonly placement?: PopoverPlacement;
		ref?: HTMLTextAreaElement | null;
		readonly triggers?: readonly string[];
		value?: string;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'mention',
		importStatement: "import { ZMention } from '@zadmin/zui';",
		name: 'ZMention',
		bindings: [
			{ description: 'textarea完整文本。', name: 'value', type: 'string' },
			{ description: '真实textarea引用。', name: 'ref', type: 'HTMLTextAreaElement | null' }
		],
		dependencies: ['native textarea', 'trigger parser', 'active descendant', 'ZPopover'],
		events: [
			{ description: '文本变化。', name: 'onValueChange', type: '(value: string) => void' },
			{
				description: '搜索片段变化。',
				name: 'onSearchChange',
				type: '(query: string, trigger: string) => void'
			},
			{
				description: '提交mention后返回项目和触发符。',
				name: 'onMention',
				type: '(item: MentionItem, trigger: string) => void'
			}
		],
		keyboard: [
			{
				description: '移动active suggestion，焦点保持在textarea。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '提交active suggestion。', key: 'Enter / Tab' },
			{ description: '关闭suggestions且不修改文本。', key: 'Escape' }
		],
		parts: [
			{ description: '原生textarea trigger。', name: 'editor' },
			{ description: '建议listbox。', name: 'list' },
			{ description: 'mention option。', name: 'item' }
		],
		props: [
			{
				default: '必填',
				description: '稳定key、标签、插入值和过滤关键词。',
				name: 'items',
				required: true,
				type: 'readonly MentionItem[]'
			},
			{ bindable: true, default: "''", description: '完整文本。', name: 'value', type: 'string' },
			{ default: "''", description: '非受控初始文本。', name: 'defaultValue', type: 'string' },
			{
				default: "['@']",
				description: '非空触发符。',
				name: 'triggers',
				type: 'readonly string[]'
			},
			{
				default: '0',
				description: '打开建议所需的最小查询长度。',
				name: 'minQueryLength',
				type: 'number'
			},
			{ default: '8', description: '最多显示建议数。', name: 'maxSuggestions', type: 'number' },
			{ default: 'true', description: '插入后追加空格。', name: 'appendSpace', type: 'boolean' }
		],
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZMention.svelte',
		states: [{ description: '建议浮层状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '保持textarea焦点、解析光标前trigger并以active-descendant提交建议的Mention。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { findMentionQuery, insertMention, type MentionQuery } from '../../runtime/mention.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZMentionEditor from './ZMentionEditor.svelte';

	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.maxHeight.rem(16);
			s.minWidth._menu;
			s.overflow.auto;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.borderRadius._small;
			s.cursor.pointer;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
		},
		variants: {
			active: { false: () => undefined, true: (s) => s.backgroundColor._surface },
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			}
		},
		defaultVariants: { active: false, disabled: false }
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const emptyRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [listRecipe, itemRecipe, descriptionRecipe, emptyRecipe]) {
		registerRecipeHmr(import.meta, recipe);
	}

	let {
		appendSpace = true,
		class: className,
		defaultValue = '',
		disabled = false,
		emptyText = 'No suggestions',
		filter,
		items,
		listLabel = 'Mention suggestions',
		maxSuggestions = 8,
		minQueryLength = 0,
		onMention,
		onSearchChange,
		onValueChange,
		placement = 'bottom-start',
		readonly = false,
		ref = $bindable(null),
		style,
		triggers = ['@'],
		value = $bindable(),
		...rest
	}: ZMentionProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'mention'));
	let query = $state<MentionQuery>();
	let active = $state<SelectionKey>();
	let open = $state(false);
	const valueState = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const normalizedTriggers = $derived.by(() => {
		const result = [...new SvelteSet(triggers)];
		if (result.length === 0 || result.some((trigger) => trigger.length === 0)) {
			throw new TypeError('ZMention triggers must contain at least one non-empty value.');
		}
		return Object.freeze(result.sort((left, right) => right.length - left.length));
	});
	const normalizedItems = $derived.by(() => {
		const keys = new SvelteSet<SelectionKey>();
		for (const item of items) {
			if (keys.has(item.key)) throw new Error(`Duplicate ZMention key "${String(item.key)}".`);
			keys.add(item.key);
		}
		return items;
	});
	const resolvedLimits = $derived.by(() => {
		if (!Number.isInteger(minQueryLength) || minQueryLength < 0) {
			throw new TypeError('ZMention minQueryLength must be a non-negative integer.');
		}
		if (!Number.isInteger(maxSuggestions) || maxSuggestions < 1) {
			throw new TypeError('ZMention maxSuggestions must be a positive integer.');
		}
		return { maxSuggestions, minQueryLength };
	});
	const suggestions = $derived.by(() => {
		if (!query || query.query.length < resolvedLimits.minQueryLength) return [];
		const needle = query.query.toLocaleLowerCase(zui.locale);
		return normalizedItems
			.filter((item) => {
				if (filter) return filter(item, query!.query);
				return [item.label, item.value ?? '', ...(item.keywords ?? [])]
					.join(' ')
					.toLocaleLowerCase(zui.locale)
					.includes(needle);
			})
			.slice(0, resolvedLimits.maxSuggestions);
	});
	const enabledSuggestions = $derived(suggestions.filter((item) => !disabled && !item.disabled));
	const activeKey = $derived(
		enabledSuggestions.some(({ key }) => Object.is(key, active))
			? active
			: enabledSuggestions[0]?.key
	);
	const activeId = $derived(
		activeKey === undefined ? undefined : `${idBase}-option-${String(activeKey)}`
	);
	const listClass = $derived(zui.recipe(listRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	$effect(() => {
		if (!open || !query || query.query.length < resolvedLimits.minQueryLength) open = false;
	});
	function updateQuery(text: string, caret: number): void {
		query = findMentionQuery(text, caret, normalizedTriggers);
		active = undefined;
		if (query) onSearchChange?.(query.query, query.trigger);
		open = Boolean(
			query && query.query.length >= resolvedLimits.minQueryLength && !disabled && !readonly
		);
	}
	function handleInput(event: InputEvent & { currentTarget: HTMLTextAreaElement }): void {
		valueState.setFromUser(event.currentTarget.value);
		if (!event.isComposing)
			updateQuery(event.currentTarget.value, event.currentTarget.selectionStart);
	}
	function choose(item: MentionItem): void {
		if (!query || disabled || readonly || item.disabled) return;
		const result = insertMention(valueState.current, query, item.value ?? item.label, appendSpace);
		const trigger = query.trigger;
		valueState.setFromUser(result.value);
		query = undefined;
		open = false;
		active = undefined;
		onMention?.(item, trigger);
		queueMicrotask(() => {
			ref?.focus({ preventScroll: true });
			ref?.setSelectionRange(result.caret, result.caret);
		});
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }): void {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			open = false;
			return;
		}
		if ((event.key === 'Enter' || event.key === 'Tab') && activeKey !== undefined) {
			event.preventDefault();
			const item = enabledSuggestions.find(({ key }) => Object.is(key, activeKey));
			if (item) choose(item);
			return;
		}
		const current = enabledSuggestions.findIndex(({ key }) => Object.is(key, activeKey));
		const targetIndex =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? enabledSuggestions.length - 1
					: event.key === 'ArrowDown'
						? (current + 1) % enabledSuggestions.length
						: event.key === 'ArrowUp'
							? (current - 1 + enabledSuggestions.length) % enabledSuggestions.length
							: -1;
		if (targetIndex >= 0 && enabledSuggestions[targetIndex]) {
			event.preventDefault();
			active = enabledSuggestions[targetIndex]?.key;
		}
	}
	function reset(): void {
		valueState.reset();
		query = undefined;
		active = undefined;
		open = false;
	}
</script>

<ZPopover
	gutter={4}
	matchWidth
	modal={false}
	onOpenChange={(next) => (open = next)}
	{open}
	{placement}
>
	<ZMentionEditor
		{...rest}
		bind:ref
		class={className}
		{defaultValue}
		{style}
		value={valueState.current}
		{activeId}
		onEditorInput={handleInput}
		onEditorKeydown={handleKeydown}
		onEditorReset={reset}
		{disabled}
		{readonly}
	/>
	<ZPopoverContent aria-label={listLabel} ariaLabelledBy={null} manageFocus={false} role="listbox">
		<div class={listClass} data-slot="list">
			{#each suggestions as item (item.key)}
				<div
					id={`${idBase}-option-${String(item.key)}`}
					class={zui.recipe(itemRecipe, {
						active: Object.is(activeKey, item.key),
						disabled: Boolean(disabled || item.disabled)
					})}
					data-slot="item"
					role="option"
					tabindex={-1}
					aria-selected={Object.is(activeKey, item.key)}
					aria-disabled={disabled || item.disabled || undefined}
					onpointerdown={(event) => event.preventDefault()}
					onclick={() => choose(item)}
					onkeydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							choose(item);
						}
					}}
				>
					<div>{item.label}</div>
					{#if item.description}<div class={descriptionClass}>{item.description}</div>{/if}
				</div>
			{/each}
			{#if suggestions.length === 0}<div class={emptyClass}>{emptyText}</div>{/if}
		</div>
	</ZPopoverContent>
</ZPopover>
