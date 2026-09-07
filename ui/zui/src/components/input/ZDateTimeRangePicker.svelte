<script module lang="ts">
	import { CalendarDateTime, ZonedDateTime } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { DateTimeDisambiguation, DateTimeGranularity } from '../../runtime/date-time.js';
	import type {
		DateTimeRangeOrder,
		DateTimeRangePart,
		DateTimeRangePreset,
		LocalDateTimeRangeValue,
		ZonedDateTimeRangeValue
	} from '../../runtime/date-time-range.js';
	import type { TimeFieldSegment, Weekday } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimePickerDayPeriod } from '../../runtime/time-picker.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type {
		DateTimeRangeOrder,
		DateTimeRangePart,
		DateTimeRangePreset,
		LocalDateTimeRangeValue,
		ZonedDateTimeRangeValue
	} from '../../runtime/date-time-range.js';
	export type DateTimeRangeCommitMode = 'confirm' | 'immediate';
	export type DateTimeRangePickerSize = ZControlSize;

	interface ZDateTimeRangePickerSharedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly allowEmpty?: boolean;
		readonly calendarLabel?: string;
		readonly cancelLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly commitMode?: DateTimeRangeCommitMode;
		readonly confirmLabel?: string;
		readonly controlId?: string;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly defaultOpen?: boolean;
		readonly disabled?: boolean;
		readonly disambiguation?: DateTimeDisambiguation;
		readonly endLabel?: string;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly granularity?: DateTimeGranularity;
		readonly hideTimeZone?: boolean;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly invalidDateTimeLabel?: string;
		readonly invalidRangeLabel?: string;
		readonly locale?: string;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly noAvailableTimeLabel?: string;
		readonly nowLabel?: string;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly order?: DateTimeRangeOrder;
		readonly orderedRangeLabel?: string;
		readonly pickerLabel?: string;
		readonly placement?: PopoverPlacement;
		readonly previousLabel?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly showNow?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: DateTimeRangePickerSize;
		readonly startLabel?: string;
		readonly timeZone?: string;
		readonly toggleDayPeriodLabel?: string;
	}

	interface ZDateTimeRangePickerLocalBranch {
		readonly defaultValue?: LocalDateTimeRangeValue | null;
		readonly isDateTimeUnavailable?: (
			value: CalendarDateTime,
			part: DateTimeRangePart,
			range: LocalDateTimeRangeValue
		) => boolean;
		readonly maxValue?: CalendarDateTime;
		readonly minValue?: CalendarDateTime;
		readonly mode?: 'local';
		readonly onCommit?: (value: LocalDateTimeRangeValue | null) => void;
		readonly onValueChange?: (value: LocalDateTimeRangeValue | null) => void;
		readonly placeholderValue?: CalendarDateTime;
		readonly presets?: readonly DateTimeRangePreset<'local'>[];
		value?: LocalDateTimeRangeValue | null;
	}

	interface ZDateTimeRangePickerZonedBranch {
		readonly defaultValue?: ZonedDateTimeRangeValue | null;
		readonly isDateTimeUnavailable?: (
			value: ZonedDateTime,
			part: DateTimeRangePart,
			range: ZonedDateTimeRangeValue
		) => boolean;
		readonly maxValue?: ZonedDateTime;
		readonly minValue?: ZonedDateTime;
		readonly mode: 'zoned';
		readonly onCommit?: (value: ZonedDateTimeRangeValue | null) => void;
		readonly onValueChange?: (value: ZonedDateTimeRangeValue | null) => void;
		readonly placeholderValue?: ZonedDateTime;
		readonly presets?: readonly DateTimeRangePreset<'zoned'>[];
		value?: ZonedDateTimeRangeValue | null;
	}

	export type ZDateTimeRangePickerLocalProps = ZDateTimeRangePickerSharedProps &
		ZDateTimeRangePickerLocalBranch;
	export type ZDateTimeRangePickerZonedProps = ZDateTimeRangePickerSharedProps &
		ZDateTimeRangePickerZonedBranch;
	export type ZDateTimeRangePickerProps = ZDateTimeRangePickerSharedProps &
		(ZDateTimeRangePickerLocalBranch | ZDateTimeRangePickerZonedBranch);

	export const zuiMetadata = {
		bindings: [
			{
				description: '由mode判别、保留nullable start/end的唯一日期时间范围。',
				name: 'value',
				type: 'LocalDateTimeRangeValue | ZonedDateTimeRangeValue | null'
			},
			{ description: '唯一Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实范围根节点。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'ZDateTimeField',
			'DateTimePickerPanel',
			'ZPopover',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '字段提交、面板提交或清空后的唯一owner变化；外部同步不触发。',
				name: 'onValueChange',
				type: '(value: DateTimeRangeValue | null) => void'
			},
			{
				description: '面板/preset/Now按commitMode提交或清空成功后的业务提交。',
				name: 'onCommit',
				type: '(value: DateTimeRangeValue | null) => void'
			},
			{
				description: 'Popover用户状态变化。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		id: 'date-time-range-picker',
		importStatement: "import { ZDateTimeRangePicker } from '@zadmin/zui';",
		keyboard: [
			{ description: '分别复用两个DateTimeField的完整分段键盘。', key: 'DateTimeField keys' },
			{ description: '复用Calendar与TimePickerPanel键盘。', key: 'Panel keys' },
			{ description: '丢弃面板草稿并恢复trigger焦点。', key: 'Escape' }
		],
		name: 'ZDateTimeRangePicker',
		parts: [
			{ description: '可自然换行的起止字段布局。', name: 'range-fields' },
			{ description: '起始DateTimeField。', name: 'start-field' },
			{ description: '范围分隔符。', name: 'separator' },
			{ description: '拥有唯一根操作的结束DateTimeField。', name: 'end-field' },
			{ description: '打开唯一复合面板。', name: 'trigger' },
			{ description: '清空唯一范围owner。', name: 'clear' },
			{ description: '端点切换、range presets与共享DateTimePickerPanel。', name: 'content' },
			{ description: '切换面板当前编辑端点。', name: 'range-parts' },
			{ description: '只更新range draft或按immediate提交的完整范围preset。', name: 'range-presets' }
		],
		props: [
			{
				default: "'local'",
				description: '判别CalendarDateTime与ZonedDateTime范围。',
				name: 'mode',
				requiredWhen: "zoned分支必须显式为'zoned'；local分支可省略或为'local'",
				type: "'local' | 'zoned'"
			},
			{
				bindable: true,
				default: 'null',
				description: 'mode判别的唯一范围值；partial始终可表达。',
				name: 'value',
				type: 'DateTimeRangeValue | null'
			},
			{
				default: 'null',
				description: 'mode判别的非受控初值。',
				name: 'defaultValue',
				type: 'DateTimeRangeValue | null'
			},
			{
				default: 'false',
				description: '是否允许最终提交start-only或end-only；不影响partial表达。',
				name: 'allowEmpty',
				type: 'boolean'
			},
			{
				default: "'strict'",
				description: 'strict拒绝完整逆序候选；swap仅在用户完整候选进入owner前交换端点。',
				name: 'order',
				type: "'strict' | 'swap'"
			},
			{
				default: "'confirm'",
				description: '只控制面板、preset与Now：confirm保留草稿，immediate立即提交但保持面板。',
				name: 'commitMode',
				type: "'confirm' | 'immediate'"
			},
			{
				default: 'today at midnight',
				description: '空端点的面板和字段编辑基准，类型由mode判别。',
				name: 'placeholderValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'Provider locale',
				description: '日期、时间、数字和时区文案locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: 'zoned显示和Now解析的IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: "'compatible'",
				description: 'zoned模式DST gap/fold解析策略。',
				name: 'disambiguation',
				type: "'compatible' | 'earlier' | 'later' | 'reject'"
			},
			{
				default: "'minute'",
				description: '两个字段和面板的最小时间单位。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '两个字段和面板的12或24小时制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{ default: '1', description: '分钟字段和面板步进。', name: 'minuteStep', type: 'number' },
			{ default: '1', description: '秒字段和面板步进。', name: 'secondStep', type: 'number' },
			{
				default: 'Provider localePack.time.am/pm',
				description: '共享时间面板AM/PM文案。',
				name: 'dayPeriodLabel',
				type: "(period: 'am' | 'pm') => string"
			},
			{
				default: 'Provider localePack.time segment labels',
				description: '共享时间面板segment名称。',
				name: 'segmentLabel',
				type: '(segment: TimeFieldSegment) => string'
			},
			{
				default: 'Provider localePack.time.toggleDayPeriod',
				description: '共享时间面板AM/PM切换名称。',
				name: 'toggleDayPeriodLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'mode判别的最小完整日期时间。',
				name: 'minValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: 'mode判别的最大完整日期时间。',
				name: 'maxValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: '按端点与完整候选范围联合判断不可用。',
				name: 'isDateTimeUnavailable',
				type: '(value, part, range) => boolean'
			},
			{
				default: '[]',
				description: '静态或惰性的mode判别range presets。',
				name: 'presets',
				type: 'readonly DateTimeRangePreset[]'
			},
			{
				default: 'false',
				description: '在共享Panel显示当前日期时间动作。',
				name: 'showNow',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.time.now',
				description: 'Now按钮文案，只改label。',
				name: 'nowLabel',
				type: 'string'
			},
			{
				default: 'true',
				description: '有任一端点时显示清空动作。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.dateTime.clearDateTimeRange',
				description: '清空动作名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.chooseDateTimeRange',
				description: '根、trigger与dialog后备名称。',
				name: 'pickerLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.startDateTime',
				description: '起始字段与端点按钮名称。',
				name: 'startLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.endDateTime',
				description: '结束字段与端点按钮名称。',
				name: 'endLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.calendarLabel',
				description: '共享Calendar名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.previousMonth',
				description: 'Calendar上一月动作名称。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.nextMonth',
				description: 'Calendar下一月动作名称。',
				name: 'nextLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.common.confirm',
				description: 'Panel确认文案。',
				name: 'confirmLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.common.close',
				description: 'Panel取消文案。',
				name: 'cancelLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.noAvailableDateTime',
				description: '当前端点没有候选的状态文案。',
				name: 'noAvailableTimeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.unavailable',
				description: '单端候选或DST不可用反馈。',
				name: 'invalidDateTimeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.invalidRange',
				description: 'partial或联合范围不可用反馈。',
				name: 'invalidRangeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.orderedRange',
				description: 'strict完整逆序反馈。',
				name: 'orderedRangeLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '显式Calendar周起始日。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{
				default: 'true',
				description: 'Calendar是否显示相邻月份日期。',
				name: 'showOutsideDates',
				type: 'boolean'
			},
			{
				default: "'bottom-start'",
				description: 'Popover逻辑首选方位。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				bindable: true,
				default: 'false',
				description: '唯一Popover owner。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始Popover状态；form reset时关闭。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '禁用字段、Panel与FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '保留字段焦点/FormData并阻止编辑和Panel动作。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '要求完整起止端点。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '合并外部、Field与内在draft无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field或undefined',
				description: '只提交name.start与name.end两个ISO业务entry。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: '唯一FormValueBridge关联form。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Field > componentDefaults.dateTimeRangePicker > input > density',
				description: '字段、Panel与操作共享五档尺寸。',
				name: 'size',
				type: 'ZControlSize'
			},
			{
				default: 'Field controlId或自动生成',
				description: '起始字段首个segment id，结束字段派生。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'false',
				description: 'zoned字段是否隐藏显示时区缩写。',
				name: 'hideTimeZone',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '成功业务提交回调；字段编辑不触发。',
				name: 'onCommit',
				type: '(value: DateTimeRangeValue | null) => void'
			},
			{
				default: 'undefined',
				description: '唯一范围owner用户变化回调。',
				name: 'onValueChange',
				type: '(value: DateTimeRangeValue | null) => void'
			},
			{
				default: 'undefined',
				description: '唯一Popover用户变化回调。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实范围根节点。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateTimeRangePicker.svelte',
		states: [
			{ description: '当前mode。', name: 'data-mode', values: ['local', 'zoned'] },
			{ description: '当前面板端点。', name: 'data-range-part', values: ['start', 'end'] },
			{
				description: '空、partial或完整。',
				name: 'data-range-state',
				values: ['empty', 'partial', 'complete']
			},
			{ description: '实际Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '外部或内在draft无效。', name: 'data-invalid', values: ['true'] },
			{
				description: '解析五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'experimental',
		summary:
			'以mode判别日期时间、nullable范围、共享DateTimePickerPanel和唯一表单owner实现的日期时间范围选择器。'
	} as const satisfies ZuiComponentMetadata;

	const rangeRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			s.maxWidth._full;
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) =>
					s._selector(
						'& > [data-slot="end-field"] > [data-slot="input-group"] > [data-slot="suffix-action"] > button:disabled',
						(s) => s.opacity._opaque
					)
			}
		},
		defaultVariants: { disabled: false }
	});
	const fieldRecipe = defineRecipe({
		base: (s) => {
			s.flex.raw('1 1 auto');
			s.minWidth.px(0);
		},
		variants: {}
	});
	const panelHeaderRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			s.marginBottom._large;
		},
		variants: {}
	});
	const feedbackRecipe = defineRecipe({
		base: (s) => {
			s.color._danger;
			s.marginBottom._small;
		},
		variants: {}
	});
	for (const recipe of [rangeRecipe, fieldRecipe, panelHeaderRecipe, feedbackRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import X from '@lucide/svelte/icons/x';
	import { Time, toCalendarDateTime, toZoned, today } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import type {
		DateTimePickerPanelController,
		DateTimePickerValue
	} from './DateTimePickerPanel.svelte';
	import DateTimePickerPanel from './DateTimePickerPanel.svelte';
	import {
		formatDateTime,
		normalizeDateTimeModelValue,
		type DateTimeMode
	} from '../../runtime/date-time.js';
	import {
		normalizeDateTimeRangeModelValue,
		replaceDateTimeRangePart,
		resolveDateTimeRangeCandidate,
		resolveDateTimeRangePreset,
		sameDateTimeRangeValue,
		stageDateTimeRangeCandidate,
		validateDateTimeRangeValue,
		type DateTimeRangeConstraints,
		type DateTimeRangeValue
	} from '../../runtime/date-time-range.js';
	import { resolveHourCycle } from '../../runtime/date.js';
	import { dateTimePickerParts } from '../../runtime/date-time-picker.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import type { FormValueEntry } from '../../runtime/form/form-value.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import ZDateTimeField, { type ZDateTimeFieldProps } from './ZDateTimeField.svelte';

	type RangeValue = DateTimeRangeValue<DateTimeMode>;
	type DraftController = { rollbackDraft(): void };

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowEmpty = false,
		calendarLabel,
		cancelLabel,
		class: className,
		clearLabel,
		clearable = true,
		commitMode = 'confirm',
		confirmLabel,
		controlId: controlIdProp,
		dayPeriodLabel,
		defaultOpen = false,
		defaultValue,
		dir: dirProp,
		disabled: disabledProp = false,
		disambiguation = 'compatible',
		endLabel,
		firstDayOfWeek,
		form,
		granularity = 'minute',
		hideTimeZone = false,
		hourCycle: hourCycleProp,
		invalid: invalidProp = false,
		invalidDateTimeLabel,
		invalidRangeLabel,
		isDateTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		mode = 'local',
		name: nameProp,
		nextLabel,
		noAvailableTimeLabel,
		nowLabel,
		onCommit,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		order = 'strict',
		orderedRangeLabel,
		pickerLabel,
		placement = 'bottom-start',
		placeholderValue,
		presets = [],
		previousLabel,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		secondStep = 1,
		segmentLabel,
		showNow = false,
		showOutsideDates = true,
		size,
		startLabel,
		style,
		timeZone,
		toggleDayPeriodLabel,
		value = $bindable(),
		...rest
	}: ZDateTimeRangePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-time-range-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-start`);
	const triggerId = $derived(`${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDirection = $derived(dirProp ?? zui.direction);
	const resolvedHourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.dateTimeRangePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedPickerLabel = $derived(pickerLabel ?? zui.localePack.dateTime.chooseDateTimeRange);
	const resolvedStartLabel = $derived(startLabel ?? zui.localePack.dateTime.startDateTime);
	const resolvedEndLabel = $derived(endLabel ?? zui.localePack.dateTime.endDateTime);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.dateTime.clearDateTimeRange);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.calendarLabel);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.date.previousMonth);
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.date.nextMonth);
	const resolvedConfirmLabel = $derived(confirmLabel ?? zui.localePack.common.confirm);
	const resolvedCancelLabel = $derived(cancelLabel ?? zui.localePack.common.close);
	const resolvedNoAvailableLabel = $derived(
		noAvailableTimeLabel ?? zui.localePack.dateTime.noAvailableDateTime
	);
	const resolvedInvalidDateTimeLabel = $derived(
		invalidDateTimeLabel ?? zui.localePack.dateTime.unavailable
	);
	const resolvedInvalidRangeLabel = $derived(
		invalidRangeLabel ?? zui.localePack.dateTime.invalidRange
	);
	const resolvedOrderedRangeLabel = $derived(
		orderedRangeLabel ?? zui.localePack.dateTime.orderedRange
	);
	const resolvedNowLabel = $derived(nowLabel ?? zui.localePack.time.now);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const rangeConstraints = $derived<DateTimeRangeConstraints<DateTimeMode>>({
		allowEmpty,
		isDateTimeUnavailable:
			isDateTimeUnavailable as DateTimeRangeConstraints<DateTimeMode>['isDateTimeUnavailable'],
		maxValue: maxValue as DateTimePickerValue | undefined,
		minValue: minValue as DateTimePickerValue | undefined,
		mode: mode as DateTimeMode,
		order
	});
	const resolvedPlaceholder = $derived.by<DateTimePickerValue>(() => {
		if (placeholderValue !== undefined)
			return normalizeDateTimeModelValue(
				placeholderValue,
				mode as DateTimeMode,
				'ZDateTimeRangePicker placeholderValue'
			)!;
		const local = toCalendarDateTime(today(resolvedTimeZone), new Time(0));
		return mode === 'zoned' ? toZoned(local, resolvedTimeZone, disambiguation) : local;
	});
	let startFieldRef = $state<HTMLDivElement | null>(null);
	let endFieldRef = $state<HTMLDivElement | null>(null);
	let startController = $state<DraftController | null>(null);
	let endController = $state<DraftController | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let panelController = $state<DateTimePickerPanelController | null>(null);
	let startFieldValue = $state<DateTimePickerValue | null>(null);
	let endFieldValue = $state<DateTimePickerValue | null>(null);
	let startDraftState = $state<FormControlDraftState>({ dirty: false, valid: true });
	let endDraftState = $state<FormControlDraftState>({ dirty: false, valid: true });
	let panelFieldDraft = $state<FormControlDraftState>({ dirty: false, valid: true });
	let panelDraft = $state<RangeValue | null>(null);
	let panelDirty = $state(false);
	let panelFeedback = $state('');
	let panelFeedbackRevision = $state(0);
	let rangePart = $state<DateTimeRangePart>('start');

	const valueState = createFormControlState<RangeValue | null>(
		{
			defaultValue: () => normalizeDateTimeRangeModelValue(defaultValue, mode as DateTimeMode),
			draftState: () => inspectDraftState(),
			element: () => ref,
			normalizeModelValue: (candidate) =>
				normalizeDateTimeRangeModelValue(candidate, mode as DateTimeMode),
			onChange: () => onValueChange as ((next: RangeValue | null) => void) | undefined,
			owner: 'ZDateTimeRangePicker',
			read: () => value as RangeValue | null | undefined,
			resetDraft: resetDraft,
			resetToInitialValue: true,
			syncNative: (next) => syncFields(next),
			write: (next) => (value = next as typeof value)
		},
		valueScope
	);
	const normalizedValue = $derived(
		normalizeDateTimeRangeModelValue(valueState.current, mode as DateTimeMode)
	);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const ownerValidation = $derived(validateDateTimeRangeValue(normalizedValue, rangeConstraints));
	const compositeDraft = $derived.by<FormControlDraftState>(() => inspectDraftState());
	const resolvedInvalid = $derived(
		invalidProp || (field?.invalid ?? false) || !ownerValidation.valid || !compositeDraft.valid
	);
	const activePanelValue = $derived(panelDraft?.[rangePart] ?? null);
	const panelHighlight = $derived(
		panelDraft
			? {
					start: panelDraft.start
						? dateTimePickerParts(panelDraft.start, { mode, timeZone: resolvedTimeZone }).date
						: null,
					end: panelDraft.end
						? dateTimePickerParts(panelDraft.end, { mode, timeZone: resolvedTimeZone }).date
						: null
				}
			: null
	);
	const rangeState = $derived(
		!normalizedValue
			? 'empty'
			: normalizedValue.start && normalizedValue.end
				? 'complete'
				: 'partial'
	);
	const formEntries = $derived<readonly FormValueEntry[]>(
		resolvedName
			? [
					[`${resolvedName}.start`, normalizedValue?.start?.toString()],
					[`${resolvedName}.end`, normalizedValue?.end?.toString()]
				]
			: []
	);
	const rangeClass = $derived(zui.recipe(rangeRecipe, { disabled: resolvedDisabled }));
	const fieldClass = $derived(zui.recipe(fieldRecipe));
	const startFieldProps = $derived(buildFieldProps('start'));
	const endFieldProps = $derived(buildFieldProps('end'));
	function buildFieldProps(part: DateTimeRangePart): ZDateTimeFieldProps {
		const projected = part === 'start' ? startFieldValue : endFieldValue;
		const common = {
			'aria-describedby': describedBy,
			'aria-label': part === 'start' ? resolvedStartLabel : resolvedEndLabel,
			class: fieldClass,
			controlId: part === 'start' ? controlId : `${controlId}-end`,
			'data-slot': `${part}-field`,
			dir: resolvedDirection,
			disabled: resolvedDisabled,
			disambiguation,
			formParticipation: 'none' as const,
			granularity,
			hideTimeZone,
			hourCycle: resolvedHourCycle,
			invalid: resolvedInvalid,
			isDateTimeUnavailable: (candidate: DateTimePickerValue) =>
				endpointUnavailable(candidate, part, normalizedValue),
			locale: resolvedLocale,
			minuteStep,
			onDraftChange: (next: FormControlDraftState) => {
				if (part === 'start') startDraftState = next;
				else endDraftState = next;
			},
			onValueChange: (next: DateTimePickerValue | null) => updateFromField(part, next),
			readonly: resolvedReadonly,
			required: resolvedRequired,
			secondStep,
			size: resolvedSize,
			timeZone: resolvedTimeZone
		};
		if (mode === 'zoned')
			return {
				...common,
				mode: 'zoned',
				value: normalizeDateTimeModelValue(projected, 'zoned', 'ZDateTimeRangePicker field value'),
				placeholderValue: normalizeDateTimeModelValue(
					resolvedPlaceholder,
					'zoned',
					'ZDateTimeRangePicker placeholder'
				)!,
				minValue:
					normalizeDateTimeModelValue(minValue, 'zoned', 'ZDateTimeRangePicker minValue') ??
					undefined,
				maxValue:
					normalizeDateTimeModelValue(maxValue, 'zoned', 'ZDateTimeRangePicker maxValue') ??
					undefined
			};
		return {
			...common,
			mode: 'local',
			value: normalizeDateTimeModelValue(projected, 'local', 'ZDateTimeRangePicker field value'),
			placeholderValue: normalizeDateTimeModelValue(
				resolvedPlaceholder,
				'local',
				'ZDateTimeRangePicker placeholder'
			)!,
			minValue:
				normalizeDateTimeModelValue(minValue, 'local', 'ZDateTimeRangePicker minValue') ??
				undefined,
			maxValue:
				normalizeDateTimeModelValue(maxValue, 'local', 'ZDateTimeRangePicker maxValue') ?? undefined
		};
	}
	const panelHeaderClass = $derived(zui.recipe(panelHeaderRecipe));
	const feedbackClass = $derived(zui.recipe(feedbackRecipe));

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function inspectDraftState(): FormControlDraftState {
		if (resolvedOpen && !panelFieldDraft.valid) return panelFieldDraft;
		const child = !startDraftState.valid
			? startDraftState
			: !endDraftState.valid
				? endDraftState
				: null;
		if (child) return child;
		const candidate = panelDirty ? panelDraft : normalizedValue;
		const validation = validateDateTimeRangeValue(candidate, rangeConstraints);
		const requiredMissing = resolvedRequired && !(candidate?.start && candidate.end);
		const valid = validation.valid && !requiredMissing;
		return Object.freeze({
			dirty: startDraftState.dirty || endDraftState.dirty || panelDirty,
			message: valid
				? undefined
				: requiredMissing
					? zui.localePack.form.requiredValue
					: validation.reason === 'order'
						? resolvedOrderedRangeLabel
						: resolvedInvalidRangeLabel,
			valid
		});
	}

	function updateValue(next: RangeValue | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted =
			valueState.setFromUser(next) && sameDateTimeRangeValue(valueState.current, next);
		if (!accepted) syncFields();
		return accepted;
	}

	function commit(next: RangeValue | null, notifyCommit: boolean): boolean {
		if (!updateValue(next)) return false;
		if (notifyCommit) (onCommit as ((value: RangeValue | null) => void) | undefined)?.(next);
		return true;
	}

	function resolveCandidate(
		range: RangeValue | null,
		part: DateTimeRangePart,
		next: DateTimePickerValue | null,
		allowPartial = true
	) {
		return resolveDateTimeRangeCandidate(range, part, next, rangeConstraints, allowPartial);
	}

	function endpointUnavailable(
		candidate: DateTimePickerValue,
		part: DateTimeRangePart,
		range: RangeValue | null
	): boolean {
		const staged = stageDateTimeRangeCandidate(range, part, candidate, order);
		if (
			order === 'strict' &&
			staged.range?.start &&
			staged.range.end &&
			staged.range.start.compare(staged.range.end) > 0
		)
			return true;
		const endpoint = staged.range?.[staged.part];
		return Boolean(
			endpoint &&
			staged.range &&
			(isDateTimeUnavailable as DateTimeRangeConstraints<DateTimeMode>['isDateTimeUnavailable'])?.(
				endpoint,
				staged.part,
				staged.range
			)
		);
	}

	function updateFromField(part: DateTimeRangePart, next: DateTimePickerValue | null): void {
		if (part === 'start') startFieldValue = next;
		else endFieldValue = next;
		const resolved = resolveCandidate(normalizedValue, part, next);
		if (!resolved || !commit(resolved.range, false)) {
			syncFields();
			return;
		}
		rangePart = resolved.part;
		if (resolvedOpen) {
			panelDraft = resolved.range;
			panelDirty = false;
		}
	}

	function syncFields(next = normalizedValue): void {
		startController?.rollbackDraft();
		endController?.rollbackDraft();
		startFieldValue = next?.start ?? null;
		endFieldValue = next?.end ?? null;
	}

	function resetDraft(): void {
		syncFields(normalizedValue);
		startDraftState = { dirty: false, valid: true };
		endDraftState = { dirty: false, valid: true };
		panelDraft = resolvedOpen ? normalizedValue : null;
		panelDirty = false;
		panelFeedback = '';
		panelController?.resetDraft();
	}

	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		openState.setFromUser(next);
	}

	function selectRangePart(part: DateTimeRangePart): void {
		if (resolvedDisabled || resolvedReadonly) return;
		rangePart = part;
		panelFeedback = '';
		ownerMicrotask(() => panelController?.focusFirst());
	}

	function announceInvalid(reason?: 'order'): void {
		panelFeedback = reason === 'order' ? resolvedOrderedRangeLabel : resolvedInvalidRangeLabel;
		panelFeedbackRevision += 1;
	}

	function applyPanelCandidate(next: DateTimePickerValue): RangeValue | null {
		const staged = stageDateTimeRangeCandidate(panelDraft, rangePart, next, order);
		panelDraft = staged.range;
		rangePart = staged.part;
		panelDirty = true;
		const validation = validateDateTimeRangeValue(staged.range, rangeConstraints);
		if (validation.valid) panelFeedback = '';
		else announceInvalid(validation.reason === 'order' ? 'order' : undefined);
		if (commitMode === 'immediate' && validation.valid) commit(staged.range, true);
		return staged.range;
	}

	function confirmPanel(next: DateTimePickerValue): void {
		const candidate = applyPanelCandidate(next);
		const validation = validateDateTimeRangeValue(candidate, rangeConstraints);
		if (!validation.valid) {
			if (validation.reason === 'partial' && candidate) {
				selectRangePart(candidate.start ? 'end' : 'start');
				return;
			}
			announceInvalid(validation.reason === 'order' ? 'order' : undefined);
			return;
		}
		if (commitMode === 'confirm') {
			if (!commit(candidate, true)) return;
		} else if (!sameDateTimeRangeValue(normalizedValue, candidate)) {
			if (!commit(candidate, true)) return;
		}
		setOpen(false);
	}

	function chooseRangePreset(preset: DateTimeRangePreset<DateTimeMode>): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const candidate = resolveDateTimeRangePreset(preset, rangeConstraints);
		if (candidate === undefined) {
			announceInvalid();
			return;
		}
		panelDraft = candidate;
		panelDirty = true;
		panelFeedback = '';
		rangePart = candidate?.start && !candidate.end ? 'end' : 'start';
		if (commitMode === 'immediate' && commit(candidate, true)) panelDirty = false;
	}

	function clear(): void {
		if (!commit(null, true)) return;
		setOpen(false);
		ownerMicrotask(() =>
			startFieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}

	function resetFromForm(): void {
		valueState.reset();
		syncFields();
		open = false;
		panelDraft = null;
		panelDirty = false;
		panelFeedback = '';
		rangePart = 'start';
	}

	function endpointText(part: DateTimeRangePart): string {
		const endpoint = panelDraft?.[part];
		return endpoint
			? formatDateTime(
					endpoint,
					resolvedLocale,
					{
						hourCycle: resolvedHourCycle === 12 ? 'h12' : 'h23',
						minute: granularity === 'hour' ? undefined : '2-digit',
						second: granularity === 'second' ? '2-digit' : undefined
					},
					resolvedTimeZone
				)
			: part === 'start'
				? resolvedStartLabel
				: resolvedEndLabel;
	}

	let observedOwner: RangeValue | null = null;
	let previouslyOpen = false;
	$effect(() => {
		const current = normalizedValue;
		const currentlyOpen = resolvedOpen;
		const changed = !sameDateTimeRangeValue(current, observedOwner);
		if (changed) untrack(() => syncFields(current));
		if (currentlyOpen && (!previouslyOpen || changed)) {
			panelDraft = current;
			panelDirty = false;
			panelFeedback = '';
			rangePart =
				current?.start && !current.end ? 'end' : current?.end && !current.start ? 'start' : 'start';
		}
		if (!currentlyOpen && previouslyOpen) {
			panelDraft = null;
			panelDirty = false;
			panelFeedback = '';
			panelFieldDraft = { dirty: false, valid: true };
		}
		observedOwner = current;
		previouslyOpen = currentlyOpen;
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			startFieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet actions()}
	<ZPopover modal={false} onOpenChange={setOpen} open={resolvedOpen} {placement} {triggerId}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={resolvedPickerLabel}
			data-slot="trigger"
			disabled={resolvedDisabled || resolvedReadonly}
			popupRole="dialog"
			size={resolvedSize}
			variant="ghost"
		>
			<CalendarClock aria-hidden="true" size="1em" />
		</ZPopoverTrigger>
		<ZPopoverContent
			aria-label={resolvedPickerLabel}
			ariaLabelledBy={null}
			data-slot="content"
			dir={resolvedDirection}
			initialFocus={() => panelController?.firstFocusableElement ?? null}
			role="dialog"
		>
			<div
				aria-label={resolvedPickerLabel}
				class={panelHeaderClass}
				data-slot="range-parts"
				role="group"
			>
				<ZButton
					aria-pressed={rangePart === 'start'}
					onclick={() => selectRangePart('start')}
					size={resolvedSize}
					variant={rangePart === 'start' ? 'solid' : 'outline'}
					>{resolvedStartLabel}
					: {endpointText('start')}</ZButton
				>
				<ZButton
					aria-pressed={rangePart === 'end'}
					onclick={() => selectRangePart('end')}
					size={resolvedSize}
					variant={rangePart === 'end' ? 'solid' : 'outline'}
					>{resolvedEndLabel}
					: {endpointText('end')}</ZButton
				>
			</div>
			{#if presets.length > 0}
				<div
					aria-label={resolvedPickerLabel}
					class={panelHeaderClass}
					data-slot="range-presets"
					role="group"
				>
					{#each presets as preset, index (`${index}:${preset.label}`)}
						<ZButton
							onclick={() => chooseRangePreset(preset as DateTimeRangePreset<DateTimeMode>)}
							size={resolvedSize}
							variant="outline">{preset.label}</ZButton
						>
					{/each}
				</div>
			{/if}
			{#if panelFeedback}
				{#key panelFeedbackRevision}
					<div aria-live="polite" class={feedbackClass} data-slot="range-feedback" role="status">
						{panelFeedback}
					</div>
				{/key}
			{/if}
			<DateTimePickerPanel
				highlightRange={panelHighlight}
				calendarLabel={resolvedCalendarLabel}
				cancelLabel={resolvedCancelLabel}
				confirmLabel={resolvedConfirmLabel}
				{dayPeriodLabel}
				direction={resolvedDirection}
				disabled={resolvedDisabled || resolvedReadonly}
				{disambiguation}
				{firstDayOfWeek}
				{granularity}
				hourCycle={resolvedHourCycle}
				idBase={`${idBase}-${rangePart}`}
				invalidDateTimeLabel={resolvedInvalidDateTimeLabel}
				isDateTimeUnavailable={(candidate) => endpointUnavailable(candidate, rangePart, panelDraft)}
				locale={resolvedLocale}
				maxValue={maxValue as DateTimePickerValue | undefined}
				minValue={minValue as DateTimePickerValue | undefined}
				{minuteStep}
				mode={mode as DateTimeMode}
				nextLabel={resolvedNextLabel}
				noAvailableTimeLabel={resolvedNoAvailableLabel}
				nowLabel={resolvedNowLabel}
				onCancel={() => setOpen(false)}
				onConfirm={confirmPanel}
				onDraftChange={(next) => (panelFieldDraft = next)}
				onControllerChange={(controller) => (panelController = controller)}
				onValueChange={applyPanelCandidate}
				placeholderValue={resolvedPlaceholder}
				previousLabel={resolvedPreviousLabel}
				{secondStep}
				{segmentLabel}
				{showNow}
				{showOutsideDates}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				toggleDayPeriodLabel={toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod}
				value={activePanelValue}
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && normalizedValue}
		<ZButton
			aria-label={resolvedClearLabel}
			data-slot="clear"
			disabled={resolvedDisabled || resolvedReadonly}
			onclick={clear}
			size={resolvedSize}
			variant="ghost"
		>
			<X aria-hidden="true" size="1em" />
		</ZButton>
	{/if}
{/snippet}

<div
	{...rest}
	bind:this={ref}
	class={[rangeClass, className]}
	{style}
	dir={resolvedDirection}
	role="group"
	aria-label={labelledBy ? undefined : (ariaLabel ?? resolvedPickerLabel)}
	aria-labelledby={labelledBy}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-mode={mode}
	data-range-part={rangePart}
	data-range-state={rangeState}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZDateTimeField {...startFieldProps} bind:this={startController} bind:ref={startFieldRef} />
	<span aria-hidden="true" data-slot="separator">–</span>
	<ZDateTimeField
		{...endFieldProps}
		bind:this={endController}
		bind:ref={endFieldRef}
		suffixAction={actions}
	/>
</div>
<FormValueBridge disabled={resolvedDisabled} entries={formEntries} {form} onReset={resetFromForm} />
