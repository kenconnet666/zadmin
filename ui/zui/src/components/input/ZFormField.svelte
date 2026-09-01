<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FieldMessages } from '../../runtime/form/form-control.svelte.js';
	import type { FormFieldState } from '../../runtime/form/form-registry.svelte.js';
	import type { ZFieldProps } from './ZField.svelte';

	export interface ZFormFieldProps extends Omit<ZFieldProps, 'error' | 'name'> {
		readonly error?: FieldMessages;
		readonly name: string;
		readonly onStateChange?: (state: FormFieldState) => void;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'form-field',
		importStatement: "import { ZFormField } from '@zadmin/zui';",
		name: 'ZFormField',
		bindings: [
			{ description: '真实ZField根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZForm', 'FormRegistry', 'ZField'],
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
				default: '必填',
				description: '字段注册与FormData名称。',
				name: 'name',
				required: true,
				type: 'string'
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
				description: '与schema错误合并的外部错误。',
				name: 'error',
				type: 'FieldMessages'
			},
			{
				default: 'false',
				description: '传给ZField和control context。',
				name: 'required',
				type: 'boolean'
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
		status: 'experimental',
		summary: '把FormRegistry字段状态投射到ZField视觉与ARIA、保持真实control所有权的Form Field。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { normalizeFieldMessages } from '../../runtime/form/form-control.svelte.js';
	import { useZForm } from '../../runtime/form/form-context.svelte.js';
	import ZField from './ZField.svelte';

	let {
		children,
		error,
		name,
		onfocusout,
		oninput,
		onStateChange,
		ref = $bindable(null),
		...rest
	}: ZFormFieldProps = $props();
	const form = useZForm();
	const state = $derived(form.registry.state(name));
	const messages = $derived(Object.freeze([...normalizeFieldMessages(error), ...state.errors]));
	$effect(() => {
		if (!ref) return;
		return form.registry.register(name, () => ref);
	});
	$effect(() => onStateChange?.(state));
</script>

<ZField
	{...rest}
	bind:ref
	{name}
	error={messages}
	data-dirty={state.dirty || undefined}
	data-touched={state.touched || form.submitted || undefined}
	data-validating={state.validating || undefined}
	oninput={(event) => {
		oninput?.(event);
		if (!event.defaultPrevented) form.fieldEvent(name, 'change');
	}}
	onfocusout={(event) => {
		onfocusout?.(event);
		if (
			!event.defaultPrevented &&
			!event.currentTarget.contains(event.relatedTarget as Node | null)
		) {
			form.fieldEvent(name, 'blur');
		}
	}}
>
	{@render children?.()}
</ZField>
