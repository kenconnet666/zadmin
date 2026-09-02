export interface ZuiCommonLocale {
	readonly clear: string;
	readonly close: string;
	readonly copy: string;
}

export interface ZuiCollectionLocale {
	readonly cascaderLevel: (formattedLevel: string) => string;
	readonly empty: string;
	readonly loading: string;
	readonly mentionEmpty: string;
	readonly mentionList: string;
	readonly selectNode: string;
	readonly selectOption: string;
	readonly selectOptions: string;
	readonly selectPath: string;
	readonly searchResults: (formattedCount: string) => string;
	readonly treeLoadError: (label: string) => string;
	readonly treeLoading: (label: string) => string;
	readonly treeOptions: string;
}

export interface ZuiCarouselLocale {
	readonly automaticRotationDisabled: string;
	readonly carouselRole: string;
	readonly chooseSlide: string;
	readonly goToSlide: (formattedIndex: string, label: string) => string;
	readonly nextSlide: string;
	readonly pauseRotation: string;
	readonly previousSlide: string;
	readonly slidePosition: (formattedIndex: string, formattedTotal: string, label: string) => string;
	readonly slideRole: string;
	readonly startRotation: string;
}

export interface ZuiColorPickerLocale {
	readonly alpha: string;
	readonly chooseColor: string;
	readonly color: (value: string) => string;
	readonly hexColor: string;
}

export interface ZuiCodeLocale {
	readonly copied: string;
	readonly copy: string;
	readonly copyFailed: string;
}

export interface ZuiCommandLocale {
	readonly empty: string;
	readonly inputLabel: string;
	readonly listLabel: string;
	readonly paletteTitle: string;
	readonly paletteTrigger: string;
	readonly placeholder: string;
	readonly results: (formattedCount: string) => string;
}

export interface ZuiDateLocale {
	readonly calendarLabel: string;
	readonly clearDate: string;
	readonly clearDateRange: string;
	readonly chooseDate: string;
	readonly chooseDateRange: string;
	readonly dateFieldLabel: string;
	readonly day: string;
	readonly endDate: string;
	readonly month: string;
	readonly nextMonth: string;
	readonly previousMonth: string;
	readonly startDate: string;
	readonly year: string;
}

export interface ZuiFileUploadLocale {
	readonly abortUpload: (fileName: string) => string;
	readonly chooseFiles: string;
	readonly dropFiles: string;
	readonly emptyQueue: string;
	readonly failed: (fileName: string) => string;
	readonly inputLabel: string;
	readonly queueLabel: string;
	readonly removeFile: (fileName: string) => string;
	readonly retryUpload: (fileName: string) => string;
	readonly statusAborted: string;
	readonly statusQueued: string;
	readonly statusSuccess: string;
	readonly uploadFile: (fileName: string) => string;
	readonly uploading: (fileName: string, formattedProgress: string) => string;
}

export interface ZuiFeedbackLocale {
	readonly confirmFailed: string;
	readonly dismissAlert: string;
	readonly dismissNotification: string;
	readonly dismissToast: (title: string) => string;
	readonly loading: string;
	readonly notifications: string;
}

export interface ZuiFormLocale {
	readonly pinInputPosition: (formattedIndex: string, formattedLength: string) => string;
	readonly unexpectedValidation: string;
}

export interface ZuiLinkLocale {
	readonly opensInNewWindow: string;
}

export interface ZuiNumberFieldLocale {
	readonly decrement: string;
	readonly increment: string;
	readonly inputLabel: string;
	readonly invalidValue: string;
	readonly maximum: (formattedMaximum: string) => string;
	readonly minimum: (formattedMinimum: string) => string;
}

export interface ZuiPaginationLocale {
	readonly currentPage: (formattedPage: string) => string;
	readonly itemsPerPage: string;
	readonly label: string;
	readonly next: string;
	readonly page: (formattedPage: string) => string;
	readonly pageInput: string;
	readonly pageStatus: (formattedPage: string, formattedTotalPages: string) => string;
	readonly previous: string;
	readonly totalItems: (formattedTotal: string) => string;
}

export interface ZuiProgressLocale {
	readonly label: string;
}

export interface ZuiTagLocale {
	readonly removeTag: (textValue?: string) => string;
}

export interface ZuiTimeLocale {
	readonly am: string;
	readonly clearTime: string;
	readonly hour: string;
	readonly hourCycle: 12 | 24;
	readonly minute: string;
	readonly pm: string;
	readonly second: string;
	readonly timeFieldLabel: string;
	readonly toggleDayPeriod: string;
}

export interface ZuiTagsInputLocale {
	readonly addTag: string;
	readonly editTag: (value: string) => string;
	readonly removeTag: (value: string) => string;
}

export interface ZuiTransferLocale {
	readonly empty: string;
	readonly filterPlaceholder: string;
	readonly moveToSource: string;
	readonly moveToTarget: string;
	readonly selectedNotLoaded: (formattedCount: string, count: number) => string;
	readonly sourceTitle: string;
	readonly targetTitle: string;
}

export interface ZuiTourLocale {
	readonly close: string;
	readonly finish: string;
	readonly next: string;
	readonly previous: string;
	readonly progress: (formattedCurrent: string, formattedTotal: string) => string;
}

export interface ZuiLocalePack {
	readonly carousel: ZuiCarouselLocale;
	readonly collection: ZuiCollectionLocale;
	readonly colorPicker: ZuiColorPickerLocale;
	readonly code: ZuiCodeLocale;
	readonly command: ZuiCommandLocale;
	readonly common: ZuiCommonLocale;
	readonly date: ZuiDateLocale;
	readonly feedback: ZuiFeedbackLocale;
	readonly fileUpload: ZuiFileUploadLocale;
	readonly form: ZuiFormLocale;
	readonly link: ZuiLinkLocale;
	readonly numberField: ZuiNumberFieldLocale;
	readonly pagination: ZuiPaginationLocale;
	readonly progress: ZuiProgressLocale;
	readonly tag: ZuiTagLocale;
	readonly tagsInput: ZuiTagsInputLocale;
	readonly time: ZuiTimeLocale;
	readonly tour: ZuiTourLocale;
	readonly transfer: ZuiTransferLocale;
}

export interface ZuiLocalePackOverrides {
	readonly carousel?: Partial<ZuiCarouselLocale>;
	readonly collection?: Partial<ZuiCollectionLocale>;
	readonly colorPicker?: Partial<ZuiColorPickerLocale>;
	readonly code?: Partial<ZuiCodeLocale>;
	readonly command?: Partial<ZuiCommandLocale>;
	readonly common?: Partial<ZuiCommonLocale>;
	readonly date?: Partial<ZuiDateLocale>;
	readonly feedback?: Partial<ZuiFeedbackLocale>;
	readonly fileUpload?: Partial<ZuiFileUploadLocale>;
	readonly form?: Partial<ZuiFormLocale>;
	readonly link?: Partial<ZuiLinkLocale>;
	readonly numberField?: Partial<ZuiNumberFieldLocale>;
	readonly pagination?: Partial<ZuiPaginationLocale>;
	readonly progress?: Partial<ZuiProgressLocale>;
	readonly tag?: Partial<ZuiTagLocale>;
	readonly tagsInput?: Partial<ZuiTagsInputLocale>;
	readonly time?: Partial<ZuiTimeLocale>;
	readonly tour?: Partial<ZuiTourLocale>;
	readonly transfer?: Partial<ZuiTransferLocale>;
}

/** @deprecated Use the typed ZuiLocalePackOverrides contract. */
export type ZuiTranslations = Readonly<Record<string, string>>;

export const enUSLocalePack = Object.freeze({
	carousel: Object.freeze({
		automaticRotationDisabled: 'Automatic rotation disabled by motion preference',
		carouselRole: 'carousel',
		chooseSlide: 'Choose slide',
		goToSlide: (formattedIndex: string, label: string) => `Go to slide ${formattedIndex}: ${label}`,
		nextSlide: 'Next slide',
		pauseRotation: 'Pause automatic rotation',
		previousSlide: 'Previous slide',
		slidePosition: (formattedIndex: string, formattedTotal: string, label: string) =>
			`${formattedIndex} of ${formattedTotal}: ${label}`,
		slideRole: 'slide',
		startRotation: 'Start automatic rotation'
	}),
	collection: Object.freeze({
		cascaderLevel: (formattedLevel: string) => `Level ${formattedLevel}`,
		empty: 'No options',
		loading: 'Loading options',
		mentionEmpty: 'No suggestions',
		mentionList: 'Mention suggestions',
		selectNode: 'Select a node',
		selectOption: 'Select an option',
		selectOptions: 'Select options',
		selectPath: 'Select a path',
		searchResults: (formattedCount: string) => `${formattedCount} paths found`,
		treeLoadError: (label: string) => `Failed to load ${label}; activate the switcher to retry`,
		treeLoading: (label: string) => `Loading children for ${label}`,
		treeOptions: 'Tree options'
	}),
	colorPicker: Object.freeze({
		alpha: 'Alpha',
		chooseColor: 'Choose color',
		color: (value: string) => `Color ${value}`,
		hexColor: 'Hex color'
	}),
	code: Object.freeze({ copied: 'Code copied', copy: 'Copy code', copyFailed: 'Copy failed' }),
	command: Object.freeze({
		empty: 'No commands found',
		inputLabel: 'Search commands',
		listLabel: 'Commands',
		paletteTitle: 'Command palette',
		paletteTrigger: 'Open command palette',
		placeholder: 'Type a command',
		results: (formattedCount: string) => `${formattedCount} commands found`
	}),
	common: Object.freeze({ clear: 'Clear', close: 'Close', copy: 'Copy' }),
	date: Object.freeze({
		calendarLabel: 'Calendar',
		clearDate: 'Clear date',
		clearDateRange: 'Clear date range',
		chooseDate: 'Choose date',
		chooseDateRange: 'Choose date range',
		dateFieldLabel: 'Date',
		day: 'Day',
		endDate: 'End date',
		month: 'Month',
		nextMonth: 'Next month',
		previousMonth: 'Previous month',
		startDate: 'Start date',
		year: 'Year'
	}),
	feedback: Object.freeze({
		confirmFailed: 'Confirmation failed. Try again.',
		dismissAlert: 'Dismiss alert',
		dismissNotification: 'Dismiss notification',
		dismissToast: (title: string) => `Dismiss ${title}`,
		loading: 'Loading',
		notifications: 'Notifications'
	}),
	fileUpload: Object.freeze({
		abortUpload: (fileName: string) => `Abort upload for ${fileName}`,
		chooseFiles: 'Choose files',
		dropFiles: 'Drop files here or choose files',
		emptyQueue: 'No files selected',
		failed: (fileName: string) => `Upload failed for ${fileName}`,
		inputLabel: 'Choose files',
		queueLabel: 'Selected files',
		removeFile: (fileName: string) => `Remove ${fileName}`,
		retryUpload: (fileName: string) => `Retry upload for ${fileName}`,
		statusAborted: 'Upload aborted',
		statusQueued: 'Ready to upload',
		statusSuccess: 'Upload complete',
		uploadFile: (fileName: string) => `Upload ${fileName}`,
		uploading: (fileName: string, formattedProgress: string) =>
			`Uploading ${fileName}: ${formattedProgress}`
	}),
	form: Object.freeze({
		pinInputPosition: (formattedIndex: string, formattedLength: string) =>
			`Digit ${formattedIndex} of ${formattedLength}`,
		unexpectedValidation: 'Validation failed unexpectedly.'
	}),
	link: Object.freeze({
		opensInNewWindow: 'opens in a new window'
	}),
	numberField: Object.freeze({
		decrement: 'Decrease value',
		increment: 'Increase value',
		inputLabel: 'Number',
		invalidValue: 'Enter a valid number.',
		maximum: (formattedMaximum: string) => `Value must be at most ${formattedMaximum}.`,
		minimum: (formattedMinimum: string) => `Value must be at least ${formattedMinimum}.`
	}),
	pagination: Object.freeze({
		currentPage: (formattedPage: string) => `Page ${formattedPage}, current page`,
		itemsPerPage: 'Items per page',
		label: 'Pagination',
		next: 'Next page',
		page: (formattedPage: string) => `Page ${formattedPage}`,
		pageInput: 'Page',
		pageStatus: (formattedPage: string, formattedTotalPages: string) =>
			`Page ${formattedPage} of ${formattedTotalPages}`,
		previous: 'Previous page',
		totalItems: (formattedTotal: string) => `${formattedTotal} items`
	}),
	progress: Object.freeze({
		label: 'Progress'
	}),
	tag: Object.freeze({
		removeTag: (textValue?: string) => (textValue ? `Remove ${textValue}` : 'Remove tag')
	}),
	tagsInput: Object.freeze({
		addTag: 'Add tag',
		editTag: (value: string) => `Edit ${value}`,
		removeTag: (value: string) => `Remove ${value}`
	}),
	time: Object.freeze({
		am: 'AM',
		clearTime: 'Clear time',
		hour: 'Hour',
		hourCycle: 12,
		minute: 'Minute',
		pm: 'PM',
		second: 'Second',
		timeFieldLabel: 'Time',
		toggleDayPeriod: 'Toggle AM/PM'
	}),
	tour: Object.freeze({
		close: 'Close tour',
		finish: 'Finish',
		next: 'Next',
		previous: 'Previous',
		progress: (formattedCurrent: string, formattedTotal: string) =>
			`Step ${formattedCurrent} of ${formattedTotal}`
	}),
	transfer: Object.freeze({
		empty: 'No items',
		filterPlaceholder: 'Filter items',
		moveToSource: 'Move selected to source',
		moveToTarget: 'Move selected to target',
		selectedNotLoaded: (formattedCount: string, count: number) =>
			`${formattedCount} selected ${count === 1 ? 'item is' : 'items are'} not loaded`,
		sourceTitle: 'Available',
		targetTitle: 'Selected'
	})
}) satisfies ZuiLocalePack;

export const zhCNLocalePack = Object.freeze({
	carousel: Object.freeze({
		automaticRotationDisabled: '已按动画偏好停用自动轮播',
		carouselRole: '轮播',
		chooseSlide: '选择幻灯片',
		goToSlide: (formattedIndex: string, label: string) => `转到第${formattedIndex}张：${label}`,
		nextSlide: '下一张',
		pauseRotation: '暂停自动轮播',
		previousSlide: '上一张',
		slidePosition: (formattedIndex: string, formattedTotal: string, label: string) =>
			`第${formattedIndex}张，共${formattedTotal}张：${label}`,
		slideRole: '幻灯片',
		startRotation: '开始自动轮播'
	}),
	collection: Object.freeze({
		cascaderLevel: (formattedLevel: string) => `第${formattedLevel}级`,
		empty: '暂无选项',
		loading: '正在加载选项',
		mentionEmpty: '暂无建议',
		mentionList: '提及建议',
		selectNode: '选择节点',
		selectOption: '选择一个选项',
		selectOptions: '选择选项',
		selectPath: '选择路径',
		searchResults: (formattedCount: string) => `找到${formattedCount}条路径`,
		treeLoadError: (label: string) => `加载${label}失败；激活展开指示可重试`,
		treeLoading: (label: string) => `正在加载${label}的子节点`,
		treeOptions: '树形选项'
	}),
	colorPicker: Object.freeze({
		alpha: '透明度',
		chooseColor: '选择颜色',
		color: (value: string) => `颜色 ${value}`,
		hexColor: '十六进制颜色'
	}),
	code: Object.freeze({ copied: '代码已复制', copy: '复制代码', copyFailed: '复制失败' }),
	command: Object.freeze({
		empty: '未找到命令',
		inputLabel: '搜索命令',
		listLabel: '命令',
		paletteTitle: '命令面板',
		paletteTrigger: '打开命令面板',
		placeholder: '输入命令',
		results: (formattedCount: string) => `找到${formattedCount}个命令`
	}),
	common: Object.freeze({ clear: '清空', close: '关闭', copy: '复制' }),
	date: Object.freeze({
		calendarLabel: '日历',
		clearDate: '清空日期',
		clearDateRange: '清空日期范围',
		chooseDate: '选择日期',
		chooseDateRange: '选择日期范围',
		dateFieldLabel: '日期',
		day: '日',
		endDate: '结束日期',
		month: '月',
		nextMonth: '下个月',
		previousMonth: '上个月',
		startDate: '开始日期',
		year: '年'
	}),
	feedback: Object.freeze({
		confirmFailed: '确认失败，请重试。',
		dismissAlert: '关闭提示',
		dismissNotification: '关闭通知',
		dismissToast: (title: string) => `关闭通知：${title}`,
		loading: '加载中',
		notifications: '通知'
	}),
	fileUpload: Object.freeze({
		abortUpload: (fileName: string) => `中止上传 ${fileName}`,
		chooseFiles: '选择文件',
		dropFiles: '将文件拖放到此处或选择文件',
		emptyQueue: '尚未选择文件',
		failed: (fileName: string) => `上传 ${fileName} 失败`,
		inputLabel: '选择文件',
		queueLabel: '已选文件',
		removeFile: (fileName: string) => `移除文件 ${fileName}`,
		retryUpload: (fileName: string) => `重试上传 ${fileName}`,
		statusAborted: '上传已中止',
		statusQueued: '等待上传',
		statusSuccess: '上传完成',
		uploadFile: (fileName: string) => `上传 ${fileName}`,
		uploading: (fileName: string, formattedProgress: string) =>
			`正在上传 ${fileName}：${formattedProgress}`
	}),
	form: Object.freeze({
		pinInputPosition: (formattedIndex: string, formattedLength: string) =>
			`第${formattedIndex}位，共${formattedLength}位`,
		unexpectedValidation: '验证过程中发生意外错误。'
	}),
	link: Object.freeze({
		opensInNewWindow: '在新窗口中打开'
	}),
	numberField: Object.freeze({
		decrement: '减小数值',
		increment: '增大数值',
		inputLabel: '数字',
		invalidValue: '请输入有效数字。',
		maximum: (formattedMaximum: string) => `数值不能大于 ${formattedMaximum}。`,
		minimum: (formattedMinimum: string) => `数值不能小于 ${formattedMinimum}。`
	}),
	pagination: Object.freeze({
		currentPage: (formattedPage: string) => `第${formattedPage}页，当前页`,
		itemsPerPage: '每页条数',
		label: '分页导航',
		next: '下一页',
		page: (formattedPage: string) => `第${formattedPage}页`,
		pageInput: '页码',
		pageStatus: (formattedPage: string, formattedTotalPages: string) =>
			`第${formattedPage}页，共${formattedTotalPages}页`,
		previous: '上一页',
		totalItems: (formattedTotal: string) => `共${formattedTotal}条`
	}),
	progress: Object.freeze({
		label: '进度'
	}),
	tag: Object.freeze({
		removeTag: (textValue?: string) => (textValue ? `移除标签 ${textValue}` : '移除标签')
	}),
	tagsInput: Object.freeze({
		addTag: '添加标签',
		editTag: (value: string) => `编辑标签 ${value}`,
		removeTag: (value: string) => `移除标签 ${value}`
	}),
	time: Object.freeze({
		am: '上午',
		clearTime: '清空时间',
		hour: '小时',
		hourCycle: 24,
		minute: '分钟',
		pm: '下午',
		second: '秒',
		timeFieldLabel: '时间',
		toggleDayPeriod: '切换上午或下午'
	}),
	tour: Object.freeze({
		close: '关闭导览',
		finish: '完成',
		next: '下一步',
		previous: '上一步',
		progress: (formattedCurrent: string, formattedTotal: string) =>
			`第${formattedCurrent}步，共${formattedTotal}步`
	}),
	transfer: Object.freeze({
		empty: '暂无项目',
		filterPlaceholder: '筛选项目',
		moveToSource: '将所选项目移至来源列表',
		moveToTarget: '将所选项目移至目标列表',
		selectedNotLoaded: (formattedCount: string, count: number) => {
			// Keep the shared pluralization signature even though Chinese does not branch on count.
			void count;
			return `${formattedCount} 个已选项目尚未加载`;
		},
		sourceTitle: '可选项目',
		targetTitle: '已选项目'
	})
}) satisfies ZuiLocalePack;

function legacyOverrides(translations: ZuiTranslations | undefined): ZuiLocalePackOverrides {
	if (!translations) return {};
	const page = translations['pagination.page'];
	return {
		common: {
			clear: translations.clear,
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
		carousel: Object.freeze(mergeDefined(base.carousel, overrides?.carousel)),
		collection: Object.freeze(mergeDefined(base.collection, overrides?.collection)),
		colorPicker: Object.freeze(mergeDefined(base.colorPicker, overrides?.colorPicker)),
		code: Object.freeze(mergeDefined(base.code, overrides?.code)),
		command: Object.freeze(mergeDefined(base.command, overrides?.command)),
		common: Object.freeze(mergeDefined(base.common, legacy.common, overrides?.common)),
		date: Object.freeze(mergeDefined(base.date, legacy.date, overrides?.date)),
		feedback: Object.freeze(mergeDefined(base.feedback, overrides?.feedback)),
		fileUpload: Object.freeze(mergeDefined(base.fileUpload, overrides?.fileUpload)),
		form: Object.freeze(mergeDefined(base.form, overrides?.form)),
		link: Object.freeze(mergeDefined(base.link, overrides?.link)),
		numberField: Object.freeze(mergeDefined(base.numberField, overrides?.numberField)),
		pagination: Object.freeze(
			mergeDefined(base.pagination, legacy.pagination, overrides?.pagination)
		),
		progress: Object.freeze(mergeDefined(base.progress, overrides?.progress)),
		tag: Object.freeze(mergeDefined(base.tag, overrides?.tag)),
		tagsInput: Object.freeze(mergeDefined(base.tagsInput, overrides?.tagsInput)),
		time: Object.freeze(mergeDefined(base.time, legacy.time, overrides?.time)),
		tour: Object.freeze(mergeDefined(base.tour, overrides?.tour)),
		transfer: Object.freeze(mergeDefined(base.transfer, overrides?.transfer))
	});
}
