<script module lang="ts">
	import { today } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import { styleInternalAction } from '../gene/internal-action.js';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { controlSizeStyles, type ZControlSize } from '../../runtime/foundation/control-size.js';
	import {
		addPeriod,
		comparePeriods,
		formatPeriod,
		isPeriodRangeAvailable,
		monthPeriod,
		normalizePeriod,
		normalizePeriodRange,
		normalizePeriodSelection,
		periodEnd,
		periodFromDate,
		periodKey,
		periodStart,
		quarterPeriod,
		resolvePeriodConfiguration,
		samePeriod,
		serializePeriod,
		yearPeriod,
		type Period,
		type PeriodKind,
		type PeriodOfKind,
		type PeriodRangeValue,
		type PeriodSelectionMode,
		type PeriodSelectionValue,
		type WeekRules
	} from '../../runtime/period.js';

	export type PeriodCalendarGranularity = PeriodKind;
	export type PeriodCalendarSelectionMode = PeriodSelectionMode;
	export type PeriodCalendarFormParticipation = 'auto' | 'none';
	export type PeriodCalendarSize = ZControlSize;
	export type PeriodCalendarValue<
		TKind extends PeriodKind,
		TMode extends PeriodSelectionMode
	> = PeriodSelectionValue<TKind, TMode>;

	interface PeriodCalendarSharedOptions<
		TKind extends PeriodKind,
		TMode extends PeriodSelectionMode
	> {
		readonly allowEmpty?: boolean;
		readonly allowNonContiguousRange?: boolean;
		readonly calendarLabel?: string;
		readonly defaultFocusedValue?: PeriodOfKind<TKind>;
		readonly defaultValue?: PeriodSelectionValue<TKind, TMode>;
		readonly disabled?: boolean;
		readonly fiscalYearStartMonth?: number;
		focusedValue?: PeriodOfKind<TKind>;
		readonly form?: string;
		readonly formParticipation?: PeriodCalendarFormParticipation;
		readonly granularity: TKind;
		readonly invalid?: boolean;
		readonly isPeriodUnavailable?: (period: PeriodOfKind<TKind>) => boolean;
		readonly locale?: string;
		readonly maxValue?: PeriodOfKind<TKind>;
		readonly minValue?: PeriodOfKind<TKind>;
		readonly name?: string;
		readonly nextPageLabel?: string;
		readonly onFocusedValueChange?: (period: PeriodOfKind<TKind>) => void;
		readonly onValueChange?: (value: PeriodSelectionValue<TKind, TMode>) => void;
		readonly previousPageLabel?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly showWeekNumbers?: boolean;
		readonly size?: PeriodCalendarSize;
		readonly timeZone?: string;
		value?: PeriodSelectionValue<TKind, TMode>;
		readonly weekRules?: WeekRules;
	}

	type PeriodCalendarModeProp<TMode extends PeriodSelectionMode> = TMode extends 'single'
		? { readonly selectionMode?: 'single' }
		: { readonly selectionMode: TMode };

	export type PeriodCalendarOptions<
		TKind extends PeriodKind = PeriodKind,
		TMode extends PeriodSelectionMode = 'single'
	> = PeriodCalendarSharedOptions<TKind, TMode> & PeriodCalendarModeProp<TMode>;

	export type ZPeriodCalendarProps<
		TKind extends PeriodKind = PeriodKind,
		TMode extends PeriodSelectionMode = 'single'
	> = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onchange'> &
		PeriodCalendarOptions<TKind, TMode>;

	export const zuiMetadata = {
		bindings: [
			{
				description: 'selectionMode判别的唯一周期选择值。',
				name: 'value',
				type: 'PeriodCalendarValue<TKind, TMode>'
			},
			{
				description: '独立于选择值的roving焦点周期。',
				name: 'focusedValue',
				type: 'PeriodOfKind<TKind>'
			},
			{ description: '真实Calendar根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'Period runtime',
			'LogicalCollection',
			'CollectionNavigation',
			'MountedElements',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户选择、切换或清空后的判别周期值。',
				name: 'onValueChange',
				type: '(value: PeriodCalendarValue<TKind, TMode>) => void'
			},
			{
				description: '键盘、指针或翻页产生的独立焦点周期。',
				name: 'onFocusedValueChange',
				type: '(period: PeriodOfKind<TKind>) => void'
			}
		],
		id: 'period-calendar',
		importStatement: "import { ZPeriodCalendar } from '@zadmin/zui';",
		keyboard: [
			{ description: '按当前grid列数移动周期焦点；RTL反转水平键。', key: 'Arrow keys' },
			{ description: '移动到当前页首个或末个可用周期。', key: 'Home / End' },
			{ description: '保留页内位置翻到前一页或后一页。', key: 'PageUp / PageDown' },
			{ description: '按selectionMode选择当前周期。', key: 'Enter / Space' },
			{ description: '清空当前选择；required只报告无效，不阻止清空。', key: 'Backspace / Delete' }
		],
		name: 'ZPeriodCalendar',
		parts: [
			{ description: '分页标题与前后页按钮。', name: 'header' },
			{ description: '当前周期页的ARIA grid。', name: 'grid' },
			{ description: '一行周期单元。', name: 'row' },
			{ description: '拥有roving焦点的原生周期按钮。', name: 'cell' },
			{ description: 'week模式可选的本地化周编号。', name: 'week-number' },
			{ description: 'week模式的真实起止日期。', name: 'week-range' },
			{ description: '拒绝不可用范围时的可访问反馈。', name: 'feedback' }
		],
		props: [
			{
				default: '无（必填）',
				description: '周期轴；每个值、边界与规则必须同kind。',
				name: 'granularity',
				required: true,
				type: "'month' | 'quarter' | 'week' | 'year'"
			},
			{
				default: "'single'",
				description: '判别value/defaultValue与FormData形状；multiple和range分支必须显式传入。',
				name: 'selectionMode',
				type: "'single' | 'multiple' | 'range'"
			},
			{
				bindable: true,
				default: 'single:null; multiple:[]; range:null',
				description: 'single为Period|null；multiple为冻结Period[]；range为nullable start/end。',
				name: 'value',
				type: 'PeriodCalendarValue<TKind, TMode>'
			},
			{
				default: 'single:null; multiple:[]; range:null',
				description: '非受控初值与原生form reset目标。',
				name: 'defaultValue',
				type: 'PeriodCalendarValue<TKind, TMode>'
			},
			{
				bindable: true,
				default: '选中首项、defaultFocusedValue或当前周期',
				description: '独立roving焦点，不因range hover改变。',
				name: 'focusedValue',
				type: 'PeriodOfKind<TKind>'
			},
			{
				default: '选中首项或当前周期',
				description: '非受控初始焦点周期。',
				name: 'defaultFocusedValue',
				type: 'PeriodOfKind<TKind>'
			},
			{
				default: 'undefined',
				description: '最早可选择周期；必须与granularity及嵌入规则一致。',
				name: 'minValue',
				type: 'PeriodOfKind<TKind>'
			},
			{
				default: 'undefined',
				description: '最晚可选择周期；必须与granularity及嵌入规则一致。',
				name: 'maxValue',
				type: 'PeriodOfKind<TKind>'
			},
			{
				default: 'undefined',
				description: '完整周期不可用谓词；range连续性检查复用同一谓词。',
				name: 'isPeriodUnavailable',
				type: '(period: PeriodOfKind<TKind>) => boolean'
			},
			{
				default: 'false',
				description: 'range模式允许start或end单侧值作为有效提交；不影响交互中的partial草稿表达。',
				name: 'allowEmpty',
				type: 'boolean'
			},
			{
				default: 'false',
				description: 'range模式允许范围内部包含不可用周期；端点仍必须可用。',
				name: 'allowNonContiguousRange',
				type: 'boolean'
			},
			{
				default: 'false',
				description: 'week模式显示locale.period.weekNumber；仍同时保留周起止日期。',
				name: 'showWeekNumbers',
				type: 'boolean'
			},
			{
				default: '现有week Period规则，否则locale周规则',
				description: 'week模式的首日与首周最少天数；显式值与业务Period冲突时拒绝。',
				name: 'weekRules',
				type: 'WeekRules'
			},
			{
				default: '现有quarter Period规则，否则1',
				description: 'quarter模式财政年度起始月1–12；显式值与业务Period冲突时拒绝。',
				name: 'fiscalYearStartMonth',
				type: 'number'
			},
			{
				default: 'false',
				description: '禁用导航、选择、焦点进入与FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保持浏览与FormData，阻止选择和清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '空选择时产生ARIA与ZForm intrinsic invalid；不阻止用户清空。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '外部无效状态，与required空选择合并。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field、Provider periodCalendar/input默认，最后按density',
				description: '导航与周期单元统一五档尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Provider locale',
				description: '周期、周编号和日期范围格式locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: '当前周期与日期范围格式使用的时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'Provider localePack.period.calendarLabel',
				description: '根grid可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.period.previousPage',
				description: '前一周期页按钮名称。',
				name: 'previousPageLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.period.nextPage',
				description: '后一周期页按钮名称。',
				name: 'nextPageLabel',
				type: 'string'
			},
			{
				default: 'Field context或undefined',
				description: 'FormData名称；range生成name.start/name.end。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: 'FormValueBridge关联的外部form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: "'auto'",
				description: 'none退出FormValueBridge与ZForm value scope，但仍触发值回调。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZPeriodCalendar.svelte',
		states: [
			{
				description: '解析后的周期轴。',
				name: 'data-granularity',
				values: ['month', 'quarter', 'week', 'year']
			},
			{
				description: '选择模式。',
				name: 'data-selection-mode',
				values: ['single', 'multiple', 'range']
			},
			{ description: '选中周期单元。', name: 'data-selected', values: ['true'] },
			{ description: 'range首尾单元。', name: 'data-range-edge', values: ['start', 'end'] },
			{ description: 'hover range预览单元。', name: 'data-range-preview', values: ['true'] },
			{ description: '不可用周期。', name: 'data-disabled', values: ['true'] },
			{ description: '外部或required空选择无效。', name: 'data-invalid', values: ['true'] },
			{ description: '只读浏览状态。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析后的控制尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'experimental',
		summary: '以规则自描述Period为值、有限周期页与唯一表单owner提供月、季、年、周选择。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
		},
		variants: {}
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._small;
			s.justifyContent.spaceBetween;
		},
		variants: {}
	});
	const gridRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
		},
		variants: {}
	});
	const cellRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.alignItems.center;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.flexDirection.column;
			s.gap._xsmall;
			s.height.auto;
			s.justifyContent.center;
			s.minWidth.px(0);
			s.overflowWrap.anywhere;
			s.padding._medium;
			s.width._full;
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			preview: { false: () => undefined, true: (s) => s.backgroundColor._surfaceHover },
			readonly: { false: () => undefined, true: (s) => s.cursor.default },
			size: controlSizeStyles,
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primarySubtle;
					s.borderColor._primary;
					s.color._primary;
				}
			}
		},
		defaultVariants: {
			disabled: false,
			preview: false,
			readonly: false,
			selected: false,
			size: 'medium'
		}
	});
	const weekRangeRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {}
	});
	for (const recipe of [rootRecipe, headerRecipe, gridRecipe, cellRecipe, weekRangeRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts" generics="TKind extends PeriodKind, TMode extends PeriodSelectionMode = 'single'">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { onDestroy, untrack } from 'svelte';
	import type { Action } from 'svelte/action';
	import { CollectionNavigation } from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import type { FormValueEntry } from '../../runtime/form/form-value.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';

	type SelectionValue = PeriodSelectionValue<TKind, TMode>;
	type KindPeriod = PeriodOfKind<TKind>;
	type CellRecord = {
		readonly disabled: boolean;
		readonly key: string;
		readonly label: string;
		readonly period: KindPeriod;
		readonly visibleLabel: string;
	};

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowEmpty = false,
		allowNonContiguousRange = false,
		calendarLabel,
		class: className,
		defaultFocusedValue,
		defaultValue,
		disabled: disabledProp = false,
		fiscalYearStartMonth,
		focusedValue = $bindable(),
		form,
		formParticipation = 'auto',
		granularity,
		invalid,
		isPeriodUnavailable,
		locale,
		maxValue,
		minValue,
		name: nameProp,
		nextPageLabel,
		onFocusedValueChange,
		onValueChange,
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
	}: ZPeriodCalendarProps<TKind, TMode> = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const claimedValueScope = untrack(claimFormValueScope);
	const valueScope = untrack(() => (formParticipation === 'auto' ? claimedValueScope : null));
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'period-calendar'));
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.periodCalendar?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedCalendarLabel = $derived(
		calendarLabel ?? ariaLabel ?? zui.localePack.period.calendarLabel
	);
	const resolvedPreviousLabel = $derived(previousPageLabel ?? zui.localePack.period.previousPage);
	const resolvedNextLabel = $derived(nextPageLabel ?? zui.localePack.period.nextPage);
	const directionFallback = $derived(
		rest.dir === 'rtl' ? 'rtl' : rest.dir === 'ltr' ? 'ltr' : zui.direction
	);
	const effectiveDirection = $derived(getElementDirection(ref, directionFallback));
	const PreviousIcon = $derived(effectiveDirection === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(effectiveDirection === 'rtl' ? ChevronLeft : ChevronRight);

	function normalizedSelection(candidate: unknown): SelectionValue {
		return normalizePeriodSelection(selectionMode, candidate, granularity) as SelectionValue;
	}

	let valueState!: ReturnType<typeof createFormControlState<SelectionValue>>;
	function selectionEmpty(candidate: SelectionValue): boolean {
		if (selectionMode === 'multiple') return (candidate as readonly Period[]).length === 0;
		if (selectionMode === 'range') {
			const range = candidate as PeriodRangeValue<TKind> | null;
			return !range?.start && !range?.end;
		}
		return candidate === null;
	}
	function inspectDraftState(): FormControlDraftState {
		const range =
			selectionMode === 'range' ? (valueState.current as PeriodRangeValue<TKind> | null) : null;
		const partial = Boolean(range && Boolean(range.start) !== Boolean(range.end));
		const unavailableSelection = selectionPeriods(valueState.current).some((period) =>
			periodUnavailable(period)
		);
		const unavailableRange =
			selectionMode === 'range' &&
			!isPeriodRangeAvailable(range, isPeriodUnavailable, allowNonContiguousRange);
		const valid =
			(!resolvedRequired || !selectionEmpty(valueState.current)) &&
			(allowEmpty || !partial) &&
			!unavailableSelection &&
			!unavailableRange;
		return Object.freeze({
			dirty: false,
			message: valid
				? undefined
				: partial || unavailableSelection || unavailableRange
					? zui.localePack.period.unavailable
					: zui.localePack.form.requiredValue,
			valid
		});
	}
	valueState = createFormControlState<SelectionValue>(
		{
			defaultValue: () => normalizedSelection(defaultValue),
			draftState: inspectDraftState,
			element: () => ref,
			normalizeModelValue: normalizedSelection,
			onChange: () => onValueChange as ((value: SelectionValue) => void) | undefined,
			owner: 'ZPeriodCalendar',
			read: () => value as SelectionValue | undefined,
			write: (next) => (value = next)
		},
		valueScope
	);

	function selectionPeriods(candidate: SelectionValue): readonly KindPeriod[] {
		if (selectionMode === 'multiple') return candidate as readonly KindPeriod[];
		if (selectionMode === 'range') {
			const range = candidate as PeriodRangeValue<TKind> | null;
			return [range?.start, range?.end].filter((period): period is KindPeriod => period != null);
		}
		return candidate ? [candidate as KindPeriod] : [];
	}
	const resolvedConfiguration = $derived.by(() => {
		const configuration = resolvePeriodConfiguration({
			fiscalYearStartMonth,
			kind: granularity,
			locale: resolvedLocale,
			periods: [
				...selectionPeriods(valueState.current),
				focusedValue,
				defaultFocusedValue,
				...selectionPeriods(normalizedSelection(defaultValue)),
				minValue,
				maxValue
			],
			weekRules
		});
		if (minValue && maxValue && comparePeriods(minValue, maxValue) > 0)
			throw new RangeError('ZPeriodCalendar minValue cannot exceed maxValue.');
		return configuration;
	});
	const resolvedWeekRules = $derived<WeekRules>(resolvedConfiguration.weekRules);
	const resolvedFiscalStart = $derived(resolvedConfiguration.fiscalYearStartMonth);

	function currentPeriod(): KindPeriod {
		const date = today(resolvedTimeZone);
		const options =
			granularity === 'quarter'
				? ({ fiscalYearStartMonth: resolvedFiscalStart, kind: 'quarter' } as const)
				: granularity === 'week'
					? ({
							firstDayOfWeek: resolvedWeekRules.firstDayOfWeek,
							kind: 'week',
							minimalDaysInFirstWeek: resolvedWeekRules.minimalDaysInFirstWeek
						} as const)
					: ({ kind: granularity } as { readonly kind: 'month' | 'year' });
		return periodFromDate(date, options) as KindPeriod;
	}
	const initialFocus = $derived(
		(focusedValue ? (normalizePeriod(focusedValue) as KindPeriod) : undefined) ??
			(defaultFocusedValue ? (normalizePeriod(defaultFocusedValue) as KindPeriod) : undefined) ??
			selectionPeriods(valueState.current)[0] ??
			minValue ??
			maxValue ??
			currentPeriod()
	);
	const focusedState = new ControllableState<KindPeriod | undefined>({
		defaultValue: () => initialFocus,
		onChange: () => onFocusedValueChange,
		read: () => focusedValue,
		write: (next) => (focusedValue = next)
	});
	const resolvedFocused = $derived(focusedState.current ?? initialFocus);

	function pageSize(): number {
		return granularity === 'quarter' ? 4 : 12;
	}
	function pagePeriods(start: KindPeriod): readonly KindPeriod[] {
		const result: KindPeriod[] = [];
		for (let index = 0; index < pageSize(); index += 1) {
			try {
				result.push(addPeriod(start, index) as KindPeriod);
			} catch {
				break;
			}
		}
		return Object.freeze(result);
	}
	function columns(): number {
		return granularity === 'quarter' ? 2 : granularity === 'week' ? 1 : 4;
	}
	function pageStart(period: KindPeriod): KindPeriod {
		switch (period.kind) {
			case 'month':
				return monthPeriod(period.year, 1) as KindPeriod;
			case 'quarter':
				return quarterPeriod(period.year, 1, period.fiscalYearStartMonth) as KindPeriod;
			case 'year':
				return yearPeriod(Math.floor((period.year - 1) / 12) * 12 + 1) as KindPeriod;
			case 'week':
				return addPeriod(period, -((period.week - 1) % 12)) as KindPeriod;
		}
	}
	let page = $state<KindPeriod>(untrack(() => pageStart(initialFocus)));
	let hoverPeriod = $state<KindPeriod | null>(null);
	let feedback = $state('');
	let feedbackRevision = $state(0);
	const periodUnavailable = (period: KindPeriod): boolean =>
		Boolean(
			(minValue && comparePeriods(period, minValue) < 0) ||
			(maxValue && comparePeriods(period, maxValue) > 0) ||
			isPeriodUnavailable?.(period)
		);
	const unavailable = (period: KindPeriod): boolean =>
		resolvedDisabled || periodUnavailable(period);
	function weekRangeLabel(period: KindPeriod): string {
		if (period.kind !== 'week') return '';
		const formatter = new Intl.DateTimeFormat(resolvedLocale, {
			day: 'numeric',
			month: 'short',
			timeZone: resolvedTimeZone,
			year: 'numeric'
		});
		return `${formatter.format(periodStart(period).toDate(resolvedTimeZone))} – ${formatter.format(periodEnd(period).toDate(resolvedTimeZone))}`;
	}
	function recordLabel(period: KindPeriod): string {
		if (period.kind === 'week' && showWeekNumbers)
			return zui.localePack.period.weekNumber(period.year, period.week);
		return formatPeriod(period, resolvedLocale, { timeZone: resolvedTimeZone });
	}
	function visibleLabel(period: KindPeriod, label: string): string {
		if (period.kind !== 'month') return label;
		return new Intl.DateTimeFormat(resolvedLocale, {
			month: 'short',
			timeZone: resolvedTimeZone
		}).format(periodStart(period).toDate(resolvedTimeZone));
	}
	const records = $derived.by<CellRecord[]>(() => {
		void resolvedConfiguration;
		return pagePeriods(page).map((period) => {
			const label = recordLabel(period);
			return {
				disabled: periodUnavailable(period),
				key: periodKey(period),
				label,
				period,
				visibleLabel: visibleLabel(period, label)
			};
		});
	});
	const collection = $derived(
		new LogicalCollection<string, CellRecord>(
			records,
			{
				disabled: (record) => record.disabled,
				key: (record) => record.key,
				textValue: (record) => record.label
			},
			{ name: 'ZPeriodCalendar periods' }
		)
	);
	const view = $derived(collection.full);
	const mounted = new MountedElements<string, HTMLButtonElement>();
	let activeKey = $state<string>(
		untrack(() => {
			const preferred = periodKey(initialFocus);
			return (
				records.find((record) => record.key === preferred && !record.disabled)?.key ??
				records.find((record) => !record.disabled)?.key ??
				preferred
			);
		})
	);
	const navigation = new CollectionNavigation<string, CellRecord>({
		direction: () => getElementDirection(ref, zui.direction),
		disabled: () => resolvedDisabled,
		loop: () => false,
		orientation: () => 'both',
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const mountCell: Action<HTMLButtonElement, CellRecord> = (node, record) =>
		mounted.mount(record.key, node, `${idBase}-${record.key.replace(/[^a-zA-Z0-9_-]/gu, '-')}`);
	const rootClass = $derived(zui.recipe(rootRecipe));
	const headerClass = $derived(zui.recipe(headerRecipe));
	const gridClass = $derived(zui.recipe(gridRecipe));
	const rowClass = $derived([
		gridClass,
		zui.icss((s) => {
			s.gridTemplateColumns.raw(`repeat(${columns()}, minmax(0, 1fr))`);
			s._selector('& > [role="gridcell"]', (s) => {
				s.minWidth.px(0);
				s.width._full;
			});
		})
	]);
	const weekRangeClass = $derived(zui.recipe(weekRangeRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const resolvedInvalid = $derived(
		!inspectDraftState().valid || (invalid ?? field?.invalid ?? false)
	);

	function rangeValue(): PeriodRangeValue<TKind> | null {
		return selectionMode === 'range'
			? (valueState.current as PeriodRangeValue<TKind> | null)
			: null;
	}
	const previewRange = $derived.by(() => {
		const range = rangeValue();
		if (!range?.start || range.end || !hoverPeriod) return null;
		return normalizePeriodRange({ end: hoverPeriod, start: range.start }, granularity);
	});
	function periodInRange(period: KindPeriod, range: PeriodRangeValue<TKind> | null): boolean {
		if (!range) return false;
		if (!range.start) return Boolean(range.end && samePeriod(period, range.end));
		if (!range.end) return samePeriod(period, range.start);
		return comparePeriods(period, range.start) >= 0 && comparePeriods(period, range.end) <= 0;
	}
	function selected(period: KindPeriod): boolean {
		if (selectionMode === 'multiple')
			return (valueState.current as readonly KindPeriod[]).some((item) => samePeriod(item, period));
		if (selectionMode === 'range') return periodInRange(period, rangeValue());
		return samePeriod(valueState.current as KindPeriod | null, period);
	}
	function rangeEdge(period: KindPeriod): 'end' | 'start' | undefined {
		const range = rangeValue();
		if (range?.start && samePeriod(range.start, period)) return 'start';
		if (range?.end && samePeriod(range.end, period)) return 'end';
		return undefined;
	}
	function setSelection(next: SelectionValue): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted = valueState.setFromUser(normalizedSelection(next));
		if (accepted) feedback = '';
		return accepted;
	}
	function clearSelection(): void {
		setSelection(normalizedSelection(undefined));
		hoverPeriod = null;
	}
	function choose(period: KindPeriod): void {
		if (resolvedDisabled || resolvedReadonly || unavailable(period)) return;
		if (selectionMode === 'multiple') {
			const current = valueState.current as readonly KindPeriod[];
			setSelection(
				(current.some((item) => samePeriod(item, period))
					? current.filter((item) => !samePeriod(item, period))
					: [...current, period]) as SelectionValue
			);
			return;
		}
		if (selectionMode === 'range') {
			const current = rangeValue();
			if (!current?.start || current.end) {
				setSelection({ end: null, start: period } as SelectionValue);
				hoverPeriod = null;
				return;
			}
			const candidate = normalizePeriodRange({ end: period, start: current.start }, granularity);
			if (!isPeriodRangeAvailable(candidate, isPeriodUnavailable, allowNonContiguousRange)) {
				feedback = zui.localePack.period.unavailable;
				feedbackRevision += 1;
				return;
			}
			setSelection(candidate as SelectionValue);
			hoverPeriod = null;
			return;
		}
		setSelection(
			(samePeriod(valueState.current as KindPeriod | null, period)
				? null
				: period) as SelectionValue
		);
	}
	function setFocused(period: KindPeriod, focus = false): void {
		if (unavailable(period)) return;
		focusedState.setFromUser(period);
		activeKey = periodKey(period);
		if (focus) mounted.focus(activeKey);
	}
	function enabledRecords(): readonly CellRecord[] {
		return records.filter((record) => !record.disabled);
	}
	function focusByOffset(offset: number): void {
		const current = Math.max(
			0,
			records.findIndex((record) => record.key === (activeKey ?? periodKey(resolvedFocused)))
		);
		const direction = Math.sign(offset);
		let index = current + offset;
		while (index >= 0 && index < records.length) {
			const target = records[index];
			if (target && !target.disabled) {
				setFocused(target.period, true);
				return;
			}
			index += direction;
		}
	}
	function targetPage(amount: -1 | 1): KindPeriod | null {
		try {
			const target = addPeriod(page, amount * pageSize()) as KindPeriod;
			const targetPeriods = pagePeriods(target);
			if (targetPeriods.length === 0) return null;
			if (minValue && targetPeriods.every((period) => comparePeriods(period, minValue) < 0))
				return null;
			if (maxValue && targetPeriods.every((period) => comparePeriods(period, maxValue) > 0))
				return null;
			return target;
		} catch {
			return null;
		}
	}
	function movePage(amount: -1 | 1): void {
		if (resolvedDisabled) return;
		const nextPage = targetPage(amount);
		if (!nextPage) return;
		const index = Math.max(
			0,
			records.findIndex((record) => record.key === activeKey)
		);
		page = nextPage;
		const nextRecords = pagePeriods(nextPage);
		const target =
			nextRecords[index] && !unavailable(nextRecords[index]!)
				? nextRecords[index]
				: nextRecords.find((period) => !unavailable(period));
		if (target) {
			focusedState.setFromUser(target as KindPeriod);
			activeKey = periodKey(target);
			(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() =>
				mounted.focus(activeKey!)
			);
		} else navigation.reconcile();
	}
	function handleCellKeydown(event: KeyboardEvent, period: KindPeriod): void {
		const horizontal = getElementDirection(ref, zui.direction) === 'rtl' ? -1 : 1;
		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowRight':
				event.preventDefault();
				focusByOffset((event.key === 'ArrowRight' ? 1 : -1) * horizontal);
				return;
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				focusByOffset((event.key === 'ArrowDown' ? 1 : -1) * columns());
				return;
			case 'Home':
			case 'End': {
				event.preventDefault();
				const items = enabledRecords();
				const target = event.key === 'Home' ? items[0] : items.at(-1);
				if (target) setFocused(target.period, true);
				return;
			}
			case 'PageUp':
			case 'PageDown':
				event.preventDefault();
				movePage(event.key === 'PageDown' ? 1 : -1);
				return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				choose(period);
				return;
			case 'Backspace':
			case 'Delete':
				event.preventDefault();
				clearSelection();
		}
	}
	function pageLabel(): string {
		const last = records.at(-1)?.period ?? page;
		if (granularity === 'month' || granularity === 'quarter')
			return new Intl.NumberFormat(resolvedLocale, { useGrouping: false }).format(page.year);
		const firstLabel = formatPeriod(page, resolvedLocale, { timeZone: resolvedTimeZone });
		const lastLabel = formatPeriod(last, resolvedLocale, { timeZone: resolvedTimeZone });
		return `${firstLabel} – ${lastLabel}`;
	}
	const formEntries = $derived.by<readonly FormValueEntry[]>(() => {
		if (!resolvedName) return [];
		if (selectionMode === 'multiple')
			return (valueState.current as readonly KindPeriod[]).map((period) => [
				resolvedName,
				serializePeriod(period)
			]);
		if (selectionMode === 'range') {
			const range = rangeValue();
			return [
				...(range?.start
					? ([[`${resolvedName}.start`, serializePeriod(range.start)]] as const)
					: []),
				...(range?.end ? ([[`${resolvedName}.end`, serializePeriod(range.end)]] as const) : [])
			];
		}
		const current = valueState.current as KindPeriod | null;
		return current ? [[resolvedName, serializePeriod(current)]] : [];
	});
	function resetFromForm(): void {
		valueState.reset();
		hoverPeriod = null;
		const target = selectionPeriods(valueState.current)[0] ?? currentPeriod();
		focusedState.reconcile(target);
		page = pageStart(target);
		feedback = '';
	}
	$effect(() => {
		void resolvedConfiguration;
		const focus = resolvedFocused;
		const end = pagePeriods(page).at(-1) ?? page;
		if (comparePeriods(focus, page) < 0 || comparePeriods(focus, end) > 0) page = pageStart(focus);
		activeKey = periodKey(focus);
	});
	$effect(() => {
		const enabled = enabledRecords();
		if (enabled.length === 0) return;
		if (!enabled.some((record) => record.key === activeKey)) activeKey = enabled[0]!.key;
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() => {
			const target = activeKey ?? enabledRecords()[0]?.key;
			if (target) mounted.focus(target);
		})
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={rest.dir ?? zui.direction}
	data-disabled={resolvedDisabled || undefined}
	data-granularity={granularity}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-selection-mode={selectionMode}
	data-size={resolvedSize}
	onpointerleave={() => (hoverPeriod = null)}
>
	<div class={headerClass} data-slot="header">
		<ZButton
			aria-label={resolvedPreviousLabel}
			disabled={resolvedDisabled || !targetPage(-1)}
			onclick={() => movePage(-1)}
			shape="square"
			size={resolvedSize}
			variant="ghost"
		>
			<PreviousIcon aria-hidden="true" size="1em" />
		</ZButton>
		<strong aria-live="polite">{pageLabel()}</strong>
		<ZButton
			aria-label={resolvedNextLabel}
			disabled={resolvedDisabled || !targetPage(1)}
			onclick={() => movePage(1)}
			shape="square"
			size={resolvedSize}
			variant="ghost"
		>
			<NextIcon aria-hidden="true" size="1em" />
		</ZButton>
	</div>
	<div
		aria-describedby={resolvedDescribedBy}
		aria-invalid={resolvedInvalid || undefined}
		aria-label={resolvedLabelledBy ? undefined : resolvedCalendarLabel}
		aria-labelledby={resolvedLabelledBy}
		aria-multiselectable={selectionMode === 'multiple' || selectionMode === 'range' || undefined}
		aria-readonly={resolvedReadonly || undefined}
		aria-required={resolvedRequired || undefined}
		class={gridClass}
		data-slot="grid"
		role="grid"
	>
		{#each Array.from({ length: Math.ceil(records.length / columns()) }, (_, index) => index) as row (row)}
			<div class={rowClass} data-slot="row" role="row">
				{#each records.slice(row * columns(), row * columns() + columns()) as record (record.key)}
					{@const isSelected = selected(record.period)}
					{@const isPreview = periodInRange(record.period, previewRange)}
					<div aria-selected={isSelected} role="gridcell">
						<button
							use:mountCell={record}
							type="button"
							aria-label={record.period.kind === 'week'
								? `${formatPeriod(record.period, resolvedLocale)}: ${weekRangeLabel(record.period)}`
								: record.label}
							aria-readonly={resolvedReadonly || undefined}
							class={zui.recipe(cellRecipe, {
								disabled: resolvedDisabled || record.disabled,
								preview: isPreview,
								readonly: resolvedReadonly,
								size: resolvedSize,
								selected: isSelected
							})}
							data-disabled={record.disabled || undefined}
							data-range-edge={rangeEdge(record.period)}
							data-range-preview={isPreview || undefined}
							data-selected={isSelected || undefined}
							data-slot="cell"
							disabled={resolvedDisabled || record.disabled}
							id={`${idBase}-${record.key.replace(/[^a-zA-Z0-9_-]/gu, '-')}`}
							onclick={() => choose(record.period)}
							onfocus={() => setFocused(record.period)}
							onkeydown={(event) => handleCellKeydown(event, record.period)}
							onpointerenter={() => {
								if (selectionMode === 'range' && rangeValue()?.start && !rangeValue()?.end)
									hoverPeriod = record.period;
							}}
							tabindex={activeKey === record.key && !record.disabled && !resolvedDisabled ? 0 : -1}
						>
							{#if record.period.kind === 'week'}
								{#if showWeekNumbers}
									<span data-slot="week-number">{record.label}</span>
								{/if}
								<span class={weekRangeClass} data-slot="week-range"
									>{weekRangeLabel(record.period)}</span
								>
							{:else}
								{record.visibleLabel}
							{/if}
						</button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
	{#if feedback}
		{#key feedbackRevision}
			<ZVisuallyHidden aria-live="polite" data-slot="feedback" role="status">
				{feedback}
			</ZVisuallyHidden>
		{/key}
	{/if}
</div>
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		entries={formEntries}
		{form}
		onReset={resetFromForm}
	/>
{/if}
