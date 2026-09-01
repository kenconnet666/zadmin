export interface ZuiCommonLocale {
	readonly close: string;
	readonly copy: string;
}

export interface ZuiPaginationLocale {
	readonly label: string;
	readonly next: string;
	readonly page: (formattedPage: string) => string;
	readonly previous: string;
}

export interface ZuiLocalePack {
	readonly common: ZuiCommonLocale;
	readonly pagination: ZuiPaginationLocale;
}

export interface ZuiLocalePackOverrides {
	readonly common?: Partial<ZuiCommonLocale>;
	readonly pagination?: Partial<ZuiPaginationLocale>;
}

/** @deprecated Use the typed ZuiLocalePackOverrides contract. */
export type ZuiTranslations = Readonly<Record<string, string>>;

export const enUSLocalePack = Object.freeze({
	common: Object.freeze({ close: 'Close', copy: 'Copy' }),
	pagination: Object.freeze({
		label: 'Pagination',
		next: 'Next page',
		page: (formattedPage: string) => `Page ${formattedPage}`,
		previous: 'Previous page'
	})
}) satisfies ZuiLocalePack;

export const zhCNLocalePack = Object.freeze({
	common: Object.freeze({ close: '关闭', copy: '复制' }),
	pagination: Object.freeze({
		label: '分页导航',
		next: '下一页',
		page: (formattedPage: string) => `第${formattedPage}页`,
		previous: '上一页'
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
		pagination: {
			label: translations['pagination.label'],
			next: translations['pagination.next'],
			page: page ? (formattedPage) => page.replace('{page}', formattedPage) : undefined,
			previous: translations['pagination.previous']
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
		pagination: Object.freeze(
			mergeDefined(base.pagination, legacy.pagination, overrides?.pagination)
		)
	});
}
