<script module lang="ts">
	import type { CalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import type { Weekday } from '../../runtime/date.js';
	export interface ZDatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly calendarLabel?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: CalendarDate;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly formatOptions?: Intl.DateTimeFormatOptions;
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
			{ default: 'undefined', description: 'ISO日期隐藏字段名。', name: 'name', type: 'string' }
		],
		since: '0.6.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDatePicker.svelte',
		states: [{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '组合CalendarDate格式、ZCalendar与Popover焦点生命周期的Date Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { listenForFormReset } from '../../runtime/form/form-control.svelte.js';
	import { formatDate } from '../../runtime/date.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZCalendar from './ZCalendar.svelte';
	let {
		calendarLabel = 'Choose date',
		class: className,
		defaultOpen = false,
		defaultValue,
		disabled = false,
		firstDayOfWeek,
		form,
		formatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
		locale,
		maxValue,
		minValue,
		name,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder = 'Choose date',
		placement = 'bottom-start',
		ref = $bindable(null),
		triggerLabel = (display) => display,
		value = $bindable(),
		...rest
	}: ZDatePickerProps = $props();
	const zui = useZui();
	const resolvedLocale = $derived(locale ?? zui.locale);
	let proxy = $state<HTMLInputElement | null>(null);
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
		valueState.current ? formatDate(valueState.current, resolvedLocale, formatOptions) : placeholder
	);
	$effect(() => {
		if (!proxy) return;
		return listenForFormReset(proxy, () => {
			valueState.reset();
			openState.setFromUser(false);
		});
	});
	function select(next: CalendarDate): void {
		valueState.setFromUser(next);
		setOpen(false);
	}
	function setOpen(next: boolean): void {
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (restore) queueMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}
</script>

<div {...rest} bind:this={ref} class={className}>
	<ZPopover modal={false} onOpenChange={setOpen} open={openState.current} {placement}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={triggerLabel(display)}
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
				value={valueState.current}
				defaultFocusedValue={valueState.current ?? defaultValue}
				onValueChange={select}
				{calendarLabel}
				{disabled}
				{firstDayOfWeek}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				appearance="bare"
			/>
		</ZPopoverContent>
	</ZPopover>
</div>
<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
{#if name && !disabled}<input
		type="hidden"
		{form}
		{name}
		value={valueState.current?.toString() ?? ''}
	/>{/if}
