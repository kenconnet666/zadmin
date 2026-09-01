<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import type { CalendarRange, CalendarRangeValue, Weekday } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export interface ZCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly appearance?: 'bare' | 'calendar';
		readonly calendarLabel?: string;
		readonly defaultFocusedValue?: CalendarDateValue;
		readonly defaultValue?: CalendarDateValue | null;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		focusedValue?: CalendarDateValue;
		readonly form?: string;
		readonly formParticipation?: 'auto' | 'none';
		readonly invalid?: boolean;
		/** @deprecated Use isDateUnavailable. */
		readonly isDateDisabled?: (date: CalendarDateValue) => boolean;
		readonly isDateUnavailable?: (date: CalendarDateValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly onFocusedValueChange?: (value: CalendarDateValue) => void;
		readonly onValueChange?: (value: CalendarDateValue | null) => void;
		readonly previousLabel?: string;
		readonly range?: CalendarRange | CalendarRangeValue | null;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		value?: CalendarDateValue | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'calendar',
		importStatement: "import { ZCalendar } from '@zadmin/zui';",
		name: 'ZCalendar',
		bindings: [
			{ description: '选择日期；null是显式空值。', name: 'value', type: 'CalendarDate | null' },
			{ description: '键盘焦点日期。', name: 'focusedValue', type: 'CalendarDate | undefined' },
			{ description: '真实calendar根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['@internationalized/date', '6x7 calendar grid', 'roving focus', 'FormValue'],
		events: [
			{
				description: '用户选择可用日期。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
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
			{ description: '选择focused日期。', key: 'Enter / Space' },
			{ description: '非必填时清空选择。', key: 'Delete / Backspace' }
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
				default: 'null',
				description: '选择日期；null是受控空值，undefined仅表示未提供绑定。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'undefined',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				bindable: true,
				default: 'defaultFocusedValue、value或today',
				description: '受控键盘焦点日期，并驱动显示月份。',
				name: 'focusedValue',
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
				default: 'Provider timeZone或UTC',
				description: 'today、weekday和CalendarDate格式化使用的SSR稳定IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'localePack.date.calendarLabel',
				description: 'Calendar grid可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'localePack.date.previousMonth',
				description: '上一月按钮可访问名称。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'localePack.date.nextMonth',
				description: '下一月按钮可访问名称。',
				name: 'nextLabel',
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
			},
			{
				default: "'auto'",
				description: '复合Picker设none，由外层唯一拥有FormValueBridge与reset。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				default: 'undefined',
				description: '禁用特定日期；同时影响指针和键盘导航。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Field size或Provider density',
				description: '统一容器间距、导航与日期cell尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCalendar.svelte',
		states: [
			{ description: '选择日期或range内日期。', name: 'data-selected', values: ['true'] },
			{ description: '范围起点或终点。', name: 'data-range-edge', values: ['start', 'end'] },
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
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			size: {
				large: (s) => s.gap._large,
				medium: (s) => s.gap._medium,
				small: (s) => s.gap._small
			}
		},
		compoundVariants: [
			{ style: (s) => s.padding._large, when: { appearance: 'calendar', size: 'large' } },
			{ style: (s) => s.padding._medium, when: { appearance: 'calendar', size: 'medium' } },
			{ style: (s) => s.padding._small, when: { appearance: 'calendar', size: 'small' } }
		],
		defaultVariants: { appearance: 'calendar', disabled: false, size: 'medium' }
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
			styleInternalAction(s);
			s.borderColor._border;
			s.borderRadius._small;
			s.color._text;
		},
		variants: {
			size: {
				large: (s) => {
					s.height._large;
					s.width._large;
				},
				medium: (s) => {
					s.height._medium;
					s.width._medium;
				},
				small: (s) => {
					s.height._small;
					s.width._small;
				}
			}
		},
		defaultVariants: { size: 'medium' }
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
			s.textAlign.center;
		},
		variants: {
			size: {
				large: (s) => {
					s.height._large;
					s.width._xlarge;
				},
				medium: (s) => {
					s.height._medium;
					s.width._large;
				},
				small: (s) => {
					s.height._small;
					s.width._medium;
				}
			}
		},
		defaultVariants: { size: 'medium' }
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
			},
			size: {
				large: (s) => {
					s.height._xlarge;
					s.width._xlarge;
				},
				medium: (s) => {
					s.height._large;
					s.width._large;
				},
				small: (s) => {
					s.height._medium;
					s.width._medium;
				}
			}
		},
		defaultVariants: { disabled: false, outside: false, selected: false, size: 'medium' }
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
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		CalendarDate,
		isSameDay,
		isSameMonth,
		startOfMonth,
		today
	} from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		calendarMonth,
		clampDate,
		formatDate,
		isDateInRange,
		isDateUnavailable as dateIsUnavailable,
		normalizeRangeValue,
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
		'aria-describedby': ariaDescribedBy,
		'aria-labelledby': ariaLabelledBy,
		appearance = 'calendar',
		calendarLabel,
		class: className,
		defaultFocusedValue,
		defaultValue,
		disabled = false,
		firstDayOfWeek,
		focusedValue = $bindable(),
		form,
		formParticipation = 'auto',
		invalid = false,
		isDateDisabled,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		nextLabel,
		onFocusedValueChange,
		onValueChange,
		previousLabel,
		range,
		ref = $bindable(null),
		readonly = false,
		required = false,
		showOutsideDates = true,
		size,
		style,
		timeZone,
		value = $bindable(),
		...rest
	}: ZCalendarProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const PreviousIcon = $derived(zui.direction === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(zui.direction === 'rtl' ? ChevronLeft : ChevronRight);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.calendarLabel);
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.date.nextMonth);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.date.previousMonth);
	const resolvedDisabled = $derived(disabled || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid || (field?.invalid ?? false));
	const resolvedReadonly = $derived(readonly || (field?.readonly ?? false));
	const resolvedRequired = $derived(required || (field?.required ?? false));
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const constraints = $derived.by(() => {
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZCalendar minValue cannot exceed maxValue.');
		if (isDateDisabled && isDateUnavailable)
			throw new TypeError(
				'ZCalendar isDateUnavailable and deprecated isDateDisabled are mutually exclusive.'
			);
		return { predicate: isDateUnavailable ?? isDateDisabled };
	});
	const initialFocus = untrack(() => {
		const candidate = clampDate(
			defaultFocusedValue ?? defaultValue ?? today(resolvedTimeZone),
			minValue,
			maxValue
		);
		return availableFrom(candidate, 1) ?? availableFrom(candidate, -1) ?? candidate;
	});
	let fallbackFocused = $state<CalendarDate>(initialFocus);
	const focused = $derived(focusedValue ?? fallbackFocused);
	let displayedMonth = $state<CalendarDate>(
		new CalendarDate(initialFocus.year, initialFocus.month, 1)
	);
	const buttons = new SvelteMap<string, HTMLButtonElement>();
	const valueState = new ControllableState<CalendarDate | null>({
		defaultValue: () => defaultValue ?? null,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const cells = $derived(calendarMonth(displayedMonth, resolvedLocale, firstDayOfWeek));
	const weekdays = $derived(
		weekdayLabels(displayedMonth, resolvedLocale, firstDayOfWeek, 'short', resolvedTimeZone)
	);
	const monthLabel = $derived(
		formatDate(displayedMonth, resolvedLocale, { month: 'long', year: 'numeric' }, resolvedTimeZone)
	);
	const currentToday = $derived(today(resolvedTimeZone));
	const normalizedRange = $derived(normalizeRangeValue(range));
	const rootClass = $derived(
		zui.recipe(rootRecipe, { appearance, disabled: resolvedDisabled, size: resolvedSize })
	);
	const headerClass = $derived(zui.recipe(headerRecipe));
	const navClass = $derived(zui.recipe(navRecipe, { size: resolvedSize }));
	const tableClass = $derived(zui.recipe(tableRecipe));
	const weekdayClass = $derived(zui.recipe(weekdayRecipe, { size: resolvedSize }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		valueState.reset();
		const next = clampDate(
			defaultFocusedValue ?? defaultValue ?? today(resolvedTimeZone),
			minValue,
			maxValue
		);
		fallbackFocused = next;
		focusedValue = undefined;
		displayedMonth = new CalendarDate(next.year, next.month, 1);
	}
	function unavailableDate(date: CalendarDate): boolean {
		return dateIsUnavailable(date, minValue, maxValue, constraints.predicate);
	}
	function unavailable(date: CalendarDate): boolean {
		return resolvedDisabled || unavailableDate(date);
	}
	function setFocused(next: CalendarDate, notify = true): void {
		const changed = !isSameDay(focused, next);
		fallbackFocused = next;
		focusedValue = next;
		if (notify && changed) onFocusedValueChange?.(next);
	}
	function availableFrom(candidate: CalendarDate, direction: -1 | 1): CalendarDate | null {
		let next = clampDate(candidate, minValue, maxValue);
		for (let attempts = 0; attempts < 3660; attempts += 1) {
			if (!unavailableDate(next)) return next;
			const stepped = next.add({ days: direction });
			if (
				(minValue && stepped.compare(minValue) < 0) ||
				(maxValue && stepped.compare(maxValue) > 0)
			)
				return null;
			next = stepped;
		}
		return null;
	}
	function focusDate(next: CalendarDate, direction: -1 | 1): void {
		if (resolvedDisabled) return;
		const available = availableFrom(next, direction);
		if (!available) return;
		setFocused(available);
		if (!isSameMonth(available, displayedMonth))
			displayedMonth = new CalendarDate(available.year, available.month, 1);
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() =>
			buttons.get(available.toString())?.focus({ preventScroll: true })
		);
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
		if (resolvedReadonly || unavailable(date)) return;
		setFocused(date);
		valueState.setFromUser(date);
	}
	function handleKeydown(event: KeyboardEvent, date: CalendarDate): void {
		const horizontal = zui.direction === 'rtl' ? -1 : 1;
		let next: CalendarDate;
		let direction: -1 | 1 = 1;
		switch (event.key) {
			case 'ArrowRight':
				next = date.add({ days: horizontal });
				direction = horizontal === 1 ? 1 : -1;
				break;
			case 'ArrowLeft':
				next = date.subtract({ days: horizontal });
				direction = horizontal === 1 ? -1 : 1;
				break;
			case 'ArrowDown':
				next = date.add({ weeks: 1 });
				break;
			case 'ArrowUp':
				next = date.subtract({ weeks: 1 });
				direction = -1;
				break;
			case 'Home':
				next = date.subtract({ days: weekDayIndex(date, resolvedLocale, firstDayOfWeek) });
				direction = -1;
				break;
			case 'End':
				next = date.add({ days: 6 - weekDayIndex(date, resolvedLocale, firstDayOfWeek) });
				break;
			case 'PageDown':
				next = date.add(event.shiftKey ? { years: 1 } : { months: 1 });
				break;
			case 'PageUp':
				next = date.subtract(event.shiftKey ? { years: 1 } : { months: 1 });
				direction = -1;
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				select(date);
				return;
			case 'Backspace':
			case 'Delete':
				if (!resolvedReadonly && !resolvedRequired) {
					event.preventDefault();
					valueState.setFromUser(null);
				}
				return;
			default:
				return;
		}
		event.preventDefault();
		focusDate(next, direction);
	}
	function moveMonth(amount: number): void {
		if (resolvedDisabled) return;
		const next = displayedMonth.add({ months: amount });
		if (minValue && amount < 0 && next.compare(startOfMonth(minValue)) < 0) return;
		if (maxValue && amount > 0 && next.compare(startOfMonth(maxValue)) > 0) return;
		displayedMonth = new CalendarDate(next.year, next.month, 1);
		const candidate = new CalendarDate(
			next.year,
			next.month,
			Math.min(focused.day, next.calendar.getDaysInMonth(next))
		);
		const available = availableFrom(candidate, amount < 0 ? -1 : 1);
		if (available && isSameMonth(available, next)) setFocused(available);
	}
	const previousDisabled = $derived(
		resolvedDisabled ||
			Boolean(
				minValue && displayedMonth.subtract({ months: 1 }).compare(startOfMonth(minValue)) < 0
			)
	);
	const nextDisabled = $derived(
		resolvedDisabled ||
			Boolean(maxValue && displayedMonth.add({ months: 1 }).compare(startOfMonth(maxValue)) > 0)
	);
	$effect(() => {
		const next = focused;
		if (!isSameMonth(next, displayedMonth))
			displayedMonth = new CalendarDate(next.year, next.month, 1);
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() => {
			buttons.get(focused.toString())?.focus({ preventScroll: true });
		})
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-describedby={describedBy}
	aria-invalid={resolvedInvalid || undefined}
	aria-readonly={resolvedReadonly || undefined}
	aria-required={resolvedRequired || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
>
	<div class={headerClass} data-slot="header">
		<button
			type="button"
			class={navClass}
			aria-label={resolvedPreviousLabel}
			disabled={previousDisabled}
			onclick={() => moveMonth(-1)}><PreviousIcon aria-hidden="true" size={16} /></button
		>
		<strong aria-live="polite">{monthLabel}</strong>
		<button
			type="button"
			class={navClass}
			aria-label={resolvedNextLabel}
			disabled={nextDisabled}
			onclick={() => moveMonth(1)}><NextIcon aria-hidden="true" size={16} /></button
		>
	</div>
	<table
		class={tableClass}
		data-slot="grid"
		role="grid"
		aria-label={labelledBy ? undefined : `${resolvedCalendarLabel}: ${monthLabel}`}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		aria-disabled={resolvedDisabled || undefined}
		aria-readonly={resolvedReadonly || undefined}
		aria-multiselectable={range ? true : undefined}
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
								isDateInRange(cell.date, normalizedRange)
							)}
						>
							{#if showOutsideDates || !cell.outsideMonth}
								<button
									use:registerButton={cell.date.toString()}
									type="button"
									class={zui.recipe(cellRecipe, {
										disabled: unavailable(cell.date),
										outside: cell.outsideMonth,
										size: resolvedSize,
										selected: Boolean(
											(valueState.current && isSameDay(cell.date, valueState.current)) ||
											isDateInRange(cell.date, normalizedRange)
										)
									})}
									disabled={unavailable(cell.date)}
									tabindex={isSameDay(cell.date, focused) ? 0 : -1}
									aria-label={formatDate(
										cell.date,
										resolvedLocale,
										{
											day: 'numeric',
											month: 'long',
											weekday: 'long',
											year: 'numeric'
										},
										resolvedTimeZone
									)}
									aria-current={isSameDay(cell.date, currentToday) ? 'date' : undefined}
									data-selected={Boolean(
										(valueState.current && isSameDay(cell.date, valueState.current)) ||
										isDateInRange(cell.date, normalizedRange)
									) || undefined}
									data-range-edge={normalizedRange?.start &&
									isSameDay(cell.date, normalizedRange.start)
										? 'start'
										: normalizedRange?.end && isSameDay(cell.date, normalizedRange.end)
											? 'end'
											: undefined}
									data-outside={cell.outsideMonth || undefined}
									data-disabled={unavailable(cell.date) || undefined}
									aria-disabled={unavailable(cell.date) || undefined}
									onfocus={() => setFocused(cell.date)}
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
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		{form}
		name={resolvedName}
		onReset={resetFromForm}
		value={valueState.current?.toString()}
	/>
{/if}
