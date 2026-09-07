import { CalendarDate, endOfMonth, getDayOfWeek, startOfWeek } from '@internationalized/date';

import type { Weekday } from './date.js';

export type PeriodKind = 'month' | 'quarter' | 'week' | 'year';
export type PeriodSelectionMode = 'multiple' | 'range' | 'single';

export interface MonthPeriod {
	readonly kind: 'month';
	readonly month: number;
	readonly year: number;
}

export interface YearPeriod {
	readonly kind: 'year';
	readonly year: number;
}

/** `year` is the Gregorian year in which this fiscal year begins. */
export interface QuarterPeriod {
	readonly fiscalYearStartMonth: number;
	readonly kind: 'quarter';
	readonly quarter: number;
	readonly year: number;
}

export interface WeekRules {
	readonly firstDayOfWeek: Weekday;
	readonly minimalDaysInFirstWeek: number;
}

/** Week year and number are interpreted only through the rules stored in this record. */
export interface WeekPeriod extends WeekRules {
	readonly kind: 'week';
	readonly week: number;
	readonly year: number;
}

export type Period = MonthPeriod | QuarterPeriod | WeekPeriod | YearPeriod;
export type PeriodOfKind<TKind extends PeriodKind> = Extract<Period, { readonly kind: TKind }>;

export interface PeriodRangeValue<TKind extends PeriodKind = PeriodKind> {
	readonly end: PeriodOfKind<TKind> | null;
	readonly start: PeriodOfKind<TKind> | null;
}

export type PeriodSelectionValue<
	TKind extends PeriodKind,
	TMode extends PeriodSelectionMode
> = TMode extends 'multiple'
	? readonly PeriodOfKind<TKind>[]
	: TMode extends 'range'
		? PeriodRangeValue<TKind> | null
		: PeriodOfKind<TKind> | null;

export type PeriodFromDateOptions =
	| Readonly<{ fiscalYearStartMonth?: number; kind: 'quarter' }>
	| Readonly<{ firstDayOfWeek?: Weekday; kind: 'week'; minimalDaysInFirstWeek?: number }>
	| Readonly<{ kind: 'month' }>
	| Readonly<{ kind: 'year' }>;
export type PeriodFromDateOptionsOfKind<TKind extends PeriodKind> = Extract<
	PeriodFromDateOptions,
	{ readonly kind: TKind }
>;

export interface PeriodFormatOptions {
	readonly includeRule?: boolean;
	readonly timeZone?: string;
}

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const WEEKDAY_SET = new Set<Weekday>(WEEKDAYS);
const VALIDATED_PERIODS = new WeakSet<object>();
// Unicode CLDR 48 weekData.minDays territories whose fallback minimum week length is four days:
// https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/weekData.json
// Modern runtimes use Intl.Locale weekInfo/getWeekInfo; this snapshot is only for older engines.
const MINIMAL_FOUR_DAY_REGIONS = new Set([
	'AD',
	'AN',
	'AT',
	'AX',
	'BE',
	'BG',
	'CH',
	'CZ',
	'DE',
	'DK',
	'EE',
	'ES',
	'FI',
	'FJ',
	'FO',
	'FR',
	'GB',
	'GF',
	'GG',
	'GI',
	'GP',
	'GR',
	'HU',
	'IE',
	'IM',
	'IS',
	'IT',
	'JE',
	'LI',
	'LT',
	'LU',
	'MC',
	'MQ',
	'NL',
	'NO',
	'PL',
	'PT',
	'RE',
	'RU',
	'SE',
	'SJ',
	'SK',
	'SM',
	'VA'
]);

function integer(name: string, value: unknown, minimum: number, maximum: number): number {
	if (
		typeof value !== 'number' ||
		!Number.isFinite(value) ||
		!Number.isInteger(value) ||
		value < minimum ||
		value > maximum
	)
		throw new RangeError(`${name} must be a finite integer from ${minimum} through ${maximum}.`);
	return value;
}

function periodYear(value: unknown): number {
	return integer('Period year', value, 1, 9999);
}

function plainRecord(value: unknown, owner: string): Record<string, unknown> {
	if (
		typeof value !== 'object' ||
		value === null ||
		Object.getPrototypeOf(value) !== Object.prototype
	)
		throw new TypeError(`${owner} must be a plain period record.`);
	return value as Record<string, unknown>;
}

function exactKeys(record: Record<string, unknown>, keys: readonly string[], owner: string): void {
	const actual = Object.keys(record).sort();
	const expected = [...keys].sort();
	if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index]))
		throw new TypeError(`${owner} must contain exactly ${expected.join(', ')}.`);
}

function gregorianDate(value: CalendarDate): CalendarDate {
	if (
		Object.getPrototypeOf(value) !== CalendarDate.prototype ||
		value.calendar.identifier !== 'gregory'
	)
		throw new TypeError('Period dates must be Gregorian CalendarDate values.');
	return value;
}

function weekRules(firstDayOfWeek: Weekday, minimalDaysInFirstWeek: number): WeekRules {
	if (!WEEKDAY_SET.has(firstDayOfWeek)) throw new RangeError('Invalid firstDayOfWeek.');
	return Object.freeze({
		firstDayOfWeek,
		minimalDaysInFirstWeek: integer('minimalDaysInFirstWeek', minimalDaysInFirstWeek, 1, 7)
	});
}

function weekYearStart(year: number, rules: WeekRules): CalendarDate {
	// Week periods at the calendar extremes may require days outside the representable Gregorian
	// range. Reject the whole week-year instead of accepting CalendarDate's clamped arithmetic.
	integer('Week year', year, 1, 9999);
	const first = new CalendarDate(year, 1, 1);
	const offset = getDayOfWeek(first, 'en-US', rules.firstDayOfWeek);
	const containingStart = first.subtract({ days: offset });
	if (containingStart.add({ days: offset }).compare(first) !== 0)
		throw new RangeError(`Week year ${year} cannot be represented completely.`);
	return 7 - offset >= rules.minimalDaysInFirstWeek
		? containingStart
		: containingStart.add({ days: 7 });
}

function weeksInWeekYear(year: number, rules: WeekRules): number {
	const start = weekYearStart(year, rules);
	if (year === 9999) {
		const completeDays = new CalendarDate(9999, 12, 31).compare(start) + 1;
		return Math.floor(completeDays / 7);
	}
	const next = weekYearStart(year + 1, rules);
	const days = next.compare(start);
	if (days !== 364 && days !== 371)
		throw new RangeError(`Week year ${year} cannot be represented completely.`);
	return days / 7;
}

function compatible(left: Period, right: Period): boolean {
	if (left.kind !== right.kind) return false;
	if (left.kind === 'quarter' && right.kind === 'quarter')
		return left.fiscalYearStartMonth === right.fiscalYearStartMonth;
	if (left.kind === 'week' && right.kind === 'week')
		return (
			left.firstDayOfWeek === right.firstDayOfWeek &&
			left.minimalDaysInFirstWeek === right.minimalDaysInFirstWeek
		);
	return true;
}

function assertCompatible(left: Period, right: Period): void {
	if (!compatible(left, right))
		throw new TypeError('Periods must have the same kind and embedded fiscal or week rules.');
}

function expectedKind<TKind extends PeriodKind>(period: Period, kind?: TKind): PeriodOfKind<TKind> {
	if (kind && period.kind !== kind) throw new TypeError(`Expected a ${kind} period.`);
	return period as PeriodOfKind<TKind>;
}

function frozenPeriod<TPeriod extends Period>(period: TPeriod): TPeriod {
	const frozen = Object.freeze(period);
	VALIDATED_PERIODS.add(frozen);
	return frozen;
}

export function monthPeriod(year: number, month: number): MonthPeriod {
	return frozenPeriod({
		kind: 'month',
		month: integer('Month', month, 1, 12),
		year: periodYear(year)
	});
}

export function yearPeriod(year: number): YearPeriod {
	return frozenPeriod({ kind: 'year', year: periodYear(year) });
}

export function quarterPeriod(
	year: number,
	quarter: number,
	fiscalYearStartMonth = 1
): QuarterPeriod {
	const period = frozenPeriod({
		fiscalYearStartMonth: integer('fiscalYearStartMonth', fiscalYearStartMonth, 1, 12),
		kind: 'quarter' as const,
		quarter: integer('Quarter', quarter, 1, 4),
		year: periodYear(year)
	});
	// Force representability validation at the factory boundary.
	periodStart(period);
	periodEnd(period);
	return period;
}

export function weekPeriod(
	year: number,
	week: number,
	rulesValue: WeekRules = { firstDayOfWeek: 'mon', minimalDaysInFirstWeek: 4 }
): WeekPeriod {
	const rulesRecord = plainRecord(rulesValue, 'WeekRules');
	exactKeys(rulesRecord, ['firstDayOfWeek', 'minimalDaysInFirstWeek'], 'WeekRules');
	const rules = weekRules(
		rulesRecord.firstDayOfWeek as Weekday,
		rulesRecord.minimalDaysInFirstWeek as number
	);
	const normalizedYear = integer('Week year', year, 1, 9999);
	const period = frozenPeriod({
		...rules,
		kind: 'week' as const,
		week: integer('Week', week, 1, weeksInWeekYear(normalizedYear, rules)),
		year: normalizedYear
	});
	periodStart(period);
	periodEnd(period);
	return period;
}

export function normalizePeriod(value: unknown): Period {
	const record = plainRecord(value, 'Period');
	switch (record.kind) {
		case 'month':
			exactKeys(record, ['kind', 'month', 'year'], 'MonthPeriod');
			return monthPeriod(record.year as number, record.month as number);
		case 'year':
			exactKeys(record, ['kind', 'year'], 'YearPeriod');
			return yearPeriod(record.year as number);
		case 'quarter':
			exactKeys(record, ['fiscalYearStartMonth', 'kind', 'quarter', 'year'], 'QuarterPeriod');
			return quarterPeriod(
				record.year as number,
				record.quarter as number,
				record.fiscalYearStartMonth as number
			);
		case 'week':
			exactKeys(
				record,
				['firstDayOfWeek', 'kind', 'minimalDaysInFirstWeek', 'week', 'year'],
				'WeekPeriod'
			);
			return weekPeriod(record.year as number, record.week as number, {
				firstDayOfWeek: record.firstDayOfWeek as Weekday,
				minimalDaysInFirstWeek: record.minimalDaysInFirstWeek as number
			});
		default:
			throw new TypeError('Unknown period kind.');
	}
}

/** Shared by inline and popup owners, including when no calendar panel is mounted. */
export function resolvePeriodConfiguration(options: {
	readonly kind: PeriodKind;
	readonly periods: readonly (Period | null | undefined)[];
	readonly weekRules?: WeekRules;
	readonly fiscalYearStartMonth?: number;
	readonly locale: string;
}): { readonly weekRules: WeekRules; readonly fiscalYearStartMonth: number } {
	if (!['month', 'year', 'quarter', 'week'].includes(options.kind))
		throw new TypeError('Period kind must be month, year, quarter or week.');
	const periods = options.periods
		.filter((period): period is Period => period != null)
		.map(normalizePeriodRecord);
	for (const period of periods) {
		if (period.kind !== options.kind)
			throw new TypeError(`Expected ${options.kind} Period values.`);
		if (periods[0]) comparePeriods(periods[0], period);
	}
	let explicitWeekRules: WeekRules | undefined;
	if (options.weekRules !== undefined) {
		const record = plainRecord(options.weekRules, 'WeekRules');
		exactKeys(record, ['firstDayOfWeek', 'minimalDaysInFirstWeek'], 'WeekRules');
		explicitWeekRules = weekRules(
			record.firstDayOfWeek as Weekday,
			record.minimalDaysInFirstWeek as number
		);
	}
	const fiscalStart =
		options.fiscalYearStartMonth === undefined
			? undefined
			: integer('fiscalYearStartMonth', options.fiscalYearStartMonth, 1, 12);
	const first = periods[0];
	if (
		first?.kind === 'week' &&
		explicitWeekRules &&
		(first.firstDayOfWeek !== explicitWeekRules.firstDayOfWeek ||
			first.minimalDaysInFirstWeek !== explicitWeekRules.minimalDaysInFirstWeek)
	)
		throw new TypeError('Period value conflicts with explicit weekRules.');
	if (
		first?.kind === 'quarter' &&
		fiscalStart !== undefined &&
		first.fiscalYearStartMonth !== fiscalStart
	)
		throw new TypeError('Period value conflicts with explicit fiscalYearStartMonth.');
	return Object.freeze({
		weekRules:
			first?.kind === 'week'
				? weekRules(first.firstDayOfWeek, first.minimalDaysInFirstWeek)
				: (explicitWeekRules ?? getLocaleWeekRules(options.locale)),
		fiscalYearStartMonth:
			first?.kind === 'quarter' ? first.fiscalYearStartMonth : (fiscalStart ?? 1)
	});
}

export function periodStart(periodValue: Period): CalendarDate {
	const period = normalizePeriodRecord(periodValue);
	switch (period.kind) {
		case 'month':
			return new CalendarDate(period.year, period.month, 1);
		case 'year':
			return new CalendarDate(period.year, 1, 1);
		case 'quarter': {
			const monthIndex = period.fiscalYearStartMonth - 1 + (period.quarter - 1) * 3;
			const year = period.year + Math.floor(monthIndex / 12);
			if (year > 9999) throw new RangeError('Quarter cannot be represented completely.');
			return new CalendarDate(year, (monthIndex % 12) + 1, 1);
		}
		case 'week':
			return weekYearStart(period.year, period).add({ days: (period.week - 1) * 7 });
	}
}

export function periodEnd(periodValue: Period): CalendarDate {
	const period = normalizePeriodRecord(periodValue);
	switch (period.kind) {
		case 'month':
			return endOfMonth(new CalendarDate(period.year, period.month, 1));
		case 'year':
			return new CalendarDate(period.year, 12, 31);
		case 'quarter': {
			const start = periodStart(period);
			const endMonthIndex = start.month - 1 + 2;
			const year = start.year + Math.floor(endMonthIndex / 12);
			if (year > 9999) throw new RangeError('Quarter cannot be represented completely.');
			return endOfMonth(new CalendarDate(year, (endMonthIndex % 12) + 1, 1));
		}
		case 'week': {
			const start = periodStart(period);
			const end = start.add({ days: 6 });
			if (end.compare(start) !== 6)
				throw new RangeError('Week cannot be represented as seven complete days.');
			return end;
		}
	}
}

/** Avoids rebuilding an already validated factory record inside start/end calculations. */
function normalizePeriodRecord(value: Period): Period {
	return VALIDATED_PERIODS.has(value) ? value : normalizePeriod(value);
}

export function periodFromDate<TOptions extends PeriodFromDateOptions>(
	dateValue: CalendarDate,
	options: TOptions
): PeriodOfKind<TOptions['kind']>;
export function periodFromDate(dateValue: CalendarDate, options: PeriodFromDateOptions): Period {
	const date = gregorianDate(dateValue);
	switch (options.kind) {
		case 'month':
			return monthPeriod(date.year, date.month);
		case 'year':
			return yearPeriod(date.year);
		case 'quarter': {
			const startMonth = options.fiscalYearStartMonth ?? 1;
			integer('fiscalYearStartMonth', startMonth, 1, 12);
			const fiscalYear = date.month >= startMonth ? date.year : date.year - 1;
			const quarter = Math.floor(((date.month - startMonth + 12) % 12) / 3) + 1;
			return quarterPeriod(fiscalYear, quarter, startMonth);
		}
		case 'week': {
			const rules = weekRules(options.firstDayOfWeek ?? 'mon', options.minimalDaysInFirstWeek ?? 4);
			let year = date.year;
			const currentStart = weekYearStart(year, rules);
			if (date.compare(currentStart) < 0) year -= 1;
			else if (year < 9999 && date.compare(weekYearStart(year + 1, rules)) >= 0) year += 1;
			const start = weekYearStart(year, rules);
			return weekPeriod(year, Math.floor(date.compare(start) / 7) + 1, rules);
		}
	}
}

export function comparePeriods(leftValue: Period, rightValue: Period): number {
	const left = normalizePeriod(leftValue);
	const right = normalizePeriod(rightValue);
	assertCompatible(left, right);
	return periodStart(left).compare(periodStart(right));
}

export function samePeriod(
	leftValue: Period | null | undefined,
	rightValue: Period | null | undefined
): boolean {
	if (!leftValue || !rightValue) return leftValue == null && rightValue == null;
	try {
		const left = normalizePeriod(leftValue);
		const right = normalizePeriod(rightValue);
		return compatible(left, right) && comparePeriods(left, right) === 0;
	} catch {
		return false;
	}
}

export function periodKey(periodValue: Period): string {
	const period = normalizePeriod(periodValue);
	return `${period.kind}:${serializePeriod(period)}`;
}

function fourDigitYear(year: number): string {
	return String(year).padStart(4, '0');
}

export function serializePeriod(periodValue: Period): string {
	const period = normalizePeriod(periodValue);
	switch (period.kind) {
		case 'month':
			return `${fourDigitYear(period.year)}-${String(period.month).padStart(2, '0')}`;
		case 'year':
			return fourDigitYear(period.year);
		case 'quarter':
			return `${fourDigitYear(period.year)}-Q${period.quarter}${period.fiscalYearStartMonth === 1 ? '' : `@fs=${String(period.fiscalYearStartMonth).padStart(2, '0')}`}`;
		case 'week':
			return `${fourDigitYear(period.year)}-W${String(period.week).padStart(2, '0')}${period.firstDayOfWeek === 'mon' && period.minimalDaysInFirstWeek === 4 ? '' : `@fd=${period.firstDayOfWeek},md=${period.minimalDaysInFirstWeek}`}`;
	}
}

export function parsePeriod(value: string): Period;
export function parsePeriod<TKind extends PeriodKind>(
	value: string,
	kind: TKind
): PeriodOfKind<TKind>;
export function parsePeriod(value: string, kind?: PeriodKind): Period {
	if (typeof value !== 'string' || value.trim() !== value)
		throw new TypeError('Serialized period must be a trimmed string.');
	let result: Period | undefined;
	let match = /^(\d{4})-(\d{2})$/u.exec(value);
	if (match) result = monthPeriod(Number(match[1]), Number(match[2]));
	match = /^(\d{4})-Q([1-4])(?:@fs=(0[1-9]|1[0-2]))?$/u.exec(value);
	if (match) result = quarterPeriod(Number(match[1]), Number(match[2]), Number(match[3] ?? 1));
	match = /^(\d{4})-W(\d{2})(?:@fd=(mon|tue|wed|thu|fri|sat|sun),md=([1-7]))?$/u.exec(value);
	if (match)
		result = weekPeriod(Number(match[1]), Number(match[2]), {
			firstDayOfWeek: (match[3] as Weekday | undefined) ?? 'mon',
			minimalDaysInFirstWeek: Number(match[4] ?? 4)
		});
	match = /^(\d{4})$/u.exec(value);
	if (match) result = yearPeriod(Number(match[1]));
	if (!result) throw new TypeError('Invalid serialized period.');
	if (serializePeriod(result) !== value)
		throw new TypeError('Serialized period must use its canonical reversible form.');
	if (kind && result.kind !== kind) throw new TypeError(`Expected a serialized ${kind} period.`);
	return result;
}

export function parsePeriodOfKind<TKind extends PeriodKind>(
	value: string,
	kind: TKind
): PeriodOfKind<TKind> {
	return parsePeriod(value, kind) as PeriodOfKind<TKind>;
}

export function formatPeriod(
	periodValue: Period,
	locale: string,
	options: PeriodFormatOptions = {}
): string {
	const period = normalizePeriod(periodValue);
	const number = new Intl.NumberFormat(locale, { useGrouping: false });
	const year = number.format(period.year);
	const includeRule = options.includeRule ?? false;
	switch (period.kind) {
		case 'month':
			return new Intl.DateTimeFormat(locale, {
				month: 'long',
				timeZone: options.timeZone ?? 'UTC',
				year: 'numeric'
			}).format(periodStart(period).toDate(options.timeZone ?? 'UTC'));
		case 'year':
			return year;
		case 'quarter':
			return `Q${number.format(period.quarter)} ${year}${includeRule ? ` @fs=${String(period.fiscalYearStartMonth).padStart(2, '0')}` : ''}`;
		case 'week':
			return `W${new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false }).format(period.week)} ${year}${includeRule ? ` @fd=${period.firstDayOfWeek},md=${period.minimalDaysInFirstWeek}` : ''}`;
	}
}

export function addPeriod<TPeriod extends Period>(periodValue: TPeriod, amount: number): TPeriod {
	const period = normalizePeriod(periodValue);
	integer('Period amount', amount, -1_000_000, 1_000_000);
	let result: Period;
	switch (period.kind) {
		case 'month': {
			const index = period.year * 12 + period.month - 1 + amount;
			result = monthPeriod(Math.floor(index / 12), (index % 12) + 1);
			break;
		}
		case 'year':
			result = yearPeriod(period.year + amount);
			break;
		case 'quarter': {
			const index = period.year * 4 + period.quarter - 1 + amount;
			result = quarterPeriod(Math.floor(index / 4), (index % 4) + 1, period.fiscalYearStartMonth);
			break;
		}
		case 'week':
			result = periodFromDate(periodStart(period).add({ days: amount * 7 }), {
				firstDayOfWeek: period.firstDayOfWeek,
				kind: 'week',
				minimalDaysInFirstWeek: period.minimalDaysInFirstWeek
			});
			break;
	}
	return result as TPeriod;
}

export function periodSequence<TPeriod extends Period>(
	period: TPeriod,
	count: number
): readonly TPeriod[] {
	integer('Period sequence count', count, 0, 10_000);
	return Object.freeze(Array.from({ length: count }, (_, index) => addPeriod(period, index)));
}

export function normalizeSinglePeriodSelection<TKind extends PeriodKind = PeriodKind>(
	value: unknown,
	kind?: TKind
): PeriodOfKind<TKind> | null {
	if (value === null || value === undefined) return null;
	return expectedKind(normalizePeriod(value), kind);
}

export function normalizeMultiplePeriodSelection<TKind extends PeriodKind = PeriodKind>(
	value: unknown,
	kind?: TKind
): readonly PeriodOfKind<TKind>[] {
	if (value === null || value === undefined) return Object.freeze([]);
	if (!Array.isArray(value)) throw new TypeError('Multiple period selection must be an array.');
	const result: PeriodOfKind<TKind>[] = [];
	for (const item of value) {
		const period = expectedKind(normalizePeriod(item), kind);
		if (result[0]) assertCompatible(result[0], period);
		if (!result.some((existing) => samePeriod(existing, period))) result.push(period);
	}
	return Object.freeze(result);
}

export function normalizePeriodRange<TKind extends PeriodKind = PeriodKind>(
	value: unknown,
	kind?: TKind
): PeriodRangeValue<TKind> | null {
	if (value === null || value === undefined) return null;
	const record = plainRecord(value, 'Period range');
	exactKeys(record, ['end', 'start'], 'Period range');
	const start = normalizeSinglePeriodSelection(record.start, kind);
	const end = normalizeSinglePeriodSelection(record.end, kind);
	if (!start && !end) return null;
	if (!start || !end) return Object.freeze({ end, start });
	assertCompatible(start, end);
	return comparePeriods(start, end) <= 0
		? Object.freeze({ end, start })
		: Object.freeze({ end: start, start: end });
}

export function normalizePeriodSelection<
	TKind extends PeriodKind = PeriodKind,
	TMode extends PeriodSelectionMode = PeriodSelectionMode
>(mode: TMode, value: unknown, kind?: TKind): PeriodSelectionValue<TKind, TMode> {
	switch (mode) {
		case 'single':
			return normalizeSinglePeriodSelection(value, kind) as PeriodSelectionValue<TKind, TMode>;
		case 'multiple':
			return normalizeMultiplePeriodSelection(value, kind) as PeriodSelectionValue<TKind, TMode>;
		case 'range':
			return normalizePeriodRange(value, kind) as PeriodSelectionValue<TKind, TMode>;
		default:
			throw new TypeError('Unknown period selection mode.');
	}
}

export function isPeriodRangeAvailable<TKind extends PeriodKind>(
	rangeValue: PeriodRangeValue<TKind> | null,
	isUnavailable?: (period: PeriodOfKind<TKind>) => boolean,
	allowNonContiguousRange = false
): boolean {
	const range = normalizePeriodRange(rangeValue);
	if (!range) return true;
	if (range.start && isUnavailable?.(range.start as PeriodOfKind<TKind>)) return false;
	if (range.end && isUnavailable?.(range.end as PeriodOfKind<TKind>)) return false;
	if (!range.start || !range.end || allowNonContiguousRange || !isUnavailable) return true;
	let current = range.start;
	while (true) {
		if (isUnavailable(current as PeriodOfKind<TKind>)) return false;
		if (comparePeriods(current, range.end) === 0) break;
		current = addPeriod(current, 1);
	}
	return true;
}

export function getLocaleWeekRules(locale: string): WeekRules {
	type WeekInfo = { readonly firstDay?: number; readonly minimalDays?: number };
	const localeValue = new Intl.Locale(locale) as Intl.Locale & {
		readonly weekInfo?: WeekInfo;
		getWeekInfo?: () => WeekInfo;
	};
	const info = localeValue.getWeekInfo?.() ?? localeValue.weekInfo;
	if (info?.firstDay && info.minimalDays) {
		const firstDay = WEEKDAYS[(info.firstDay + 6) % 7];
		if (firstDay) return weekRules(firstDay, info.minimalDays);
	}
	const probe = new CalendarDate(2024, 1, 1); // Monday.
	const localeStart = startOfWeek(probe, locale);
	const firstDay = WEEKDAYS[(7 - probe.compare(localeStart)) % 7] ?? 'mon';
	const region = localeValue.maximize().region;
	return weekRules(firstDay, region && MINIMAL_FOUR_DAY_REGIONS.has(region) ? 4 : 1);
}
