<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { CalendarRange, Weekday } from '../../runtime/date.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly appearance?: 'bare' | 'calendar';
		readonly calendarLabel?: string;
		readonly defaultFocusedValue?: CalendarDateValue;
		readonly defaultValue?: CalendarDateValue;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly isDateDisabled?: (date: CalendarDateValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly onFocusedValueChange?: (value: CalendarDateValue) => void;
		readonly onValueChange?: (value: CalendarDateValue) => void;
		readonly previousLabel?: string;
		readonly range?: CalendarRange;
		ref?: HTMLDivElement | null;
		readonly showOutsideDates?: boolean;
		readonly timeZone?: string;
		value?: CalendarDateValue;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'calendar',
		importStatement: "import { ZCalendar } from '@zadmin/zui';",
		name: 'ZCalendar',
		bindings: [
			{ description: '选择日期。', name: 'value', type: 'CalendarDate | undefined' },
			{ description: '真实calendar根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['@internationalized/date', '6x7 calendar grid', 'roving focus', 'FormValue'],
		events: [
			{
				description: '用户选择可用日期。',
				name: 'onValueChange',
				type: '(value: CalendarDate) => void'
			},
			{
				description: '键盘焦点日期变化。',
				name: 'onFocusedValueChange',
				type: '(value: CalendarDate) => void'
			}
		],
		keyboard: [
			{ description: '按日/周移动，RTL反转左右。', key: 'Arrow keys' },
			{ description: '移动到当前周首尾。', key: 'Home / End' },
			{ description: '按月移动；Shift按年。', key: 'PageUp / PageDown' },
			{ description: '选择focused日期。', key: 'Enter / Space' }
		],
		parts: [
			{ description: '月份导航header。', name: 'header' },
			{ description: '日期grid。', name: 'grid' },
			{ description: '日期按钮。', name: 'cell' }
		],
		props: [
			{
				default: "'calendar'",
				description: '独立边框或供Picker复用的bare外观。',
				name: 'appearance',
				type: "'bare' | 'calendar'"
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
				default: 'value或today',
				description: '初始焦点与显示月。',
				name: 'defaultFocusedValue',
				type: 'CalendarDate'
			},
			{
				default: 'Provider locale',
				description: '周标题和日期名称locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'locale规则',
				description: '显式周起始日。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{
				default: 'undefined',
				description: '最小可选日期。',
				name: 'minValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '最大可选日期。',
				name: 'maxValue',
				type: 'CalendarDate'
			},
			{
				default: 'true',
				description: '显示相邻月份日期。',
				name: 'showOutsideDates',
				type: 'boolean'
			}
		],
		since: '0.6.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCalendar.svelte',
		states: [
			{ description: '选择日期或range内日期。', name: 'data-selected', values: ['true'] },
			{ description: '当前显示月外日期。', name: 'data-outside', values: ['true'] },
			{ description: '不可选择日期。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '固定6周grid、locale周序、完整键盘、范围呈现与CalendarDate表单值的Calendar。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.flexDirection.column;
			s.gap._medium;
		},
		variants: {
			appearance: {
				bare: () => undefined,
				calendar: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.padding._medium;
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { appearance: 'calendar', disabled: false }
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const navRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor._border;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.height._medium;
			s.width._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	const tableRecipe = defineRecipe({
		base: (s) => {
			s.borderCollapse.collapse;
		},
		variants: {},
		defaultVariants: {}
	});
	const weekdayRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
			s.fontWeight._medium;
			s.height._medium;
			s.textAlign.center;
			s.width._large;
		},
		variants: {},
		defaultVariants: {}
	});
	const cellRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor.transparent;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.height._large;
			s.width._large;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			outside: { false: () => undefined, true: (s) => s.color._textMuted },
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primary;
					s.color._canvas;
				}
			}
		},
		defaultVariants: { disabled: false, outside: false, selected: false }
	});
	for (const recipe of [
		rootRecipe,
		headerRecipe,
		navRecipe,
		tableRecipe,
		weekdayRecipe,
		cellRecipe
	])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { CalendarDate, isSameDay, isSameMonth, today } from '@internationalized/date';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { listenForFormReset } from '../../runtime/form/form-control.svelte.js';
	import {
		calendarMonth,
		formatDate,
		isDateInRange,
		isDateUnavailable,
		weekdayLabels,
		weekDayIndex
	} from '../../runtime/date.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		appearance = 'calendar',
		calendarLabel = 'Calendar',
		class: className,
		defaultFocusedValue,
		defaultValue,
		disabled = false,
		firstDayOfWeek,
		form,
		isDateDisabled,
		locale,
		maxValue,
		minValue,
		name,
		nextLabel = 'Next month',
		onFocusedValueChange,
		onValueChange,
		previousLabel = 'Previous month',
		range,
		ref = $bindable(null),
		showOutsideDates = true,
		style,
		timeZone = 'UTC',
		value = $bindable(),
		...rest
	}: ZCalendarProps = $props();
	const zui = useZui();
	const resolvedLocale = $derived(locale ?? zui.locale);
	const initialFocus = untrack(() => defaultFocusedValue ?? defaultValue ?? today(timeZone));
	let focused = $state<CalendarDate>(initialFocus);
	let displayedMonth = $state<CalendarDate>(
		new CalendarDate(initialFocus.year, initialFocus.month, 1)
	);
	let proxy = $state<HTMLInputElement | null>(null);
	const buttons = new SvelteMap<string, HTMLButtonElement>();
	const valueState = new ControllableState<CalendarDate | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next) onValueChange?.(next);
		},
		read: () => value,
		write: (next) => (value = next)
	});
	const cells = $derived(calendarMonth(displayedMonth, resolvedLocale, firstDayOfWeek));
	const weekdays = $derived(weekdayLabels(displayedMonth, resolvedLocale, firstDayOfWeek, 'short'));
	const monthLabel = $derived(
		formatDate(displayedMonth, resolvedLocale, { month: 'long', year: 'numeric' })
	);
	const currentToday = $derived(today(timeZone));
	const rootClass = $derived(zui.recipe(rootRecipe, { appearance, disabled }));
	const headerClass = $derived(zui.recipe(headerRecipe));
	const navClass = $derived(zui.recipe(navRecipe));
	const tableClass = $derived(zui.recipe(tableRecipe));
	const weekdayClass = $derived(zui.recipe(weekdayRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (!proxy) return;
		return listenForFormReset(proxy, () => {
			valueState.reset();
			const next = defaultFocusedValue ?? defaultValue ?? today(timeZone);
			focused = next;
			displayedMonth = new CalendarDate(next.year, next.month, 1);
		});
	});
	function unavailable(date: CalendarDate): boolean {
		return disabled || isDateUnavailable(date, minValue, maxValue, isDateDisabled);
	}
	function focusDate(next: CalendarDate): void {
		if (unavailable(next)) return;
		focused = next;
		onFocusedValueChange?.(next);
		if (!isSameMonth(next, displayedMonth))
			displayedMonth = new CalendarDate(next.year, next.month, 1);
		queueMicrotask(() => buttons.get(next.toString())?.focus({ preventScroll: true }));
	}
	function registerButton(node: HTMLButtonElement, key: string) {
		let current = key;
		buttons.set(current, node);
		return {
			destroy() {
				buttons.delete(current);
			},
			update(next: string) {
				buttons.delete(current);
				current = next;
				buttons.set(current, node);
			}
		};
	}
	function select(date: CalendarDate): void {
		if (unavailable(date)) return;
		focused = date;
		valueState.setFromUser(date);
	}
	function handleKeydown(event: KeyboardEvent, date: CalendarDate): void {
		const horizontal = zui.direction === 'rtl' ? -1 : 1;
		let next: CalendarDate | undefined;
		if (event.key === 'ArrowRight') next = date.add({ days: horizontal });
		else if (event.key === 'ArrowLeft') next = date.subtract({ days: horizontal });
		else if (event.key === 'ArrowDown') next = date.add({ weeks: 1 });
		else if (event.key === 'ArrowUp') next = date.subtract({ weeks: 1 });
		else if (event.key === 'Home')
			next = date.subtract({ days: weekDayIndex(date, resolvedLocale, firstDayOfWeek) });
		else if (event.key === 'End')
			next = date.add({ days: 6 - weekDayIndex(date, resolvedLocale, firstDayOfWeek) });
		else if (event.key === 'PageDown')
			next = date.add(event.shiftKey ? { years: 1 } : { months: 1 });
		else if (event.key === 'PageUp')
			next = date.subtract(event.shiftKey ? { years: 1 } : { months: 1 });
		else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			select(date);
			return;
		}
		if (next) {
			event.preventDefault();
			focusDate(next);
		}
	}
	function moveMonth(amount: number): void {
		const next = displayedMonth.add({ months: amount });
		displayedMonth = new CalendarDate(next.year, next.month, 1);
		const candidate = new CalendarDate(
			next.year,
			next.month,
			Math.min(focused.day, next.calendar.getDaysInMonth(next))
		);
		if (!unavailable(candidate)) focused = candidate;
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-disabled={disabled || undefined}
>
	<div class={headerClass} data-slot="header">
		<button
			type="button"
			class={navClass}
			aria-label={previousLabel}
			{disabled}
			onclick={() => moveMonth(-1)}>‹</button
		>
		<strong aria-live="polite">{monthLabel}</strong>
		<button
			type="button"
			class={navClass}
			aria-label={nextLabel}
			{disabled}
			onclick={() => moveMonth(1)}>›</button
		>
	</div>
	<table
		class={tableClass}
		data-slot="grid"
		role="grid"
		aria-label={`${calendarLabel}: ${monthLabel}`}
	>
		<thead
			><tr
				>{#each weekdays as weekday, index (`${weekday}-${index}`)}<th
						class={weekdayClass}
						scope="col">{weekday}</th
					>{/each}</tr
			></thead
		>
		<tbody>
			{#each Array.from({ length: 6 }, (_, index) => index) as week (week)}
				<tr>
					{#each cells.slice(week * 7, week * 7 + 7) as cell (cell.date.toString())}
						<td
							role="gridcell"
							aria-selected={Boolean(
								(valueState.current && isSameDay(cell.date, valueState.current)) ||
								isDateInRange(cell.date, range)
							)}
						>
							{#if showOutsideDates || !cell.outsideMonth}
								<button
									use:registerButton={cell.date.toString()}
									type="button"
									class={zui.recipe(cellRecipe, {
										disabled: unavailable(cell.date),
										outside: cell.outsideMonth,
										selected: Boolean(
											(valueState.current && isSameDay(cell.date, valueState.current)) ||
											isDateInRange(cell.date, range)
										)
									})}
									disabled={unavailable(cell.date)}
									tabindex={isSameDay(cell.date, focused) ? 0 : -1}
									aria-label={formatDate(cell.date, resolvedLocale, {
										day: 'numeric',
										month: 'long',
										weekday: 'long',
										year: 'numeric'
									})}
									aria-current={isSameDay(cell.date, currentToday) ? 'date' : undefined}
									data-selected={Boolean(
										(valueState.current && isSameDay(cell.date, valueState.current)) ||
										isDateInRange(cell.date, range)
									) || undefined}
									data-outside={cell.outsideMonth || undefined}
									data-disabled={unavailable(cell.date) || undefined}
									onfocus={() => (focused = cell.date)}
									onclick={() => select(cell.date)}
									onkeydown={(event) => handleKeydown(event, cell.date)}>{cell.date.day}</button
								>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
{#if name && !disabled}<input
		type="hidden"
		{form}
		{name}
		value={valueState.current?.toString() ?? ''}
	/>{/if}
