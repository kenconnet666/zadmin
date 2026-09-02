<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TreeEntry, TreeNode } from '../../runtime/tree.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import type { TreeLoadContext as PublicTreeLoadContext } from '../compound/tree/ZTree.svelte';

	export interface ZTreeSelectProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		/** @deprecated Use the native `aria-label` attribute. */
		readonly ariaLabel?: string;
		readonly clearable?: boolean;
		readonly clearLabel?: string;
		readonly controlId?: string;
		readonly defaultExpandedKeys?: readonly TKey[];
		readonly defaultOpen?: boolean;
		readonly defaultValue?: TKey | null;
		readonly disabled?: boolean;
		expandedKeys?: readonly TKey[];
		readonly form?: string;
		readonly gutter?: number;
		readonly height?: number;
		readonly invalid?: boolean;
		readonly item?: Snippet<[TreeNode<TKey>, TreeEntry<TKey>]>;
		readonly itemSize?: number;
		readonly matchWidth?: boolean;
		readonly name?: string;
		readonly nodes: readonly TreeNode<TKey>[];
		readonly onExpandedChange?: (keys: readonly TKey[]) => void;
		readonly onLoadChildren?: (
			node: TreeNode<TKey>,
			context: PublicTreeLoadContext<TKey>
		) => void | Promise<void>;
		readonly onLoadError?: (key: TKey, error: unknown) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: TKey | null) => void;
		open?: boolean;
		readonly overscan?: number;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly treeLabel?: string;
		readonly valueLabel?: (key: TKey, node: TreeNode<TKey> | undefined) => string;
		value?: TKey | null;
		readonly virtualized?: boolean;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'tree-select',
		importStatement: "import { ZTreeSelect } from '@zadmin/zui';",
		name: 'ZTreeSelect',
		bindings: [
			{ description: '当前选择key或null。', name: 'value', type: 'TKey | null' },
			{ description: '展开keys。', name: 'expandedKeys', type: 'readonly TKey[]' },
			{ description: '打开状态。', name: 'open', type: 'boolean' },
			{ description: '真实组合根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZTree', 'LogicalTree', 'ZPopover', 'FieldControl owner', 'FormValueBridge'],
		events: [
			{
				description: '用户选择或清空后调用一次。',
				name: 'onValueChange',
				type: '(value: TKey | null) => void'
			},
			{
				description: '内部ZTree展开变化。',
				name: 'onExpandedChange',
				type: '(keys: readonly TKey[]) => void'
			},
			{ description: '浮层打开变化。', name: 'onOpenChange', type: '(open: boolean) => void' },
			{
				description: '复用ZTree lazy children请求合同。',
				name: 'onLoadChildren',
				type: '(node: TreeNode<TKey>, context: TreeLoadContext<TKey>) => void | Promise<void>'
			},
			{
				description: 'lazy branch加载失败；保留ZTree可重试状态并报告原始错误。',
				name: 'onLoadError',
				type: '(key: TKey, error: unknown) => void'
			}
		],
		keyboard: [
			{ description: '打开Tree popup。', key: 'Enter / Space / ArrowDown / ArrowUp' },
			{ description: '打开后由ZTree拥有层级、typeahead和选择键盘。', key: 'Tree keys' },
			{ description: '关闭并恢复Trigger，不改变值。', key: 'Escape' },
			{ description: 'clearable且关闭时清空值。', key: 'Delete / Backspace' }
		],
		parts: [
			{ description: '组合根。', name: 'root' },
			{ description: '唯一Field焦点owner按钮。', name: 'trigger' },
			{ description: '可选清空按钮。', name: 'clear' },
			{ description: 'Popover内直接复用的ZTree。', name: 'tree' }
		],
		props: [
			{
				default: 'native aria-label或Provider treeOptions',
				description: '已弃用；兼容旧调用的Trigger与Tree可访问名称别名，请使用原生aria-label。',
				name: 'ariaLabel',
				type: 'string'
			},
			{
				default: '必填',
				description: '与ZTree相同的typed扁平节点数据。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode<TKey>[]'
			},
			{
				bindable: true,
				default: 'null',
				description: '选择key；null是明确空值，undefined只表示prop未提供。',
				name: 'value',
				type: 'TKey | null'
			},
			{
				default: 'null',
				description: '非受控初始选择；finite key规则与value一致。',
				name: 'defaultValue',
				type: 'TKey | null'
			},
			{
				bindable: true,
				default: 'false',
				description: '受控或非受控Popover状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始Popover状态。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				bindable: true,
				default: '[]',
				description: '与内部ZTree共享的受控或非受控展开keys。',
				name: 'expandedKeys',
				type: 'readonly TKey[]'
			},
			{
				default: '[]',
				description: '非受控初始展开keys；去重后冻结，form reset恢复此集合。',
				name: 'defaultExpandedKeys',
				type: 'readonly TKey[]'
			},
			{
				default: 'false',
				description: '显示独立清空操作并支持Delete/Backspace。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.common.clear',
				description: '独立清空按钮的可访问名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: '继承Field或自动生成',
				description: '唯一Field焦点owner与Popover trigger id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: '禁用焦点、浮层、清空和表单值。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '保持Trigger可聚焦但阻止打开、清空和选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射根与Trigger aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射Trigger data-required并由Field标签呈现必填语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field或Provider density',
				description: 'Trigger尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: "'bottom-start'",
				description: 'Popover首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: '4', description: 'Trigger与Popover间距px。', name: 'gutter', type: 'number' },
			{
				default: 'true',
				description: 'Popover宽度是否匹配Trigger。',
				name: 'matchWidth',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '内部ZTree复用ZVirtualList。',
				name: 'virtualized',
				type: 'boolean'
			},
			{
				default: '320',
				description: 'virtualized模式的ZTree viewport高度px。',
				name: 'height',
				type: 'number'
			},
			{
				default: '36',
				description: 'virtualized模式的固定树项高度px。',
				name: 'itemSize',
				type: 'number'
			},
			{
				default: '4',
				description: 'virtualized模式在可见区前后额外挂载项数。',
				name: 'overscan',
				type: 'number'
			},
			{
				default: '最近祖先form',
				description: '唯一FormValueBridge关联的外部form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Field context或undefined',
				description: '选择key的真实FormData字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'Provider localePack.collection.selectNode',
				description: 'null值时Trigger显示文本。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'aria-label、兼容ariaLabel或Provider treeOptions',
				description: 'Popover内真实tree的可访问名称。',
				name: 'treeLabel',
				type: 'string'
			},
			{
				default: 'node.label ?? String(key)',
				description: '根据typed key与当前顶层节点生成Trigger显示文本。',
				name: 'valueLabel',
				type: '(key: TKey, node: TreeNode<TKey> | undefined) => string'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '直接转发给内部ZTree的类型安全节点正文。',
				name: 'item',
				type: 'Snippet<[TreeNode<TKey>, TreeEntry<TKey>]>'
			}
		],
		source: 'ui/zui/src/components/input/ZTreeSelect.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '明确空值。', name: 'data-empty', values: ['true'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'以Popover组合单一ZTree模型，支持null清空、Field/FormValue、lazy与virtual合同的Tree Select。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	import X from '@lucide/svelte/icons/x';
	import { onDestroy } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZTree from '../compound/tree/ZTree.svelte';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._small;
			s.width._full;
			s._selector('& > [data-slot="trigger"]', (trigger) => {
				trigger.flex.raw('1 1 auto');
				trigger.minWidth.px(0);
			});
		},
		variants: {
			invalid: {
				false: () => undefined,
				true: (s) => {
					s.outlineColor._danger;
					s.outlineStyle.solid;
					s.outlineWidth._hairline;
				}
			}
		},
		defaultVariants: { invalid: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabelAttribute,
		ariaLabel,
		class: className,
		clearable = false,
		clearLabel,
		controlId: controlIdProp,
		defaultExpandedKeys = [],
		defaultOpen = false,
		defaultValue = null,
		disabled: disabledProp = false,
		expandedKeys = $bindable(),
		form,
		gutter = 4,
		height = 320,
		invalid,
		item,
		itemSize = 36,
		matchWidth = true,
		name,
		nodes,
		onExpandedChange,
		onLoadChildren,
		onLoadError,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		overscan = 4,
		placeholder,
		placement = 'bottom-start',
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		size,
		treeLabel,
		value = $bindable(),
		valueLabel = (key, node) => node?.label ?? String(key),
		virtualized = false,
		...rest
	}: ZTreeSelectProps<TKey> = $props();

	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tree-select'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const required = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedTreeLabel = $derived(
		treeLabel ?? ariaLabelAttribute ?? ariaLabel ?? zui.localePack.collection.treeOptions
	);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.collection.selectNode);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.common.clear);
	const valueState = new ControllableState<TKey | null>({
		defaultValue: () => validateValue(defaultValue, 'defaultValue'),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const expandedState = new ControllableState<readonly TKey[]>({
		defaultValue: () => Object.freeze([...new Set(defaultExpandedKeys)]),
		onChange: () => onExpandedChange,
		read: () => expandedKeys,
		write: (next) => (expandedKeys = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let treeRef = $state<HTMLDivElement | null>(null);
	const currentValue = $derived(validateValue(valueState.current, 'value'));
	const resolvedOpen = $derived(openState.current && !disabled && !readonly);
	const selectedNode = $derived(
		currentValue === null ? undefined : nodes.find((node) => Object.is(node.key, currentValue))
	);
	const label = $derived(
		currentValue === null ? resolvedPlaceholder : valueLabel(currentValue, selectedNode)
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { invalid: resolvedInvalid }));

	function setOpen(next: boolean): void {
		if (next && (disabled || readonly)) return;
		openState.setFromUser(next);
	}

	function validateValue(next: TKey | null, name: string): TKey | null {
		if (typeof next === 'number' && (!Number.isFinite(next) || Object.is(next, -0))) {
			throw new TypeError(
				`ZTreeSelect ${name} must be null, a string or a finite number other than -0.`
			);
		}
		return next;
	}

	function clear(): void {
		if (!clearable || disabled || readonly || currentValue === null) return;
		valueState.setFromUser(null);
		setOpen(false);
		triggerRef?.focus({ preventScroll: true });
	}

	function resetFromForm(): void {
		valueState.reset();
		expandedState.reset();
		openState.reset();
	}

	function handleSelection(keys: readonly TKey[]): void {
		const next = keys[0];
		if (next === undefined || disabled || readonly) return;
		valueState.setFromUser(next);
		setOpen(false);
	}

	function preventReadonlyOpen(event: MouseEvent): void {
		if (readonly) event.preventDefault();
	}

	function handleTriggerKeydown(event: KeyboardEvent & { currentTarget: HTMLButtonElement }): void {
		if (event.defaultPrevented || disabled || readonly) return;
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
				event.preventDefault();
				setOpen(true);
				queueMicrotask(() => treeRef?.focus({ preventScroll: true }));
				break;
			case 'Backspace':
			case 'Delete':
				if (!resolvedOpen && clearable && currentValue !== null) {
					event.preventDefault();
					clear();
				}
				break;
		}
	}

	onDestroy(fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	data-slot="root"
	data-state={resolvedOpen ? 'open' : 'closed'}
	data-empty={currentValue === null || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={readonly || undefined}
>
	<ZPopover
		{gutter}
		{matchWidth}
		modal={false}
		onOpenChange={setOpen}
		open={resolvedOpen}
		{placement}
		triggerId={controlId}
	>
		<ZPopoverTrigger
			aria-describedby={describedBy}
			aria-invalid={resolvedInvalid || undefined}
			aria-label={ariaLabelAttribute ?? ariaLabel}
			aria-labelledby={field?.labelId}
			bind:ref={triggerRef}
			{disabled}
			fullWidth
			onclick={preventReadonlyOpen}
			onkeydown={handleTriggerKeydown}
			popupRole="tree"
			size={resolvedSize}
			variant="secondary"
			data-required={required || undefined}
			data-slot="trigger">{label}</ZPopoverTrigger
		>
		<ZPopoverContent ariaLabelledBy={null} initialFocus={() => treeRef} role="presentation">
			<ZTree
				appearance="bare"
				aria-label={resolvedTreeLabel}
				bind:ref={treeRef}
				disabled={disabled || readonly}
				disallowEmptySelection
				expandedKeys={expandedState.current}
				{height}
				{item}
				{itemSize}
				{nodes}
				onExpandedChange={(keys) => expandedState.setFromUser(keys)}
				{onLoadChildren}
				{onLoadError}
				onSelectionChange={handleSelection}
				{overscan}
				resetOnForm={false}
				selectedKeys={currentValue === null ? [] : [currentValue]}
				selectionMode="single"
				{virtualized}
				data-slot="tree"
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && currentValue !== null}
		<ZButton
			aria-label={resolvedClearLabel}
			data-slot="clear"
			disabled={disabled || readonly}
			size="small"
			variant="ghost"
			onclick={clear}
		>
			<X aria-hidden="true" size={14} />
		</ZButton>
	{/if}
</div>
<FormValueBridge
	{form}
	name={resolvedName}
	{disabled}
	onReset={resetFromForm}
	value={currentValue}
/>
