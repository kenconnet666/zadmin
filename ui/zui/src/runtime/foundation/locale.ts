export interface ZuiCommonLocale {
	readonly close: string;
	readonly copy: string;
}

export interface ZuiDateLocale {
	readonly calendarLabel: string;
	readonly chooseDate: string;
	readonly chooseDateRange: string;
	readonly day: string;
	readonly month: string;
	readonly nextMonth: string;
	readonly previousMonth: string;
	readonly year: string;
}

export interface ZuiPaginationLocale {
	readonly label: string;
	readonly next: string;
	readonly page: (formattedPage: string) => string;
	readonly previous: string;
}

export interface ZuiTimeLocale {
	readonly am: string;
	readonly hour: string;
	readonly hourCycle: 12 | 24;
	readonly minute: string;
	readonly pm: string;
	readonly second: string;
	readonly toggleDayPeriod: string;
}

export interface ZuiLocalePack {
	readonly common: ZuiCommonLocale;
	readonly date: ZuiDateLocale;
	readonly pagination: ZuiPaginationLocale;
	readonly time: ZuiTimeLocale;
}

export interface ZuiLocalePackOverrides {
	readonly common?: Partial<ZuiCommonLocale>;
	readonly date?: Partial<ZuiDateLocale>;
	readonly pagination?: Partial<ZuiPaginationLocale>;
	readonly time?: Partial<ZuiTimeLocale>;
}

/** @deprecated Use the typed ZuiLocalePackOverrides contract. */
export type ZuiTranslations = Readonly<Record<string, string>>;

export const enUSLocalePack = Object.freeze({
	common: Object.freeze({ close: 'Close', copy: 'Copy' }),
	date: Object.freeze({
		calendarLabel: 'Calendar',
		chooseDate: 'Choose date',
		chooseDateRange: 'Choose date range',
		day: 'Day',
		month: 'Month',
		nextMonth: 'Next month',
		previousMonth: 'Previous month',
		year: 'Year'
	}),
	pagination: Object.freeze({
		label: 'Pagination',
		next: 'Next page',
		page: (formattedPage: string) => `Page ${formattedPage}`,
		previous: 'Previous page'
	}),
	time: Object.freeze({
		am: 'AM',
		hour: 'Hour',
		hourCycle: 12,
		minute: 'Minute',
		pm: 'PM',
		second: 'Second',
		toggleDayPeriod: 'Toggle AM/PM'
	})
}) satisfies ZuiLocalePack;

export const zhCNLocalePack = Object.freeze({
	common: Object.freeze({ close: '关闭', copy: '复制' }),
	date: Object.freeze({
		calendarLabel: '日历',
		chooseDate: '选择日期',
		chooseDateRange: '选择日期范围',
		day: '日',
		month: '月',
		nextMonth: '下个月',
		previousMonth: '上个月',
		year: '年'
	}),
	pagination: Object.freeze({
		label: '分页导航',
		next: '下一页',
		page: (formattedPage: string) => `第${formattedPage}页`,
		previous: '上一页'
	}),
	time: Object.freeze({
		am: '上午',
		hour: '小时',
		hourCycle: 24,
		minute: '分钟',
		pm: '下午',
		second: '秒',
		toggleDayPeriod: '切换上午或下午'
	})
}) satisfies ZuiLocalePack;

function legacyOverrides(translations: ZuiTranslations | undefined): ZuiLocalePackOverrides {
	if (!translations) return {};
	const page = translations['pagination.page'];
	return {
		common: {
			close: translations.close,
			copy: translations.copy
		},
		date: {
			calendarLabel: translations['date.calendarLabel'],
			chooseDate: translations['date.chooseDate'],
			chooseDateRange: translations['date.chooseDateRange'],
			day: translations['date.day'],
			month: translations['date.month'],
			nextMonth: translations['date.nextMonth'],
			previousMonth: translations['date.previousMonth'],
			year: translations['date.year']
		},
		pagination: {
			label: translations['pagination.label'],
			next: translations['pagination.next'],
			page: page ? (formattedPage) => page.replace('{page}', formattedPage) : undefined,
			previous: translations['pagination.previous']
		},
		time: {
			am: translations['time.am'],
			hour: translations['time.hour'],
			minute: translations['time.minute'],
			pm: translations['time.pm'],
			second: translations['time.second'],
			toggleDayPeriod: translations['time.toggleDayPeriod']
		}
	};
}

function mergeDefined<TValue extends object>(
	base: TValue,
	...sources: readonly (Partial<TValue> | undefined)[]
): TValue {
	const result = { ...base };
	for (const source of sources) {
		if (!source) continue;
		for (const key of Object.keys(source) as (keyof TValue)[]) {
			const value = source[key];
			if (value !== undefined) result[key] = value as TValue[keyof TValue];
		}
	}
	return result;
}

export function resolveZuiLocalePack(
	base: ZuiLocalePack,
	overrides?: ZuiLocalePackOverrides,
	translations?: ZuiTranslations
): ZuiLocalePack {
	const legacy = legacyOverrides(translations);
	return Object.freeze({
		common: Object.freeze(mergeDefined(base.common, legacy.common, overrides?.common)),
		date: Object.freeze(mergeDefined(base.date, legacy.date, overrides?.date)),
		pagination: Object.freeze(
			mergeDefined(base.pagination, legacy.pagination, overrides?.pagination)
		),
		time: Object.freeze(mergeDefined(base.time, legacy.time, overrides?.time))
	});
}
