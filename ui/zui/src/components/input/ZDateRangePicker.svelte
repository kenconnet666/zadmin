<script module lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { CalendarRange, Weekday } from '../../runtime/date.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	export interface ZDateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly calendarLabel?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: CalendarRange;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
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
				default: 'undefined',
				description: '以name.start/name.end提交两个字段。',
				name: 'name',
				type: 'string'
			}
		],
		since: '0.6.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateRangePicker.svelte',
		states: [{ description: '等待结束日期。', name: 'data-selecting', values: ['true'] }],
		status: 'experimental',
		summary: '两次Calendar选择、规范化起止顺序、范围呈现与双字段表单值的Date Range Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import { formatDate, normalizeRange } from '../../runtime/date.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZCalendar from './ZCalendar.svelte';
	let {
		calendarLabel = 'Choose date range',
		class: className,
		defaultOpen = false,
		defaultValue,
		disabled = false,
		firstDayOfWeek,
		form,
		locale,
		maxValue,
		minValue,
		name,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder = 'Choose date range',
		placement = 'bottom-start',
		ref = $bindable(null),
		value = $bindable(),
		...rest
	}: ZDateRangePickerProps = $props();
	const zui = useZui();
	const resolvedLocale = $derived(locale ?? zui.locale);
	let pending = $state<CalendarDate>();
	let proxy = $state<HTMLInputElement | null>(null);
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
			? `${formatDate(valueState.current.start, resolvedLocale)} – ${formatDate(valueState.current.end, resolvedLocale)}`
			: placeholder
	);
	function select(next: CalendarDate): void {
		if (!pending) {
			pending = next;
			return;
		}
		const range = normalizeRange(pending, next);
		pending = undefined;
		valueState.setFromUser(range);
		setOpen(false);
	}
	function setOpen(next: boolean): void {
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (!next) pending = undefined;
		if (restore) queueMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}
	function resetFromForm(): void {
		valueState.reset();
		pending = undefined;
		openState.setFromUser(false);
	}
</script>

<div {...rest} bind:this={ref} class={className} data-selecting={Boolean(pending) || undefined}>
	<ZPopover modal={false} onOpenChange={setOpen} open={openState.current} {placement}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={display}
			{disabled}
			popupRole="dialog"
			variant="secondary">{display}</ZPopoverTrigger
		>
		<ZPopoverContent
			aria-label={calendarLabel}
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
				{calendarLabel}
				{disabled}
				{firstDayOfWeek}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
			/>
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
{#if name && !disabled && valueState.current}<input
		type="hidden"
		{form}
		name={`${name}.start`}
		value={valueState.current.start.toString()}
	/><input
		type="hidden"
		{form}
		name={`${name}.end`}
		value={valueState.current.end.toString()}
	/>{/if}
