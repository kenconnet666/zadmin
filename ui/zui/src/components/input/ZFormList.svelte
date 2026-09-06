<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FieldPathInput } from '../../runtime/form/field-path.js';
	import type { FormArrayRow as PublicFormArrayRow } from '../../runtime/form/form-array.svelte.js';
	import type { ZStackProps } from '../layout/ZStack.svelte';

	export interface FormListOperations<T> {
		readonly disabled: boolean;
		readonly readonly: boolean;
		append(value: T): boolean;
		insert(index: number, value: T): boolean;
		remove(index: number): boolean;
		move(from: number, to: number): boolean;
		replace(index: number, value: T): boolean;
	}
	export interface ZFormListProps<T> extends Omit<ZStackProps, 'children' | 'direction'> {
		readonly children: Snippet<
			[rows: readonly PublicFormArrayRow<T>[], operations: FormListOperations<T>]
		>;
		readonly getRowKey?: (value: T) => string | number;
		readonly name: FieldPathInput;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'form-list',
		name: 'ZFormList',
		importStatement: "import { ZFormList } from '@zadmin/zui';",
		bindings: [
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				description: '真实ZStack根节点；删除最后一行时可接收程序化焦点。'
			}
		],
		dependencies: ['ZForm', 'FormArrayController', 'FormRegistry', 'ZStack'],
		events: [],
		keyboard: [
			{
				key: 'Native controls',
				description: '行内控件保留自己的键盘规则；删除当前焦点行后恢复到相邻行或列表根。'
			}
		],
		parts: [],
		props: [
			{
				name: 'name',
				type: 'FieldPathInput',
				default: '必填',
				required: true,
				description: '父Form模型中的数组路径；索引是地址，row.id是稳定渲染身份。'
			},
			{
				name: 'getRowKey',
				type: '(value: T) => string | number',
				default: 'undefined',
				description: '外部数组替换时的唯一业务键；不写入模型，渲染仍用row.id。'
			},
			{
				name: 'gap',
				type: "ZStackProps['gap']",
				default: "'medium'",
				description: '复用ZStack的主题间距和响应式布局能力。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实布局根节点。'
			}
		],
		snippets: [
			{
				name: 'children',
				required: true,
				type: 'Snippet<[rows: readonly FormArrayRow<T>[], operations: FormListOperations<T>]>',
				description:
					'使用each rows as row (row.id)；字段路径由row.path追加。操作返回owner接受结果，disabled/readonly时返回false。'
			}
		],
		states: [
			{
				name: 'data-disabled',
				values: ['true'],
				description: '父Form禁用；列表操作拒绝用户结构变更。'
			},
			{
				name: 'data-readonly',
				values: ['true'],
				description: '父Form只读；字段保留提交，列表操作拒绝结构变更。'
			}
		],
		source: 'ui/zui/src/components/input/ZFormList.svelte',
		since: 'unreleased',
		status: 'experimental',
		summary: '复用FormArray稳定行身份的动态表单列表，成套迁移值、字段状态、错误和焦点。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="T">
	import { onDestroy, tick, untrack } from 'svelte';
	import { useZForm, type FormListArray } from '../../runtime/form/form-context.svelte.js';
	import type { FormArrayRow } from '../../runtime/form/form-array.svelte.js';
	import {
		provideFormList,
		useFormListParent,
		type FormListParentArray
	} from '../../runtime/form/form-list-context.svelte.js';
	import {
		fieldPathKey,
		fieldPathStartsWith,
		normalizeFieldPath,
		type FieldPath
	} from '../../runtime/form/field-path.js';
	import { createFormListReconcile } from '../../runtime/form/form-list-reconcile.js';
	import {
		getActiveElement,
		containsComposedNode,
		isDomHtmlElement,
		isDomShadowRoot
	} from '../../runtime/layer/dom-realm.js';
	import ZStack from '../layout/ZStack.svelte';

	let {
		children,
		getRowKey,
		name,
		gap = 'medium',
		ref = $bindable(null),
		tabindex = -1,
		...rest
	}: ZFormListProps<T> = $props();
	const form = useZForm('ZFormList');
	let live = true;
	onDestroy(() => {
		live = false;
	});
	const parent = useFormListParent();
	const requestedPath = $derived(normalizeFieldPath(name));
	const ancestors = $derived.by(() => {
		const result: FormListParentArray[] = [];
		for (let current = parent; current && current.form === form; current = current.parent)
			result.push(current.array);
		return result;
	});
	let binding:
		| {
				owner: object;
				parent?: FormListParentArray;
				rowId?: string;
				suffixKey: string;
				getRowKey: ZFormListProps<T>['getRowKey'];
				array: FormListArray<T>;
		  }
		| undefined;
	const array = $derived.by(() => {
		const owner = form.model;
		const currentPath = requestedPath;
		const key = getRowKey;
		const parents = ancestors;
		if (!owner) throw new TypeError('ZFormList requires a ZForm model.');
		return untrack(() => {
			const containingArray = parents.find((candidate) =>
				fieldPathStartsWith(currentPath, candidate.path)
			);
			const row = containingArray?.rows.find((candidate) =>
				fieldPathStartsWith(currentPath, candidate.path)
			);
			if (containingArray && !row)
				throw new TypeError('A nested ZFormList name must address a current parent row.');
			const suffix = row ? currentPath.slice(row.path.length) : currentPath;
			const suffixKey = suffix.length ? fieldPathKey(suffix) : '[]';
			if (
				binding &&
				binding.owner === owner &&
				binding.parent === containingArray &&
				binding.rowId === row?.id &&
				binding.suffixKey === suffixKey &&
				binding.getRowKey === key
			)
				return binding.array;
			let lastPath = currentPath;
			const rowId = row?.id;
			const location =
				containingArray && rowId
					? {
							get active() {
								return (
									containingArray.active &&
									containingArray.rows.some((candidate) => candidate.id === rowId)
								);
							},
							get path() {
								const currentRow = containingArray.rows.find((candidate) => candidate.id === rowId);
								if (currentRow) lastPath = Object.freeze([...currentRow.path, ...suffix]);
								return lastPath;
							},
							get baselinePath() {
								const baseline = containingArray.getRowBaselinePath(rowId);
								return baseline ? Object.freeze([...baseline, ...suffix]) : undefined;
							}
						}
					: undefined;
			let currentArray!: FormListArray<T>;
			currentArray = form.createArray<T>(currentPath, { getRowKey: key }, location, {
				prepareList(change) {
					const prepared = form.prepareList(change);
					return {
						commit() {
							try {
								prepared.commit();
							} finally {
								recordCommittedRows(currentArray);
							}
						}
					};
				}
			});
			binding = {
				owner,
				parent: containingArray,
				rowId,
				suffixKey,
				getRowKey: key,
				array: currentArray
			};
			return currentArray;
		});
	});
	provideFormList({
		form,
		parent,
		get array() {
			return array;
		}
	});
	const rows = $derived(array.rows);
	let observedArray: FormListArray<T> = untrack(() => array);
	let observedRows = untrack(() => array.rows);
	let observedPath = untrack(() => array.path);
	let committedMutationGeneration = 0;
	function recordCommittedRows(current: FormListArray<T>): void {
		observedArray = current;
		observedRows = current.rows;
		observedPath = current.path;
		committedMutationGeneration += 1;
	}
	let mutationGeneration = 0;
	function focusIsVacant(container: HTMLElement): boolean {
		const active = getActiveElement(container);
		const tree = container.getRootNode();
		return (
			!active ||
			active === container.ownerDocument.body ||
			active === container.ownerDocument.documentElement ||
			(isDomShadowRoot(tree) && !tree.activeElement && active === tree.host)
		);
	}

	function rowAt(
		fieldPath: FieldPath,
		currentArray: FormListArray<T>
	): FormArrayRow<T> | undefined {
		return currentArray.rows.find((row) => fieldPathStartsWith(fieldPath, row.path));
	}
	$effect.pre(() => {
		const current = array;
		const parentArrays = ancestors;
		return untrack(() =>
			form.registerList({
				owner: current,
				ancestors: parentArrays,
				get active() {
					return current === array && current.active;
				},
				get path() {
					return current.path;
				},
				isDirty(fieldPath) {
					const row = rowAt(fieldPath, current);
					const relative = row ? fieldPath.slice(row.path.length) : [];
					return row ? current.isDirty(row.id, relative.length ? relative : undefined) : false;
				},
				resetField(fieldPath) {
					const row = rowAt(fieldPath, current);
					const relative = row ? fieldPath.slice(row.path.length) : [];
					return row ? current.resetField(row.id, relative.length ? relative : undefined) : false;
				}
			})
		);
	});
	function synchronize(current: FormListArray<T>, next: readonly FormArrayRow<T>[]): void {
		if (current !== observedArray || !current.active) {
			observedArray = current;
			observedRows = next;
			observedPath = current.path;
			return;
		}
		const currentPath = current.path;
		// The ancestor transaction already moved every descendant field and error. Translate this
		// controller's prior addresses before applying only its own row identity changes.
		const previous =
			fieldPathKey(currentPath) === fieldPathKey(observedPath)
				? observedRows
				: observedRows.map((row) => ({
						...row,
						path: Object.freeze([...currentPath, ...row.path.slice(observedPath.length)])
					}));
		observedRows = next;
		observedPath = currentPath;
		if (
			previous.length === next.length &&
			previous.every(
				(row, index) =>
					row.id === next[index]!.id && fieldPathKey(row.path) === fieldPathKey(next[index]!.path)
			)
		)
			return;
		form.reconcileList(createFormListReconcile(currentPath, previous, next));
	}
	$effect.pre(() => {
		const current = array;
		const next = rows;
		untrack(() => synchronize(current, next));
	});
	function mutate(update: (current: FormListArray<T>) => boolean, fallbackRowId?: string): boolean {
		if (!live || form.disabled || form.readonly || !array.active) return false;
		const current = array;
		const container = ref;
		const active = container ? getActiveElement(container) : null;
		const focused =
			isDomHtmlElement(active) && containsComposedNode(container, active) ? active : null;
		const textControl =
			focused?.tagName === 'INPUT' || focused?.tagName === 'TEXTAREA'
				? (focused as HTMLInputElement | HTMLTextAreaElement)
				: null;
		const selectionStart = textControl?.selectionStart ?? null;
		const selectionEnd = textControl?.selectionEnd ?? null;
		const selectionDirection = textControl?.selectionDirection ?? 'none';
		const beforeCommit = committedMutationGeneration;
		let failed = false;
		let failure: unknown;
		try {
			if (!update(current)) return false;
		} catch (error) {
			if (committedMutationGeneration === beforeCommit) throw error;
			failed = true;
			failure = error;
		}
		synchronize(current, current.rows);
		const generation = ++mutationGeneration;
		void tick().then(() => {
			if (
				!live ||
				generation !== mutationGeneration ||
				array !== current ||
				!container?.isConnected ||
				!focused
			)
				return;
			const currentFocus = getActiveElement(container);
			if (currentFocus === focused || !focusIsVacant(container)) return;
			if (
				!focused.isConnected ||
				!containsComposedNode(container, focused) ||
				focused.matches(':disabled') ||
				focused.closest('[inert]')
			) {
				if (fallbackRowId) {
					const fallback = current.rows.find((row) => row.id === fallbackRowId);
					if (!fallback || !form.registry.focusListScope(fallback.path))
						container.focus({ preventScroll: true });
				}
				return;
			}
			// Keyed DOM moves can drop native focus even while retaining the input node.
			focused.focus({ preventScroll: true });
			if (
				textControl &&
				selectionStart !== null &&
				selectionEnd !== null &&
				textControl.selectionStart !== null
			)
				textControl.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
		});
		if (failed) throw failure;
		return true;
	}
	function remove(index: number): boolean {
		const current = array;
		const before = current.rows;
		const removed = before[index];
		const active = ref ? getActiveElement(ref) : null;
		const containedFocus = removed ? form.registry.listScopeContainsFocus(removed.path) : false;
		const focusWasInside = containsComposedNode(ref, active);
		const fallbackId = before[index + 1]?.id ?? before[index - 1]?.id;
		if (!mutate((controller) => controller.remove(index))) return false;
		const restoreFocus = () => {
			if (!live || !ref?.isConnected || array !== current) return;
			const fallback = current.rows.find((row) => row.id === fallbackId);
			if (!fallback || !form.registry.focusListScope(fallback.path))
				ref.focus({ preventScroll: true });
		};
		if (containedFocus) restoreFocus();
		else
			void tick().then(() => {
				// Includes a row's remove button, which need not be inside a registered FormField.
				if (focusWasInside && active && !active.isConnected && ref && focusIsVacant(ref))
					restoreFocus();
			});
		return true;
	}
	const operations: FormListOperations<T> = {
		get disabled() {
			return form.disabled;
		},
		get readonly() {
			return form.readonly;
		},
		append: (value) => mutate((controller) => controller.append(value)),
		insert: (index, value) => mutate((controller) => controller.insert(index, value)),
		remove,
		move: (from, to) => mutate((controller) => controller.move(from, to), array.rows[from]?.id),
		replace: (index, value) =>
			mutate((controller) => controller.replace(index, value), array.rows[index]?.id)
	};
</script>

<ZStack
	{...rest}
	bind:ref
	{gap}
	{tabindex}
	direction="column"
	data-disabled={form.disabled || undefined}
	data-readonly={form.readonly || undefined}
>
	{@render children(rows, operations)}
</ZStack>
