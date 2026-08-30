<script module lang="ts">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FormErrors } from '../../runtime/form/validation.js';
	import type { FormValidationTrigger } from '../../runtime/form/form-context.svelte.js';

	export interface FormSubmitDetail {
		readonly data: unknown;
		readonly formData: FormData;
		readonly originalEvent: SubmitEvent;
	}

	export interface FormInvalidDetail {
		readonly errors: FormErrors;
		readonly formData: FormData;
		readonly originalEvent: SubmitEvent;
	}

	export interface ZFormProps extends Omit<
		HTMLFormAttributes,
		'children' | 'onreset' | 'onsubmit'
	> {
		readonly children?: Snippet;
		errors?: FormErrors;
		readonly focusFirstError?: boolean;
		readonly nativeValidation?: boolean;
		readonly onErrorsChange?: (errors: FormErrors) => void;
		readonly onInvalidSubmit?: (detail: FormInvalidDetail) => void;
		readonly onReset?: (event: Event) => void;
		readonly onSubmit?: (event: SubmitEvent) => void;
		readonly onValidSubmit?: (detail: FormSubmitDetail) => void;
		readonly onValidationError?: (error: unknown) => void;
		readonly preventDefault?: boolean;
		ref?: HTMLFormElement | null;
		readonly schema?: StandardSchemaV1;
		submitted?: boolean;
		readonly validateOn?: readonly FormValidationTrigger[];
		readonly validationDelay?: number;
		validating?: boolean;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'form',
		importStatement: "import { ZForm } from '@zadmin/zui';",
		name: 'ZForm',
		bindings: [
			{ description: '按字段名聚合的错误。', name: 'errors', type: 'FormErrors' },
			{ description: '当前最新验证是否进行中。', name: 'validating', type: 'boolean' },
			{ description: '本轮reset后是否提交过。', name: 'submitted', type: 'boolean' },
			{ description: '真实form引用。', name: 'ref', type: 'HTMLFormElement | null' }
		],
		dependencies: ['Standard Schema', 'FormRegistry', 'async race token', 'native FormData'],
		events: [
			{
				description: '验证成功后的typed结果与FormData。',
				name: 'onValidSubmit',
				type: '(detail: FormSubmitDetail) => void'
			},
			{
				description: '验证失败后的错误与FormData。',
				name: 'onInvalidSubmit',
				type: '(detail: FormInvalidDetail) => void'
			},
			{
				description: '错误映射变化。',
				name: 'onErrorsChange',
				type: '(errors: FormErrors) => void'
			}
		],
		keyboard: [
			{ description: '保留原生form提交。', key: 'Enter' },
			{ description: '提交失败后聚焦首个注册错误字段。', key: 'Submit' }
		],
		parts: [],
		props: [
			{
				default: 'undefined',
				description: 'Standard Schema v1协议对象。',
				name: 'schema',
				type: 'StandardSchemaV1'
			},
			{
				default: "['submit']",
				description: '触发全表验证的时机。',
				name: 'validateOn',
				type: "readonly ('change' | 'blur' | 'submit')[]"
			},
			{
				default: '150',
				description: 'change验证防抖毫秒。',
				name: 'validationDelay',
				type: 'number'
			},
			{
				default: 'true',
				description: '接管submit默认导航。',
				name: 'preventDefault',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '启用浏览器原生constraint阻断。',
				name: 'nativeValidation',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '无效提交后聚焦首错字段。',
				name: 'focusFirstError',
				type: 'boolean'
			}
		],
		since: '0.5.0',
		snippets: [{ description: '表单字段与操作。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/input/ZForm.svelte',
		states: [
			{ description: '验证中。', name: 'data-validating', values: ['true'] },
			{ description: '已提交过。', name: 'data-submitted', values: ['true'] },
			{ description: '存在错误。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: 'Standard Schema边界、字段注册、异步竞态、首错聚焦与原生FormData的Form。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, tick, untrack } from 'svelte';
	import { FormRegistry } from '../../runtime/form/form-registry.svelte.js';
	import { provideZForm } from '../../runtime/form/form-context.svelte.js';
	import {
		errorsToMap,
		formDataToObject,
		issuesToFormErrors
	} from '../../runtime/form/validation.js';
	import { listenToFormReset } from '../../runtime/form/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		children,
		class: className,
		errors = $bindable({}),
		focusFirstError = true,
		nativeValidation = false,
		onErrorsChange,
		onInvalidSubmit,
		onReset,
		onSubmit,
		onValidSubmit,
		onValidationError,
		preventDefault = true,
		ref = $bindable(null),
		schema,
		style,
		submitted = $bindable(false),
		validateOn = ['submit'],
		validationDelay = 150,
		validating = $bindable(false),
		...rest
	}: ZFormProps = $props();
	const registry = new FormRegistry();
	let validationToken = 0;
	let validationTimer: ReturnType<typeof setTimeout> | undefined;
	const triggers = $derived.by(() => {
		const result = new Set(validateOn);
		if ([...result].some((trigger) => !['blur', 'change', 'submit'].includes(trigger))) {
			throw new TypeError('ZForm validateOn contains an unsupported trigger.');
		}
		if (!Number.isFinite(validationDelay) || validationDelay < 0) {
			throw new TypeError('ZForm validationDelay must be non-negative and finite.');
		}
		return result;
	});
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const invalid = $derived(Object.values(errors).some((messages) => messages.length > 0));
	function setErrors(next: FormErrors): void {
		errors = next;
		registry.setErrors(errorsToMap(next));
		onErrorsChange?.(next);
	}
	async function validate(
		formData = new FormData(ref ?? undefined)
	): Promise<{ data?: unknown; errors: FormErrors }> {
		const token = (validationToken += 1);
		validating = true;
		registry.setValidating(true);
		try {
			const input = formDataToObject(formData);
			const result = schema ? await schema['~standard'].validate(input) : { value: input };
			if (token !== validationToken) return { errors };
			if (result.issues) {
				const next = issuesToFormErrors(result.issues);
				setErrors(next);
				return { errors: next };
			}
			setErrors({});
			return { data: result.value, errors: {} };
		} catch (error) {
			if (token === validationToken) {
				const next = Object.freeze({ '': Object.freeze(['Validation failed unexpectedly.']) });
				setErrors(next);
				onValidationError?.(error);
				return { errors: next };
			}
			return { errors };
		} finally {
			if (token === validationToken) {
				validating = false;
				registry.setValidating(false);
			}
		}
	}
	function scheduleValidation(trigger: 'blur' | 'change'): void {
		if (!triggers.has(trigger) || !ref) return;
		if (validationTimer !== undefined) clearTimeout(validationTimer);
		const run = () => {
			validationTimer = undefined;
			void validate();
		};
		if (trigger === 'change' && validationDelay > 0)
			validationTimer = setTimeout(run, validationDelay);
		else queueMicrotask(run);
	}
	provideZForm({
		fieldEvent(name, trigger) {
			if (trigger === 'change') registry.markDirty(name);
			else registry.markTouched(name);
			scheduleValidation(trigger);
		},
		registry,
		get submitted() {
			return submitted;
		}
	});
	$effect(() => {
		const externalErrors = errors;
		untrack(() => registry.setErrors(errorsToMap(externalErrors)));
	});
	$effect(() => {
		if (!ref) return;
		return listenToFormReset(ref, () => {
			validationToken += 1;
			if (validationTimer !== undefined) clearTimeout(validationTimer);
			validationTimer = undefined;
			validating = false;
			submitted = false;
			registry.reset();
			setErrors({});
		});
	});
	async function handleSubmit(
		event: SubmitEvent & { currentTarget: HTMLFormElement }
	): Promise<void> {
		onSubmit?.(event);
		if (event.defaultPrevented) return;
		if (preventDefault || schema) event.preventDefault();
		if (validationTimer !== undefined) clearTimeout(validationTimer);
		validationTimer = undefined;
		submitted = true;
		registry.markAllTouched();
		const formData = new FormData(event.currentTarget, event.submitter);
		const result = await validate(formData);
		if (Object.values(result.errors).some((messages) => messages.length > 0)) {
			onInvalidSubmit?.({ errors: result.errors, formData, originalEvent: event });
			if (focusFirstError) {
				await tick();
				registry.focusFirstInvalid();
			}
		} else {
			onValidSubmit?.({ data: result.data, formData, originalEvent: event });
		}
	}
	onDestroy(() => {
		validationToken += 1;
		if (validationTimer !== undefined) clearTimeout(validationTimer);
	});
</script>

<form
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	novalidate={!nativeValidation}
	aria-busy={validating || undefined}
	data-validating={validating || undefined}
	data-submitted={submitted || undefined}
	data-invalid={invalid || undefined}
	onsubmit={handleSubmit}
	onreset={(event) => onReset?.(event)}
>
	{@render children?.()}
</form>
