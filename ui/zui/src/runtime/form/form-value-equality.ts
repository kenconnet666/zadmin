import { CalendarDate, CalendarDateTime, Time, ZonedDateTime } from '@internationalized/date';

export type FormDateValue = CalendarDate | CalendarDateTime | Time | ZonedDateTime;

/** Copies the explicitly supported immutable values so model baselines cannot alias caller fields. */
export function copyFormDateValue(value: unknown): FormDateValue | undefined {
	if (!value || typeof value !== 'object') return undefined;
	const prototype = Object.getPrototypeOf(value);
	if (prototype === CalendarDate.prototype)
		return Object.freeze(CalendarDate.prototype.copy.call(value as CalendarDate)) as CalendarDate;
	if (prototype === CalendarDateTime.prototype)
		return Object.freeze(
			CalendarDateTime.prototype.copy.call(value as CalendarDateTime)
		) as CalendarDateTime;
	if (prototype === Time.prototype)
		return Object.freeze(Time.prototype.copy.call(value as Time)) as Time;
	if (prototype === ZonedDateTime.prototype)
		return Object.freeze(
			ZonedDateTime.prototype.copy.call(value as ZonedDateTime)
		) as ZonedDateTime;
	return undefined;
}

type DateParts = Pick<CalendarDate, 'calendar' | 'era' | 'year' | 'month' | 'day'>;
type TimeParts = Pick<Time, 'hour' | 'minute' | 'second' | 'millisecond'>;

function sameDate(left: DateParts, right: DateParts): boolean {
	return (
		left.calendar.identifier === right.calendar.identifier &&
		left.era === right.era &&
		left.year === right.year &&
		left.month === right.month &&
		left.day === right.day
	);
}
function sameTime(left: TimeParts, right: TimeParts): boolean {
	return (
		left.hour === right.hour &&
		left.minute === right.minute &&
		left.second === right.second &&
		left.millisecond === right.millisecond
	);
}

/**
 * Form values include the library's immutable date types. Compare their declared value fields,
 * without invoking arbitrary objects' compare/toString methods. Other class instances keep identity.
 */
export function sameFormValue(
	left: unknown,
	right: unknown,
	seen = new WeakMap<object, object>()
): boolean {
	if (Object.is(left, right)) return true;
	if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
	if (Array.isArray(left) && Array.isArray(right)) {
		if (left.length !== right.length) return false;
		if (seen.get(left) === right) return true;
		seen.set(left, right);
		for (let index = 0; index < left.length; index += 1) {
			const present = Object.hasOwn(left, index);
			if (
				present !== Object.hasOwn(right, index) ||
				(present && !sameFormValue(left[index], right[index], seen))
			)
				return false;
		}
		return true;
	}
	const leftPrototype = Object.getPrototypeOf(left);
	if (leftPrototype !== Object.getPrototypeOf(right)) return false;
	if (leftPrototype === CalendarDate.prototype)
		return sameDate(left as CalendarDate, right as CalendarDate);
	if (leftPrototype === Time.prototype) return sameTime(left as Time, right as Time);
	if (leftPrototype === CalendarDateTime.prototype)
		return (
			sameDate(left as CalendarDateTime, right as CalendarDateTime) &&
			sameTime(left as CalendarDateTime, right as CalendarDateTime)
		);
	if (leftPrototype === ZonedDateTime.prototype) {
		const first = left as ZonedDateTime;
		const second = right as ZonedDateTime;
		return (
			sameDate(first, second) &&
			sameTime(first, second) &&
			first.timeZone === second.timeZone &&
			first.offset === second.offset
		);
	}
	if (leftPrototype !== Object.prototype) return false;
	if (seen.get(left) === right) return true;
	seen.set(left, right);
	const keys = Object.keys(left);
	return (
		keys.length === Object.keys(right).length &&
		keys.every(
			(key) =>
				Object.hasOwn(right, key) &&
				sameFormValue(
					(left as Record<string, unknown>)[key],
					(right as Record<string, unknown>)[key],
					seen
				)
		)
	);
}
