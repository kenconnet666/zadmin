<script module lang="ts">
	import type { CalendarDate as PublicCalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type {
		CalendarRange as PublicCalendarRange,
		CalendarRangeValue as PublicCalendarRangeValue,
		Weekday
	} from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';

	export interface ZDateRangePickerProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly calendarLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly closeOnSelect?: boolean;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: PublicCalendarRange | PublicCalendarRangeValue | null;
		readonly disabled?: boolean;
		readonly endLabel?: string;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: PublicCalendarDate, part: 'end' | 'start') => boolean;
		readonly locale?: string;
		readonly maxValue?: PublicCalendarDate;
		readonly minValue?: PublicCalendarDate;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: PublicCalendarRangeValue | null) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: ZControlSize;
		readonly startLabel?: string;
		readonly timeZone?: string;
		value?: PublicCalendarRange | PublicCalendarRangeValue | null;
	}

	const rootRecipe = defineRecipe({
		base: () => undefined,
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					// The enclosing InputGroup already dims this owned inline subtree.
					s._selector(
						'& > [data-slot="range-inputs"] > [data-slot="start-field"], & > [data-slot="range-inputs"] > [data-slot="end-field"], & > [data-slot="range-inputs"] > [data-slot="suffix-action"] > button:disabled',
						(control) => control.opacity._opaque
					);
				}
			}
		},
		defaultVariants: { disabled: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);

	export const zuiMetadata = {
		category: 'input',
		id: 'date-range-picker',
		importStatement: "import { ZDateRangePicker } from '@zadmin/zui';",
		name: 'ZDateRangePicker',
		bindings: [
			{
				description: '可为空、起点或完整范围；完整反向范围自动规范化。',
				name: 'value',
				type: 'CalendarRangeValue | null'
			},
			{ description: 'Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDateField', 'ZCalendar', 'ZInputGroup', 'ZPopover', 'FormControlState'],
		events: [
			{
				description: '字段编辑、第一/第二次日历选择或清空后的范围。',
				name: 'onValueChange',
				type: '(value: CalendarRangeValue | null) => void'
			},
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '分别编辑起止DateField。', key: 'DateField keys' },
			{ description: '打开并复用Calendar键盘。', key: 'Calendar trigger / Calendar keys' },
			{ description: '关闭并恢复Calendar trigger焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '双日期输入与操作按钮共享的 InputGroup。', name: 'range-inputs' },
			{ description: '起始日期segments。', name: 'start-field' },
			{ description: '范围分隔符。', name: 'separator' },
			{ description: '结束日期segments。', name: 'end-field' },
			{ description: 'Calendar按钮。', name: 'trigger' },
			{ description: '可选清空按钮。', name: 'clear' },
			{ description: 'Calendar Popover。', name: 'content' }
		],
		props: [
			{
				default: 'Provider localePack.date.chooseDateRange',
				description: '范围group、Calendar dialog与trigger的后备可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.clearDateRange',
				description: '有任一端值时清空按钮的可访问名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: '继承Field或自动生成',
				description: '起始DateField焦点owner的id；结束字段派生独立id。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '允许start/end任一暂缺；两端齐全时保持start <= end。',
				name: 'value',
				type: 'CalendarRangeValue | null'
			},
			{
				default: 'null',
				description: '非受控初始范围；反向完整值在消费时规范化。',
				name: 'defaultValue',
				type: 'CalendarRangeValue | CalendarRange | null'
			},
			{
				default: 'false',
				description: '非受控初始Popover状态；form reset时关闭。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '禁用两个DateField、actions、Calendar并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.date.endDate',
				description: '结束DateField的可访问名称。',
				name: 'endLabel',
				type: 'string'
			},
			{
				default: 'locale规则',
				description: 'Calendar显式周起始日。',
				name: 'firstDayOfWeek',
				type: 'Weekday'
			},
			{
				default: '最近祖先form',
				description: '外层唯一FormValueBridge关联的form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: '同步InputGroup、两个DateField与根状态的无效语义。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Provider locale',
				description: '两个DateField与Calendar使用的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '两个DateField与Calendar共享最大日期。',
				name: 'maxValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '两个DateField与Calendar共享最小日期。',
				name: 'minValue',
				type: 'CalendarDate'
			},
			{
				default: 'Field context或undefined',
				description: '以name.start与name.end分别提交ISO CalendarDate，允许partial range。',
				name: 'name',
				type: 'string'
			},
			{
				bindable: true,
				default: 'false',
				description: 'Popover打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '有任一端时显示Lucide清空按钮。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '完成第二端选择后关闭Popover。',
				name: 'closeOnSelect',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '按start/end角色判断日期可用性。',
				name: 'isDateUnavailable',
				type: "(date: CalendarDate, part: 'start' | 'end') => boolean"
			},
			{
				default: "'bottom-start'",
				description: 'Popover逻辑首选方位；RTL由Floating解析。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实范围group根节点引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			},
			{
				default: 'Field context或false',
				description: '两个DateField保持可聚焦和值提交，Calendar与clear停用。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射到两个可编辑DateField的必填语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'Calendar是否渲染相邻月份日期按钮。',
				name: 'showOutsideDates',
				type: 'boolean'
			},
			{
				default: 'Field > componentDefaults.dateRangePicker > input > density',
				description: '统一两个DateField和Lucide actions尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Provider localePack.date.startDate',
				description: '起始DateField的可访问名称。',
				name: 'startLabel',
				type: 'string'
			},
			{
				default: 'Provider timeZone',
				description: '两个DateField与Calendar today使用的IANA时区。',
				name: 'timeZone',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateRangePicker.svelte',
		states: [
			{
				description: '解析后传给双DateField、Calendar与actions的尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '等待结束日期。', name: 'data-selecting', values: ['true'] },
			{ description: '当前编辑端。', name: 'data-range-part', values: ['start', 'end'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary:
			'双DateField、可提交partial range、反向规范化、Calendar preview与唯一表单owner的Range Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import CalendarRangeIcon from '@lucide/svelte/icons/calendar-range';
	import X from '@lucide/svelte/icons/x';
	import type { CalendarDate } from '@internationalized/date';
	import { onDestroy } from 'svelte';
	import {
		dateFieldPattern,
		normalizeRange,
		normalizeRangeValue,
		normalizeCalendarRangeModelValue,
		type CalendarRange,
		type CalendarRangeValue
	} from '../../runtime/date.js';
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
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import ZCalendar from './ZCalendar.svelte';
	import ZDateField from './ZDateField.svelte';
	import ZInputGroup from './ZInputGroup.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		calendarLabel,
		class: className,
		clearLabel,
		clearable = true,
		closeOnSelect = true,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		endLabel,
		firstDayOfWeek,
		form,
		invalid,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name: nameProp,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placement = 'bottom-start',
		ref = $bindable(null),
		readonly: readonlyProp = false,
		required: requiredProp = false,
		showOutsideDates = true,
		size,
		startLabel,
		timeZone,
		value = $bindable(),
		...rest
	}: ZDateRangePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-range-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-start`);
	const triggerId = $derived(`${idBase}-calendar-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.chooseDateRange);
	const resolvedStartLabel = $derived(startLabel ?? zui.localePack.date.startDate);
	const resolvedEndLabel = $derived(endLabel ?? zui.localePack.date.endDate);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.date.clearDateRange);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled: resolvedDisabled }));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.dateRangePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const geometryClass = $derived(
		zui.icss((s) => {
			s._selector('& > [data-slot="range-inputs"]', (s) => s.flexWrap.wrap);
			s._selector('& > [data-slot="range-inputs"] > [data-slot="suffix-action"] > button', (s) =>
				s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
		})
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	let calendarRef = $state<HTMLDivElement | null>(null);
	let endFieldRef = $state<HTMLDivElement | null>(null);
	let startFieldRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let rangePart = $state<'end' | 'start'>('start');
	let previewFocus = $state<CalendarDate | null>(null);
	const valueState = createFormControlState<CalendarRangeValue | null>(
		{
			defaultValue: () => normalizeRangeValue(defaultValue),
			element: () => ref,
			normalizeModelValue: (candidate) =>
				normalizeCalendarRangeModelValue(candidate, 'ZDateRangePicker'),
			onChange: () => onValueChange,
			owner: 'ZDateRangePicker',
			read: () => value,
			resetToInitialValue: true,
			syncNative: () => syncOwnedValue(),
			write: (next) => (value = next)
		},
		valueScope
	);
	const normalizedValue = $derived(normalizeRangeValue(valueState.current));
	let calendarValue = $state<CalendarDate | null>(null);
	let calendarFocusedValue = $state<CalendarDate | undefined>(
		normalizedValue?.start ?? normalizedValue?.end ?? undefined
	);
	let endValue = $state<CalendarDate | null>(normalizedValue?.end ?? null);
	let startValue = $state<CalendarDate | null>(normalizedValue?.start ?? null);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const selectingEnd = $derived(rangePart === 'end' && Boolean(normalizedValue?.start));
	const previewRange = $derived<CalendarRangeValue | null>(
		selectingEnd && normalizedValue?.start && previewFocus
			? normalizeRange(normalizedValue.start, previewFocus)
			: normalizedValue
	);
	const formEntries = $derived<readonly FormValueEntry[]>(
		resolvedName
			? [
					[`${resolvedName}.start`, normalizedValue?.start?.toString()],
					[`${resolvedName}.end`, normalizedValue?.end?.toString()]
				]
			: []
	);

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function syncOwnedValue(): void {
		calendarValue = null;
		calendarFocusedValue = normalizedValue?.start ?? normalizedValue?.end ?? undefined;
		endValue = normalizedValue?.end ?? null;
		startValue = normalizedValue?.start ?? null;
		syncFieldInputs(startFieldRef, startValue);
		syncFieldInputs(endFieldRef, endValue);
	}

	function syncFieldInputs(root: HTMLElement | null, next: CalendarDate | null): void {
		const segments = dateFieldPattern(resolvedLocale, resolvedTimeZone).flatMap((part) =>
			'segment' in part ? [part.segment] : []
		);
		for (const [index, segment] of segments.entries()) {
			const raw = segment === 'year' ? next?.year : segment === 'month' ? next?.month : next?.day;
			const input = root?.querySelectorAll<HTMLInputElement>('input')[index];
			if (input)
				input.value =
					raw === undefined ? '' : String(raw).padStart(segment === 'year' ? 4 : 2, '0');
		}
	}

	function commit(next: CalendarRangeValue | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted = valueState.setFromUser(normalizeRangeValue(next));
		if (!accepted) syncOwnedValue();
		return accepted;
	}

	function updateStart(start: CalendarDate | null): void {
		commit({ end: normalizedValue?.end ?? null, start });
	}

	function updateEnd(end: CalendarDate | null): void {
		commit({ end, start: normalizedValue?.start ?? null });
	}

	function select(next: CalendarDate | null): void {
		calendarValue = null;
		if (!next || resolvedDisabled || resolvedReadonly) return;
		if (rangePart === 'start' || !normalizedValue?.start) {
			if (!commit({ end: null, start: next })) return;
			rangePart = 'end';
			previewFocus = next;
			return;
		}
		if (!commit(normalizeRange(normalizedValue.start, next))) return;
		rangePart = 'start';
		previewFocus = null;
		if (closeOnSelect) setOpen(false);
	}

	function clear(): void {
		if (!commit(null)) return;
		rangePart = 'start';
		previewFocus = null;
		setOpen(false);
		ownerMicrotask(() =>
			startFieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}

	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		const restore = openState.current && !next;
		if (next) rangePart = normalizedValue?.start && !normalizedValue.end ? 'end' : 'start';
		else previewFocus = null;
		openState.setFromUser(next);
		if (restore) ownerMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}

	function resetFromForm(): void {
		valueState.reset();
		syncOwnedValue();
		rangePart = 'start';
		previewFocus = null;
		open = false;
	}

	let observedValueKey: string | undefined;
	$effect(() => {
		const next = normalizedValue;
		const key = `${next?.start?.toString() ?? ''}|${next?.end?.toString() ?? ''}`;
		if (observedValueKey === key) return;
		observedValueKey = key;
		if (next?.start ?? next?.end) calendarFocusedValue = next?.start ?? next?.end ?? undefined;
		endValue = next?.end ?? null;
		startValue = next?.start ?? null;
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			startFieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet actions()}
	<ZPopover modal={false} onOpenChange={setOpen} open={openState.current} {placement} {triggerId}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={resolvedCalendarLabel}
			disabled={resolvedDisabled || resolvedReadonly}
			popupRole="dialog"
			size={resolvedSize}
			variant="ghost"
		>
			<CalendarRangeIcon aria-hidden="true" size="1em" />
		</ZPopoverTrigger>
		<ZPopoverContent
			aria-label={resolvedCalendarLabel}
			ariaLabelledBy={null}
			initialFocus={() => calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null}
			role="dialog"
		>
			<ZCalendar
				bind:ref={calendarRef}
				bind:focusedValue={calendarFocusedValue}
				appearance="bare"
				calendarLabel={resolvedCalendarLabel}
				defaultFocusedValue={normalizedValue?.start ?? normalizedValue?.end ?? undefined}
				disabled={resolvedDisabled}
				{firstDayOfWeek}
				formParticipation="none"
				isDateUnavailable={(date) => isDateUnavailable?.(date, rangePart) ?? false}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				onFocusedValueChange={(next) => (previewFocus = next)}
				onValueChange={select}
				range={previewRange}
				readonly={resolvedReadonly}
				{showOutsideDates}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				bind:value={calendarValue}
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && normalizedValue}
		<ZButton
			aria-label={resolvedClearLabel}
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
	class={[rootClass, geometryClass, className]}
	role="group"
	aria-label={labelledBy ? undefined : (ariaLabel ?? resolvedCalendarLabel)}
	aria-labelledby={labelledBy}
	data-invalid={resolvedInvalid || undefined}
	data-range-part={rangePart}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-selecting={selectingEnd || undefined}
	data-state={openState.current ? 'open' : 'closed'}
>
	<ZInputGroup
		data-slot="range-inputs"
		disabled={resolvedDisabled}
		invalid={resolvedInvalid}
		size={resolvedSize}
		suffixAction={actions}
	>
		<ZDateField
			data-slot="start-field"
			aria-describedby={describedBy}
			aria-label={resolvedStartLabel}
			appearance="bare"
			bind:ref={startFieldRef}
			{controlId}
			disabled={resolvedDisabled}
			formParticipation="none"
			invalid={resolvedInvalid}
			isDateUnavailable={(date) => isDateUnavailable?.(date, 'start') ?? false}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			onValueChange={updateStart}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			size={resolvedSize}
			timeZone={resolvedTimeZone}
			bind:value={startValue}
		/>
		<span aria-hidden="true" data-slot="separator">–</span>
		<ZDateField
			data-slot="end-field"
			aria-describedby={describedBy}
			aria-label={resolvedEndLabel}
			appearance="bare"
			bind:ref={endFieldRef}
			controlId={`${controlId}-end`}
			disabled={resolvedDisabled}
			formParticipation="none"
			invalid={resolvedInvalid}
			isDateUnavailable={(date) => isDateUnavailable?.(date, 'end') ?? false}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			onValueChange={updateEnd}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			size={resolvedSize}
			timeZone={resolvedTimeZone}
			bind:value={endValue}
		/>
	</ZInputGroup>
</div>
<FormValueBridge disabled={resolvedDisabled} entries={formEntries} {form} onReset={resetFromForm} />
