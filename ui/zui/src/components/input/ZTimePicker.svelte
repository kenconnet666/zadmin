<script module lang="ts">
	import type { Time as PublicTime } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { TimeFieldGranularity, TimeFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type {
		TimePickerDayPeriod,
		TimePickerPreset as RuntimeTimePickerPreset
	} from '../../runtime/time-picker.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';

	export type TimePickerGranularity = TimeFieldGranularity;
	export type TimePickerPreset = RuntimeTimePickerPreset;

	export interface ZTimePickerProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly clearLabel?: string;
		readonly clearable?: boolean;
		readonly confirmLabel?: string;
		readonly controlId?: string;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: PublicTime | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formatOptions?: Intl.DateTimeFormatOptions;
		readonly granularity?: TimePickerGranularity;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly invalidTimeLabel?: string;
		readonly isTimeUnavailable?: (value: PublicTime) => boolean;
		readonly locale?: string;
		readonly maxValue?: PublicTime;
		readonly minValue?: PublicTime;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly noAvailableTimeLabel?: string;
		readonly nowLabel?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: PublicTime | null) => void;
		open?: boolean;
		readonly pickerLabel?: string;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly presets?: readonly TimePickerPreset[];
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly showNow?: boolean;
		readonly size?: ZControlSize;
		readonly timeZone?: string;
		readonly toggleDayPeriodLabel?: string;
		readonly triggerLabel?: (display: string) => string;
		value?: PublicTime | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '唯一Time值；null是显式空值。', name: 'value', type: 'Time | null' },
			{
				description:
					'请求的Popover状态；disabled/readonly期间实际隐藏，解除后仍遵循该值，不伪造用户回调。',
				name: 'open',
				type: 'boolean'
			},
			{ description: '真实Picker根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'ZTimeField',
			'TimePickerPanel',
			'ZInputGroup',
			'ZPopover',
			'ZScrollArea',
			'CollectionNavigation',
			'ActiveDescendant',
			'FormControlState'
		],
		events: [
			{
				description: '字段编辑、面板确认或清空后的值。',
				name: 'onValueChange',
				type: '(value: Time | null) => void'
			},
			{
				description: 'Popover打开状态变化。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		id: 'time-picker',
		importStatement: "import { ZTimePicker } from '@zadmin/zui';",
		keyboard: [
			{ description: '复用TimeField分段编辑。', key: 'TimeField keys' },
			{ description: '在列内移动active option。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '按书写方向在相邻时间列间移动焦点。', key: 'ArrowLeft / ArrowRight' },
			{ description: '确认当前完整时间并关闭。', key: 'Enter' },
			{ description: '关闭且丢弃未确认的面板选择。', key: 'Escape' }
		],
		name: 'ZTimePicker',
		parts: [
			{ description: '时间字段与操作共享的InputGroup。', name: 'input-group' },
			{ description: '唯一可编辑TimeField。', name: 'field' },
			{ description: '打开时间面板的按钮。', name: 'trigger' },
			{ description: '有值时的清空按钮。', name: 'clear' },
			{ description: 'Popover dialog。', name: 'content' },
			{ description: '预设与现在操作。', name: 'actions' },
			{ description: '共享实现的小时、分钟、秒或时段listbox。', name: 'column' },
			{ description: '没有任何完整合法组合时的状态。', name: 'empty' },
			{ description: '拒绝预设或现在候选时的可访问反馈。', name: 'feedback' },
			{ description: '确认面板草稿的操作区。', name: 'footer' }
		],
		props: [
			{
				default: 'Provider localePack.time.clearTime',
				description: '清空按钮名称。',
				name: 'clearLabel',
				type: 'string'
			},
			{ default: 'true', description: '有值时显示清空按钮。', name: 'clearable', type: 'boolean' },
			{
				default: 'Provider localePack.common.confirm',
				description: '面板确认按钮文案。',
				name: 'confirmLabel',
				type: 'string'
			},
			{
				default: '继承Field或自动生成',
				description: '首个TimeField segment的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.am/pm',
				description: '覆盖AM/PM可见文案。',
				name: 'dayPeriodLabel',
				type: "(period: 'am' | 'pm') => string"
			},
			{
				default: 'false',
				description: '非受控初始Popover状态；表单reset时关闭。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'null',
				description: '非受控初始Time。',
				name: 'defaultValue',
				type: 'Time | null'
			},
			{
				default: 'Field context或false',
				description: '禁用字段、操作、FormData和面板。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: '最近祖先form',
				description: '唯一FormValueBridge关联的form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: '按granularity和hourCycle',
				description: '触发器时间展示选项。',
				name: 'formatOptions',
				type: 'Intl.DateTimeFormatOptions'
			},
			{
				default: "'minute'",
				description: '面板和字段显示到小时、分钟或秒。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '显式12或24小时制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'Field context或false',
				description: '同步InputGroup、TimeField和ARIA无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.time.invalidTime',
				description: '预设或现在候选不满足约束时的反馈。',
				name: 'invalidTimeLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '完整Time可用性谓词，由字段和所有面板列共用。',
				name: 'isTimeUnavailable',
				type: '(value: Time) => boolean'
			},
			{
				default: 'Provider locale',
				description: '字段顺序、hour cycle和数字格式的BCP 47 locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '字段和面板共用的最晚完整时间。',
				name: 'maxValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '字段和面板共用的最早完整时间。',
				name: 'minValue',
				type: 'Time'
			},
			{
				default: '1',
				description: 'TimeField步进和分钟列离散间隔。',
				name: 'minuteStep',
				type: 'number'
			},
			{
				default: 'Field context或undefined',
				description: '唯一ISO Time FormData字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.noAvailableTime',
				description: '不存在完整合法组合时的状态文案。',
				name: 'noAvailableTimeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.now',
				description: '现在操作的文案。',
				name: 'nowLabel',
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
				default: 'Provider localePack.time.chooseTime',
				description: 'dialog与trigger后备名称。',
				name: 'pickerLabel',
				type: 'string'
			},
			{
				default: 'pickerLabel',
				description: '空值时传给triggerLabel的展示文本。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Popover逻辑首选方位。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: '[]',
				description: '静态或按用户操作惰性求值的Time预设；只更新面板草稿。',
				name: 'presets',
				type: 'readonly TimePickerPreset[]'
			},
			{
				default: 'Field context或false',
				description: '字段可聚焦并提交，禁止编辑、打开和清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field或Provider timePicker/input默认，最后按density',
				description: '字段、操作和面板列的统一尺寸。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			},
			{
				default: 'Field context或false',
				description: '投射到唯一可编辑TimeField的必填语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '1',
				description: 'TimeField步进和秒列离散间隔。',
				name: 'secondStep',
				type: 'number'
			},
			{
				default: 'Provider localePack.time对应segment',
				description: '覆盖列与字段segment名称。',
				name: 'segmentLabel',
				type: '(segment: TimeFieldSegment) => string'
			},
			{
				default: 'false',
				description: '显示按每次用户操作和当前时区重新求值的现在按钮。',
				name: 'showNow',
				type: 'boolean'
			},
			{
				default: 'Provider timeZone',
				description: '现在操作解析墙上时间使用的IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'Provider localePack.time.toggleDayPeriod',
				description: 'TimeField AM/PM切换名称。',
				name: 'toggleDayPeriodLabel',
				type: 'string'
			},
			{
				default: 'pickerLabel',
				description: '根据本地化display生成trigger名称。',
				name: 'triggerLabel',
				type: '(display: string) => string'
			},
			{
				bindable: true,
				default: 'null',
				description: '唯一Time值；null是受控空值。',
				name: 'value',
				type: 'Time | null'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实Picker根引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimePicker.svelte',
		states: [
			{
				description: '完整Picker的解析后五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{
				description: 'Field或显式禁用；内部控件退出原生提交。',
				name: 'data-disabled',
				values: ['true']
			},
			{ description: 'Popover状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '当前唯一业务值为null。', name: 'data-empty', values: ['true'] },
			{ description: '不存在任何可选完整时间。', name: 'data-unavailable', values: ['true'] },
			{ description: 'Field或显式无效状态。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读状态。', name: 'data-readonly', values: ['true'] }
		],
		status: 'experimental',
		summary: '以唯一Time owner组合可编辑TimeField、有限时间列、Popover和真实表单语义的Time Picker。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import X from '@lucide/svelte/icons/x';
	import { Time } from '@internationalized/date';
	import { onDestroy } from 'svelte';
	import { formatTime, resolveHourCycle, timeFieldPattern } from '../../runtime/date.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		initialTimePickerReference,
		sameTimeValue,
		timePickerValueAvailable,
		type TimePickerConstraints
	} from '../../runtime/time-picker.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import TimePickerPanel, { type TimePickerPanelController } from './TimePickerPanel.svelte';
	import ZInputGroup from './ZInputGroup.svelte';
	import ZTimeField from './ZTimeField.svelte';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
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
		form,
		formatOptions,
		granularity = 'minute',
		hourCycle: hourCycleProp,
		invalid,
		invalidTimeLabel,
		isTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		name: nameProp,
		noAvailableTimeLabel,
		nowLabel,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		pickerLabel,
		placeholder,
		placement = 'bottom-start',
		presets = [],
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		secondStep = 1,
		segmentLabel,
		showNow = false,
		size,
		timeZone,
		toggleDayPeriodLabel,
		triggerLabel,
		value = $bindable(),
		...rest
	}: ZTimePickerProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const valueScope = claimFormValueScope();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'time-picker'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-field`);
	const triggerId = $derived(`${idBase}-trigger`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedHourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.timePicker?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedPickerLabel = $derived(pickerLabel ?? zui.localePack.time.chooseTime);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.time.clearTime);
	const resolvedConfirmLabel = $derived(confirmLabel ?? zui.localePack.common.confirm);
	const resolvedEmptyLabel = $derived(noAvailableTimeLabel ?? zui.localePack.time.noAvailableTime);
	const resolvedInvalidTimeLabel = $derived(invalidTimeLabel ?? zui.localePack.time.invalidTime);
	const resolvedNowLabel = $derived(nowLabel ?? zui.localePack.time.now);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const constraints = $derived<TimePickerConstraints>({
		granularity,
		hourCycle: resolvedHourCycle,
		isTimeUnavailable,
		maxValue,
		minValue,
		minuteStep,
		secondStep
	});
	let fieldRef = $state<HTMLDivElement | null>(null);
	let fieldController = $state<{ rollbackDraft(): void }>();
	let fieldDraft = $state<FormControlDraftState>({ valid: true, dirty: false });
	let panelValue = $state<Time | null>(null);
	let observedOwnerValue = $state<Time | null>(null);
	let panelController = $state<TimePickerPanelController | null>(null);
	const valueState = createFormControlState<Time | null>(
		{
			defaultValue: () => defaultValue ?? null,
			draftState: () => fieldDraft,
			element: () => ref,
			normalizeModelValue: (candidate) => {
				if (candidate === null || candidate === undefined) return null;
				if (Object.getPrototypeOf(candidate) !== Time.prototype)
					throw new TypeError('ZTimePicker model value must be a Time or null.');
				return candidate as Time;
			},
			onChange: () => onValueChange,
			owner: 'ZTimePicker',
			read: () => value,
			resetDraft: () => fieldController?.rollbackDraft(),
			syncNative: (next) => syncFieldValue(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	let fieldValue = $state<Time | null>(valueState.current);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	const resolvedFormatOptions = $derived<Intl.DateTimeFormatOptions>(
		formatOptions ?? {
			hour: 'numeric',
			hourCycle: resolvedHourCycle === 12 ? 'h12' : 'h23',
			minute: granularity === 'hour' ? undefined : '2-digit',
			second: granularity === 'second' ? '2-digit' : undefined
		}
	);
	const display = $derived(
		valueState.current
			? formatTime(valueState.current, resolvedLocale, resolvedFormatOptions)
			: (placeholder ?? resolvedPickerLabel)
	);
	const resolvedTriggerLabel = $derived(triggerLabel?.(display) ?? resolvedPickerLabel);
	const rootClass = $derived(
		zui.icss((s) => {
			s._selector('& > [data-slot="input-group"] > [data-slot="suffix-action"] > button', (s) =>
				s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
			if (resolvedDisabled)
				s._selector(
					'& > [data-slot="input-group"] > [data-slot="suffix-action"] > button:disabled',
					(s) => s.opacity._opaque
				);
		})
	);

	function ownerMicrotask(callback: () => void): void {
		(ref?.ownerDocument.defaultView ?? globalThis).queueMicrotask(callback);
	}

	function updateValue(next: Time | null): boolean {
		if (resolvedDisabled || resolvedReadonly) return false;
		const accepted = valueState.setFromUser(next) && sameTimeValue(valueState.current, next);
		if (!accepted) syncFieldValue();
		return accepted;
	}

	function setOpen(next: boolean): void {
		if ((resolvedDisabled || resolvedReadonly) && next) return;
		openState.setFromUser(next);
	}

	function clear(): void {
		if (!updateValue(null)) return;
		setOpen(false);
		ownerMicrotask(() =>
			fieldRef?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
		);
	}

	function confirm(next: Time | null = panelValue): void {
		if (!next || !timePickerValueAvailable(next, constraints) || !updateValue(next)) return;
		setOpen(false);
	}

	function updateFromField(next: Time | null): void {
		if (updateValue(next) && resolvedOpen) panelValue = next;
	}

	function syncFieldValue(next = valueState.current): void {
		fieldController?.rollbackDraft();
		fieldValue = next;
		const segments = timeFieldPattern(resolvedLocale, resolvedHourCycle, granularity).flatMap(
			(part) => ('segment' in part ? [part.segment] : [])
		);
		for (const [index, segment] of segments.entries()) {
			let raw =
				segment === 'hour' ? next?.hour : segment === 'minute' ? next?.minute : next?.second;
			if (raw !== undefined && segment === 'hour' && resolvedHourCycle === 12) raw = raw % 12 || 12;
			const input = fieldRef?.querySelectorAll<HTMLInputElement>('input')[index];
			if (input) input.value = raw === undefined ? '' : String(raw).padStart(2, '0');
		}
	}

	function resetFromForm(): void {
		valueState.reset();
		syncFieldValue();
		open = false;
		panelValue = null;
	}

	let previouslyOpen = false;
	$effect(() => {
		const currentlyOpen = resolvedOpen;
		const current = valueState.current;
		const rules = constraints;
		const ownerChanged = !sameTimeValue(current, observedOwnerValue);
		if (ownerChanged) syncFieldValue(current);
		if (
			currentlyOpen &&
			(!previouslyOpen ||
				ownerChanged ||
				!panelValue ||
				!timePickerValueAvailable(panelValue, rules))
		)
			panelValue = initialTimePickerReference(current, rules);
		if (!currentlyOpen) panelValue = null;
		observedOwnerValue = current;
		previouslyOpen = currentlyOpen;
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
			aria-label={resolvedTriggerLabel}
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
			data-unavailable={!panelValue || undefined}
			data-slot="content"
			dir={resolvedDirection}
			initialFocus={() => panelController?.firstFocusableElement ?? null}
			role="dialog"
		>
			<TimePickerPanel
				confirmLabel={resolvedConfirmLabel}
				{constraints}
				{dayPeriodLabel}
				disabled={resolvedDisabled || resolvedReadonly}
				direction={resolvedDirection}
				{idBase}
				invalidTimeLabel={resolvedInvalidTimeLabel}
				locale={resolvedLocale}
				noAvailableTimeLabel={resolvedEmptyLabel}
				nowLabel={showNow ? resolvedNowLabel : undefined}
				onConfirm={confirm}
				onControllerChange={(controller) => (panelController = controller)}
				onValueChange={(next) => (panelValue = next)}
				{presets}
				{segmentLabel}
				size={resolvedSize}
				timeZone={resolvedTimeZone}
				toggleDayPeriodLabel={toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod}
				value={panelValue}
			/>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && valueState.current}
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
	data-size={resolvedSize}
	data-disabled={resolvedDisabled || undefined}
	data-empty={!valueState.current || undefined}
	data-unavailable={resolvedOpen && !panelValue ? true : undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZInputGroup
		data-slot="input-group"
		disabled={resolvedDisabled}
		dir={resolvedDirection}
		invalid={resolvedInvalid}
		size={resolvedSize}
		suffixAction={actions}
	>
		<ZTimeField
			bind:this={fieldController}
			data-slot="field"
			aria-describedby={describedBy}
			aria-label={ariaLabel}
			aria-labelledby={labelledBy}
			appearance="bare"
			bind:ref={fieldRef}
			bind:value={fieldValue}
			{controlId}
			{dayPeriodLabel}
			disabled={resolvedDisabled}
			dir={resolvedDirection}
			formParticipation="none"
			{granularity}
			hourCycle={resolvedHourCycle}
			invalid={resolvedInvalid}
			{isTimeUnavailable}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			{minuteStep}
			onDraftChange={(next) => (fieldDraft = next)}
			onValueChange={updateFromField}
			readonly={resolvedReadonly}
			required={resolvedRequired}
			{secondStep}
			{segmentLabel}
			size={resolvedSize}
			{toggleDayPeriodLabel}
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
