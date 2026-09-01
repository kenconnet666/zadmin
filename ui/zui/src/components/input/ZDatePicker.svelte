<script module lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import type { Weekday } from '../../runtime/date.js';
	export interface ZDatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly calendarLabel?: string;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: CalendarDate;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly formatOptions?: Intl.DateTimeFormatOptions;
		readonly invalid?: boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDate;
		readonly minValue?: CalendarDate;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: CalendarDate) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly timeZone?: string;
		readonly triggerLabel?: (display: string) => string;
		value?: CalendarDate;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'date-picker',
		importStatement: "import { ZDatePicker } from '@zadmin/zui';",
		name: 'ZDatePicker',
		bindings: [
			{ description: 'CalendarDate值。', name: 'value', type: 'CalendarDate | undefined' },
			{ description: 'Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZCalendar', 'ZPopover', 'FormValue'],
		events: [
			{ description: '选择日期。', name: 'onValueChange', type: '(value: CalendarDate) => void' },
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '打开calendar。', key: 'Enter / Space' },
			{ description: '复用Calendar键盘。', key: 'Calendar keys' },
			{ description: '关闭并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '日期Trigger。', name: 'trigger' },
			{ description: 'Calendar Popover。', name: 'content' }
		],
		props: [
			{
				default: '继承Field或自动生成',
				description: '真实Trigger焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '选择日期。',
				name: 'value',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate'
			},
			{
				default: 'Provider locale',
				description: '显示与Calendar locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone或UTC',
				description: '显示、Calendar today与日期ARIA使用的SSR稳定IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'localePack.date.chooseDate',
				description: 'Calendar dialog可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'false',
				description: '禁用Trigger、Calendar和表单提交。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '声明Trigger与业务日期无效。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '保持值与表单提交，但禁止打开和选择日期。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '声明日期必填语义；约束验证由Form schema负责。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '继承Field或undefined',
				description: 'ISO日期隐藏字段名。',
				name: 'name',
				type: 'string'
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
		summary: '组合CalendarDate格式、ZCalendar与Popover焦点生命周期的Date Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { formatDate } from '../../runtime/date.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZCalendar from './ZCalendar.svelte';
	let {
		'aria-describedby': ariaDescribedBy,
		calendarLabel,
		class: className,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		firstDayOfWeek,
		form,
		formatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
		invalid,
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
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.chooseDate);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.date.chooseDate);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	let calendarRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const valueState = new ControllableState<CalendarDate | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next) onValueChange?.(next);
		},
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
			: resolvedPlaceholder
	);
	function resetFromForm(): void {
		valueState.reset();
		openState.setFromUser(false);
	}
	function select(next: CalendarDate): void {
		if (resolvedDisabled || resolvedReadonly) return;
		valueState.setFromUser(next);
		setOpen(false);
	}
	function handleTriggerClick(event: MouseEvent): void {
		if (resolvedReadonly) event.preventDefault();
	}
	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (restore) queueMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}
	onDestroy(fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
>
	<ZPopover
		modal={false}
		onOpenChange={setOpen}
		open={openState.current}
		{placement}
		triggerId={controlId}
	>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-describedby={describedBy}
			aria-invalid={resolvedInvalid || undefined}
			aria-label={triggerLabel?.(display)}
			aria-labelledby={field?.labelId}
			aria-readonly={resolvedReadonly || undefined}
			aria-required={resolvedRequired || undefined}
			disabled={resolvedDisabled}
			onclick={handleTriggerClick}
			popupRole="dialog"
			role="combobox"
			variant="secondary">{display}</ZPopoverTrigger
		>
		<ZPopoverContent
			aria-label={resolvedCalendarLabel}
			ariaLabelledBy={null}
			initialFocus={() => calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null}
			role="dialog"
		>
			<ZCalendar
				bind:ref={calendarRef}
				value={valueState.current}
				defaultFocusedValue={valueState.current ?? defaultValue}
				onValueChange={select}
				calendarLabel={resolvedCalendarLabel}
				disabled={resolvedDisabled || resolvedReadonly}
				{firstDayOfWeek}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				timeZone={resolvedTimeZone}
				appearance="bare"
			/>
		</ZPopoverContent>
	</ZPopover>
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={valueState.current?.toString()}
/>
