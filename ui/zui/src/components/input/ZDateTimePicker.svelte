<script module lang="ts">
	import { CalendarDateTime, ZonedDateTime } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { CalendarCellContext, CalendarHeaderContext } from './ZCalendar.svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { Weekday } from '../../runtime/date.js';
	import type { DateTimeDisambiguation, DateTimeGranularity } from '../../runtime/date-time.js';
	import type { DateTimePickerDirection } from '../../runtime/date-time-picker.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimePickerDayPeriod } from '../../runtime/time-picker.js';
	import type {
		InlinePickerPresentationProps,
		PickerPresentation,
		PopoverPickerPresentationProps
	} from '../../runtime/picker-presentation.js';

	export type DateTimePickerCommitMode = 'confirm' | 'immediate';
	type DateTimePickerMode = 'local' | 'zoned';
	export type DateTimePickerSize = ZControlSize;
	export type { DateTimePickerDirection } from '../../runtime/date-time-picker.js';

	export interface DateTimePickerPreset<TValue extends CalendarDateTime | ZonedDateTime> {
		readonly label: string;
		readonly value: TValue | (() => TValue);
	}

	interface ZDateTimePickerSharedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly calendarLabel?: string;
		readonly calendarHeader?: Snippet<[context: CalendarHeaderContext]>;
		readonly dateCell?: Snippet<[context: CalendarCellContext]>;
		readonly cancelLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly commitMode?: DateTimePickerCommitMode;
		readonly confirmLabel?: string;
		readonly controlId?: string;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly disabled?: boolean;
		readonly disambiguation?: DateTimeDisambiguation;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly granularity?: DateTimeGranularity;
		readonly hideTimeZone?: boolean;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly invalidDateTimeLabel?: string;
		readonly locale?: string;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly nextLabel?: string;
		readonly noAvailableTimeLabel?: string;
		readonly nowLabel?: string;
		readonly pickerLabel?: string;
		readonly previousLabel?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: 'hour' | 'minute' | 'second') => string;
		readonly showNow?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: DateTimePickerSize;
		readonly timeZone?: string;
		readonly toggleDayPeriodLabel?: string;
	}

	interface ZDateTimePickerLocalValueProps {
		readonly defaultValue?: CalendarDateTime | null;
		readonly isDateTimeUnavailable?: (value: CalendarDateTime) => boolean;
		readonly maxValue?: CalendarDateTime;
		readonly minValue?: CalendarDateTime;
		readonly mode?: 'local';
		readonly onCommit?: (value: CalendarDateTime | null) => void;
		readonly onValueChange?: (value: CalendarDateTime | null) => void;
		readonly placeholderValue?: CalendarDateTime;
		readonly presets?: readonly DateTimePickerPreset<CalendarDateTime>[];
		value?: CalendarDateTime | null;
	}

	interface ZDateTimePickerZonedValueProps {
		readonly defaultValue?: ZonedDateTime | null;
		readonly isDateTimeUnavailable?: (value: ZonedDateTime) => boolean;
		readonly maxValue?: ZonedDateTime;
		readonly minValue?: ZonedDateTime;
		readonly mode: 'zoned';
		readonly onCommit?: (value: ZonedDateTime | null) => void;
		readonly onValueChange?: (value: ZonedDateTime | null) => void;
		readonly placeholderValue?: ZonedDateTime;
		readonly presets?: readonly DateTimePickerPreset<ZonedDateTime>[];
		value?: ZonedDateTime | null;
	}

	interface LocalPopoverProps
		extends
			ZDateTimePickerSharedProps,
			ZDateTimePickerLocalValueProps,
			PopoverPickerPresentationProps {}
	interface LocalInlineProps
		extends
			ZDateTimePickerSharedProps,
			ZDateTimePickerLocalValueProps,
			InlinePickerPresentationProps {}
	interface ZonedPopoverProps
		extends
			ZDateTimePickerSharedProps,
			ZDateTimePickerZonedValueProps,
			PopoverPickerPresentationProps {}
	interface ZonedInlineProps
		extends
			ZDateTimePickerSharedProps,
			ZDateTimePickerZonedValueProps,
			InlinePickerPresentationProps {}
	export type ZDateTimePickerLocalProps = LocalPopoverProps | LocalInlineProps;
	export type ZDateTimePickerZonedProps = ZonedPopoverProps | ZonedInlineProps;
	export type ZDateTimePickerProps<
		TMode extends DateTimePickerMode = DateTimePickerMode,
		TPresentation extends PickerPresentation = PickerPresentation
	> = { readonly mode?: TMode; readonly presentation?: TPresentation } & (TMode extends 'zoned'
		? TPresentation extends 'inline'
			? ZonedInlineProps
			: ZonedPopoverProps
		: TPresentation extends 'inline'
			? LocalInlineProps
			: LocalPopoverProps);

	export const zuiMetadata = {
		bindings: [
			{
				description: 'mode判别的唯一CalendarDateTime或ZonedDateTime值。',
				name: 'value',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{
				description: '请求的Popover状态；disabled/readonly只关闭实际面板。',
				name: 'open',
				type: 'boolean'
			},
			{ description: '真实Picker根元素。', name: 'ref', type: 'HTMLDivElement | null' }
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
				description: '字段编辑、合法面板动作或清空改变唯一owner后调用。',
				name: 'onValueChange',
				type: '(value: CalendarDateTime | ZonedDateTime | null) => void'
			},
			{
				description: '仅面板确认、immediate面板动作或清空成功后调用。',
				name: 'onCommit',
				type: '(value: CalendarDateTime | ZonedDateTime | null) => void'
			},
			{
				description: 'Popover请求状态变化。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		id: 'date-time-picker',
		importStatement: "import { ZDateTimePicker } from '@zadmin/zui';",
		keyboard: [
			{ description: '复用DateTimeField完整分段键盘。', key: 'DateTimeField keys' },
			{ description: '复用Calendar与TimePickerPanel导航。', key: 'Panel arrows / Home / End' },
			{ description: '确认合法面板草稿；同值仍产生onCommit。', key: 'Enter / Confirm' },
			{ description: '关闭并丢弃未确认面板草稿。', key: 'Escape / Cancel' }
		],
		name: 'ZDateTimePicker',
		parts: [
			{ description: 'inline常驻面板，不创建Portal或dialog。', name: 'inline-panel' },
			{ description: '唯一DateTimeField及其内部InputGroup。', name: 'field' },
			{ description: '作为DateTimeField suffixAction的面板触发器。', name: 'trigger' },
			{ description: '作为DateTimeField suffixAction的清空动作。', name: 'clear' },
			{ description: '日期与时间共享草稿的Popover dialog。', name: 'content' },
			{ description: 'Calendar、TimePanel、presets和Now的共享面板。', name: 'panel' }
		],
		props: [
			{
				name: 'calendarHeader',
				default: 'undefined',
				type: 'Snippet<[CalendarHeaderContext]>',
				description: '传递给共享Calendar的header内容，导航仍由Calendar拥有。'
			},
			{
				name: 'dateCell',
				default: 'undefined',
				type: 'Snippet<[CalendarCellContext]>',
				description: '传递给共享Calendar的日期button内容，保留内部ARIA和键盘控制。'
			},
			{
				name: 'presentation',
				requiredWhen: "inline分支必须显式为'inline'；popover可省略",
				type: "'popover' | 'inline'",
				default: "'popover'",
				description:
					'显示方式；inline常驻并从类型上排除open/defaultOpen/onOpenChange/placement，复用同一值和提交策略。'
			},
			{
				default: "'local'",
				description: '判别本地或时区日期时间模型。',
				name: 'mode',
				requiredWhen: "zoned分支必须显式为'zoned'；local可省略",
				type: "'local' | 'zoned'"
			},
			{
				bindable: true,
				default: 'null',
				description: 'mode判别的唯一业务值。',
				name: 'value',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{
				default: 'null',
				description: '非受控初始值。',
				name: 'defaultValue',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{
				bindable: true,
				default: 'false',
				description: '独立Popover请求状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始Popover请求。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: "'confirm'",
				description: '只控制面板动作是延迟确认还是每次立即提交。',
				name: 'commitMode',
				type: "'confirm' | 'immediate'"
			},
			{
				default: 'today at midnight',
				description: '空owner的字段与面板参考值。',
				name: 'placeholderValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: "'minute'",
				description: '最小时间编辑单位。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '字段和面板的12或24小时制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{ default: '1', description: '分钟列和字段步长。', name: 'minuteStep', type: 'number' },
			{ default: '1', description: '秒列和字段步长。', name: 'secondStep', type: 'number' },
			{
				default: 'Provider locale',
				description: '字段、Calendar、时间列和文案locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: 'zoned显示、Now和空owner创建时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: "'compatible'",
				description: 'DST gap/fold解析策略。',
				name: 'disambiguation',
				type: "'compatible' | 'earlier' | 'later' | 'reject'"
			},
			{
				default: 'false',
				description: '隐藏zoned字段的显示时区缩写。',
				name: 'hideTimeZone',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: 'mode判别的最小完整值。',
				name: 'minValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: 'mode判别的最大完整值。',
				name: 'maxValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: '完整日期时间联合不可用谓词。',
				name: 'isDateTimeUnavailable',
				type: '(value: CalendarDateTime | ZonedDateTime) => boolean'
			},
			{
				default: '[]',
				description: 'mode判别的静态或惰性面板预设。',
				name: 'presets',
				type: 'readonly DateTimePickerPreset[]'
			},
			{ default: 'false', description: '显示当前时刻动作。', name: 'showNow', type: 'boolean' },
			{
				default: 'true',
				description: 'Calendar显示相邻月日期。',
				name: 'showOutsideDates',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: 'Calendar首日规则。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{ default: 'true', description: '有值时显示清空动作。', name: 'clearable', type: 'boolean' },
			{
				default: 'Field或false',
				description: '禁用字段、动作、面板和FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '保留提交与聚焦，阻止编辑、打开和清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '空值产生原生与草稿必填反馈。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field或false',
				description: '合并字段、面板与外部无效显示。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field name',
				description: '唯一ISO 8601 FormData名称。',
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
				default: "'bottom-start'",
				description: 'Popover逻辑方位。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: 'Provider dateTimePicker/input默认',
				description: '字段、动作、Calendar与时间列尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Field controlId或自动生成',
				description: 'DateTimeField首个日期segment id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.chooseDateTime',
				description: 'field group、trigger与dialog名称。',
				name: 'pickerLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.clearDateTime',
				description: '清空动作名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.common.confirm',
				description: '确认按钮文案。',
				name: 'confirmLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.common.close',
				description: '取消并丢弃草稿按钮文案。',
				name: 'cancelLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.calendarLabel',
				description: 'Calendar可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.previousMonth',
				description: '上月按钮名称。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.nextMonth',
				description: '下月按钮名称。',
				name: 'nextLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.unavailable',
				description: '无任何可用完整时间的文案。',
				name: 'noAvailableTimeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.dateTime.unavailable',
				description: '面板不可用或DST反馈文案。',
				name: 'invalidDateTimeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.now',
				description: 'Now动作文案。',
				name: 'nowLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time对应segment',
				description: '字段与面板时间segment名称。',
				name: 'segmentLabel',
				type: '(segment: TimeSegment) => string'
			},
			{
				default: 'Provider localePack.time.am/pm',
				description: '字段与面板day-period文案。',
				name: 'dayPeriodLabel',
				type: "(period: 'am' | 'pm') => string"
			},
			{
				default: 'Provider localePack.time.toggleDayPeriod',
				description: '字段与面板day-period操作名称。',
				name: 'toggleDayPeriodLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实Picker根元素。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'calendarHeader',
				type: 'Snippet<[CalendarHeaderContext]>',
				description: '日期面板页头内容。'
			},
			{
				name: 'dateCell',
				type: 'Snippet<[CalendarCellContext]>',
				description: '日期单元内部内容，不替换日期button。'
			}
		],
		source: 'ui/zui/src/components/input/ZDateTimePicker.svelte',
		states: [
			{
				description: '浮层状态或inline常驻呈现。',
				name: 'data-state',
				values: ['open', 'closed', 'inline']
			},
			{ description: '实际显示方式。', name: 'data-presentation', values: ['popover', 'inline'] },
			{ description: '当前唯一owner为空。', name: 'data-empty', values: ['true'] },
			{ description: '外部、字段或面板草稿无效。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式禁用。', name: 'data-disabled', values: ['true'] },
			{ description: 'Field或显式只读。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '值模型。', name: 'data-mode', values: ['local', 'zoned'] },
			{ description: '面板提交策略。', name: 'data-commit-mode', values: ['confirm', 'immediate'] }
		],
		status: 'experimental',
		summary: '以唯一DateTimeField、共享日期时间面板、独立open和mode判别值组合的DateTime Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script
	lang="ts"
	generics="TMode extends DateTimePickerMode = DateTimePickerMode, TPresentation extends PickerPresentation = PickerPresentation"
>
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import PickerInlineSurface from './PickerInlineSurface.svelte';
	import { resolvePickerPresentation } from '../../runtime/picker-presentation.js';
	import X from '@lucide/svelte/icons/x';
	import { Time, today, toCalendarDateTime, toZoned, type Calendar } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import {
		preserveCalendarOwner,
		resolveHourCycle,
		resolveOwnerCalendar
	} from '../../runtime/date.js';
	import { normalizeDateTimeModelValue } from '../../runtime/date-time.js';
	import {
		dateTimePickerValueAvailable,
		validateDateTimePickerConstraints,
		type DateTimePickerConstraints,
		type DateTimePickerPreset as RuntimeDateTimePickerPreset,
		type DateTimePickerValue
	} from '../../runtime/date-time-picker.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import { sameFormValue } from '../../runtime/form/form-value-equality.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import DateTimePickerPanel, {
		type DateTimePickerPanelController
	} from './DateTimePickerPanel.svelte';
	import ZDateTimeField, { type ZDateTimeFieldProps } from './ZDateTimeField.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		calendarLabel,
		calendarHeader,
		dateCell,
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
		dir,
		disabled: disabledProp = false,
		disambiguation = 'compatible',
		firstDayOfWeek,
		form,
		granularity = 'minute',
		hideTimeZone = false,
		hourCycle: hourCycleProp,
		invalid: invalidProp = false,
		invalidDateTimeLabel,
		isDateTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		mode = 'local' as TMode,
		name: nameProp,
		nextLabel,
		noAvailableTimeLabel,
		nowLabel,
		onCommit,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		pickerLabel,
		presentation = 'popover' as TPresentation,
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
		style,
		timeZone,
		toggleDayPeriodLabel,
		value = $bindable(),
		...rest
	}: ZDateTimePickerProps<TMode, TPresentation> = $props();
	const zui = useZui();
	const resolvedPresentation = $derived(resolvePickerPresentation(presentation));
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-time-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-field`);
	const triggerId = $derived(`${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCommitMode = $derived.by<DateTimePickerCommitMode>(() => {
		if (commitMode !== 'confirm' && commitMode !== 'immediate')
			throw new TypeError("ZDateTimePicker commitMode must be 'confirm' or 'immediate'.");
		return commitMode;
	});
	const resolvedHourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedExternalInvalid = $derived(invalidProp || (field?.invalid ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.dateTimePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedPickerLabel = $derived(pickerLabel ?? zui.localePack.dateTime.chooseDateTime);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.dateTime.clearDateTime);
	const resolvedConfirmLabel = $derived(confirmLabel ?? zui.localePack.common.confirm);
	const resolvedCancelLabel = $derived(
		cancelLabel ??
			(resolvedPresentation === 'inline'
				? zui.localePack.common.cancel
				: zui.localePack.common.close)
	);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.calendarLabel);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.date.previousMonth);
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.date.nextMonth);
	const resolvedNoAvailableTimeLabel = $derived(
		noAvailableTimeLabel ?? zui.localePack.dateTime.unavailable
	);
	const resolvedInvalidDateTimeLabel = $derived(
		invalidDateTimeLabel ?? zui.localePack.dateTime.unavailable
	);
	const resolvedNowLabel = $derived(nowLabel ?? zui.localePack.time.now);
	const resolvedToggleDayPeriodLabel = $derived(
		toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const normalizedDefaultValue = $derived(
		defaultValue === undefined
			? null
			: normalizeDateTimeModelValue(defaultValue, mode, 'ZDateTimePicker defaultValue')
	);
	const explicitPlaceholderValue = $derived.by<DateTimePickerValue | null>(() => {
		if (placeholderValue === undefined) return null;
		const normalized = normalizeDateTimeModelValue(
			placeholderValue,
			mode,
			'ZDateTimePicker placeholderValue'
		);
		if (!normalized) throw new TypeError('ZDateTimePicker placeholderValue cannot be null.');
		return normalized;
	});
	const constraints = $derived.by<DateTimePickerConstraints>(() => {
		const resolved: DateTimePickerConstraints = {
			disambiguation,
			granularity,
			hourCycle: resolvedHourCycle,
			isDateTimeUnavailable: isDateTimeUnavailable as
				((candidate: DateTimePickerValue) => boolean) | undefined,
			maxValue:
				maxValue === undefined
					? undefined
					: normalizeDateTimeModelValue(maxValue, mode, 'ZDateTimePicker maxValue')!,
			minValue:
				minValue === undefined
					? undefined
					: normalizeDateTimeModelValue(minValue, mode, 'ZDateTimePicker minValue')!,
			minuteStep,
			mode,
			secondStep,
			timeZone: resolvedTimeZone
		};
		validateDateTimePickerConstraints(resolved);
		return resolved;
	});
	let fieldRef = $state<HTMLDivElement | null>(null);
	let fieldController = $state<{ rollbackDraft(): void } | null>(null);
	let panelController = $state<DateTimePickerPanelController | null>(null);
	let fieldDraft = $state<FormControlDraftState>({ dirty: false, valid: true });
	let panelFieldDraft = $state<FormControlDraftState>({ dirty: false, valid: true });
	let panelDirty = $state(false);
	let immediateCommitCandidate: DateTimePickerValue | null = null;
	const valueState = createFormControlState<DateTimePickerValue | null>(
		{
			defaultValue: () => normalizedDefaultValue,
			draftState: () => inspectDraftState(),
			element: () => ref,
			normalizeModelValue: (candidate) =>
				normalizeDateTimeModelValue(candidate, mode, 'ZDateTimePicker'),
			onChange: () => onValueChange as ((next: DateTimePickerValue | null) => void) | undefined,
			owner: 'ZDateTimePicker',
			read: () => value,
			resetDraft,
			syncNative: syncFieldValue,
			write: (next) => (value = next as typeof value)
		},
		valueScope
	);
	let rememberedOwnerCalendar = $state.raw<Calendar | null>(
		untrack(
			() =>
				normalizeDateTimeModelValue(valueState.current, mode, 'ZDateTimePicker')?.calendar ??
				normalizedDefaultValue?.calendar ??
				explicitPlaceholderValue?.calendar ??
				null
		)
	);
	const configuredOwnerCalendar = $derived(
		currentValue()?.calendar ??
			normalizedDefaultValue?.calendar ??
			explicitPlaceholderValue?.calendar ??
			null
	);
	const ownerCalendar = $derived<Calendar>(
		configuredOwnerCalendar ?? rememberedOwnerCalendar ?? resolveOwnerCalendar()
	);
	const resolvedPlaceholderValue = $derived.by<DateTimePickerValue>(() => {
		const fallback = (() => {
			if (explicitPlaceholderValue) return explicitPlaceholderValue;
			const local = toCalendarDateTime(today(resolvedTimeZone), new Time(0));
			return mode === 'zoned' ? toZoned(local, resolvedTimeZone, disambiguation) : local;
		})();
		return preserveCalendarOwner(fallback, ownerCalendar);
	});
	let fieldValue = $state<DateTimePickerValue | null>(
		untrack(() => normalizeDateTimeModelValue(valueState.current, mode, 'ZDateTimePicker'))
	);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const panelVisible = $derived(
		resolvedPresentation === 'inline' ||
			(openState.current && !resolvedDisabled && !resolvedReadonly)
	);
	let panelValue = $state<DateTimePickerValue | null>(
		untrack(() => (panelVisible ? fieldValue : null))
	);
	const draftState = $derived.by<FormControlDraftState>(() => inspectDraftState());
	const resolvedInvalid = $derived(resolvedExternalInvalid || !draftState.valid);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const rootClass = $derived(
		zui.icss((s) => {
			s.minWidth.px(0);
			s.width._full;
			s.maxWidth._full;
			s._selector(
				'& > [data-slot="field"] > [data-slot="input-group"] > [data-slot="suffix-action"] > button',
				(s) => s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
			if (resolvedDisabled)
				s._selector(
					'& > [data-slot="field"] > [data-slot="input-group"] > [data-slot="suffix-action"] > button:disabled',
					(s) => s.opacity._opaque
				);
		})
	);
	const dateTimeFieldProps = $derived.by<ZDateTimeFieldProps>(() => {
		const common = {
			'aria-describedby': describedBy,
			'aria-label': ariaLabel ?? resolvedPickerLabel,
			'aria-labelledby': labelledBy,
			controlId,
			'data-slot': 'field',
			disabled: resolvedDisabled,
			dir: resolvedDirection,
			disambiguation,
			formParticipation: 'none' as const,
			granularity,
			hideTimeZone,
			hourCycle: resolvedHourCycle,
			invalid: resolvedInvalid,
			locale: resolvedLocale,
			minuteStep,
			onDraftChange: (next: FormControlDraftState) => (fieldDraft = next),
			onValueChange: updateFromField,
			readonly: resolvedReadonly,
			required: resolvedRequired,
			secondStep,
			size: resolvedSize,
			timeZone: resolvedTimeZone
		};
		if (mode === 'zoned') {
			const callback = constraints.isDateTimeUnavailable;
			return {
				...common,
				isDateTimeUnavailable: callback
					? (candidate: ZonedDateTime) => callback(candidate)
					: undefined,
				maxValue:
					constraints.maxValue === undefined
						? undefined
						: (normalizeDateTimeModelValue(
								constraints.maxValue,
								'zoned',
								'ZDateTimePicker field maxValue'
							) ?? undefined),
				minValue:
					constraints.minValue === undefined
						? undefined
						: (normalizeDateTimeModelValue(
								constraints.minValue,
								'zoned',
								'ZDateTimePicker field minValue'
							) ?? undefined),
				mode: 'zoned',
				placeholderValue: normalizeDateTimeModelValue(
					resolvedPlaceholderValue,
					'zoned',
					'ZDateTimePicker field placeholderValue'
				)!,
				value: normalizeDateTimeModelValue(fieldValue, 'zoned', 'ZDateTimePicker field value')
			};
		}
		const callback = constraints.isDateTimeUnavailable;
		return {
			...common,
			isDateTimeUnavailable: callback
				? (candidate: CalendarDateTime) => callback(candidate)
				: undefined,
			maxValue:
				constraints.maxValue === undefined
					? undefined
					: (normalizeDateTimeModelValue(
							constraints.maxValue,
							'local',
							'ZDateTimePicker field maxValue'
						) ?? undefined),
			minValue:
				constraints.minValue === undefined
					? undefined
					: (normalizeDateTimeModelValue(
							constraints.minValue,
							'local',
							'ZDateTimePicker field minValue'
						) ?? undefined),
			mode: 'local',
			placeholderValue: normalizeDateTimeModelValue(
				resolvedPlaceholderValue,
				'local',
				'ZDateTimePicker field placeholderValue'
			)!,
			value: normalizeDateTimeModelValue(fieldValue, 'local', 'ZDateTimePicker field value')
		};
	});

	function currentValue(): DateTimePickerValue | null {
		return normalizeDateTimeModelValue(valueState.current, mode, 'ZDateTimePicker');
	}

	function inspectDraftState(): FormControlDraftState {
		if (panelVisible && !panelFieldDraft.valid) return panelFieldDraft;
		if (!fieldDraft.valid) return fieldDraft;
		const candidate = panelDirty ? panelValue : currentValue();
		const requiredMissing = resolvedRequired && candidate === null;
		const available = !candidate || dateTimePickerValueAvailable(candidate, constraints);
		const valid = !requiredMissing && available;
		return Object.freeze({
			dirty: fieldDraft.dirty || panelDirty,
			message: valid
				? undefined
				: requiredMissing
					? zui.localePack.form.requiredValue
					: resolvedInvalidDateTimeLabel,
			valid
		});
	}

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function syncFieldValue(next = currentValue()): void {
		if (next) rememberedOwnerCalendar = next.calendar;
		fieldValue = next;
		fieldController?.rollbackDraft();
		fieldDraft = { dirty: false, valid: true };
	}

	function ownerCandidate(next: DateTimePickerValue | null): DateTimePickerValue | null {
		return next ? preserveCalendarOwner(next, ownerCalendar) : null;
	}

	function updateValue(next: DateTimePickerValue | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const owned = ownerCandidate(next);
		const accepted = valueState.setFromUser(owned) && sameFormValue(currentValue(), owned);
		if (!accepted) {
			syncFieldValue();
			panelValue = panelVisible ? currentValue() : null;
			panelDirty = false;
		}
		return accepted;
	}

	function updateFromField(next: DateTimePickerValue | null): void {
		// Stage the child projection before asking the canonical owner. A rejecting model can then
		// always project the old canonical value back, even though the unbound child already wrote
		// its own $bindable value during the same event.
		const owned = ownerCandidate(next);
		fieldValue = owned;
		if (!updateValue(owned)) return;
		if (panelVisible) {
			panelValue = currentValue();
			panelDirty = false;
		}
	}

	function updateFromPanel(next: DateTimePickerValue): void {
		const owned = ownerCandidate(next)!;
		panelValue = owned;
		panelDirty = true;
		if (resolvedCommitMode !== 'immediate' || !dateTimePickerValueAvailable(owned, constraints))
			return;
		if (!updateValue(owned)) {
			panelValue = currentValue();
			panelDirty = false;
			return;
		}
		panelDirty = false;
		const committed = currentValue();
		(onCommit as ((candidate: DateTimePickerValue | null) => void) | undefined)?.(committed);
		immediateCommitCandidate = committed;
		ownerMicrotask(() => {
			if (immediateCommitCandidate && sameFormValue(immediateCommitCandidate, committed))
				immediateCommitCandidate = null;
		});
	}

	function confirmPanel(next: DateTimePickerValue): void {
		const owned = ownerCandidate(next)!;
		if (
			resolvedCommitMode === 'immediate' &&
			immediateCommitCandidate &&
			sameFormValue(immediateCommitCandidate, owned)
		) {
			immediateCommitCandidate = null;
			panelDirty = false;
			setOpen(false);
			return;
		}
		if (!dateTimePickerValueAvailable(owned, constraints) || !updateValue(owned)) return;
		panelDirty = false;
		(onCommit as ((candidate: DateTimePickerValue | null) => void) | undefined)?.(currentValue());
		setOpen(false);
	}

	function setOpen(next: boolean): void {
		if (resolvedPresentation === 'inline') return;
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		openState.setFromUser(next);
	}

	function cancelPanel(): void {
		if (resolvedPresentation === 'popover') {
			setOpen(false);
			return;
		}
		panelValue = currentValue();
		panelDirty = false;
		immediateCommitCandidate = null;
		panelFieldDraft = { dirty: false, valid: true };
		panelController?.resetDraft();
	}

	function clear(): void {
		if (!updateValue(null)) return;
		panelDirty = false;
		panelValue = null;
		(onCommit as ((candidate: DateTimePickerValue | null) => void) | undefined)?.(null);
		setOpen(false);
		ownerMicrotask(() =>
			fieldRef
				?.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')
				?.focus({ preventScroll: true })
		);
	}

	function resetDraft(): void {
		syncFieldValue();
		panelDirty = false;
		immediateCommitCandidate = null;
		panelValue = panelVisible ? currentValue() : null;
		panelController?.resetDraft();
	}

	function resetFromForm(): void {
		valueState.reset();
		syncFieldValue();
		open = false;
		panelValue = resolvedPresentation === 'inline' ? currentValue() : null;
		panelDirty = false;
		immediateCommitCandidate = null;
		panelController?.resetDraft();
	}

	let observedOwner: DateTimePickerValue | null = null;
	let previouslyOpen = false;
	$effect(() => {
		const current = currentValue();
		const currentlyOpen = panelVisible;
		const ownerChanged = !sameFormValue(current, observedOwner);
		if (current) rememberedOwnerCalendar = current.calendar;
		if (ownerChanged) syncFieldValue(current);
		if (currentlyOpen && (!previouslyOpen || ownerChanged)) {
			panelValue = current;
			panelDirty = false;
		}
		if (!currentlyOpen && previouslyOpen) {
			panelValue = null;
			panelDirty = false;
			immediateCommitCandidate = null;
			panelFieldDraft = { dirty: false, valid: true };
		}
		observedOwner = current;
		previouslyOpen = currentlyOpen;
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			fieldRef
				?.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')
				?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet panel()}
	<DateTimePickerPanel
		{calendarHeader}
		{dateCell}
		calendarLabel={resolvedCalendarLabel}
		cancelLabel={resolvedCancelLabel}
		confirmLabel={resolvedConfirmLabel}
		{dayPeriodLabel}
		direction={resolvedDirection}
		disabled={resolvedDisabled}
		readonly={resolvedReadonly}
		disambiguation={constraints.disambiguation}
		{firstDayOfWeek}
		granularity={constraints.granularity}
		hourCycle={constraints.hourCycle}
		{idBase}
		invalidDateTimeLabel={resolvedInvalidDateTimeLabel}
		isDateTimeUnavailable={constraints.isDateTimeUnavailable}
		locale={resolvedLocale}
		maxValue={constraints.maxValue}
		minValue={constraints.minValue}
		minuteStep={constraints.minuteStep}
		{mode}
		nextLabel={resolvedNextLabel}
		noAvailableTimeLabel={resolvedNoAvailableTimeLabel}
		nowLabel={resolvedNowLabel}
		onCancel={cancelPanel}
		onConfirm={confirmPanel}
		onDraftChange={(next) => (panelFieldDraft = next)}
		onControllerChange={(controller) => (panelController = controller)}
		onValueChange={updateFromPanel}
		placeholderValue={resolvedPlaceholderValue}
		presets={presets as readonly RuntimeDateTimePickerPreset[]}
		previousLabel={resolvedPreviousLabel}
		secondStep={constraints.secondStep}
		{segmentLabel}
		{showNow}
		{showOutsideDates}
		size={resolvedSize}
		timeZone={resolvedTimeZone}
		toggleDayPeriodLabel={resolvedToggleDayPeriodLabel}
		value={panelValue}
	/>
{/snippet}

{#snippet actions()}
	{#if resolvedPresentation === 'popover'}
		<ZPopover modal={false} onOpenChange={setOpen} open={panelVisible} {placement} {triggerId}>
			<ZPopoverTrigger
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
				{@render panel()}
			</ZPopoverContent>
		</ZPopover>
	{/if}
	{#if clearable && currentValue()}
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
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={resolvedDirection}
	data-commit-mode={resolvedCommitMode}
	data-disabled={resolvedDisabled || undefined}
	data-empty={!currentValue() || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-mode={mode}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-presentation={resolvedPresentation}
	data-state={resolvedPresentation === 'inline' ? 'inline' : panelVisible ? 'open' : 'closed'}
>
	<ZDateTimeField
		{...dateTimeFieldProps}
		bind:this={fieldController}
		bind:ref={fieldRef}
		suffixAction={resolvedPresentation === 'popover' || (clearable && currentValue())
			? actions
			: undefined}
	/>
	{#if resolvedPresentation === 'inline'}
		<PickerInlineSurface label={resolvedPickerLabel} dir={resolvedDirection}>
			{@render panel()}
		</PickerInlineSurface>
	{/if}
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={currentValue()?.toString()}
/>
