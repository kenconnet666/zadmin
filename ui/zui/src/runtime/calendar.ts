import { CalendarDate, startOfMonth } from '@internationalized/date';

import {
	calendarMonth,
	isGregorianCalendarDate,
	normalizeRangeValue,
	type CalendarCell,
	type CalendarRangeValue,
	type Weekday
} from './date.js';

export type CalendarSelectionMode = 'single' | 'multiple' | 'range';
export type CalendarWeekNumbering = 'iso' | 'locale';

export interface CalendarMonthCell extends CalendarCell {
	readonly duplicateOutside: boolean;
}

export function validateVisibleMonths(value: number): number {
	if (!Number.isInteger(value) || value < 1 || value > 12)
		throw new TypeError('ZCalendar visibleMonths must be an integer from 1 through 12.');
	return value;
}

export function visibleCalendarMonths(first: CalendarDate, count: number): readonly CalendarDate[] {
	validateVisibleMonths(count);
	const result: CalendarDate[] = [startOfMonth(first)];
	while (result.length < count) {
		const previous = result[result.length - 1]!;
		const next = startOfMonth(previous.add({ months: 1 }));
		if (next.compare(previous) <= 0) break;
		result.push(next);
	}
	return Object.freeze(result);
}

export function calendarMonthCells(
	month: CalendarDate,
	visibleMonths: readonly CalendarDate[],
	locale: string,
	firstDayOfWeek?: Weekday
): readonly CalendarMonthCell[] {
	const visible = new Set(
		visibleMonths.map(
			(item) => `${item.calendar.identifier}:${item.era}:${item.year}-${item.month}`
		)
	);
	const seen = new Set<string>();
	return Object.freeze(
		calendarMonth(month, locale, firstDayOfWeek).map((cell) => {
			const dateKey = cell.date.toString();
			const duplicateDate = seen.has(dateKey);
			seen.add(dateKey);
			return Object.freeze({
				...cell,
				duplicateOutside:
					duplicateDate ||
					(cell.outsideMonth &&
						visible.has(
							`${cell.date.calendar.identifier}:${cell.date.era}:${cell.date.year}-${cell.date.month}`
						))
			});
		})
	);
}

export function normalizeCalendarMultipleModelValue(
	value: unknown,
	owner = 'ZCalendar'
): readonly CalendarDate[] {
	if (value === null || value === undefined) return Object.freeze([]);
	if (!Array.isArray(value))
		throw new TypeError(
			`${owner} multiple value must be an array of Gregorian CalendarDate values.`
		);
	const result: CalendarDate[] = [];
	const seen = new Set<string>();
	for (const candidate of value) {
		if (!isGregorianCalendarDate(candidate))
			throw new TypeError(
				`${owner} multiple value must contain only Gregorian CalendarDate values.`
			);
		const key = candidate.toString();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(candidate);
	}
	return Object.freeze(result);
}

export function toggleCalendarMultipleValue(
	value: readonly CalendarDate[],
	date: CalendarDate
): readonly CalendarDate[] {
	const index = value.findIndex((candidate) => candidate.compare(date) === 0);
	return Object.freeze(
		index < 0
			? [...value, date]
			: value.filter((_candidate, candidateIndex) => candidateIndex !== index)
	);
}

export function calendarRangeIsContiguous(
	range: CalendarRangeValue | null,
	isUnavailable: (date: CalendarDate) => boolean
): boolean {
	const normalized = normalizeRangeValue(range);
	if (!normalized?.start || !normalized.end) return true;
	let date = normalized.start;
	for (;;) {
		if (isUnavailable(date)) return false;
		if (date.compare(normalized.end) === 0) return true;
		date = date.add({ days: 1 });
	}
}
