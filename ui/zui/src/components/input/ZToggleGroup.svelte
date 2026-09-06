<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZButtonProps } from '../gene/ZButton.svelte';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { SelectionKey, SelectionMode } from '../../runtime/collection/selection.js';
	import { defineRecipe } from '../../recipes/define.js';

	export interface ZToggleGroupItem<TKey extends SelectionKey = SelectionKey> {
		readonly disabled?: boolean;
		readonly label: string;
		readonly value: TKey;
	}

	export interface ZToggleGroupProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role' | 'tabindex' | 'aria-disabled' | 'aria-readonly'
	> {
		readonly allowEmpty?: boolean;
		readonly defaultValue?: readonly NoInfer<TKey>[];
		readonly disabled?: boolean;
		readonly form?: string;
		readonly item?: Snippet<[item: ZToggleGroupItem<TKey>, index: number]>;
		readonly items: readonly ZToggleGroupItem<TKey>[];
		readonly loop?: boolean;
		readonly name?: string;
		readonly onValueChange?: (value: readonly TKey[]) => void;
		readonly orientation?: 'horizontal' | 'vertical';
		readonly readonly?: boolean;
		readonly roving?: boolean;
		readonly selectionMode?: Extract<SelectionMode, 'multiple' | 'single'>;
		readonly shape?: ZButtonProps['shape'];
		readonly size?: ZControlSize;
		readonly tone?: ZButtonProps['tone'];
		readonly variant?: ZButtonProps['variant'];
		value?: readonly NoInfer<TKey>[];
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '当前typed选择数组。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: '真实group div引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'LogicalCollection',
			'SelectionModel',
			'CollectionNavigation',
			'MountedElements',
			'FormValueBridge',
			'ZButton'
		],
		events: [
			{
				description: '仅用户切换选择时调用；保留已选值顺序，新选择追加，owner同步或reset不通知。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			}
		],
		id: 'toggle-group',
		importStatement: "import { ZToggleGroup } from '@zadmin/zui';",
		keyboard: [
			{
				key: 'Arrow / Home / End',
				description: '在可用按钮间移动roving焦点，RTL自动反转横向箭头。'
			},
			{ key: 'Enter / Space', description: '由真实button click切换当前项；focus本身不改变选择。' }
		],
		name: 'ZToggleGroup',
		parts: [{ name: 'item', description: '真实可按button。' }],
		props: [
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Field → componentDefaults.toggleGroup → button → Provider density',
				description: '五档控制尺寸，Toolbar内默认继承工具栏尺寸。'
			},
			{
				name: 'tone',
				type: "'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger'",
				default: "componentDefaults.toggleGroup → button → 'primary'",
				description: '共享Button语义色；按下状态与语义色相互独立。'
			},
			{
				name: 'variant',
				type: "'solid' | 'outline' | 'ghost'",
				default: "componentDefaults.toggleGroup → button → 'outline'",
				description: '共享Button视觉层级和pressed样式。'
			},
			{
				name: 'shape',
				type: "'default' | 'square' | 'circle'",
				default: "componentDefaults.toggleGroup → button → 'default'",
				description: '按钮形状；图标内容仍须有可访问名称。'
			},
			{
				name: 'items',
				type: 'readonly ZToggleGroupItem<TKey>[]',
				default: '必填',
				required: true,
				description: '有序typed项目。',
				members: [
					{ name: 'value', type: 'TKey', required: true, description: '稳定typed选择身份。' },
					{ name: 'label', type: 'string', required: true, description: '默认按钮文本。' },
					{ name: 'disabled', type: 'boolean', required: false, description: '不可选择项目。' }
				]
			},
			{
				name: 'selectionMode',
				type: "'single' | 'multiple'",
				default: "'single'",
				description: '选择模型模式；single的value最多一个，非法owner值早抛。'
			},
			{
				name: 'value',
				type: 'readonly TKey[]',
				default: 'undefined',
				bindable: true,
				description: '受控或bindable选择数组；动态项目删除不静默改写owner。'
			},
			{
				name: 'defaultValue',
				type: 'readonly TKey[]',
				default: '[]',
				description: '非受控初始值和Form reset目标。'
			},
			{
				name: 'allowEmpty',
				type: 'boolean',
				default: 'true',
				description: 'false阻止用户清除最后一个已选项。'
			},
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: "'horizontal'",
				description: '视觉与方向键轴。'
			},
			{
				name: 'loop',
				type: 'boolean',
				default: 'true',
				description: 'roving=true时方向键在边界是否循环。'
			},
			{
				name: 'roving',
				type: 'boolean',
				default: 'true',
				description:
					'false保留每项原生Tab入口；实际位于Toolbar内时始终由Toolbar统一拥有roving焦点。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '禁用全部按钮和FormData。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: 'false',
				description: '保留焦点浏览，阻止用户选择变化。'
			},
			{ name: 'name', type: 'string', default: 'undefined', description: '重复FormData字段名称。' },
			{ name: 'form', type: 'string', default: 'undefined', description: '外部原生form id。' },
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实group div引用。'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[ZToggleGroupItem<TKey>, number]>',
				description: '只替换button内容，保留button与aria-pressed语义。'
			}
		],
		source: 'ui/zui/src/components/input/ZToggleGroup.svelte',
		states: [
			{ name: 'data-state', values: ['on', 'off'], description: '单项按下状态。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析后的五档尺寸。'
			},
			{
				name: 'data-orientation',
				values: ['horizontal', 'vertical'],
				description: '视觉布局方向。'
			},
			{ name: 'data-readonly', values: ['true'], description: '只读且仍可浏览焦点。' },
			{ name: 'data-selection-mode', values: ['single', 'multiple'], description: '选择模式。' }
		],
		status: 'experimental',
		summary:
			'以真实button aria-pressed 和 typed SelectionModel 构成的单/多选切换组，不伪装radiogroup。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.inlineFlex;
				s.gap._xsmall;
				s.minInlineSize.px(0);
				s.maxInlineSize.percent(100);
				s.flexWrap.wrap;
			},
			variants: {
				orientation: {
					horizontal: (s) => s.flexDirection.row,
					vertical: (s) => s.flexDirection.column
				}
			},
			defaultVariants: { orientation: 'horizontal' }
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey = SelectionKey">
	import { onDestroy, untrack } from 'svelte';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';
	import ZButton from '../gene/ZButton.svelte';
	import { CollectionNavigation } from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../runtime/collection/selection-model.js';
	import { assertSelectionKey, type Selection } from '../../runtime/collection/selection.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import {
		containsComposedNode,
		getActiveElement,
		getElementDirection
	} from '../../runtime/layer/dom-realm.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { useOptionalZToolbar } from '../compound/toolbar/context.svelte.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-invalid': ariaInvalid,
		allowEmpty = true,
		class: className,
		dir,
		defaultValue = [],
		disabled: disabledProp = false,
		form,
		id,
		item,
		items,
		loop = true,
		name: nameProp,
		onValueChange,
		orientation = 'horizontal',
		onkeydown,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		roving = true,
		selectionMode = 'single',
		shape,
		size,
		style,
		tone,
		variant,
		value = $bindable(),
		...rest
	}: ZToggleGroupProps<TKey> = $props();
	const zui = useZui();
	const toolbar = useOptionalZToolbar();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'toggle-group'));
	const delegated = $derived(toolbar !== undefined && (ref === null || toolbar.owns(ref)));
	const resolvedOrientation = $derived.by(() => {
		if (orientation !== 'horizontal' && orientation !== 'vertical')
			throw new TypeError('ZToggleGroup orientation must be horizontal or vertical.');
		return orientation;
	});
	const rootClass = $derived(zui.recipe(rootRecipe, { orientation: resolvedOrientation }));
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const controlId = $derived(id ?? field?.controlId ?? idBase);
	const disabled = $derived(
		disabledProp || (field?.disabled ?? false) || (delegated && toolbar!.disabled)
	);
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const defaults = $derived(zui.componentDefaults.toggleGroup);
	const buttonDefaults = $derived(zui.componentDefaults.button);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				(delegated ? toolbar!.size : undefined) ??
				defaults?.size ??
				buttonDefaults?.size,
			zui.density
		)
	);
	const resolvedTone = $derived(tone ?? defaults?.tone ?? buttonDefaults?.tone ?? 'primary');
	const resolvedVariant = $derived(
		variant ?? defaults?.variant ?? buttonDefaults?.variant ?? 'outline'
	);
	const resolvedShape = $derived(shape ?? defaults?.shape ?? buttonDefaults?.shape ?? 'default');
	const resolvedName = $derived(nameProp ?? field?.name);
	const sourceItems = $derived.by(() => {
		const keys = new Set<TKey>();
		if (!Array.isArray(items)) throw new TypeError('ZToggleGroup requires an items array.');
		for (const entry of items) {
			assertSelectionKey(entry.value, 'ZToggleGroup');
			if (keys.has(entry.value)) throw new TypeError('ZToggleGroup items require unique keys.');
			keys.add(entry.value);
			if (typeof entry.label !== 'string')
				throw new TypeError('ZToggleGroup items require a string label.');
		}
		return items;
	});
	const collection = $derived(
		new LogicalCollection<TKey, ZToggleGroupItem<TKey>>(
			sourceItems,
			{
				key: (item) => item.value,
				disabled: (item) => item.disabled ?? false,
				textValue: (item) => item.label
			},
			{ name: 'ZToggleGroup items' }
		)
	);
	const view = $derived(collection.full);
	const valueState = new ControllableState<readonly TKey[]>({
		defaultValue: () => Object.freeze([...validateValue(defaultValue)]),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedSelectionMode = $derived.by(() => {
		if (selectionMode !== 'single' && selectionMode !== 'multiple')
			throw new TypeError('ZToggleGroup selectionMode must be single or multiple.');
		validateValue(defaultValue);
		validateValue(valueState.current);
		return selectionMode;
	});
	function validateValue(values: readonly TKey[]): readonly TKey[] {
		if (!Array.isArray(values)) throw new TypeError('ZToggleGroup value must be an array.');
		const seen = new Set<TKey>();
		for (const key of values) {
			assertSelectionKey(key, 'ZToggleGroup value');
			if (seen.has(key)) throw new TypeError('ZToggleGroup value keys must be unique.');
			seen.add(key);
		}
		if (selectionMode === 'single' && values.length > 1)
			throw new TypeError('ZToggleGroup single mode accepts at most one value.');
		return values;
	}
	let activeKey = $state<TKey>();
	let lastFocusedKey = $state<TKey>();
	const mounted = new MountedElements<TKey, HTMLButtonElement>();
	const navigation = new CollectionNavigation<TKey, ZToggleGroupItem<TKey>>({
		direction: () => getElementDirection(ref, zui.direction),
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => orientation,
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	function readSelection(): Selection<TKey> {
		return new Set(valueState.current);
	}
	function writeSelection(next: Selection<TKey>): void {
		if (next === 'all') return;
		const values = Object.freeze([...next]);
		if (selectionMode === 'single' && values.length > 1)
			throw new TypeError('ZToggleGroup single mode accepts at most one value.');
		valueState.setFromUser(values);
	}
	const selection = new SelectionModel<TKey, ZToggleGroupItem<TKey>>({
		collection: () => collection,
		disallowEmpty: () => !allowEmpty,
		mode: () => resolvedSelectionMode,
		orphanPolicy: () => 'preserve',
		read: readSelection,
		view: () => view,
		write: ({ selection: next }) => writeSelection(next)
	});
	const formEntries = $derived(
		resolvedName === undefined
			? []
			: valueState.current.map((key) => [resolvedName, String(key)] as const)
	);
	function toggle(key: TKey): void {
		if (disabled || readonly) return;
		selection.toggle(key);
		navigation.set(key, 'pointer');
	}
	function click(key: TKey, event: MouseEvent): void {
		if (event.defaultPrevented) return;
		toggle(key);
	}
	function keydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.keyCode === 229 ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			delegated ||
			!roving ||
			!navigation.handleKey(event)
		)
			return;
		const key = navigation.currentKey;
		if (key !== undefined) mounted.focus(key);
	}
	function tabIndex(key: TKey): 0 | -1 {
		const itemDisabled = disabled || Boolean(view.get(key)?.disabled);
		if (delegated) return toolbar!.tabIndex(toolbarKey(key), itemDisabled);
		if (itemDisabled) return -1;
		return !roving || Object.is(preferredKey(), key) ? 0 : -1;
	}
	function preferredKey(): TKey | undefined {
		return (
			navigation.currentKey ??
			valueState.current.find((key) => {
				const entry = view.get(key);
				return entry && !entry.disabled;
			}) ??
			view.first()
		);
	}
	function toolbarKey(key: TKey): string {
		return `${idBase}:${typeof key}:${JSON.stringify(key)}`;
	}
	const attachmentKey = createAttachmentKey();
	// Stable per-key attachments do not restart when selection or tabindex changes.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Attachment identities are a cache, not rendered state.
	const attachments = new Map<TKey, Readonly<Record<symbol, Attachment<Element>>>>();
	function attachment(key: TKey): Readonly<Record<symbol, Attachment<Element>>> {
		let current = attachments.get(key);
		if (!current) {
			current = {
				[attachmentKey]: (node) => {
					const button = node as HTMLButtonElement;
					const dispose = untrack(() => mounted.mount(key, button, toolbarKey(key)));
					$effect(() => {
						if (!delegated || !toolbar) return;
						const registration = {
							key: toolbarKey(key),
							element: button,
							keyPolicy: 'toolbar' as const,
							disabled: disabled || Boolean(view.get(key)?.disabled),
							textValue: view.get(key)?.textValue ?? String(key),
							selectionDisabled: true
						};
						return toolbar.register(() => registration);
					});
					return dispose;
				}
			};
			attachments.set(key, current);
		}
		return current;
	}
	function reset(): void {
		valueState.reset();
		selection.resetTransient();
	}
	let beforeFocus: Element | null = null;
	$effect.pre(() => {
		view;
		disabled;
		roving;
		delegated;
		untrack(() => {
			const active = ref ? getActiveElement(ref) : null;
			beforeFocus = containsComposedNode(ref, active) ? active : null;
		});
	});
	$effect(() => {
		resolvedSelectionMode;
		const currentView = view;
		const enabledRoving = roving && !delegated;
		disabled;
		untrack(() => {
			for (const key of attachments.keys()) if (!currentView.get(key)) attachments.delete(key);
			const previous = lastFocusedKey;
			if (enabledRoving && navigation.currentKey === undefined && previous === undefined) {
				const preferred = preferredKey();
				if (preferred !== undefined) navigation.set(preferred, 'collection-change');
			}
			const key = navigation.reconcile();
			const active = ref ? getActiveElement(ref) : null;
			const canRepair =
				beforeFocus &&
				ref &&
				(active === beforeFocus ||
					active === ref.ownerDocument.body ||
					active === ref.ownerDocument.documentElement ||
					active === ref);
			beforeFocus = null;
			if (enabledRoving && canRepair && previous !== undefined && key !== previous) {
				if (key !== undefined) mounted.scheduleFocus(key);
				else ref?.focus({ preventScroll: true });
			}
		});
	});
	$effect(() =>
		fieldOwner.registerFocusOwner(() => {
			const key = preferredKey();
			if (key !== undefined && !disabled) mounted.focus(key);
		})
	);
	onDestroy(() => {
		mounted.clear();
		attachments.clear();
	});
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	id={controlId}
	dir={dir ?? zui.direction}
	tabindex={-1}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-label={ariaLabel}
	aria-labelledby={mergeAriaIds(
		ariaLabelledBy,
		ariaLabel === undefined ? field?.labelId : undefined
	)}
	aria-describedby={mergeAriaIds(ariaDescribedBy, field?.describedBy)}
	aria-disabled={disabled || undefined}
	aria-invalid={ariaInvalid ?? (field?.invalid || undefined)}
	data-readonly={readonly || undefined}
	data-selection-mode={resolvedSelectionMode}
	data-size={resolvedSize}
	data-orientation={resolvedOrientation}
	onkeydown={keydown}
>
	{#each view.items as record, index (record.key)}
		{@const selected = selection.isSelected(record.key)}
		<ZButton
			{...attachment(record.key)}
			aria-pressed={selected}
			data-slot="item"
			data-state={selected ? 'on' : 'off'}
			disabled={disabled || record.disabled}
			shape={resolvedShape}
			tone={resolvedTone}
			variant={resolvedVariant}
			fullWidth={false}
			size={resolvedSize}
			tabindex={tabIndex(record.key)}
			onfocus={() => {
				lastFocusedKey = record.key;
				navigation.set(record.key, 'pointer');
				if (delegated) toolbar!.focus(toolbarKey(record.key), 'pointer');
			}}
			onclick={(event) => click(record.key, event)}
			>{#if item}{@render item(record.value, index)}{:else}{record.value.label}{/if}</ZButton
		>
	{/each}
</div>
<FormValueBridge {disabled} entries={formEntries} {form} onReset={reset} />
