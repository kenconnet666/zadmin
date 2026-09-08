<script module lang="ts">
	import type { Time as TimeValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';
	import type {
		TimeDayPeriod as TimeDayPeriodValue,
		TimeFieldGranularity,
		TimeFieldSegment
	} from '../../runtime/date.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { compositeInputDisabledStyles } from '../../runtime/foundation/control-styles.js';

	export type TimeGranularity = TimeFieldGranularity;
	export type TimeDayPeriod = TimeDayPeriodValue;
	export type TimeSegment = TimeFieldSegment;
	export type TimeFieldAppearance = 'bare' | 'field';
	export type TimeFieldFormParticipation = 'auto' | 'none';
	export type TimeFieldSize = ZControlSize;

	export interface ZTimeFieldProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly appearance?: TimeFieldAppearance;
		readonly controlId?: string;
		readonly dayPeriodLabel?: (period: TimeDayPeriod) => string;
		readonly defaultValue?: TimeValue | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formParticipation?: TimeFieldFormParticipation;
		readonly granularity?: TimeGranularity;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly isTimeUnavailable?: (value: TimeValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: TimeValue;
		readonly minValue?: TimeValue;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly onDraftChange?: (state: FormControlDraftState) => void;
		readonly onFormReset?: () => void;
		readonly onValueChange?: (value: TimeValue | null) => void;
		readonly placeholderValue?: TimeValue;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeSegment) => string;
		readonly size?: TimeFieldSize;
		readonly toggleDayPeriodLabel?: string;
		value?: TimeValue | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'time-field',
		importStatement: "import { ZTimeField } from '@zadmin/zui';",
		name: 'ZTimeField',
		bindings: [
			{ description: 'Time值；null是显式空值。', name: 'value', type: 'Time | null' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'time segments',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '本地segment草稿的原子有效性、脏状态与本地化消息。',
				name: 'onDraftChange',
				type: '(state: FormControlDraftState) => void'
			},
			{
				description: '完整时间或清空变化。',
				name: 'onValueChange',
				type: '(value: Time | null) => void'
			}
		],
		keyboard: [
			{ description: '按step增减当前segment。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动segment。', key: 'ArrowLeft / ArrowRight / Home / End' }
		],
		parts: [
			{ description: 'hour/minute/second输入。', name: 'segment' },
			{ description: '12小时制AM/PM按钮。', name: 'day-period' }
		],
		props: [
			{
				default: "'field'",
				description: '独立边框或供未来复合DateTimePicker复用的bare外观。',
				name: 'appearance',
				type: "'bare' | 'field'"
			},
			{
				default: '自动生成（或Field/controlId）',
				description: '覆盖首个时间segment的DOM id；Field会优先提供controlId。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '时间值；null是受控空值。',
				name: 'value',
				type: 'Time | null'
			},
			{
				default: 'null',
				description: '非受控初始时间。',
				name: 'defaultValue',
				type: 'Time | null'
			},
			{
				default: '00:00',
				description: '空值首次编辑或键盘步进时补齐尚未编辑segment的wall-clock时间。',
				name: 'placeholderValue',
				type: 'Time'
			},
			{
				default: 'false（或继承Field）',
				description: '禁用全部时间segment和AM/PM操作，并同步禁用表单值桥。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'minute'",
				description:
					'最小可见编辑单位为hour、minute或second；编辑已有Time保留未编辑的隐藏单位，空值从零构造。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'Intl locale（locale pack后备）',
				description: '12或24小时制；显式值优先于locale推断。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'undefined（继承Provider locale）',
				description:
					'用于解析和渲染时间segment顺序、本地数字与hour cycle；数字输入复用共享number runtime。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'localePack.time对应segment',
				description: '覆盖hour、minute、second可访问名称。',
				name: 'segmentLabel',
				type: '(segment: TimeSegment) => string'
			},
			{
				default: 'localePack.time.am/pm',
				description: '覆盖12小时制的AM/PM可见文案。',
				name: 'dayPeriodLabel',
				type: "(period: 'am' | 'pm') => string"
			},
			{
				default: 'localePack.time.toggleDayPeriod',
				description: 'AM/PM切换按钮可访问名称。',
				name: 'toggleDayPeriodLabel',
				type: 'string'
			},
			{ default: '1', description: '分钟键盘步长。', name: 'minuteStep', type: 'number' },
			{ default: '1', description: '秒键盘步长。', name: 'secondStep', type: 'number' },
			{
				default: 'undefined',
				description: '允许的最晚时间；超出范围的输入和步进不会提交。',
				name: 'maxValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '允许的最早时间；超出范围的输入和步进不会提交。',
				name: 'minValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '额外判定不可用时间；返回true时输入和步进均保持非法状态。',
				name: 'isTimeUnavailable',
				type: '(value: Time) => boolean'
			},
			{ default: 'undefined', description: 'ISO时间隐藏字段名。', name: 'name', type: 'string' },
			{
				default: 'undefined',
				description: '关联原生form；formParticipation为auto时由FormValueBridge写入时间值。',
				name: 'form',
				type: 'string'
			},
			{
				default: "'auto'",
				description: '自定义复合组件可设none，由外层唯一拥有FormValueBridge与reset。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				default: 'undefined',
				description: '表单reset后回到defaultValue，并在重置完成后调用。',
				name: 'onFormReset',
				type: '() => void'
			},
			{
				default: 'false（或继承Field）',
				description: '只读时间segment；禁止编辑、步进和AM/PM切换，但仍可提交表单值。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false（或继承Field）',
				description: '要求非空时间；同步原生segment required和data-required语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '标记外部校验失败；与不完整segment或Field.invalid共同呈现invalid状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field > componentDefaults.timeField > input > density',
				description: '统一group padding、segment和day-period尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimeField.svelte',
		states: [
			{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] },
			{
				description: '解析后的五档控件尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'stable',
		summary: 'Time值、hour/minute/second粒度、12/24小时segment与FormModel桥接的Time Field。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe({
		base: (s) => {
			compositeInputDisabledStyles(s);
			s.fontFamily._mono;
			s.lineHeight._compact;
			s.minWidth.px(0);
			s.alignItems.center;
			s.borderRadius._medium;
			s.display.inlineFlex;
			s._selector('&:not([data-zui-input-group-control]):focus-within', (s) => {
				s.outlineColor._focus;
				s.outlineOffset._outer;
				s.outlineStyle.solid;
				s.outlineWidth._medium;
			});
		},
		variants: {
			appearance: {
				bare: () => undefined,
				field: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderStyle.solid;
					s.borderWidth._hairline;
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: { false: () => undefined, true: (s) => s.borderColor._danger },
			size: {
				xsmall: (s) => {
					s.fontSize._xsmall;
					s.gap._small;
					s.paddingInline._small;
				},
				small: (s) => {
					s.fontSize._small;
					s.gap._small;
					s.paddingInline._small;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.gap._small;
					s.paddingInline._medium;
				},
				large: (s) => {
					s.fontSize._large;
					s.gap._small;
					s.paddingInline._large;
				},
				xlarge: (s) => {
					s.fontSize._large;
					s.gap._small;
					s.paddingInline._large;
				}
			}
		},
		compoundVariants: [{ when: { appearance: 'bare' }, style: (s) => s.paddingInline._small }],
		defaultVariants: { appearance: 'field', disabled: false, invalid: false, size: 'medium' }
	});
	const segmentRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.boxSizing.borderBox;
			s.lineHeight._compact;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.fontFamily._mono;
			s.outlineStyle.none;
			s.padding.px(0);
			s.textAlign.center;
			s.width.ch(2);
			s.flexShrink(0);
		},
		variants: {
			size: {
				xsmall: (s) => {
					s.fontSize._xsmall;
				},
				small: (s) => {
					s.fontSize._small;
				},
				medium: (s) => {
					s.fontSize._medium;
				},
				large: (s) => {
					s.fontSize._large;
				},
				xlarge: (s) => {
					s.fontSize._large;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const periodRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.boxSizing.borderBox;
			s.fontFamily.inherit;
			s.fontSize.inherit;
			s.lineHeight._compact;
			s.backgroundColor._surface;
			s.borderStyle.none;
			s.color._text;
			s.padding._small;
		},
		variants: {
			size: {
				xsmall: (s) => s.padding._small,
				small: (s) => s.padding._small,
				medium: (s) => s.padding._small,
				large: (s) => s.padding._medium,
				xlarge: (s) => s.padding._medium
			}
		},
		defaultVariants: { size: 'medium' }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, segmentRecipe);
	registerRecipeHmr(import.meta, periodRecipe);
</script>

<script lang="ts">
	import { Time } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import {
		moveIndex,
		navigationIntent,
		type NavigationIntent
	} from '../../runtime/collection/list-navigation.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		normalizeTimeModelValue,
		resolveHourCycle,
		timeFieldPattern
	} from '../../runtime/date.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { getActiveElement, getElementDirection } from '../../runtime/layer/dom-realm.js';
	import { parseLocalizedNumber } from '../../runtime/number.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		appearance = 'field',
		class: className,
		controlId,
		dayPeriodLabel,
		defaultValue,
		disabled = false,
		dir: dirProp,
		form,
		formParticipation = 'auto',
		granularity = 'minute',
		hourCycle: hourCycleProp,
		invalid: invalidProp = false,
		isTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		name,
		onDraftChange,
		onFormReset,
		onValueChange,
		placeholderValue,
		readonly = false,
		ref = $bindable(null),
		required = false,
		secondStep = 1,
		segmentLabel,
		size,
		style,
		toggleDayPeriodLabel,
		value = $bindable(),
		...rest
	}: ZTimeFieldProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const group = useZInputGroup();
	const claimedValueScope = untrack(claimFormValueScope);
	const valueScope = untrack(() => (formParticipation === 'auto' ? claimedValueScope : null));
	const uid = $props.id();
	const idBase = $derived(
		controlId ??
			group?.controlId ??
			field?.controlId ??
			createZuiId(zui.idPrefix, uid, 'time-field')
	);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedDirection = $derived(dirProp ?? zui.direction);
	const hourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const resolvedPlaceholderValue = $derived.by(() => {
		if (placeholderValue === undefined) return new Time(0);
		const normalized = normalizeTimeModelValue(placeholderValue, 'ZTimeField placeholderValue');
		if (!normalized) throw new TypeError('ZTimeField placeholderValue cannot be null.');
		return normalized;
	});
	const constraints = $derived.by(() => {
		if (![minuteStep, secondStep].every((step) => Number.isInteger(step) && step > 0 && step < 60))
			throw new TypeError('ZTimeField steps must be positive integers below 60.');
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZTimeField minValue cannot exceed maxValue.');
		return { minuteStep, secondStep };
	});
	const resolvedDisabled = $derived(disabled || group?.disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || group?.readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || group?.required || field?.required || false);
	const resolvedInvalid = $derived(invalidProp || group?.invalid || field?.invalid || false);
	const resolvedName = $derived(name ?? group?.name ?? field?.name);
	const describedBy = $derived(
		mergeAriaIds(ariaDescribedBy, group?.describedBy, field?.describedBy)
	);
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, group?.labelId, field?.labelId));
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				group?.size ??
				field?.size ??
				zui.componentDefaults.timeField?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const valueState = createFormControlState<Time | null>(
		{
			defaultValue: () => defaultValue ?? null,
			draftState: () => inspectDraftState(),
			element: () => ref,
			normalizeModelValue: (candidate) => normalizeTimeModelValue(candidate, 'ZTimeField'),
			onChange: () => onValueChange,
			owner: 'ZTimeField',
			read: () => value,
			resetDraft: rollbackDraft,
			syncNative: (next) => syncInputs(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	const pattern = $derived(timeFieldPattern(resolvedLocale, hourCycle, granularity));
	const segments = $derived<readonly TimeSegment[]>(
		pattern.flatMap((part) => ('segment' in part ? [part.segment] : []))
	);
	const focusOrder = $derived<readonly (TimeSegment | 'dayPeriod')[]>(
		pattern.flatMap((part) =>
			'segment' in part ? [part.segment] : 'dayPeriod' in part ? ['dayPeriod' as const] : []
		)
	);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	let periodRef = $state<HTMLButtonElement | null>(null);
	let drafts = $state<Partial<Record<TimeSegment, string>>>({});
	let draftPeriod = $state<TimeDayPeriod | null>(null);
	let draftInvalid = $state(false);
	let composingSegments = $state<ReadonlySet<TimeSegment>>(new Set());
	const visiblePeriod = $derived<TimeDayPeriod>(
		draftPeriod ?? ((valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am')
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			appearance,
			disabled: resolvedDisabled && !group,
			invalid: draftInvalid || resolvedInvalid,
			size: resolvedSize
		})
	);
	const segmentClass = $derived(zui.recipe(segmentRecipe, { size: resolvedSize }));
	const periodClass = $derived(zui.recipe(periodRecipe, { size: resolvedSize }));
	const contentClass = $derived(
		zui.icss((s) => {
			s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight);
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const localDraftState = $derived.by<FormControlDraftState>(() => inspectDraftState());

	function draftMessage(kind: 'incomplete' | 'invalid' | 'required'): string {
		if (kind === 'required') return zui.localePack.form.requiredValue;
		if (kind === 'incomplete') return zui.localePack.time.incompleteTime;
		return zui.localePack.time.invalidTime;
	}
	function parseSegmentNumber(raw: string): number | undefined {
		const parsed = parseLocalizedNumber(raw, resolvedLocale);
		return parsed.valid && Number.isInteger(parsed.value) && (parsed.value ?? -1) >= 0
			? parsed.value
			: undefined;
	}
	function formatSegmentNumber(value: number): string {
		return new Intl.NumberFormat(resolvedLocale, {
			maximumFractionDigits: 0,
			minimumIntegerDigits: 2,
			useGrouping: false
		}).format(value);
	}

	function inspectDraftState(): FormControlDraftState {
		const entries = Object.entries(drafts) as [TimeSegment, string][];
		const dirty = entries.length > 0 || draftPeriod !== null;
		if (!dirty) {
			const current = valueState.current;
			const requiredMissing = resolvedRequired && current === null;
			const constrained = Boolean(current && unavailable(current));
			const valid = !requiredMissing && !constrained;
			return Object.freeze({
				dirty: false,
				message: valid ? undefined : draftMessage(requiredMissing ? 'required' : 'invalid'),
				valid
			});
		}
		if (
			(valueState.current === null && segments.some((segment) => drafts[segment] === undefined)) ||
			entries.some(([, raw]) => raw.length < 2)
		)
			return Object.freeze({ dirty: true, message: draftMessage('incomplete'), valid: false });
		if (entries.some(([, raw]) => raw.length > 2 || parseSegmentNumber(raw) === undefined))
			return Object.freeze({ dirty: true, message: draftMessage('invalid'), valid: false });
		let hour =
			drafts.hour === undefined
				? (valueState.current?.hour ?? resolvedPlaceholderValue.hour)
				: parseSegmentNumber(drafts.hour)!;
		const enteredHour = drafts.hour === undefined ? hour : parseSegmentNumber(drafts.hour)!;
		const minute =
			granularity === 'hour'
				? (valueState.current?.minute ?? resolvedPlaceholderValue.minute)
				: drafts.minute === undefined
					? (valueState.current?.minute ?? resolvedPlaceholderValue.minute)
					: parseSegmentNumber(drafts.minute)!;
		const second =
			granularity === 'second'
				? drafts.second === undefined
					? (valueState.current?.second ?? resolvedPlaceholderValue.second)
					: parseSegmentNumber(drafts.second)!
				: (valueState.current?.second ?? resolvedPlaceholderValue.second);
		const millisecond = valueState.current?.millisecond ?? resolvedPlaceholderValue.millisecond;
		if (hourCycle === 12 && drafts.hour !== undefined) {
			const pm =
				(draftPeriod ??
					((valueState.current?.hour ?? resolvedPlaceholderValue.hour) >= 12 ? 'pm' : 'am')) ===
				'pm';
			hour = (hour % 12) + (pm ? 12 : 0);
		}
		const inRange =
			Number.isInteger(hour) &&
			Number.isInteger(minute) &&
			Number.isInteger(second) &&
			(hourCycle !== 12 || drafts.hour === undefined || (enteredHour >= 1 && enteredHour <= 12)) &&
			hour >= 0 &&
			hour <= 23 &&
			minute >= 0 &&
			minute <= 59 &&
			second >= 0 &&
			second <= 59;
		const valid = inRange && !unavailable(new Time(hour, minute, second, millisecond));
		return Object.freeze({
			dirty: true,
			message: valid ? undefined : draftMessage('invalid'),
			valid
		});
	}

	function syncInputs(next: Time | null): void {
		for (const [index, segment] of segments.entries()) {
			let raw =
				segment === 'hour' ? next?.hour : segment === 'minute' ? next?.minute : next?.second;
			if (raw !== undefined && segment === 'hour' && hourCycle === 12) raw = raw % 12 || 12;
			if (inputs[index]) inputs[index].value = raw === undefined ? '' : formatSegmentNumber(raw);
		}
	}

	function display(segment: TimeSegment): string {
		if (drafts[segment] !== undefined) return drafts[segment]!;
		const current = valueState.current;
		if (!current) return '';
		let raw =
			segment === 'hour' ? current.hour : segment === 'minute' ? current.minute : current.second;
		if (segment === 'hour' && hourCycle === 12) raw = raw % 12 || 12;
		return formatSegmentNumber(raw);
	}

	function clamp(next: Time): Time {
		if (minValue && next.compare(minValue) < 0) return minValue;
		if (maxValue && next.compare(maxValue) > 0) return maxValue;
		return next;
	}

	function unavailable(next: Time): boolean {
		return Boolean(
			(minValue && next.compare(minValue) < 0) ||
			(maxValue && next.compare(maxValue) > 0) ||
			isTimeUnavailable?.(next)
		);
	}

	function commit(markIncomplete = true): boolean {
		if (Object.keys(drafts).length === 0) return true;
		if (
			valueState.current === null &&
			segments.some(
				(segment) =>
					(drafts[segment]?.length ?? 0) !== 2 ||
					parseSegmentNumber(drafts[segment] ?? '') === undefined
			)
		) {
			draftInvalid = markIncomplete;
			return false;
		}
		let hour =
			drafts.hour === undefined
				? (valueState.current?.hour ?? resolvedPlaceholderValue.hour)
				: (parseSegmentNumber(drafts.hour) ?? Number.NaN);
		const enteredHour = hour;
		// Editing visible segments preserves the other units of an existing typed Time.
		const minute =
			granularity === 'hour'
				? (valueState.current?.minute ?? resolvedPlaceholderValue.minute)
				: drafts.minute === undefined
					? (valueState.current?.minute ?? resolvedPlaceholderValue.minute)
					: (parseSegmentNumber(drafts.minute) ?? Number.NaN);
		const second =
			granularity === 'second'
				? drafts.second === undefined
					? (valueState.current?.second ?? resolvedPlaceholderValue.second)
					: (parseSegmentNumber(drafts.second) ?? Number.NaN)
				: (valueState.current?.second ?? resolvedPlaceholderValue.second);
		const millisecond = valueState.current?.millisecond ?? resolvedPlaceholderValue.millisecond;
		if (hourCycle === 12 && drafts.hour !== undefined) {
			const pm =
				(draftPeriod ??
					((valueState.current?.hour ?? resolvedPlaceholderValue.hour) >= 12 ? 'pm' : 'am')) ===
				'pm';
			hour = (hour % 12) + (pm ? 12 : 0);
		}
		if (![hour, minute, second].every(Number.isInteger)) {
			draftInvalid = markIncomplete;
			return false;
		}
		if (
			(hourCycle === 12 && drafts.hour !== undefined && (enteredHour < 1 || enteredHour > 12)) ||
			hour < 0 ||
			hour > 23 ||
			minute < 0 ||
			minute > 59 ||
			second < 0 ||
			second > 59
		) {
			draftInvalid = true;
			return false;
		}
		const next = new Time(hour, minute, second, millisecond);
		if (unavailable(next)) {
			draftInvalid = true;
			return false;
		}
		if (!valueState.setFromUser(next)) {
			rollbackDraft();
			return false;
		}
		drafts = {};
		draftPeriod = null;
		draftInvalid = false;
		return true;
	}

	function cycle(segment: TimeSegment, amount: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? resolvedPlaceholderValue;
		const step =
			segment === 'minute'
				? constraints.minuteStep
				: segment === 'second'
					? constraints.secondStep
					: 1;
		let next = clamp(base.cycle(segment, amount * step));
		for (let attempts = 0; attempts < 60 && unavailable(next); attempts += 1)
			next = clamp(next.cycle(segment, amount * step));
		if (unavailable(next)) return;
		if (!valueState.setFromUser(next)) {
			rollbackDraft();
			return;
		}
		drafts = {};
		draftPeriod = null;
		draftInvalid = false;
	}

	function focusElement(key: TimeSegment | 'dayPeriod'): void {
		const target = key === 'dayPeriod' ? periodRef : inputs[segments.indexOf(key)];
		target?.focus({ preventScroll: true });
		if (target && 'select' in target && typeof target.select === 'function') target.select();
	}

	function move(index: number, intent: NavigationIntent): void {
		const target = moveIndex(focusOrder.length, index, intent, false);
		const key = focusOrder[target];
		if (key) focusElement(key);
	}

	function handleKey(event: KeyboardEvent, segment: TimeSegment, index: number): void {
		if (event.isComposing || composingSegments.has(segment)) return;
		const intent = navigationIntent(
			event.key,
			'horizontal',
			getElementDirection(ref, zui.direction)
		);
		if (intent) {
			event.preventDefault();
			move(index, intent);
			return;
		}
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				cycle(segment, event.key === 'ArrowUp' ? 1 : -1);
				return;
			case 'Enter':
				event.preventDefault();
				commit();
				return;
			case 'Escape':
				event.preventDefault();
				rollbackDraft();
				return;
			default:
				return;
		}
	}

	function togglePeriod(): void {
		if (resolvedDisabled || resolvedReadonly) return;
		if (Object.keys(drafts).length > 0 || !valueState.current) {
			const current = draftPeriod ?? ((valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am');
			draftPeriod = current === 'am' ? 'pm' : 'am';
			return;
		}
		const base = valueState.current ?? resolvedPlaceholderValue;
		if (!valueState.setFromUser(clamp(base.cycle('hour', 12)))) rollbackDraft();
	}

	function handlePeriodKey(event: KeyboardEvent): void {
		const index = focusOrder.indexOf('dayPeriod');
		const intent = navigationIntent(
			event.key,
			'horizontal',
			getElementDirection(ref, zui.direction)
		);
		if (intent) {
			event.preventDefault();
			move(index, intent);
			return;
		}
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			togglePeriod();
		}
	}

	function resetFromForm(): void {
		valueState.reset();
		drafts = {};
		draftPeriod = null;
		draftInvalid = false;
		composingSegments = new Set();
		onFormReset?.();
	}

	export function rollbackDraft(): void {
		drafts = {};
		draftPeriod = null;
		draftInvalid = false;
		composingSegments = new Set();
		syncInputs(valueState.current);
	}

	function updateDraft(
		nextDraft: string,
		segment: TimeSegment,
		focusIndex: number,
		commitWhenComplete: boolean,
		advanceWhenComplete = true
	): void {
		drafts = { ...drafts, [segment]: nextDraft };
		if (valueState.current === null)
			drafts = Object.fromEntries(
				segments.map((key, inputIndex) => [
					key,
					key === segment ? nextDraft : (inputs[inputIndex]?.value ?? '')
				])
			) as Partial<Record<TimeSegment, string>>;
		if (commitWhenComplete && inputs.every((input) => !input?.value)) {
			if (!valueState.setFromUser(null)) {
				rollbackDraft();
				return;
			}
			drafts = {};
			draftPeriod = null;
			draftInvalid = false;
			return;
		}
		if (
			commitWhenComplete &&
			nextDraft.length === 2 &&
			parseSegmentNumber(nextDraft) !== undefined
		) {
			if (commit(false) && advanceWhenComplete && focusIndex < focusOrder.length - 1)
				move(focusIndex, 'next');
		}
	}

	function handleInput(
		event: Event & { currentTarget: HTMLInputElement },
		segment: TimeSegment,
		focusIndex: number
	): void {
		const composing =
			composingSegments.has(segment) || ('isComposing' in event && event.isComposing === true);
		updateDraft(event.currentTarget.value, segment, focusIndex, !composing);
	}

	function handleCompositionStart(segment: TimeSegment): void {
		composingSegments = new Set([...composingSegments, segment]);
	}

	function handleCompositionEnd(
		event: CompositionEvent & { currentTarget: HTMLInputElement },
		segment: TimeSegment,
		focusIndex: number
	): void {
		// Copy-on-write composition membership is published only after this local mutation.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const next = new Set(composingSegments);
		next.delete(segment);
		composingSegments = next;
		updateDraft(
			event.currentTarget.value,
			segment,
			focusIndex,
			true,
			getActiveElement(event.currentTarget) === event.currentTarget
		);
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		if (
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		)
			return;
		if (composingSegments.size > 0) return;
		commit();
	}

	onDestroy(fieldOwner.registerFocusOwner(() => inputs[0]?.focus({ preventScroll: true })));
	if (group && untrack(() => formParticipation === 'auto'))
		onDestroy(group.registerControl({ focus: () => inputs[0]?.focus({ preventScroll: true }) }));
	$effect(() => {
		const state = localDraftState;
		untrack(() => onDraftChange?.(state));
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	dir={resolvedDirection}
	data-zui-composite-control=""
	data-zui-input-group-control={group ? '' : undefined}
	aria-label={labelledBy ? undefined : (ariaLabel ?? zui.localePack.time.timeFieldLabel)}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	aria-disabled={resolvedDisabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={draftInvalid || resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	onfocusout={handleFocusOut}
>
	{#each pattern as part, partIndex (partIndex)}
		{#if 'literal' in part}<span aria-hidden="true">{part.literal}</span
			>{:else if 'segment' in part}
			{@const segment = part.segment}
			{@const index = segments.indexOf(segment)}
			{@const focusIndex = focusOrder.indexOf(segment)}
			<input
				bind:this={inputs[index]}
				class={[segmentClass, contentClass]}
				id={index === 0 ? idBase : `${idBase}-${segment}`}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				value={display(segment)}
				maxlength={2}
				disabled={resolvedDisabled}
				readonly={resolvedReadonly}
				required={resolvedRequired}
				aria-label={index === 0 && field
					? undefined
					: (segmentLabel?.(segment) ?? zui.localePack.time[segment])}
				aria-labelledby={index === 0 ? labelledBy : undefined}
				aria-describedby={describedBy}
				aria-invalid={draftInvalid || resolvedInvalid ? 'true' : ariaInvalid}
				aria-readonly={resolvedReadonly || undefined}
				aria-required={resolvedRequired || undefined}
				onfocus={(event) => event.currentTarget.select()}
				oninput={(event) => handleInput(event, segment, focusIndex)}
				oncompositionstart={() => handleCompositionStart(segment)}
				oncompositionend={(event) => handleCompositionEnd(event, segment, focusIndex)}
				onkeydown={(event) => handleKey(event, segment, focusIndex)}
			/>
		{:else}
			<button
				bind:this={periodRef}
				type="button"
				class={[periodClass, contentClass]}
				data-slot="day-period"
				disabled={resolvedDisabled || resolvedReadonly}
				aria-disabled={resolvedReadonly || undefined}
				aria-label={toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod}
				onclick={togglePeriod}
				onkeydown={handlePeriodKey}
				>{dayPeriodLabel?.(visiblePeriod) ?? zui.localePack.time[visiblePeriod]}</button
			>
		{/if}
	{/each}
</div>
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		{form}
		name={resolvedName}
		onReset={resetFromForm}
		value={valueState.current?.toString()}
	/>
{/if}
