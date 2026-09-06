import {
	CalendarDate,
	CalendarDateTime,
	GregorianCalendar,
	Time,
	ZonedDateTime
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { copyFormDateValue, sameFormValue } from '../src/runtime/form/form-value-equality.js';

describe('form value equality', () => {
	it('copies supported values without losing their private brand or immutable methods', () => {
		const original = new CalendarDate(2026, 9, 7);
		const copy = copyFormDateValue(original);
		expect(copy).toBeInstanceOf(CalendarDate);
		expect(copy).not.toBe(original);
		expect(Object.isFrozen(copy)).toBe(true);
		expect((copy as CalendarDate).add({ days: 1 }).toString()).toBe('2026-09-08');
		expect(sameFormValue(copy, original)).toBe(true);
		expect(copyFormDateValue(new Date(0))).toBeUndefined();
	});
	it('compares the supported immutable date value types through their value fields', () => {
		expect(sameFormValue(new CalendarDate(2026, 9, 7), new CalendarDate(2026, 9, 7))).toBe(true);
		expect(sameFormValue(new CalendarDate(2026, 9, 7), new CalendarDate(2026, 9, 8))).toBe(false);
		expect(sameFormValue(new Time(10, 30, 15, 20), new Time(10, 30, 15, 20))).toBe(true);
		expect(sameFormValue(new Time(10, 30, 15, 20), new Time(10, 30, 15, 21))).toBe(false);
		expect(
			sameFormValue(
				new CalendarDateTime(2026, 9, 7, 10, 30),
				new CalendarDateTime(2026, 9, 7, 10, 30)
			)
		).toBe(true);
		expect(sameFormValue(new CalendarDate(2026, 9, 7), new CalendarDateTime(2026, 9, 7))).toBe(
			false
		);
	});
	it('keeps zone and offset identity even for coinciding instants', () => {
		const utc = new ZonedDateTime(2026, 9, 7, 'UTC', 0, 10, 30);
		expect(sameFormValue(utc, new ZonedDateTime(2026, 9, 7, 'UTC', 0, 10, 30))).toBe(true);
		expect(sameFormValue(utc, new ZonedDateTime(2026, 9, 7, 'Etc/UTC', 0, 10, 30))).toBe(false);
		expect(sameFormValue(utc, new ZonedDateTime(2026, 9, 7, 'UTC', 3600000, 11, 30))).toBe(false);
	});
	it('retains calendar-era meaning and recursively handles ranges and arrays', () => {
		const left = new CalendarDate(new GregorianCalendar(), 'AD', 2026, 9, 7);
		const right = new CalendarDate(new GregorianCalendar(), 'BC', 2026, 9, 7);
		expect(sameFormValue(left, right)).toBe(false);
		expect(
			sameFormValue(
				{ range: { start: left, end: null }, times: [new Time(8)] },
				{ range: { start: new CalendarDate(2026, 9, 7), end: null }, times: [new Time(8)] }
			)
		).toBe(true);
		expect(sameFormValue(new Array(1), [undefined])).toBe(false);
		expect(sameFormValue([undefined], new Array(1))).toBe(false);
	});
	it('does not call arbitrary object methods or erase custom-class identity', () => {
		class Opaque {
			compare(): never {
				throw new Error('must not be called');
			}
			toString(): never {
				throw new Error('must not be called');
			}
		}
		const value = new Opaque();
		expect(sameFormValue(value, value)).toBe(true);
		expect(sameFormValue(value, new Opaque())).toBe(false);
		expect(sameFormValue(new Date(0), new Date(0))).toBe(false);
		expect(sameFormValue(new Blob(['value']), new Blob(['value']))).toBe(false);
	});
});
