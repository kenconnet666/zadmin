<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { styleInternalFocusRing } from '../gene/internal-action.js';

	export interface ColorPickerPreset {
		readonly label: string;
		readonly value: string;
	}

	export interface ZColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly allowAlpha?: boolean;
		readonly alphaLabel?: string;
		readonly clearable?: boolean;
		readonly clearLabel?: string;
		readonly colorInputLabel?: string;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: string | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly gutter?: number;
		readonly hexInputLabel?: string;
		readonly invalid?: boolean;
		readonly matchWidth?: boolean;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: string | null) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
		readonly placeholder?: string;
		readonly presets?: readonly ColorPickerPreset[];
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly triggerLabel?: (value: string | null) => string;
		value?: string | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'color-picker',
		importStatement: "import { ZColorPicker } from '@zadmin/zui';",
		name: 'ZColorPicker',
		bindings: [
			{ description: '规范化hex颜色或明确空值。', name: 'value', type: 'string | null' },
			{ description: 'Popover打开状态。', name: 'open', type: 'boolean' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'hex color state',
			'native color/range inputs',
			'ZPopover',
			'FieldContext',
			'FormValueBridge'
		],
		events: [
			{
				description: '颜色、透明度、预设或清空变化。',
				name: 'onValueChange',
				type: '(value: string | null) => void'
			},
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '打开颜色dialog。', key: 'Enter / Space' },
			{ description: '关闭并恢复Trigger焦点。', key: 'Escape' },
			{ description: '保留color/text/range的原生键盘交互。', key: 'Native field keys' },
			{ description: '清空当前颜色。', key: 'Delete / Backspace' }
		],
		parts: [
			{ description: '颜色Trigger。', name: 'trigger' },
			{ description: '当前颜色swatch。', name: 'swatch' },
			{ description: '清空操作。', name: 'clear' },
			{ description: '颜色字段Popover。', name: 'content' },
			{ description: '预设颜色操作集合。', name: 'presets' }
		],
		props: [
			{
				bindable: true,
				default: "'#2563eb'",
				description: '规范化6/8位hex或null空值。',
				name: 'value',
				type: 'string | null'
			},
			{
				default: "'#2563eb'",
				description: '非受控初始值与form reset目标。',
				name: 'defaultValue',
				type: 'string | null'
			},
			{
				default: 'false',
				description: '保留8位hex并显示alpha range。',
				name: 'allowAlpha',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '显示清空操作并允许null值。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: '[]',
				description: '经过相同hex规范化的具名预设颜色。',
				name: 'presets',
				type: 'readonly ColorPickerPreset[]'
			},
			{
				default: 'false',
				description: '保留焦点、可读颜色与FormData，禁止打开和写入。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用Trigger并移除FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: 'FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'Field size，其次为Provider density',
				description: 'Trigger和清空按钮尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZColorPicker.svelte',
		states: [
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'hex草稿非法或Field无效。', name: 'data-invalid', values: ['true'] },
			{ description: '明确无颜色值。', name: 'data-empty', values: ['true'] },
			{ description: '只读状态。', name: 'data-readonly', values: ['true'] },
			{ description: '必填状态。', name: 'data-required', values: ['true'] },
			{ description: '解析后的尺寸。', name: 'data-size', values: ['small', 'medium', 'large'] }
		],
		status: 'experimental',
		summary:
			'以规范化hex/null单值、原生color/range输入、alpha、预设、清空、Popover和统一Field/FormValue合同组成的ColorPicker。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.gap._small;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { disabled: false }
	});
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
		variants: { empty: { false: () => undefined, true: (s) => s.backgroundColor._surface } },
		defaultVariants: { empty: false }
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
	const presetsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [
		rootRecipe,
		swatchRecipe,
		contentRecipe,
		colorRecipe,
		inputRecipe,
		rangeRecipe,
		presetsRecipe
	])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { onMount, untrack } from 'svelte';
	import { formatHexColor, normalizeHexColor, parseHexColor } from '../../runtime/color.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowAlpha = false,
		alphaLabel,
		class: className,
		clearable = false,
		clearLabel,
		colorInputLabel,
		controlId,
		defaultOpen = false,
		defaultValue = '#2563eb',
		disabled = false,
		form,
		gutter = 4,
		hexInputLabel,
		invalid,
		matchWidth = false,
		name,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placement = 'bottom-start',
		placeholder,
		presets = [],
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		style,
		triggerLabel,
		value = $bindable(),
		...rest
	}: ZColorPickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const resolvedAlphaLabel = $derived(alphaLabel ?? zui.localePack.colorPicker.alpha);
	const resolvedColorInputLabel = $derived(
		colorInputLabel ?? zui.localePack.colorPicker.chooseColor
	);
	const resolvedHexInputLabel = $derived(hexInputLabel ?? zui.localePack.colorPicker.hexColor);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.common.clear);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.colorPicker.chooseColor);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedInvalidFromField = $derived(invalid ?? field?.invalid ?? false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'color-picker'));
	const resolvedControlId = $derived(controlId ?? field?.controlId ?? `${idBase}-trigger`);
	const normalize = (source: string | null): string | null => {
		if (source === null) return null;
		const result = normalizeHexColor(source, allowAlpha);
		if (!result) throw new TypeError(`Invalid ZColorPicker hex value "${source}".`);
		return result;
	};
	const valueState = new ControllableState<string | null>({
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
	const parsed = $derived(resolvedValue === null ? undefined : parseHexColor(resolvedValue));
	const rgb = $derived(parsed ? formatHexColor(parsed, false) : '#000000');
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const normalizedPresets = $derived.by(() => {
		const values = new Set<string>();
		return Object.freeze(
			presets.map((preset) => {
				if (!preset.label.trim())
					throw new TypeError('ZColorPicker preset labels must not be empty.');
				const normalized = normalize(preset.value);
				if (normalized === null) throw new TypeError('ZColorPicker presets cannot contain null.');
				if (values.has(normalized))
					throw new Error(`Duplicate ZColorPicker preset "${normalized}".`);
				values.add(normalized);
				return Object.freeze({ ...preset, value: normalized });
			})
		);
	});
	let draft = $state('');
	let draftInvalid = $state(false);
	let editing = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const resolvedInvalid = $derived(draftInvalid || resolvedInvalidFromField);
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled: resolvedDisabled }));
	const swatchClass = $derived(zui.recipe(swatchRecipe, { empty: resolvedValue === null }));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const colorClass = $derived(zui.recipe(colorRecipe));
	const inputClass = $derived(zui.recipe(inputRecipe, { invalid: draftInvalid }));
	const rangeClass = $derived(zui.recipe(rangeRecipe));
	const presetsClass = $derived(zui.recipe(presetsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function setOpen(next: boolean): void {
		if (next && (resolvedDisabled || resolvedReadonly)) return;
		if (!next) {
			editing = false;
			draft = '';
			draftInvalid = false;
		}
		openState.setFromUser(next);
	}
	function setValue(next: string | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const normalized = normalize(next);
		if (normalized !== null && !parseHexColor(normalized)) {
			draftInvalid = true;
			return false;
		}
		valueState.setFromUser(normalized);
		draftInvalid = false;
		return true;
	}
	function handleColor(event: Event & { currentTarget: HTMLInputElement }): void {
		const next = parseHexColor(event.currentTarget.value)!;
		setValue(formatHexColor({ ...next, alpha: parsed?.alpha ?? 1 }, allowAlpha));
	}
	function handleAlpha(event: Event & { currentTarget: HTMLInputElement }): void {
		const base = parsed ?? parseHexColor('#000000ff')!;
		setValue(formatHexColor({ ...base, alpha: Number(event.currentTarget.value) / 100 }, true));
	}
	function handleHexInput(event: Event & { currentTarget: HTMLInputElement }): void {
		if (resolvedDisabled || resolvedReadonly) return;
		draft = event.currentTarget.value;
		const normalized = normalizeHexColor(draft, allowAlpha);
		draftInvalid = !normalized;
		if (normalized) valueState.setFromUser(normalized);
	}
	function getTriggerLabel(current: string | null): string {
		return (
			triggerLabel?.(current) ??
			(current === null ? resolvedPlaceholder : zui.localePack.colorPicker.color(current))
		);
	}
	function clear(): void {
		if (!clearable || resolvedValue === null || !setValue(null)) return;
		setOpen(false);
		triggerRef?.focus({ preventScroll: true });
	}
	function resetFromForm(): void {
		valueState.reset();
		openState.reset();
		draft = '';
		draftInvalid = false;
		editing = false;
	}
	function handleTriggerKeydown(event: KeyboardEvent): void {
		if (
			clearable &&
			resolvedValue !== null &&
			!resolvedDisabled &&
			!resolvedReadonly &&
			(event.key === 'Backspace' || event.key === 'Delete')
		) {
			event.preventDefault();
			clear();
		}
	}

	onMount(() => fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-disabled={resolvedDisabled || undefined}
	data-empty={resolvedValue === null || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZPopover
		{gutter}
		{matchWidth}
		modal={false}
		onOpenChange={setOpen}
		open={resolvedOpen}
		{placement}
		triggerId={resolvedControlId}
	>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-describedby={resolvedDescribedBy}
			aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
			aria-label={resolvedLabelledBy ? undefined : (ariaLabel ?? getTriggerLabel(resolvedValue))}
			aria-labelledby={resolvedLabelledBy}
			data-slot="trigger"
			disabled={resolvedDisabled}
			id={resolvedControlId}
			onkeydown={handleTriggerKeydown}
			popupRole="dialog"
			size={resolvedSize}
			variant="secondary"
		>
			<span
				class={swatchClass}
				data-slot="swatch"
				style={resolvedValue === null
					? undefined
					: `background-color: ${rgb}; opacity: ${parsed?.alpha ?? 1};`}
			></span>
			<span>{resolvedValue ?? resolvedPlaceholder}</span>
		</ZPopoverTrigger>
		<ZPopoverContent
			aria-label={getTriggerLabel(resolvedValue)}
			ariaLabelledBy={null}
			data-slot="content"
		>
			<div class={contentClass}>
				<input
					class={colorClass}
					id={`${idBase}-native`}
					type="color"
					value={rgb}
					aria-label={resolvedColorInputLabel}
					disabled={resolvedDisabled || resolvedReadonly}
					oninput={handleColor}
				/>
				<input
					class={inputClass}
					id={`${idBase}-hex`}
					type="text"
					value={editing ? draft : (resolvedValue ?? '')}
					aria-label={resolvedHexInputLabel}
					aria-invalid={draftInvalid || undefined}
					aria-required={resolvedRequired || undefined}
					disabled={resolvedDisabled}
					readonly={resolvedReadonly}
					onfocus={() => {
						editing = true;
						draft = resolvedValue ?? '';
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
						value={Math.round((parsed?.alpha ?? 1) * 100)}
						aria-label={resolvedAlphaLabel}
						disabled={resolvedDisabled || resolvedReadonly}
						oninput={handleAlpha}
					/>
				{/if}
				{#if normalizedPresets.length > 0}
					<div class={presetsClass} data-slot="presets">
						{#each normalizedPresets as preset (preset.value)}
							<ZButton
								aria-label={preset.label}
								disabled={resolvedDisabled || resolvedReadonly}
								onclick={() => setValue(preset.value)}
								size="small"
								variant="secondary"
							>
								<span
									class={swatchClass}
									aria-hidden="true"
									style={`background-color: ${formatHexColor(parseHexColor(preset.value)!, false)}; opacity: ${parseHexColor(preset.value)!.alpha};`}
								></span>
								{preset.label}
							</ZButton>
						{/each}
					</div>
				{/if}
			</div>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && resolvedValue !== null && !resolvedDisabled && !resolvedReadonly}
		<ZButton
			aria-label={resolvedClearLabel}
			data-slot="clear"
			onclick={clear}
			shape="square"
			size={resolvedSize}
			title={resolvedClearLabel}
			variant="secondary"
		>
			<X aria-hidden="true" size={16} />
		</ZButton>
	{/if}
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValue ?? undefined}
/>
