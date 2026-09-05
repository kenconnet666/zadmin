<script module lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { resolveControlSize, type ZControlSize } from '../../runtime/foundation/control-size.js';

	export type ZTextareaResize = 'both' | 'horizontal' | 'none' | 'vertical';
	export type ZTextareaSize = ZControlSize;

	export interface ZTextareaAutosizeOptions {
		readonly maxRows?: number;
		readonly minRows?: number;
	}

	export interface ZTextareaProps extends Omit<HTMLTextareaAttributes, 'value'> {
		readonly autosize?: boolean | ZTextareaAutosizeOptions;
		readonly defaultValue?: string;
		readonly invalid?: boolean;
		readonly onFormReset?: () => void;
		readonly onResize?: (height: number) => void;
		readonly onValueChange?: (value: string) => void;
		ref?: HTMLTextAreaElement | null;
		readonly resize?: ZTextareaResize;
		readonly resetOnForm?: boolean;
		readonly size?: ZTextareaSize;
		value?: string;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'textarea',
		importStatement: "import { ZTextarea } from '@zadmin/zui';",
		name: 'ZTextarea',
		bindings: [
			{ description: 'textarea文本。', name: 'value', type: 'string' },
			{ description: '真实textarea引用。', name: 'ref', type: 'HTMLTextAreaElement | null' }
		],
		dependencies: [
			'ControllableState',
			'FieldContext',
			'ReducedMotionState',
			'native form reset',
			'ownerDocument measurement pool',
			'ResizeObserver',
			'document.fonts'
		],
		events: [
			{
				description: '用户输入后调用一次。',
				name: 'onValueChange',
				type: '(value: string) => void'
			},
			{
				description: '原生form reset恢复默认值后调用。',
				name: 'onFormReset',
				type: '() => void'
			},
			{ description: 'autosize高度变化。', name: 'onResize', type: '(height: number) => void' }
		],
		keyboard: [{ description: '保留原生多行编辑、选择与IME行为。', key: 'Native textarea keys' }],
		parts: [],
		props: [
			{ bindable: true, default: "''", description: '当前文本。', name: 'value', type: 'string' },
			{
				default: "''",
				description: '非受控和form reset初始文本。',
				name: 'defaultValue',
				type: 'string'
			},
			{
				default: 'false',
				description: '按内容、宽度和字体自动调整高度；对象形式限制最少与最多行数。',
				name: 'autosize',
				type: 'boolean | { minRows?: number; maxRows?: number }'
			},
			{
				default: "'vertical'",
				description: '用户resize方向；autosize时强制none。',
				name: 'resize',
				type: "'both' | 'horizontal' | 'none' | 'vertical'"
			},
			{
				default:
					"Field/InputGroup，其次componentDefaults.input.size，最后Provider density（'comfortable'映射为'medium'）",
				description:
					'最小高度、字号和padding尺寸；显式值、上下文与组件默认优先于Provider density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: 'Field context',
				description: '无效视觉和aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '是否由当前ZTextarea恢复defaultValue；复合父状态机可关闭并接管reset。',
				name: 'resetOnForm',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTextarea.svelte',
		states: [
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{
				description: '解析后的control尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			},
			{ description: 'autosize启用。', name: 'data-autosize', values: ['true'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: '保留原生textarea编辑、IME与表单语义，并提供有界、跨document且可销毁的autosize。'
	} as const satisfies ZuiComponentMetadata;

	const textareaRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor._canvas;
			s.boxSizing.borderBox;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.fontFamily._sans;
			s.lineHeight._normal;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction._standard;
			s.width._full;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
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
			invalid: {
				false: (s) => s.borderColor._border,
				true: (s) => s.borderColor._danger
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			resize: {
				both: (s) => s.resize.both,
				horizontal: (s) => s.resize.horizontal,
				none: (s) => s.resize.none,
				vertical: (s) => s.resize.vertical
			},
			readonly: {
				false: () => undefined,
				true: (s) => s.backgroundColor._surface
			},
			size: {
				large: (s) => {
					s.fontSize._large;
					s.minHeight.rem(8);
					s.padding._large;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.minHeight.rem(6);
					s.padding._medium;
				},
				small: (s) => {
					s.fontSize._small;
					s.minHeight.rem(4);
					s.padding._small;
				}
			}
		},
		defaultVariants: {
			disabled: false,
			invalid: false,
			motion: 'auto',
			readonly: false,
			resize: 'vertical',
			size: 'medium'
		}
	});
	registerRecipeHmr(import.meta, textareaRecipe);
</script>

<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { textareaAutosize } from '../../runtime/textarea-autosize.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		autosize = false,
		class: className,
		defaultValue = '',
		disabled = false,
		form,
		id,
		invalid,
		name,
		oninput,
		onFormReset,
		onResize,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		resize = 'vertical',
		resetOnForm = true,
		size,
		style,
		value = $bindable(),
		...rest
	}: ZTextareaProps = $props();
	const zui = useZui();
	const componentDefaults = $derived(zui.componentDefaults.input);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const uid = $props.id();
	const field = useZField();
	const inputGroup = useZInputGroup();
	const resolvedDisabled = $derived(disabled || inputGroup?.disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? inputGroup?.invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || inputGroup?.readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || inputGroup?.required || field?.required || false);
	const resolvedSize = $derived(
		resolveControlSize(
			size ?? inputGroup?.size ?? field?.size ?? componentDefaults?.size,
			zui.density
		)
	);
	const autosizeEnabled = $derived(autosize === true || typeof autosize === 'object');
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(
		zui.recipe(textareaRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			motion: reduced ? 'reduced' : 'full',
			readonly: resolvedReadonly,
			resize: autosizeEnabled ? 'none' : resize,
			size: resolvedSize
		})
	);
	const state = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(state.current);
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'textarea'));
	const resolvedName = $derived(name ?? inputGroup?.name ?? field?.name);
	const resolvedDescribedBy = $derived(
		mergeAriaIds(ariaDescribedBy, inputGroup?.describedBy, field?.describedBy)
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const unregisterInputGroupControl = inputGroup?.registerControl({
		focus() {
			ref?.focus({ preventScroll: true });
		}
	});
	let browserMounted = false;
	onMount(() => {
		browserMounted = true;
		return reducedMotion.connect(ref?.ownerDocument.defaultView);
	});
	onDestroy(() => {
		if (browserMounted) unregisterInputGroupControl?.();
	});

	function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }): void {
		state.setFromUser(event.currentTarget.value);
		oninput?.(event);
	}

	function resetFromForm(): void {
		if (resetOnForm) state.reset();
		onFormReset?.();
	}
</script>

<textarea
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	use:textareaAutosize={{
		enabled: autosizeEnabled,
		maxRows: typeof autosize === 'object' ? autosize.maxRows : undefined,
		minRows: typeof autosize === 'object' ? autosize.minRows : undefined,
		onResize,
		value: resolvedValue
	}}
	id={id ?? inputGroup?.controlId ?? field?.controlId ?? generatedId}
	name={resolvedName}
	{form}
	{defaultValue}
	value={resolvedValue}
	disabled={resolvedDisabled}
	readonly={resolvedReadonly}
	required={resolvedRequired}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
	data-zui-input-group-control={inputGroup ? '' : undefined}
	data-size={resolvedSize}
	data-autosize={autosizeEnabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-reduced-motion={reduced || undefined}
	oninput={handleInput}></textarea>
{#if resetOnForm || onFormReset}
	<FormResetSignal association={form} control={ref} onReset={resetFromForm} />
{/if}
