<script module lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { CalendarRange, Weekday } from '../../runtime/date.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	export interface ZDateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly calendarLabel?: string;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: CalendarRange;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDate;
		readonly minValue?: CalendarDate;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: CalendarRange) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly timeZone?: string;
		value?: CalendarRange;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'date-range-picker',
		importStatement: "import { ZDateRangePicker } from '@zadmin/zui';",
		name: 'ZDateRangePicker',
		bindings: [
			{ description: '起止CalendarDate。', name: 'value', type: 'CalendarRange | undefined' },
			{ description: 'Popover状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['ZCalendar', 'range state', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '第二次选择后返回规范化range。',
				name: 'onValueChange',
				type: '(value: CalendarRange) => void'
			}
		],
		keyboard: [
			{ description: '打开并复用Calendar键盘。', key: 'Enter / Space / Calendar keys' },
			{ description: '关闭并恢复焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '范围Trigger。', name: 'trigger' },
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
				description: '规范化日期范围。',
				name: 'value',
				type: 'CalendarRange'
			},
			{
				default: 'undefined',
				description: '非受控初始范围。',
				name: 'defaultValue',
				type: 'CalendarRange'
			},
			{
				default: '继承Field或undefined',
				description: '以name.start/name.end提交两个字段。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'Provider locale',
				description: '范围显示与Calendar使用的BCP 47 locale。',
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
				default: 'localePack.date.chooseDateRange',
				description: 'Calendar dialog可访问名称和空值提示。',
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
				description: '声明Trigger与业务范围无效。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '保持范围值与表单提交，但禁止打开和选择日期。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '声明范围必填语义；约束验证由Form schema负责。',
				name: 'required',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateRangePicker.svelte',
		states: [
			{ description: '等待结束日期。', name: 'data-selecting', values: ['true'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary: '两次Calendar选择、规范化起止顺序、范围呈现与双字段表单值的Date Range Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import type { FormValueEntry } from '../../runtime/form/form-value.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { formatDate, normalizeRange } from '../../runtime/date.js';
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
		value = $bindable(),
		...rest
	}: ZDateRangePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-range-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.chooseDateRange);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.date.chooseDateRange);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	let pending = $state<CalendarDate>();
	let calendarRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const valueState = new ControllableState<CalendarRange | undefined>({
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
	const previewRange = $derived(pending ? { start: pending, end: pending } : valueState.current);
	const display = $derived(
		valueState.current
			? `${formatDate(valueState.current.start, resolvedLocale, undefined, resolvedTimeZone)} – ${formatDate(valueState.current.end, resolvedLocale, undefined, resolvedTimeZone)}`
			: resolvedPlaceholder
	);
	function select(next: CalendarDate): void {
		if (resolvedDisabled || resolvedReadonly) return;
		if (!pending) {
			pending = next;
			return;
		}
		const range = normalizeRange(pending, next);
		pending = undefined;
		valueState.setFromUser(range);
		setOpen(false);
	}
	function handleTriggerClick(event: MouseEvent): void {
		if (resolvedReadonly) event.preventDefault();
	}
	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (!next) pending = undefined;
		if (restore) queueMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}
	onDestroy(fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
	function resetFromForm(): void {
		valueState.reset();
		pending = undefined;
		openState.setFromUser(false);
	}
	const formEntries = $derived<readonly FormValueEntry[]>(
		resolvedName
			? [
					[`${resolvedName}.start`, valueState.current?.start.toString()],
					[`${resolvedName}.end`, valueState.current?.end.toString()]
				]
			: []
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-selecting={Boolean(pending) || undefined}
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
			aria-label={field ? undefined : display}
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
				appearance="bare"
				value={pending ?? valueState.current?.start}
				range={previewRange}
				defaultFocusedValue={valueState.current?.start ?? defaultValue?.start}
				onValueChange={select}
				calendarLabel={resolvedCalendarLabel}
				disabled={resolvedDisabled || resolvedReadonly}
				{firstDayOfWeek}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				timeZone={resolvedTimeZone}
			/>
		</ZPopoverContent>
	</ZPopover>
</div>
<FormValueBridge disabled={resolvedDisabled} entries={formEntries} {form} onReset={resetFromForm} />
