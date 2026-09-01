export interface ZuiCommonLocale {
	readonly close: string;
	readonly copy: string;
}

export interface ZuiCollectionLocale {
	readonly cascaderLevel: (formattedLevel: string) => string;
	readonly mentionEmpty: string;
	readonly mentionList: string;
	readonly selectNode: string;
	readonly selectOption: string;
	readonly selectOptions: string;
	readonly selectPath: string;
	readonly treeOptions: string;
}

export interface ZuiColorPickerLocale {
	readonly alpha: string;
	readonly chooseColor: string;
	readonly color: (value: string) => string;
	readonly hexColor: string;
}

export interface ZuiCommandLocale {
	readonly empty: string;
	readonly inputLabel: string;
	readonly listLabel: string;
	readonly paletteTitle: string;
	readonly paletteTrigger: string;
	readonly placeholder: string;
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

export interface ZuiFileUploadLocale {
	readonly chooseFiles: string;
	readonly dropFiles: string;
	readonly inputLabel: string;
	readonly removeFile: (fileName: string) => string;
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

export interface ZuiTagsInputLocale {
	readonly addTag: string;
	readonly removeTag: (value: string) => string;
}

export interface ZuiTransferLocale {
	readonly empty: string;
	readonly filterPlaceholder: string;
	readonly moveToSource: string;
	readonly moveToTarget: string;
	readonly sourceTitle: string;
	readonly targetTitle: string;
}

export interface ZuiLocalePack {
	readonly collection: ZuiCollectionLocale;
	readonly colorPicker: ZuiColorPickerLocale;
	readonly command: ZuiCommandLocale;
	readonly common: ZuiCommonLocale;
	readonly date: ZuiDateLocale;
	readonly fileUpload: ZuiFileUploadLocale;
	readonly pagination: ZuiPaginationLocale;
	readonly tagsInput: ZuiTagsInputLocale;
	readonly time: ZuiTimeLocale;
	readonly transfer: ZuiTransferLocale;
}

export interface ZuiLocalePackOverrides {
	readonly collection?: Partial<ZuiCollectionLocale>;
	readonly colorPicker?: Partial<ZuiColorPickerLocale>;
	readonly command?: Partial<ZuiCommandLocale>;
	readonly common?: Partial<ZuiCommonLocale>;
	readonly date?: Partial<ZuiDateLocale>;
	readonly fileUpload?: Partial<ZuiFileUploadLocale>;
	readonly pagination?: Partial<ZuiPaginationLocale>;
	readonly tagsInput?: Partial<ZuiTagsInputLocale>;
	readonly time?: Partial<ZuiTimeLocale>;
	readonly transfer?: Partial<ZuiTransferLocale>;
}

/** @deprecated Use the typed ZuiLocalePackOverrides contract. */
export type ZuiTranslations = Readonly<Record<string, string>>;

export const enUSLocalePack = Object.freeze({
	collection: Object.freeze({
		cascaderLevel: (formattedLevel: string) => `Level ${formattedLevel}`,
		mentionEmpty: 'No suggestions',
		mentionList: 'Mention suggestions',
		selectNode: 'Select a node',
		selectOption: 'Select an option',
		selectOptions: 'Select options',
		selectPath: 'Select a path',
		treeOptions: 'Tree options'
	}),
	colorPicker: Object.freeze({
		alpha: 'Alpha',
		chooseColor: 'Choose color',
		color: (value: string) => `Color ${value}`,
		hexColor: 'Hex color'
	}),
	command: Object.freeze({
		empty: 'No commands found',
		inputLabel: 'Search commands',
		listLabel: 'Commands',
		paletteTitle: 'Command palette',
		paletteTrigger: 'Open command palette',
		placeholder: 'Type a command'
	}),
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
	fileUpload: Object.freeze({
		chooseFiles: 'Choose files',
		dropFiles: 'Drop files here or choose files',
		inputLabel: 'Choose files',
		removeFile: (fileName: string) => `Remove ${fileName}`
	}),
	pagination: Object.freeze({
		label: 'Pagination',
		next: 'Next page',
		page: (formattedPage: string) => `Page ${formattedPage}`,
		previous: 'Previous page'
	}),
	tagsInput: Object.freeze({
		addTag: 'Add tag',
		removeTag: (value: string) => `Remove ${value}`
	}),
	time: Object.freeze({
		am: 'AM',
		hour: 'Hour',
		hourCycle: 12,
		minute: 'Minute',
		pm: 'PM',
		second: 'Second',
		toggleDayPeriod: 'Toggle AM/PM'
	}),
	transfer: Object.freeze({
		empty: 'No items',
		filterPlaceholder: 'Filter items',
		moveToSource: 'Move selected to source',
		moveToTarget: 'Move selected to target',
		sourceTitle: 'Available',
		targetTitle: 'Selected'
	})
}) satisfies ZuiLocalePack;

export const zhCNLocalePack = Object.freeze({
	collection: Object.freeze({
		cascaderLevel: (formattedLevel: string) => `第${formattedLevel}级`,
		mentionEmpty: '暂无建议',
		mentionList: '提及建议',
		selectNode: '选择节点',
		selectOption: '选择一个选项',
		selectOptions: '选择选项',
		selectPath: '选择路径',
		treeOptions: '树形选项'
	}),
	colorPicker: Object.freeze({
		alpha: '透明度',
		chooseColor: '选择颜色',
		color: (value: string) => `颜色 ${value}`,
		hexColor: '十六进制颜色'
	}),
	command: Object.freeze({
		empty: '未找到命令',
		inputLabel: '搜索命令',
		listLabel: '命令',
		paletteTitle: '命令面板',
		paletteTrigger: '打开命令面板',
		placeholder: '输入命令'
	}),
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
	fileUpload: Object.freeze({
		chooseFiles: '选择文件',
		dropFiles: '将文件拖放到此处或选择文件',
		inputLabel: '选择文件',
		removeFile: (fileName: string) => `移除文件 ${fileName}`
	}),
	pagination: Object.freeze({
		label: '分页导航',
		next: '下一页',
		page: (formattedPage: string) => `第${formattedPage}页`,
		previous: '上一页'
	}),
	tagsInput: Object.freeze({
		addTag: '添加标签',
		removeTag: (value: string) => `移除标签 ${value}`
	}),
	time: Object.freeze({
		am: '上午',
		hour: '小时',
		hourCycle: 24,
		minute: '分钟',
		pm: '下午',
		second: '秒',
		toggleDayPeriod: '切换上午或下午'
	}),
	transfer: Object.freeze({
		empty: '暂无项目',
		filterPlaceholder: '筛选项目',
		moveToSource: '将所选项目移至来源列表',
		moveToTarget: '将所选项目移至目标列表',
		sourceTitle: '可选项目',
		targetTitle: '已选项目'
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
		collection: Object.freeze(mergeDefined(base.collection, overrides?.collection)),
		colorPicker: Object.freeze(mergeDefined(base.colorPicker, overrides?.colorPicker)),
		command: Object.freeze(mergeDefined(base.command, overrides?.command)),
		common: Object.freeze(mergeDefined(base.common, legacy.common, overrides?.common)),
		date: Object.freeze(mergeDefined(base.date, legacy.date, overrides?.date)),
		fileUpload: Object.freeze(mergeDefined(base.fileUpload, overrides?.fileUpload)),
		pagination: Object.freeze(
			mergeDefined(base.pagination, legacy.pagination, overrides?.pagination)
		),
		tagsInput: Object.freeze(mergeDefined(base.tagsInput, overrides?.tagsInput)),
		time: Object.freeze(mergeDefined(base.time, legacy.time, overrides?.time)),
		transfer: Object.freeze(mergeDefined(base.transfer, overrides?.transfer))
	});
}
