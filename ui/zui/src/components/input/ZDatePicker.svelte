<script module lang="ts">
	import type { CalendarDate as PublicCalendarDate } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { Weekday } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';

	export interface ZDatePickerProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly calendarLabel?: string;
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly closeOnSelect?: boolean;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: PublicCalendarDate | null;
		readonly disabled?: boolean;
		readonly firstDayOfWeek?: Weekday;
		readonly form?: string;
		readonly formatOptions?: Intl.DateTimeFormatOptions;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: PublicCalendarDate) => boolean;
		readonly locale?: string;
		readonly maxValue?: PublicCalendarDate;
		readonly minValue?: PublicCalendarDate;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: PublicCalendarDate | null) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		readonly triggerLabel?: (display: string) => string;
		value?: PublicCalendarDate | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'date-picker',
		importStatement: "import { ZDatePicker } from '@zadmin/zui';",
		name: 'ZDatePicker',
		bindings: [
			{
				description: 'CalendarDate值；null是显式空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{ description: 'Popover状态。', name: 'open', type: 'boolean' },
			{ description: '真实根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDateField', 'ZCalendar', 'ZInputGroup', 'ZPopover', 'FormControlState'],
		events: [
			{
				description: '分段编辑、日历选择或清空后的值。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
			},
			{ description: 'Popover状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '在DateField分段间编辑与移动。', key: 'DateField keys' },
			{ description: '打开calendar。', key: 'Calendar trigger: Enter / Space' },
			{ description: '复用Calendar键盘。', key: 'Calendar keys' },
			{ description: '关闭并恢复Calendar trigger焦点。', key: 'Escape' }
		],
		parts: [
			{ description: '日期输入与操作共享的 InputGroup。', name: 'input-group' },
			{ description: '可编辑日期segments。', name: 'field' },
			{ description: 'Calendar按钮。', name: 'trigger' },
			{ description: '可选清空按钮。', name: 'clear' },
			{ description: 'Calendar Popover。', name: 'content' }
		],
		props: [
			{
				default: 'Provider localePack.date.chooseDate',
				description: 'Calendar dialog与trigger的后备可访问名称。',
				name: 'calendarLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.date.clearDate',
				description: '有值时清空按钮的可访问名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{
				default: '继承Field或自动生成',
				description: '真实DateField焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '日期值；null是受控空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'null',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				default: 'false',
				description: '非受控初始Popover状态；reset时关闭。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '禁用DateField、actions、Calendar并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'locale规则',
				description: '显式Calendar周起始日。',
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
				default: 'long date',
				description: 'triggerLabel使用的本地化日期格式选项。',
				name: 'formatOptions',
				type: 'Intl.DateTimeFormatOptions'
			},
			{
				default: 'Field context或false',
				description: '同步InputGroup、DateField与ARIA无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Provider locale',
				description: 'DateField与Calendar使用的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'DateField与Calendar共享最大日期。',
				name: 'maxValue',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: 'DateField与Calendar共享最小日期。',
				name: 'minValue',
				type: 'CalendarDate'
			},
			{
				default: 'Field context或undefined',
				description: '唯一ISO CalendarDate FormData字段名。',
				name: 'name',
				type: 'string'
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
				default: 'true',
				description: '显示有值时的Lucide清空按钮。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'Calendar选择日期后关闭Popover。',
				name: 'closeOnSelect',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '日期可用性谓词，同时用于字段提交和Calendar。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Field > componentDefaults.datePicker > input > density',
				description: '统一DateField和Lucide actions尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'localePack.date.chooseDate',
				description: '空值时传给triggerLabel的display提示。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Popover逻辑首选方位；RTL由Floating解析。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: 'Field context或false',
				description: 'DateField保持可聚焦和值提交，Calendar/clear停用。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射到可编辑DateField的必填语义。',
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
				default: 'Provider timeZone',
				description: 'DateField、Calendar today与trigger使用的IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'calendarLabel',
				description: '根据本地化display生成trigger可访问名称。',
				name: 'triggerLabel',
				type: '(display: string) => string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDatePicker.svelte',
		states: [
			{
				description: '解析后传给DateField、Calendar与actions的尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'stable',
		summary:
			'组合可编辑DateField、Calendar Popover、双受控owner与唯一FormValueBridge的Date Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import X from '@lucide/svelte/icons/x';
	import type { CalendarDate } from '@internationalized/date';
	import { onDestroy } from 'svelte';
	import {
		dateFieldPattern,
		formatDate,
		normalizeCalendarDateModelValue
	} from '../../runtime/date.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
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
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';
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
		firstDayOfWeek,
		form,
		formatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
		invalid,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name: nameProp,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder,
		placement = 'bottom-start',
		ref = $bindable(null),
		readonly: readonlyProp = false,
		required: requiredProp = false,
		showOutsideDates = true,
		size,
		timeZone,
		triggerLabel,
		value = $bindable(),
		...rest
	}: ZDatePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'date-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-field`);
	const triggerId = $derived(`${idBase}-calendar-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedCalendarLabel = $derived(calendarLabel ?? zui.localePack.date.chooseDate);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.date.clearDate);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid || field?.invalid || false);
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedDirection = $derived(rest.dir ?? zui.direction);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.datePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const geometryClass = $derived(
		zui.icss((s) => {
			s._selector('& > [data-slot="input-group"] > [data-slot="suffix-action"] > button', (s) =>
				s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
			if (resolvedDisabled) {
				s._selector(
					'& > [data-slot="input-group"] > [data-slot="field"], & > [data-slot="input-group"] > [data-slot="suffix-action"] > button:disabled',
					(s) => s.opacity._opaque
				);
			}
		})
	);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	let calendarRef = $state<HTMLDivElement | null>(null);
	let fieldRef = $state<HTMLDivElement | null>(null);
	let fieldController = $state<{ rollbackDraft(): void }>();
	let fieldDraft = $state<FormControlDraftState>({ valid: true, dirty: false });
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const valueState = createFormControlState<CalendarDate | null>(
		{
			defaultValue: () => defaultValue ?? null,
			draftState: () => fieldDraft,
			resetDraft: () => fieldController?.rollbackDraft(),
			element: () => ref,
			normalizeModelValue: (candidate) => normalizeCalendarDateModelValue(candidate, 'ZDatePicker'),
			onChange: () => onValueChange,
			owner: 'ZDatePicker',
			read: () => value,
			syncNative: (next) => syncOwnedValue(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	let calendarValue = $state<CalendarDate | null>(valueState.current);
	let calendarFocusedValue = $state<CalendarDate | undefined>(
		valueState.current ?? defaultValue ?? undefined
	);
	let fieldValue = $state<CalendarDate | null>(valueState.current);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const display = $derived(
		valueState.current
			? formatDate(valueState.current, resolvedLocale, formatOptions, resolvedTimeZone)
			: (placeholder ?? resolvedCalendarLabel)
	);
	const resolvedTriggerLabel = $derived(triggerLabel?.(display) ?? resolvedCalendarLabel);

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function resetFromForm(): void {
		valueState.reset();
		syncOwnedValue(valueState.current);
		open = false;
	}

	function syncOwnedValue(next = valueState.current): void {
		fieldController?.rollbackDraft();
		calendarValue = next;
		calendarFocusedValue = next ?? defaultValue ?? undefined;
		fieldValue = next;
		const segments = dateFieldPattern(resolvedLocale, resolvedTimeZone).flatMap((part) =>
			'segment' in part ? [part.segment] : []
		);
		for (const [index, segment] of segments.entries()) {
			const raw = segment === 'year' ? next?.year : segment === 'month' ? next?.month : next?.day;
			const input = fieldRef?.querySelectorAll<HTMLInputElement>('input')[index];
			if (input)
				input.value =
					raw === undefined ? '' : String(raw).padStart(segment === 'year' ? 4 : 2, '0');
		}
	}

	function updateValue(next: CalendarDate | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted = valueState.setFromUser(next);
		if (!accepted) syncOwnedValue();
		return accepted;
	}

	function select(next: CalendarDate | null): void {
		if (updateValue(next) && next && closeOnSelect) setOpen(false);
	}

	function clear(): void {
		updateValue(null);
		setOpen(false);
		ownerMicrotask(() =>
			fieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}

	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		const restore = openState.current && !next;
		openState.setFromUser(next);
		if (restore) ownerMicrotask(() => triggerRef?.focus({ preventScroll: true }));
	}

	let observedValueKey: string | null | undefined;
	$effect(() => {
		const next = valueState.current;
		const key = next?.toString() ?? null;
		if (observedValueKey === key) return;
		observedValueKey = key;
		calendarValue = next;
		if (next) calendarFocusedValue = next;
		fieldValue = next;
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() =>
			fieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		)
	);
</script>

{#snippet actions()}
	<ZPopover modal={false} onOpenChange={setOpen} open={resolvedOpen} {placement} {triggerId}>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-label={resolvedTriggerLabel}
			disabled={resolvedDisabled || resolvedReadonly}
			popupRole="dialog"
			size={resolvedSize}
			variant="ghost"
		>
			<CalendarDays aria-hidden="true" size="1em" />
		</ZPopoverTrigger>
		<ZPopoverContent
			dir={resolvedDirection}
			aria-label={resolvedCalendarLabel}
			ariaLabelledBy={null}
			initialFocus={() => calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null}
			role="dialog"
		>
			<ZCalendar
				dir={resolvedDirection}
				bind:ref={calendarRef}
				bind:focusedValue={calendarFocusedValue}
				appearance="bare"
				calendarLabel={resolvedCalendarLabel}
				defaultFocusedValue={valueState.current ?? defaultValue ?? undefined}
				disabled={resolvedDisabled}
				{firstDayOfWeek}
				formParticipation="none"
				{isDateUnavailable}
				locale={resolvedLocale}
				{maxValue}
				{minValue}
				onValueChange={select}
				readonly={resolvedReadonly}
				{showOutsideDates}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				bind:value={calendarValue}
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && valueState.current}
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
	class={[geometryClass, className]}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZInputGroup
		dir={resolvedDirection}
		data-slot="input-group"
		disabled={resolvedDisabled}
		invalid={resolvedInvalid}
		size={resolvedSize}
		suffixAction={actions}
	>
		<ZDateField
			dir={resolvedDirection}
			bind:this={fieldController}
			onDraftChange={(next) => (fieldDraft = next)}
			data-slot="field"
			aria-describedby={describedBy}
			aria-label={ariaLabel}
			aria-labelledby={labelledBy}
			appearance="bare"
			bind:ref={fieldRef}
			{controlId}
			disabled={resolvedDisabled}
			formParticipation="none"
			invalid={resolvedInvalid}
			{isDateUnavailable}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			onValueChange={updateValue}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			size={resolvedSize}
			timeZone={resolvedTimeZone}
			bind:value={fieldValue}
		/>
	</ZInputGroup>
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={valueState.current?.toString()}
/>
