<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';

	export interface CommandItem {
		readonly description?: string;
		readonly disabled?: boolean;
		readonly group?: string;
		readonly key: SelectionKey;
		readonly keywords?: readonly string[];
		readonly label: string;
		readonly shortcut?: string;
	}

	export class CommandActionEvent extends Event {
		readonly item: CommandItem;
		readonly originalEvent: MouseEvent | KeyboardEvent;
		constructor(item: CommandItem, originalEvent: MouseEvent | KeyboardEvent) {
			super('zui-command-action', { cancelable: true });
			this.item = item;
			this.originalEvent = originalEvent;
		}
	}

	export interface ZCommandProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly autofocus?: boolean;
		readonly defaultQuery?: string;
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly filter?: (item: CommandItem, query: string) => boolean | number;
		readonly inputLabel?: string;
		inputRef?: HTMLInputElement | null;
		readonly items: readonly CommandItem[];
		readonly listLabel?: string;
		readonly loop?: boolean;
		readonly maxResults?: number;
		readonly onAction?: (event: CommandActionEvent) => void;
		readonly onEscape?: (event: KeyboardEvent) => void;
		readonly onQueryChange?: (query: string) => void;
		readonly placeholder?: string;
		query?: string;
		ref?: HTMLDivElement | null;
		readonly resultsLabel?: (count: number) => string;
		readonly shouldFilter?: boolean;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'command',
		importStatement: "import { ZCommand } from '@zadmin/zui';",
		name: 'ZCommand',
		bindings: [
			{ description: '当前过滤查询。', name: 'query', type: 'string' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{
				description: '保持DOM焦点的真实输入引用。',
				name: 'inputRef',
				type: 'HTMLInputElement | null'
			}
		],
		dependencies: ['LogicalCollection', 'CollectionNavigation', 'ActiveDescendant', 'Form reset'],
		events: [
			{ description: '查询变化。', name: 'onQueryChange', type: '(query: string) => void' },
			{
				description: '激活动作；preventDefault可阻止消费方默认行为。',
				name: 'onAction',
				type: '(event: CommandActionEvent) => void'
			},
			{ description: '输入上按Escape。', name: 'onEscape', type: '(event: KeyboardEvent) => void' }
		],
		keyboard: [
			{ description: '循环或夹紧移动active command。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '激活active command。', key: 'Enter' },
			{ description: '交给宿主关闭或清理。', key: 'Escape' }
		],
		parts: [
			{ description: 'active-descendant输入。', name: 'input' },
			{ description: '结果listbox。', name: 'list' },
			{ description: 'polite结果数量公告。', name: 'status' },
			{ description: '命令分组。', name: 'group' },
			{ description: '命令option。', name: 'item' }
		],
		props: [
			{
				default: 'false',
				description: '挂载后将焦点交给查询输入框；调用方仍可通过inputRef接管焦点。',
				name: 'autofocus',
				type: 'boolean'
			},
			{
				default: "''",
				description: '非受控模式下的初始查询；受控模式请使用query。',
				name: 'defaultQuery',
				type: 'string'
			},
			{
				default: '必填',
				description: '稳定key、标签、分组、关键词与shortcut。',
				name: 'items',
				required: true,
				type: 'readonly CommandItem[]',
				members: [
					{ description: '唯一业务身份。', name: 'key', type: 'SelectionKey', required: true },
					{ description: '命令显示文本。', name: 'label', type: 'string', required: true },
					{ description: '命令补充说明。', name: 'description', type: 'string' },
					{ description: '连续分组标签。', name: 'group', type: 'string' },
					{ description: 'typeahead匹配关键词。', name: 'keywords', type: 'readonly string[]' },
					{ description: '键盘快捷键展示文本。', name: 'shortcut', type: 'string' },
					{ description: '禁止执行该命令。', name: 'disabled', type: 'boolean' }
				]
			},
			{
				default: 'localePack.command.empty',
				description: '无匹配结果时显示的文本；显式值优先于locale。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: 'scoreCommand',
				description: '自定义过滤器；返回false排除，返回数字按相关性排序。',
				name: 'filter',
				type: '(item: CommandItem, query: string) => boolean | number'
			},
			{
				default: 'localePack.command.inputLabel',
				description: '查询输入框的可访问名称；显式值优先于locale。',
				name: 'inputLabel',
				type: 'string'
			},
			{
				default: 'localePack.command.listLabel',
				description: '结果listbox的可访问名称；显式值优先于locale。',
				name: 'listLabel',
				type: 'string'
			},
			{
				default: 'localePack.command.placeholder',
				description: '查询输入框占位提示；显式值优先于locale。',
				name: 'placeholder',
				type: 'string'
			},
			{ bindable: true, default: "''", description: '过滤查询。', name: 'query', type: 'string' },
			{
				default: 'true',
				description: '使用内置相关性排序。',
				name: 'shouldFilter',
				type: 'boolean'
			},
			{ default: '50', description: '最多渲染结果数。', name: 'maxResults', type: 'number' },
			{
				default: 'localePack.command.results',
				description: '把当前结果数转换为polite live status；显式格式化优先。',
				name: 'resultsLabel',
				type: '(count: number) => string'
			},
			{ default: 'true', description: '方向键是否循环。', name: 'loop', type: 'boolean' },
			{ default: 'false', description: '禁用查询和动作。', name: 'disabled', type: 'boolean' }
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/navigation/ZCommand.svelte',
		states: [
			{ description: '当前active option。', name: 'data-active', values: ['true'] },
			{ description: '禁用option。', name: 'data-disabled', values: ['true'] }
		],
		status: 'stable',
		summary: '相关性过滤、分组collection、active-descendant与可取消action的Command。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { scoreCommand } from '../../runtime/command.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flexDirection.column;
			s.overflow.hidden;
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.opacity._disabled } },
		defaultVariants: { disabled: false }
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor.transparent;
			s.borderBottomColor._border;
			s.borderBottomStyle.solid;
			s.borderBottomWidth._hairline;
			s.borderLeftStyle.none;
			s.borderRightStyle.none;
			s.borderTopStyle.none;
			s.color._text;
			s.fontSize._medium;
			s.padding._large;
			s.width._full;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._inner;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {},
		defaultVariants: {}
	});
	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.maxHeight.rem(22);
			s.overflow.auto;
			s.padding._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const groupLabelRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
			s.fontWeight._semibold;
			s.paddingBlock._small;
			s.paddingInline._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
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
	const shortcutRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontFamily._mono;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const emptyRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
			s.textAlign.center;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [
		rootRecipe,
		inputRecipe,
		listRecipe,
		groupLabelRecipe,
		itemRecipe,
		descriptionRecipe,
		shortcutRecipe,
		emptyRecipe
	]) {
		registerRecipeHmr(import.meta, recipe);
	}

	let {
		autofocus = false,
		class: className,
		defaultQuery = '',
		disabled = false,
		emptyText,
		filter,
		inputLabel,
		inputRef = $bindable(null),
		items,
		listLabel,
		loop = true,
		maxResults = 50,
		onAction,
		onEscape,
		onQueryChange,
		placeholder,
		query = $bindable(),
		ref = $bindable(null),
		resultsLabel,
		shouldFilter = true,
		style,
		...rest
	}: ZCommandProps = $props();
	const zui = useZui();
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.command.empty);
	const resolvedInputLabel = $derived(inputLabel ?? zui.localePack.command.inputLabel);
	const resolvedListLabel = $derived(listLabel ?? zui.localePack.command.listLabel);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.command.placeholder);
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'command'));
	let didAutofocus = false;
	const queryState = new ControllableState<string>({
		defaultValue: () => defaultQuery,
		onChange: () => onQueryChange,
		read: () => query,
		write: (next) => (query = next)
	});
	const collection = $derived(
		new LogicalCollection<SelectionKey, CommandItem>(
			items,
			{
				disabled: (item) => item.disabled ?? false,
				groupKey: (item) => item.group,
				key: (item) => item.key,
				textValue: (item) => item.label
			},
			{ name: 'ZCommand' }
		)
	);
	const resolvedMaxResults = $derived.by(() => {
		if (!Number.isInteger(maxResults) || maxResults < 1) {
			throw new TypeError('ZCommand maxResults must be a positive integer.');
		}
		return maxResults;
	});
	const resultKeys = $derived.by(() =>
		collection.full.items
			.map(({ value: item }, index) => {
				if (!shouldFilter) return { index, item, score: 0 };
				const custom = filter?.(item, queryState.current);
				const score =
					custom === false
						? undefined
						: custom === true
							? 0
							: typeof custom === 'number'
								? custom
								: scoreCommand(item, queryState.current, zui.locale);
				return score === undefined || !Number.isFinite(score) ? undefined : { index, item, score };
			})
			.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
			.sort((left, right) => right.score - left.score || left.index - right.index)
			.slice(0, resolvedMaxResults)
			.map(({ item }) => item.key)
	);
	const resultView = $derived(collection.view({ keys: resultKeys }));
	const resultNumberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const resultStatus = $derived(
		resultsLabel?.(resultView.size) ??
			zui.localePack.command.results(resultNumberFormatter.format(resultView.size))
	);
	const mounted = new MountedElements<SelectionKey>();
	const navigation = new CollectionNavigation<SelectionKey, CommandItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => 'vertical',
		view: () => resultView
	});
	const activeDescendant = new ActiveDescendant({
		idBase: () => idBase,
		mounted,
		navigation
	});
	activeDescendant.reconcile();
	const activeKey = $derived(activeDescendant.activeKey);
	const activeId = $derived(activeDescendant.activeId);
	function mountOption(
		element: HTMLDivElement,
		registration: { readonly id: string; readonly key: SelectionKey }
	) {
		let current = registration;
		let dispose = activeDescendant.mount(current.key, element);
		return {
			destroy() {
				dispose();
			},
			update(next: { readonly id: string; readonly key: SelectionKey }) {
				if (Object.is(current.key, next.key) && current.id === next.id) return;
				dispose();
				current = next;
				dispose = activeDescendant.mount(current.key, element);
			}
		};
	}
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled }));
	const inputClass = $derived(zui.recipe(inputRecipe));
	const listClass = $derived(zui.recipe(listRecipe));
	const groupLabelClass = $derived(zui.recipe(groupLabelRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const shortcutClass = $derived(zui.recipe(shortcutRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		queryState.reset();
		navigation.set(undefined, 'programmatic');
	}
	$effect(() => {
		activeDescendant.prune(collection.full.keys);
		activeDescendant.reconcile();
	});
	$effect(() => {
		if (!autofocus) {
			didAutofocus = false;
			return;
		}
		if (!inputRef || disabled || didAutofocus) return;
		didAutofocus = true;
		queueMicrotask(() => inputRef?.focus({ preventScroll: true }));
	});
	function activate(key: SelectionKey, originalEvent: MouseEvent | KeyboardEvent): void {
		const item = resultView.get(key);
		if (disabled || !item || item.disabled) return;
		const event = new CommandActionEvent(item.value, originalEvent);
		onAction?.(event);
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		queryState.setFromUser(event.currentTarget.value);
		navigation.set(undefined, 'filter');
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (isKeyboardComposing(event) || activeDescendant.handleKey(event)) return;
		switch (event.key) {
			case 'Enter': {
				if (activeKey === undefined) return;
				event.preventDefault();
				activate(activeKey, event);
				return;
			}
			case 'Escape':
				onEscape?.(event);
				return;
			default:
				return;
		}
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-disabled={disabled || undefined}
>
	<input
		bind:this={inputRef}
		class={inputClass}
		id={`${idBase}-input`}
		type="text"
		defaultValue={defaultQuery}
		value={queryState.current}
		{disabled}
		placeholder={resolvedPlaceholder}
		role="combobox"
		aria-label={resolvedInputLabel}
		aria-autocomplete="list"
		aria-controls={`${idBase}-list`}
		aria-describedby={`${idBase}-status`}
		aria-expanded="true"
		aria-activedescendant={activeId}
		oninput={handleInput}
		onkeydown={handleKeydown}
	/>
	<ZVisuallyHidden
		id={`${idBase}-status`}
		aria-atomic="true"
		aria-live="polite"
		data-slot="status"
		role="status"
	>
		{resultStatus}
	</ZVisuallyHidden>
	<div
		class={listClass}
		id={`${idBase}-list`}
		data-slot="list"
		role="listbox"
		aria-label={resolvedListLabel}
	>
		{#each resultView.groups as group, groupIndex (group.key)}
			<div
				data-slot="group"
				role="group"
				aria-label={group.key ? undefined : resolvedListLabel}
				aria-labelledby={group.key ? `${idBase}-group-${groupIndex + 1}` : undefined}
			>
				{#if group.key}<div class={groupLabelClass} id={`${idBase}-group-${groupIndex + 1}`}>
						{group.key}
					</div>{/if}
				{#each group.items as record (record.key)}
					{@const item = record.value}
					{@const optionId = activeDescendant.idFor(record.key)}
					<div
						use:mountOption={{ id: optionId, key: record.key }}
						id={optionId}
						class={zui.recipe(itemRecipe, {
							active: Object.is(activeKey, record.key),
							disabled: Boolean(disabled || record.disabled)
						})}
						data-slot="item"
						data-active={Object.is(activeKey, record.key) || undefined}
						data-disabled={record.disabled || undefined}
						role="option"
						tabindex={-1}
						aria-selected={Object.is(activeKey, record.key)}
						aria-disabled={disabled || record.disabled || undefined}
						onpointermove={() => {
							if (!disabled && !record.disabled) activeDescendant.set(record.key, 'pointer');
						}}
						onpointerdown={(event) => event.preventDefault()}
						onclick={(event) => activate(record.key, event)}
						onkeydown={(event) => {
							if (!isKeyboardComposing(event) && (event.key === 'Enter' || event.key === ' ')) {
								event.preventDefault();
								activate(record.key, event);
							}
						}}
					>
						<div>
							<div>{item.label}</div>
							{#if item.description}<div class={descriptionClass}>{item.description}</div>{/if}
						</div>
						{#if item.shortcut}<span class={shortcutClass}>{item.shortcut}</span>{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
	{#if resultView.size === 0}<div class={emptyClass} data-slot="empty" role="status">
			{resolvedEmptyText}
		</div>{/if}
</div>
<FormResetSignal control={inputRef} onReset={resetFromForm} />
