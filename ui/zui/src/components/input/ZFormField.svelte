<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FieldMessages } from '../../runtime/form/form-control.svelte.js';
	import type { FormFieldState } from '../../runtime/form/form-registry.svelte.js';
	import type { FieldPathInput } from '../../runtime/form/field-path.js';
	import type { ZFieldProps } from './ZField.svelte';

	export interface ZFormFieldProps extends Omit<
		ZFieldProps,
		'error' | 'name' | 'success' | 'warning'
	> {
		readonly dependencies?: readonly FieldPathInput[];
		readonly error?: FieldMessages;
		readonly htmlName?: string;
		readonly name: FieldPathInput;
		readonly onStateChange?: (state: FormFieldState) => void;
		readonly success?: FieldMessages;
		readonly warning?: FieldMessages;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'form-field',
		importStatement: "import { ZFormField } from '@zadmin/zui';",
		name: 'ZFormField',
		bindings: [
			{ description: '真实ZField根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZForm', 'FieldPath graph', 'FormRegistry', 'ZField'],
		events: [
			{
				description: 'dirty、touched、validating或errors变化。',
				name: 'onStateChange',
				type: '(state: FormFieldState) => void'
			}
		],
		keyboard: [{ description: '不拦截control原生键盘。', key: 'Native control keys' }],
		parts: [],
		props: [
			{
				default: '0',
				description: '透传ZField反馈区最少行数，非负整数；适合避免异步反馈导致操作区位移。',
				name: 'feedbackMinLines',
				type: 'number'
			},
			{
				default: '必填',
				description: '字段图路径；字符串保持兼容，tuple保留数组段类型。',
				name: 'name',
				required: true,
				type: 'FieldPathInput'
			},
			{
				default: '由name稳定生成',
				description: '独立的原生FormData名称；同一路径可由多个同名control共同提交。',
				name: 'htmlName',
				type: 'string'
			},
			{
				default: '[]',
				description: '上游字段路径改变时增量重验当前字段，支持传递依赖。',
				name: 'dependencies',
				type: 'readonly FieldPathInput[]'
			},
			{
				default: '必填',
				description: '复用ZField标签。',
				name: 'label',
				required: true,
				type: 'Snippet | string'
			},
			{
				default: 'undefined',
				description: '复用ZField辅助说明并连接真实control。',
				name: 'description',
				type: 'Snippet | string'
			},
			{
				default: 'undefined',
				description: '与schema错误合并的外部错误。',
				name: 'error',
				type: 'FieldMessages'
			},
			{
				default: 'false',
				description: '传给ZField和control context。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'ZForm.disabled',
				description: '显式值优先于表单级禁用状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'ZForm.readonly',
				description: '显式值优先于表单级只读状态。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'ZForm.size；否则control使用Provider density',
				description: '显式值优先于表单级Field尺寸，未设置时不遮蔽control的Provider density。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'undefined',
				description: '外部警告消息，与controller字段状态合并。',
				name: 'warning',
				type: 'FieldMessages'
			},
			{
				default: 'undefined',
				description: '外部成功消息，与controller字段状态合并。',
				name: 'success',
				type: 'FieldMessages'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '真实输入control。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/input/ZFormField.svelte',
		states: [
			{ description: '用户改变过字段。', name: 'data-dirty', values: ['true'] },
			{ description: '字段失焦过或表单已提交。', name: 'data-touched', values: ['true'] },
			{ description: '字段验证中。', name: 'data-validating', values: ['true'] },
			{ description: '字段存在错误。', name: 'data-invalid', values: ['true'] }
		],
		status: 'stable',
		summary: '把FormRegistry字段状态投射到ZField视觉与ARIA、保持真实control所有权的Form Field。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { mergeFieldMessages } from '../../runtime/form/form-control.svelte.js';
	import { useZForm } from '../../runtime/form/form-context.svelte.js';
	import { fieldPathToString, normalizeFieldPath } from '../../runtime/form/field-path.js';
	import { isDomNode } from '../../runtime/layer/dom-realm.js';
	import ZField from './ZField.svelte';

	let {
		children,
		dependencies = [],
		disabled,
		error,
		htmlName,
		name,
		onfocusout,
		oninput,
		onStateChange,
		readonly,
		ref = $bindable(null),
		size,
		success,
		warning,
		...rest
	}: ZFormFieldProps = $props();
	const form = useZForm();
	const instanceId = $props.id();
	const path = $derived(normalizeFieldPath(name));
	const resolvedHtmlName = $derived(htmlName ?? fieldPathToString(path));
	const state = $derived(form.registry.state(path));
	const messages = $derived(mergeFieldMessages(error, state.errors));
	const warningMessages = $derived(mergeFieldMessages(warning, state.warnings));
	const successMessages = $derived(mergeFieldMessages(success, state.success));
	const resolvedDisabled = $derived(disabled ?? form.disabled);
	const resolvedReadonly = $derived(readonly ?? form.readonly);
	const resolvedSize = $derived(size ?? form.size);
	$effect(() => {
		if (!ref) return;
		return form.registry.register({
			control: () => ref,
			dependencies,
			htmlName: resolvedHtmlName,
			instanceId,
			path
		});
	});
	$effect(() => onStateChange?.(state));
</script>

<ZField
	{...rest}
	bind:ref
	disabled={resolvedDisabled}
	error={messages}
	name={resolvedHtmlName}
	readonly={resolvedReadonly}
	size={resolvedSize}
	success={successMessages}
	warning={warningMessages}
	data-dirty={state.dirty || undefined}
	data-touched={state.touched || form.submitted || undefined}
	data-validating={state.validating || undefined}
	oninput={(event) => {
		oninput?.(event);
		if (!event.defaultPrevented) form.fieldEvent(instanceId, 'change');
	}}
	onfocusout={(event) => {
		onfocusout?.(event);
		if (
			!event.defaultPrevented &&
			(!isDomNode(event.relatedTarget) || !event.currentTarget.contains(event.relatedTarget))
		) {
			form.fieldEvent(instanceId, 'blur');
		}
	}}
>
	{@render children?.()}
</ZField>
