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
	import type { FormModel as PublicFormModel } from '../../runtime/form/form-model.svelte.js';
	export type FormOutput<
		TSchema extends PublicStandardSchemaV1 | undefined,
		TValues = unknown
	> = TSchema extends PublicStandardSchemaV1
		? PublicStandardSchemaV1.InferOutput<TSchema>
		: TValues;

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
	export interface FormState {
		readonly dirty: boolean;
		readonly touched: boolean;
		readonly submitted: boolean;
		readonly submitting: boolean;
		readonly validating: boolean;
		/** No reported errors or intrinsically invalid control drafts; validate() also refreshes schema. */
		readonly valid: boolean;
		readonly errors: PublicFormErrors;
	}

	export interface ZFormController<TData = unknown, TValues = unknown> {
		getState(): FormState;
		subscribeState(listener: (state: FormState) => void): () => void;
		/** Reads the injected model snapshot, or current successful controls in native mode. */
		getValues(): TValues;
		getFieldValue(path: PublicFieldPathInput): unknown;
		setValues(values: TValues | ((current: TValues) => TValues)): boolean;
		setFieldValue(path: PublicFieldPathInput, value: unknown): boolean;
		initialize(values: TValues, options?: { readonly keepDirtyValues?: boolean }): void;
		resetField(path: PublicFieldPathInput): void;
		clearErrors(paths?: readonly PublicFieldPathInput[]): void;
		focusField(path: PublicFieldPathInput, options?: FocusOptions): boolean;

		getFieldState(path: PublicFieldPathInput): PublicFormFieldState;

		reset(): void;

		scrollToField(path: PublicFieldPathInput, options?: ScrollIntoViewOptions): boolean;

		setErrors(errors: PublicFormErrors): void;

		setFieldFeedback(path: PublicFieldPathInput, feedback: PublicFormFieldStatePatch): void;
		/** @deprecated Use setFieldFeedback; this method writes feedback, not value/dirty/touched. */
		setFieldState(path: PublicFieldPathInput, state: PublicFormFieldStatePatch): void;

		/** Subscribes to future field-state transitions; read getFieldState for the current snapshot. */
		subscribeField(path: PublicFieldPathInput, listener: PublicFormFieldStateListener): () => void;

		validate(): Promise<FormValidationResult<TData>>;

		validateField(path: PublicFieldPathInput): Promise<FormValidationResult<TData>>;
	}

	export interface ZFormProps<
		TSchema extends PublicStandardSchemaV1 | undefined = PublicStandardSchemaV1 | undefined,
		TValues = unknown
	> extends Omit<HTMLFormAttributes, 'children' | 'onreset' | 'onsubmit'> {
		readonly children?: Snippet;
		readonly clearServerErrorsOnChange?: boolean;
		controller?: ZFormController<FormOutput<TSchema, TValues>, TValues> | null;
		readonly model?: PublicFormModel<TValues>;
		readonly disabled?: boolean;
		errors?: PublicFormErrors;
		readonly focusFirstError?: boolean;
		readonly nativeValidation?: boolean;
		readonly onErrorsChange?: (errors: PublicFormErrors) => void;
		readonly onStateChange?: (state: FormState) => void;
		readonly onSubmitError?: (error: unknown) => void;
		readonly onInvalidSubmit?: (detail: FormInvalidDetail) => void;
		readonly onreset?: (event: Event & { currentTarget: HTMLFormElement }) => void;
		readonly onsubmit?: (event: SubmitEvent & { currentTarget: HTMLFormElement }) => void;
		/** Promise results are awaited; resolved and synchronous return values are ignored. */
		readonly onValidSubmit?: (detail: FormSubmitDetail<FormOutput<TSchema, TValues>>) => unknown;
		readonly onValidationError?: (error: unknown) => void;
		readonly preventDefault?: boolean;
		readonly preserve?: boolean;
		ref?: HTMLFormElement | null;
		readonly readonly?: boolean;
		readonly schema?: TSchema;
		readonly scrollToFirstError?: boolean | ScrollIntoViewOptions;
		readonly size?: ZControlSize;
		submitted?: boolean;
		submitting?: boolean;
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
			{ name: 'submitting', type: 'boolean', description: '等待onValidSubmit处理器期间为true。' },
			{
				description: '验证、字段状态、订阅、聚焦、滚动与reset控制器；订阅不拥有字段值。',
				name: 'controller',
				type: 'ZFormController<FormOutput<TSchema, TValues>, TValues> | null'
			},
			{ description: '按字段名聚合的错误。', name: 'errors', type: 'FormErrors' },
			{ description: '当前最新验证是否进行中。', name: 'validating', type: 'boolean' },
			{ description: '本轮reset后是否提交过。', name: 'submitted', type: 'boolean' },
			{ description: '真实form引用。', name: 'ref', type: 'HTMLFormElement | null' }
		],
		dependencies: ['Standard Schema', 'FormRegistry', 'async race token', 'native FormData'],
		events: [
			{
				name: 'onStateChange',
				type: '(state: FormState) => void',
				description: '聚合状态变化后的不可变快照。'
			},
			{
				name: 'onSubmitError',
				type: '(error: unknown) => void',
				description: '语义提交处理器抛错或拒绝。'
			},
			{
				description: '验证成功后的typed结果与FormData。',
				name: 'onValidSubmit',
				type: '(detail: FormSubmitDetail<FormOutput<TSchema, TValues>>) => unknown',
				callable: {
					parameters: [
						{
							name: 'detail',
							type: 'FormSubmitDetail<FormOutput<TSchema, TValues>>',
							required: true,
							description: '回调payload。',
							members: [
								{
									description: 'Standard Schema typed输出。',
									name: 'data',
									required: true,
									type: 'FormOutput<TSchema, TValues>'
								},
								{
									description: '原生FormData快照。',
									name: 'formData',
									required: true,
									type: 'FormData'
								},
								{
									description: '原生提交事件。',
									name: 'originalEvent',
									required: true,
									type: 'SubmitEvent'
								}
							]
						}
					]
				}
			},
			{
				description: '验证失败后的错误与FormData。',
				name: 'onInvalidSubmit',
				type: '(detail: FormInvalidDetail) => void',
				callable: {
					parameters: [
						{
							name: 'detail',
							type: 'FormInvalidDetail',
							required: true,
							description: '回调payload。',
							members: [
								{
									description: '按FieldPath聚合的错误。',
									name: 'errors',
									required: true,
									type: 'FormErrors'
								},
								{
									description: '原生FormData快照。',
									name: 'formData',
									required: true,
									type: 'FormData'
								},
								{
									description: '原生提交事件。',
									name: 'originalEvent',
									required: true,
									type: 'SubmitEvent'
								}
							]
						}
					]
				}
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
				default: 'model模式true；native模式false',
				description:
					'字段条件卸载后保留状态，model模式同时保留值；Field可覆盖。native FormData不保留已卸载控件，FormList显式remove始终删除。',
				name: 'preserve',
				type: 'boolean'
			},
			{
				name: 'submitting',
				type: 'boolean',
				bindable: true,
				default: 'false',
				description:
					'等待onValidSubmit期间为true并阻止重复语义提交；reset只取消状态接收，不取消应用已发请求。'
			},
			{
				name: 'onStateChange',
				type: '(state: FormState) => void',
				default: 'undefined',
				description: '观察聚合状态的不可变快照；getState读取当前值。'
			},
			{
				name: 'onSubmitError',
				type: '(error: unknown) => void',
				default: 'undefined',
				description: 'onValidSubmit同步抛错或Promise拒绝时调用；未提供时重新抛出。'
			},
			{
				name: 'clearServerErrorsOnChange',
				type: 'boolean',
				default: 'true',
				description: '字段值改变时清理该字段server错误；schema与manual层继续由各自来源拥有。'
			},
			{
				name: 'model',
				type: 'FormModel<TValues>',
				default: 'undefined',
				description:
					'注入唯一业务值模型；未传时维持native FormData模式。模型模式由适配控件读取，不能同时传控件value/checked。'
			},
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
			{ name: 'data-submitting', values: ['true'], description: '正在等待语义提交处理器。' },
			{ description: '表单级禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '验证中。', name: 'data-validating', values: ['true'] },
			{ description: '已提交过。', name: 'data-submitted', values: ['true'] },
			{ description: '存在错误。', name: 'data-invalid', values: ['true'] },
			{ description: '表单级只读。', name: 'data-readonly', values: ['true'] },
			{
				description: '表单级尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'stable',
		summary:
			'Standard Schema typed输出、FieldPath依赖图、字段级竞态、DOM顺序首错导航与原生FormData的Form。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script
	lang="ts"
	generics="TSchema extends StandardSchemaV1 | undefined = undefined, TValues = unknown"
>
	import type { StandardSchemaV1 } from '@standard-schema/spec';
	import { onDestroy, tick, untrack } from 'svelte';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { NativeFormBaseline } from '../../runtime/form/native-form-baseline.js';
	import { FormValueControls } from '../../runtime/form/form-value-controls.js';
	import {
		getChangedFormPaths,
		getFormValue,
		type FormModel
	} from '../../runtime/form/form-model.svelte.js';
	import {
		FormRegistry,
		type FormValidationTicket,
		type FormFieldStatePatch
	} from '../../runtime/form/form-registry.svelte.js';
	import {
		provideZForm,
		type FormListRegistration
	} from '../../runtime/form/form-context.svelte.js';
	import {
		FormArrayController,
		type FormArrayMutationHost,
		type FormArrayOptions,
		type FormArrayLocation
	} from '../../runtime/form/form-array.svelte.js';
	import { type FormListReconcile } from '../../runtime/form/form-list-reconcile.js';
	import {
		fieldPathKey,
		fieldPathToString,
		fieldPathStartsWith,
		normalizeFieldPath,
		type FieldPath,
		type FieldPathInput
	} from '../../runtime/form/field-path.js';
	import {
		errorsForPaths,
		formDataToObject,
		issuesToFormErrors,
		type FormErrors
	} from '../../runtime/form/validation.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { sameStateValue } from '../../runtime/foundation/controllable-state.svelte.js';
	import {
		createFormErrorLayers,
		remapFormErrorLayers,
		setFormErrorLayer,
		clearFormErrorLayers,
		mergeFormErrorLayers
	} from '../../runtime/form/form-errors.js';

	const DEFAULT_VALIDATION_MESSAGES: ZFormValidationMessages = Object.freeze({});

	let {
		'aria-busy': ariaBusy,
		children,
		clearServerErrorsOnChange = true,
		class: className,
		controller = $bindable(null),
		disabled = false,
		errors = $bindable({}),
		focusFirstError = true,
		model,
		nativeValidation = false,
		onErrorsChange,
		onStateChange,
		onSubmitError,
		onInvalidSubmit,
		onreset,
		onsubmit,
		onValidSubmit,
		onValidationError,
		preventDefault = true,
		preserve,
		ref = $bindable(null),
		readonly = false,
		schema,
		scrollToFirstError = true,
		size,
		style,
		submitted = $bindable(false),
		submitting = $bindable(false),
		validateOn = ['submit'],
		validationDelay = 150,
		validationMessages = DEFAULT_VALIDATION_MESSAGES,
		validating = $bindable(false),
		...rest
	}: ZFormProps<TSchema, TValues> = $props();
	const zui = useZui();
	const lifecycle = { active: true };
	const nativeBaseline = new NativeFormBaseline();
	let nativeValueEpoch = 0;
	const valueControls = new FormValueControls();
	const validatedControls = new Set<string>();
	let draftRevision = $state(0);
	const lists = new Map<symbol, FormListRegistration>();
	let reconciledModel: FormModel<TValues> | undefined;
	let reconciledValues: unknown;
	const movingListScopes = new Map<string, FieldPath>();
	let listTransitionGeneration = 0;
	const pendingDirty = new Set<string>();
	let dirtyScheduled = false;
	let suppressModelValidation = false;
	let submissionId = 0;
	let pendingReset: Event | undefined;
	const stateListeners = new Set<(state: FormState) => void>();
	let errorLayers = createFormErrorLayers({ server: untrack(() => errors) });
	let publishedErrors = untrack(() => errors);
	const registry = new FormRegistry(
		(path, preserved) => {
			nativeBaseline.forget(fieldPathKey(path));
			if (!lifecycle.active) return;
			if (preserved) {
				// A destroyed control cannot retain its raw draft; retain only canonical baseline dirtiness.
				if (model)
					registry.setDirty(path, listForField(path)?.isDirty(path) ?? model.isDirty(path));
				publishErrorLayers();
				return;
			}
			if (model && typeof path.at(-1) !== 'number') model.removeFieldValue(path);
			clearErrors([path]);
		},
		(field) => {
			const epoch = nativeValueEpoch;
			void tick().then(() => {
				const current = registry.fieldInfo(field.instanceId);
				if (
					!lifecycle.active ||
					epoch !== nativeValueEpoch ||
					!current ||
					current.htmlName !== field.htmlName ||
					fieldPathKey(current.path) !== fieldPathKey(field.path)
				)
					return;
				if (model) registry.setDirty(field.path, fieldIsDirty(field.path));
				else {
					const data = readFormData();
					const key = fieldPathKey(field.path);
					nativeBaseline.capture(key, field.htmlName, data);
					registry.setDirty(field.path, nativeBaseline.isDirty(key, field.htmlName, data));
				}
			});
		}
	);
	// Timers and running validation IDs are lifecycle bookkeeping, not rendered collections.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const validationTimers = new Map<string, { readonly id: number; readonly view: Window }>();
	// Validation run ids are lifecycle bookkeeping, not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const validationRuns = new Set<number>();
	// One generation owns queued callbacks and already-running validation results.
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
	const formState = $derived.by((): FormState => {
		const fields = registry.summary();
		return Object.freeze({
			dirty: (model?.dirty ?? false) || fields.dirty,
			touched: fields.touched,
			submitted,
			submitting,
			validating,
			valid: !invalid && !hasInvalidDraft(),
			errors
		});
	});
	let reportedState: FormState | undefined;
	$effect(() => {
		const form = ref;
		const Observer = form?.ownerDocument.defaultView?.MutationObserver;
		if (!form || !Observer) return;
		const observer = new Observer((records) => {
			if (!records.some((record) => form.contains(record.target) || record.target.contains(form)))
				return;
			for (const id of registry.registeredInstances()) scheduleDirty(id);
		});
		observer.observe(form.ownerDocument.documentElement, {
			subtree: true,
			attributes: true,
			attributeFilter: ['disabled', 'data-disabled']
		});
		return () => observer.disconnect();
	});
	$effect(() => {
		const next = formState;
		const notify = onStateChange;
		untrack(() => {
			if (sameStateValue(reportedState, next)) return;
			reportedState = next;
			for (const listener of [notify, ...stateListeners]) {
				try {
					listener?.(next);
				} catch {
					/* Observers do not own the form transition. */
				}
			}
		});
	});

	function freezeErrors(next: FormErrors): FormErrors {
		return Object.freeze(
			Object.fromEntries(
				Object.entries(next).map(([path, messages]) => [path, Object.freeze([...messages])])
			)
		);
	}

	function publishErrors(next: FormErrors): void {
		errorLayers = setFormErrorLayer(errorLayers, 'server', next);
		publishErrorLayers();
	}
	function publishErrorLayers(): void {
		const merged: Record<string, readonly string[]> = { ...mergeFormErrorLayers(errorLayers) };
		for (const instanceId of registry.registeredInstances()) {
			const field = registry.fieldInfo(instanceId)!;
			if (!submitted && !validatedControls.has(instanceId) && !registry.state(field.path).touched)
				continue;
			const messages = valueControls
				.drafts(instanceId)
				.filter((draft) => !draft.valid)
				.map((draft) => draft.message || zui.localePack.form.invalidValue);
			if (messages.length === 0) continue;
			const key = fieldPathToString(field.path);
			merged[key] = [...new Set([...(merged[key] ?? []), ...messages])];
		}
		const next = freezeErrors(merged);
		registry.syncErrors(next);
		if (sameStateValue(errors, next)) {
			publishedErrors = errors;
			return;
		}
		publishedErrors = next;
		errors = next;
		onErrorsChange?.(next);
	}
	function clearErrors(paths?: readonly FieldPathInput[]): void {
		errorLayers = clearFormErrorLayers(errorLayers, { paths });
		publishErrorLayers();
	}
	function publishSchemaErrors(next: FormErrors, paths?: readonly FieldPath[]): void {
		errorLayers = setFormErrorLayer(errorLayers, 'schema', next, paths);
		publishErrorLayers();
	}
	function clearServerErrors(paths: readonly FieldPath[]): void {
		if (!clearServerErrorsOnChange) return;
		errorLayers = clearFormErrorLayers(errorLayers, { layers: ['server'], paths });
		publishErrorLayers();
	}

	function readFormData(submitter?: HTMLElement | null): FormData {
		if (!ref) return new FormData();
		const FormDataConstructor = ref.ownerDocument.defaultView?.FormData ?? FormData;
		return submitter ? new FormDataConstructor(ref, submitter) : new FormDataConstructor(ref);
	}

	function requireModel(): FormModel<TValues> {
		if (!model)
			throw new TypeError(
				'ZForm value writes require a model; native values remain owned by their controls.'
			);
		return model;
	}
	function listForField(path: FieldPath): FormListRegistration | undefined {
		return [...lists.values()]
			.filter(
				(list) =>
					list.active && path.length > list.path.length && fieldPathStartsWith(path, list.path)
			)
			.sort((left, right) => right.path.length - left.path.length)[0];
	}
	function fieldIsDirty(pathInput: FieldPathInput): boolean {
		const path = normalizeFieldPath(pathInput);
		return (
			(listForField(path)?.isDirty(path) ?? model?.isDirty(path) ?? false) || draftIsDirty(path)
		);
	}
	function draftIsDirty(path: FieldPath): boolean {
		draftRevision;
		return registry
			.registeredInstances()
			.some(
				(id) =>
					fieldPathKey(registry.fieldInfo(id)!.path) === fieldPathKey(path) &&
					valueControls.drafts(id).some((draft) => draft.dirty)
			);
	}
	function hasInvalidDraft(): boolean {
		draftRevision;
		return registry
			.registeredInstances()
			.some((id) => valueControls.drafts(id).some((draft) => !draft.valid));
	}
	function refreshDrafts(): void {
		if (valueControls.refresh()) {
			draftRevision += 1;
			// Raw edits may leave the canonical model unchanged; invalidate in-flight validation too.
			validationEpoch += 1;
		}
		publishErrorLayers();
	}
	function prepareList(change: FormListReconcile): { commit(): void } {
		const registryMutation = registry.prepareList(change);
		const nextErrorLayers = remapFormErrorLayers(errorLayers, change);
		let committed = false;
		return {
			commit() {
				if (committed) return;
				committed = true;
				movingListScopes.set(fieldPathKey(change.listPath), change.listPath);
				const transition = ++listTransitionGeneration;
				void tick().then(() => {
					if (transition === listTransitionGeneration) movingListScopes.clear();
				});
				validationEpoch += 1;
				clearValidationTimers();
				validationRuns.clear();
				validating = false;
				registry.batch(() => {
					registry.cancelValidation();
					registryMutation.commit();
					errorLayers = nextErrorLayers;
					publishErrorLayers();
					for (const path of registry.registeredPaths())
						registry.setDirty(path, fieldIsDirty(path));
				});
				reconciledModel = model;
				reconciledValues = model?.values;
			}
		};
	}
	function reconcileList(change: FormListReconcile): void {
		prepareList(change).commit();
	}
	function scheduleDirty(instanceId: string): void {
		pendingDirty.add(instanceId);
		if (dirtyScheduled) return;
		dirtyScheduled = true;
		const epoch = nativeValueEpoch;
		void tick().then(() => {
			if (!lifecycle.active || epoch !== nativeValueEpoch) return;
			dirtyScheduled = false;
			const instances = [...pendingDirty];
			pendingDirty.clear();
			refreshDrafts();
			const data = model ? undefined : readFormData();
			for (const id of instances) {
				const field = registry.fieldInfo(id);
				if (!field) continue;
				registry.setDirty(
					field.path,
					model
						? fieldIsDirty(field.path)
						: nativeBaseline.isDirty(fieldPathKey(field.path), field.htmlName, data!) ||
								draftIsDirty(normalizeFieldPath(field.path))
				);
			}
		});
	}
	function assertModelControls(): void {
		if (!model) return;
		for (const instanceId of registry.registeredInstances()) {
			if (valueControls.count(instanceId) !== 1)
				throw new TypeError(
					`ZForm model field ${JSON.stringify(registry.fieldInfo(instanceId)?.path)} requires exactly one supported value owner; use a compound control for multiple inputs.`
				);
		}
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
	): Promise<FormValidationResult<FormOutput<TSchema, TValues>>> {
		assertModelControls();
		const paths = uniquePaths(pathInputs);
		for (const id of registry.registeredInstances()) {
			const path = registry.fieldInfo(id)!.path;
			if (full || paths.some((target) => fieldPathStartsWith(path, target)))
				validatedControls.add(id);
		}
		refreshDrafts();
		const ticket = registry.beginValidation(paths);
		const epoch = validationEpoch;
		const runId = (validationRunId += 1);
		validationRuns.add(runId);
		validating = true;
		try {
			const input = model ? model.values : formDataToObject(formData, registry.formDataPaths());
			const result = schema ? await schema['~standard'].validate(input) : { value: input };
			refreshDrafts();
			const next: FormErrors = result.issues
				? issuesToFormErrors(result.issues)
				: Object.freeze({});
			const { outdated } = commitValidation(ticket, next, full, epoch);
			const scopedErrors: FormErrors = full ? errors : errorsForPaths(errors, paths);
			const valid =
				!outdated && Object.values(scopedErrors).every((messages) => messages.length === 0);
			return {
				data: valid && !result.issues ? (result.value as FormOutput<TSchema, TValues>) : undefined,
				errors: scopedErrors,
				outdated,
				valid
			};
		} catch (error) {
			const message = validationMessages.unexpected ?? zui.localePack.form.unexpectedValidation;
			const next = freezeErrors(
				full
					? { '': [message] }
					: Object.fromEntries(paths.map((path) => [fieldPathToString(path), [message]]))
			);
			const { accepted, outdated } = commitValidation(ticket, next, full, epoch);
			if (!outdated || accepted.length > 0) onValidationError?.(error);
			return { errors: next, outdated, valid: false };
		} finally {
			validationRuns.delete(runId);
			if (lifecycle.active) validating = validationRuns.size > 0;
		}
	}

	function clearValidationTimers(): void {
		for (const timer of validationTimers.values()) timer.view.clearTimeout(timer.id);
		validationTimers.clear();
	}
	function commitValidation(
		ticket: FormValidationTicket,
		next: FormErrors,
		full: boolean,
		epoch: number
	): { readonly accepted: readonly FieldPath[]; readonly outdated: boolean } {
		let accepted: readonly FieldPath[] = [];
		let outdated = true;
		if (epoch !== validationEpoch || !lifecycle.active) return { accepted, outdated };
		registry.batch(() => {
			accepted = registry.finishValidation(ticket, next, { publishErrors: false });
			outdated = epoch !== validationEpoch || accepted.length !== ticket.entries.length;
			if (full && !outdated) publishSchemaErrors(next);
			else if (accepted.length > 0) publishSchemaErrors(next, accepted);
		});
		return { accepted, outdated };
	}

	function scheduleValidation(trigger: 'blur' | 'change', paths: readonly FieldPath[]): void {
		if (!triggers.has(trigger) || !ref || paths.length === 0) return;
		const scopeKey = JSON.stringify(paths.map(fieldPathKey).sort());
		const previous = validationTimers.get(scopeKey);
		if (previous) previous.view.clearTimeout(previous.id);
		// clearTimeout cannot cancel queued blur/zero-delay microtasks.
		const scheduleEpoch = validationEpoch;
		const run = () => {
			if (scheduleEpoch !== validationEpoch || !lifecycle.active) return;
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
		createArray<T>(
			path: FieldPathInput,
			options?: FormArrayOptions<T>,
			location?: FormArrayLocation,
			mutationHost?: FormArrayMutationHost
		) {
			return new FormArrayController<T, TValues>(
				requireModel(),
				path,
				options,
				location,
				mutationHost
			);
		},
		registerList(registration) {
			for (const list of lists.values()) {
				if (!list.active || !registration.active) continue;
				if (fieldPathKey(list.path) === fieldPathKey(registration.path))
					throw new Error('ZFormList requires one owner per array path.');
				if (
					fieldPathStartsWith(registration.path, list.path) &&
					!registration.ancestors.includes(list.owner)
				)
					throw new Error('A nested ZFormList must render inside its parent list.');
				if (
					fieldPathStartsWith(list.path, registration.path) &&
					!list.ancestors.includes(registration.owner)
				)
					throw new Error('A nested ZFormList must render inside its parent list.');
			}
			const token = Symbol();
			lists.set(token, registration);
			return () => {
				lists.delete(token);
			};
		},
		prepareList,
		reconcileList,
		get model() {
			return model;
		},
		registerValueControl(instanceId, element, draftState, resetDraft) {
			const unregister = valueControls.register(instanceId, element, draftState, resetDraft);
			scheduleDirty(instanceId);
			return () => {
				const field = registry.fieldInfo(instanceId);
				unregister();
				validatedControls.delete(instanceId);
				if (!lifecycle.active) return;
				draftRevision += 1;
				if (field && model) registry.setDirty(field.path, fieldIsDirty(field.path));
				scheduleDirty(instanceId);
			};
		},
		controlValueChanged: scheduleDirty,
		get disabled() {
			return disabled;
		},
		fieldEvent(instanceId, trigger) {
			const field = registry.fieldInfo(instanceId);
			if (
				trigger === 'blur' &&
				field &&
				[...movingListScopes.values()].some((scope) =>
					fieldPathStartsWith(normalizeFieldPath(field.path), scope)
				)
			)
				return;
			if (trigger === 'change') scheduleDirty(instanceId);
			else {
				registry.markTouched(instanceId);
				refreshDrafts();
			}
			if (model && trigger === 'change') return;
			if (trigger === 'change' && field) clearServerErrors([normalizeFieldPath(field.path)]);
			scheduleValidation(trigger, registry.affectedPaths(instanceId));
		},
		get readonly() {
			return readonly;
		},
		get preserve() {
			return preserve ?? model !== undefined;
		},
		registry,
		get size() {
			return size;
		},
		get submitted() {
			return submitted;
		}
	});
	let observedModel: FormModel<TValues> | undefined;
	let observedSchema = untrack(() => schema);
	$effect(() => {
		const current = schema;
		untrack(() => {
			if (current === observedSchema) return;
			observedSchema = current;
			validationEpoch += 1;
			clearValidationTimers();
			validationRuns.clear();
			validating = false;
			registry.cancelValidation();
			publishSchemaErrors({});
		});
	});
	let observedValues: unknown;
	let observedBaseline: unknown;
	let pendingModelOwner: FormModel<TValues> | undefined;
	let pendingModelPaths: readonly FieldPath[] = [];
	$effect(() => {
		const current = model;
		if (!current) return;
		return current.subscribe((detail) => {
			pendingModelPaths = uniquePaths([
				...(pendingModelOwner === current ? pendingModelPaths : []),
				...detail.changedPaths
			]);
			pendingModelOwner = current;
		});
	});
	$effect(() => {
		const currentModel = model;
		const currentValues = currentModel?.values;
		const currentBaseline = currentModel?.defaultValues;
		untrack(() => {
			const sameOwner = currentModel === observedModel;
			const hadModel = observedModel !== undefined;
			const previous = observedValues;
			const baselineChanged = currentBaseline !== observedBaseline;
			const valuesChanged = !sameStateValue(previous, currentValues);
			const changedInputPaths =
				pendingModelOwner === currentModel && pendingModelPaths.length > 0
					? pendingModelPaths
					: getChangedFormPaths(previous, currentValues);
			pendingModelOwner = undefined;
			pendingModelPaths = [];
			observedModel = currentModel;
			observedValues = currentValues;
			observedBaseline = currentBaseline;
			if (!sameOwner || baselineChanged || valuesChanged) {
				validationEpoch += 1;
				clearValidationTimers();
				registry.cancelValidation();
				validationRuns.clear();
				validating = false;
			}
			if (!sameOwner && hadModel) {
				nativeValueEpoch += 1;
				dirtyScheduled = false;
				pendingDirty.clear();
				nativeBaseline.clear();
				registry.reset();
				clearErrors();
				if (!currentModel) {
					const epoch = nativeValueEpoch;
					void tick().then(() => {
						if (!lifecycle.active || epoch !== nativeValueEpoch) return;
						const data = readFormData();
						for (const [name, path] of registry.formDataPaths())
							nativeBaseline.capture(fieldPathKey(path), name, data);
					});
				}
			}
			if (!currentModel) return;
			for (const path of registry.registeredPaths()) registry.setDirty(path, fieldIsDirty(path));
			if (!sameOwner || baselineChanged || !valuesChanged || suppressModelValidation) return;
			if (currentModel !== reconciledModel || currentValues !== reconciledValues)
				clearServerErrors(changedInputPaths);
			reconciledModel = undefined;
			reconciledValues = undefined;
			scheduleValidation(
				'change',
				uniquePaths([...changedInputPaths, ...registry.affectedPathsFor(changedInputPaths)])
			);
		});
	});
	$effect(() => {
		const externalErrors = errors;
		untrack(() => {
			if (externalErrors !== publishedErrors) publishErrors(externalErrors);
			else registry.syncErrors(errors);
		});
	});

	function resetFromForm(): void {
		validatedControls.clear();
		pendingReset = undefined;
		submissionId += 1;
		submitting = false;
		suppressModelValidation = true;
		model?.reset();
		nativeValueEpoch += 1;
		pendingDirty.clear();
		dirtyScheduled = false;
		nativeBaseline.clear();
		const epoch = nativeValueEpoch;
		void tick().then(() => {
			if (!lifecycle.active || epoch !== nativeValueEpoch) return;
			suppressModelValidation = false;
			const data = readFormData();
			for (const [name, path] of registry.formDataPaths())
				nativeBaseline.capture(fieldPathKey(path), name, data);
			if (model)
				for (const path of registry.registeredPaths()) registry.setDirty(path, fieldIsDirty(path));
		});
		validationEpoch += 1;
		clearValidationTimers();
		validationRuns.clear();
		validating = false;
		submitted = false;
		registry.reset();
		clearErrors();
	}

	function setFieldFeedback(path: FieldPathInput, feedback: FormFieldStatePatch): void {
		registry.batch(() => {
			const { errors: manualErrors, ...visual } = feedback;
			registry.setFieldState(path, visual);
			if (manualErrors !== undefined) {
				const normalized = normalizeFieldPath(path);
				errorLayers = setFormErrorLayer(
					errorLayers,
					'manual',
					{ [fieldPathToString(normalized)]: manualErrors },
					[normalized]
				);
				publishErrorLayers();
			}
		});
	}
	const formController: ZFormController<FormOutput<TSchema, TValues>, TValues> = {
		getState: () => formState,
		subscribeState(listener) {
			stateListeners.add(listener);
			return () => {
				stateListeners.delete(listener);
			};
		},
		getValues: () =>
			model
				? model.values
				: (formDataToObject(readFormData(), registry.formDataPaths()) as TValues),
		getFieldValue: (path) =>
			getFormValue(
				model ? model.values : formDataToObject(readFormData(), registry.formDataPaths()),
				path
			),
		setValues: (values) => requireModel().setValues(values),
		setFieldValue: (path, value) => requireModel().setField(path, value),
		initialize: (values, options) => requireModel().initialize(values, options),
		resetField(path) {
			const current = requireModel();
			suppressModelValidation = true;
			try {
				const normalized = normalizeFieldPath(path);
				const list = listForField(normalized);
				if (list) list.resetField(normalized);
				else current.resetField(path);
				if (!(list?.isDirty(normalized) ?? current.isDirty(normalized)))
					registry.batch(() => {
						for (const id of registry.registeredInstances()) {
							if (!fieldPathStartsWith(registry.fieldInfo(id)!.path, normalized)) continue;
							valueControls.resetDraft(id);
							validatedControls.delete(id);
						}
						refreshDrafts();
						registry.resetField(path);
						clearErrors([path]);
					});
			} finally {
				void tick().then(() => {
					suppressModelValidation = false;
				});
			}
		},
		clearErrors,
		focusField: (path, options) => registry.focusField(path, options),
		getFieldState: (path) =>
			model
				? Object.freeze({ ...registry.state(path), dirty: fieldIsDirty(path) })
				: registry.state(path),
		reset() {
			if (ref) ref.reset();
			else resetFromForm();
		},
		scrollToField: (path, options) => registry.scrollToField(path, options),
		setErrors: publishErrors,
		setFieldFeedback,
		setFieldState: setFieldFeedback,
		subscribeField: (path, listener) => registry.subscribeField(path, listener),
		validate: async () => {
			await tick();
			clearValidationTimers();
			validationEpoch += 1;
			return validatePaths(registry.registeredPaths(), true);
		},
		validateField: async (path) => {
			await tick();
			return validatePaths([path], false);
		}
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
		if (event.defaultPrevented) return;
		if (disabled) {
			event.preventDefault();
			return;
		}
		if (submitting) {
			event.preventDefault();
			return;
		}
		const currentSubmission = ++submissionId;
		if (preventDefault || schema) event.preventDefault();
		await tick();
		if (
			currentSubmission !== submissionId ||
			!lifecycle.active ||
			disabled ||
			(pendingReset && !pendingReset.defaultPrevented)
		)
			return;
		clearValidationTimers();
		// A submit is a new validation epoch: pending change/blur promises may finish later,
		// but their results must never be allowed to compete with this full-form submission.
		validationEpoch += 1;
		submitted = true;
		registry.markAllTouched();
		const formData = readFormData(event.submitter);
		const result = await validatePaths(registry.registeredPaths(), true, formData);
		if (result.outdated || currentSubmission !== submissionId || !lifecycle.active || disabled)
			return;
		if (!result.valid) {
			onInvalidSubmit?.({ errors: result.errors, formData, originalEvent: event });
			if (focusFirstError || scrollToFirstError) {
				await tick();
				if (currentSubmission !== submissionId || !lifecycle.active || disabled) return;
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
			submitting = true;
			try {
				await onValidSubmit?.({
					data: result.data as FormOutput<TSchema, TValues>,
					formData,
					originalEvent: event
				});
			} catch (error) {
				if (currentSubmission !== submissionId || !lifecycle.active) return;
				if (onSubmitError) onSubmitError(error);
				else throw error;
			} finally {
				if (currentSubmission === submissionId && lifecycle.active) submitting = false;
			}
		}
	}

	onDestroy(() => {
		lifecycle.active = false;
		submissionId += 1;
		stateListeners.clear();
		nativeValueEpoch += 1;
		nativeBaseline.clear();
		pendingDirty.clear();
		valueControls.clear();
		validatedControls.clear();
		lists.clear();
		movingListScopes.clear();
		listTransitionGeneration += 1;
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
	aria-busy={validating || submitting ? true : ariaBusy}
	data-disabled={disabled || undefined}
	data-validating={validating || undefined}
	data-submitted={submitted || undefined}
	data-submitting={submitting || undefined}
	data-invalid={invalid || undefined}
	data-readonly={readonly || undefined}
	data-size={size}
	onsubmit={handleSubmit}
	onreset={(event) => {
		onreset?.(event);
		// The default reset signal is deferred. A submit queued earlier must see the accepted reset,
		// while a later listener can still cancel this event before either microtask resumes.
		pendingReset = event;
		queueMicrotask(() => {
			if (pendingReset === event && event.defaultPrevented) pendingReset = undefined;
		});
	}}
>
	<FormResetSignal onReset={resetFromForm} owner={ref} />
	{@render children?.()}
</form>
