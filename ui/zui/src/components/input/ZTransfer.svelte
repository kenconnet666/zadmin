<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';

	export interface TransferItem {
		readonly description?: string;
		readonly disabled?: boolean;
		readonly key: SelectionKey;
		readonly label: string;
	}

	export interface ZTransferProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly defaultValue?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly filter?: (item: TransferItem, query: string) => boolean;
		readonly filterable?: boolean;
		readonly form?: string;
		readonly items: readonly TransferItem[];
		readonly moveToSourceLabel?: string;
		readonly moveToTargetLabel?: string;
		readonly name?: string;
		readonly onValueChange?: (value: readonly SelectionKey[]) => void;
		ref?: HTMLDivElement | null;
		readonly searchPlaceholder?: string;
		readonly sourceTitle?: string;
		readonly targetTitle?: string;
		value?: readonly SelectionKey[];
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'transfer',
		importStatement: "import { ZTransfer } from '@zadmin/zui';",
		name: 'ZTransfer',
		bindings: [
			{ description: '目标集合的有序稳定key。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['dual collection', 'multiple selection', 'filter', 'FormValue'],
		events: [
			{
				description: '用户移动项目后返回目标集合key。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			}
		],
		keyboard: [
			{ description: '在当前列表的enabled项目间移动。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '切换当前项目。', key: 'Enter / Space' },
			{ description: '选择当前过滤结果中的全部enabled项目。', key: 'Ctrl / Meta + A' },
			{ description: '按标签前缀移动焦点。', key: 'Typeahead' }
		],
		parts: [
			{ description: '来源或目标面板。', name: 'panel' },
			{ description: '多选listbox。', name: 'list' },
			{ description: '可转移option。', name: 'item' },
			{ description: '双向移动操作区。', name: 'controls' }
		],
		props: [
			{
				default: '必填',
				description: '稳定key、标签、说明和disabled配置。',
				name: 'items',
				required: true,
				type: 'readonly TransferItem[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '目标集合key，顺序跟随items。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初始目标集合。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{ default: 'true', description: '显示两侧过滤输入。', name: 'filterable', type: 'boolean' },
			{
				default: '标签和说明包含查询',
				description: '自定义过滤算法。',
				name: 'filter',
				type: '(item: TransferItem, query: string) => boolean'
			},
			{ default: 'false', description: '禁用全部选择和移动。', name: 'disabled', type: 'boolean' },
			{ default: 'undefined', description: '重复隐藏字段名。', name: 'name', type: 'string' }
		],
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTransfer.svelte',
		states: [
			{ description: '项目是否被勾选。', name: 'data-state', values: ['selected', 'unselected'] },
			{ description: '项目是否禁用。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '拥有双collection、多选过滤、键盘与表单合同的Transfer。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets use immutable replacement or are local derived values. */
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { Typeahead } from '../../runtime/collection/typeahead.js';
	import { listenForFormReset } from '../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZInput from './ZInput.svelte';

	type Side = 'source' | 'target';
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.opacity._disabled } },
		defaultVariants: { disabled: false }
	});
	const panelRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flex.raw('1 1 14rem');
			s.flexDirection.column;
			s.gap._small;
			s.minWidth._menu;
			s.padding._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.fontWeight._semibold;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.maxHeight.rem(16);
			s.minHeight.rem(10);
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
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._surface;
					s.color._primary;
				}
			}
		},
		defaultVariants: { disabled: false, selected: false }
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const controlsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	const emptyRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [
		rootRecipe,
		panelRecipe,
		headerRecipe,
		listRecipe,
		itemRecipe,
		descriptionRecipe,
		controlsRecipe,
		emptyRecipe
	]) {
		registerRecipeHmr(import.meta, recipe);
	}

	const unique = (keys: readonly SelectionKey[]) => Object.freeze([...new Set(keys)]);
	let {
		class: className,
		defaultValue = [],
		disabled = false,
		emptyText = 'No items',
		filter,
		filterable = true,
		form,
		items,
		moveToSourceLabel = 'Move selected to source',
		moveToTargetLabel = 'Move selected to target',
		name,
		onValueChange,
		ref = $bindable(null),
		searchPlaceholder = 'Filter items',
		sourceTitle = 'Available',
		style,
		targetTitle = 'Selected',
		value = $bindable(),
		...rest
	}: ZTransferProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'transfer'));
	let proxy = $state<HTMLInputElement | null>(null);
	let sourceQuery = $state('');
	let targetQuery = $state('');
	let sourceChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	let targetChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	let sourceFocus = $state<SelectionKey>();
	let targetFocus = $state<SelectionKey>();
	const sourceElements = $state<(HTMLDivElement | null)[]>([]);
	const targetElements = $state<(HTMLDivElement | null)[]>([]);
	const sourceTypeahead = new Typeahead<SelectionKey>({ locale: zui.locale });
	const targetTypeahead = new Typeahead<SelectionKey>({ locale: zui.locale });
	const normalizedItems = $derived.by(() => {
		const keys = new Set<SelectionKey>();
		for (const item of items) {
			if (keys.has(item.key)) throw new Error(`Duplicate ZTransfer key "${String(item.key)}".`);
			keys.add(item.key);
		}
		return items;
	});
	const itemKeys = $derived(new Set(normalizedItems.map(({ key }) => key)));
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => unique(defaultValue),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(unique(valueState.current).filter((key) => itemKeys.has(key)));
	const targetKeys = $derived(new Set(resolvedValue));
	const sourceItems = $derived(normalizedItems.filter(({ key }) => !targetKeys.has(key)));
	const targetItems = $derived(normalizedItems.filter(({ key }) => targetKeys.has(key)));
	function matches(item: TransferItem, query: string): boolean {
		if (!query) return true;
		if (filter) return filter(item, query);
		const needle = query.toLocaleLowerCase(zui.locale);
		return `${item.label} ${item.description ?? ''}`.toLocaleLowerCase(zui.locale).includes(needle);
	}
	const visibleSource = $derived(sourceItems.filter((item) => matches(item, sourceQuery.trim())));
	const visibleTarget = $derived(targetItems.filter((item) => matches(item, targetQuery.trim())));
	const sourceEnabled = $derived(visibleSource.filter((item) => !disabled && !item.disabled));
	const targetEnabled = $derived(visibleTarget.filter((item) => !disabled && !item.disabled));
	const resolvedSourceFocus = $derived(
		sourceEnabled.some(({ key }) => Object.is(key, sourceFocus))
			? sourceFocus
			: (sourceEnabled.find(({ key }) => sourceChecked.has(key))?.key ?? sourceEnabled[0]?.key)
	);
	const resolvedTargetFocus = $derived(
		targetEnabled.some(({ key }) => Object.is(key, targetFocus))
			? targetFocus
			: (targetEnabled.find(({ key }) => targetChecked.has(key))?.key ?? targetEnabled[0]?.key)
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled }));
	const panelClass = $derived(zui.recipe(panelRecipe));
	const headerClass = $derived(zui.recipe(headerRecipe));
	const listClass = $derived(zui.recipe(listRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const controlsClass = $derived(zui.recipe(controlsRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (!proxy) return;
		return listenForFormReset(proxy, () => {
			valueState.reset();
			sourceChecked = new Set();
			targetChecked = new Set();
			sourceQuery = '';
			targetQuery = '';
		});
	});
	$effect(() => {
		const nextSource = new Set(
			[...sourceChecked].filter((key) => sourceItems.some((item) => Object.is(item.key, key)))
		);
		const nextTarget = new Set(
			[...targetChecked].filter((key) => targetItems.some((item) => Object.is(item.key, key)))
		);
		if (nextSource.size !== sourceChecked.size) sourceChecked = nextSource;
		if (nextTarget.size !== targetChecked.size) targetChecked = nextTarget;
	});
	function toggle(side: Side, item: TransferItem): void {
		if (disabled || item.disabled) return;
		const current = side === 'source' ? sourceChecked : targetChecked;
		const next = new Set(current);
		if (next.has(item.key)) next.delete(item.key);
		else next.add(item.key);
		if (side === 'source') {
			sourceFocus = item.key;
			sourceChecked = next;
		} else {
			targetFocus = item.key;
			targetChecked = next;
		}
	}
	function selectVisible(side: Side): void {
		const enabled = side === 'source' ? sourceEnabled : targetEnabled;
		const selected = new Set(enabled.map(({ key }) => key));
		if (side === 'source') sourceChecked = selected;
		else targetChecked = selected;
	}
	function focusItem(side: Side, key: SelectionKey): void {
		const visible = side === 'source' ? visibleSource : visibleTarget;
		const index = visible.findIndex((item) => Object.is(item.key, key));
		if (index < 0) return;
		if (side === 'source') {
			sourceFocus = key;
			sourceElements[index]?.focus({ preventScroll: true });
		} else {
			targetFocus = key;
			targetElements[index]?.focus({ preventScroll: true });
		}
	}
	function handleKey(event: KeyboardEvent, side: Side, item: TransferItem): void {
		const enabled = side === 'source' ? sourceEnabled : targetEnabled;
		const currentKey = side === 'source' ? resolvedSourceFocus : resolvedTargetFocus;
		if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'a') {
			event.preventDefault();
			selectVisible(side);
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle(side, item);
			return;
		}
		const current = enabled.findIndex(({ key }) => Object.is(key, item.key));
		const targetIndex =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? enabled.length - 1
					: event.key === 'ArrowDown'
						? Math.min(enabled.length - 1, current + 1)
						: event.key === 'ArrowUp'
							? Math.max(0, current - 1)
							: -1;
		if (targetIndex >= 0) {
			event.preventDefault();
			const target = enabled[targetIndex];
			if (target) focusItem(side, target.key);
			return;
		}
		const typeahead = side === 'source' ? sourceTypeahead : targetTypeahead;
		const match = typeahead.search(
			event.key,
			enabled.map(({ key, label }) => ({ key, textValue: label })),
			currentKey
		);
		if (match !== undefined) {
			event.preventDefault();
			focusItem(side, match);
		}
	}
	function move(to: Side): void {
		if (disabled) return;
		const moving = to === 'target' ? sourceChecked : targetChecked;
		if (moving.size === 0) return;
		const nextKeys = new Set(targetKeys);
		for (const item of normalizedItems) {
			if (!moving.has(item.key) || item.disabled) continue;
			if (to === 'target') nextKeys.add(item.key);
			else nextKeys.delete(item.key);
		}
		const next = Object.freeze(
			normalizedItems.filter(({ key }) => nextKeys.has(key)).map(({ key }) => key)
		);
		valueState.setFromUser(next);
		if (to === 'target') sourceChecked = new Set();
		else targetChecked = new Set();
	}
	const sourceCount = $derived(sourceChecked.size);
	const targetCount = $derived(targetChecked.size);
	const serializedValues = $derived(
		resolvedValue.flatMap((key) => {
			const serialized = serializeFormValue(key);
			return serialized === undefined ? [] : [serialized];
		})
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={disabled || undefined}
>
	<section class={panelClass} data-slot="panel" aria-labelledby={`${idBase}-source-title`}>
		<header class={headerClass}>
			<span id={`${idBase}-source-title`}>{sourceTitle}</span><span
				>{sourceChecked.size} / {sourceItems.length}</span
			>
		</header>
		{#if filterable}
			<ZInput
				bind:value={sourceQuery}
				id={`${idBase}-source-filter`}
				size="small"
				aria-label={`${sourceTitle}: ${searchPlaceholder}`}
				placeholder={searchPlaceholder}
				{disabled}
			/>
		{/if}
		<div
			class={listClass}
			data-slot="list"
			role="listbox"
			aria-label={sourceTitle}
			aria-multiselectable="true"
		>
			{#each visibleSource as item, index (item.key)}
				<div
					bind:this={sourceElements[index]}
					class={zui.recipe(itemRecipe, {
						disabled: Boolean(disabled || item.disabled),
						selected: sourceChecked.has(item.key)
					})}
					data-slot="item"
					data-state={sourceChecked.has(item.key) ? 'selected' : 'unselected'}
					data-disabled={item.disabled || undefined}
					role="option"
					aria-selected={sourceChecked.has(item.key)}
					aria-disabled={disabled || item.disabled || undefined}
					tabindex={Object.is(resolvedSourceFocus, item.key) ? 0 : -1}
					onfocus={() => (sourceFocus = item.key)}
					onclick={() => toggle('source', item)}
					onkeydown={(event) => handleKey(event, 'source', item)}
				>
					<div>{item.label}</div>
					{#if item.description}<div class={descriptionClass}>{item.description}</div>{/if}
				</div>
			{/each}
			{#if visibleSource.length === 0}<div class={emptyClass}>{emptyText}</div>{/if}
		</div>
	</section>

	<div class={controlsClass} data-slot="controls">
		<ZButton
			aria-label={moveToTargetLabel}
			disabled={disabled || sourceCount === 0}
			onclick={() => move('target')}>→</ZButton
		>
		<ZButton
			aria-label={moveToSourceLabel}
			disabled={disabled || targetCount === 0}
			onclick={() => move('source')}
			variant="secondary">←</ZButton
		>
	</div>

	<section class={panelClass} data-slot="panel" aria-labelledby={`${idBase}-target-title`}>
		<header class={headerClass}>
			<span id={`${idBase}-target-title`}>{targetTitle}</span><span
				>{targetChecked.size} / {targetItems.length}</span
			>
		</header>
		{#if filterable}
			<ZInput
				bind:value={targetQuery}
				id={`${idBase}-target-filter`}
				size="small"
				aria-label={`${targetTitle}: ${searchPlaceholder}`}
				placeholder={searchPlaceholder}
				{disabled}
			/>
		{/if}
		<div
			class={listClass}
			data-slot="list"
			role="listbox"
			aria-label={targetTitle}
			aria-multiselectable="true"
		>
			{#each visibleTarget as item, index (item.key)}
				<div
					bind:this={targetElements[index]}
					class={zui.recipe(itemRecipe, {
						disabled: Boolean(disabled || item.disabled),
						selected: targetChecked.has(item.key)
					})}
					data-slot="item"
					data-state={targetChecked.has(item.key) ? 'selected' : 'unselected'}
					data-disabled={item.disabled || undefined}
					role="option"
					aria-selected={targetChecked.has(item.key)}
					aria-disabled={disabled || item.disabled || undefined}
					tabindex={Object.is(resolvedTargetFocus, item.key) ? 0 : -1}
					onfocus={() => (targetFocus = item.key)}
					onclick={() => toggle('target', item)}
					onkeydown={(event) => handleKey(event, 'target', item)}
				>
					<div>{item.label}</div>
					{#if item.description}<div class={descriptionClass}>{item.description}</div>{/if}
				</div>
			{/each}
			{#if visibleTarget.length === 0}<div class={emptyClass}>{emptyText}</div>{/if}
		</div>
	</section>
</div>
<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
{#if name && !disabled}{#each serializedValues as serialized, index (`${serialized}-${index}`)}<input
			type="hidden"
			{form}
			{name}
			value={serialized}
		/>{/each}{/if}
