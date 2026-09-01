<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	export interface ZTagsInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly addLabel?: string;
		readonly allowDuplicates?: boolean;
		readonly children?: Snippet<[value: string]>;
		readonly commitOnBlur?: boolean;
		readonly defaultValues?: readonly string[];
		readonly delimiters?: readonly string[];
		readonly disabled?: boolean;
		readonly form?: string;
		inputValue?: string;
		readonly maxTags?: number;
		readonly name?: string;
		readonly onInputValueChange?: (value: string) => void;
		readonly onValueChange?: (values: readonly string[]) => void;
		readonly placeholder?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly removeLabel?: (value: string) => string;
		readonly validate?: (value: string) => boolean;
		values?: readonly string[];
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'tags-input',
		importStatement: "import { ZTagsInput } from '@zadmin/zui';",
		name: 'ZTagsInput',
		bindings: [
			{ description: '当前有序标签。', name: 'values', type: 'readonly string[]' },
			{ description: '当前草稿文本。', name: 'inputValue', type: 'string' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ordered collection', 'paste parser', 'FormValue'],
		events: [
			{
				description: '标签集合变化后调用。',
				name: 'onValueChange',
				type: '(values: readonly string[]) => void'
			},
			{
				description: '草稿变化后调用。',
				name: 'onInputValueChange',
				type: '(value: string) => void'
			}
		],
		keyboard: [
			{ description: '提交非空草稿。', key: 'Enter / configured delimiter' },
			{ description: '草稿为空时删除最后标签。', key: 'Backspace' },
			{ description: '批量解析分隔文本。', key: 'Paste' }
		],
		parts: [
			{ description: '单个标签。', name: 'tag' },
			{ description: '标签删除按钮。', name: 'remove' },
			{ description: '草稿input。', name: 'input' }
		],
		props: [
			{
				bindable: true,
				default: '[]',
				description: '有序去重标签集合。',
				name: 'values',
				type: 'readonly string[]'
			},
			{
				default: '[]',
				description: '非受控初始标签。',
				name: 'defaultValues',
				type: 'readonly string[]'
			},
			{
				bindable: true,
				default: "''",
				description: '草稿文本。',
				name: 'inputValue',
				type: 'string'
			},
			{
				default: "[',']",
				description: '提交与粘贴分隔符。',
				name: 'delimiters',
				type: 'readonly string[]'
			},
			{ default: 'Infinity', description: '最大标签数量。', name: 'maxTags', type: 'number' },
			{
				default: 'false',
				description: '是否允许重复标签。',
				name: 'allowDuplicates',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'blur时是否提交草稿。',
				name: 'commitOnBlur',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '自定义标签校验。',
				name: 'validate',
				type: '(value: string) => boolean'
			},
			{
				default: 'undefined',
				description: '每个标签重复使用的表单字段名。',
				name: 'name',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '自定义标签内容，参数为value。',
				name: 'children',
				type: 'Snippet<[value: string]>'
			}
		],
		source: 'ui/zui/src/components/input/ZTagsInput.svelte',
		states: [{ description: '达到上限。', name: 'data-full', values: ['true'] }],
		status: 'experimental',
		summary: '支持IME安全提交、粘贴、删除、校验、多值表单与reset的TagsInput。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { styleInternalFocusWithinRing } from '../gene/internal-action.js';
	import ZButton from '../gene/ZButton.svelte';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			s.padding._small;
			styleInternalFocusWithinRing(s);
		},
		variants: { disabled: { false: () => undefined, true: (s) => s.opacity._disabled } },
		defaultVariants: { disabled: false }
	});
	const tagRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.borderRadius._small;
			s.display.inlineFlex;
			s.gap._xsmall;
			s.paddingBlock._xsmall;
			s.paddingInline._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.minWidth._menu;
			s.outlineStyle.none;
			s.padding._small;
			s.width._full;
		},
		variants: {},
		defaultVariants: {}
	});
	const removeRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._textMuted;
			s.cursor.pointer;
			s.minHeight.px(0);
			s.padding.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, tagRecipe);
	registerRecipeHmr(import.meta, inputRecipe);
	registerRecipeHmr(import.meta, removeRecipe);
	const normalize = (source: readonly string[], allowDuplicates: boolean) =>
		Object.freeze(
			source
				.map((value) => value.trim())
				.filter(
					(value, index, all) =>
						value.length > 0 && (allowDuplicates || all.indexOf(value) === index)
				)
		);
	let {
		addLabel,
		allowDuplicates = false,
		children,
		class: className,
		commitOnBlur = true,
		defaultValues = [],
		delimiters = [','],
		disabled = false,
		form,
		inputValue = $bindable(),
		maxTags = Number.POSITIVE_INFINITY,
		name,
		onInputValueChange,
		onValueChange,
		placeholder,
		readonly = false,
		ref = $bindable(null),
		removeLabel,
		style,
		validate,
		values = $bindable(),
		...rest
	}: ZTagsInputProps = $props();
	const zui = useZui();
	const resolvedAddLabel = $derived(addLabel ?? zui.localePack.tagsInput.addTag);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.tagsInput.addTag);
	const uid = $props.id();
	const inputId = $derived(createZuiId(zui.idPrefix, uid, 'tags-input'));
	const resolvedMaxTags = $derived.by(() => {
		if (!(maxTags === Number.POSITIVE_INFINITY || (Number.isInteger(maxTags) && maxTags >= 0))) {
			throw new TypeError('ZTagsInput maxTags must be a non-negative integer.');
		}
		return maxTags;
	});
	let proxy = $state<HTMLInputElement | null>(null);
	const valueState = new ControllableState<readonly string[]>({
		defaultValue: () => normalize(defaultValues, allowDuplicates),
		onChange: () => onValueChange,
		read: () => values,
		write: (next) => (values = next)
	});
	const draftState = new ControllableState<string>({
		defaultValue: () => '',
		onChange: () => onInputValueChange,
		read: () => inputValue,
		write: (next) => (inputValue = next)
	});
	const resolvedValues = $derived(
		normalize(valueState.current, allowDuplicates).slice(0, resolvedMaxTags)
	);
	const full = $derived(resolvedValues.length >= resolvedMaxTags);
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled }));
	const tagClass = $derived(zui.recipe(tagRecipe));
	const inputClass = $derived(zui.recipe(inputRecipe));
	const removeClass = $derived(zui.recipe(removeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		valueState.reset();
		draftState.reset();
	}
	function add(raw: string): boolean {
		const candidate = raw.trim();
		if (
			!candidate ||
			disabled ||
			readonly ||
			full ||
			validate?.(candidate) === false ||
			(!allowDuplicates && resolvedValues.includes(candidate))
		)
			return false;
		valueState.setFromUser(Object.freeze([...resolvedValues, candidate]));
		return true;
	}
	function parse(raw: string): string[] {
		const escaped = delimiters
			.filter(Boolean)
			.map((value) => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
		return escaped.length === 0 ? [raw] : raw.split(new RegExp(escaped.join('|'), 'u'));
	}
	function commitDraft(): void {
		if (add(draftState.current)) draftState.setFromUser('');
	}
	function remove(index: number): void {
		if (disabled || readonly) return;
		valueState.setFromUser(
			Object.freeze(resolvedValues.filter((_, itemIndex) => itemIndex !== index))
		);
	}
	function getRemoveLabel(value: string): string {
		return removeLabel?.(value) ?? zui.localePack.tagsInput.removeTag(value);
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		draftState.setFromUser(event.currentTarget.value);
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (event.isComposing) return;
		if (event.key === 'Enter' || delimiters.includes(event.key)) {
			event.preventDefault();
			commitDraft();
		} else if (
			event.key === 'Backspace' &&
			draftState.current.length === 0 &&
			resolvedValues.length > 0
		) {
			event.preventDefault();
			remove(resolvedValues.length - 1);
		}
	}
	function handlePaste(event: ClipboardEvent & { currentTarget: HTMLInputElement }): void {
		const text = event.clipboardData?.getData('text');
		if (!text || !delimiters.some((delimiter) => text.includes(delimiter))) return;
		event.preventDefault();
		if (disabled || readonly || full) return;
		const next = [...resolvedValues];
		for (const raw of parse(text)) {
			const candidate = raw.trim();
			if (
				candidate.length === 0 ||
				next.length >= resolvedMaxTags ||
				validate?.(candidate) === false ||
				(!allowDuplicates && next.includes(candidate))
			)
				continue;
			next.push(candidate);
		}
		if (next.length > resolvedValues.length) {
			valueState.setFromUser(Object.freeze(next));
			draftState.setFromUser('');
		}
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
	data-full={full || undefined}
>
	{#each resolvedValues as tag, index (`${tag}-${index}`)}
		<span class={tagClass} data-slot="tag">
			{#if children}{@render children(tag)}{:else}{tag}{/if}
			<ZButton
				class={removeClass}
				data-slot="remove"
				aria-label={getRemoveLabel(tag)}
				disabled={disabled || readonly}
				size="small"
				variant="ghost"
				onclick={() => remove(index)}><X aria-hidden="true" size={14} /></ZButton
			>
		</span>
	{/each}
	<input
		class={inputClass}
		id={inputId}
		aria-label={resolvedAddLabel}
		value={draftState.current}
		placeholder={resolvedPlaceholder}
		disabled={disabled || full}
		{readonly}
		onblur={() => {
			if (commitOnBlur) commitDraft();
		}}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onpaste={handlePaste}
	/>
</div>
<input
	bind:this={proxy}
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	disabled
	{form}
	use:formReset={resetFromForm}
/>
{#if name && !disabled}{#each resolvedValues as tag, index (`${tag}-${index}`)}<input
			type="hidden"
			{form}
			{name}
			value={tag}
		/>{/each}{/if}
