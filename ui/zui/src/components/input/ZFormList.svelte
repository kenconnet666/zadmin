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
	import { tick, untrack } from 'svelte';
	import { useZForm, type FormListArray } from '../../runtime/form/form-context.svelte.js';
	import type { FormArrayRow } from '../../runtime/form/form-array.svelte.js';
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
	const form = useZForm();
	const path = $derived(normalizeFieldPath(name));
	const array = $derived.by(() => {
		const owner = form.model;
		const currentPath = path;
		const key = getRowKey;
		if (!owner) throw new TypeError('ZFormList requires a ZForm model.');
		return untrack(() => form.createArray<T>(currentPath, { getRowKey: key }));
	});
	const rows = $derived(array.rows);
	let observedArray: FormListArray<T> = untrack(() => array);
	let observedRows = untrack(() => array.rows);
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
		const listPath = path;
		return form.registerList({
			path: listPath,
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
		});
	});
	function synchronize(current: FormListArray<T>, next: readonly FormArrayRow<T>[]): void {
		if (current !== observedArray) {
			observedArray = current;
			observedRows = next;
			return;
		}
		const previous = observedRows;
		observedRows = next;
		if (
			previous.length === next.length &&
			previous.every(
				(row, index) =>
					row.id === next[index]!.id && fieldPathKey(row.path) === fieldPathKey(next[index]!.path)
			)
		)
			return;
		form.reconcileList(createFormListReconcile(path, previous, next));
	}
	$effect.pre(() => {
		const current = array;
		const next = rows;
		untrack(() => synchronize(current, next));
	});
	function mutate(update: (current: FormListArray<T>) => boolean, fallbackRowId?: string): boolean {
		if (form.disabled || form.readonly) return false;
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
		if (!update(current)) return false;
		synchronize(current, current.rows);
		const generation = ++mutationGeneration;
		void tick().then(() => {
			if (
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
			if (!ref?.isConnected || array !== current) return;
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
