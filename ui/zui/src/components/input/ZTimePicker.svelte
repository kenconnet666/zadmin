<script module lang="ts">
	import type { Time as PublicTime } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { TimeFieldGranularity, TimeFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimePickerDayPeriod } from '../../runtime/time-picker.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type TimePickerGranularity = TimeFieldGranularity;

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
		readonly isTimeUnavailable?: (value: PublicTime) => boolean;
		readonly locale?: string;
		readonly maxValue?: PublicTime;
		readonly minValue?: PublicTime;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly noAvailableTimeLabel?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: PublicTime | null) => void;
		open?: boolean;
		readonly pickerLabel?: string;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly size?: ZControlSize;
		readonly toggleDayPeriodLabel?: string;
		readonly triggerLabel?: (display: string) => string;
		value?: PublicTime | null;
	}

	export const zuiMetadata = {
		bindings: [
			{ description: '唯一Time值；null是显式空值。', name: 'value', type: 'Time | null' },
			{ description: 'Popover打开状态。', name: 'open', type: 'boolean' },
			{ description: '真实Picker根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		category: 'input',
		dependencies: [
			'ZTimeField',
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
			{ description: '共享实现的小时、分钟、秒或时段listbox。', name: 'column' },
			{ description: '没有任何完整合法组合时的状态。', name: 'empty' },
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
				bindable: true,
				default: 'false',
				description: 'Popover打开状态。',
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

	const columnsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.display.flex;
			s.gap._small;
		},
		variants: {}
	});
	const emptyRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
			s.textAlign.center;
		},
		variants: {}
	});
	const footerRecipe = defineRecipe({
		base: (s) => {
			s.borderTopColor._border;
			s.borderTopStyle.solid;
			s.borderTopWidth._hairline;
			s.display.flex;
			s.justifyContent.end;
			s.marginTop._large;
			s.paddingTop._large;
		},
		variants: {}
	});
	for (const recipe of [columnsRecipe, emptyRecipe, footerRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import X from '@lucide/svelte/icons/x';
	import { Time } from '@internationalized/date';
	import { onDestroy } from 'svelte';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
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
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		initialTimePickerReference,
		sameTimeValue,
		selectTimePickerPart,
		timePickerStepValues,
		timePickerValueAvailable,
		type TimePickerConstraints,
		type TimePickerPart
	} from '../../runtime/time-picker.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZButton from '../gene/ZButton.svelte';
	import TimePickerColumn, {
		type TimePickerColumnController,
		type TimePickerColumnItem
	} from './TimePickerColumn.svelte';
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
		disabled: disabledProp = false,
		form,
		formatOptions,
		granularity = 'minute',
		hourCycle: hourCycleProp,
		invalid,
		isTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep = 1,
		name: nameProp,
		noAvailableTimeLabel,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		pickerLabel,
		placeholder,
		placement = 'bottom-start',
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		secondStep = 1,
		segmentLabel,
		size,
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
	let panelValue = $state<Time | null>(null);
	let observedOwnerValue = $state<Time | null>(null);
	// Imperative focus owners do not participate in rendering.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const columnControllers = new Map<number, TimePickerColumnController>();
	const valueState = createFormControlState<Time | null>(
		{
			defaultValue: () => defaultValue ?? null,
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
	const panelHeight = $derived(`calc(${controlSizeMetrics(zui.theme, resolvedSize).height} * 6)`);
	const rootClass = $derived(
		zui.icss((s) => {
			s._selector('& > [data-slot="input-group"] > [data-slot="suffix-action"] > button', (s) =>
				s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight)
			);
		})
	);
	const columnsClass = $derived(zui.recipe(columnsRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	const footerClass = $derived(zui.recipe(footerRecipe));

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

	function columnParts(): readonly TimePickerPart[] {
		return timeFieldPattern(resolvedLocale, resolvedHourCycle, granularity).flatMap((part) => {
			if ('segment' in part) return [part.segment];
			if ('dayPeriod' in part) return ['dayPeriod' as const];
			return [];
		});
	}

	function partLabel(part: TimePickerPart): string {
		if (part === 'dayPeriod') return toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod;
		return segmentLabel?.(part) ?? zui.localePack.time[part];
	}

	function partValues(part: TimePickerPart): readonly SelectionKey[] {
		if (part === 'dayPeriod') return ['am', 'pm'];
		if (part === 'hour')
			return resolvedHourCycle === 12
				? Array.from({ length: 12 }, (_, index) => index + 1)
				: Array.from({ length: 24 }, (_, index) => index);
		const current = panelValue?.[part];
		return timePickerStepValues(part === 'minute' ? minuteStep : secondStep, current);
	}

	function selectedPartValue(part: TimePickerPart): SelectionKey | undefined {
		if (!panelValue) return undefined;
		if (part === 'dayPeriod') return panelValue.hour < 12 ? 'am' : 'pm';
		if (part === 'hour' && resolvedHourCycle === 12) return panelValue.hour % 12 || 12;
		return panelValue[part];
	}

	function formatPartValue(part: TimePickerPart, key: SelectionKey): string {
		if (part === 'dayPeriod')
			return (
				dayPeriodLabel?.(key as TimePickerDayPeriod) ??
				zui.localePack.time[key as TimePickerDayPeriod]
			);
		return new Intl.NumberFormat(resolvedLocale, {
			minimumIntegerDigits: 2,
			useGrouping: false
		}).format(key as number);
	}

	function partItems(part: TimePickerPart): readonly TimePickerColumnItem[] {
		const reference = panelValue;
		return partValues(part).map((key) => ({
			disabled:
				!reference ||
				selectTimePickerPart(reference, part, key as number | TimePickerDayPeriod, constraints) ===
					null,
			key,
			label: formatPartValue(part, key)
		}));
	}

	function choosePart(part: TimePickerPart, item: TimePickerColumnItem, commit: boolean): void {
		if (!panelValue || item.disabled) return;
		const next = selectTimePickerPart(
			panelValue,
			part,
			item.key as number | TimePickerDayPeriod,
			constraints
		);
		if (!next) return;
		panelValue = next;
		if (commit) confirm(next);
	}

	function setColumnController(index: number, controller: TimePickerColumnController | null): void {
		if (controller) columnControllers.set(index, controller);
		else columnControllers.delete(index);
	}

	function focusSibling(index: number, direction: -1 | 1): void {
		columnControllers.get(index + direction)?.focus();
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
			initialFocus={() => columnControllers.get(0)?.element ?? null}
			role="dialog"
		>
			{#if panelValue}
				<div class={columnsClass} data-slot="columns">
					{#each columnParts() as part, index (part)}
						<TimePickerColumn
							columnId={`${idBase}-${part}`}
							disabled={resolvedDisabled || resolvedReadonly}
							height={panelHeight}
							items={partItems(part)}
							label={partLabel(part)}
							onChoose={(item, commit) => choosePart(part, item, commit)}
							onControllerChange={(controller) => setColumnController(index, controller)}
							onFocusSibling={(direction) => focusSibling(index, direction)}
							selectedKey={selectedPartValue(part)}
							size={resolvedSize}
						/>
					{/each}
				</div>
			{:else}
				<div class={emptyClass} data-slot="empty" role="status">{resolvedEmptyLabel}</div>
			{/if}
			<div class={footerClass} data-slot="footer">
				<ZButton
					disabled={!panelValue || resolvedDisabled || resolvedReadonly}
					onclick={() => confirm()}
					size={resolvedSize}
				>
					{resolvedConfirmLabel}
				</ZButton>
			</div>
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
		invalid={resolvedInvalid}
		size={resolvedSize}
		suffixAction={actions}
	>
		<ZTimeField
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
			formParticipation="none"
			{granularity}
			hourCycle={resolvedHourCycle}
			invalid={resolvedInvalid}
			{isTimeUnavailable}
			locale={resolvedLocale}
			{maxValue}
			{minValue}
			{minuteStep}
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
