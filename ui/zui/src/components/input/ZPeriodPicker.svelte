<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PeriodCalendarOptions } from './ZPeriodCalendar.svelte';
	import type {
		PeriodKind,
		PeriodSelectionMode,
		PeriodSelectionValue
	} from '../../runtime/period.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	export type PeriodPickerCommitMode = 'immediate' | 'confirm';
	export type ZPeriodPickerProps<
		TKind extends PeriodKind = PeriodKind,
		TMode extends PeriodSelectionMode = 'single'
	> = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onchange'> &
		Omit<PeriodCalendarOptions<TKind, TMode>, 'formParticipation'> & {
			readonly cancelLabel?: string;
			readonly clearable?: boolean;
			readonly clearLabel?: string;
			readonly closeOnSelect?: boolean;
			readonly commitMode?: PeriodPickerCommitMode;
			readonly confirmLabel?: string;
			readonly controlId?: string;
			readonly defaultOpen?: boolean;
			readonly formatter?: (value: PeriodSelectionValue<TKind, TMode>) => string;
			readonly onCommit?: (value: PeriodSelectionValue<TKind, TMode>) => void;
			readonly onOpenChange?: (open: boolean) => void;
			open?: boolean;
			readonly pickerLabel?: string;
			readonly placement?: PopoverPlacement;
			readonly placeholder?: string;
		};

	export const zuiMetadata = {
		id: 'period-picker',
		name: 'ZPeriodPicker',
		category: 'input',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/input/ZPeriodPicker.svelte',
		importStatement: "import { ZPeriodPicker } from '@zadmin/zui';",
		summary:
			'用同一PeriodCalendar与Popover选择月份、年份、季度或周，支持单选、多选和范围，保持明确周期值与唯一表单owner。',
		dependencies: [
			'ZPeriodCalendar',
			'Period runtime',
			'ZInputGroup',
			'ZPopover',
			'FormControlState',
			'FormValueBridge'
		],
		bindings: [
			{
				name: 'value',
				type: 'PeriodSelectionValue<TKind,TMode>',
				description: '由granularity与selectionMode判别的唯一周期选择。'
			},
			{
				name: 'focusedValue',
				type: 'PeriodOfKind<TKind>',
				description: '独立于选择的面板焦点周期。'
			},
			{ name: 'open', type: 'boolean', description: '请求的浮层打开状态。' },
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实Picker根元素。' }
		],
		events: [
			{
				name: 'onValueChange',
				type: '(value: PeriodSelectionValue<TKind,TMode>) => void',
				description: '用户选择或清空产生的新选择；immediate范围首端也可报告partial。'
			},
			{
				name: 'onCommit',
				type: '(value: PeriodSelectionValue<TKind,TMode>) => void',
				description: '即时完整选择、显式确认或清空成功后的提交；外部同步/reset不触发。'
			},
			{ name: 'onOpenChange', type: '(open:boolean)=>void', description: '用户请求改变打开状态。' },
			{
				name: 'onFocusedValueChange',
				type: '(period: PeriodOfKind<TKind>)=>void',
				description: '面板导航焦点变化。'
			}
		],
		props: [
			{
				name: 'controlId',
				type: 'string',
				default: 'Field controlId或自动生成',
				description: '唯一trigger的DOM id，用于外部label和ARIA关联。'
			},
			{
				name: 'granularity',
				type: 'TKind',
				required: true,
				default: '无',
				description: 'month/year/quarter/week；值记录的kind必须匹配。'
			},
			{
				name: 'selectionMode',
				type: 'TMode',
				default: "'single'",
				requiredWhen: 'multiple/range分支必须显式设置；single可省略',
				description: '选择单个周期、去重保序的多个周期或nullable端点范围。'
			},
			{
				name: 'value',
				type: 'PeriodSelectionValue<TKind,TMode>',
				default: 'single/range为null；multiple为[]',
				bindable: true,
				description: '唯一选择值，保留周规则和财年起点。'
			},
			{
				name: 'defaultValue',
				type: 'PeriodSelectionValue<TKind,TMode>',
				default: 'single/range为null；multiple为[]',
				description: '非受控初值；form reset恢复。'
			},
			{
				name: 'focusedValue',
				type: 'PeriodOfKind<TKind>',
				default: '所选周期或当前周期',
				bindable: true,
				description: '独立面板焦点；导航不等于选择。'
			},
			{
				name: 'defaultFocusedValue',
				type: 'PeriodOfKind<TKind>',
				default: '所选周期或当前周期',
				description: '面板首次打开的默认焦点周期。'
			},
			{
				name: 'minValue',
				type: 'PeriodOfKind<TKind>',
				default: 'undefined',
				description: '最早可选周期，必须同kind和规则。'
			},
			{
				name: 'maxValue',
				type: 'PeriodOfKind<TKind>',
				default: 'undefined',
				description: '最晚可选周期，必须同kind和规则。'
			},
			{
				name: 'isPeriodUnavailable',
				type: '(period:PeriodOfKind<TKind>)=>boolean',
				default: 'undefined',
				description: '周期不可用谓词；范围可按连续性策略检查内部周期。'
			},
			{
				name: 'allowEmpty',
				type: 'boolean',
				default: 'false',
				description: 'range模式允许只有一个端点的有效范围；partial值始终可表达。'
			},
			{
				name: 'allowNonContiguousRange',
				type: 'boolean',
				default: 'false',
				description: 'range模式是否允许跨过不可用的内部周期。'
			},
			{
				name: 'weekRules',
				type: 'WeekRules',
				default: '已有值规则或locale推导',
				description: 'week模式的周起始日和首周最少天数；显式配置不可与值冲突。'
			},
			{
				name: 'fiscalYearStartMonth',
				type: 'number',
				default: '已有quarter值规则或1',
				description: 'quarter模式财年起始月，year为该财年的起始年份。'
			},
			{
				name: 'showWeekNumbers',
				type: 'boolean',
				default: 'false',
				description: 'week模式显示具名周号提示。'
			},
			{
				name: 'locale',
				type: 'string',
				default: 'Provider locale',
				description: '显示格式与空值时的默认周规则。'
			},
			{
				name: 'timeZone',
				type: 'string',
				default: 'Provider timeZone',
				description: '计算当前周期和显示日期的IANA时区。'
			},
			{
				name: 'size',
				type: 'ZControlSize',
				default: 'Field > periodPicker > input > density',
				description: '触发区、操作与Calendar统一五档尺寸。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'Field或false',
				description: '禁用整组并退出FormData。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: 'Field或false',
				description: '保留焦点和表单值，阻止打开、修改与清空。'
			},
			{
				name: 'required',
				type: 'boolean',
				default: 'Field或false',
				description: '空选择是内在无效状态，不禁止用户清空。'
			},
			{
				name: 'invalid',
				type: 'boolean',
				default: 'Field或false',
				description: '外部错误与内在选择有效性共同投射到触发区。'
			},
			{
				name: 'name',
				type: 'string',
				default: 'Field或undefined',
				description: 'single为一项、multiple同名重复、range为name.start/name.end。'
			},
			{
				name: 'form',
				type: 'string',
				default: '最近祖先form',
				description: '唯一FormValueBridge关联form。'
			},
			{
				name: 'open',
				type: 'boolean',
				default: 'false',
				bindable: true,
				description: '请求状态；disabled/readonly期间抑制显示，不伪造用户回调。'
			},
			{
				name: 'defaultOpen',
				type: 'boolean',
				default: 'false',
				description: '非受控初始打开状态，form reset关闭。'
			},
			{
				name: 'commitMode',
				type: 'PeriodPickerCommitMode',
				default: "'immediate'",
				description: '周期单元原子选择默认立即写入；confirm模式可先多次编辑面板草稿。'
			},
			{
				name: 'closeOnSelect',
				type: 'boolean',
				default: 'single/range为true；multiple为false',
				description: '即时选择完成后是否关闭；range首端保持打开。'
			},
			{
				name: 'clearable',
				type: 'boolean',
				default: 'true',
				description: '有值时显示独立清空操作。'
			},
			{
				name: 'formatter',
				type: '(value:PeriodSelectionValue<TKind,TMode>)=>string',
				default: 'formatPeriod组合',
				description: '自定义触发器的可见值，不改变数据或序列化。'
			},
			{
				name: 'placeholder',
				type: 'string',
				default: 'localePack.period.choosePeriod',
				description: '空选择的触发器文字。'
			},
			{
				name: 'pickerLabel',
				type: 'string',
				default: 'localePack.period.choosePeriod',
				description: 'Picker和浮层后备名称。'
			},
			{
				name: 'calendarLabel',
				type: 'string',
				default: 'localePack.period.calendarLabel',
				description: '内部Calendar的可访问名称。'
			},
			{
				name: 'clearLabel',
				type: 'string',
				default: 'localePack.period.clearPeriod',
				description: '清空按钮名称。'
			},
			{
				name: 'confirmLabel',
				type: 'string',
				default: 'localePack.common.confirm',
				description: '确认面板草稿的操作文字。'
			},
			{
				name: 'cancelLabel',
				type: 'string',
				default: 'localePack.common.close',
				description: '放弃尚未提交面板草稿并关闭。'
			},
			{
				name: 'previousPageLabel',
				type: 'string',
				default: 'localePack.period.previousPage',
				description: '前一个周期面板页。'
			},
			{
				name: 'nextPageLabel',
				type: 'string',
				default: 'localePack.period.nextPage',
				description: '后一个周期面板页。'
			},
			{
				name: 'placement',
				type: 'PopoverPlacement',
				default: "'bottom-start'",
				description: '复用Popover定位、Portal、边缘限制和动画。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实Picker根引用。'
			},
			{
				name: 'onValueChange',
				type: '(value:PeriodSelectionValue<TKind,TMode>)=>void',
				default: 'undefined',
				description: '用户改变选择后的回调；不由外部写值或reset伪造。'
			},
			{
				name: 'onCommit',
				type: '(value:PeriodSelectionValue<TKind,TMode>)=>void',
				default: 'undefined',
				description: '完整即时选择、确认或清空成功后触发。'
			},
			{
				name: 'onOpenChange',
				type: '(open:boolean)=>void',
				default: 'undefined',
				description: '用户打开或关闭请求。'
			},
			{
				name: 'onFocusedValueChange',
				type: '(period:PeriodOfKind<TKind>)=>void',
				default: 'undefined',
				description: '内部Calendar焦点变化。'
			}
		],
		snippets: [],
		parts: [
			{ name: 'trigger', description: '承载当前周期文本的唯一触发按钮。' },
			{ name: 'clear', description: '独立清空操作。' },
			{ name: 'content', description: '唯一Popover内的PeriodCalendar。' },
			{ name: 'footer', description: 'confirm模式的取消/确认区。' }
		],
		states: [
			{ name: 'data-state', values: ['open', 'closed'], description: '实际可见浮层状态。' },
			{
				name: 'data-granularity',
				values: ['month', 'year', 'quarter', 'week'],
				description: '周期种类。'
			},
			{
				name: 'data-selection-mode',
				values: ['single', 'multiple', 'range'],
				description: '选择模式。'
			},
			{ name: 'data-invalid', values: ['true'], description: '内在或外部无效状态。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '整组五档尺寸。'
			}
		],
		keyboard: [
			{ key: 'Enter / Space / ArrowDown / ArrowUp', description: '从触发器打开周期面板。' },
			{ key: 'Calendar keys', description: '复用Calendar的方向键、首尾和分页导航。' },
			{ key: 'Escape', description: '关闭并放弃confirm模式草稿，恢复触发器焦点。' },
			{ key: 'Backspace / Delete', description: '允许清空时清除当前选择。' }
		]
	} as const satisfies ZuiComponentMetadata;
</script>

<script
	lang="ts"
	generics="TKind extends PeriodKind = PeriodKind, TMode extends PeriodSelectionMode = 'single'"
>
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, untrack } from 'svelte';
	import ZPeriodCalendar from './ZPeriodCalendar.svelte';
	import ZInputGroup from './ZInputGroup.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import type { FormValueEntry } from '../../runtime/form/form-value.js';
	import { sameFormValue } from '../../runtime/form/form-value-equality.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize, controlSizeMetrics } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import {
		comparePeriods,
		formatPeriod,
		isPeriodRangeAvailable,
		normalizePeriodSelection,
		resolvePeriodConfiguration,
		serializePeriod,
		type Period,
		type PeriodOfKind,
		type PeriodRangeValue
	} from '../../runtime/period.js';

	type SelectionValue = PeriodSelectionValue<TKind, TMode>;
	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		allowEmpty = false,
		allowNonContiguousRange = false,
		calendarLabel,
		cancelLabel,
		class: className,
		clearable = true,
		clearLabel,
		closeOnSelect,
		commitMode = 'immediate',
		confirmLabel,
		controlId: controlIdProp,
		defaultFocusedValue,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		dir,
		fiscalYearStartMonth,
		focusedValue = $bindable(),
		form,
		formatter,
		granularity,
		invalid: invalidProp = false,
		isPeriodUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		nextPageLabel,
		onCommit,
		onFocusedValueChange,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		pickerLabel,
		placement = 'bottom-start',
		placeholder,
		previousPageLabel,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		selectionMode = 'single' as TMode,
		showWeekNumbers = false,
		size,
		style,
		timeZone,
		value = $bindable(),
		weekRules,
		...rest
	}: ZPeriodPickerProps<TKind, TMode> = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'period-picker'));
	const triggerId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const valueId = $derived(`${idBase}-value`);
	const resolvedDisabled = $derived(disabledProp || field?.disabled || false);
	const resolvedReadonly = $derived(readonlyProp || field?.readonly || false);
	const resolvedRequired = $derived(requiredProp || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.periodPicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedPickerLabel = $derived(
		pickerLabel ?? ariaLabel ?? zui.localePack.period.choosePeriod
	);
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let calendarRef = $state<HTMLDivElement | null>(null);
	let panelDirty = $state(false);
	const normalize = (candidate: unknown): SelectionValue => {
		if (!['month', 'year', 'quarter', 'week'].includes(granularity))
			throw new TypeError('ZPeriodPicker granularity must be month, year, quarter or week.');
		if (commitMode !== 'immediate' && commitMode !== 'confirm')
			throw new TypeError('ZPeriodPicker commitMode must be immediate or confirm.');
		const minimum = normalizePeriodSelection('single', minValue, granularity);
		const maximum = normalizePeriodSelection('single', maxValue, granularity);
		if (minimum && maximum && comparePeriods(minimum, maximum) > 0)
			throw new RangeError('ZPeriodPicker minValue cannot exceed maxValue.');
		const selection = normalizePeriodSelection(selectionMode, candidate, granularity);
		const initial = normalizePeriodSelection(selectionMode, defaultValue, granularity);
		resolvePeriodConfiguration({
			kind: granularity,
			periods: [
				...selectedPeriods(selection),
				focusedValue,
				defaultFocusedValue,
				...selectedPeriods(initial),
				minimum,
				maximum
			],
			weekRules,
			fiscalYearStartMonth,
			locale: resolvedLocale
		});
		return selection;
	};
	const valueState = createFormControlState<SelectionValue>(
		{
			defaultValue: () => normalize(defaultValue),
			element: () => ref,
			normalizeModelValue: normalize,
			draftState: () => inspectPickerDraft(),
			onChange: () => onValueChange,
			owner: 'ZPeriodPicker',
			read: () => value,
			write: (next) => {
				value = next;
			},
			resetDraft: () => {
				panelValue = valueState.current;
				panelDirty = false;
			}
		},
		valueScope
	);
	const current = $derived(normalize(valueState.current));
	let panelValue = $state.raw<SelectionValue>(untrack(() => current));
	const openState = new ControllableState({
		defaultValue: () => defaultOpen,
		read: () => open,
		write: (next) => {
			open = next;
		},
		onChange: () => onOpenChange
	});
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const resolvedCloseOnSelect = $derived(closeOnSelect ?? selectionMode !== 'multiple');
	const intrinsic = $derived(inspectPickerDraft());
	const resolvedInvalid = $derived(invalidProp || field?.invalid || !intrinsic.valid);
	const panelValid = $derived(inspectSelection(panelValue).valid);
	const display = $derived(formatter?.(current) ?? selectionLabel(current));
	const entries = $derived<readonly FormValueEntry[]>(formEntries(current));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const triggerClass = $derived(
		zui.icss((s) => {
			const metrics = controlSizeMetrics(zui.theme, resolvedSize);
			s.flex.raw('1 1 auto');
			s.minWidth.px(0);
			s.height.auto;
			s.minHeight.raw(metrics.contentHeight);
			s.justifyContent.spaceBetween;
			s.textAlign.start;
			s.whiteSpace.normal;
			s._focusVisible((s) => s.outlineStyle.none);
			if (resolvedDisabled) s.opacity._opaque;
		})
	);
	const labelClass = $derived(
		zui.icss((s) => {
			s.minWidth.px(0);
			s.overflowWrap.anywhere;
		})
	);
	const clearClass = $derived(
		zui.icss((s) => {
			const height = controlSizeMetrics(zui.theme, resolvedSize).contentHeight;
			s.height.raw(height);
			s.minHeight.raw(height);
			if (resolvedDisabled) s.opacity._opaque;
		})
	);
	const footerClass = $derived(
		zui.icss((s) => {
			s.display.flex;
			s.gap._small;
			s.justifyContent.end;
			s.marginTop._large;
			s.paddingTop._large;
			s.borderTopStyle.solid;
			s.borderTopWidth._hairline;
			s.borderTopColor._border;
			s.position.sticky;
			s.insetBlockEnd.px(0);
			s.backgroundColor._canvas;
		})
	);

	function selectedPeriods(candidate: SelectionValue): readonly PeriodOfKind<TKind>[] {
		if (selectionMode === 'multiple') return candidate as readonly PeriodOfKind<TKind>[];
		if (selectionMode === 'range') {
			const range = candidate as PeriodRangeValue<TKind> | null;
			return [range?.start, range?.end].filter((period): period is PeriodOfKind<TKind> => !!period);
		}
		return candidate ? [candidate as PeriodOfKind<TKind>] : [];
	}
	function unavailable(period: PeriodOfKind<TKind>): boolean {
		return Boolean(
			(minValue && comparePeriods(period, minValue) < 0) ||
			(maxValue && comparePeriods(period, maxValue) > 0) ||
			isPeriodUnavailable?.(period)
		);
	}
	function incomplete(candidate: SelectionValue): boolean {
		if (selectionMode !== 'range' || !candidate) return false;
		const range = candidate as PeriodRangeValue<TKind>;
		return Boolean(range.start) !== Boolean(range.end);
	}
	function inspectSelection(candidate: SelectionValue): FormControlDraftState {
		const values = selectedPeriods(candidate);
		const requiredMissing = resolvedRequired && values.length === 0;
		const valid =
			!requiredMissing &&
			(allowEmpty || !incomplete(candidate)) &&
			values.every((period) => !unavailable(period)) &&
			(selectionMode !== 'range' ||
				isPeriodRangeAvailable(
					candidate as PeriodRangeValue<TKind> | null,
					isPeriodUnavailable,
					allowNonContiguousRange
				));
		return Object.freeze({
			dirty: false,
			valid,
			message: valid
				? undefined
				: requiredMissing
					? zui.localePack.form.requiredValue
					: zui.localePack.period.unavailable
		});
	}
	function inspectPickerDraft(): FormControlDraftState {
		const owned = inspectSelection(valueState.current);
		const draft = panelDirty ? inspectSelection(panelValue) : owned;
		return Object.freeze({
			dirty: panelDirty,
			valid: owned.valid && draft.valid,
			message: !owned.valid ? owned.message : draft.message
		});
	}
	function selectionLabel(candidate: SelectionValue): string {
		const label = (period: Period) =>
			formatPeriod(period, resolvedLocale, { timeZone: resolvedTimeZone });
		if (selectionMode === 'range' && candidate) {
			const range = candidate as PeriodRangeValue<TKind>;
			return `${range.start ? label(range.start) : '…'} – ${range.end ? label(range.end) : '…'}`;
		}
		return selectedPeriods(candidate).map(label).join(' · ');
	}
	function formEntries(candidate: SelectionValue): readonly FormValueEntry[] {
		if (!resolvedName) return [];
		if (selectionMode === 'range') {
			const range = candidate as PeriodRangeValue<TKind> | null;
			return [
				[`${resolvedName}.start`, range?.start ? serializePeriod(range.start) : undefined],
				[`${resolvedName}.end`, range?.end ? serializePeriod(range.end) : undefined]
			];
		}
		return selectedPeriods(candidate).map(
			(period) => [resolvedName, serializePeriod(period)] as const
		);
	}
	function accept(next: SelectionValue): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted =
			valueState.setFromUser(next) && sameFormValue(normalize(valueState.current), next);
		if (!accepted) {
			panelValue = current;
			panelDirty = false;
		}
		return accepted;
	}
	function select(next: SelectionValue): void {
		panelValue = normalize(next);
		panelDirty = true;
		if (commitMode !== 'immediate' || !accept(panelValue)) return;
		panelDirty = false;
		if (!incomplete(panelValue) || allowEmpty) onCommit?.(panelValue);
		if (resolvedCloseOnSelect && !incomplete(panelValue)) setOpen(false);
	}
	function confirm(): void {
		if (!panelValid || !accept(panelValue)) return;
		panelDirty = false;
		onCommit?.(panelValue);
		setOpen(false);
	}
	function clear(): void {
		const empty = normalize(undefined);
		if (!accept(empty)) return;
		panelValue = empty;
		panelDirty = false;
		onCommit?.(empty);
		setOpen(false);
		triggerRef?.focus({ preventScroll: true });
	}
	function setOpen(next: boolean): void {
		if (next && (resolvedDisabled || resolvedReadonly)) return;
		openState.setFromUser(next);
	}
	function resetFromForm(): void {
		valueState.reset();
		panelValue = valueState.current;
		panelDirty = false;
		focusedValue = defaultFocusedValue;
		open = false;
	}
	function handleTriggerKey(event: KeyboardEvent): void {
		if (event.defaultPrevented || event.isComposing || resolvedDisabled || resolvedReadonly) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			setOpen(true);
		} else if (clearable && (event.key === 'Delete' || event.key === 'Backspace')) {
			event.preventDefault();
			clear();
		}
	}
	let previous = untrack(() => current);
	let previouslyOpen = false;
	$effect(() => {
		const next = current;
		const visible = resolvedOpen;
		if (!sameFormValue(next, previous) || visible !== previouslyOpen) {
			panelValue = next;
			panelDirty = false;
		}
		previous = next;
		previouslyOpen = visible;
	});
	onDestroy(fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
</script>

{#snippet clearAction()}
	{#if clearable && selectedPeriods(current).length > 0}
		<ZButton
			class={clearClass}
			data-slot="clear"
			aria-label={clearLabel ?? zui.localePack.period.clearPeriod}
			disabled={resolvedDisabled || resolvedReadonly}
			size={resolvedSize}
			variant="ghost"
			onclick={clear}><X aria-hidden="true" size="1em" /></ZButton
		>
	{/if}
{/snippet}

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={resolvedDirection}
	data-state={resolvedOpen ? 'open' : 'closed'}
	data-granularity={granularity}
	data-selection-mode={selectionMode}
	data-size={resolvedSize}
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid || undefined}
>
	<ZPopover open={resolvedOpen} onOpenChange={setOpen} {placement} {triggerId}>
		<ZInputGroup
			disabled={resolvedDisabled}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			invalid={resolvedInvalid}
			size={resolvedSize}
			dir={resolvedDirection}
			suffixAction={clearAction}
		>
			<ZPopoverTrigger
				bind:ref={triggerRef}
				class={triggerClass}
				data-slot="trigger"
				size={resolvedSize}
				variant="ghost"
				popupRole="dialog"
				disabled={resolvedDisabled}
				aria-disabled={resolvedReadonly || undefined}
				aria-label={labelledBy ? undefined : resolvedPickerLabel}
				aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
				aria-describedby={describedBy}
				aria-invalid={resolvedInvalid || undefined}
				onkeydown={handleTriggerKey}
			>
				<span id={valueId} class={labelClass}
					>{display || placeholder || zui.localePack.period.choosePeriod}</span
				><CalendarDays aria-hidden="true" size="1em" />
			</ZPopoverTrigger>
		</ZInputGroup>
		<ZPopoverContent
			data-slot="content"
			aria-label={resolvedPickerLabel}
			ariaLabelledBy={null}
			dir={resolvedDirection}
			initialFocus={() => calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null}
		>
			<ZPeriodCalendar
				bind:ref={calendarRef}
				{granularity}
				{selectionMode}
				value={panelValue}
				onValueChange={select}
				formParticipation="none"
				{allowEmpty}
				{allowNonContiguousRange}
				{calendarLabel}
				{defaultFocusedValue}
				{focusedValue}
				onFocusedValueChange={(next) => {
					focusedValue = next;
					onFocusedValueChange?.(next);
				}}
				{fiscalYearStartMonth}
				{weekRules}
				{minValue}
				{maxValue}
				{isPeriodUnavailable}
				{showWeekNumbers}
				{previousPageLabel}
				{nextPageLabel}
				locale={resolvedLocale}
				timeZone={resolvedTimeZone}
				size={resolvedSize}
				dir={resolvedDirection}
				disabled={resolvedDisabled}
				readonly={resolvedReadonly}
				required={resolvedRequired}
			/>
			{#if commitMode === 'confirm'}<div class={footerClass} data-slot="footer">
					<ZButton size={resolvedSize} variant="ghost" onclick={() => setOpen(false)}
						>{cancelLabel ?? zui.localePack.common.close}</ZButton
					><ZButton size={resolvedSize} disabled={!panelValid} onclick={confirm}
						>{confirmLabel ?? zui.localePack.common.confirm}</ZButton
					>
				</div>{/if}
		</ZPopoverContent>
	</ZPopover>
</div>
<FormValueBridge disabled={resolvedDisabled} {entries} {form} onReset={resetFromForm} />
