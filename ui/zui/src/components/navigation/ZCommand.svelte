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
		dependencies: ['ranked filter', 'grouped collection', 'active descendant', 'Form reset'],
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
			{ description: '命令分组。', name: 'group' },
			{ description: '命令option。', name: 'item' }
		],
		props: [
			{
				default: '必填',
				description: '稳定key、标签、分组、关键词与shortcut。',
				name: 'items',
				required: true,
				type: 'readonly CommandItem[]'
			},
			{ bindable: true, default: "''", description: '过滤查询。', name: 'query', type: 'string' },
			{
				default: 'true',
				description: '使用内置相关性排序。',
				name: 'shouldFilter',
				type: 'boolean'
			},
			{ default: '50', description: '最多渲染结果数。', name: 'maxResults', type: 'number' },
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
		status: 'experimental',
		summary: '相关性过滤、分组collection、active-descendant与可取消action的Command。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		navigationIntent,
		type NavigationIntent
	} from '../../runtime/collection/list-navigation.js';
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
				focus.outlineOffset.px(-2);
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
	// These identity caches are mutated while rendering and must not create reactive writes.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const optionIds = new Map<SelectionKey, string>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const groupIds = new Map<string, string>();
	let nextOptionId = 0;
	let nextGroupId = 0;
	let active = $state<SelectionKey>();
	let didAutofocus = false;
	const queryState = new ControllableState<string>({
		defaultValue: () => defaultQuery,
		onChange: () => onQueryChange,
		read: () => query,
		write: (next) => (query = next)
	});
	const normalizedItems = $derived.by(() => {
		// This set is local validation scratch space, not reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keys = new Set<SelectionKey>();
		for (const item of items) {
			if (keys.has(item.key)) throw new Error(`Duplicate ZCommand key "${String(item.key)}".`);
			keys.add(item.key);
		}
		return items;
	});
	const resolvedMaxResults = $derived.by(() => {
		if (!Number.isInteger(maxResults) || maxResults < 1) {
			throw new TypeError('ZCommand maxResults must be a positive integer.');
		}
		return maxResults;
	});
	const results = $derived.by(() =>
		normalizedItems
			.map((item, index) => {
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
			.map(({ item }) => item)
	);
	const enabled = $derived(results.filter((item) => !disabled && !item.disabled));
	const activeKey = $derived(
		enabled.some(({ key }) => Object.is(key, active)) ? active : enabled[0]?.key
	);
	const groups = $derived.by(() => {
		// This map is the immutable output being assembled for this derivation.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const grouped = new Map<string, CommandItem[]>();
		for (const item of results) {
			const group = item.group ?? '';
			const entries = grouped.get(group) ?? [];
			entries.push(item);
			grouped.set(group, entries);
		}
		return [...grouped].map(([name, groupItems]) => ({ items: groupItems, name }));
	});
	function optionId(key: SelectionKey): string {
		let id = optionIds.get(key);
		if (!id) {
			nextOptionId += 1;
			id = `${idBase}-option-${nextOptionId}`;
			optionIds.set(key, id);
		}
		return id;
	}
	function groupId(group: string): string {
		let id = groupIds.get(group);
		if (!id) {
			nextGroupId += 1;
			id = `${idBase}-group-${nextGroupId}`;
			groupIds.set(group, id);
		}
		return id;
	}
	const activeId = $derived(activeKey === undefined ? undefined : optionId(activeKey));
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
		active = undefined;
	}
	$effect(() => {
		if (!autofocus) {
			didAutofocus = false;
			return;
		}
		if (!inputRef || disabled || didAutofocus) return;
		didAutofocus = true;
		queueMicrotask(() => inputRef?.focus({ preventScroll: true }));
	});
	function activate(item: CommandItem, originalEvent: MouseEvent | KeyboardEvent): void {
		if (disabled || item.disabled) return;
		const event = new CommandActionEvent(item, originalEvent);
		onAction?.(event);
	}
	function move(intent: NavigationIntent): void {
		if (enabled.length === 0) return;
		const current = enabled.findIndex(({ key }) => Object.is(key, activeKey));
		let index =
			intent === 'first'
				? 0
				: intent === 'last'
					? enabled.length - 1
					: current + (intent === 'next' ? 1 : -1);
		index = loop
			? (index + enabled.length) % enabled.length
			: Math.max(0, Math.min(enabled.length - 1, index));
		active = enabled[index]?.key;
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		queryState.setFromUser(event.currentTarget.value);
		active = undefined;
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		const intent = navigationIntent(event.key, 'vertical');
		if (intent) {
			event.preventDefault();
			move(intent);
			return;
		}
		switch (event.key) {
			case 'Enter': {
				if (activeKey === undefined) return;
				event.preventDefault();
				const item = enabled.find(({ key }) => Object.is(key, activeKey));
				if (item) activate(item, event);
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
		aria-expanded="true"
		aria-activedescendant={activeId}
		oninput={handleInput}
		onkeydown={handleKeydown}
	/>
	<div
		class={listClass}
		id={`${idBase}-list`}
		data-slot="list"
		role="listbox"
		aria-label={resolvedListLabel}
	>
		{#each groups as group (group.name)}
			<div
				data-slot="group"
				role="group"
				aria-label={group.name ? undefined : resolvedListLabel}
				aria-labelledby={group.name ? groupId(group.name) : undefined}
			>
				{#if group.name}<div class={groupLabelClass} id={groupId(group.name)}>
						{group.name}
					</div>{/if}
				{#each group.items as item (item.key)}
					<div
						id={optionId(item.key)}
						class={zui.recipe(itemRecipe, {
							active: Object.is(activeKey, item.key),
							disabled: Boolean(disabled || item.disabled)
						})}
						data-slot="item"
						data-active={Object.is(activeKey, item.key) || undefined}
						data-disabled={item.disabled || undefined}
						role="option"
						tabindex={-1}
						aria-selected={Object.is(activeKey, item.key)}
						aria-disabled={disabled || item.disabled || undefined}
						onpointermove={() => {
							if (!disabled && !item.disabled) active = item.key;
						}}
						onpointerdown={(event) => event.preventDefault()}
						onclick={(event) => activate(item, event)}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								activate(item, event);
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
		{#if results.length === 0}<div class={emptyClass}>{resolvedEmptyText}</div>{/if}
	</div>
</div>
<FormResetSignal control={inputRef} onReset={resetFromForm} />
