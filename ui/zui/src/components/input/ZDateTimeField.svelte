<script module lang="ts">
	import { CalendarDateTime, ZonedDateTime } from '@internationalized/date';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { DateTimeDisambiguation, DateTimeGranularity } from '../../runtime/date-time.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';

	export type DateTimeFieldSize = ZControlSize;
	export type DateTimeFieldFormParticipation = 'auto' | 'none';

	interface ZDateTimeFieldSharedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly controlId?: string;
		readonly disabled?: boolean;
		readonly disambiguation?: DateTimeDisambiguation;
		readonly form?: string;
		readonly formParticipation?: DateTimeFieldFormParticipation;
		readonly granularity?: DateTimeGranularity;
		readonly hideTimeZone?: boolean;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly locale?: string;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly onDraftChange?: (state: FormControlDraftState) => void;
		readonly onFormReset?: () => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly size?: DateTimeFieldSize;
		readonly suffixAction?: Snippet;
		readonly timeZone?: string;
	}

	interface ZDateTimeFieldLocalValueProps {
		readonly defaultValue?: CalendarDateTime | null;
		readonly isDateTimeUnavailable?: (value: CalendarDateTime) => boolean;
		readonly maxValue?: CalendarDateTime;
		readonly minValue?: CalendarDateTime;
		readonly mode?: 'local';
		readonly onValueChange?: (value: CalendarDateTime | null) => void;
		readonly placeholderValue?: CalendarDateTime;
		value?: CalendarDateTime | null;
	}

	interface ZDateTimeFieldZonedValueProps {
		readonly defaultValue?: ZonedDateTime | null;
		readonly isDateTimeUnavailable?: (value: ZonedDateTime) => boolean;
		readonly maxValue?: ZonedDateTime;
		readonly minValue?: ZonedDateTime;
		readonly mode: 'zoned';
		readonly onValueChange?: (value: ZonedDateTime | null) => void;
		readonly placeholderValue?: ZonedDateTime;
		value?: ZonedDateTime | null;
	}

	export interface ZDateTimeFieldLocalProps
		extends ZDateTimeFieldSharedProps, ZDateTimeFieldLocalValueProps {}
	export interface ZDateTimeFieldZonedProps
		extends ZDateTimeFieldSharedProps, ZDateTimeFieldZonedValueProps {}
	export type ZDateTimeFieldProps = ZDateTimeFieldLocalProps | ZDateTimeFieldZonedProps;

	export const zuiMetadata = {
		category: 'input',
		id: 'date-time-field',
		importStatement: "import { ZDateTimeField } from '@zadmin/zui';",
		name: 'ZDateTimeField',
		bindings: [
			{
				description: '由mode判别的CalendarDateTime或ZonedDateTime；null是显式空值。',
				name: 'value',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{ description: '真实复合字段根元素。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'ZDateField',
			'ZTimeField',
			'ZInputGroup',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '完整且可用的日期时间或显式清空变化。',
				name: 'onValueChange',
				type: '(value: CalendarDateTime | ZonedDateTime | null) => void'
			},
			{
				description: '合成后的日期、时间、DST和联合约束草稿反馈。',
				name: 'onDraftChange',
				type: '(state: FormControlDraftState) => void'
			},
			{
				description: '所属form reset恢复defaultValue并清理日期时间草稿后调用。',
				name: 'onFormReset',
				type: '() => void'
			}
		],
		keyboard: [
			{ description: '按locale DOM顺序跨日期与时间segment移动。', key: 'ArrowLeft / ArrowRight' },
			{ description: '移动到整个日期时间字段的首尾segment。', key: 'Home / End' },
			{ description: '原子放弃日期和时间未提交草稿。', key: 'Escape' }
		],
		parts: [
			{ description: '日期和时间的唯一InputGroup边界。', name: 'input-group' },
			{ description: 'Gregorian日期segment子字段。', name: 'date-field' },
			{ description: 'wall-clock时间segment子字段。', name: 'time-field' },
			{ description: 'zoned模式的显示时区缩写。', name: 'time-zone' }
		],
		props: [
			{
				default: "'local'",
				description: '判别CalendarDateTime本地墙上时间与ZonedDateTime绝对时刻模型。',
				name: 'mode',
				requiredWhen: "zoned分支必须显式为'zoned'；local分支可省略或为'local'",
				type: "'local' | 'zoned'"
			},
			{
				bindable: true,
				default: 'null',
				description: 'mode判别的受控值；不会降级成CalendarDate。',
				name: 'value',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{
				default: 'null',
				description: 'mode判别的非受控初始值。',
				name: 'defaultValue',
				type: 'CalendarDateTime | ZonedDateTime | null'
			},
			{
				default: 'today at midnight',
				description: '空值首次分段编辑的日期、时间与zoned owner时区基准。',
				name: 'placeholderValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: "'minute'",
				description: '最小显示和编辑时间单位。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{ default: 'locale', description: '显式12或24小时制。', name: 'hourCycle', type: '12 | 24' },
			{
				default: 'Provider locale',
				description: 'segment顺序、数字和时区名称locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: 'zoned显示时区；已有值转换时保持instant。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'false',
				description: 'zoned模式隐藏显示时区缩写。',
				name: 'hideTimeZone',
				type: 'boolean'
			},
			{
				default: "'compatible'",
				description: 'DST gap/fold解析策略。',
				name: 'disambiguation',
				type: "'compatible' | 'earlier' | 'later' | 'reject'"
			},
			{
				default: 'undefined',
				description: 'mode判别的最小日期时间。',
				name: 'minValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: 'mode判别的最大日期时间。',
				name: 'maxValue',
				type: 'CalendarDateTime | ZonedDateTime'
			},
			{
				default: 'undefined',
				description: '完整日期时间联合不可用谓词。',
				name: 'isDateTimeUnavailable',
				type: '(value: CalendarDateTime | ZonedDateTime) => boolean'
			},
			{ default: '1', description: '分钟键盘步长。', name: 'minuteStep', type: 'number' },
			{ default: '1', description: '秒钟键盘步长。', name: 'secondStep', type: 'number' },
			{
				default: 'false或Field',
				description: '禁用全部segment并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false或Field',
				description: '阻止编辑并保留值提交。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false或Field',
				description: '空值产生草稿校验错误。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false或Field',
				description: '合并外部和Field无效显示，不反馈进本地草稿状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field name',
				description: '唯一ISO 8601隐藏表单值名称。',
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
				default: "'auto'",
				description: '上层Picker可设none，由上层唯一拥有FormValue scope、bridge和reset。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				default: 'undefined',
				description: '透传到唯一内部InputGroup的真实操作区。',
				name: 'suffixAction',
				type: 'Snippet'
			},
			{
				default: 'Field > componentDefaults.dateTimeField > input > density',
				description: '日期、时间和InputGroup共享尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Field controlId或自动生成',
				description: '首个日期segment的DOM id。',
				name: 'controlId',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '唯一内部InputGroup的逻辑结束操作区。',
				name: 'suffixAction',
				required: false,
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/input/ZDateTimeField.svelte',
		states: [
			{
				description: '外部、Field、草稿、联合约束或DST错误。',
				name: 'data-invalid',
				values: ['true']
			},
			{
				description: '解析后的五档控件尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '当前值模型。', name: 'data-mode', values: ['local', 'zoned'] }
		],
		status: 'experimental',
		summary:
			'由一个表单值根组合Gregorian日期与wall-clock时间segment，并明确本地与时区日期时间模型、DST和联合约束。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { Time, today, toCalendarDateTime, toZoned } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import {
		composeDateTime,
		dateTimeParts,
		dateTimeZoneLabel,
		displayDateTime,
		isDateTimeUnavailable as valueIsUnavailable,
		normalizeDateTimeModelValue,
		type DateTimeMode
	} from '../../runtime/date-time.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		moveWithinSegmentedBoundary,
		segmentedNavigationIntent
	} from '../../runtime/segmented-navigation.js';
	import ZDateField from './ZDateField.svelte';
	import ZInputGroup from './ZInputGroup.svelte';
	import ZTimeField from './ZTimeField.svelte';

	type DateTimeFieldValue = CalendarDateTime | ZonedDateTime;
	type DraftFailure = 'invalid-local-time' | 'unavailable' | undefined;
	type DraftController = { rollbackDraft(): void };

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		class: className,
		controlId: controlIdProp,
		defaultValue,
		disabled: disabledProp = false,
		disambiguation = 'compatible',
		dir: dirProp,
		form,
		formParticipation = 'auto',
		granularity = 'minute',
		hideTimeZone = false,
		hourCycle,
		invalid: invalidProp = false,
		isDateTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		mode = 'local',
		name: nameProp,
		onDraftChange,
		onFormReset,
		onValueChange,
		placeholderValue,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		secondStep = 1,
		size,
		style,
		suffixAction,
		timeZone,
		value = $bindable(),
		...rest
	}: ZDateTimeFieldProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = formParticipation === 'auto' ? claimFormValueScope() : null;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-time-field'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-date`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDirection = $derived(dirProp ?? zui.direction);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedExternalInvalid = $derived(invalidProp || (field?.invalid ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.dateTimeField?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const compositeClass = $derived(
		zui.icss((s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexWrap.wrap;
			s.flex.raw('1 1 auto');
			s.minWidth.px(0);
		})
	);
	const actionGeometryClass = $derived(
		zui.icss((s) => {
			const height = controlSizeMetrics(zui.theme, resolvedSize).contentHeight;
			s._selector('& > [data-slot="input-group"] > [data-slot="suffix-action"] > button', (s) => {
				s.height.raw(height);
				s.minHeight.raw(height);
			});
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const normalizedConstraints = $derived.by(() => {
		const minimum =
			minValue === undefined
				? undefined
				: normalizeDateTimeModelValue(minValue, mode, 'ZDateTimeField minValue')!;
		const maximum =
			maxValue === undefined
				? undefined
				: normalizeDateTimeModelValue(maxValue, mode, 'ZDateTimeField maxValue')!;
		if (minimum && maximum && minimum.compare(maximum) > 0)
			throw new RangeError('ZDateTimeField minValue cannot exceed maxValue.');
		return { maximum, minimum };
	});
	const valueState = createFormControlState<DateTimeFieldValue | null>(
		{
			defaultValue: () =>
				defaultValue === undefined
					? null
					: normalizeDateTimeModelValue(defaultValue, mode, 'ZDateTimeField defaultValue'),
			draftState: () => inspectCompositeDraft(),
			element: () => ref,
			normalizeModelValue: (candidate) =>
				normalizeDateTimeModelValue(candidate, mode, 'ZDateTimeField'),
			onChange: () => onValueChange as ((next: DateTimeFieldValue | null) => void) | undefined,
			owner: 'ZDateTimeField',
			read: () => value,
			resetDraft: rollbackDraft,
			syncNative: (next) => syncOwnedValue(next),
			write: (next) => (value = next as typeof value)
		},
		valueScope
	);
	const placeholder = $derived.by((): DateTimeFieldValue => {
		if (placeholderValue !== undefined) {
			const normalized = normalizeDateTimeModelValue(
				placeholderValue,
				mode,
				'ZDateTimeField placeholderValue'
			);
			if (!normalized) throw new TypeError('ZDateTimeField placeholderValue cannot be null.');
			return normalized;
		}
		const local = toCalendarDateTime(today(resolvedTimeZone), new Time(0));
		return mode === 'zoned' ? toZoned(local, resolvedTimeZone, disambiguation) : local;
	});
	const placeholderParts = $derived(
		dateTimeParts(displayDateTime(placeholder, mode, resolvedTimeZone))
	);
	const initial = untrack(() => currentDisplayParts());
	let dateValue = $state(initial?.date ?? null);
	let timeValue = $state(initial?.time ?? null);
	let dateDraft = $state<FormControlDraftState>({ dirty: false, valid: true });
	let timeDraft = $state<FormControlDraftState>({ dirty: false, valid: true });
	let draftFailure = $state<DraftFailure>();
	let ownerTimeZone = $state(
		untrack(() =>
			mode === 'zoned' && currentValue() instanceof ZonedDateTime
				? (currentValue() as ZonedDateTime).timeZone
				: resolvedTimeZone
		)
	);
	let compositeRef = $state<HTMLDivElement | null>(null);
	let dateController = $state<DraftController | null>(null);
	let timeController = $state<DraftController | null>(null);
	const compositeDraft = $derived.by<FormControlDraftState>(() => inspectCompositeDraft());
	const resolvedInvalid = $derived(resolvedExternalInvalid || !compositeDraft.valid);
	const timeZoneText = $derived.by(() => {
		if (mode !== 'zoned' || hideTimeZone) return undefined;
		const zoned = normalizeDateTimeModelValue(
			currentValue() ?? placeholder,
			'zoned',
			'ZDateTimeField time zone label'
		)!;
		const display = displayDateTime(zoned, 'zoned', resolvedTimeZone);
		return dateTimeZoneLabel(display, resolvedLocale, resolvedTimeZone);
	});

	function currentValue(): DateTimeFieldValue | null {
		return normalizeDateTimeModelValue(valueState.current, mode, 'ZDateTimeField');
	}

	function currentDisplayParts() {
		const current = currentValue();
		return current ? dateTimeParts(displayDateTime(current, mode, resolvedTimeZone)) : null;
	}

	function inspectCompositeDraft(): FormControlDraftState {
		if (!dateDraft.valid) return dateDraft;
		if (!timeDraft.valid) return timeDraft;
		if (draftFailure)
			return Object.freeze({
				dirty: true,
				message:
					draftFailure === 'unavailable'
						? zui.localePack.dateTime.unavailable
						: zui.localePack.dateTime.invalidLocalTime,
				valid: false
			});
		if ((dateValue === null) !== (timeValue === null))
			return Object.freeze({
				dirty: true,
				message:
					dateValue === null
						? zui.localePack.date.incompleteDate
						: zui.localePack.time.incompleteTime,
				valid: false
			});
		const empty = dateValue === null && timeValue === null;
		const current = currentValue();
		const requiredMissing = empty && resolvedRequired;
		const constrained = Boolean(current && unavailable(current));
		const valid = !requiredMissing && !constrained;
		return Object.freeze({
			dirty: dateDraft.dirty || timeDraft.dirty,
			message: valid
				? undefined
				: requiredMissing
					? zui.localePack.form.requiredValue
					: zui.localePack.dateTime.unavailable,
			valid
		});
	}

	function combinedValue(): DateTimeFieldValue | null {
		if (!dateValue || !timeValue) return null;
		return composeDateTime({
			date: dateValue,
			disambiguation,
			displayTimeZone: resolvedTimeZone,
			mode: mode as DateTimeMode,
			ownerTimeZone,
			time: timeValue
		});
	}

	function unavailable(next: DateTimeFieldValue): boolean {
		return valueIsUnavailable(
			next,
			normalizedConstraints.minimum,
			normalizedConstraints.maximum,
			isDateTimeUnavailable as ((candidate: DateTimeFieldValue) => boolean) | undefined
		);
	}

	function composeDraft(): void {
		if (!dateValue || !timeValue) {
			draftFailure = undefined;
			if (!dateValue && !timeValue && currentValue() && !valueState.setFromUser(null))
				syncOwnedValue(currentValue());
			return;
		}
		try {
			const next = combinedValue()!;
			if (unavailable(next)) {
				draftFailure = 'unavailable';
				return;
			}
			draftFailure = undefined;
			if (!valueState.setFromUser(next)) syncOwnedValue(currentValue());
		} catch (error) {
			if (error instanceof RangeError && disambiguation === 'reject') {
				draftFailure = 'invalid-local-time';
				return;
			}
			throw error;
		}
	}

	function handleDateValue(next: import('@internationalized/date').CalendarDate | null): void {
		dateValue = next;
		composeDraft();
	}

	function handleTimeValue(next: Time | null): void {
		timeValue = next;
		composeDraft();
	}

	function syncOwnedValue(next: DateTimeFieldValue | null): void {
		const normalized = normalizeDateTimeModelValue(next, mode, 'ZDateTimeField');
		if (normalized instanceof ZonedDateTime) ownerTimeZone = normalized.timeZone;
		else if (mode === 'zoned') ownerTimeZone = resolvedTimeZone;
		const parts = normalized
			? dateTimeParts(displayDateTime(normalized, mode, resolvedTimeZone))
			: null;
		dateValue = parts?.date ?? null;
		timeValue = parts?.time ?? null;
		dateController?.rollbackDraft();
		timeController?.rollbackDraft();
		draftFailure = undefined;
	}

	function rollbackCompositeDraft(): void {
		syncOwnedValue(currentValue());
	}

	export function rollbackDraft(): void {
		rollbackCompositeDraft();
	}

	function handleBoundaryKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			rollbackCompositeDraft();
			return;
		}
		if (!compositeRef) return;
		const intent = segmentedNavigationIntent(
			event,
			getElementDirection(compositeRef ?? ref, zui.direction)
		);
		if (!intent) return;
		event.preventDefault();
		event.stopPropagation();
		moveWithinSegmentedBoundary(compositeRef, event.target, intent);
	}

	function resetFromForm(): void {
		valueState.reset();
		syncOwnedValue(currentValue());
		onFormReset?.();
	}

	let observedValueKey: string | undefined;
	$effect(() => {
		const current = currentValue();
		const key = `${mode}:${resolvedTimeZone}:${current?.toString() ?? 'null'}`;
		if (key === observedValueKey) return;
		observedValueKey = key;
		untrack(() => syncOwnedValue(current));
	});
	$effect(() => {
		const state = compositeDraft;
		untrack(() => onDraftChange?.(state));
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			compositeRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet zoneSuffix()}
	{#if timeZoneText}<span data-slot="time-zone">{timeZoneText}</span>{/if}
{/snippet}

<div
	{...rest}
	bind:this={ref}
	class={[actionGeometryClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={resolvedDirection}
	data-mode={mode}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
>
	<ZInputGroup
		aria-label={labelledBy
			? undefined
			: (ariaLabel ??
				`${zui.localePack.date.dateFieldLabel}, ${zui.localePack.time.timeFieldLabel}`)}
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		data-slot="input-group"
		dir={resolvedDirection}
		disabled={resolvedDisabled}
		invalid={resolvedInvalid}
		readonly={resolvedReadonly}
		required={resolvedRequired}
		size={resolvedSize}
		{suffixAction}
		suffix={timeZoneText ? zoneSuffix : undefined}
	>
		<div
			bind:this={compositeRef}
			class={compositeClass}
			data-zui-composite-control=""
			data-slot="field"
			dir={resolvedDirection}
			role="group"
			onkeydowncapture={handleBoundaryKey}
		>
			<ZDateField
				bind:this={dateController}
				bind:value={dateValue}
				appearance="bare"
				aria-describedby={describedBy}
				aria-label={zui.localePack.date.dateFieldLabel}
				aria-labelledby={labelledBy}
				{controlId}
				disabled={resolvedDisabled}
				dir={resolvedDirection}
				formParticipation="none"
				invalid={resolvedExternalInvalid || Boolean(draftFailure)}
				locale={resolvedLocale}
				onDraftChange={(state) => (dateDraft = state)}
				onValueChange={handleDateValue}
				placeholderValue={placeholderParts.date}
				readonly={resolvedReadonly}
				required={resolvedRequired}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
			/>
			<span aria-hidden="true">&nbsp;</span>
			<ZTimeField
				bind:this={timeController}
				bind:value={timeValue}
				appearance="bare"
				aria-describedby={describedBy}
				aria-label={zui.localePack.time.timeFieldLabel}
				controlId={`${controlId}-time`}
				disabled={resolvedDisabled}
				dir={resolvedDirection}
				formParticipation="none"
				{granularity}
				{hourCycle}
				invalid={resolvedExternalInvalid || Boolean(draftFailure)}
				locale={resolvedLocale}
				{minuteStep}
				onDraftChange={(state) => (timeDraft = state)}
				onValueChange={handleTimeValue}
				placeholderValue={placeholderParts.time}
				readonly={resolvedReadonly}
				required={resolvedRequired}
				{secondStep}
				size={resolvedSize}
			/>
		</div>
	</ZInputGroup>
</div>
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		{form}
		name={resolvedName}
		onReset={resetFromForm}
		value={currentValue()?.toString()}
	/>
{/if}
