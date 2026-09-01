<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FileRejection } from '../../runtime/file.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZFileUploadProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'ondragleave' | 'ondragover' | 'ondrop'
	> {
		readonly accept?: string;
		readonly chooseLabel?: string;
		readonly defaultFiles?: readonly File[];
		readonly disabled?: boolean;
		readonly dropLabel?: string;
		files?: readonly File[];
		readonly form?: string;
		inputRef?: HTMLInputElement | null;
		readonly inputLabel?: string;
		readonly maxFiles?: number;
		readonly maxSize?: number;
		readonly multiple?: boolean;
		readonly name?: string;
		readonly onFilesChange?: (files: readonly File[]) => void;
		readonly onReject?: (rejections: readonly FileRejection<File>[]) => void;
		readonly removeLabel?: (file: File) => string;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'file-upload',
		importStatement: "import { ZFileUpload } from '@zadmin/zui';",
		name: 'ZFileUpload',
		bindings: [
			{ description: '已接受文件队列。', name: 'files', type: 'readonly File[]' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{ description: '真实file input引用。', name: 'inputRef', type: 'HTMLInputElement | null' }
		],
		dependencies: [
			'native file input',
			'drop zone',
			'queue validation',
			'owner realm DataTransfer',
			'ReducedMotionState'
		],
		events: [
			{
				description: '队列变化。',
				name: 'onFilesChange',
				type: '(files: readonly File[]) => void'
			},
			{
				description: '返回按type、size、duplicate或max-files拒绝的文件。',
				name: 'onReject',
				type: '(rejections: readonly FileRejection<File>[]) => void'
			}
		],
		keyboard: [
			{ description: '打开原生文件选择器。', key: 'Choose button Enter / Space' },
			{ description: '删除对应队列文件。', key: 'Remove button Enter / Space' }
		],
		parts: [
			{ description: '拖放边界。', name: 'dropzone' },
			{ description: '原生file input。', name: 'input' },
			{ description: '文件队列。', name: 'list' },
			{ description: '单个文件。', name: 'item' }
		],
		props: [
			{
				bindable: true,
				default: '[]',
				description: '已接受文件队列。',
				name: 'files',
				type: 'readonly File[]'
			},
			{
				default: '[]',
				description: '非受控初始队列。',
				name: 'defaultFiles',
				type: 'readonly File[]'
			},
			{ default: 'undefined', description: '原生accept规则。', name: 'accept', type: 'string' },
			{ default: 'true', description: '允许多个文件。', name: 'multiple', type: 'boolean' },
			{ default: 'Infinity', description: '最大队列长度。', name: 'maxFiles', type: 'number' },
			{ default: 'undefined', description: '单文件最大字节数。', name: 'maxSize', type: 'number' },
			{
				default: 'undefined',
				description: '真实file input表单字段名。',
				name: 'name',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZFileUpload.svelte',
		states: [
			{ description: '拖拽文件位于drop zone。', name: 'data-dragging', values: ['true'] },
			{ description: '达到maxFiles。', name: 'data-full', values: ['true'] },
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary: '原生文件输入、拖放校验、可移除队列与真实FormData同步的File Upload。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.dashed;
			s.borderWidth._medium;
			s.display.flex;
			s.flexDirection.column;
			s.gap._medium;
			s.padding._large;
			s.transitionDuration._fast;
			s.transitionProperty.raw('background-color, border-color');
			s.transitionTimingFunction.ease;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			dragging: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._surface;
					s.borderColor._primary;
				}
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			}
		},
		defaultVariants: { disabled: false, dragging: false, motion: 'auto' }
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
			s.borderRadius._small;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.padding._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const removeRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._danger;
			s.cursor.pointer;
			s.minHeight.px(0);
			s.padding._small;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [rootRecipe, listRecipe, itemRecipe, removeRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import { fileIdentity, validateFileQueue } from '../../runtime/file.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { isDomNode } from '../../runtime/layer/dom-realm.js';
	import ZButton from '../gene/ZButton.svelte';

	let {
		accept,
		chooseLabel,
		class: className,
		defaultFiles = [],
		disabled = false,
		dropLabel,
		files = $bindable(),
		form,
		inputLabel,
		inputRef = $bindable(null),
		maxFiles = Number.POSITIVE_INFINITY,
		maxSize,
		multiple = true,
		name,
		onFilesChange,
		onReject,
		removeLabel,
		ref = $bindable(null),
		required = false,
		style,
		...rest
	}: ZFileUploadProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const resolvedChooseLabel = $derived(chooseLabel ?? zui.localePack.fileUpload.chooseFiles);
	const resolvedDropLabel = $derived(dropLabel ?? zui.localePack.fileUpload.dropFiles);
	const resolvedInputLabel = $derived(inputLabel ?? zui.localePack.fileUpload.inputLabel);
	const uid = $props.id();
	const inputId = $derived(createZuiId(zui.idPrefix, uid, 'file-upload'));
	const constraints = $derived.by(() => {
		if (!(maxFiles === Number.POSITIVE_INFINITY || (Number.isInteger(maxFiles) && maxFiles >= 1))) {
			throw new TypeError('ZFileUpload maxFiles must be a positive integer.');
		}
		if (maxSize !== undefined && (!Number.isFinite(maxSize) || maxSize < 0)) {
			throw new TypeError('ZFileUpload maxSize must be non-negative and finite.');
		}
		return { maxFiles, maxSize };
	});
	const fileState = new ControllableState<readonly File[]>({
		defaultValue: () => Object.freeze([...defaultFiles]),
		onChange: () => onFilesChange,
		read: () => files,
		write: (next) => (files = next)
	});
	const resolvedFiles = $derived(Object.freeze([...fileState.current]));
	let dragging = $state(false);
	let resetTimer: { readonly id: number; readonly view: Window } | undefined;
	const full = $derived(
		resolvedFiles.length >= constraints.maxFiles || (!multiple && resolvedFiles.length >= 1)
	);
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(
		zui.recipe(rootRecipe, { disabled, dragging, motion: reduced ? 'reduced' : 'full' })
	);
	const listClass = $derived(zui.recipe(listRecipe));
	const itemClass = $derived(zui.recipe(itemRecipe));
	const removeClass = $derived(zui.recipe(removeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function syncNative(next: readonly File[]): void {
		const DataTransferConstructor = inputRef?.ownerDocument.defaultView?.DataTransfer;
		if (!inputRef || !DataTransferConstructor) return;
		const transfer = new DataTransferConstructor();
		for (const file of next) transfer.items.add(file);
		inputRef.files = transfer.files;
	}
	$effect(() => syncNative(resolvedFiles));
	function clearResetTimer(): void {
		if (!resetTimer) return;
		resetTimer.view.clearTimeout(resetTimer.id);
		resetTimer = undefined;
	}
	function resetFromForm(): void {
		fileState.reset();
		dragging = false;
		clearResetTimer();
		const view = inputRef?.ownerDocument.defaultView;
		if (!view) {
			syncNative(defaultFiles);
			return;
		}
		const id = view.setTimeout(() => {
			resetTimer = undefined;
			syncNative(defaultFiles);
		}, 0);
		resetTimer = { id, view };
	}
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	onDestroy(clearResetTimer);
	function add(candidates: readonly File[]): void {
		if (disabled || candidates.length === 0) return;
		const result = validateFileQueue(resolvedFiles, candidates, {
			accept,
			maxFiles: constraints.maxFiles,
			maxSize: constraints.maxSize,
			multiple
		});
		if (result.rejected.length > 0) onReject?.(result.rejected);
		if (result.accepted.length !== resolvedFiles.length) fileState.setFromUser(result.accepted);
	}
	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		add([...(event.currentTarget.files ?? [])]);
	}
	function remove(index: number): void {
		if (disabled) return;
		fileState.setFromUser(
			Object.freeze(resolvedFiles.filter((_, itemIndex) => itemIndex !== index))
		);
	}
	function getRemoveLabel(file: File): string {
		return removeLabel?.(file) ?? zui.localePack.fileUpload.removeFile(file.name);
	}
	function handleDrop(event: DragEvent & { currentTarget: HTMLDivElement }): void {
		event.preventDefault();
		dragging = false;
		add([...(event.dataTransfer?.files ?? [])]);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={disabled || undefined}
	data-dragging={dragging || undefined}
	data-full={full || undefined}
	data-reduced-motion={reduced || undefined}
	ondragover={(event) => {
		event.preventDefault();
		if (!disabled) dragging = true;
	}}
	ondragleave={(event) => {
		if (!isDomNode(event.relatedTarget) || !event.currentTarget.contains(event.relatedTarget))
			dragging = false;
	}}
	ondrop={handleDrop}
>
	<input
		bind:this={inputRef}
		id={inputId}
		type="file"
		{accept}
		{disabled}
		{form}
		{name}
		{multiple}
		{required}
		hidden
		use:formReset={resetFromForm}
		onchange={handleChange}
	/>
	<div>{resolvedDropLabel}</div>
	<ZButton
		aria-controls={inputId}
		aria-label={resolvedInputLabel}
		disabled={disabled || full}
		onclick={() => inputRef?.click()}>{resolvedChooseLabel}</ZButton
	>
	<div class={listClass} data-slot="list" aria-live="polite">
		{#each resolvedFiles as file, index (fileIdentity(file))}
			<div class={itemClass} data-slot="item">
				<span>{file.name} · {file.size} B</span>
				<ZButton
					class={removeClass}
					aria-label={getRemoveLabel(file)}
					{disabled}
					size="small"
					variant="ghost"
					onclick={() => remove(index)}><X aria-hidden="true" size={14} /></ZButton
				>
			</div>
		{/each}
	</div>
</div>
