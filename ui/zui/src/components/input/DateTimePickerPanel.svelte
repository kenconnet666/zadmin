<script module lang="ts">
	import type { CalendarRangeValue } from '../../runtime/date.js';
	import type { FormControlDraftState } from '../../runtime/form/form-value-adapter.svelte.js';
	import { ZonedDateTime, type CalendarDateTime, type Time } from '@internationalized/date';
	import type { TimeFieldSegment, Weekday } from '../../runtime/date.js';
	import type { DateTimeDisambiguation, DateTimeMode } from '../../runtime/date-time.js';
	import type {
		DateTimePickerDirection,
		DateTimePickerPreset,
		DateTimePickerValue
	} from '../../runtime/date-time-picker.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimePickerDayPeriod } from '../../runtime/time-picker.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type {
		DateTimePickerDirection,
		DateTimePickerPreset,
		DateTimePickerValue
	} from '../../runtime/date-time-picker.js';

	export interface DateTimePickerPanelController {
		readonly firstFocusableElement: HTMLElement | null;

		focusFirst(): boolean;
		resetDraft(): void;
	}

	export interface DateTimePickerPanelProps {
		readonly highlightRange?: CalendarRangeValue | null;
		readonly calendarLabel: string;
		readonly cancelLabel?: string;
		readonly confirmLabel: string;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly direction: DateTimePickerDirection;
		readonly disabled: boolean;
		readonly disambiguation: DateTimeDisambiguation;
		readonly firstDayOfWeek?: Weekday;
		readonly granularity: 'hour' | 'minute' | 'second';
		readonly hourCycle: 12 | 24;
		readonly idBase: string;
		readonly invalidDateTimeLabel: string;
		readonly isDateTimeUnavailable?: (value: CalendarDateTime | ZonedDateTime) => boolean;
		readonly locale: string;
		readonly maxValue?: CalendarDateTime | ZonedDateTime;
		readonly minValue?: CalendarDateTime | ZonedDateTime;
		readonly minuteStep: number;
		readonly mode: DateTimeMode;
		readonly nextLabel: string;
		readonly noAvailableTimeLabel: string;
		readonly nowLabel: string;
		readonly onCancel?: () => void;
		readonly onConfirm: (value: DateTimePickerValue) => void;
		readonly onDraftChange?: (state: FormControlDraftState) => void;
		readonly onControllerChange: (controller: DateTimePickerPanelController | null) => void;
		readonly onValueChange: (value: DateTimePickerValue) => void;
		readonly placeholderValue: DateTimePickerValue;
		readonly presets?: readonly DateTimePickerPreset[];
		readonly previousLabel: string;
		readonly secondStep: number;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly showNow?: boolean;
		readonly showOutsideDates?: boolean;
		readonly size: ZControlSize;
		readonly timeZone: string;
		readonly toggleDayPeriodLabel: string;
		readonly value: DateTimePickerValue | null;
	}

	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
		},
		variants: {}
	});
	const bodyRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._large;
		},
		variants: {}
	});
	const feedbackRecipe = defineRecipe({
		base: (s) => {
			s.color._danger;
			s.marginTop._small;
		},
		variants: {}
	});
	const footerRecipe = defineRecipe({
		base: (s) => {
			s.position.sticky;
			s.insetBlockEnd.px(0);
			s.backgroundColor._canvas;
			s.borderTopColor._border;
			s.borderTopStyle.solid;
			s.borderTopWidth._hairline;
			s.display.flex;
			s.gap._small;
			s.justifyContent.end;
			s.marginTop._large;
			s.paddingTop._large;
		},
		variants: {}
	});
	for (const recipe of [actionsRecipe, bodyRecipe, feedbackRecipe, footerRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { controlSizeMetrics } from '../../runtime/foundation/control-size.js';
	import type { CalendarDate } from '@internationalized/date';
	import { untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		composeDateTimePickerCandidate,
		dateTimePickerCalendarBounds,
		dateTimePickerNow,
		dateTimePickerParts,
		dateTimePickerTimeConstraints,
		dateTimePickerValueAvailable,
		isDateTimePickerValue,
		resolveDateTimePickerPreset,
		sameDateTimePickerValue,
		type DateTimePickerConstraints
	} from '../../runtime/date-time-picker.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZCalendar from './ZCalendar.svelte';
	import TimePickerPanel, { type TimePickerPanelController } from './TimePickerPanel.svelte';

	let {
		calendarLabel,
		cancelLabel,
		confirmLabel,
		dayPeriodLabel,
		direction,
		disabled,
		disambiguation,
		firstDayOfWeek,
		granularity,
		highlightRange,
		hourCycle,
		idBase,
		invalidDateTimeLabel,
		isDateTimeUnavailable,
		locale,
		maxValue,
		minValue,
		minuteStep,
		mode,
		nextLabel,
		noAvailableTimeLabel,
		nowLabel,
		onCancel,
		onConfirm,
		onDraftChange,
		onControllerChange,
		onValueChange,
		placeholderValue,
		presets = [],
		previousLabel,
		secondStep,
		segmentLabel,
		showNow = false,
		showOutsideDates = true,
		size,
		timeZone,
		toggleDayPeriodLabel,
		value
	}: DateTimePickerPanelProps = $props();
	const zui = useZui();
	let calendarRef = $state<HTMLDivElement | null>(null);
	let timeController = $state<TimePickerPanelController | null>(null);
	let focusedValue = $state<CalendarDate>();
	let feedback = $state('');
	let feedbackRevision = $state(0);
	const constraints = $derived<DateTimePickerConstraints>({
		disambiguation,
		granularity,
		hourCycle,
		isDateTimeUnavailable,
		maxValue,
		minValue,
		minuteStep,
		mode,
		secondStep,
		timeZone
	});
	const reference = $derived.by(() => {
		if (!isDateTimePickerValue(placeholderValue, mode))
			throw new TypeError('DateTimePickerPanel placeholderValue must match its value mode.');
		if (value && !isDateTimePickerValue(value, mode))
			throw new TypeError('DateTimePickerPanel value must match its value mode.');
		return value ?? placeholderValue;
	});
	const parts = $derived(dateTimePickerParts(reference, constraints));
	let calendarValue = $state<CalendarDate | null>(untrack(() => (value ? parts.date : null)));
	const activeDate = $derived(calendarValue ?? parts.date);
	const bounds = $derived(dateTimePickerCalendarBounds(constraints));
	const timeConstraints = $derived(
		dateTimePickerTimeConstraints(activeDate, reference, constraints)
	);
	const resolvedPresets = $derived.by(() => {
		for (const preset of presets)
			if (!preset.label.trim())
				throw new TypeError('DateTime picker preset labels must not be empty.');
		return presets;
	});
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const bodyClass = $derived(zui.recipe(bodyRecipe));
	const bodyGeometryClass = $derived(
		zui.icss((s) => {
			const height = controlSizeMetrics(zui.theme, size).height;
			s.width.raw(`calc(${height} * 15)`);
			s.maxWidth._full;
			s.gridTemplateColumns.raw(`repeat(auto-fit, minmax(min(100%, calc(${height} * 7)), 1fr))`);
		})
	);
	const feedbackClass = $derived(zui.recipe(feedbackRecipe));
	const footerClass = $derived(zui.recipe(footerRecipe));
	const controller: DateTimePickerPanelController = {
		resetDraft() {
			calendarValue = value ? parts.date : null;
			focusedValue = parts.date;
			feedback = '';
		},
		get firstFocusableElement() {
			return (
				calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ??
				timeController?.firstFocusableElement ??
				null
			);
		},
		focusFirst() {
			const target = calendarRef?.querySelector<HTMLElement>('[tabindex="0"]') ?? null;
			if (target) {
				target.focus({ preventScroll: true });
				return true;
			}
			return timeController?.focusFirst() ?? false;
		}
	};

	function announceInvalid(): void {
		feedback = invalidDateTimeLabel;
		feedbackRevision += 1;
	}

	function updateCandidate(
		candidate: DateTimePickerValue | null,
		allowUnavailable = false
	): candidate is DateTimePickerValue {
		if (!candidate) {
			announceInvalid();
			return false;
		}
		const available = dateTimePickerValueAvailable(candidate, constraints);
		if (!available) announceInvalid();
		else feedback = '';
		if (available || allowUnavailable) {
			onValueChange(candidate);
			const requested = candidate;
			(calendarRef?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() => {
				if (!sameDateTimePickerValue(value, requested))
					calendarValue = value ? dateTimePickerParts(value, constraints).date : null;
			});
			return true;
		}
		return false;
	}

	function chooseDate(date: CalendarDate | null): void {
		if (disabled || !date) return;
		updateCandidate(composeDateTimePickerCandidate(date, parts.time, reference, constraints), true);
	}

	function composeTime(time: Time): DateTimePickerValue | null {
		return composeDateTimePickerCandidate(activeDate, time, reference, constraints);
	}

	function chooseTime(time: Time): void {
		updateCandidate(composeTime(time));
	}

	function confirmTime(time: Time): void {
		const candidate = composeTime(time);
		if (!candidate || !dateTimePickerValueAvailable(candidate, constraints)) {
			announceInvalid();
			return;
		}
		feedback = '';
		onConfirm(candidate);
	}

	function choosePreset(preset: DateTimePickerPreset): void {
		if (disabled) return;
		updateCandidate(resolveDateTimePickerPreset(preset, constraints));
	}

	function chooseNow(): void {
		if (disabled) return;
		updateCandidate(
			dateTimePickerNow(
				constraints,
				new Date(),
				reference instanceof ZonedDateTime ? reference.timeZone : undefined
			)
		);
	}

	function confirm(): void {
		if (disabled || !value) return;
		const candidate = composeTime(parts.time);
		if (!candidate || !dateTimePickerValueAvailable(candidate, constraints)) {
			announceInvalid();
			return;
		}
		onConfirm(candidate);
	}

	$effect(() => {
		calendarValue = value ? parts.date : null;
		focusedValue = parts.date;
	});
	$effect(() => {
		onControllerChange(controller);
		return () => onControllerChange(null);
	});
	$effect(() => {
		// DST gaps may have no representable ZonedDateTime to send through onValueChange.
		const dirty = calendarValue !== null && calendarValue.compare(parts.date) !== 0;
		const candidate = dirty ? composeTime(parts.time) : null;
		const valid =
			!dirty || (candidate !== null && dateTimePickerValueAvailable(candidate, constraints));
		const state = Object.freeze({
			dirty,
			valid,
			message: valid ? undefined : invalidDateTimeLabel
		});
		untrack(() => onDraftChange?.(state));
	});
</script>

<div data-slot="date-time-panel" dir={direction}>
	{#if resolvedPresets.length > 0 || showNow}
		<div class={actionsClass} data-slot="date-time-actions">
			{#each resolvedPresets as preset, index (`${index}:${preset.label}`)}
				<ZButton {disabled} onclick={() => choosePreset(preset)} {size} variant="outline">
					{preset.label}
				</ZButton>
			{/each}
			{#if showNow}
				<ZButton {disabled} onclick={chooseNow} {size} variant="outline">{nowLabel}</ZButton>
			{/if}
		</div>
	{/if}
	<div class={[bodyClass, bodyGeometryClass]} data-slot="date-time-body">
		<ZCalendar
			{highlightRange}
			appearance="bare"
			bind:focusedValue
			bind:ref={calendarRef}
			{calendarLabel}
			defaultFocusedValue={parts.date}
			{disabled}
			dir={direction}
			{firstDayOfWeek}
			formParticipation="none"
			isDateUnavailable={(date) =>
				Boolean(
					(bounds.minValue && date.compare(bounds.minValue) < 0) ||
					(bounds.maxValue && date.compare(bounds.maxValue) > 0)
				)}
			{locale}
			maxValue={bounds.maxValue}
			minValue={bounds.minValue}
			{nextLabel}
			onValueChange={chooseDate}
			{previousLabel}
			required
			{showOutsideDates}
			{size}
			{timeZone}
			bind:value={calendarValue}
		/>
		<TimePickerPanel
			{confirmLabel}
			constraints={timeConstraints}
			{dayPeriodLabel}
			{disabled}
			{direction}
			footer={false}
			{idBase}
			invalidTimeLabel={invalidDateTimeLabel}
			{locale}
			{noAvailableTimeLabel}
			onConfirm={confirmTime}
			onControllerChange={(next) => (timeController = next)}
			onValueChange={chooseTime}
			{segmentLabel}
			{size}
			{timeZone}
			{toggleDayPeriodLabel}
			value={parts.time}
		/>
	</div>
	{#if feedback}
		{#key feedbackRevision}
			<div aria-live="polite" class={feedbackClass} data-slot="date-time-feedback" role="status">
				{feedback}
			</div>
		{/key}
	{/if}
	<div class={footerClass} data-slot="date-time-footer">
		{#if cancelLabel && onCancel}
			<ZButton data-slot="cancel" {disabled} onclick={onCancel} {size} variant="ghost">
				{cancelLabel}
			</ZButton>
		{/if}
		<ZButton disabled={disabled || !value} onclick={confirm} {size}>{confirmLabel}</ZButton>
	</div>
</div>
