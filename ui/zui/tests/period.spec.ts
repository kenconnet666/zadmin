import { CalendarDate, createCalendar } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	addPeriod,
	comparePeriods,
	formatPeriod,
	getLocaleWeekRules,
	isPeriodRangeAvailable,
	monthPeriod,
	normalizeMultiplePeriodSelection,
	normalizePeriod,
	normalizePeriodRange,
	normalizePeriodSelection,
	parsePeriod,
	periodEnd,
	periodFromDate,
	periodKey,
	periodSequence,
	periodStart,
	quarterPeriod,
	resolvePeriodConfiguration,
	samePeriod,
	serializePeriod,
	weekPeriod,
	yearPeriod
} from '../src/runtime/period.js';

describe('period model', () => {
	it('resolves embedded rules once and rejects conflicts across all configuration sources', () => {
		const custom = { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 } as const;
		expect(
			resolvePeriodConfiguration({
				kind: 'week',
				periods: [weekPeriod(2026, 1, custom)],
				locale: 'en-GB'
			}).weekRules
		).toEqual(custom);
		expect(
			resolvePeriodConfiguration({
				kind: 'quarter',
				periods: [quarterPeriod(2026, 1, 4)],
				locale: 'en-US'
			}).fiscalYearStartMonth
		).toBe(4);
		expect(() =>
			resolvePeriodConfiguration({
				kind: 'week',
				periods: [weekPeriod(2026, 1)],
				weekRules: custom,
				locale: 'en-US'
			})
		).toThrow(/weekRules/u);
		expect(() =>
			resolvePeriodConfiguration({
				kind: 'quarter',
				periods: [quarterPeriod(2026, 1, 4)],
				fiscalYearStartMonth: 1,
				locale: 'en-US'
			})
		).toThrow(/fiscalYearStartMonth/u);
		expect(() =>
			resolvePeriodConfiguration({
				kind: 'quarter',
				periods: [quarterPeriod(2026, 1, 4), quarterPeriod(2026, 4)],
				locale: 'en-US'
			})
		).toThrow();
		expect(() =>
			resolvePeriodConfiguration({
				kind: 'month',
				periods: [yearPeriod(2026)],
				locale: 'en-US'
			})
		).toThrow(/month/u);
	});
	it('creates frozen plain records and strictly normalizes finite integer fields', () => {
		const month = monthPeriod(2026, 9);
		expect(month).toEqual({ kind: 'month', month: 9, year: 2026 });
		expect(Object.isFrozen(month)).toBe(true);
		expect(Object.getPrototypeOf(month)).toBe(Object.prototype);
		expect(normalizePeriod({ kind: 'year', year: 2026 })).toEqual(yearPeriod(2026));
		expect(() => monthPeriod(2026, Number.NaN)).toThrow(/finite integer/u);
		expect(() => normalizePeriod({ extra: true, kind: 'year', year: 2026 })).toThrow(/exactly/u);
		expect(() =>
			normalizePeriod(
				new (class PeriodLike {
					kind = 'year';
					year = 2026;
				})()
			)
		).toThrow(/plain/u);
		expect(() =>
			periodFromDate(new CalendarDate(createCalendar('hebrew'), 5786, 1, 1), { kind: 'month' })
		).toThrow(/Gregorian/u);
	});

	it('calculates inclusive Gregorian month, leap-year, year and fiscal-quarter boundaries', () => {
		expect(periodStart(monthPeriod(2024, 2)).toString()).toBe('2024-02-01');
		expect(periodEnd(monthPeriod(2024, 2)).toString()).toBe('2024-02-29');
		expect(periodEnd(yearPeriod(2024)).toString()).toBe('2024-12-31');

		const fiscalQ4 = quarterPeriod(2026, 4, 4);
		expect(periodStart(fiscalQ4).toString()).toBe('2027-01-01');
		expect(periodEnd(fiscalQ4).toString()).toBe('2027-03-31');
		expect(
			periodFromDate(new CalendarDate(2027, 2, 10), {
				fiscalYearStartMonth: 4,
				kind: 'quarter'
			})
		).toEqual(fiscalQ4);
		expect(periodEnd(quarterPeriod(9999, 4)).toString()).toBe('9999-12-31');
		expect(() => quarterPeriod(9999, 4, 4)).toThrow(/represented completely/u);
	});

	it('uses embedded week rules across ISO week-years and validates real week 53', () => {
		const first2020 = periodFromDate(new CalendarDate(2019, 12, 30), { kind: 'week' });
		expect(first2020).toEqual(weekPeriod(2020, 1));
		expect(periodStart(first2020).toString()).toBe('2019-12-30');
		expect(periodEnd(first2020).toString()).toBe('2020-01-05');

		const last2020 = periodFromDate(new CalendarDate(2021, 1, 1), { kind: 'week' });
		expect(last2020).toEqual(weekPeriod(2020, 53));
		expect(periodStart(last2020).toString()).toBe('2020-12-28');
		expect(periodEnd(last2020).toString()).toBe('2021-01-03');
		expect(() => weekPeriod(2021, 53)).toThrow(/Week/u);

		const usWeek = periodFromDate(new CalendarDate(2021, 12, 31), {
			firstDayOfWeek: 'sun',
			kind: 'week',
			minimalDaysInFirstWeek: 1
		});
		expect(usWeek).toEqual(
			weekPeriod(2022, 1, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })
		);
		expect(periodStart(usWeek).toString()).toBe('2021-12-26');
		expect(periodStart(weekPeriod(1, 1)).toString()).toBe('0001-01-01');
		expect(() => weekPeriod(1, 1, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })).toThrow(
			/represented completely/u
		);
		expect(periodEnd(weekPeriod(9999, 1)).compare(periodStart(weekPeriod(9999, 1)))).toBe(6);
		expect(() => weekPeriod(9999, 53)).toThrow(/Week/u);
	});

	it('reads locale week rules without making locale part of period identity', () => {
		expect(getLocaleWeekRules('en-US')).toEqual({
			firstDayOfWeek: 'sun',
			minimalDaysInFirstWeek: 1
		});
		expect(getLocaleWeekRules('en-GB')).toEqual({
			firstDayOfWeek: 'mon',
			minimalDaysInFirstWeek: 4
		});
	});

	it('serializes every kind reversibly and preserves non-default fiscal or week rules', () => {
		for (const [period, serialized] of [
			[monthPeriod(2026, 9), '2026-09'],
			[yearPeriod(2026), '2026'],
			[quarterPeriod(2026, 3), '2026-Q3'],
			[quarterPeriod(2026, 3, 4), '2026-Q3@fs=04'],
			[weekPeriod(2020, 53), '2020-W53'],
			[
				weekPeriod(2022, 1, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }),
				'2022-W01@fd=sun,md=1'
			]
		] as const) {
			expect(serializePeriod(period)).toBe(serialized);
			expect(parsePeriod(serialized)).toEqual(period);
		}
		expect(periodKey(quarterPeriod(2026, 3, 4))).toBe('quarter:2026-Q3@fs=04');
		expect(formatPeriod(quarterPeriod(2026, 3, 4), 'en-US')).not.toContain('@fs=04');
		expect(formatPeriod(quarterPeriod(2026, 3, 4), 'en-US', { includeRule: true })).toContain(
			'@fs=04'
		);
		expect(() => parsePeriod('2021-W53')).toThrow(/Week/u);
		expect(() => parsePeriod('2026-Q3@fs=01')).toThrow(/canonical/u);
		expect(() => parsePeriod('2020-W53@fd=mon,md=4')).toThrow(/canonical/u);
	});

	it('compares, pages and sequences only compatible period identities', () => {
		expect(comparePeriods(monthPeriod(2026, 8), monthPeriod(2026, 9))).toBeLessThan(0);
		expect(samePeriod(quarterPeriod(2026, 2, 4), quarterPeriod(2026, 2, 4))).toBe(true);
		expect(samePeriod(null, undefined)).toBe(true);
		expect(() => comparePeriods(quarterPeriod(2026, 2), quarterPeriod(2026, 2, 4))).toThrow(
			/same kind/u
		);
		expect(addPeriod(quarterPeriod(2026, 4, 4), 1)).toEqual(quarterPeriod(2027, 1, 4));
		expect(periodSequence(monthPeriod(2026, 11), 3)).toEqual([
			monthPeriod(2026, 11),
			monthPeriod(2026, 12),
			monthPeriod(2027, 1)
		]);
	});

	it('normalizes single, deduplicated multiple and partial or ordered range selections', () => {
		const august = monthPeriod(2026, 8);
		const september = monthPeriod(2026, 9);
		expect(normalizePeriodSelection('single', undefined, 'month')).toBeNull();
		expect(normalizePeriodSelection('multiple', undefined, 'month')).toEqual([]);
		expect(normalizePeriodSelection('range', undefined, 'month')).toBeNull();
		expect(normalizeMultiplePeriodSelection([august, september, august], 'month')).toEqual([
			august,
			september
		]);
		expect(normalizePeriodRange({ end: august, start: september }, 'month')).toEqual({
			end: september,
			start: august
		});
		expect(normalizePeriodRange({ end: null, start: september }, 'month')).toEqual({
			end: null,
			start: september
		});
	});

	it('checks contiguous range availability while supporting explicit non-contiguous ranges', () => {
		const range = { end: monthPeriod(2026, 10), start: monthPeriod(2026, 8) };
		const unavailable = (period: ReturnType<typeof monthPeriod>) => period.month === 9;
		expect(isPeriodRangeAvailable(range, unavailable)).toBe(false);
		expect(isPeriodRangeAvailable(range, unavailable, true)).toBe(true);
		expect(
			isPeriodRangeAvailable(
				{ end: monthPeriod(2026, 9), start: monthPeriod(2026, 8) },
				unavailable,
				true
			)
		).toBe(false);
		expect(
			isPeriodRangeAvailable({ end: yearPeriod(9999), start: yearPeriod(9999) }, () => false)
		).toBe(true);
		expect(
			isPeriodRangeAvailable(
				{ end: monthPeriod(1900, 1), start: monthPeriod(1000, 1) },
				() => false
			)
		).toBe(true);
	});
});
