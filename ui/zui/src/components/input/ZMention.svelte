<script module lang="ts">
	import type { Snippet } from 'svelte';
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

	export interface ZMentionProps extends Omit<
		ZTextareaProps,
		'onValueChange' | 'resetOnForm' | 'value'
	> {
		readonly appendSpace?: boolean;
		readonly defaultValue?: string;
		readonly emptyText?: string;
		readonly filter?: (item: MentionItem, query: string) => boolean;
		readonly items: readonly MentionItem[];
		readonly item?: Snippet<[MentionItem]>;
		readonly listLabel?: string;
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly loop?: boolean;
		readonly maxSuggestions?: number;
		readonly minQueryLength?: number;
		readonly onMention?: (item: MentionItem, trigger: string) => void;
		readonly onSearchChange?: (query: string, trigger: string) => void;
		readonly onValueChange?: (value: string) => void;
		readonly placement?: PopoverPlacement;
		ref?: HTMLTextAreaElement | null;
		readonly triggers?: readonly string[];
		value?: string;
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
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
		dependencies: [
			'native textarea',
			'trigger parser',
			'LogicalCollection',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZVirtualList',
			'ZPopover'
		],
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
			{ default: 'true', description: '插入后追加空格。', name: 'appendSpace', type: 'boolean' },
			{
				default: 'true',
				description: '方向键是否在enabled建议边界循环。',
				name: 'loop',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保留当前建议并投射aria-busy。',
				name: 'loading',
				type: 'boolean'
			},
			{ default: 'false', description: '启用固定行建议窗口化。', name: 'virtual', type: 'boolean' },
			{
				default: '256',
				description: '虚拟建议viewport高度px。',
				name: 'virtualHeight',
				type: 'number'
			},
			{
				default: '52',
				description: '虚拟建议固定行高px。',
				name: 'virtualItemSize',
				type: 'number'
			},
			{
				default: '4',
				description: '建议窗口前后额外挂载项数。',
				name: 'virtualOverscan',
				type: 'number'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '自定义建议可见正文；option角色、ID、active和键盘仍由Mention拥有。',
				name: 'item',
				type: 'Snippet<[MentionItem]>'
			}
		],
		source: 'ui/zui/src/components/input/ZMention.svelte',
		states: [
			{ description: '建议浮层状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '异步建议加载中。', name: 'data-loading', values: ['true'] }
		],
		status: 'experimental',
		summary: '保持textarea焦点、解析光标前trigger并以active-descendant提交建议的Mention。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { isDomElement } from '../../runtime/layer/dom-realm.js';
	import { findMentionQuery, insertMention, type MentionQuery } from '../../runtime/mention.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import {
		createChoiceVirtualMountBridge,
		type ChoiceVirtualController
	} from '../compound/choice-virtualization.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZVirtualList from '../data-display/ZVirtualList.svelte';
	import ZMentionEditor from './ZMentionEditor.svelte';

	const listRecipe = defineRecipe({
		base: (s) => {
			s.minWidth._menu;
		},
		variants: {
			virtual: {
				false: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.gap._xsmall;
					s.maxHeight.rem(16);
					s.overflow.auto;
				},
				true: () => undefined
			}
		},
		defaultVariants: { virtual: false }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.borderRadius._small;
			s.cursor.pointer;
			s.height.percent(100);
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
		emptyText,
		filter,
		item: itemSnippet,
		items,
		listLabel,
		loading = false,
		loadingText,
		loop = true,
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
		virtual = false,
		virtualHeight = 256,
		virtualItemSize = 52,
		virtualOverscan = 4,
		...rest
	}: ZMentionProps = $props();
	const zui = useZui();
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.mentionEmpty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedListLabel = $derived(listLabel ?? zui.localePack.collection.mentionList);
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'mention'));
	const listId = $derived(`${idBase}-list`);
	let query = $state<MentionQuery>();
	let open = $state(false);
	let virtualController = $state<ChoiceVirtualController<SelectionKey> | null>(null);
	const valueState = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const normalizedTriggers = $derived.by(() => {
		const result = [...new Set(triggers)];
		if (result.length === 0 || result.some((trigger) => trigger.length === 0)) {
			throw new TypeError('ZMention triggers must contain at least one non-empty value.');
		}
		return Object.freeze(result.sort((left, right) => right.length - left.length));
	});
	const collection = $derived(
		new LogicalCollection<SelectionKey, MentionItem>(
			items,
			{
				disabled: (item) => item.disabled ?? false,
				key: (item) => item.key,
				textValue: (item) => item.label
			},
			{ name: 'ZMention' }
		)
	);
	const resolvedLimits = $derived.by(() => {
		if (!Number.isInteger(minQueryLength) || minQueryLength < 0) {
			throw new TypeError('ZMention minQueryLength must be a non-negative integer.');
		}
		if (!Number.isInteger(maxSuggestions) || maxSuggestions < 1) {
			throw new TypeError('ZMention maxSuggestions must be a positive integer.');
		}
		return { maxSuggestions, minQueryLength };
	});
	const suggestionKeys = $derived.by(() => {
		if (!query || query.query.length < resolvedLimits.minQueryLength) return [];
		const needle = query.query.toLocaleLowerCase(zui.locale);
		return collection.full.items
			.filter(({ value: item }) => {
				if (filter) return filter(item, query!.query);
				return [item.label, item.value ?? '', ...(item.keywords ?? [])]
					.join(' ')
					.toLocaleLowerCase(zui.locale)
					.includes(needle);
			})
			.slice(0, resolvedLimits.maxSuggestions)
			.map(({ key }) => key);
	});
	const suggestionView = $derived(collection.view({ keys: suggestionKeys }));
	const mounted = new MountedElements<SelectionKey>();
	const virtualMount = createChoiceVirtualMountBridge(mounted);
	const navigation = new CollectionNavigation<SelectionKey, MentionItem>({
		direction: () => zui.direction,
		disabled: () => Boolean(disabled),
		loop: () => loop,
		orientation: () => 'vertical',
		view: () => suggestionView
	});
	const activeDescendant = new ActiveDescendant({
		idBase: () => idBase,
		mounted,
		navigation,
		virtualizer: virtualMount
	});
	const activeKey = $derived(activeDescendant.activeKey);
	const activeId = $derived(activeDescendant.activeId);
	const suggestions = $derived(suggestionView.items.map(({ value: item }) => item));
	const listClass = $derived(zui.recipe(listRecipe, { virtual }));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	$effect(() => {
		virtualMount.connect(virtual ? virtualController : null, activeKey);
		return () => virtualMount.connect(null);
	});
	$effect(() => {
		activeDescendant.prune(suggestionView.keys);
		activeDescendant.reconcile();
	});
	$effect(() => {
		if (
			open &&
			(!query || query.query.length < resolvedLimits.minQueryLength || disabled || readonly)
		)
			open = false;
	});
	function updateQuery(text: string, caret: number): void {
		query = findMentionQuery(text, caret, normalizedTriggers);
		navigation.set(undefined, 'filter');
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
		navigation.set(undefined, 'programmatic');
		onMention?.(item, trigger);
		queueMicrotask(() => {
			ref?.focus({ preventScroll: true });
			ref?.setSelectionRange(result.caret, result.caret);
		});
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }): void {
		if (!open || isKeyboardComposing(event)) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			open = false;
			return;
		}
		if ((event.key === 'Enter' || event.key === 'Tab') && activeKey !== undefined) {
			event.preventDefault();
			const activeItem = suggestionView.get(activeKey)?.value;
			if (activeItem) choose(activeItem);
			return;
		}
		activeDescendant.handleKey(event);
	}
	function mountOption(element: HTMLDivElement, key: SelectionKey) {
		let current = key;
		let dispose = activeDescendant.mount(current, element);
		return {
			destroy() {
				dispose();
			},
			update(next: SelectionKey) {
				if (Object.is(current, next)) return;
				dispose();
				current = next;
				dispose = activeDescendant.mount(current, element);
			}
		};
	}
	function suggestionKey(item: MentionItem): SelectionKey {
		return item.key;
	}
	function suggestionId(item: MentionItem): string {
		return activeDescendant.idFor(item.key);
	}
	function suggestionDisabled(item: MentionItem): boolean {
		return disabled || Boolean(item.disabled);
	}
	function suggestionSelected(item: MentionItem): boolean {
		return Object.is(activeKey, item.key);
	}
	function mountVirtualOption(key: SelectionKey, element: HTMLElement): () => void {
		return activeDescendant.mount(key, element);
	}
	function suggestionFromPointer(
		event: PointerEvent & { currentTarget: HTMLElement }
	): MentionItem | undefined {
		if (!isDomElement(event.target)) return undefined;
		const item = event.target.closest<HTMLElement>('[data-mention-index]');
		if (!item || !event.currentTarget.contains(item)) return undefined;
		const index = Number(item.dataset.mentionIndex);
		return Number.isInteger(index) ? suggestions[index] : undefined;
	}
	function handleListPointerDown(event: PointerEvent & { currentTarget: HTMLElement }): void {
		if (event.button === 0 && suggestionFromPointer(event)) event.preventDefault();
	}
	function handleListPointerMove(event: PointerEvent & { currentTarget: HTMLElement }): void {
		const item = suggestionFromPointer(event);
		if (item) handlePointerMove(item);
	}
	function handleListPointerUp(event: PointerEvent & { currentTarget: HTMLElement }): void {
		if (event.button !== 0) return;
		const item = suggestionFromPointer(event);
		if (item) choose(item);
	}
	function handlePointerMove(item: MentionItem): void {
		if (!disabled && !item.disabled) activeDescendant.set(item.key, 'pointer');
	}
	function reset(): void {
		valueState.reset();
		query = undefined;
		navigation.set(undefined, 'programmatic');
		open = false;
	}
</script>

{#snippet suggestionContent(suggestion: MentionItem)}
	{#if itemSnippet}
		{@render itemSnippet(suggestion)}
	{:else}
		<div>{suggestion.label}</div>
		{#if suggestion.description}<div class={descriptionClass}>{suggestion.description}</div>{/if}
	{/if}
{/snippet}

{#snippet virtualSuggestion(suggestion: MentionItem, index: number)}
	<div
		class={zui.recipe(itemRecipe, {
			active: Object.is(activeKey, suggestion.key),
			disabled: Boolean(disabled || suggestion.disabled)
		})}
		data-active={Object.is(activeKey, suggestion.key) || undefined}
		data-mention-index={index}
		data-slot="item-content"
	>
		{@render suggestionContent(suggestion)}
	</div>
{/snippet}

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
		{listId}
		data-loading={loading || undefined}
		onEditorInput={handleInput}
		onEditorKeydown={handleKeydown}
		onEditorReset={reset}
		{disabled}
		{readonly}
	/>
	<ZPopoverContent ariaLabelledBy={null} manageFocus={false} role="presentation">
		{#if virtual}
			<ZVirtualList
				aria-label={resolvedListLabel}
				bind:controller={virtualController}
				class={listClass}
				data-slot="list"
				height={virtualHeight}
				id={listId}
				itemDisabled={suggestionDisabled}
				itemId={suggestionId}
				itemKey={suggestionKey}
				itemRole="option"
				itemSelected={suggestionSelected}
				itemSize={virtualItemSize}
				items={suggestions}
				{loading}
				onItemMount={mountVirtualOption}
				onpointerdown={handleListPointerDown}
				onpointermove={handleListPointerMove}
				onpointerup={handleListPointerUp}
				overscan={virtualOverscan}
				role="listbox"
				tabindex={-1}
			>
				{#snippet item(suggestion, index)}{@render virtualSuggestion(suggestion, index)}{/snippet}
				{#snippet empty()}<div class={emptyClass} role="status">{resolvedEmptyText}</div>{/snippet}
				{#snippet loadingContent()}<div class={emptyClass} role="status">
						{resolvedLoadingText}
					</div>{/snippet}
			</ZVirtualList>
		{:else}
			<div
				aria-busy={loading || undefined}
				aria-label={resolvedListLabel}
				class={listClass}
				data-slot="list"
				id={listId}
				onpointerdown={handleListPointerDown}
				onpointermove={handleListPointerMove}
				onpointerup={handleListPointerUp}
				role="listbox"
				tabindex={-1}
			>
				{#each suggestions as suggestion, index (suggestion.key)}
					<div
						use:mountOption={suggestion.key}
						id={activeDescendant.idFor(suggestion.key)}
						class={zui.recipe(itemRecipe, {
							active: Object.is(activeKey, suggestion.key),
							disabled: Boolean(disabled || suggestion.disabled)
						})}
						data-active={Object.is(activeKey, suggestion.key) || undefined}
						data-mention-index={index}
						data-slot="item"
						role="option"
						tabindex={-1}
						aria-selected={Object.is(activeKey, suggestion.key)}
						aria-disabled={disabled || suggestion.disabled || undefined}
					>
						{@render suggestionContent(suggestion)}
					</div>
				{/each}
				{#if suggestions.length === 0}
					<div class={emptyClass} data-slot="status" role="status">
						{loading ? resolvedLoadingText : resolvedEmptyText}
					</div>
				{/if}
			</div>
		{/if}
	</ZPopoverContent>
</ZPopover>
