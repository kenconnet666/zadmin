<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import type { CalendarRangeValue, Weekday } from '../../runtime/date.js';
	import type { CalendarWeekNumbering } from '../../runtime/calendar.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	interface ZCalendarSharedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly allowEmpty?: boolean;
		readonly allowNonContiguousRange?: boolean;
		readonly appearance?: 'bare' | 'calendar';
		readonly calendarLabel?: string;
		readonly defaultFocusedValue?: CalendarDateValue;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		focusedValue?: CalendarDateValue;
		readonly form?: string;
		readonly formParticipation?: 'auto' | 'none';
		readonly highlightRange?: CalendarRangeValue | null;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: CalendarDateValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly onFocusedValueChange?: (value: CalendarDateValue) => void;
		readonly previousLabel?: string;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly showOutsideDates?: boolean;
		readonly showWeekNumbers?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		readonly visibleMonths?: number;
		readonly weekLabel?: string;
		readonly weekNumbering?: CalendarWeekNumbering;
		readonly weekNumberLabel?: (week: number, year: number) => string;
	}

	interface ZCalendarSingleBranch {
		readonly defaultValue?: CalendarDateValue | null;
		readonly onValueChange?: (value: CalendarDateValue | null) => void;
		readonly selectionMode?: 'single';
		value?: CalendarDateValue | null;
	}

	interface ZCalendarMultipleBranch {
		readonly defaultValue?: readonly CalendarDateValue[];
		readonly onValueChange?: (value: readonly CalendarDateValue[]) => void;
		readonly selectionMode: 'multiple';
		value?: readonly CalendarDateValue[];
	}

	interface ZCalendarRangeBranch {
		readonly defaultValue?: CalendarRangeValue | null;
		readonly onValueChange?: (value: CalendarRangeValue | null) => void;
		readonly selectionMode: 'range';
		value?: CalendarRangeValue | null;
	}

	export type ZCalendarProps = ZCalendarSharedProps &
		(ZCalendarSingleBranch | ZCalendarMultipleBranch | ZCalendarRangeBranch);
	export type { CalendarSelectionMode, CalendarWeekNumbering } from '../../runtime/calendar.js';

	export const zuiMetadata = {
		category: 'input',
		id: 'calendar',
		importStatement: "import { ZCalendar } from '@zadmin/zui';",
		name: 'ZCalendar',
		bindings: [
			{
				description: '由selectionMode判别的单选、多选或范围值。',
				name: 'value',
				type: 'CalendarDate | readonly CalendarDate[] | CalendarRangeValue | null'
			},
			{ description: '键盘焦点日期。', name: 'focusedValue', type: 'CalendarDate | undefined' },
			{ description: '真实calendar根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'共享6x7 month grids',
			'periodFromDate week rules',
			'roving focus',
			'FormControlState'
		],
		events: [
			{
				description: '用户单选、toggle多选或开始/完成范围后的判别值。',
				name: 'onValueChange',
				type: '(value: CalendarSelectionValue) => void'
			},
			{
				description: '键盘焦点日期变化。',
				name: 'onFocusedValueChange',
				type: '(value: CalendarDate) => void'
			}
		],
		keyboard: [
			{ description: '按日/周移动，RTL反转左右。', key: 'Arrow keys' },
			{ description: '移动到当前周首尾。', key: 'Home / End' },
			{ description: '按月移动；Shift按年。', key: 'PageUp / PageDown' },
			{ description: '选择focused日期。', key: 'Enter / Space' },
			{ description: '清空当前选择；required随后报告内在无效。', key: 'Delete / Backspace' }
		],
		parts: [
			{ description: '按visibleMonths整页导航的header。', name: 'header' },
			{ description: '共享owner的可换行月份集合。', name: 'months' },
			{ description: '一个月及其唯一主日期cell。', name: 'month' },
			{ description: '日期grid。', name: 'grid' },
			{ description: '日期按钮。', name: 'cell' },
			{ description: '可选ISO或locale周号列。', name: 'week-number' }
		],
		props: [
			{
				default: "'calendar'",
				description: '独立边框或供Picker复用的bare外观。',
				name: 'appearance',
				type: "'bare' | 'calendar'"
			},
			{
				bindable: true,
				default: 'null',
				description: '由selectionMode判别；multiple为保序去重冻结数组，range允许partial。',
				name: 'value',
				type: 'CalendarDate | readonly CalendarDate[] | CalendarRangeValue | null'
			},
			{
				default: "'single'",
				description: '判别单选、多选和范围owner；multiple/range分支必须显式提供。',
				name: 'selectionMode',
				requiredWhen: "multiple/range分支必须显式为'multiple'或'range'",
				type: "'single' | 'multiple' | 'range'"
			},
			{
				default: 'undefined',
				description: '由selectionMode判别的非受控初值。',
				name: 'defaultValue',
				type: 'CalendarDate | readonly CalendarDate[] | CalendarRangeValue | null'
			},
			{
				bindable: true,
				default: 'defaultFocusedValue、value或today',
				description: '独立受控键盘焦点；仅在越出整个可见窗口时移动窗口。',
				name: 'focusedValue',
				type: 'CalendarDate'
			},
			{
				default: 'value或today',
				description: '初始焦点与显示月。',
				name: 'defaultFocusedValue',
				type: 'CalendarDate'
			},
			{
				default: 'Provider locale',
				description: '周标题和日期名称locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone或UTC',
				description: 'today、weekday和CalendarDate格式化使用的SSR稳定IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'localePack.date.calendarLabel',
				description: 'Calendar grid可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'localePack.date.previousMonth',
				description: '上一月按钮可访问名称。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'localePack.date.nextMonth',
				description: '下一月按钮可访问名称。',
				name: 'nextLabel',
				type: 'string'
			},
			{
				default: 'weekNumbering对应规则',
				description: '覆盖grid周起始日；周号year/week仍按weekNumbering规则计算。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{
				default: 'undefined',
				description: '最小可选日期。',
				name: 'minValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '最大可选日期。',
				name: 'maxValue',
				type: 'CalendarDate'
			},
			{
				default: 'true',
				description: '显示相邻月份日期。',
				name: 'showOutsideDates',
				type: 'boolean'
			},
			{
				default: '1',
				description: '从显示起始月连续渲染1到12个月；共享owner、焦点和导航。',
				name: 'visibleMonths',
				type: 'number'
			},
			{
				default: 'false',
				description: '在每个month grid前显示周号列。',
				name: 'showWeekNumbers',
				type: 'boolean'
			},
			{
				default: "'locale'",
				description: 'locale复用CLDR周规则；iso固定Monday/4-day规则。',
				name: 'weekNumbering',
				type: "'locale' | 'iso'"
			},
			{
				default: 'localePack.date.week',
				description: '周号列标题。',
				name: 'weekLabel',
				type: 'string'
			},
			{
				default: 'localePack.date.weekNumber',
				description: '周号cell可访问名称，参数包含week-year。',
				name: 'weekNumberLabel',
				type: '(week: number, year: number) => string'
			},
			{
				default: "'auto'",
				description: '复合Picker设none，由外层唯一拥有FormValueBridge与reset。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				default: 'undefined',
				description: '禁用特定日期；同时影响指针和键盘导航。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Field context或false',
				description: '禁用月份导航、日期焦点/选择并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射根data-invalid；业务错误关系由Field拥有。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '保留月份/日期焦点导航与FormData，但阻止选择和清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '空选择产生内在无效并阻断ZForm；不阻止用户清空。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '最近祖先form',
				description: 'formParticipation为auto时关联唯一FormValueBridge。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Field context或undefined',
				description: 'single提交一次、multiple重复name、range提交name.start/end。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'null',
				description: '额外视觉范围，不拥有选择；供复合Picker preview复用。',
				name: 'highlightRange',
				type: 'CalendarRangeValue | null'
			},
			{
				default: 'false',
				description: 'false要求完整range中每一日可用；true只要求起止端点可用。',
				name: 'allowNonContiguousRange',
				type: 'boolean'
			},
			{
				default: 'false',
				description: 'range模式是否把start-only或end-only视为可提交；不影响partial表达。',
				name: 'allowEmpty',
				type: 'boolean'
			},
			{
				default: 'Field > componentDefaults.calendar > Provider density',
				description: '统一容器间距、导航与日期cell尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCalendar.svelte',
		states: [
			{
				name: 'data-highlighted',
				values: ['true'],
				description: '额外视觉高亮，不改变aria-selected或业务选择。'
			},
			{
				description: '判别选择模式。',
				name: 'data-selection-mode',
				values: ['single', 'multiple', 'range']
			},
			{ description: '当前共享可见月份数量。', name: 'data-visible-months', values: ['1..12'] },
			{
				description: '解析后的五档控件尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{
				description: '选择日期、multiple成员、range或highlight内日期。',
				name: 'data-selected',
				values: ['true']
			},
			{ description: 'range等待第二端时的hover preview。', name: 'data-preview', values: ['true'] },
			{
				description: '跨过不可用日期的拒绝preview。',
				name: 'data-preview-invalid',
				values: ['true']
			},
			{ description: '范围起点或终点。', name: 'data-range-edge', values: ['start', 'end'] },
			{ description: '当前显示月外日期。', name: 'data-outside', values: ['true'] },
			{ description: '不可选择日期。', name: 'data-disabled', values: ['true'] }
		],
		status: 'stable',
		summary:
			'一个owner驱动单选、多选、连续范围、1到12月共享焦点、周号与真实判别FormData的Calendar。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.flexDirection.column;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.lineHeight._normal;
			s.gap._medium;
		},
		variants: {
			appearance: {
				bare: () => undefined,
				calendar: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			size: {
				xsmall: (s) => {
					s.gap._small;
					s.fontSize._xsmall;
				},
				small: (s) => {
					s.gap._small;
					s.fontSize._small;
				},
				medium: (s) => {
					s.gap._medium;
					s.fontSize._medium;
				},
				large: (s) => {
					s.gap._medium;
					s.fontSize._large;
				},
				xlarge: (s) => {
					s.gap._large;
					s.fontSize._large;
				}
			}
		},
		compoundVariants: [
			{ style: (s) => s.padding._small, when: { appearance: 'calendar', size: 'xsmall' } },
			{ style: (s) => s.padding._large, when: { appearance: 'calendar', size: 'xlarge' } },
			{ style: (s) => s.padding._large, when: { appearance: 'calendar', size: 'large' } },
			{ style: (s) => s.padding._medium, when: { appearance: 'calendar', size: 'medium' } },
			{ style: (s) => s.padding._small, when: { appearance: 'calendar', size: 'small' } }
		],
		defaultVariants: { appearance: 'calendar', disabled: false, size: 'medium' }
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const navRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.borderColor._border;
			s.borderRadius._small;
			s.color._text;
		},
		variants: {
			size: {
				xsmall: (s) => {
					s.height._xsmall;
					s.width._xsmall;
					s.fontSize._xsmall;
				},
				small: (s) => {
					s.height._small;
					s.width._small;
					s.fontSize._small;
				},
				medium: (s) => {
					s.height._medium;
					s.width._medium;
					s.fontSize._medium;
				},
				large: (s) => {
					s.height._large;
					s.width._large;
					s.fontSize._large;
				},
				xlarge: (s) => {
					s.height._xlarge;
					s.width._xlarge;
					s.fontSize._large;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const tableRecipe = defineRecipe({
		base: (s) => {
			s.borderCollapse.collapse;
			s._selector('& th, & td', (s) => {
				s.boxSizing.borderBox;
				s.padding.px(0);
			});
		},
		variants: {},
		defaultVariants: {}
	});
	const monthsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.start;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._large;
			s.maxWidth._full;
		},
		variants: {}
	});
	const monthRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
		},
		variants: {}
	});
	const weekdayRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
			s.fontWeight._medium;
			s.textAlign.center;
		},
		variants: {
			size: {
				xsmall: (s) => {
					s.height._xsmall;
					s.width._calendarCellXsmall;
				},
				small: (s) => {
					s.height._small;
					s.width._calendarCellSmall;
				},
				medium: (s) => {
					s.height._medium;
					s.width._calendarCellMedium;
				},
				large: (s) => {
					s.height._large;
					s.width._calendarCellLarge;
				},
				xlarge: (s) => {
					s.height._xlarge;
					s.width._calendarCellXlarge;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const cellRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor.transparent;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.fontFamily.inherit;
			s.boxSizing.borderBox;
			s.padding.px(0);
			s.fontSize.inherit;
			s.lineHeight.inherit;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._inner;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
			s._selector('&[data-preview="true"]:not([data-selected="true"])', (preview) => {
				preview.backgroundColor._primarySubtle;
				preview.color._primary;
			});
			s._selector('&[data-preview-invalid="true"]', (preview) => {
				preview.backgroundColor._dangerSubtle;
				preview.color._danger;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			outside: { false: () => undefined, true: (s) => s.color._textMuted },
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primary;
					s.color._onPrimary;
				}
			},
			size: {
				xsmall: (s) => {
					s.height._calendarCellXsmall;
					s.width._calendarCellXsmall;
				},
				small: (s) => {
					s.height._calendarCellSmall;
					s.width._calendarCellSmall;
				},
				medium: (s) => {
					s.height._calendarCellMedium;
					s.width._calendarCellMedium;
				},
				large: (s) => {
					s.height._calendarCellLarge;
					s.width._calendarCellLarge;
				},
				xlarge: (s) => {
					s.height._calendarCellXlarge;
					s.width._calendarCellXlarge;
				}
			}
		},
		defaultVariants: { disabled: false, outside: false, selected: false, size: 'medium' }
	});
	for (const recipe of [
		rootRecipe,
		headerRecipe,
		navRecipe,
		tableRecipe,
		monthsRecipe,
		monthRecipe,
		weekdayRecipe,
		cellRecipe
	])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { CalendarDate, isSameDay, startOfMonth, today } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		clampDate,
		formatDate,
		isDateInRange,
		isDateUnavailable as dateIsUnavailable,
		normalizeCalendarDateModelValue,
		normalizeCalendarRangeModelValue,
		normalizeRange,
		normalizeRangeValue,
		weekdayLabels,
		weekDayIndex
	} from '../../runtime/date.js';
	import {
		calendarMonthCells,
		calendarRangeIsContiguous,
		normalizeCalendarMultipleModelValue,
		toggleCalendarMultipleValue,
		validateVisibleMonths,
		visibleCalendarMonths
	} from '../../runtime/calendar.js';
	import { getLocaleWeekRules, periodFromDate, type WeekPeriod } from '../../runtime/period.js';
	import type { FormValueEntry } from '../../runtime/form/form-value.js';
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	type CalendarSelectionValue = CalendarDate | readonly CalendarDate[] | CalendarRangeValue | null;

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-labelledby': ariaLabelledBy,
		allowEmpty = false,
		allowNonContiguousRange = false,
		appearance = 'calendar',
		calendarLabel,
		class: className,
		defaultFocusedValue,
		defaultValue,
		dir: dirProp,
		disabled = false,
		firstDayOfWeek,
		focusedValue = $bindable(),
		form,
		formParticipation = 'auto',
		highlightRange,
		invalid = false,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		nextLabel,
		onFocusedValueChange,
		onValueChange,
		previousLabel,
		ref = $bindable(null),
		readonly = false,
		required = false,
		showOutsideDates = true,
		showWeekNumbers = false,
		size,
		style,
		selectionMode = 'single',
		timeZone,
		value = $bindable(),
		visibleMonths = 1,
		weekLabel,
		weekNumbering = 'locale',
		weekNumberLabel,
		...rest
	}: ZCalendarProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = formParticipation === 'auto' ? claimFormValueScope() : null;
	const resolvedDirection = $derived(dirProp ?? zui.direction);
	const effectiveDirection = $derived(getElementDirection(ref, zui.direction));
	const PreviousIcon = $derived(effectiveDirection === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(effectiveDirection === 'rtl' ? ChevronLeft : ChevronRight);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.calendarLabel);
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.date.nextMonth);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.date.previousMonth);
	const resolvedDisabled = $derived(disabled || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonly || (field?.readonly ?? false));
	const resolvedRequired = $derived(required || (field?.required ?? false));
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(size ?? field?.size ?? zui.componentDefaults.calendar?.size, zui.density)
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedVisibleMonths = $derived(validateVisibleMonths(visibleMonths));
	const resolvedWeekRules = $derived.by(() => {
		if (weekNumbering !== 'iso' && weekNumbering !== 'locale')
			throw new TypeError("ZCalendar weekNumbering must be 'iso' or 'locale'.");
		return weekNumbering === 'iso'
			? ({ firstDayOfWeek: 'mon', minimalDaysInFirstWeek: 4 } as const)
			: getLocaleWeekRules(resolvedLocale);
	});
	const resolvedFirstDayOfWeek = $derived(firstDayOfWeek ?? resolvedWeekRules.firstDayOfWeek);
	const resolvedWeekLabel = $derived(weekLabel ?? zui.localePack.date.week);
	const resolvedWeekNumberLabel = $derived(
		weekNumberLabel ?? ((week: number, _year: number) => zui.localePack.date.weekNumber(week))
	);
	const constraints = $derived.by(() => {
		if (!['single', 'multiple', 'range'].includes(selectionMode))
			throw new TypeError("ZCalendar selectionMode must be 'single', 'multiple' or 'range'.");
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZCalendar minValue cannot exceed maxValue.');
		return { predicate: isDateUnavailable };
	});
	function normalizeSelection(candidate: unknown): CalendarSelectionValue {
		if (selectionMode === 'multiple')
			return normalizeCalendarMultipleModelValue(candidate, 'ZCalendar');
		if (selectionMode === 'range') return normalizeCalendarRangeModelValue(candidate, 'ZCalendar');
		return normalizeCalendarDateModelValue(candidate, 'ZCalendar');
	}

	function defaultSelection(): CalendarSelectionValue {
		return normalizeSelection(defaultValue);
	}

	function selectionAnchor(selection: CalendarSelectionValue): CalendarDate | null {
		if (selectionMode === 'multiple') {
			const dates = selection as readonly CalendarDate[];
			return dates.at(-1) ?? null;
		}
		if (selectionMode === 'range') {
			const selectedRange = selection as CalendarRangeValue | null;
			return selectedRange?.end ?? selectedRange?.start ?? null;
		}
		return selection as CalendarDate | null;
	}

	function selectionEmpty(selection: CalendarSelectionValue): boolean {
		if (selectionMode === 'multiple') return (selection as readonly CalendarDate[]).length === 0;
		if (selectionMode === 'range') {
			const selectedRange = selection as CalendarRangeValue | null;
			return !selectedRange?.start && !selectedRange?.end;
		}
		return selection === null;
	}

	function intrinsicDraft(): FormControlDraftState {
		const empty = selectionEmpty(normalizedSelection);
		let valid = !resolvedRequired || !empty;
		if (valid && !empty) {
			if (selectionMode === 'multiple')
				valid = !(normalizedSelection as readonly CalendarDate[]).some(unavailableDate);
			else if (selectionMode === 'range') {
				const selected = normalizedSelection as CalendarRangeValue | null;
				const partial = !selected?.start || !selected.end;
				valid =
					(!partial || allowEmpty) &&
					(!selected?.start || !unavailableDate(selected.start)) &&
					(!selected?.end || !unavailableDate(selected.end)) &&
					(allowNonContiguousRange ||
						!isDateUnavailable ||
						calendarRangeIsContiguous(selected, isDateUnavailable));
			} else valid = !unavailableDate(normalizedSelection as CalendarDate);
		}
		return Object.freeze({
			dirty: false,
			message: valid
				? undefined
				: empty && resolvedRequired
					? zui.localePack.form.requiredValue
					: zui.localePack.date.invalidDate,
			valid
		});
	}

	const valueState = createFormControlState<CalendarSelectionValue>(
		{
			defaultValue: defaultSelection,
			draftState: () => intrinsicState,
			element: () => ref,
			normalizeModelValue: normalizeSelection,
			onChange: () => onValueChange as ((next: CalendarSelectionValue) => void) | undefined,
			owner: 'ZCalendar',
			read: () => value as CalendarSelectionValue | undefined,
			syncNative: (next) => syncCalendar(next),
			write: (next) => (value = next as typeof value)
		},
		valueScope
	);
	const normalizedSelection = $derived(normalizeSelection(valueState.current));
	const intrinsicState = $derived.by<FormControlDraftState>(() => intrinsicDraft());
	const resolvedInvalid = $derived(invalid || (field?.invalid ?? false) || !intrinsicState.valid);
	const initialFocus = untrack(() => {
		const candidate = clampDate(
			focusedValue ??
				defaultFocusedValue ??
				selectionAnchor(normalizedSelection) ??
				today(resolvedTimeZone),
			minValue,
			maxValue
		);
		return availableFrom(candidate, 1) ?? availableFrom(candidate, -1) ?? candidate;
	});
	let fallbackFocused = $state<CalendarDate>(initialFocus);
	const focused = $derived(focusedValue ?? fallbackFocused);
	let displayedMonth = $state<CalendarDate>(startOfMonth(initialFocus));
	const buttons = new SvelteMap<string, HTMLButtonElement>();
	const visibleMonthList = $derived(visibleCalendarMonths(displayedMonth, resolvedVisibleMonths));
	const weekdays = $derived(
		weekdayLabels(displayedMonth, resolvedLocale, resolvedFirstDayOfWeek, 'short', resolvedTimeZone)
	);
	const monthLabels = $derived(
		visibleMonthList.map((month) =>
			formatDate(month, resolvedLocale, { month: 'long', year: 'numeric' }, resolvedTimeZone)
		)
	);
	const windowLabel = $derived(
		monthLabels.length === 1
			? monthLabels[0]
			: `${monthLabels[0]} – ${monthLabels[monthLabels.length - 1]}`
	);
	const currentToday = $derived(today(resolvedTimeZone));
	const selectedRange = $derived(
		selectionMode === 'range'
			? normalizeRangeValue(normalizedSelection as CalendarRangeValue | null)
			: null
	);
	const normalizedHighlightRange = $derived(
		normalizeCalendarRangeModelValue(highlightRange, 'ZCalendar highlightRange')
	);
	let hoverDate = $state<CalendarDate | null>(null);
	const hoverRange = $derived(
		selectionMode === 'range' && selectedRange?.start && !selectedRange.end
			? normalizeRange(selectedRange.start, hoverDate ?? focused)
			: null
	);
	const hoverRangeContiguous = $derived(rangeIsContiguous(hoverRange));
	const displayRange = $derived(hoverRange ?? selectedRange ?? normalizedHighlightRange);
	const rootClass = $derived(
		zui.recipe(rootRecipe, { appearance, disabled: resolvedDisabled, size: resolvedSize })
	);
	const headerClass = $derived(zui.recipe(headerRecipe));
	const navClass = $derived(zui.recipe(navRecipe, { size: resolvedSize }));
	const tableClass = $derived(zui.recipe(tableRecipe));
	const monthsClass = $derived(zui.recipe(monthsRecipe));
	const monthClass = $derived(zui.recipe(monthRecipe));
	const weekdayClass = $derived(zui.recipe(weekdayRecipe, { size: resolvedSize }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function syncCalendar(next: CalendarSelectionValue): void {
		const target = clampDate(
			selectionAnchor(next) ?? defaultFocusedValue ?? today(resolvedTimeZone),
			minValue,
			maxValue
		);
		setFocused(target, false);
		ensureFocusedVisible(target);
	}

	function resetFromForm(): void {
		valueState.reset();
		syncCalendar(normalizedSelection);
	}

	function unavailableDate(date: CalendarDate): boolean {
		return dateIsUnavailable(date, minValue, maxValue, constraints.predicate);
	}

	function unavailable(date: CalendarDate): boolean {
		return resolvedDisabled || unavailableDate(date);
	}

	function rangeIsContiguous(range: CalendarRangeValue | null): boolean {
		return (
			allowNonContiguousRange ||
			!isDateUnavailable ||
			calendarRangeIsContiguous(range, isDateUnavailable)
		);
	}

	function setFocused(next: CalendarDate, notify = true): void {
		const changed = !isSameDay(focused, next);
		fallbackFocused = next;
		focusedValue = next;
		if (notify && changed) onFocusedValueChange?.(next);
	}

	function availableFrom(candidate: CalendarDate, direction: -1 | 1): CalendarDate | null {
		let next = clampDate(candidate, minValue, maxValue);
		for (let attempts = 0; attempts < 3660; attempts += 1) {
			if (!unavailableDate(next)) return next;
			const stepped = next.add({ days: direction });
			if (
				(minValue && stepped.compare(minValue) < 0) ||
				(maxValue && stepped.compare(maxValue) > 0)
			)
				return null;
			next = stepped;
		}
		return null;
	}

	function focusDate(next: CalendarDate, direction: -1 | 1): void {
		if (resolvedDisabled) return;
		const available = availableFrom(next, direction);
		if (!available) return;
		setFocused(available);
		ensureFocusedVisible(available);
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() =>
			buttons.get(available.toString())?.focus({ preventScroll: true })
		);
	}

	function ensureFocusedVisible(date: CalendarDate): void {
		const month = startOfMonth(date);
		const first = visibleMonthList[0]!;
		const last = visibleMonthList[visibleMonthList.length - 1]!;
		if (month.compare(first) < 0) displayedMonth = month;
		else if (month.compare(last) > 0)
			displayedMonth = startOfMonth(month.subtract({ months: resolvedVisibleMonths - 1 }));
	}

	function registerButton(node: HTMLButtonElement, key: string) {
		let current = key;
		buttons.set(current, node);
		return {
			destroy() {
				buttons.delete(current);
			},
			update(next: string) {
				buttons.delete(current);
				current = next;
				buttons.set(current, node);
			}
		};
	}

	function select(date: CalendarDate): void {
		if (resolvedReadonly || unavailable(date)) return;
		const previousFocus = focused;
		const previousMonth = displayedMonth;
		setFocused(date);
		let next: CalendarSelectionValue;
		if (selectionMode === 'multiple')
			next = toggleCalendarMultipleValue(normalizedSelection as readonly CalendarDate[], date);
		else if (selectionMode === 'range') {
			const current = normalizeRangeValue(normalizedSelection as CalendarRangeValue | null);
			if (!current?.start || current.end) next = Object.freeze({ end: null, start: date });
			else {
				const candidate = normalizeRange(current.start, date);
				if (!rangeIsContiguous(candidate)) return;
				next = candidate;
			}
		} else next = date;
		hoverDate = null;
		if (!valueState.setFromUser(next)) {
			setFocused(previousFocus, false);
			displayedMonth = previousMonth;
		}
	}

	function handleKeydown(event: KeyboardEvent, date: CalendarDate): void {
		const horizontal = getElementDirection(ref, zui.direction) === 'rtl' ? -1 : 1;
		let next: CalendarDate;
		let direction: -1 | 1 = 1;
		switch (event.key) {
			case 'ArrowRight':
				next = date.add({ days: horizontal });
				direction = horizontal === 1 ? 1 : -1;
				break;
			case 'ArrowLeft':
				next = date.subtract({ days: horizontal });
				direction = horizontal === 1 ? -1 : 1;
				break;
			case 'ArrowDown':
				next = date.add({ weeks: 1 });
				break;
			case 'ArrowUp':
				next = date.subtract({ weeks: 1 });
				direction = -1;
				break;
			case 'Home':
				next = date.subtract({
					days: weekDayIndex(date, resolvedLocale, resolvedFirstDayOfWeek)
				});
				direction = -1;
				break;
			case 'End':
				next = date.add({
					days: 6 - weekDayIndex(date, resolvedLocale, resolvedFirstDayOfWeek)
				});
				break;
			case 'PageDown':
				next = date.add(event.shiftKey ? { years: 1 } : { months: 1 });
				break;
			case 'PageUp':
				next = date.subtract(event.shiftKey ? { years: 1 } : { months: 1 });
				direction = -1;
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				select(date);
				return;
			case 'Backspace':
			case 'Delete':
				if (!resolvedReadonly) {
					event.preventDefault();
					valueState.setFromUser(selectionMode === 'multiple' ? Object.freeze([]) : null);
				}
				return;
			default:
				return;
		}
		event.preventDefault();
		focusDate(next, direction);
	}

	function moveMonth(direction: -1 | 1): void {
		if (resolvedDisabled) return;
		const amount = direction * resolvedVisibleMonths;
		const next = startOfMonth(displayedMonth.add({ months: amount }));
		if (next.compare(displayedMonth) === 0) return;
		const nextMonths = visibleCalendarMonths(next, resolvedVisibleMonths);
		const nextLast = nextMonths[nextMonths.length - 1]!;
		if (minValue && direction < 0 && nextLast.compare(startOfMonth(minValue)) < 0) return;
		if (maxValue && direction > 0 && next.compare(startOfMonth(maxValue)) > 0) return;
		displayedMonth = next;
		const candidate = new CalendarDate(
			next.calendar,
			next.era,
			next.year,
			next.month,
			Math.min(focused.day, next.calendar.getDaysInMonth(next))
		);
		const available = availableFrom(candidate, direction);
		const availableMonth = available ? startOfMonth(available) : null;
		if (
			availableMonth &&
			availableMonth.compare(next) >= 0 &&
			availableMonth.compare(nextLast) <= 0
		)
			setFocused(available);
	}

	const previousDisabled = $derived.by(() => {
		if (resolvedDisabled) return true;
		const previous = startOfMonth(displayedMonth.subtract({ months: resolvedVisibleMonths }));
		if (previous.compare(displayedMonth) >= 0) return true;
		const months = visibleCalendarMonths(previous, resolvedVisibleMonths);
		return Boolean(minValue && months[months.length - 1]!.compare(startOfMonth(minValue)) < 0);
	});
	const nextDisabled = $derived.by(() => {
		if (resolvedDisabled) return true;
		const next = startOfMonth(displayedMonth.add({ months: resolvedVisibleMonths }));
		return (
			next.compare(displayedMonth) <= 0 ||
			Boolean(maxValue && next.compare(startOfMonth(maxValue)) > 0)
		);
	});
	$effect(() => {
		const next = focused;
		ensureFocusedVisible(next);
	});
	function actualSelected(date: CalendarDate): boolean {
		if (selectionMode === 'multiple')
			return (normalizedSelection as readonly CalendarDate[]).some((item) => isSameDay(item, date));
		if (selectionMode === 'range') return isDateInRange(date, selectedRange);
		const selected = normalizedSelection as CalendarDate | null;
		return Boolean(selected && isSameDay(selected, date));
	}

	function paintedSelected(date: CalendarDate): boolean {
		return actualSelected(date) || isDateInRange(date, normalizedHighlightRange);
	}

	function previewed(date: CalendarDate): boolean {
		return Boolean(hoverRange && isDateInRange(date, hoverRange));
	}

	function rangeEdge(date: CalendarDate): 'start' | 'end' | undefined {
		return displayRange?.start && isSameDay(date, displayRange.start)
			? 'start'
			: displayRange?.end && isSameDay(date, displayRange.end)
				? 'end'
				: undefined;
	}

	function weekPeriod(date: CalendarDate | undefined): WeekPeriod | null {
		if (!date || date.calendar.identifier !== 'gregory' || date.era !== 'AD') return null;
		// Period week-year resolution probes an adjacent year. Do not ask it to construct
		// an unrepresentable year 0 or 10000 for an otherwise renderable boundary month.
		if (date.year <= 1 || date.year >= 9999) return null;
		return periodFromDate(date, { kind: 'week', ...resolvedWeekRules }) as WeekPeriod;
	}

	const formEntries = $derived.by<readonly FormValueEntry[]>(() => {
		if (!resolvedName) return [];
		if (selectionMode === 'multiple')
			return (normalizedSelection as readonly CalendarDate[]).map(
				(date) => [resolvedName, date.toString()] as const
			);
		if (selectionMode === 'range') {
			const selected = normalizedSelection as CalendarRangeValue | null;
			return [
				[`${resolvedName}.start`, selected?.start?.toString()],
				[`${resolvedName}.end`, selected?.end?.toString()]
			];
		}
		return [[resolvedName, (normalizedSelection as CalendarDate | null)?.toString()]];
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() => {
			buttons.get(focused.toString())?.focus({ preventScroll: true });
		})
	);
</script>

<div
	{...rest}
	dir={resolvedDirection}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-describedby={describedBy}
	aria-labelledby={labelledBy}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-selection-mode={selectionMode}
	data-size={resolvedSize}
	data-visible-months={visibleMonthList.length}
	onpointerleave={() => (hoverDate = null)}
>
	<div class={headerClass} data-slot="header">
		<button
			type="button"
			class={navClass}
			aria-label={resolvedPreviousLabel}
			disabled={previousDisabled}
			onclick={() => moveMonth(-1)}
		>
			<PreviousIcon aria-hidden="true" size="1em" />
		</button>
		<strong aria-live="polite">{windowLabel}</strong>
		<button
			type="button"
			class={navClass}
			aria-label={resolvedNextLabel}
			disabled={nextDisabled}
			onclick={() => moveMonth(1)}
		>
			<NextIcon aria-hidden="true" size="1em" />
		</button>
	</div>
	<div class={monthsClass} data-slot="months">
		{#each visibleMonthList as month, monthIndex (`${month.year}-${month.month}`)}
			{@const cells = calendarMonthCells(
				month,
				visibleMonthList,
				resolvedLocale,
				resolvedFirstDayOfWeek
			)}
			{@const monthLabel = monthLabels[monthIndex]!}
			<section class={monthClass} data-slot="month" data-month={month.toString()}>
				{#if resolvedVisibleMonths > 1}<strong>{monthLabel}</strong>{/if}
				<table
					class={tableClass}
					data-slot="grid"
					role="grid"
					aria-label={`${resolvedCalendarLabel}: ${monthLabel}`}
					aria-describedby={describedBy}
					aria-disabled={resolvedDisabled || undefined}
					aria-readonly={resolvedReadonly || undefined}
					aria-multiselectable={selectionMode === 'single' ? undefined : true}
				>
					<thead>
						<tr>
							{#if showWeekNumbers}<th class={weekdayClass} scope="col">{resolvedWeekLabel}</th
								>{/if}
							{#each weekdays as weekday, index (`${weekday}-${index}`)}
								<th class={weekdayClass} scope="col">{weekday}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each Array.from({ length: 6 }, (_, index) => index) as week (week)}
							{@const rowCells = cells.slice(week * 7, week * 7 + 7)}
							<tr>
								{#if showWeekNumbers}
									{@const actualDays = rowCells.filter((cell) => !cell.duplicateOutside)}
									{@const weekValue = weekPeriod(
										actualDays[Math.floor(actualDays.length / 2)]?.date
									)}
									<th
										class={weekdayClass}
										data-slot="week-number"
										scope="row"
										aria-label={weekValue
											? resolvedWeekNumberLabel(weekValue.week, weekValue.year)
											: undefined}
										aria-hidden={!weekValue || undefined}>{weekValue?.week ?? ''}</th
									>
								{/if}
								{#each rowCells as cell, cellIndex (`${cell.date.toString()}-${cellIndex}`)}
									<td
										role="gridcell"
										aria-selected={cell.duplicateOutside ? undefined : actualSelected(cell.date)}
										data-duplicate-outside={cell.duplicateOutside || undefined}
									>
										{#if !cell.duplicateOutside && (showOutsideDates || !cell.outsideMonth)}
											<button
												use:registerButton={cell.date.toString()}
												type="button"
												class={zui.recipe(cellRecipe, {
													disabled: unavailable(cell.date),
													outside: cell.outsideMonth,
													size: resolvedSize,
													selected: paintedSelected(cell.date)
												})}
												disabled={unavailable(cell.date)}
												tabindex={isSameDay(cell.date, focused) ? 0 : -1}
												aria-label={formatDate(
													cell.date,
													resolvedLocale,
													{ day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' },
													resolvedTimeZone
												)}
												aria-current={isSameDay(cell.date, currentToday) ? 'date' : undefined}
												data-selected={actualSelected(cell.date) || undefined}
												data-highlighted={isDateInRange(cell.date, normalizedHighlightRange) ||
													undefined}
												data-preview={previewed(cell.date) || undefined}
												data-preview-invalid={(previewed(cell.date) && !hoverRangeContiguous) ||
													undefined}
												data-range-edge={rangeEdge(cell.date)}
												data-outside={cell.outsideMonth || undefined}
												data-disabled={unavailable(cell.date) || undefined}
												aria-disabled={unavailable(cell.date) || undefined}
												onpointerenter={() => (hoverDate = cell.date)}
												onfocus={() => setFocused(cell.date)}
												onclick={() => select(cell.date)}
												onkeydown={(event) => handleKeydown(event, cell.date)}
												>{cell.date.day}</button
											>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/each}
	</div>
</div>
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		entries={formEntries}
		{form}
		onReset={resetFromForm}
	/>
{/if}
