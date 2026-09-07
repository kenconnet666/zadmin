import type { Time } from '@internationalized/date';

import {
	formatTime,
	normalizeTimeModelValue,
	resolveHourCycle,
	type TimeFieldGranularity
} from './date.js';

export type TimeValueGranularity = TimeFieldGranularity;

export interface TimeValueFormatOptions {
	readonly granularity?: TimeValueGranularity;
	readonly hourCycle?: 12 | 24;
}

export function normalizeTimeValue(value: unknown, owner = 'Time value'): Time {
	const normalized = normalizeTimeModelValue(value, owner);
	if (normalized === null) throw new TypeError(`${owner} must be a Time.`);
	return normalized;
}

export function validateTimeValueFormatOptions(options: TimeValueFormatOptions): void {
	if (
		options.granularity !== undefined &&
		!['hour', 'minute', 'second'].includes(options.granularity)
	)
		throw new TypeError("Time value granularity must be 'hour', 'minute' or 'second'.");
	if (options.hourCycle !== undefined && options.hourCycle !== 12 && options.hourCycle !== 24)
		throw new TypeError('Time value hourCycle must be 12 or 24.');
}

export function serializeTimeValue(value: Time): string {
	return normalizeTimeValue(value).toString();
}

export function formatTimeValue(
	value: Time,
	locale: string,
	options: TimeValueFormatOptions = {}
): string {
	const candidate = normalizeTimeValue(value);
	validateTimeValueFormatOptions(options);
	const granularity = options.granularity ?? 'minute';
	const hourCycle = options.hourCycle ?? resolveHourCycle(locale);
	return formatTime(candidate, locale, {
		hour: 'numeric',
		hourCycle: hourCycle === 12 ? 'h12' : 'h23',
		minute: granularity === 'hour' ? undefined : '2-digit',
		second: granularity === 'second' ? '2-digit' : undefined
	});
}
