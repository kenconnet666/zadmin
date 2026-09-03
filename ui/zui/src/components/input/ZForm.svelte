<script module lang="ts">
	import type { StandardSchemaV1 as PublicStandardSchemaV1 } from '@standard-schema/spec';
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type {
		FormFieldState as PublicFormFieldState,
		FormFieldStateListener as PublicFormFieldStateListener,
		FormFieldStatePatch as PublicFormFieldStatePatch
	} from '../../runtime/form/form-registry.svelte.js';
	import type { FieldPathInput as PublicFieldPathInput } from '../../runtime/form/field-path.js';
	import type { FormErrors as PublicFormErrors } from '../../runtime/form/validation.js';
	import type { FormValidationTrigger } from '../../runtime/form/form-context.svelte.js';

	export interface FormSubmitDetail<TData = unknown> {
		readonly data: TData;
		readonly formData: FormData;
		readonly originalEvent: SubmitEvent;
	}

	export interface FormInvalidDetail {
		readonly errors: PublicFormErrors;
		readonly formData: FormData;
		readonly originalEvent: SubmitEvent;
	}

	export interface FormValidationResult<TData = unknown> {
		readonly data?: TData;
		readonly errors: PublicFormErrors;
		readonly outdated: boolean;
		readonly valid: boolean;
	}

	export interface ZFormValidationMessages {
		readonly unexpected?: string;
	}

	export interface ZFormController<TData = unknown> {
		focusField(path: PublicFieldPathInput, options?: FocusOptions): boolean;

		getFieldState(path: PublicFieldPathInput): PublicFormFieldState;

		reset(): void;

		scrollToField(path: PublicFieldPathInput, options?: ScrollIntoViewOptions): boolean;

		setErrors(errors: PublicFormErrors): void;

		setFieldState(path: PublicFieldPathInput, state: PublicFormFieldStatePatch): void;

		/** Subscribes to future field-state transitions; read getFieldState for the current snapshot. */
		subscribeField(path: PublicFieldPathInput, listener: PublicFormFieldStateListener): () => void;

		validate(): Promise<FormValidationResult<TData>>;

		validateField(path: PublicFieldPathInput): Promise<FormValidationResult<TData>>;
	}

	export interface ZFormProps<
		TSchema extends PublicStandardSchemaV1 = PublicStandardSchemaV1
	> extends Omit<HTMLFormAttributes, 'children' | 'onreset' | 'onsubmit'> {
		readonly children?: Snippet;
		controller?: ZFormController<PublicStandardSchemaV1.InferOutput<TSchema>> | null;
		readonly disabled?: boolean;
		errors?: PublicFormErrors;
		readonly focusFirstError?: boolean;
		readonly nativeValidation?: boolean;
		readonly onErrorsChange?: (errors: PublicFormErrors) => void;
		readonly onInvalidSubmit?: (detail: FormInvalidDetail) => void;
		readonly onreset?: (event: Event & { currentTarget: HTMLFormElement }) => void;
		readonly onsubmit?: (event: SubmitEvent & { currentTarget: HTMLFormElement }) => void;
		/** @deprecated Use the native lowercase `onreset` callback. */
		readonly onReset?: (event: Event) => void;
		/** @deprecated Use the native lowercase `onsubmit` callback. */
		readonly onSubmit?: (event: SubmitEvent) => void;
		readonly onValidSubmit?: (
			detail: FormSubmitDetail<PublicStandardSchemaV1.InferOutput<TSchema>>
		) => void;
		readonly onValidationError?: (error: unknown) => void;
		readonly preventDefault?: boolean;
		ref?: HTMLFormElement | null;
		readonly readonly?: boolean;
		readonly schema?: TSchema;
		readonly scrollToFirstError?: boolean | ScrollIntoViewOptions;
		readonly size?: ZControlSize;
		submitted?: boolean;
		readonly validateOn?: readonly FormValidationTrigger[];
		readonly validationDelay?: number;
		readonly validationMessages?: ZFormValidationMessages;
		validating?: boolean;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'form',
		importStatement: "import { ZForm } from '@zadmin/zui';",
		name: 'ZForm',
		bindings: [
			{
				description: '验证、字段状态、订阅、聚焦、滚动与reset控制器；订阅不拥有字段值。',
				name: 'controller',
				type: 'ZFormController<TOutput> | null'
			},
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
			},
			{
				description: '原生submit事件；可preventDefault取消ZForm语义提交。',
				name: 'onsubmit',
				type: '(event: SubmitEvent) => void'
			},
			{
				description: '原生reset事件；可preventDefault保留字段状态和值。',
				name: 'onreset',
				type: '(event: Event) => void'
			},
			{
				description: '已弃用的camelCase原生reset回调；请使用onreset。',
				name: 'onReset',
				type: '(event: Event) => void',
				deprecatedSince: 'unreleased',
				replacement: 'onreset'
			},
			{
				description: '已弃用的camelCase原生submit回调；请使用onsubmit。',
				name: 'onSubmit',
				type: '(event: SubmitEvent) => void',
				deprecatedSince: 'unreleased',
				replacement: 'onsubmit'
			},
			{
				description: 'Schema执行抛错后的诊断回调；用户消息由validationMessages控制。',
				name: 'onValidationError',
				type: '(error: unknown) => void'
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
				type: 'TSchema',
				opaque: {
					kind: 'external-protocol',
					resolution: 'external-resolved',
					type: 'TSchema',
					source: '@standard-schema/spec',
					reason: '具体schema字段与实现由外部协议/调用方拥有。',
					owner: 'caller schema'
				}
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
			},
			{
				default: 'true',
				description: '无效提交后按实时DOM顺序滚动首错字段。',
				name: 'scrollToFirstError',
				type: 'boolean | ScrollIntoViewOptions'
			},
			{
				default: 'false',
				description: '由ZFormField继承的表单级禁用状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '由ZFormField继承的表单级只读状态。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '由ZFormField继承的表单级control尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'Provider localePack.form.unexpectedValidation',
				description: 'Schema抛出异常时的可覆盖用户消息。',
				name: 'validationMessages',
				type: 'ZFormValidationMessages',
				members: [
					{ description: 'Schema异常时的用户可见回退消息。', name: 'unexpected', type: 'string' }
				]
			}
		],
		since: 'unreleased',
		snippets: [{ description: '表单字段与操作。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/input/ZForm.svelte',
		states: [
			{ description: '表单级禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '验证中。', name: 'data-validating', values: ['true'] },
			{ description: '已提交过。', name: 'data-submitted', values: ['true'] },
			{ description: '存在错误。', name: 'data-invalid', values: ['true'] },
			{ description: '表单级只读。', name: 'data-readonly', values: ['true'] },
			{ description: '表单级尺寸。', name: 'data-size', values: ['small', 'medium', 'large'] }
		],
		status: 'stable',
		summary:
			'Standard Schema typed输出、FieldPath依赖图、字段级竞态、DOM顺序首错导航与原生FormData的Form。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TSchema extends StandardSchemaV1 = StandardSchemaV1">
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { onDestroy, tick, untrack } from 'svelte';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import {
		FormRegistry,
		type FormFieldStatePatch
	} from '../../runtime/form/form-registry.svelte.js';
	import { provideZForm } from '../../runtime/form/form-context.svelte.js';
	import {
		fieldPathKey,
		fieldPathToString,
		normalizeFieldPath,
		type FieldPath,
		type FieldPathInput
	} from '../../runtime/form/field-path.js';
	import {
		errorsForPaths,
		formDataToObject,
		issuesToFormErrors,
		mergeErrorsForPaths,
		type FormErrors
	} from '../../runtime/form/validation.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	const DEFAULT_VALIDATION_MESSAGES: ZFormValidationMessages = Object.freeze({});

	let {
		'aria-busy': ariaBusy,
		children,
		class: className,
		controller = $bindable(null),
		disabled = false,
		errors = $bindable({}),
		focusFirstError = true,
		nativeValidation = false,
		onErrorsChange,
		onInvalidSubmit,
		onreset,
		onsubmit,
		onReset,
		onSubmit,
		onValidSubmit,
		onValidationError,
		preventDefault = true,
		ref = $bindable(null),
		readonly = false,
		schema,
		scrollToFirstError = true,
		size,
		style,
		submitted = $bindable(false),
		validateOn = ['submit'],
		validationDelay = 150,
		validationMessages = DEFAULT_VALIDATION_MESSAGES,
		validating = $bindable(false),
		...rest
	}: ZFormProps<TSchema> = $props();
	const zui = useZui();
	const lifecycle = { active: true };
	const registry = new FormRegistry((path) => {
		if (!lifecycle.active || !(fieldPathToString(path) in errors)) return;
		publishErrors(mergeErrorsForPaths(errors, {}, [path]));
	});
	// Timers and running validation IDs are lifecycle bookkeeping, not rendered collections.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const validationTimers = new Map<string, { readonly id: number; readonly view: Window }>();
	// Validation run ids are lifecycle bookkeeping, not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const validationRuns = new Set<number>();
	let validationEpoch = 0;
	let validationRunId = 0;
	const triggers = $derived.by(() => {
		// Validation trigger normalization is pure derived input.
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

	function freezeErrors(next: FormErrors): FormErrors {
		return Object.freeze(
			Object.fromEntries(
				Object.entries(next).map(([path, messages]) => [path, Object.freeze([...messages])])
			)
		);
	}

	function publishErrors(next: FormErrors): void {
		const frozen = freezeErrors(next);
		errors = frozen;
		registry.syncErrors(frozen);
		onErrorsChange?.(frozen);
	}

	function readFormData(submitter?: HTMLElement | null): FormData {
		if (!ref) return new FormData();
		const FormDataConstructor = ref.ownerDocument.defaultView?.FormData ?? FormData;
		return submitter ? new FormDataConstructor(ref, submitter) : new FormDataConstructor(ref);
	}

	function uniquePaths(paths: readonly FieldPathInput[]): readonly FieldPath[] {
		// Deduplication-local set is not rendered state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set<string>();
		const result: FieldPath[] = [];
		for (const pathInput of paths) {
			const path = normalizeFieldPath(pathInput);
			const key = fieldPathKey(path);
			if (seen.has(key)) continue;
			seen.add(key);
			result.push(path);
		}
		return Object.freeze(result);
	}

	async function validatePaths(
		pathInputs: readonly FieldPathInput[],
		full: boolean,
		formData = readFormData()
	): Promise<FormValidationResult<StandardSchemaV1.InferOutput<TSchema>>> {
		const paths = uniquePaths(pathInputs);
		const ticket = registry.beginValidation(paths);
		const epoch = validationEpoch;
		const runId = (validationRunId += 1);
		validationRuns.add(runId);
		validating = true;
		try {
			const input = formDataToObject(formData, registry.formDataPaths());
			const result = schema ? await schema['~standard'].validate(input) : { value: input };
			const next: FormErrors = result.issues
				? issuesToFormErrors(result.issues)
				: Object.freeze({});
			const accepted = registry.finishValidation(ticket, next);
			const outdated = epoch !== validationEpoch || accepted.length !== ticket.entries.length;
			if (full && !outdated) publishErrors(next);
			else if (accepted.length > 0) publishErrors(mergeErrorsForPaths(errors, next, accepted));
			const scopedErrors: FormErrors = full ? next : errorsForPaths(next, paths);
			return {
				data: result.issues ? undefined : (result.value as StandardSchemaV1.InferOutput<TSchema>),
				errors: scopedErrors,
				outdated,
				valid: Object.values(scopedErrors).every((messages) => messages.length === 0)
			};
		} catch (error) {
			const message = validationMessages.unexpected ?? zui.localePack.form.unexpectedValidation;
			const next = freezeErrors(
				full
					? { '': [message] }
					: Object.fromEntries(paths.map((path) => [fieldPathToString(path), [message]]))
			);
			const accepted = registry.finishValidation(ticket, next);
			const outdated = epoch !== validationEpoch || accepted.length !== ticket.entries.length;
			if (full && !outdated) publishErrors(next);
			else if (accepted.length > 0) publishErrors(mergeErrorsForPaths(errors, next, accepted));
			if (!outdated || accepted.length > 0) onValidationError?.(error);
			return { errors: next, outdated, valid: false };
		} finally {
			validationRuns.delete(runId);
			validating = validationRuns.size > 0;
		}
	}

	function clearValidationTimers(): void {
		for (const timer of validationTimers.values()) timer.view.clearTimeout(timer.id);
		validationTimers.clear();
	}

	function scheduleValidation(trigger: 'blur' | 'change', paths: readonly FieldPath[]): void {
		if (!triggers.has(trigger) || !ref || paths.length === 0) return;
		const scopeKey = JSON.stringify(paths.map(fieldPathKey).sort());
		const previous = validationTimers.get(scopeKey);
		if (previous) previous.view.clearTimeout(previous.id);
		const run = () => {
			validationTimers.delete(scopeKey);
			void validatePaths(paths, false);
		};
		if (trigger === 'change' && validationDelay > 0) {
			const view = ref.ownerDocument.defaultView;
			if (view) {
				validationTimers.set(scopeKey, { id: view.setTimeout(run, validationDelay), view });
			} else queueMicrotask(run);
		} else queueMicrotask(run);
	}

	provideZForm({
		get disabled() {
			return disabled;
		},
		fieldEvent(instanceId, trigger) {
			if (trigger === 'change') registry.markDirty(instanceId);
			else registry.markTouched(instanceId);
			scheduleValidation(trigger, registry.affectedPaths(instanceId));
		},
		get readonly() {
			return readonly;
		},
		registry,
		get size() {
			return size;
		},
		get submitted() {
			return submitted;
		}
	});
	$effect(() => {
		const externalErrors = errors;
		untrack(() => registry.syncErrors(externalErrors));
	});

	function resetFromForm(): void {
		validationEpoch += 1;
		clearValidationTimers();
		validationRuns.clear();
		validating = false;
		submitted = false;
		registry.reset();
		publishErrors({});
	}

	const formController: ZFormController<StandardSchemaV1.InferOutput<TSchema>> = {
		focusField: (path, options) => registry.focusField(path, options),
		getFieldState: (path) => registry.state(path),
		reset() {
			if (ref) ref.reset();
			else resetFromForm();
		},
		scrollToField: (path, options) => registry.scrollToField(path, options),
		setErrors: publishErrors,
		setFieldState(path: FieldPathInput, state: FormFieldStatePatch) {
			registry.setFieldState(path, state);
			if (state.errors !== undefined) {
				const normalized = normalizeFieldPath(path);
				publishErrors(
					mergeErrorsForPaths(errors, { [fieldPathToString(normalized)]: state.errors }, [
						normalized
					])
				);
			}
		},
		subscribeField: (path, listener) => registry.subscribeField(path, listener),
		validate: () => validatePaths(registry.registeredPaths(), true),
		validateField: (path) => validatePaths([path], false)
	};
	$effect(() => {
		controller = formController;
		const publishedController = untrack(() => controller);
		return () => {
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: HTMLFormElement }
	): Promise<void> {
		onsubmit?.(event);
		if (onSubmit !== onsubmit) onSubmit?.(event);
		if (event.defaultPrevented) return;
		if (preventDefault || schema) event.preventDefault();
		clearValidationTimers();
		// A submit is a new validation epoch: pending change/blur promises may finish later,
		// but their results must never be allowed to compete with this full-form submission.
		validationEpoch += 1;
		submitted = true;
		registry.markAllTouched();
		const formData = readFormData(event.submitter);
		const result = await validatePaths(registry.registeredPaths(), true, formData);
		if (result.outdated) return;
		if (!result.valid) {
			onInvalidSubmit?.({ errors: result.errors, formData, originalEvent: event });
			if (focusFirstError || scrollToFirstError) {
				await tick();
				const firstPath = registry.firstInvalidPath();
				if (firstPath && scrollToFirstError) {
					registry.scrollToField(
						firstPath,
						typeof scrollToFirstError === 'object' ? scrollToFirstError : { block: 'nearest' }
					);
				}
				if (firstPath && focusFirstError) {
					registry.focusField(firstPath, { preventScroll: Boolean(scrollToFirstError) });
				}
			}
		} else {
			onValidSubmit?.({
				data: result.data as StandardSchemaV1.InferOutput<TSchema>,
				formData,
				originalEvent: event
			});
		}
	}

	onDestroy(() => {
		lifecycle.active = false;
		validationEpoch += 1;
		clearValidationTimers();
		validationRuns.clear();
		registry.cancelValidation();
	});
</script>

<form
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	novalidate={!nativeValidation}
	aria-busy={validating ? true : ariaBusy}
	data-disabled={disabled || undefined}
	data-validating={validating || undefined}
	data-submitted={submitted || undefined}
	data-invalid={invalid || undefined}
	data-readonly={readonly || undefined}
	data-size={size}
	onsubmit={handleSubmit}
	onreset={(event) => {
		onreset?.(event);
		if (onReset !== onreset) onReset?.(event);
	}}
>
	<FormResetSignal onReset={resetFromForm} owner={ref} />
	{@render children?.()}
</form>
