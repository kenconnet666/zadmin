<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalFocusRing } from '../gene/internal-action.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly allowAlpha?: boolean;
		readonly alphaLabel?: string;
		readonly colorInputLabel?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: string;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly hexInputLabel?: string;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: string) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly triggerLabel?: (value: string) => string;
		value?: string;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'color-picker',
		importStatement: "import { ZColorPicker } from '@zadmin/zui';",
		name: 'ZColorPicker',
		bindings: [
			{ description: '规范化hex颜色。', name: 'value', type: 'string' },
			{ description: 'Popover打开状态。', name: 'open', type: 'boolean' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['hex color state', 'native color input', 'ZPopover', 'FormValue'],
		events: [
			{ description: '颜色变化。', name: 'onValueChange', type: '(value: string) => void' },
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '打开颜色dialog。', key: 'Enter / Space' },
			{ description: '关闭并恢复Trigger焦点。', key: 'Escape' },
			{ description: '保留color/text/range的原生键盘交互。', key: 'Native field keys' }
		],
		parts: [
			{ description: '颜色Trigger。', name: 'trigger' },
			{ description: '当前颜色swatch。', name: 'swatch' },
			{ description: '颜色字段Popover。', name: 'content' }
		],
		props: [
			{
				bindable: true,
				default: "'#2563eb'",
				description: '规范化hex值。',
				name: 'value',
				type: 'string'
			},
			{ default: "'#2563eb'", description: '非受控初始值。', name: 'defaultValue', type: 'string' },
			{
				default: 'false',
				description: '使用8位hex与alpha range。',
				name: 'allowAlpha',
				type: 'boolean'
			},
			{ default: 'false', description: '禁用Trigger和表单值。', name: 'disabled', type: 'boolean' },
			{ default: 'undefined', description: '隐藏表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.5.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZColorPicker.svelte',
		states: [
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'hex草稿非法。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '平台原生色域选择、自有hex/alpha状态、Popover字段与表单合同的Color Picker。'
	} as const satisfies ZuiComponentMetadata;

	const swatchRecipe = defineRecipe({
		base: (s) => {
			s.borderColor._border;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineBlock;
			s.height._medium;
			s.width._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._medium;
			s.minWidth._menu;
		},
		variants: {},
		defaultVariants: {}
	});
	const colorRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.cursor.pointer;
			s.height._large;
			s.padding.px(0);
			s.width._full;
			styleInternalFocusRing(s);
		},
		variants: {},
		defaultVariants: {}
	});
	const inputRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.fontFamily._mono;
			s.minHeight._medium;
			s.paddingInline._medium;
			styleInternalFocusRing(s);
		},
		variants: { invalid: { false: () => undefined, true: (s) => s.borderColor._danger } },
		defaultVariants: { invalid: false }
	});
	const rangeRecipe = defineRecipe({
		base: (s) => {
			s.width._full;
			styleInternalFocusRing(s);
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [swatchRecipe, contentRecipe, colorRecipe, inputRecipe, rangeRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import { formatHexColor, normalizeHexColor, parseHexColor } from '../../runtime/color.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';

	let {
		allowAlpha = false,
		alphaLabel = 'Alpha',
		class: className,
		colorInputLabel = 'Choose color',
		defaultOpen = false,
		defaultValue = '#2563eb',
		disabled = false,
		form,
		hexInputLabel = 'Hex color',
		name,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placement = 'bottom-start',
		ref = $bindable(null),
		style,
		triggerLabel = (current) => `Color ${current}`,
		value = $bindable(),
		...rest
	}: ZColorPickerProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'color-picker'));
	const normalize = (source: string): string => {
		const result = normalizeHexColor(source, allowAlpha);
		if (!result) throw new TypeError(`Invalid ZColorPicker hex value "${source}".`);
		return result;
	};
	const valueState = new ControllableState<string>({
		defaultValue: () => normalize(defaultValue),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedValue = $derived(normalize(valueState.current));
	const parsed = $derived(parseHexColor(resolvedValue)!);
	const rgb = $derived(formatHexColor(parsed, false));
	let draft = $state('');
	let draftInvalid = $state(false);
	let editing = $state(false);
	let proxy = $state<HTMLInputElement | null>(null);
	const swatchClass = $derived(zui.recipe(swatchRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const colorClass = $derived(zui.recipe(colorRecipe));
	const inputClass = $derived(zui.recipe(inputRecipe, { invalid: draftInvalid }));
	const rangeClass = $derived(zui.recipe(rangeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		valueState.reset();
		draft = '';
		draftInvalid = false;
		editing = false;
		openState.setFromUser(false);
	}
	function setValue(next: string): void {
		const normalized = normalizeHexColor(next, allowAlpha);
		if (!normalized) {
			draftInvalid = true;
			return;
		}
		valueState.setFromUser(normalized);
		draftInvalid = false;
	}
	function handleColor(event: Event & { currentTarget: HTMLInputElement }): void {
		const next = parseHexColor(event.currentTarget.value)!;
		setValue(formatHexColor({ ...next, alpha: parsed.alpha }, allowAlpha));
	}
	function handleAlpha(event: Event & { currentTarget: HTMLInputElement }): void {
		setValue(formatHexColor({ ...parsed, alpha: Number(event.currentTarget.value) / 100 }, true));
	}
	function handleHexInput(event: Event & { currentTarget: HTMLInputElement }): void {
		draft = event.currentTarget.value;
		const normalized = normalizeHexColor(draft, allowAlpha);
		draftInvalid = !normalized;
		if (normalized) valueState.setFromUser(normalized);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-invalid={draftInvalid || undefined}
>
	<ZPopover
		gutter={4}
		modal={false}
		onOpenChange={(next) => openState.setFromUser(next)}
		open={openState.current}
		{placement}
	>
		<ZPopoverTrigger
			aria-label={triggerLabel(resolvedValue)}
			{disabled}
			popupRole="dialog"
			variant="secondary"
		>
			<span
				class={swatchClass}
				data-slot="swatch"
				style={`background-color: ${rgb}; opacity: ${parsed.alpha};`}
			></span>
			<span>{resolvedValue}</span>
		</ZPopoverTrigger>
		<ZPopoverContent
			aria-label={triggerLabel(resolvedValue)}
			ariaLabelledBy={null}
			data-slot="content"
		>
			<div class={contentClass}>
				<input
					class={colorClass}
					id={`${idBase}-native`}
					type="color"
					value={rgb}
					aria-label={colorInputLabel}
					{disabled}
					oninput={handleColor}
				/>
				<input
					class={inputClass}
					id={`${idBase}-hex`}
					type="text"
					value={editing ? draft : resolvedValue}
					aria-label={hexInputLabel}
					aria-invalid={draftInvalid || undefined}
					{disabled}
					onfocus={() => {
						editing = true;
						draft = resolvedValue;
					}}
					oninput={handleHexInput}
					onblur={() => {
						editing = false;
						draft = '';
						draftInvalid = false;
					}}
				/>
				{#if allowAlpha}
					<input
						class={rangeClass}
						id={`${idBase}-alpha`}
						type="range"
						min="0"
						max="100"
						value={Math.round(parsed.alpha * 100)}
						aria-label={alphaLabel}
						{disabled}
						oninput={handleAlpha}
					/>
				{/if}
			</div>
		</ZPopoverContent>
	</ZPopover>
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
{#if name && !disabled}<input type="hidden" {form} {name} value={resolvedValue} />{/if}
