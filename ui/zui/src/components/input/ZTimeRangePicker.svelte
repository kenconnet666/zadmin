<script module lang="ts">
	import { Time } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { TimeFieldGranularity, TimeFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimePickerDayPeriod } from '../../runtime/time-picker.js';
	import type {
		TimeRangeMode,
		TimeRangePart,
		TimeRangePickerPreset,
		TimeRangeValue
	} from '../../runtime/time-range.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	/* eslint-disable no-import-assign -- Type-only re-exports have no runtime writes; the Svelte scope analyzer marks their references as assignments. */
	export type {
		TimeRangeMode,
		TimeRangePickerPreset,
		TimeRangeValue
	} from '../../runtime/time-range.js';
	/* eslint-enable no-import-assign */
	export type TimeRangePickerGranularity = TimeFieldGranularity;

	export interface ZTimeRangePickerProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly allowEmpty?: boolean;
		readonly cancelLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly confirmLabel?: string;
		readonly controlId?: string;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: TimeRangeValue | null;
		readonly disabled?: boolean;
		readonly endLabel?: string;
		readonly form?: string;
		readonly granularity?: TimeRangePickerGranularity;
		readonly hourCycle?: 12 | 24;
		readonly invalidRangeLabel?: string;
		readonly invalidTimeLabel?: string;
		readonly invalid?: boolean;
		readonly isTimeUnavailable?: (
			value: Time,
			part: TimeRangePart,
			range: TimeRangeValue
		) => boolean;
		readonly locale?: string;
		readonly maxValue?: Time;
		readonly minValue?: Time;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly noAvailableTimeLabel?: string;
		readonly nowLabel?: string;
		readonly onCommit?: (value: TimeRangeValue | null) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: TimeRangeValue | null) => void;
		open?: boolean;
		readonly orderedRangeLabel?: string;
		readonly pickerLabel?: string;
		readonly placement?: PopoverPlacement;
		readonly presets?: readonly TimeRangePickerPreset[];
		readonly rangeMode?: TimeRangeMode;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly showNow?: boolean;
		readonly size?: ZControlSize;
		readonly startLabel?: string;
		readonly timeZone?: string;
		readonly toggleDayPeriodLabel?: string;
		value?: TimeRangeValue | null;
	}

	export const zuiMetadata = {
		bindings: [
			{
				description: '保留端点顺序且可表达start-only或end-only的唯一范围值。',
				name: 'value',
				type: 'TimeRangeValue | null'
			},
			{ description: '唯一Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实范围根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'ZTimeField',
			'TimePickerPanel',
			'ZInputGroup',
			'ZPopover',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '字段产生完整端点、清空或面板确认后唯一范围owner的变化。',
				name: 'onValueChange',
				type: '(value: TimeRangeValue | null) => void'
			},
			{
				description: '仅面板确认或根清空动作成功写入owner后触发；外部同步不触发。',
				name: 'onCommit',
				type: '(value: TimeRangeValue | null) => void'
			},
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		id: 'time-range-picker',
		importStatement: "import { ZTimeRangePicker } from '@zadmin/zui';",
		keyboard: [
			{ description: '分别复用两个TimeField的分段编辑。', key: 'TimeField keys' },
			{ description: '复用TimePickerPanel列键盘并确认整个草稿范围。', key: 'Panel keys / Enter' },
			{ description: '关闭、丢弃面板草稿并恢复trigger焦点。', key: 'Escape' }
		],
		name: 'ZTimeRangePicker',
		parts: [
			{ description: '两个时间字段与动作共享的InputGroup。', name: 'range-inputs' },
			{ description: '起始TimeField。', name: 'start-field' },
			{ description: '可访问性隐藏的范围分隔符。', name: 'separator' },
			{ description: '结束TimeField。', name: 'end-field' },
			{ description: '打开唯一范围面板的按钮。', name: 'trigger' },
			{ description: '直接清空唯一范围owner的按钮。', name: 'clear' },
			{
				description: '包含端点切换、range presets与共享TimePickerPanel的dialog。',
				name: 'content'
			},
			{ description: '切换当前面板端点的按钮组。', name: 'range-parts' },
			{ description: '只更新面板草稿的range preset组。', name: 'range-presets' },
			{ description: '丢弃面板草稿的显式取消按钮。', name: 'cancel' }
		],
		props: [
			{
				default: 'false',
				description: '是否允许确认start-only或end-only；值类型始终可表达partial。',
				name: 'allowEmpty',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.common.close',
				description: '丢弃面板草稿并关闭的按钮文案。',
				name: 'cancelLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.clearTimeRange',
				description: '根清空按钮的可访问名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: 'true',
				description: '有任一端点时显示根清空按钮。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.common.confirm',
				description: '确认整个面板草稿的按钮文案。',
				name: 'confirmLabel',
				type: 'string'
			},
			{
				default: '继承Field或自动生成',
				description: '起始TimeField首段id；结束字段派生独立id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.am/pm',
				description: '两个字段与面板共用的AM/PM可见文案。',
				name: 'dayPeriodLabel',
				type: "(period: 'am' | 'pm') => string"
			},
			{
				default: 'false',
				description: '非受控初始Popover状态；form reset时关闭。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'null',
				description: '非受控初始范围；不会交换逆序端点。',
				name: 'defaultValue',
				type: 'TimeRangeValue | null'
			},
			{
				default: 'Field context或false',
				description: '禁用字段、动作、面板与FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.time.endTime',
				description: '结束TimeField与面板端点按钮名称。',
				name: 'endLabel',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: '唯一FormValueBridge关联的form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: "'minute'",
				description: '两个字段与共享面板显示到小时、分钟或秒。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '两个字段与共享面板的12或24小时制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'Provider localePack.time.invalidRange',
				description: 'partial或联合范围不可用反馈。',
				name: 'invalidRangeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.invalidTime',
				description: '面板preset或Now产生不可用单端时间时的反馈。',
				name: 'invalidTimeLabel',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: '同步InputGroup、双TimeField与根ARIA无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '按端点与候选完整范围联合判断不可用时间。',
				name: 'isTimeUnavailable',
				type: "(value: Time, part: 'start' | 'end', range: TimeRangeValue) => boolean"
			},
			{
				default: 'Provider locale',
				description: '字段顺序、数字与hour cycle的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '两个端点共用的最晚墙上时间。',
				name: 'maxValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '两个端点共用的最早墙上时间。',
				name: 'minValue',
				type: 'Time'
			},
			{
				default: '1',
				description: '两个字段与面板分钟列的离散步进。',
				name: 'minuteStep',
				type: 'number'
			},
			{
				default: 'Field context或undefined',
				description: '只提交name.start与name.end两个ISO Time业务字段，partial时只提交存在端点。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.noAvailableTime',
				description: '当前端点没有联合合法时间时的状态文案。',
				name: 'noAvailableTimeLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'showNow启用后的当前时间按钮文案，不控制按钮可见性。',
				name: 'nowLabel',
				type: 'string'
			},
			{
				default: 'false',
				description: '是否显示为当前端点取Now的动作。',
				name: 'showNow',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '面板确认或根清空成功后的业务提交回调。',
				name: 'onCommit',
				type: '(value: TimeRangeValue | null) => void'
			},
			{
				default: 'undefined',
				description: '唯一Popover用户状态回调。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			},
			{
				default: 'undefined',
				description: '唯一范围owner的用户值变化回调。',
				name: 'onValueChange',
				type: '(value: TimeRangeValue | null) => void'
			},
			{
				bindable: true,
				default: 'false',
				description:
					'请求的Popover状态；disabled/readonly期间实际隐藏，解除后仍遵循该值，不伪造用户回调。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.time.orderedRange',
				description: 'ordered模式逆序草稿的反馈文案。',
				name: 'orderedRangeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.chooseTimeRange',
				description: '范围group、trigger与dialog的后备可访问名称。',
				name: 'pickerLabel',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Popover逻辑首选方位；RTL由Floating解析。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: '[]',
				description: '惰性或静态完整范围preset；点击只改面板草稿，确认后才提交。',
				name: 'presets',
				type: 'readonly TimeRangePickerPreset[]'
			},
			{
				default: "'ordered'",
				description: 'ordered拒绝end < start；overnight接受且明确解释为跨午夜；两者都不交换端点。',
				name: 'rangeMode',
				type: "'ordered' | 'overnight'"
			},
			{
				default: 'Field context或false',
				description: '字段保持可聚焦和值提交，范围动作与面板停用。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实范围根节点引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			},
			{
				default: 'Field context或false',
				description: '要求两个端点完整；双TimeField投射原生required。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '1',
				description: '两个字段与面板秒列的离散步进。',
				name: 'secondStep',
				type: 'number'
			},
			{
				default: 'Provider localePack.time segment labels',
				description: '覆盖两个字段与面板的小时、分钟、秒名称。',
				name: 'segmentLabel',
				type: '(segment: TimeFieldSegment) => string'
			},
			{
				default: 'Field > componentDefaults.timeRangePicker > input > density',
				description: '统一双TimeField、面板和动作尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Provider localePack.time.startTime',
				description: '起始TimeField与面板端点按钮名称。',
				name: 'startLabel',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: 'Now动作解析所用IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.toggleDayPeriod',
				description: '两个字段与面板AM/PM切换名称。',
				name: 'toggleDayPeriodLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '唯一范围值；null为空，partial端点始终可受控表达。',
				name: 'value',
				type: 'TimeRangeValue | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimeRangePicker.svelte',
		states: [
			{ description: '当前面板编辑端点。', name: 'data-range-part', values: ['start', 'end'] },
			{
				description: 'overnight模式下当前完整范围跨午夜。',
				name: 'data-overnight',
				values: ['true']
			},
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{
				description: '完整范围、partial或null。',
				name: 'data-range-state',
				values: ['complete', 'partial', 'empty']
			},
			{
				description: '解析后五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '显式、Field或内在draft无效。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'以唯一范围owner、双TimeField、共享TimePickerPanel和显式ordered/overnight语义实现的时间范围选择器。'
	} as const satisfies ZuiComponentMetadata;

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
	for (const recipe of [panelHeaderRecipe, feedbackRecipe]) registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy } from 'svelte';
	import { formatTime, resolveHourCycle, timeFieldPattern } from '../../runtime/date.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
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
	import {
		initialTimePickerReference,
		type TimePickerConstraints
	} from '../../runtime/time-picker.js';
	import {
		isOvernightTimeRange,
		normalizeTimeRangeModelValue,
		replaceTimeRangePart,
		resolveTimeRangePreset,
		sameTimeRangeValue,
		timeRangeEndpointAvailable,
		validateTimeRangeValue,
		type TimeRangeConstraints
	} from '../../runtime/time-range.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import TimePickerPanel, { type TimePickerPanelController } from './TimePickerPanel.svelte';
	import ZInputGroup from './ZInputGroup.svelte';
	import ZTimeField from './ZTimeField.svelte';

	type DraftController = { rollbackDraft(): void };

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowEmpty = false,
		cancelLabel,
		class: className,
		clearLabel,
		clearable = true,
		confirmLabel,
		controlId: controlIdProp,
		dayPeriodLabel,
		defaultOpen = false,
		defaultValue,
		dir,
		disabled: disabledProp = false,
		endLabel,
		form,
		granularity = 'minute',
		hourCycle: hourCycleProp,
		invalid,
		invalidRangeLabel,
		invalidTimeLabel,
		isTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		name: nameProp,
		noAvailableTimeLabel,
		nowLabel,
		onCommit,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		orderedRangeLabel,
		pickerLabel,
		placement = 'bottom-start',
		presets = [],
		rangeMode = 'ordered',
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		secondStep = 1,
		segmentLabel,
		showNow = false,
		size,
		startLabel,
		timeZone,
		toggleDayPeriodLabel,
		value = $bindable(),
		...rest
	}: ZTimeRangePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'time-range-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-start`);
	const triggerId = $derived(`${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
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
				zui.componentDefaults.timeRangePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedPickerLabel = $derived(pickerLabel ?? zui.localePack.time.chooseTimeRange);
	const resolvedStartLabel = $derived(startLabel ?? zui.localePack.time.startTime);
	const resolvedEndLabel = $derived(endLabel ?? zui.localePack.time.endTime);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.time.clearTimeRange);
	const resolvedConfirmLabel = $derived(confirmLabel ?? zui.localePack.common.confirm);
	const resolvedCancelLabel = $derived(cancelLabel ?? zui.localePack.common.close);
	const resolvedInvalidTimeLabel = $derived(invalidTimeLabel ?? zui.localePack.time.invalidTime);
	const resolvedInvalidRangeLabel = $derived(invalidRangeLabel ?? zui.localePack.time.invalidRange);
	const resolvedOrderedRangeLabel = $derived(orderedRangeLabel ?? zui.localePack.time.orderedRange);
	const resolvedNoAvailableTimeLabel = $derived(
		noAvailableTimeLabel ?? zui.localePack.time.noAvailableTime
	);
	const resolvedNowLabel = $derived(nowLabel ?? zui.localePack.time.now);
	const resolvedToggleDayPeriodLabel = $derived(
		toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const rangeConstraints = $derived<TimeRangeConstraints>({
		allowEmpty,
		isTimeUnavailable,
		maxValue,
		minValue,
		rangeMode
	});
	let startFieldRef = $state<HTMLDivElement | null>(null);
	let endFieldRef = $state<HTMLDivElement | null>(null);
	let startFieldController = $state<DraftController | null>(null);
	let endFieldController = $state<DraftController | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let panelController = $state<TimePickerPanelController | null>(null);
	let startFieldValue = $state<Time | null>(null);
	let endFieldValue = $state<Time | null>(null);
	let startDraftState = $state<FormControlDraftState>({ dirty: false, valid: true });
	let endDraftState = $state<FormControlDraftState>({ dirty: false, valid: true });
	let panelDraft = $state<TimeRangeValue | null>(null);
	let panelDirty = $state(false);
	let panelFeedback = $state('');
	let panelFeedbackRevision = $state(0);
	let rangePart = $state<TimeRangePart>('start');

	const valueState = createFormControlState<TimeRangeValue | null>(
		{
			defaultValue: () => normalizeTimeRangeModelValue(defaultValue),
			draftState: () => inspectDraftState(),
			element: () => ref,
			normalizeModelValue: (candidate) => normalizeTimeRangeModelValue(candidate),
			onChange: () => onValueChange,
			owner: 'ZTimeRangePicker',
			read: () => value,
			resetToInitialValue: true,
			resetDraft: () => resetDraft(),
			syncNative: (next) => syncFieldValues(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	const normalizedValue = $derived(normalizeTimeRangeModelValue(valueState.current));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const ownerValidation = $derived(validateTimeRangeValue(normalizedValue, rangeConstraints));
	const resolvedInvalid = $derived(
		(invalid ?? field?.invalid ?? false) ||
			!ownerValidation.valid ||
			!startDraftState.valid ||
			!endDraftState.valid
	);
	const activePanelValue = $derived(panelDraft?.[rangePart] ?? null);
	const activePanelConstraints = $derived(createPanelConstraints(rangePart, panelDraft));
	const formEntries = $derived<readonly FormValueEntry[]>(
		resolvedName
			? [
					[`${resolvedName}.start`, normalizedValue?.start?.toString()],
					[`${resolvedName}.end`, normalizedValue?.end?.toString()]
				]
			: []
	);
	const rangeState = $derived(
		!normalizedValue
			? 'empty'
			: normalizedValue.start && normalizedValue.end
				? 'complete'
				: 'partial'
	);
	const rootClass = $derived(
		zui.icss((s) => {
			s._selector('& > [data-slot="range-inputs"]', (s) => s.flexWrap.wrap);
			s._selector('& > [data-slot="range-inputs"] > [data-slot="suffix-action"] > button', (s) =>
				s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
			if (resolvedDisabled)
				s._selector(
					'& > [data-slot="range-inputs"] > [data-slot="suffix-action"] > button:disabled',
					(s) => s.opacity._opaque
				);
		})
	);
	const panelHeaderClass = $derived(zui.recipe(panelHeaderRecipe));
	const feedbackClass = $derived(zui.recipe(feedbackRecipe));

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function createPanelConstraints(
		part: TimeRangePart,
		draft: TimeRangeValue | null
	): TimePickerConstraints {
		return {
			granularity,
			hourCycle: resolvedHourCycle,
			isTimeUnavailable: (candidate) =>
				!timeRangeEndpointAvailable(candidate, part, draft, rangeConstraints),
			maxValue,
			minValue,
			minuteStep,
			secondStep
		};
	}

	function inspectDraftState(): FormControlDraftState {
		const child = !startDraftState.valid
			? startDraftState
			: !endDraftState.valid
				? endDraftState
				: null;
		if (child) return child;
		const inspected = validateTimeRangeValue(
			panelDirty ? panelDraft : normalizedValue,
			rangeConstraints
		);
		const requiredMissing =
			resolvedRequired &&
			!(panelDirty
				? panelDraft?.start && panelDraft.end
				: normalizedValue?.start && normalizedValue.end);
		const valid = inspected.valid && !requiredMissing;
		return Object.freeze({
			dirty: startDraftState.dirty || endDraftState.dirty || panelDirty,
			message: valid
				? undefined
				: requiredMissing
					? zui.localePack.form.requiredValue
					: inspected.reason === 'order'
						? resolvedOrderedRangeLabel
						: resolvedInvalidRangeLabel,
			valid
		});
	}

	function updateValue(next: TimeRangeValue | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted = valueState.setFromUser(next) && sameTimeRangeValue(valueState.current, next);
		if (!accepted) syncFieldValues();
		return accepted;
	}

	function editableRange(
		part: TimeRangePart,
		next: Time | null
	): TimeRangeValue | null | undefined {
		const candidate = replaceTimeRangePart(normalizedValue, part, next);
		if (next && !timeRangeEndpointAvailable(next, part, normalizedValue, rangeConstraints))
			return undefined;
		return candidate;
	}

	function updateFromField(part: TimeRangePart, next: Time | null): void {
		const candidate = editableRange(part, next);
		if (candidate === undefined || !updateValue(candidate)) {
			syncFieldValues();
			return;
		}
		if (resolvedOpen) {
			panelDraft = candidate;
			panelDirty = false;
		}
	}

	function syncFieldValues(next = normalizedValue): void {
		startFieldController?.rollbackDraft();
		endFieldController?.rollbackDraft();
		startFieldValue = next?.start ?? null;
		endFieldValue = next?.end ?? null;
		syncFieldInputs(startFieldRef, startFieldValue);
		syncFieldInputs(endFieldRef, endFieldValue);
	}

	function syncFieldInputs(root: HTMLElement | null, next: Time | null): void {
		const segments = timeFieldPattern(resolvedLocale, resolvedHourCycle, granularity).flatMap(
			(part) => ('segment' in part ? [part.segment] : [])
		);
		for (const [index, segment] of segments.entries()) {
			let raw =
				segment === 'hour' ? next?.hour : segment === 'minute' ? next?.minute : next?.second;
			if (raw !== undefined && segment === 'hour' && resolvedHourCycle === 12) raw = raw % 12 || 12;
			const input = root?.querySelectorAll<HTMLInputElement>('input')[index];
			if (input) input.value = raw === undefined ? '' : String(raw).padStart(2, '0');
		}
	}

	function seedPanelPart(part: TimeRangePart, draft: TimeRangeValue | null): TimeRangeValue | null {
		if (draft?.[part]) return draft;
		const reference = initialTimePickerReference(null, createPanelConstraints(part, draft));
		return reference ? replaceTimeRangePart(draft, part, reference) : draft;
	}

	function beginPanel(next: TimeRangeValue | null): void {
		rangePart = next?.start && !next.end ? 'end' : next?.end && !next.start ? 'start' : 'start';
		panelDraft = seedPanelPart(rangePart, next);
		panelDirty = false;
		panelFeedback = '';
	}

	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		openState.setFromUser(next);
	}

	function selectRangePart(part: TimeRangePart): void {
		if (resolvedDisabled || resolvedReadonly) return;
		rangePart = part;
		panelDraft = seedPanelPart(part, panelDraft);
		panelFeedback = '';
		ownerMicrotask(() => panelController?.focusFirst());
	}

	function updatePanelPart(next: Time): void {
		panelDraft = replaceTimeRangePart(panelDraft, rangePart, next);
		panelDirty = true;
		panelFeedback = '';
	}

	function announceInvalidRange(reason?: 'order'): void {
		panelFeedback = reason === 'order' ? resolvedOrderedRangeLabel : resolvedInvalidRangeLabel;
		panelFeedbackRevision += 1;
	}

	function confirmPanel(next: Time): void {
		const candidate = replaceTimeRangePart(panelDraft, rangePart, next);
		const validation = validateTimeRangeValue(candidate, rangeConstraints);
		if (!validation.valid) {
			if (validation.reason === 'partial' && candidate) {
				selectRangePart(candidate.start ? 'end' : 'start');
				return;
			}
			announceInvalidRange(validation.reason === 'order' ? 'order' : undefined);
			return;
		}
		if (!updateValue(candidate)) return;
		onCommit?.(candidate);
		setOpen(false);
	}

	function chooseRangePreset(preset: TimeRangePickerPreset): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const candidate = resolveTimeRangePreset(preset, rangeConstraints);
		if (candidate === undefined) {
			announceInvalidRange();
			return;
		}
		panelDraft = candidate;
		panelDirty = true;
		panelFeedback = '';
		rangePart = candidate?.start && !candidate.end ? 'end' : 'start';
	}

	function clear(): void {
		if (!updateValue(null)) return;
		onCommit?.(null);
		setOpen(false);
		ownerMicrotask(() =>
			startFieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}

	function resetFromForm(): void {
		valueState.reset();
		syncFieldValues();
		open = false;
		panelDraft = null;
		panelDirty = false;
		panelFeedback = '';
		rangePart = 'start';
	}

	function resetDraft(): void {
		syncFieldValues(normalizedValue);
		startDraftState = { dirty: false, valid: true };
		endDraftState = { dirty: false, valid: true };
		panelDirty = false;
		panelFeedback = '';
		panelDraft = resolvedOpen ? seedPanelPart(rangePart, normalizedValue) : null;
	}

	function endpointDisplay(part: TimeRangePart): string {
		const endpoint = panelDraft?.[part];
		return endpoint
			? formatTime(endpoint, resolvedLocale, {
					hour: 'numeric',
					hourCycle: resolvedHourCycle === 12 ? 'h12' : 'h23',
					minute: granularity === 'hour' ? undefined : '2-digit',
					second: granularity === 'second' ? '2-digit' : undefined
				})
			: part === 'start'
				? resolvedStartLabel
				: resolvedEndLabel;
	}

	let observedOwner: TimeRangeValue | null = null;
	let previouslyOpen = false;
	$effect(() => {
		const current = normalizedValue;
		const currentlyOpen = resolvedOpen;
		const ownerChanged = !sameTimeRangeValue(current, observedOwner);
		if (ownerChanged) syncFieldValues(current);
		if (currentlyOpen && (!previouslyOpen || ownerChanged)) beginPanel(current);
		if (!currentlyOpen && previouslyOpen) {
			panelDraft = null;
			panelDirty = false;
			panelFeedback = '';
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
			<Clock3 aria-hidden="true" size="1em" />
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
				>
					{resolvedStartLabel}: {endpointDisplay('start')}
				</ZButton>
				<ZButton
					aria-pressed={rangePart === 'end'}
					onclick={() => selectRangePart('end')}
					size={resolvedSize}
					variant={rangePart === 'end' ? 'solid' : 'outline'}
				>
					{resolvedEndLabel}: {endpointDisplay('end')}
				</ZButton>
			</div>
			{#if presets.length > 0}
				<div
					aria-label={resolvedPickerLabel}
					class={panelHeaderClass}
					data-slot="range-presets"
					role="group"
				>
					{#each presets as preset, index (`${index}:${preset.label}`)}
						<ZButton onclick={() => chooseRangePreset(preset)} size={resolvedSize} variant="outline"
							>{preset.label}</ZButton
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
			<TimePickerPanel
				cancelLabel={resolvedCancelLabel}
				confirmLabel={resolvedConfirmLabel}
				constraints={activePanelConstraints}
				{dayPeriodLabel}
				disabled={resolvedDisabled || resolvedReadonly}
				direction={resolvedDirection}
				idBase={`${idBase}-${rangePart}`}
				invalidTimeLabel={resolvedInvalidTimeLabel}
				locale={resolvedLocale}
				noAvailableTimeLabel={resolvedNoAvailableTimeLabel}
				nowLabel={showNow ? resolvedNowLabel : undefined}
				onCancel={() => setOpen(false)}
				onConfirm={confirmPanel}
				onControllerChange={(controller) => (panelController = controller)}
				onValueChange={updatePanelPart}
				{segmentLabel}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				toggleDayPeriodLabel={resolvedToggleDayPeriodLabel}
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
	class={[rootClass, className]}
	dir={resolvedDirection}
	role="group"
	aria-label={labelledBy ? undefined : (ariaLabel ?? resolvedPickerLabel)}
	aria-labelledby={labelledBy}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-overnight={isOvernightTimeRange(normalizedValue, rangeMode) || undefined}
	data-range-part={rangePart}
	data-range-state={rangeState}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZInputGroup
		data-slot="range-inputs"
		disabled={resolvedDisabled}
		dir={resolvedDirection}
		invalid={resolvedInvalid}
		readonly={resolvedReadonly}
		required={resolvedRequired}
		size={resolvedSize}
		suffixAction={actions}
	>
		<ZTimeField
			bind:this={startFieldController}
			data-slot="start-field"
			aria-describedby={describedBy}
			aria-label={resolvedStartLabel}
			appearance="bare"
			bind:ref={startFieldRef}
			bind:value={startFieldValue}
			{controlId}
			{dayPeriodLabel}
			disabled={resolvedDisabled}
			dir={resolvedDirection}
			formParticipation="none"
			{granularity}
			hourCycle={resolvedHourCycle}
			invalid={resolvedInvalid}
			isTimeUnavailable={(candidate) =>
				!timeRangeEndpointAvailable(candidate, 'start', normalizedValue, rangeConstraints)}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			{minuteStep}
			onDraftChange={(state) => (startDraftState = state)}
			onValueChange={(next) => updateFromField('start', next)}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			{secondStep}
			{segmentLabel}
			size={resolvedSize}
			{toggleDayPeriodLabel}
		/>
		<span aria-hidden="true" data-slot="separator">–</span>
		<ZTimeField
			bind:this={endFieldController}
			data-slot="end-field"
			aria-describedby={describedBy}
			aria-label={resolvedEndLabel}
			appearance="bare"
			bind:ref={endFieldRef}
			bind:value={endFieldValue}
			controlId={`${controlId}-end`}
			{dayPeriodLabel}
			disabled={resolvedDisabled}
			dir={resolvedDirection}
			formParticipation="none"
			{granularity}
			hourCycle={resolvedHourCycle}
			invalid={resolvedInvalid}
			isTimeUnavailable={(candidate) =>
				!timeRangeEndpointAvailable(candidate, 'end', normalizedValue, rangeConstraints)}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			{minuteStep}
			onDraftChange={(state) => (endDraftState = state)}
			onValueChange={(next) => updateFromField('end', next)}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			{secondStep}
			{segmentLabel}
			size={resolvedSize}
			{toggleDayPeriodLabel}
		/>
	</ZInputGroup>
</div>
<FormValueBridge disabled={resolvedDisabled} entries={formEntries} {form} onReset={resetFromForm} />
