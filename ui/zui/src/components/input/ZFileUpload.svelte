<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FileRejection, FileUploadItem } from '../../runtime/file.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface FileUploadTransportContext {
		readonly item: FileUploadItem;
		readonly signal: AbortSignal;
		reportProgress(progress: number): void;
	}

	/** Application-owned transport boundary. ZUI never creates a URL, request, credential or cache. */
	export type FileUploadTransport = (context: FileUploadTransportContext) => Promise<void> | void;

	export interface ZFileUploadController {
		readonly files: readonly FileUploadItem[];
		abort(id: string): void;
		clear(): void;
		open(): void;
		remove(id: string): void;
		retry(id: string): Promise<void>;
		upload(id?: string): Promise<void>;
	}

	export interface ZFileUploadProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'ondragenter' | 'ondragleave' | 'ondragover' | 'ondrop'
	> {
		readonly abortLabel?: (item: FileUploadItem) => string;
		readonly accept?: string;
		readonly autoUpload?: boolean;
		readonly chooseLabel?: string;
		readonly controlId?: string;
		controller?: ZFileUploadController | null;
		readonly defaultFiles?: readonly FileUploadItem[];
		readonly disabled?: boolean;
		readonly dropLabel?: string;
		readonly emptyText?: string;
		readonly errorMessage?: (error: unknown, item: FileUploadItem) => string;
		files?: readonly FileUploadItem[];
		readonly form?: string;
		inputRef?: HTMLInputElement | null;
		readonly inputLabel?: string;
		readonly invalid?: boolean;
		readonly maxFiles?: number;
		readonly maxSize?: number;
		readonly multiple?: boolean;
		readonly name?: string;
		readonly onFilesChange?: (files: readonly FileUploadItem[]) => void;
		readonly onReject?: (rejections: readonly FileRejection<File>[]) => void;
		readonly queueLabel?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly removeLabel?: (item: FileUploadItem) => string;
		readonly required?: boolean;
		readonly retryLabel?: (item: FileUploadItem) => string;
		readonly transport?: FileUploadTransport;
		readonly uploadLabel?: (item: FileUploadItem) => string;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'file-upload',
		importStatement: "import { ZFileUpload } from '@zadmin/zui';",
		name: 'ZFileUpload',
		bindings: [
			{ description: 'typed文件队列及其状态。', name: 'files', type: 'readonly FileUploadItem[]' },
			{
				description: '选择、上传、重试、中止、移除和清空命令。',
				name: 'controller',
				type: 'ZFileUploadController | null'
			},
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '原生file picker引用。', name: 'inputRef', type: 'HTMLInputElement | null' }
		],
		dependencies: [
			'native file input',
			'FileFormValueBridge',
			'owner realm DataTransfer and AbortController',
			'ReducedMotionState',
			'ZButton',
			'ZProgress'
		],
		events: [
			{
				description: '选择、状态迁移、移除或清空后的完整不可变队列。',
				name: 'onFilesChange',
				type: '(files: readonly FileUploadItem[]) => void'
			},
			{
				description: '按type、size、duplicate或max-files返回拒绝项。',
				name: 'onReject',
				type: '(rejections: readonly FileRejection<File>[]) => void',
				callable: {
					parameters: [
						{
							name: 'rejections',
							description: '拒绝项数组；元素结构见FileRejection。',
							required: true,
							type: 'readonly FileRejection<File>[]'
						}
					]
				}
			}
		],
		keyboard: [
			{ description: '在drop zone打开原生文件选择器。', key: 'Enter / Space' },
			{ description: '执行对应上传、中止、重试或移除命令。', key: 'Action button Enter / Space' }
		],
		parts: [
			{ description: '原生按钮语义的选择和拖放边界。', name: 'dropzone' },
			{ description: '不可见原生file picker。', name: 'input' },
			{ description: '命名文件队列。', name: 'list' },
			{ description: '单个typed队列项。', name: 'item' },
			{ description: '文件状态文本。', name: 'status' },
			{ description: '上传进度。', name: 'progress' },
			{ description: '单项命令集合。', name: 'actions' }
		],
		props: [
			{
				default: 'Provider localePack.fileUpload.abortUpload(item.file.name)',
				description: 'uploading项的中止命令名称。',
				name: 'abortLabel',
				type: '(item: FileUploadItem) => string'
			},
			{
				default: 'Provider localePack.fileUpload.chooseFiles',
				description: 'drop zone主操作文本。',
				name: 'chooseLabel',
				type: 'string'
			},
			{
				default: 'Field controlId或自动ID',
				description: 'drop zone按钮ID及Field focus owner。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: '继承Field或false',
				description: '退出选择、拖放、命令和FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.fileUpload.dropFiles',
				description: '选择按钮内的拖放说明。',
				name: 'dropLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.fileUpload.emptyQueue',
				description: '命名文件列表为空时的本地化状态。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: 'Provider localePack.fileUpload.failed(item.file.name)',
				description: '将未知transport错误映射为安全呈现字符串。',
				name: 'errorMessage',
				type: '(error: unknown, item: FileUploadItem) => string'
			},
			{
				default: '最近祖先form',
				description: 'FileFormValueBridge关联的外部form。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Provider localePack.fileUpload.inputLabel',
				description: '不可见原生file picker的可访问名称。',
				name: 'inputLabel',
				type: 'string'
			},
			{
				default: '继承Field或false',
				description: '投射到根data-invalid并通过Field关系命名真实button。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.fileUpload.queueLabel',
				description: 'typed文件list的可访问名称。',
				name: 'queueLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.fileUpload.removeFile(item.file.name)',
				description: '单项移除命令名称；uploading项会先中止对应世代。',
				name: 'removeLabel',
				type: '(item: FileUploadItem) => string'
			},
			{
				default: '继承Field或false',
				description: '投射到根data-required；业务阻断由Field/Form schema拥有。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.fileUpload.retryUpload(item.file.name)',
				description: 'error或aborted项的重试命令名称。',
				name: 'retryLabel',
				type: '(item: FileUploadItem) => string'
			},
			{
				default: 'Provider localePack.fileUpload.uploadFile(item.file.name)',
				description: '手动queued项的上传命令名称。',
				name: 'uploadLabel',
				type: '(item: FileUploadItem) => string'
			},
			{
				bindable: true,
				default: '[]',
				description: '含id、File、status、progress和error的受控队列。',
				name: 'files',
				type: 'readonly FileUploadItem[]',
				members: [
					{ description: '稳定文件业务身份。', name: 'id', type: 'string', required: true },
					{
						description: '浏览器File对象；传输响应不属于队列项。',
						name: 'file',
						type: 'File',
						required: true
					},
					{ description: '队列状态。', name: 'status', type: 'FileUploadStatus', required: true },
					{
						description: '确定进度，范围0–100。',
						name: 'progress',
						type: 'number',
						required: true
					},
					{
						description: '错误详情，仅错误状态存在。',
						name: 'error',
						type: 'string',
						requiredWhen: "status === 'error'"
					}
				]
			},
			{
				default: '[]',
				description: '非受控初始typed队列；form reset恢复它。',
				name: 'defaultFiles',
				type: 'readonly FileUploadItem[]',
				members: [
					{ description: '稳定文件业务身份。', name: 'id', type: 'string', required: true },
					{
						description: '浏览器File对象；传输响应不属于队列项。',
						name: 'file',
						type: 'File',
						required: true
					},
					{ description: '队列状态。', name: 'status', type: 'FileUploadStatus', required: true },
					{
						description: '确定进度，范围0–100。',
						name: 'progress',
						type: 'number',
						required: true
					},
					{
						description: '错误详情，仅错误状态存在。',
						name: 'error',
						type: 'string',
						requiredWhen: "status === 'error'"
					}
				]
			},
			{ default: 'undefined', description: '原生accept规则。', name: 'accept', type: 'string' },
			{
				default: 'false',
				description: '允许一批选择多个文件。',
				name: 'multiple',
				type: 'boolean'
			},
			{ default: 'Infinity', description: '最大队列长度。', name: 'maxFiles', type: 'number' },
			{ default: 'undefined', description: '单文件最大字节数。', name: 'maxSize', type: 'number' },
			{
				default: 'undefined',
				description: '调用方上传适配器；接收owner-realm AbortSignal和进度命令。',
				name: 'transport',
				type: 'FileUploadTransport',
				callable: {
					parameters: [
						{
							name: 'context',
							type: 'FileUploadTransportContext',
							required: true,
							description: 'transport payload。',
							members: [
								{
									description: '当前队列项。',
									name: 'item',
									required: true,
									type: 'FileUploadItem'
								},
								{
									description: '取消信号；transport必须尊重。',
									name: 'signal',
									required: true,
									type: 'AbortSignal'
								},
								{
									description: '报告0–100进度。',
									name: 'reportProgress',
									required: true,
									type: '(progress: number) => void'
								}
							]
						}
					]
				}
			},
			{
				default: 'false',
				description: '加入队列后是否自动调用transport；默认显式手动上传。',
				name: 'autoUpload',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: 'FormData中每个File重复使用的字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'false',
				description: '保留焦点和FormData，但阻止选择及队列命令。',
				name: 'readonly',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZFileUpload.svelte',
		states: [
			{ description: '文件正位于drop zone。', name: 'data-dragging', values: ['true'] },
			{ description: '达到maxFiles或单文件上限。', name: 'data-full', values: ['true'] },
			{ description: 'Field或显式invalid。', name: 'data-invalid', values: ['true'] },
			{ description: '只读但仍参与表单。', name: 'data-readonly', values: ['true'] },
			{ description: 'Field或显式required。', name: 'data-required', values: ['true'] },
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: '选择/拖放、typed队列状态机、调用方transport命令和真实FormData边界。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._medium;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { disabled: false }
	});
	const dropzoneRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.dashed;
			s.borderWidth._medium;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.justifyContent.center;
			s.padding._xlarge;
			s.transitionDuration._fast;
			s.transitionProperty.raw('background-color, border-color, color, opacity');
			s.transitionTimingFunction._standard;
			s.width.percent(100);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			dragging: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._surface;
					s.borderColor._primary;
				}
			},
			invalid: { false: () => undefined, true: (s) => s.borderColor._danger },
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			readonly: { false: () => undefined, true: (s) => s.cursor.default }
		},
		defaultVariants: {
			disabled: false,
			dragging: false,
			invalid: false,
			motion: 'auto',
			readonly: false
		}
	});
	const listRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.padding._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const detailsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
	});
	const headingRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._small;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const statusRecipe = defineRecipe({
		base: (s) => s.fontSize._small,
		variants: {
			status: {
				aborted: (s) => s.color._textMuted,
				error: (s) => s.color._danger,
				queued: (s) => s.color._textMuted,
				success: (s) => s.color._success,
				uploading: (s) => s.color._primary
			}
		},
		defaultVariants: { status: 'queued' }
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._xsmall;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [
		rootRecipe,
		dropzoneRecipe,
		listRecipe,
		itemRecipe,
		detailsRecipe,
		headingRecipe,
		statusRecipe,
		actionsRecipe
	])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleStop from '@lucide/svelte/icons/circle-stop';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import FileIcon from '@lucide/svelte/icons/file';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		createFileUploadItem,
		normalizeFileUploadItems,
		normalizeFileUploadProgress,
		validateFileQueue,
		type FileUploadStatus
	} from '../../runtime/file.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FileFormValueBridge from '../../runtime/form/FileFormValueBridge.svelte';
	import ZProgress from '../data-display/ZProgress.svelte';
	import ZButton from '../gene/ZButton.svelte';

	interface ActiveRequest {
		readonly controller: AbortController;
		readonly file: File;
		readonly generation: number;
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-labelledby': ariaLabelledBy,
		abortLabel,
		accept,
		autoUpload = false,
		chooseLabel,
		class: className,
		controlId: controlIdProp,
		controller = $bindable(null),
		defaultFiles = [],
		disabled: disabledProp = false,
		dropLabel,
		emptyText,
		errorMessage,
		files = $bindable(),
		form,
		id,
		inputLabel,
		inputRef = $bindable(null),
		invalid,
		maxFiles = Number.POSITIVE_INFINITY,
		maxSize,
		multiple = false,
		name: nameProp,
		onFilesChange,
		onReject,
		queueLabel,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		removeLabel,
		required: requiredProp = false,
		retryLabel,
		style,
		transport,
		uploadLabel,
		...rest
	}: ZFileUploadProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'file-upload'));
	const resolvedRootId = $derived(id ?? `${idBase}-root`);
	const resolvedControlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-dropzone`);
	const inputId = $derived(`${idBase}-input`);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedChooseLabel = $derived(chooseLabel ?? zui.localePack.fileUpload.chooseFiles);
	const resolvedDropLabel = $derived(dropLabel ?? zui.localePack.fileUpload.dropFiles);
	const resolvedInputLabel = $derived(inputLabel ?? zui.localePack.fileUpload.inputLabel);
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.fileUpload.emptyQueue);
	const resolvedQueueLabel = $derived(queueLabel ?? zui.localePack.fileUpload.queueLabel);
	const constraints = $derived.by(() => {
		if (!(maxFiles === Number.POSITIVE_INFINITY || (Number.isInteger(maxFiles) && maxFiles >= 1))) {
			throw new TypeError('ZFileUpload maxFiles must be a positive integer.');
		}
		if (maxSize !== undefined && (!Number.isFinite(maxSize) || maxSize < 0)) {
			throw new TypeError('ZFileUpload maxSize must be non-negative and finite.');
		}
		if (autoUpload && !transport) {
			throw new TypeError('ZFileUpload autoUpload requires a transport.');
		}
		return { maxFiles, maxSize };
	});
	const fileState = new ControllableState<readonly FileUploadItem[]>({
		defaultValue: () => normalizeFileUploadItems(defaultFiles, 'ZFileUpload defaultFiles'),
		onChange: () => onFilesChange,
		read: () => files,
		write: (next) => (files = next)
	});
	const resolvedFiles = $derived(normalizeFileUploadItems(fileState.current, 'ZFileUpload files'));
	let dragging = $state(false);
	let dragDepth = 0;
	let itemSequence = 0;
	let requestGeneration = 0;
	// Request registry is an imperative lifecycle cache, not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const activeRequests = new Map<string, ActiveRequest>();
	let dropzoneRef = $state<HTMLButtonElement | null>(null);
	const full = $derived(
		resolvedFiles.length >= constraints.maxFiles || (!multiple && resolvedFiles.length >= 1)
	);
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled }));
	const dropzoneClass = $derived(
		zui.recipe(dropzoneRecipe, {
			disabled,
			dragging,
			invalid: resolvedInvalid,
			motion: reduced ? 'reduced' : 'full',
			readonly
		})
	);
	const listClass = $derived(zui.recipe(listRecipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const detailsClass = $derived(zui.recipe(detailsRecipe));
	const headingClass = $derived(zui.recipe(headingRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const progressFormatter = $derived(
		new Intl.NumberFormat(zui.locale, { maximumFractionDigits: 0, style: 'percent' })
	);

	function formatSize(file: File): string {
		return `${numberFormatter.format(file.size)} B`;
	}
	function formatProgress(value: number): string {
		return progressFormatter.format(value / 100);
	}
	function statusText(item: FileUploadItem): string {
		switch (item.status) {
			case 'aborted':
				return zui.localePack.fileUpload.statusAborted;
			case 'error':
				return item.error ?? zui.localePack.fileUpload.failed(item.file.name);
			case 'queued':
				return zui.localePack.fileUpload.statusQueued;
			case 'success':
				return zui.localePack.fileUpload.statusSuccess;
			case 'uploading':
				return zui.localePack.fileUpload.uploading(item.file.name, formatProgress(item.progress));
		}
	}
	function statusClass(status: FileUploadStatus): string {
		return zui.recipe(statusRecipe, { status });
	}
	function allocateId(): string {
		const ids = new Set(resolvedFiles.map((item) => item.id));
		let candidate: string;
		do candidate = `${idBase}-item-${(itemSequence += 1)}`;
		while (ids.has(candidate));
		return candidate;
	}
	function replaceItem(
		id: string,
		status: FileUploadStatus,
		progress: number,
		error?: string
	): FileUploadItem | undefined {
		const index = resolvedFiles.findIndex((item) => item.id === id);
		if (index < 0) return undefined;
		const current = resolvedFiles[index];
		const nextItem = createFileUploadItem(id, current.file, { error, progress, status });
		fileState.setFromUser(
			Object.freeze(resolvedFiles.map((item, itemIndex) => (itemIndex === index ? nextItem : item)))
		);
		return nextItem;
	}
	function cancelRequest(id: string, updateStatus: boolean): void {
		const request = activeRequests.get(id);
		if (!request) return;
		activeRequests.delete(id);
		request.controller.abort();
		if (updateStatus) {
			const item = resolvedFiles.find((candidate) => candidate.id === id);
			if (item) replaceItem(id, 'aborted', item.progress);
		}
	}
	function cancelAll(updateStatus: boolean): void {
		for (const id of [...activeRequests.keys()]) cancelRequest(id, updateStatus);
	}
	function getErrorMessage(error: unknown, item: FileUploadItem): string {
		return errorMessage?.(error, item) ?? zui.localePack.fileUpload.failed(item.file.name);
	}
	async function startUpload(id: string, retry = false): Promise<void> {
		if (disabled || readonly) return;
		if (!transport) throw new TypeError('ZFileUpload upload commands require a transport.');
		const item = resolvedFiles.find((candidate) => candidate.id === id);
		if (!item || item.status === 'uploading' || item.status === 'success') return;
		if (retry ? !['aborted', 'error'].includes(item.status) : item.status !== 'queued') return;
		const AbortControllerConstructor = ref?.ownerDocument.defaultView?.AbortController;
		if (!AbortControllerConstructor) {
			throw new TypeError('ZFileUpload requires its owner Window before starting transport.');
		}
		cancelRequest(id, false);
		const request: ActiveRequest = {
			controller: new AbortControllerConstructor(),
			file: item.file,
			generation: (requestGeneration += 1)
		};
		activeRequests.set(id, request);
		const uploadingItem = replaceItem(id, 'uploading', retry ? 0 : item.progress);
		if (!uploadingItem) return;
		try {
			await transport({
				item: uploadingItem,
				reportProgress(progress) {
					const currentRequest = activeRequests.get(id);
					if (
						currentRequest?.generation !== request.generation ||
						currentRequest.file !== request.file ||
						request.controller.signal.aborted
					)
						return;
					replaceItem(id, 'uploading', normalizeFileUploadProgress(progress));
				},
				signal: request.controller.signal
			});
			if (
				activeRequests.get(id)?.generation !== request.generation ||
				activeRequests.get(id)?.file !== request.file ||
				request.controller.signal.aborted
			)
				return;
			replaceItem(id, 'success', 100);
		} catch (error) {
			if (
				activeRequests.get(id)?.generation !== request.generation ||
				activeRequests.get(id)?.file !== request.file
			)
				return;
			const current = resolvedFiles.find((candidate) => candidate.id === id) ?? uploadingItem;
			if (request.controller.signal.aborted) replaceItem(id, 'aborted', current.progress);
			else replaceItem(id, 'error', current.progress, getErrorMessage(error, current));
		} finally {
			if (activeRequests.get(id)?.generation === request.generation) activeRequests.delete(id);
		}
	}
	async function upload(id?: string): Promise<void> {
		const targets = id
			? resolvedFiles.filter((item) => item.id === id && item.status === 'queued')
			: resolvedFiles.filter((item) => item.status === 'queued');
		await Promise.all(targets.map((item) => startUpload(item.id)));
	}
	async function retry(id: string): Promise<void> {
		await startUpload(id, true);
	}
	function remove(id: string): void {
		if (disabled || readonly) return;
		cancelRequest(id, false);
		fileState.setFromUser(Object.freeze(resolvedFiles.filter((item) => item.id !== id)));
	}
	function clear(): void {
		if (disabled || readonly || resolvedFiles.length === 0) return;
		cancelAll(false);
		fileState.setFromUser(Object.freeze([]));
	}
	function open(): void {
		if (!disabled && !readonly && !full) inputRef?.click();
	}
	const publicController: ZFileUploadController = {
		get files() {
			return resolvedFiles;
		},
		abort: (id) => {
			if (!disabled && !readonly) cancelRequest(id, true);
		},
		clear,
		open,
		remove,
		retry,
		upload
	};
	function resetFromForm(): void {
		cancelAll(false);
		fileState.reset();
		dragDepth = 0;
		dragging = false;
	}
	function syncNative(next: readonly FileUploadItem[]): void {
		const input = inputRef;
		const DataTransferConstructor = input?.ownerDocument.defaultView?.DataTransfer;
		if (!input || !DataTransferConstructor) return;
		try {
			const transfer = new DataTransferConstructor();
			for (const item of next) transfer.items.add(item.file);
			input.files = transfer.files;
		} catch {
			// FileFormValueBridge remains authoritative in realms that reject synthetic FileLists.
		}
	}
	function add(candidates: readonly File[]): void {
		if (disabled || readonly || candidates.length === 0) return;
		const result = validateFileQueue(
			resolvedFiles.map((item) => item.file),
			candidates,
			{ accept, maxFiles: constraints.maxFiles, maxSize: constraints.maxSize, multiple }
		);
		if (result.rejected.length > 0) onReject?.(result.rejected);
		const acceptedCandidates = result.accepted.slice(resolvedFiles.length);
		if (acceptedCandidates.length === 0) return;
		fileState.setFromUser(
			Object.freeze([
				...resolvedFiles,
				...acceptedCandidates.map((file) => createFileUploadItem(allocateId(), file))
			])
		);
	}
	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		add([...(event.currentTarget.files ?? [])]);
		queueMicrotask(() => syncNative(resolvedFiles));
	}
	function isFileDrag(event: DragEvent): boolean {
		return [...(event.dataTransfer?.types ?? [])].includes('Files');
	}
	function handleDragEnter(event: DragEvent): void {
		if (!isFileDrag(event)) return;
		event.preventDefault();
		if (disabled || readonly || full) return;
		dragDepth += 1;
		dragging = true;
	}
	function handleDragLeave(event: DragEvent): void {
		if (!isFileDrag(event)) return;
		event.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
		if (dragDepth === 0) dragging = false;
	}
	function handleDrop(event: DragEvent): void {
		if (!isFileDrag(event)) return;
		event.preventDefault();
		dragDepth = 0;
		dragging = false;
		add([...(event.dataTransfer?.files ?? [])]);
	}
	function animateItem(
		node: HTMLElement,
		shouldReduce: boolean
	): { destroy(): void; update(reduced: boolean): void } {
		let animation: Animation | undefined;
		if (!shouldReduce && typeof node.animate === 'function') {
			animation = node.animate(
				[
					{ opacity: 0, transform: 'translateY(-0.25rem)' },
					{ opacity: 1, transform: 'translateY(0)' }
				],
				{ duration: zui.theme.duration.fast, easing: 'ease-out' }
			);
		}
		return {
			destroy: () => animation?.cancel(),
			update(next) {
				if (next) animation?.cancel();
			}
		};
	}
	function getRemoveLabel(item: FileUploadItem): string {
		return removeLabel?.(item) ?? zui.localePack.fileUpload.removeFile(item.file.name);
	}
	function getAbortLabel(item: FileUploadItem): string {
		return abortLabel?.(item) ?? zui.localePack.fileUpload.abortUpload(item.file.name);
	}
	function getRetryLabel(item: FileUploadItem): string {
		return retryLabel?.(item) ?? zui.localePack.fileUpload.retryUpload(item.file.name);
	}
	function getUploadLabel(item: FileUploadItem): string {
		return uploadLabel?.(item) ?? zui.localePack.fileUpload.uploadFile(item.file.name);
	}

	onMount(() => {
		const disconnectMotion = reducedMotion.connect(ref?.ownerDocument.defaultView);
		controller = publicController;
		const publishedController = untrack(() => controller);
		return () => {
			disconnectMotion();
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() => {
			if (!disabled) dropzoneRef?.focus({ preventScroll: true });
		})
	);
	onDestroy(() => cancelAll(false));
	$effect(() => syncNative(resolvedFiles));
	$effect(() => {
		const currentItems = new Map(resolvedFiles.map((item) => [item.id, item]));
		for (const id of [...activeRequests.keys()]) {
			const current = currentItems.get(id);
			const request = activeRequests.get(id);
			if (current?.status !== 'uploading' || current.file !== request?.file)
				cancelRequest(id, false);
		}
	});
	$effect(() => {
		void constraints;
		if (!autoUpload || !transport || disabled || readonly) return;
		for (const item of resolvedFiles) {
			if (item.status === 'queued' && !activeRequests.has(item.id)) void startUpload(item.id);
		}
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={resolvedRootId}
	role="group"
	aria-disabled={disabled || undefined}
	aria-describedby={resolvedDescribedBy}
	aria-labelledby={resolvedLabelledBy}
	data-disabled={disabled || undefined}
	data-dragging={dragging || undefined}
	data-full={full || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={readonly || undefined}
	data-reduced-motion={reduced || undefined}
	data-required={resolvedRequired || undefined}
>
	<button
		bind:this={dropzoneRef}
		id={resolvedControlId}
		class={dropzoneClass}
		type="button"
		aria-controls={`${idBase}-list`}
		aria-describedby={resolvedDescribedBy}
		aria-disabled={readonly || full || undefined}
		aria-labelledby={resolvedLabelledBy}
		data-slot="dropzone"
		{disabled}
		onclick={open}
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={(event) => {
			if (isFileDrag(event)) event.preventDefault();
		}}
		ondrop={handleDrop}
	>
		<CloudUpload aria-hidden="true" size={28} />
		<strong>{resolvedChooseLabel}</strong>
		<span>{resolvedDropLabel}</span>
	</button>
	<input
		bind:this={inputRef}
		id={inputId}
		type="file"
		{accept}
		aria-label={resolvedInputLabel}
		data-slot="input"
		{disabled}
		hidden
		{multiple}
		onchange={handleChange}
	/>
	<div
		id={`${idBase}-list`}
		class={listClass}
		data-slot="list"
		role="list"
		aria-label={resolvedQueueLabel}
	>
		{#if resolvedFiles.length > 0}
			{#each resolvedFiles as item (item.id)}
				<div
					class={itemClass}
					data-slot="item"
					data-status={item.status}
					role="listitem"
					use:animateItem={reduced}
				>
					<div class={detailsClass}>
						<div class={headingClass}>
							<span
								><FileIcon aria-hidden="true" size={16} />
								{item.file.name} · {formatSize(item.file)}</span
							>
							<span class={statusClass(item.status)} data-slot="status" aria-live="polite">
								{#if item.status === 'success'}<CircleCheck aria-hidden="true" size={14} />
								{:else if item.status === 'error'}<TriangleAlert aria-hidden="true" size={14} />
								{:else if item.status === 'aborted'}<CircleStop aria-hidden="true" size={14} />{/if}
								{statusText(item)}
							</span>
						</div>
						{#if item.status === 'uploading'}
							<ZProgress data-slot="progress" label={statusText(item)} value={item.progress} />
						{/if}
					</div>
					<div class={actionsClass} data-slot="actions">
						{#if transport && item.status === 'queued' && !autoUpload}
							<ZButton
								aria-label={getUploadLabel(item)}
								disabled={disabled || readonly}
								size="small"
								variant="ghost"
								onclick={() => void upload(item.id)}
							>
								<Upload aria-hidden="true" size={14} />
							</ZButton>
						{:else if item.status === 'uploading'}
							<ZButton
								aria-label={getAbortLabel(item)}
								disabled={disabled || readonly}
								size="small"
								variant="ghost"
								onclick={() => publicController.abort(item.id)}
							>
								<CircleStop aria-hidden="true" size={14} />
							</ZButton>
						{:else if transport && (item.status === 'error' || item.status === 'aborted')}
							<ZButton
								aria-label={getRetryLabel(item)}
								disabled={disabled || readonly}
								size="small"
								variant="ghost"
								onclick={() => void retry(item.id)}
							>
								<RefreshCw aria-hidden="true" size={14} />
							</ZButton>
						{/if}
						<ZButton
							aria-label={getRemoveLabel(item)}
							disabled={disabled || readonly}
							size="small"
							variant="ghost"
							onclick={() => remove(item.id)}
						>
							<X aria-hidden="true" size={14} />
						</ZButton>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	{#if resolvedFiles.length === 0}
		<div data-slot="empty" role="status">{resolvedEmptyText}</div>
	{/if}
</div>
<FileFormValueBridge
	{disabled}
	files={resolvedFiles}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
/>
