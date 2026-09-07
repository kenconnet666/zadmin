import { CalendarDate, createCalendar } from '@internationalized/date';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDateField from '../src/components/input/ZDateField.svelte';

describe('ZDateField international calendar SSR contract', () => {
	it('renders a Japanese era control while keeping ISO FormData serialization', () => {
		const value = new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7);
		const body = render(ZDateField, {
			props: {
				locale: 'ja-JP-u-ca-japanese',
				name: 'release',
				timeZone: 'Asia/Tokyo',
				value
			}
		}).body;
		expect(body).toContain('data-calendar="japanese"');
		expect(body).toContain('<select');
		expect(body).toContain('value="reiwa"');
		expect(body).toContain('value="8"');
		expect(body).not.toContain('value="0008"');
		expect(body).toContain('name="release"');
		expect(body).toContain('value="2026-09-07"');
	});

	it('renders Hebrew fields and explicitly rejects an unsupported locale calendar', () => {
		const hebrew = new CalendarDate(createCalendar('hebrew'), 5784, 13, 1);
		const body = render(ZDateField, {
			props: { locale: 'en-US-u-ca-hebrew', value: hebrew }
		}).body;
		expect(body).toContain('data-calendar="hebrew"');
		expect(body).toContain('value="5784"');
		expect(body).toContain('value="13"');
		expect(
			() =>
				render(ZDateField, {
					props: { locale: 'zh-CN-u-ca-chinese', value: new CalendarDate(2026, 9, 7) }
				}).body
		).toThrow(/display calendar "chinese" is not supported/u);
	});

	it('formats Persian date segments with locale numerals during SSR', () => {
		const body = render(ZDateField, {
			props: {
				locale: 'fa-IR-u-ca-persian',
				value: new CalendarDate(createCalendar('persian'), 1403, 1, 1)
			}
		}).body;
		expect(body).toContain('value="۱۴۰۳"');
		expect(body).toContain('value="۰۱"');
	});
});
