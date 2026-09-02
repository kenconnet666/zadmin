<script module lang="ts">
	import type { CalendarDate as PublicCalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { Weekday } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';

	export interface ZDatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly calendarLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly closeOnSelect?: boolean;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: PublicCalendarDate | null;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly formatOptions?: Intl.DateTimeFormatOptions;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: PublicCalendarDate) => boolean;
		readonly locale?: string;
		readonly maxValue?: PublicCalendarDate;
		readonly minValue?: PublicCalendarDate;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: PublicCalendarDate | null) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		readonly triggerLabel?: (display: string) => string;
		value?: PublicCalendarDate | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'date-picker',
		importStatement: "import { ZDatePicker } from '@zadmin/zui';",
		name: 'ZDatePicker',
		bindings: [
			{
				description: 'CalendarDate值；null是显式空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{ description: 'Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDateField', 'ZCalendar', 'ZInputGroup', 'ZPopover', 'FormValueBridge'],
		events: [
			{
				description: '分段编辑、日历选择或清空后的值。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
			},
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '在DateField分段间编辑与移动。', key: 'DateField keys' },
			{ description: '打开calendar。', key: 'Calendar trigger: Enter / Space' },
			{ description: '复用Calendar键盘。', key: 'Calendar keys' },
			{ description: '关闭并恢复Calendar trigger焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '可编辑日期segments。', name: 'field' },
			{ description: 'Calendar按钮。', name: 'trigger' },
			{ description: '可选清空按钮。', name: 'clear' },
			{ description: 'Calendar Popover。', name: 'content' }
		],
		props: [
			{
				default: '继承Field或自动生成',
				description: '真实DateField焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '日期值；null是受控空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'null',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				bindable: true,
				default: 'false',
				description: 'Popover打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '显示有值时的Lucide清空按钮。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'Calendar选择日期后关闭Popover。',
				name: 'closeOnSelect',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '日期可用性谓词，同时用于字段提交和Calendar。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Field size或Provider density',
				description: '统一DateField和Lucide actions尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDatePicker.svelte',
		states: [
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'组合可编辑DateField、Calendar Popover、双受控owner与唯一FormValueBridge的Date Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import X from '@lucide/svelte/icons/x';
	import type { CalendarDate } from '@internationalized/date';
	import { onDestroy } from 'svelte';
	import { formatDate } from '../../runtime/date.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import ZCalendar from './ZCalendar.svelte';
	import ZDateField from './ZDateField.svelte';
	import ZInputGroup from './ZInputGroup.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		calendarLabel,
		class: className,
		clearLabel,
		clearable = true,
		closeOnSelect = true,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		firstDayOfWeek,
		form,
		formatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
		invalid,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name: nameProp,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder,
		placement = 'bottom-start',
		ref = $bindable(null),
		readonly: readonlyProp = false,
		required: requiredProp = false,
		showOutsideDates = true,
		size,
		timeZone,
		triggerLabel,
		value = $bindable(),
		...rest
	}: ZDatePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-field`);
	const triggerId = $derived(`${idBase}-calendar-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.chooseDate);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.date.clearDate);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	let calendarRef = $state<HTMLDivElement | null>(null);
	let fieldRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const valueState = new ControllableState<CalendarDate | null>({
		defaultValue: () => defaultValue ?? null,
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
	const display = $derived(
		valueState.current
			? formatDate(valueState.current, resolvedLocale, formatOptions, resolvedTimeZone)
			: (placeholder ?? resolvedCalendarLabel)
	);
	const resolvedTriggerLabel = $derived(triggerLabel?.(display) ?? resolvedCalendarLabel);

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}
	function resetFromForm(): void {
		valueState.reset();
		open = false;
	}
	function updateValue(next: CalendarDate | null): void {
		if (resolvedDisabled || resolvedReadonly) return;
		valueState.setFromUser(next);
	}
	function select(next: CalendarDate | null): void {
		updateValue(next);
		if (next && closeOnSelect) setOpen(false);
	}
	function clear(): void {
		updateValue(null);
		setOpen(false);
		ownerMicrotask(() =>
			fieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}
	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (restore) ownerMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			fieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet actions()}
	<ZPopover modal={false} onOpenChange={setOpen} open={openState.current} {placement} {triggerId}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={resolvedTriggerLabel}
			disabled={resolvedDisabled || resolvedReadonly}
			popupRole="dialog"
			size={resolvedSize}
			variant="ghost"
		>
			<CalendarDays aria-hidden="true" size={16} />
		</ZPopoverTrigger>
		<ZPopoverContent
			aria-label={resolvedCalendarLabel}
			ariaLabelledBy={null}
			initialFocus={() => calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null}
			role="dialog"
		>
			<ZCalendar
				bind:ref={calendarRef}
				appearance="bare"
				calendarLabel={resolvedCalendarLabel}
				defaultFocusedValue={valueState.current ?? defaultValue ?? undefined}
				disabled={resolvedDisabled}
				{firstDayOfWeek}
				formParticipation="none"
				{isDateUnavailable}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				onValueChange={select}
				readonly={resolvedReadonly}
				{showOutsideDates}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				value={valueState.current}
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && valueState.current}
		<ZButton
			aria-label={resolvedClearLabel}
			disabled={resolvedDisabled || resolvedReadonly}
			onclick={clear}
			size={resolvedSize}
			variant="ghost"
		>
			<X aria-hidden="true" size={16} />
		</ZButton>
	{/if}
{/snippet}

<div
	{...rest}
	bind:this={ref}
	class={className}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-state={openState.current ? 'open' : 'closed'}
>
	<ZInputGroup disabled={resolvedDisabled} invalid={resolvedInvalid} suffixAction={actions}>
		<ZDateField
			aria-describedby={describedBy}
			aria-label={ariaLabel}
			aria-labelledby={labelledBy}
			appearance="bare"
			bind:ref={fieldRef}
			{controlId}
			disabled={resolvedDisabled}
			formParticipation="none"
			invalid={resolvedInvalid}
			{isDateUnavailable}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			onValueChange={updateValue}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			size={resolvedSize}
			timeZone={resolvedTimeZone}
			value={valueState.current}
		/>
	</ZInputGroup>
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={valueState.current?.toString()}
/>
