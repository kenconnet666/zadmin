<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';

	export interface ZTagsInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly addLabel?: string;
		readonly allowDuplicates?: boolean;
		readonly children?: Snippet<[value: string]>;
		readonly commitOnBlur?: boolean;
		readonly controlId?: string;
		readonly defaultValue?: readonly string[];
		/** @deprecated Use `defaultValue`. */
		readonly defaultValues?: readonly string[];
		readonly defaultInputValue?: string;
		readonly delimiters?: readonly string[];
		readonly disabled?: boolean;
		readonly editable?: boolean;
		readonly editLabel?: (value: string) => string;
		readonly form?: string;
		inputRef?: HTMLInputElement | null;
		inputValue?: string;
		readonly invalid?: boolean;
		readonly maxTags?: number;
		readonly maxVisibleTags?: number;
		readonly name?: string;
		readonly onInputValueChange?: (value: string) => void;
		readonly onValueChange?: (value: readonly string[]) => void;
		readonly overflowLabel?: (omitted: readonly string[]) => string;
		readonly placeholder?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly removeLabel?: (value: string) => string;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly transform?: (value: string) => string;
		readonly validate?: (value: string) => boolean;
		value?: readonly string[];
		/** @deprecated Use `value`. */
		values?: readonly string[];
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'tags-input',
		importStatement: "import { ZTagsInput } from '@zadmin/zui';",
		name: 'ZTagsInput',
		bindings: [
			{ description: '当前有序文本标签。', name: 'value', type: 'readonly string[]' },
			{
				description: 'deprecated value兼容绑定别名；不得与value同时传入。',
				name: 'values',
				type: 'readonly string[]',
				deprecatedSince: 'unreleased',
				replacement: 'value'
			},
			{ description: '当前受控草稿。', name: 'inputValue', type: 'string' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实草稿input引用。', name: 'inputRef', type: 'HTMLInputElement | null' }
		],
		dependencies: [
			'LogicalCollection',
			'CollectionNavigation',
			'ZTag',
			'native text input',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户新增、移除、编辑或粘贴后调用一次。',
				name: 'onValueChange',
				type: '(values: readonly string[]) => void'
			},
			{
				description: '用户草稿变化后调用。',
				name: 'onInputValueChange',
				type: '(value: string) => void'
			}
		],
		keyboard: [
			{ description: '提交非空草稿或标签编辑。', key: 'Enter / configured delimiter' },
			{ description: '空草稿时删除最后标签。', key: 'Backspace' },
			{
				description: '从空草稿进入标签，或在标签操作间按逻辑方向移动。',
				key: 'ArrowLeft / ArrowRight / Home / End'
			},
			{ description: '删除当前键盘标签。', key: 'Delete / Backspace' },
			{ description: '批量解析分隔文本且只通知一次。', key: 'Paste' },
			{ description: '退出当前标签编辑并恢复草稿焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '完整TagsInput边界。', name: 'root' },
			{ description: '复用ZTag的单个标签。', name: 'tag' },
			{ description: '标签编辑操作。', name: 'edit' },
			{ description: '当前标签编辑输入。', name: 'edit-input' },
			{ description: 'ZTag标签删除操作。', name: 'remove' },
			{ description: '未渲染标签数量。', name: 'overflow' },
			{ description: '草稿input。', name: 'input' }
		],
		props: [
			{
				default: 'localePack.tagsInput.addTag',
				description: '新增标签输入的可访问名称。',
				name: 'addLabel',
				type: 'string'
			},
			{
				default: 'Field controlId或生成ID',
				description: '真实草稿input的稳定id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'localePack.tagsInput.editTag(value)',
				description: '标签编辑操作的可访问名称。',
				name: 'editLabel',
				type: '(value: string) => string'
			},
			{
				default: '最近祖先form',
				description: '关联原生form；未显式提供时使用最近祖先form。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: 'Field invalid或显式invalid共同投射到根和草稿input。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'omitted => `+${omitted.length}`',
				description: '折叠标签的可访问摘要文案。',
				name: 'overflowLabel',
				type: '(omitted: readonly string[]) => string'
			},
			{
				default: 'localePack.tagsInput.addTag',
				description: '草稿input的placeholder；不改变FormData。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'localePack.tagsInput.removeTag(value)',
				description: '标签删除操作的可访问名称。',
				name: 'removeLabel',
				type: '(value: string) => string'
			},
			{
				default: 'Field context或false',
				description: 'Field required或显式required投射到草稿input。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field size，其次为Provider density',
				description: '解析后的small/medium/large控制尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				bindable: true,
				default: '[]',
				description: '有序文本标签集合；string-only是文本创建/编辑的明确边界。',
				name: 'value',
				type: 'readonly string[]'
			},
			{
				default: '[]',
				description: '非受控初始标签与form reset目标。',
				name: 'defaultValue',
				type: 'readonly string[]'
			},
			{
				default: 'undefined',
				description: 'deprecated values兼容别名；不得与value同时传入。',
				name: 'values',
				type: 'readonly string[]',
				deprecatedSince: 'unreleased',
				replacement: 'value'
			},
			{
				default: 'undefined',
				description: 'deprecated defaultValues兼容别名；不得与defaultValue同时传入。',
				name: 'defaultValues',
				type: 'readonly string[]',
				deprecatedSince: 'unreleased',
				replacement: 'defaultValue'
			},
			{
				bindable: true,
				default: "''",
				description: '独立受控草稿；不会进入FormData。',
				name: 'inputValue',
				type: 'string'
			},
			{
				default: "''",
				description: '非受控初始草稿与form reset目标；不会进入FormData。',
				name: 'defaultInputValue',
				type: 'string'
			},
			{
				default: "[',']",
				description: '提交与粘贴使用的非空分隔符。',
				name: 'delimiters',
				type: 'readonly string[]'
			},
			{
				default: 'Infinity',
				description: '最大业务标签数量；外部超限会报错而非静默截断。',
				name: 'maxTags',
				type: 'number'
			},
			{
				default: 'Infinity',
				description: '最多渲染的可见ZTag数量；其余值以overflow摘要保留。',
				name: 'maxVisibleTags',
				type: 'number'
			},
			{
				default: 'false',
				description: '允许相同文本出现多次；重复项仍按顺序独立删除。',
				name: 'allowDuplicates',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '整体失焦时是否提交草稿。',
				name: 'commitOnBlur',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '显示键盘可达的编辑操作；编辑仍复用相同transform/validate/duplicate合同。',
				name: 'editable',
				type: 'boolean'
			},
			{
				default: 'value.trim()',
				description: '只作用于用户新增和编辑文本，不重写外部owner数组。',
				name: 'transform',
				type: '(value: string) => string'
			},
			{
				default: 'undefined',
				description: '用户新增或编辑标签的业务校验。',
				name: 'validate',
				type: '(value: string) => boolean'
			},
			{
				default: 'Field context',
				description: '每个标签重复使用的FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'false',
				description: '保留输入、标签与FormData，禁止新增、编辑和移除。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用输入和操作并移除FormData。',
				name: 'disabled',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '自定义标签可见正文，参数为value；ZTag和操作语义仍由组件拥有。',
				name: 'children',
				type: 'Snippet<[value: string]>'
			}
		],
		source: 'ui/zui/src/components/input/ZTagsInput.svelte',
		states: [
			{ description: '达到业务标签上限。', name: 'data-full', values: ['true'] },
			{ description: '草稿或标签编辑无效。', name: 'data-invalid', values: ['true'] },
			{ description: '正在编辑现有标签。', name: 'data-editing', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析后的control尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			}
		],
		status: 'stable',
		summary:
			'以string-only文本标签、独立草稿、ZTag复用、键盘标签导航、批量粘贴、可选编辑、overflow和统一表单合同组成的TagsInput。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import PenLine from '@lucide/svelte/icons/pen-line';
	import { onMount, untrack } from 'svelte';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { navigationIntent } from '../../runtime/collection/list-navigation.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { isDomElement, isDomNode } from '../../runtime/layer/dom-realm.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import ZTag from '../data-display/ZTag.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import { styleInternalFocusWithinRing } from '../gene/internal-action.js';
	import ZInput from './ZInput.svelte';

	interface TagRecord {
		readonly key: number;
		readonly value: string;
	}

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			styleInternalFocusWithinRing(s);
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: { false: () => undefined, true: (s) => s.borderColor._danger },
			size: {
				large: (s) => s.padding._medium,
				medium: (s) => s.padding._small,
				small: (s) => s.padding._xsmall
			}
		},
		defaultVariants: { disabled: false, invalid: false, size: 'medium' }
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.flex.raw('1 1 8rem');
			s.minWidth.rem(8);
			s.outlineStyle.none;
			s.width._full;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
		},
		variants: {
			size: {
				large: (s) => {
					s.fontSize._large;
					s.padding._medium;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.padding._small;
				},
				small: (s) => {
					s.fontSize._small;
					s.padding._xsmall;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const editRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.minHeight.px(0);
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [rootRecipe, inputRecipe, editRecipe])
		registerRecipeHmr(import.meta, recipe);

	function finiteLimit(value: number, name: string): number {
		if (value === Number.POSITIVE_INFINITY) return value;
		if (!Number.isInteger(value) || value < 0)
			throw new TypeError(`${name} must be a non-negative integer.`);
		return value;
	}
	function normalizeValues(
		source: readonly string[],
		allowDuplicates: boolean,
		maxTags: number
	): readonly string[] {
		const normalized = source
			.map((value) => value.trim())
			.filter(
				(value, index, all) => value.length > 0 && (allowDuplicates || all.indexOf(value) === index)
			);
		if (normalized.length > maxTags) {
			throw new RangeError(
				`ZTagsInput received ${normalized.length} values but maxTags is ${maxTags}.`
			);
		}
		return Object.freeze(normalized);
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		addLabel,
		allowDuplicates = false,
		children,
		class: className,
		commitOnBlur = true,
		controlId,
		defaultValue,
		defaultValues,
		defaultInputValue = '',
		delimiters = [','],
		disabled = false,
		editable = false,
		editLabel,
		form,
		inputRef = $bindable(null),
		inputValue = $bindable(),
		invalid,
		maxTags = Number.POSITIVE_INFINITY,
		maxVisibleTags = Number.POSITIVE_INFINITY,
		name,
		onInputValueChange,
		onValueChange,
		overflowLabel = (omitted) => `+${omitted.length}`,
		placeholder,
		readonly = false,
		ref = $bindable(null),
		removeLabel,
		required = false,
		size,
		style,
		transform,
		validate,
		value = $bindable(),
		values = $bindable(),
		...rest
	}: ZTagsInputProps = $props();
	function assertPublicContract(): void {
		if (value !== undefined && values !== undefined) {
			throw new TypeError('ZTagsInput value and deprecated values are mutually exclusive.');
		}
		if (defaultValue !== undefined && defaultValues !== undefined) {
			throw new TypeError(
				'ZTagsInput defaultValue and deprecated defaultValues are mutually exclusive.'
			);
		}
	}
	assertPublicContract();
	$effect(assertPublicContract);
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const resolvedAddLabel = $derived(addLabel ?? zui.localePack.tagsInput.addTag);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.tagsInput.addTag);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedMaxTags = $derived(finiteLimit(maxTags, 'ZTagsInput maxTags'));
	const resolvedMaxVisibleTags = $derived(finiteLimit(maxVisibleTags, 'ZTagsInput maxVisibleTags'));
	const resolvedDelimiters = $derived.by(() => {
		const result = [...new Set(delimiters)];
		if (result.some((delimiter) => delimiter.length === 0)) {
			throw new TypeError('ZTagsInput delimiters must not contain empty strings.');
		}
		return Object.freeze(result);
	});
	const uid = $props.id();
	const inputId = $derived(
		controlId ?? field?.controlId ?? createZuiId(zui.idPrefix, uid, 'tags-input')
	);
	const valueState = new ControllableState<readonly string[]>({
		defaultValue: () =>
			normalizeValues(defaultValue ?? defaultValues ?? [], allowDuplicates, resolvedMaxTags),
		onChange: () => onValueChange,
		read: () => value ?? values,
		write: (next) => {
			if (value !== undefined || values === undefined) value = next;
			else values = next;
		}
	});
	const draftState = new ControllableState<string>({
		defaultValue: () => defaultInputValue,
		onChange: () => onInputValueChange,
		read: () => inputValue,
		write: (next) => (inputValue = next)
	});
	const resolvedValues = $derived(
		normalizeValues(valueState.current, allowDuplicates, resolvedMaxTags)
	);
	let identityValues: readonly string[] = [];
	let identityKeys: readonly number[] = [];
	let nextIdentityKey = 0;
	let pendingIdentity: { values: readonly string[]; keys: readonly number[] } | undefined;
	const identityRecords = $derived.by(() => {
		const nextValues = resolvedValues;
		const previousValues = identityValues;
		const previousKeys = identityKeys;
		const operation = pendingIdentity;
		let nextKeys: readonly number[];
		if (
			operation &&
			operation.values.length === nextValues.length &&
			operation.values.every((value, index) => value === nextValues[index])
		) {
			nextKeys = operation.keys;
			pendingIdentity = undefined;
		} else {
			const used = previousValues.map(() => false);
			const computedKeys = nextValues.map((value) => {
				for (let previousIndex = 0; previousIndex < previousValues.length; previousIndex += 1) {
					const key = previousKeys[previousIndex];
					if (
						!used[previousIndex] &&
						key !== undefined &&
						previousValues[previousIndex] === value
					) {
						used[previousIndex] = true;
						return key;
					}
				}
				return nextIdentityKey++;
			});
			nextKeys = computedKeys;
			pendingIdentity = undefined;
		}
		identityValues = nextValues;
		identityKeys = Object.freeze([...nextKeys]);
		return Object.freeze(
			nextValues.map((value, index) => Object.freeze({ key: nextKeys[index]!, value }))
		);
	});
	function queueIdentity(nextValues: readonly string[], nextKeys: readonly number[]): void {
		const frozenKeys = Object.freeze([...nextKeys]);
		// Publish the operation-aware mapping before the controlled write so the
		// synchronous derived reconciliation cannot render a transient key set.
		identityValues = nextValues;
		identityKeys = frozenKeys;
		pendingIdentity = { values: nextValues, keys: frozenKeys };
	}
	const records = $derived(
		Object.freeze(resolvedValues.map((value, key) => Object.freeze({ key, value })))
	);
	const collection = $derived(
		new LogicalCollection<number, TagRecord>(
			records,
			{ key: (record) => record.key, textValue: (record) => record.value },
			{ name: 'ZTagsInput tags' }
		)
	);
	const navigation = new CollectionNavigation<number, TagRecord>({
		direction: () => zui.direction,
		disabled: () => resolvedDisabled || resolvedReadonly,
		loop: () => false,
		orientation: () => 'horizontal',
		view: () => collection.full
	});
	const full = $derived(resolvedValues.length >= resolvedMaxTags);
	let focusWithin = $state(false);
	const visibleLimit = $derived(focusWithin ? Number.POSITIVE_INFINITY : resolvedMaxVisibleTags);
	const visibleValues = $derived(identityRecords.slice(0, visibleLimit));
	const omittedValues = $derived(resolvedValues.slice(visibleLimit));
	let editingIndex = $state<number>();
	let editingSnapshot = $state<readonly string[]>();
	let editDraft = $state('');
	let editInvalid = $state(false);
	let editInputRef = $state<HTMLInputElement | null>(null);
	let draftInvalid = $state(false);
	const resolvedInvalid = $derived(
		draftInvalid || editInvalid || (invalid ?? field?.invalid ?? false)
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			size: resolvedSize
		})
	);
	const inputClass = $derived(zui.recipe(inputRecipe, { size: resolvedSize }));
	const editClass = $derived(zui.recipe(editRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function prepare(raw: string): string {
		return (transform?.(raw) ?? raw).trim();
	}
	function isAllowed(candidate: string, excludeIndex?: number): boolean {
		if (!candidate || validate?.(candidate) === false) return false;
		return (
			allowDuplicates ||
			!resolvedValues.some((value, index) => index !== excludeIndex && value === candidate)
		);
	}
	function parse(raw: string): string[] {
		const escaped = resolvedDelimiters.map((value) =>
			value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
		);
		return escaped.length === 0 ? [raw] : raw.split(new RegExp(escaped.join('|'), 'u'));
	}
	function add(raw: string): boolean {
		const candidate = prepare(raw);
		if (resolvedDisabled || resolvedReadonly || full || !isAllowed(candidate)) {
			draftInvalid = candidate.length > 0;
			return false;
		}
		const next = Object.freeze([...resolvedValues, candidate]);
		queueIdentity(next, [...identityKeys, nextIdentityKey++]);
		valueState.setFromUser(next);
		draftInvalid = false;
		return true;
	}
	function clearDraft(): void {
		draftState.setFromUser('');
		if (inputRef) inputRef.value = '';
	}
	function commitDraft(raw = draftState.current): void {
		if (add(raw)) clearDraft();
	}
	function remove(index: number, restoreFocus = false): void {
		if (resolvedDisabled || resolvedReadonly || index < 0 || index >= resolvedValues.length) return;
		const next = Object.freeze(resolvedValues.filter((_, itemIndex) => itemIndex !== index));
		queueIdentity(
			next,
			identityKeys.filter((_, itemIndex) => itemIndex !== index)
		);
		valueState.setFromUser(next);
		navigation.set(undefined, 'programmatic');
		if (editingIndex === index) cancelEdit();
		if (restoreFocus) {
			queueMicrotask(() => {
				if (next.length === 0) focusInput();
				else focusTag(Math.min(index, next.length - 1));
			});
		}
	}
	function getRemoveLabel(value: string): string {
		return removeLabel?.(value) ?? zui.localePack.tagsInput.removeTag(value);
	}
	function getEditLabel(value: string): string {
		return editLabel?.(value) ?? zui.localePack.tagsInput.editTag(value);
	}
	function focusInput(): void {
		inputRef?.focus({ preventScroll: true });
	}
	function focusTag(index: number): boolean {
		const tag = ref?.querySelector<HTMLElement>(`[data-tag-index="${index}"]`);
		const target = tag?.querySelector<HTMLElement>('[data-slot="edit"], [data-slot="remove"]');
		if (!target) return false;
		navigation.set(index, 'programmatic');
		target.focus({ preventScroll: true });
		return true;
	}
	function beginEdit(index: number): void {
		if (!editable || resolvedDisabled || resolvedReadonly) return;
		editingSnapshot = Object.freeze([...resolvedValues]);
		editingIndex = index;
		editDraft = resolvedValues[index] ?? '';
		editInvalid = false;
	}
	function cancelEdit(): void {
		editingIndex = undefined;
		editingSnapshot = undefined;
		editDraft = '';
		editInvalid = false;
		queueMicrotask(focusInput);
	}
	function commitEdit(): boolean {
		const index = editingIndex;
		if (index === undefined) return false;
		const candidate = prepare(editDraft);
		if (!isAllowed(candidate, index)) {
			editInvalid = true;
			return false;
		}
		if (candidate !== resolvedValues[index]) {
			const next = [...resolvedValues];
			next[index] = candidate;
			queueIdentity(next, identityKeys);
			valueState.setFromUser(Object.freeze(next));
		}
		editingIndex = undefined;
		editingSnapshot = undefined;
		editDraft = '';
		editInvalid = false;
		queueMicrotask(focusInput);
		return true;
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		draftInvalid = false;
		const next = event.currentTarget.value;
		draftState.setFromUser(next);
	}
	function handleInputKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (isKeyboardComposing(event)) return;
		switch (event.key) {
			case 'Enter':
				event.preventDefault();
				commitDraft(event.currentTarget.value);
				return;
			case 'Backspace':
				if (resolvedDelimiters.includes(event.key)) {
					event.preventDefault();
					commitDraft(event.currentTarget.value);
					return;
				}
				if (event.currentTarget.value.length === 0 && resolvedValues.length > 0) {
					event.preventDefault();
					remove(resolvedValues.length - 1);
					return;
				}
				break;
			default:
				if (resolvedDelimiters.includes(event.key)) {
					event.preventDefault();
					commitDraft(event.currentTarget.value);
					return;
				}
		}
		const intent = navigationIntent(event.key, 'horizontal', zui.direction);
		if (
			intent === 'previous' &&
			event.currentTarget.value.length === 0 &&
			event.currentTarget.selectionStart === 0 &&
			resolvedValues.length > 0
		) {
			event.preventDefault();
			focusTag(resolvedValues.length - 1);
		}
	}
	function handleRootKeydown(event: KeyboardEvent): void {
		if (isKeyboardComposing(event) || !isDomElement(event.target)) return;
		if (event.target.closest('[data-slot="edit-input"]')) return;
		const tag = event.target.closest<HTMLElement>('[data-tag-index]');
		const index = Number(tag?.dataset.tagIndex);
		if (!tag || !Number.isInteger(index)) return;
		switch (event.key) {
			case 'Delete':
			case 'Backspace':
				event.preventDefault();
				remove(index, true);
				return;
			case 'Enter':
				if (editable && event.target.closest('[data-slot="edit"]')) {
					event.preventDefault();
					beginEdit(index);
					return;
				}
				break;
		}
		const intent = navigationIntent(event.key, 'horizontal', zui.direction);
		if (!intent) return;
		event.preventDefault();
		navigation.set(index, 'programmatic');
		const next = navigation.move(intent);
		if (next === undefined || (next === index && intent === 'next')) focusInput();
		else focusTag(next);
	}
	function handlePaste(event: ClipboardEvent & { currentTarget: HTMLInputElement }): void {
		const text = event.clipboardData?.getData('text');
		if (!text || !resolvedDelimiters.some((delimiter) => text.includes(delimiter))) return;
		event.preventDefault();
		if (resolvedDisabled || resolvedReadonly || full) return;
		const next = [...resolvedValues];
		for (const raw of parse(text)) {
			const candidate = prepare(raw);
			if (
				!candidate ||
				next.length >= resolvedMaxTags ||
				validate?.(candidate) === false ||
				(!allowDuplicates && next.includes(candidate))
			)
				continue;
			next.push(candidate);
		}
		if (next.length > resolvedValues.length) {
			queueIdentity(next, [
				...identityKeys,
				...next.slice(resolvedValues.length).map(() => nextIdentityKey++)
			]);
			valueState.setFromUser(Object.freeze(next));
			clearDraft();
			draftInvalid = false;
		}
	}
	function handleInputBlur(event: FocusEvent & { currentTarget: HTMLInputElement }): void {
		if (commitOnBlur && (!isDomNode(event.relatedTarget) || !ref?.contains(event.relatedTarget)))
			commitDraft(event.currentTarget.value);
	}
	function handleFocusIn(): void {
		focusWithin = true;
	}
	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		if (!isDomNode(event.relatedTarget) || !event.currentTarget.contains(event.relatedTarget)) {
			focusWithin = false;
		}
	}
	function resetFromForm(): void {
		valueState.reset();
		draftState.reset();
		if (inputRef) inputRef.value = '';
		navigation.set(undefined, 'programmatic');
		editingIndex = undefined;
		editingSnapshot = undefined;
		editDraft = '';
		draftInvalid = false;
		editInvalid = false;
	}

	onMount(() => fieldOwner.registerFocusOwner(focusInput));
	$effect(() => {
		if (editingIndex === undefined || !editInputRef) return;
		editInputRef.focus({ preventScroll: true });
		editInputRef.select();
	});
	$effect(() => {
		const snapshot = editingSnapshot;
		if (
			editingIndex !== undefined &&
			snapshot !== undefined &&
			(snapshot.length !== resolvedValues.length ||
				snapshot.some((value, index) => value !== resolvedValues[index]))
		) {
			cancelEdit();
		}
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={resolvedDisabled || undefined}
	aria-label={resolvedLabelledBy ? undefined : ariaLabel}
	aria-labelledby={resolvedLabelledBy}
	data-disabled={resolvedDisabled || undefined}
	data-editing={editingIndex !== undefined || undefined}
	data-full={full || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={resolvedSize}
	data-slot="root"
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onkeydown={handleRootKeydown}
>
	{#each visibleValues as record, index (record.key)}
		{@const tag = record.value}
		{#if editingIndex === index}
			<ZTag data-slot="tag" data-tag-index={index} tone={editInvalid ? 'danger' : 'default'}>
				<ZInput
					aria-label={getEditLabel(tag)}
					bind:ref={editInputRef}
					bind:value={editDraft}
					data-slot="edit-input"
					name=""
					resetOnForm={false}
					size="small"
					onblur={() => {
						if (!commitEdit()) cancelEdit();
					}}
					oninput={() => (editInvalid = false)}
					onkeydown={(event) => {
						if (isKeyboardComposing(event)) return;
						switch (event.key) {
							case 'Enter':
								event.preventDefault();
								commitEdit();
								break;
							case 'Escape':
								event.preventDefault();
								cancelEdit();
								break;
						}
					}}
				/>
			</ZTag>
		{:else}
			<ZTag
				data-slot="tag"
				data-tag-index={index}
				disabled={resolvedDisabled || resolvedReadonly}
				onRemove={() => remove(index)}
				removable={!resolvedReadonly}
				removeLabel={getRemoveLabel(tag)}
				removeTabIndex={-1}
			>
				{#if children}{@render children(tag)}{:else}{tag}{/if}
				{#if editable && !resolvedDisabled && !resolvedReadonly}
					<ZButton
						aria-label={getEditLabel(tag)}
						class={editClass}
						data-slot="edit"
						onclick={() => beginEdit(index)}
						shape="square"
						size="small"
						tabindex={-1}
						title={getEditLabel(tag)}
						variant="ghost"
					>
						<PenLine aria-hidden="true" size={13} />
					</ZButton>
				{/if}
			</ZTag>
		{/if}
	{/each}
	{#if omittedValues.length > 0}
		<ZTag data-slot="overflow">{overflowLabel(omittedValues)}</ZTag>
	{/if}
	<input
		bind:this={inputRef}
		class={inputClass}
		id={inputId}
		type="text"
		aria-describedby={resolvedDescribedBy}
		aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
		aria-label={resolvedAddLabel}
		aria-required={resolvedRequired || undefined}
		data-slot="input"
		value={draftState.current}
		placeholder={resolvedPlaceholder}
		disabled={resolvedDisabled}
		readonly={resolvedReadonly || full}
		onblur={handleInputBlur}
		oninput={handleInput}
		onkeydown={handleInputKeydown}
		onpaste={handlePaste}
	/>
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValues}
/>
