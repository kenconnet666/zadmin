<script module lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZTextareaResize = 'both' | 'horizontal' | 'none' | 'vertical';
	export type ZTextareaSize = 'large' | 'medium' | 'small';

	export interface ZTextareaProps extends Omit<HTMLTextareaAttributes, 'value'> {
		readonly autosize?: boolean;
		readonly defaultValue?: string;
		readonly invalid?: boolean;
		readonly onResize?: (height: number) => void;
		readonly onValueChange?: (value: string) => void;
		ref?: HTMLTextAreaElement | null;
		readonly resize?: ZTextareaResize;
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
			'native form reset',
			'Runed TextareaAutosize'
		],
		events: [
			{
				description: '用户输入后调用一次。',
				name: 'onValueChange',
				type: '(value: string) => void'
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
				description: '按内容和宽度自动调整高度。',
				name: 'autosize',
				type: 'boolean'
			},
			{
				default: "'vertical'",
				description: '用户resize方向；autosize时强制none。',
				name: 'resize',
				type: "'both' | 'horizontal' | 'none' | 'vertical'"
			},
			{
				default: "'medium'",
				description: '最小高度、字号和padding尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: 'Field context',
				description: '无效视觉和aria-invalid。',
				name: 'invalid',
				type: 'boolean'
			}
		],
		since: '0.5.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTextarea.svelte',
		states: [
			{ description: '无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'autosize启用。', name: 'data-autosize', values: ['true'] }
		],
		status: 'experimental',
		summary: '保留原生textarea编辑与表单语义，并增加共享状态、Field关系和可销毁autosize。'
	} as const satisfies ZuiComponentMetadata;

	const textareaRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor._canvas;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.fontFamily._sans;
			s.lineHeight._normal;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s.width._full;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			invalid: {
				false: (s) => s.borderColor._border,
				true: (s) => s.borderColor._danger
			},
			resize: {
				both: (s) => s.resize.both,
				horizontal: (s) => s.resize.horizontal,
				none: (s) => s.resize.none,
				vertical: (s) => s.resize.vertical
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
		defaultVariants: { invalid: false, resize: 'vertical', size: 'medium' }
	});
	registerRecipeHmr(import.meta, textareaRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { listenForFormReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZTextareaAutosize from './ZTextareaAutosize.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		autosize = false,
		class: className,
		defaultValue = '',
		disabled = false,
		id,
		invalid,
		name,
		oninput,
		onResize,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		resize = 'vertical',
		size = 'medium',
		style,
		value = $bindable(),
		...rest
	}: ZTextareaProps = $props();
	const zui = useZui();
	const field = useZField();
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const rootClass = $derived(
		zui.recipe(textareaRecipe, {
			invalid: resolvedInvalid,
			resize: autosize ? 'none' : resize,
			size
		})
	);
	const state = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(state.current);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (!ref) return;
		return listenForFormReset(ref, () => state.reset());
	});
	function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }): void {
		state.setFromUser(event.currentTarget.value);
		oninput?.(event);
	}
</script>

<textarea
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={id ?? field?.controlId}
	name={name ?? field?.name}
	{defaultValue}
	value={resolvedValue}
	disabled={disabled || field?.disabled}
	readonly={readonly || field?.readonly}
	required={required || field?.required}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
	data-autosize={autosize || undefined}
	oninput={handleInput}></textarea>
{#if autosize}<ZTextareaAutosize element={ref} input={resolvedValue} {onResize} />{/if}
