<script module lang="ts">
	import type { Time } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TimeFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type {
		TimePickerConstraints,
		TimePickerDayPeriod,
		TimePickerPreset
	} from '../../runtime/time-picker.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	type TimePickerPanelDirection = NonNullable<HTMLAttributes<HTMLElement>['dir']>;

	export type { TimePickerPreset } from '../../runtime/time-picker.js';

	export interface TimePickerPanelController {
		readonly firstFocusableElement: HTMLElement | null;

		focusFirst(): boolean;
		resetDraft(): void;
	}

	export interface TimePickerPanelProps {
		readonly cancelLabel?: string;
		readonly confirmLabel: string;
		readonly constraints: TimePickerConstraints;
		readonly dayPeriodLabel?: (period: TimePickerDayPeriod) => string;
		readonly disabled: boolean;
		readonly direction?: TimePickerPanelDirection;
		readonly footer?: boolean;
		readonly idBase: string;
		readonly invalidTimeLabel: string;
		readonly locale: string;
		readonly noAvailableTimeLabel: string;
		readonly nowLabel?: string;
		readonly onCancel?: () => void;
		readonly onConfirm: (value: Time) => void;
		readonly onControllerChange: (controller: TimePickerPanelController | null) => void;
		readonly onValueChange: (value: Time) => void;
		readonly presets?: readonly TimePickerPreset[];
		readonly readonly?: boolean;
		readonly segmentLabel?: (segment: TimeFieldSegment) => string;
		readonly size: ZControlSize;
		readonly timeZone: string;
		readonly toggleDayPeriodLabel: string;
		readonly value: Time | null;
	}

	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			s.marginBottom._large;
		},
		variants: {}
	});
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
	const feedbackRecipe = defineRecipe({
		base: (s) => {
			s.color._danger;
			s.marginTop._small;
		},
		variants: {}
	});
	const footerRecipe = defineRecipe({
		base: (s) => {
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
	for (const recipe of [actionsRecipe, columnsRecipe, emptyRecipe, feedbackRecipe, footerRecipe])
		registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { timeFieldPattern } from '../../runtime/date.js';
	import { controlSizeMetrics } from '../../runtime/foundation/control-size.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		resolveTimePickerPreset,
		selectTimePickerPart,
		timePickerNow,
		timePickerStepValues,
		timePickerValueAvailable,
		type TimePickerPart
	} from '../../runtime/time-picker.js';
	import ZButton from '../gene/ZButton.svelte';
	import TimePickerColumn, {
		type TimePickerColumnController,
		type TimePickerColumnItem
	} from './TimePickerColumn.svelte';

	let {
		cancelLabel,
		confirmLabel,
		constraints,
		dayPeriodLabel,
		disabled,
		direction,
		footer = true,
		idBase,
		invalidTimeLabel,
		locale,
		noAvailableTimeLabel,
		nowLabel,
		onCancel,
		onConfirm,
		onControllerChange,
		onValueChange,
		presets = [],
		readonly = false,
		segmentLabel,
		size,
		timeZone,
		toggleDayPeriodLabel,
		value
	}: TimePickerPanelProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(direction ?? zui.direction);
	// Imperative focus owners do not participate in rendering.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const columnControllers = new Map<number, TimePickerColumnController>();
	let panelRef = $state<HTMLDivElement | null>(null);
	let feedbackRevision = $state(0);
	let feedback = $state('');
	const resolvedHourCycle = $derived(constraints.hourCycle);
	const resolvedPresets = $derived.by(() => {
		for (const preset of presets)
			if (!preset.label.trim()) throw new TypeError('Time picker preset labels must not be empty.');
		return presets;
	});
	const panelHeight = $derived(`calc(${controlSizeMetrics(zui.theme, size).height} * 6)`);
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const columnsClass = $derived(zui.recipe(columnsRecipe));
	const emptyClass = $derived(zui.recipe(emptyRecipe));
	const feedbackClass = $derived(zui.recipe(feedbackRecipe));
	const footerClass = $derived(zui.recipe(footerRecipe));
	const controller: TimePickerPanelController = {
		resetDraft() {
			feedback = '';
		},
		get firstFocusableElement() {
			return (
				columnControllers.get(0)?.element ??
				panelRef?.querySelector<HTMLElement>('[role="listbox"]') ??
				panelRef?.querySelector<HTMLElement>('button:not(:disabled)') ??
				null
			);
		},
		focusFirst() {
			const column = columnControllers.get(0);
			if (column) return column.focus();
			const target =
				panelRef?.querySelector<HTMLElement>('[role="listbox"]') ??
				panelRef?.querySelector<HTMLElement>('button:not(:disabled)') ??
				null;
			target?.focus({ preventScroll: true });
			return target !== null;
		}
	};

	function announceInvalid(): void {
		feedback = invalidTimeLabel;
		feedbackRevision += 1;
	}

	function acceptCandidate(candidate: Time | null): void {
		if (!candidate) {
			announceInvalid();
			return;
		}
		feedback = '';
		onValueChange(candidate);
	}

	function choosePreset(preset: TimePickerPreset): void {
		if (disabled || readonly) return;
		acceptCandidate(resolveTimePickerPreset(preset, constraints));
	}

	function chooseNow(): void {
		if (disabled || readonly) return;
		acceptCandidate(timePickerNow(timeZone, constraints));
	}

	function confirm(): void {
		if (disabled || readonly || !value || !timePickerValueAvailable(value, constraints)) return;
		onConfirm(value);
	}

	function columnParts(): readonly TimePickerPart[] {
		return timeFieldPattern(locale, resolvedHourCycle, constraints.granularity).flatMap((part) => {
			if ('segment' in part) return [part.segment];
			if ('dayPeriod' in part) return ['dayPeriod' as const];
			return [];
		});
	}

	function partLabel(part: TimePickerPart): string {
		if (part === 'dayPeriod') return toggleDayPeriodLabel;
		return segmentLabel?.(part) ?? zui.localePack.time[part];
	}

	function partValues(part: TimePickerPart): readonly SelectionKey[] {
		if (part === 'dayPeriod') return ['am', 'pm'];
		if (part === 'hour')
			return resolvedHourCycle === 12
				? Array.from({ length: 12 }, (_, index) => index + 1)
				: Array.from({ length: 24 }, (_, index) => index);
		const current = value?.[part];
		return timePickerStepValues(
			part === 'minute' ? constraints.minuteStep : constraints.secondStep,
			current
		);
	}

	function selectedPartValue(part: TimePickerPart): SelectionKey | undefined {
		if (!value) return undefined;
		if (part === 'dayPeriod') return value.hour < 12 ? 'am' : 'pm';
		if (part === 'hour' && resolvedHourCycle === 12) return value.hour % 12 || 12;
		return value[part];
	}

	function formatPartValue(part: TimePickerPart, key: SelectionKey): string {
		if (part === 'dayPeriod')
			return (
				dayPeriodLabel?.(key as TimePickerDayPeriod) ??
				zui.localePack.time[key as TimePickerDayPeriod]
			);
		return new Intl.NumberFormat(locale, {
			minimumIntegerDigits: 2,
			useGrouping: false
		}).format(key as number);
	}

	function partItems(part: TimePickerPart): readonly TimePickerColumnItem[] {
		const reference = value;
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
		if (disabled || readonly || !value || item.disabled) return;
		const next = selectTimePickerPart(
			value,
			part,
			item.key as number | TimePickerDayPeriod,
			constraints
		);
		if (!next) return;
		feedback = '';
		onValueChange(next);
		if (commit) onConfirm(next);
	}

	function setColumnController(index: number, column: TimePickerColumnController | null): void {
		if (column) columnControllers.set(index, column);
		else columnControllers.delete(index);
	}

	function focusSibling(index: number, direction: -1 | 1): void {
		columnControllers.get(index + direction)?.focus();
	}

	$effect(() => {
		onControllerChange(controller);
		return () => onControllerChange(null);
	});
</script>

<div
	bind:this={panelRef}
	data-readonly={readonly || undefined}
	data-slot="panel"
	dir={resolvedDirection}
>
	{#if resolvedPresets.length > 0 || nowLabel}
		<div class={actionsClass} data-slot="actions">
			{#each resolvedPresets as preset, index (`${index}:${preset.label}`)}
				<ZButton
					disabled={disabled || readonly}
					onclick={() => choosePreset(preset)}
					{size}
					variant="outline"
				>
					{preset.label}
				</ZButton>
			{/each}
			{#if nowLabel}
				<ZButton disabled={disabled || readonly} onclick={chooseNow} {size} variant="outline">
					{nowLabel}
				</ZButton>
			{/if}
		</div>
	{/if}
	{#if value}
		<div class={columnsClass} data-slot="columns">
			{#each columnParts() as part, index (part)}
				<TimePickerColumn
					columnId={`${idBase}-${part}`}
					{disabled}
					direction={resolvedDirection}
					height={panelHeight}
					items={partItems(part)}
					label={partLabel(part)}
					onChoose={(item, commit) => choosePart(part, item, commit)}
					onControllerChange={(column) => setColumnController(index, column)}
					onFocusSibling={(direction) => focusSibling(index, direction)}
					{readonly}
					selectedKey={selectedPartValue(part)}
					{size}
				/>
			{/each}
		</div>
	{:else}
		<div class={emptyClass} data-slot="empty" role="status">{noAvailableTimeLabel}</div>
	{/if}
	{#if feedback}
		{#key feedbackRevision}
			<div aria-live="polite" class={feedbackClass} data-slot="feedback" role="status">
				{feedback}
			</div>
		{/key}
	{/if}
	{#if footer}
		<div class={footerClass} data-slot="footer">
			{#if cancelLabel && onCancel}
				<ZButton data-slot="cancel" {disabled} onclick={onCancel} {size} variant="ghost">
					{cancelLabel}
				</ZButton>
			{/if}
			<ZButton disabled={!value || disabled || readonly} onclick={confirm} {size}>
				{confirmLabel}
			</ZButton>
		</div>
	{/if}
</div>
