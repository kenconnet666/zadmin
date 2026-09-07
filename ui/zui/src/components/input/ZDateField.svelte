<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { supportedDisplayCalendars, type DateFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { compositeInputDisabledStyles } from '../../runtime/foundation/control-styles.js';

	export type DateSegment = DateFieldSegment;
	export type DateFieldAppearance = 'bare' | 'field';
	export type DateFieldFormParticipation = 'auto' | 'none';
	export type DateFieldSize = ZControlSize;

	export interface ZDateFieldProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly appearance?: DateFieldAppearance;
		readonly controlId?: string;
		readonly defaultValue?: CalendarDateValue | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formParticipation?: DateFieldFormParticipation;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: CalendarDateValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly onDraftChange?: (state: FormControlDraftState) => void;
		readonly onFormReset?: () => void;
		readonly onValueChange?: (value: CalendarDateValue | null) => void;
		readonly placeholderValue?: CalendarDateValue;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly segmentLabel?: (segment: DateSegment) => string;
		readonly size?: DateFieldSize;
		readonly timeZone?: string;
		value?: CalendarDateValue | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'date-field',
		importStatement: "import { ZDateField } from '@zadmin/zui';",
		name: 'ZDateField',
		bindings: [
			{
				description: 'CalendarDate值；null是显式空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'locale segment order',
			'FormControlState',
			'FormValue'
		],
		events: [
			{
				description: '本地segment草稿的原子有效性、脏状态与本地化消息。',
				name: 'onDraftChange',
				type: '(state: FormControlDraftState) => void'
			},
			{
				description: '完整日期或清空变化。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
			},
			{
				description: '所属form reset恢复defaultValue并清理segment草稿后调用。',
				name: 'onFormReset',
				type: '() => void'
			}
		],
		keyboard: [
			{ description: '增减当前segment。', key: 'ArrowUp / ArrowDown' },
			{ description: '按locale顺序移动segment。', key: 'ArrowLeft / ArrowRight' },
			{ description: '移动到首尾segment。', key: 'Home / End' },
			{ description: '提交完整segment草稿。', key: 'Enter' },
			{ description: '放弃未提交草稿并恢复当前值。', key: 'Escape' }
		],
		parts: [{ description: 'display calendar的era/year/month/day原生控件。', name: 'segment' }],
		props: [
			{
				default: "'field'",
				description: '独立边框或供DatePicker/InputGroup复用的bare外观。',
				name: 'appearance',
				type: "'bare' | 'field'"
			},
			{
				bindable: true,
				default: 'null',
				description: '日期值；null是受控空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'undefined',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				default: 'today(timeZone)',
				description:
					'空值首次编辑或键盘步进的日期参考；其calendar在没有current/default owner时建立模型历法。',
				name: 'placeholderValue',
				type: 'CalendarDate'
			},
			{
				default: 'Field controlId或自动生成',
				description: '第一个locale日期segment的DOM id，其余segment派生独立id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: '禁用所有原生segment输入并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '与不完整/非法草稿合并后投射到根和每个segment。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '保留原生segment焦点和值提交，但阻止编辑与步进。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射到每个可编辑日期segment的原生required语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '额外日期可用性谓词，同时约束完整草稿提交与键盘步进。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Provider locale',
				description:
					'决定Unicode ca display calendar、segment顺序、era标签与本地数字解析/格式；不改写模型calendar。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone或UTC',
				description: 'today与locale segment pattern使用的SSR稳定IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'localePack.date对应segment',
				description: '覆盖era、year、month、day segment可访问名称。',
				name: 'segmentLabel',
				type: '(segment: DateSegment) => string'
			},
			{ default: 'undefined', description: '最小日期。', name: 'minValue', type: 'CalendarDate' },
			{ default: 'undefined', description: '最大日期。', name: 'maxValue', type: 'CalendarDate' },
			{
				default: 'Field context或undefined',
				description: 'formParticipation为auto时提交ISO日期的隐藏字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: 'formParticipation为auto时关联唯一FormValueBridge。',
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
				default: 'Field > componentDefaults.dateField > input > density',
				description: '统一group padding、segment高度与字号。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateField.svelte',
		states: [
			{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] },
			{
				description: 'locale解析并由实际算法承载的display calendar。',
				name: 'data-calendar',
				values: supportedDisplayCalendars
			},
			{
				description: '解析后的五档控件尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'stable',
		summary:
			'按locale display calendar编辑era/year/month/day、回写原CalendarDate owner并桥接表单的Date Field。'
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
			era: { false: () => undefined, true: (s) => s.width.auto },
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
			},
			year: { false: () => undefined, true: (s) => s.width.ch(4) }
		},
		defaultVariants: { era: false, size: 'medium', year: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, segmentRecipe);
</script>

<script lang="ts">
	import { CalendarDate, today, type Calendar } from '@internationalized/date';
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
		calendarEraOptions,
		dateFieldPattern,
		isDateUnavailable as dateIsUnavailable,
		normalizeCalendarDateModelValue,
		preserveCalendarOwner,
		resolveDisplayCalendar,
		resolveOwnerCalendar,
		toDisplayCalendar,
		type CalendarEraOption
	} from '../../runtime/date.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import { parseLocalizedNumber } from '../../runtime/number.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		appearance = 'field',
		class: className,
		controlId,
		defaultValue,
		disabled = false,
		dir: dirProp,
		form,
		formParticipation = 'auto',
		invalid: invalidProp = false,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		onDraftChange,
		onFormReset,
		onValueChange,
		placeholderValue,
		readonly = false,
		ref = $bindable(null),
		required = false,
		segmentLabel,
		size,
		style,
		timeZone,
		value = $bindable(),
		...rest
	}: ZDateFieldProps = $props();
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
			createZuiId(zui.idPrefix, uid, 'date-field')
	);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDirection = $derived(dirProp ?? zui.direction);
	const normalizedDefaultValue = $derived(
		normalizeCalendarDateModelValue(defaultValue, 'ZDateField defaultValue')
	);
	const resolvedPlaceholderValue = $derived.by(() => {
		if (placeholderValue === undefined) return today(resolvedTimeZone);
		const normalized = normalizeCalendarDateModelValue(
			placeholderValue,
			'ZDateField placeholderValue'
		);
		if (!normalized) throw new TypeError('ZDateField placeholderValue cannot be null.');
		return normalized;
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
				zui.componentDefaults.dateField?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const constraints = $derived.by(() => {
		const min =
			minValue === undefined
				? undefined
				: (normalizeCalendarDateModelValue(minValue, 'ZDateField minValue') ?? undefined);
		const max =
			maxValue === undefined
				? undefined
				: (normalizeCalendarDateModelValue(maxValue, 'ZDateField maxValue') ?? undefined);
		if (min && max && min.compare(max) > 0)
			throw new RangeError('ZDateField minValue cannot exceed maxValue.');
		return { maxValue: max, minValue: min };
	});
	const valueState = createFormControlState<CalendarDate | null>(
		{
			defaultValue: () => normalizedDefaultValue,
			draftState: () => inspectDraftState(),
			element: () => ref,
			normalizeModelValue: (candidate) => normalizeCalendarDateModelValue(candidate, 'ZDateField'),
			onChange: () => onValueChange,
			owner: 'ZDateField',
			read: () => value,
			resetDraft: rollbackDraft,
			syncNative: (next) => syncInputs(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	let drafts = $state<Partial<Record<DateSegment, string>>>({});
	let draftInvalid = $state(false);
	type DateSegmentControl = HTMLInputElement | HTMLSelectElement;
	const inputs = $state<(DateSegmentControl | null)[]>([]);
	const displayCalendar = $derived(resolveDisplayCalendar(resolvedLocale));
	let rememberedOwnerCalendar = $state.raw<Calendar | null>(
		untrack(
			() =>
				valueState.current?.calendar ??
				normalizedDefaultValue?.calendar ??
				(placeholderValue === undefined ? null : resolvedPlaceholderValue.calendar)
		)
	);
	const configuredOwnerCalendar = $derived(
		valueState.current?.calendar ??
			normalizedDefaultValue?.calendar ??
			(placeholderValue === undefined ? null : resolvedPlaceholderValue.calendar)
	);
	const ownerCalendar = $derived<Calendar>(
		configuredOwnerCalendar ?? rememberedOwnerCalendar ?? resolveOwnerCalendar()
	);
	const displayValue = $derived(
		valueState.current ? toDisplayCalendar(valueState.current, displayCalendar) : null
	);
	const ownerReference = $derived(
		valueState.current ?? normalizedDefaultValue ?? resolvedPlaceholderValue
	);
	const displayReference = $derived(toDisplayCalendar(ownerReference, displayCalendar));
	const eraOptions = $derived<readonly CalendarEraOption[]>(
		calendarEraOptions(displayReference, resolvedLocale, resolvedTimeZone)
	);
	const pattern = $derived(dateFieldPattern(resolvedLocale, resolvedTimeZone, displayReference));
	$effect(() => {
		const next = configuredOwnerCalendar;
		if (next) rememberedOwnerCalendar = next;
	});
	const segmentOrder = $derived(
		pattern.flatMap((part) => ('segment' in part ? [part.segment] : []))
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			appearance,
			disabled: resolvedDisabled && !group,
			invalid: draftInvalid || resolvedInvalid,
			size: resolvedSize
		})
	);
	const contentClass = $derived(
		zui.icss((s) => {
			s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight);
		})
	);
	const yearWidthClass = $derived(zui.icss((s) => s.width.ch(maximumSegmentLength('year')!)));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const localDraftState = $derived.by<FormControlDraftState>(() => inspectDraftState());

	function draftMessage(kind: 'incomplete' | 'invalid' | 'required'): string {
		if (kind === 'required') return zui.localePack.form.requiredValue;
		if (kind === 'incomplete') return zui.localePack.date.incompleteDate;
		return zui.localePack.date.invalidDate;
	}
	function fixedSegmentLength(segment: DateSegment): number | undefined {
		if (segment === 'era') return undefined;
		if (segment === 'year' && displayCalendar.identifier !== 'gregory') return undefined;
		return segment === 'year' ? 4 : 2;
	}
	function maximumSegmentLength(segment: DateSegment): number | undefined {
		if (segment === 'era') return undefined;
		if (segment === 'year')
			return displayCalendar.identifier === 'gregory'
				? 4
				: String(displayCalendar.getYearsInEra(displayReference)).length;
		return 2;
	}
	function parseSegmentNumber(raw: string): number | undefined {
		const parsed = parseLocalizedNumber(raw, resolvedLocale);
		return parsed.valid && Number.isInteger(parsed.value) && (parsed.value ?? 0) > 0
			? parsed.value
			: undefined;
	}
	function segmentIncomplete(segment: DateSegment, raw: string): boolean {
		if (!raw) return true;
		const fixed = fixedSegmentLength(segment);
		return fixed !== undefined && raw.length < fixed;
	}
	function segmentInvalid(segment: DateSegment, raw: string): boolean {
		if (segment === 'era') return !displayCalendar.getEras().includes(raw);
		const maximum = maximumSegmentLength(segment)!;
		const fixed = fixedSegmentLength(segment);
		return (
			raw.length > maximum ||
			(fixed !== undefined && raw.length !== fixed) ||
			parseSegmentNumber(raw) === undefined
		);
	}
	function formatSegmentNumber(value: number, segment: Exclude<DateSegment, 'era'>): string {
		return new Intl.NumberFormat(resolvedLocale, {
			maximumFractionDigits: 0,
			minimumIntegerDigits: fixedSegmentLength(segment) ?? 1,
			useGrouping: false
		}).format(value);
	}
	function displayCandidate(): CalendarDate | null {
		const reference = displayValue ?? displayReference;
		const era = drafts.era ?? reference.era;
		const year = drafts.year === undefined ? reference.year : parseSegmentNumber(drafts.year);
		const month = drafts.month === undefined ? reference.month : parseSegmentNumber(drafts.month);
		const day = drafts.day === undefined ? reference.day : parseSegmentNumber(drafts.day);
		if (
			!displayCalendar.getEras().includes(era) ||
			year === undefined ||
			month === undefined ||
			day === undefined
		)
			return null;
		try {
			const candidate = new CalendarDate(displayCalendar, era, year, month, day);
			return candidate.era === era &&
				candidate.year === year &&
				candidate.month === month &&
				candidate.day === day
				? candidate
				: null;
		} catch {
			return null;
		}
	}
	function ownerCandidate(candidate: CalendarDate): CalendarDate {
		return preserveCalendarOwner(candidate, ownerCalendar);
	}
	function candidateUnavailable(candidate: CalendarDate): boolean {
		return dateIsUnavailable(
			candidate,
			constraints.minValue,
			constraints.maxValue,
			isDateUnavailable
		);
	}

	function inspectDraftState(): FormControlDraftState {
		const rules = constraints;
		const entries = Object.entries(drafts) as [DateSegment, string][];
		if (entries.length === 0) {
			const current = valueState.current;
			const requiredMissing = resolvedRequired && current === null;
			const constrained = Boolean(
				current && dateIsUnavailable(current, rules.minValue, rules.maxValue, isDateUnavailable)
			);
			const valid = !requiredMissing && !constrained;
			return Object.freeze({
				dirty: false,
				message: valid ? undefined : draftMessage(requiredMissing ? 'required' : 'invalid'),
				valid
			});
		}
		if (
			(valueState.current === null && segmentOrder.some((segment) => !drafts[segment])) ||
			entries.some(([segment, raw]) => segmentIncomplete(segment, raw))
		)
			return Object.freeze({ dirty: true, message: draftMessage('incomplete'), valid: false });
		if (entries.some(([segment, raw]) => segmentInvalid(segment, raw)))
			return Object.freeze({ dirty: true, message: draftMessage('invalid'), valid: false });
		const displayed = displayCandidate();
		const valid = Boolean(displayed && !candidateUnavailable(ownerCandidate(displayed)));
		return Object.freeze({
			dirty: true,
			message: valid ? undefined : draftMessage('invalid'),
			valid
		});
	}

	function syncInputs(next: CalendarDate | null): void {
		const displayed = next ? toDisplayCalendar(next, displayCalendar) : null;
		for (const [index, segment] of segmentOrder.entries()) {
			const control = inputs[index];
			if (!control) continue;
			if (segment === 'era') {
				control.value = displayed?.era ?? displayReference.era;
				continue;
			}
			const raw =
				segment === 'year'
					? displayed?.year
					: segment === 'month'
						? displayed?.month
						: displayed?.day;
			control.value =
				raw === undefined ? '' : formatSegmentNumber(raw, segment as Exclude<DateSegment, 'era'>);
		}
	}

	function segmentValue(segment: DateSegment): string {
		const draft = drafts[segment];
		if (draft !== undefined) return draft;
		if (segment === 'era') return displayValue?.era ?? displayReference.era;
		const current = displayValue;
		if (!current) return '';
		const raw =
			segment === 'year' ? current.year : segment === 'month' ? current.month : current.day;
		return formatSegmentNumber(raw, segment as Exclude<DateSegment, 'era'>);
	}
	function segmentClass(segment: DateSegment): unknown[] {
		return [
			zui.recipe(segmentRecipe, {
				era: segment === 'era',
				size: resolvedSize,
				year: segment === 'year'
			}),
			contentClass,
			segment === 'year' && yearWidthClass
		];
	}

	function commitDrafts(markIncomplete = true): boolean {
		if (Object.keys(drafts).length === 0) return true;
		if (
			valueState.current === null &&
			segmentOrder.some((segment) => !drafts[segment] || segmentInvalid(segment, drafts[segment]!))
		) {
			draftInvalid = markIncomplete;
			return false;
		}
		const displayed = displayCandidate();
		if (!displayed) {
			draftInvalid = true;
			return false;
		}
		const next = ownerCandidate(displayed);
		if (candidateUnavailable(next)) {
			draftInvalid = true;
			return false;
		}
		if (!valueState.setFromUser(next)) {
			rollbackDraft();
			return false;
		}
		drafts = {};
		draftInvalid = false;
		return true;
	}

	function availableFrom(candidate: CalendarDate, direction: -1 | 1): CalendarDate | null {
		let next = candidate;
		let owned = ownerCandidate(next);
		if (constraints.minValue && owned.compare(constraints.minValue) < 0) {
			next = toDisplayCalendar(constraints.minValue, displayCalendar);
			owned = ownerCandidate(next);
		}
		if (constraints.maxValue && owned.compare(constraints.maxValue) > 0) {
			next = toDisplayCalendar(constraints.maxValue, displayCalendar);
			owned = ownerCandidate(next);
		}
		for (let attempts = 0; attempts < 3660; attempts += 1) {
			if (!candidateUnavailable(owned)) return owned;
			const stepped = next.add({ days: direction });
			const steppedOwner = ownerCandidate(stepped);
			if (
				(constraints.minValue && steppedOwner.compare(constraints.minValue) < 0) ||
				(constraints.maxValue && steppedOwner.compare(constraints.maxValue) > 0)
			)
				return null;
			next = stepped;
			owned = steppedOwner;
		}
		return null;
	}

	function cycle(segment: DateSegment, amount: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const next = availableFrom(displayReference.cycle(segment, amount), amount < 0 ? -1 : 1);
		if (!next) return;
		if (!valueState.setFromUser(next)) {
			rollbackDraft();
			return;
		}
		drafts = {};
		draftInvalid = false;
	}

	function move(index: number, intent: NavigationIntent): void {
		const target = moveIndex(segmentOrder.length, index, intent, false);
		focusSegment(target);
	}

	function focusSegment(index: number): void {
		const control = inputs[index];
		control?.focus({ preventScroll: true });
		if (control?.tagName === 'INPUT') (control as HTMLInputElement).select();
	}

	function handleKey(event: KeyboardEvent, segment: DateSegment, index: number): void {
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
				commitDrafts();
				return;
			case 'Escape':
				event.preventDefault();
				drafts = {};
				draftInvalid = false;
				return;
			default:
				return;
		}
	}

	function resetFromForm(): void {
		valueState.reset();
		drafts = {};
		draftInvalid = false;
		onFormReset?.();
	}

	export function rollbackDraft(): void {
		drafts = {};
		draftInvalid = false;
		syncInputs(valueState.current);
	}

	function handleInput(
		event: Event & { currentTarget: HTMLInputElement },
		segment: DateSegment,
		index: number
	): void {
		const nextDraft = event.currentTarget.value;
		drafts = { ...drafts, [segment]: nextDraft };
		if (valueState.current === null)
			drafts = Object.fromEntries(
				segmentOrder.map((key, inputIndex) => [
					key,
					inputIndex === index
						? nextDraft
						: key === 'era'
							? (inputs[inputIndex]?.value ?? '')
							: (inputs[inputIndex]?.value ?? '')
				])
			) as Partial<Record<DateSegment, string>>;
		if (segmentOrder.every((key, inputIndex) => key === 'era' || !inputs[inputIndex]?.value)) {
			if (!valueState.setFromUser(null)) {
				rollbackDraft();
				return;
			}
			drafts = {};
			draftInvalid = false;
			return;
		}
		const expectedLength = fixedSegmentLength(segment);
		if (
			expectedLength !== undefined &&
			nextDraft.length === expectedLength &&
			parseSegmentNumber(nextDraft) !== undefined
		) {
			commitDrafts(false);
			if (index < segmentOrder.length - 1) move(index, 'next');
		}
	}

	function handleEraChange(event: Event & { currentTarget: HTMLSelectElement }): void {
		if (resolvedDisabled || resolvedReadonly || event.currentTarget.matches(':disabled')) {
			syncInputs(valueState.current);
			return;
		}
		drafts = { ...drafts, era: event.currentTarget.value };
		commitDrafts(false);
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		if (
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		)
			return;
		commitDrafts();
	}

	onDestroy(fieldOwner.registerFocusOwner(() => focusSegment(0)));
	if (group && formParticipation === 'auto')
		onDestroy(group.registerControl({ focus: () => focusSegment(0) }));
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
	aria-label={labelledBy ? undefined : (ariaLabel ?? zui.localePack.date.dateFieldLabel)}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	aria-disabled={resolvedDisabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-calendar={displayCalendar.identifier}
	data-invalid={draftInvalid || resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	onfocusout={handleFocusOut}
>
	{#each pattern as part, partIndex (partIndex)}
		{#if 'literal' in part}<span aria-hidden="true">{part.literal}</span>{:else}
			{@const index = segmentOrder.indexOf(part.segment)}
			{#if part.segment === 'era'}
				<select
					bind:this={inputs[index]}
					class={segmentClass(part.segment)}
					id={index === 0 ? idBase : `${idBase}-${part.segment}`}
					autocomplete="off"
					value={segmentValue(part.segment)}
					disabled={resolvedDisabled}
					required={resolvedRequired}
					aria-label={index === 0 && field
						? undefined
						: (segmentLabel?.(part.segment) ?? zui.localePack.date[part.segment])}
					aria-labelledby={index === 0 ? labelledBy : undefined}
					aria-describedby={describedBy}
					aria-invalid={draftInvalid || resolvedInvalid ? 'true' : ariaInvalid}
					aria-readonly={resolvedReadonly || undefined}
					aria-required={resolvedRequired || undefined}
					onchange={handleEraChange}
					onkeydown={(event) => handleKey(event, part.segment, index)}
				>
					{#each eraOptions as option (option.identifier)}
						<option value={option.identifier}>{option.label}</option>
					{/each}
				</select>
			{:else}
				<input
					bind:this={inputs[index]}
					class={segmentClass(part.segment)}
					id={index === 0 ? idBase : `${idBase}-${part.segment}`}
					type="text"
					inputmode="numeric"
					autocomplete="off"
					value={segmentValue(part.segment)}
					maxlength={maximumSegmentLength(part.segment)}
					disabled={resolvedDisabled}
					readonly={resolvedReadonly}
					required={resolvedRequired}
					aria-label={index === 0 && field
						? undefined
						: (segmentLabel?.(part.segment) ?? zui.localePack.date[part.segment])}
					aria-labelledby={index === 0 ? labelledBy : undefined}
					aria-describedby={describedBy}
					aria-invalid={draftInvalid || resolvedInvalid ? 'true' : ariaInvalid}
					aria-readonly={resolvedReadonly || undefined}
					aria-required={resolvedRequired || undefined}
					onfocus={(event) => event.currentTarget.select()}
					oninput={(event) => handleInput(event, part.segment, index)}
					onkeydown={(event) => handleKey(event, part.segment, index)}
				/>
			{/if}
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
