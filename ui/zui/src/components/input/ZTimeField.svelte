<script module lang="ts">
	import type { Time as TimeValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type {
		TimeDayPeriod as TimeDayPeriodValue,
		TimeFieldGranularity,
		TimeFieldSegment
	} from '../../runtime/date.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type TimeGranularity = TimeFieldGranularity;
	export type TimeDayPeriod = TimeDayPeriodValue;
	export type TimeSegment = TimeFieldSegment;
	export type TimeFieldAppearance = 'bare' | 'field';
	export type TimeFieldFormParticipation = 'auto' | 'none';
	export type TimeFieldSize = ZControlSize;
	export interface ZTimeFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
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
		readonly onReset?: () => void;
		readonly onValueChange?: (value: TimeValue | null) => void;
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
		dependencies: ['@internationalized/date', 'time segments', 'ControllableState', 'FormValue'],
		events: [
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
				default: 'false（或继承Field）',
				description: '禁用全部时间segment和AM/PM操作，并同步禁用表单值桥。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'minute'",
				description: '是否显示秒。',
				name: 'granularity',
				type: "'minute' | 'second'"
			},
			{
				default: 'Intl locale（locale pack后备）',
				description: '12或24小时制；显式值优先于locale推断。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'undefined（继承Provider locale）',
				description: '用于解析和渲染时间segment顺序、数字格式与hour cycle的locale。',
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
				name: 'onReset',
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
				default: 'Field size或Provider density',
				description: '统一group padding、segment和day-period尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimeField.svelte',
		states: [{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] }],
		status: 'stable',
		summary: 'Time值、分钟/秒step、12/24小时segment与表单桥接的Time Field。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._medium;
			s.display.inlineFlex;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
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
				large: (s) => {
					s.gap._medium;
					s.paddingInline._large;
				},
				medium: (s) => {
					s.gap._small;
					s.paddingInline._medium;
				},
				small: (s) => {
					s.gap._small;
					s.paddingInline._small;
				}
			}
		},
		defaultVariants: { appearance: 'field', disabled: false, invalid: false, size: 'medium' }
	});
	const segmentRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.fontFamily._mono;
			s.outlineStyle.none;
			s.padding.px(0);
			s.textAlign.center;
			s.width.rem(3);
		},
		variants: {
			size: {
				large: (s) => {
					s.fontSize._large;
					s.minHeight._large;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.minHeight._medium;
				},
				small: (s) => {
					s.fontSize._small;
					s.minHeight._small;
				}
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const periodRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.backgroundColor._surface;
			s.borderStyle.none;
			s.color._text;
			s.padding._small;
		},
		variants: {
			size: {
				large: (s) => s.padding._medium,
				medium: (s) => s.padding._small,
				small: (s) => s.padding._small
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
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { resolveHourCycle, timeFieldPattern } from '../../runtime/date.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
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
		onReset,
		onValueChange,
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
	const uid = $props.id();
	const idBase = $derived(
		controlId ?? field?.controlId ?? createZuiId(zui.idPrefix, uid, 'time-field')
	);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const hourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const constraints = $derived.by(() => {
		if (![minuteStep, secondStep].every((step) => Number.isInteger(step) && step > 0 && step < 60))
			throw new TypeError('ZTimeField steps must be positive integers below 60.');
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZTimeField minValue cannot exceed maxValue.');
		return { minuteStep, secondStep };
	});
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const valueState = new ControllableState<Time | null>({
		defaultValue: () => defaultValue ?? null,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
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
	const visiblePeriod = $derived<TimeDayPeriod>(
		draftPeriod ?? ((valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am')
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			appearance,
			disabled: resolvedDisabled,
			invalid: draftInvalid || invalidProp || field?.invalid || false,
			size: resolvedSize
		})
	);
	const segmentClass = $derived(zui.recipe(segmentRecipe, { size: resolvedSize }));
	const periodClass = $derived(zui.recipe(periodRecipe, { size: resolvedSize }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function display(segment: TimeSegment): string {
		if (drafts[segment] !== undefined) return drafts[segment]!;
		const current = valueState.current;
		if (!current) return '';
		let raw =
			segment === 'hour' ? current.hour : segment === 'minute' ? current.minute : current.second;
		if (segment === 'hour' && hourCycle === 12) raw = raw % 12 || 12;
		return String(raw).padStart(2, '0');
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
		let hour = Number(drafts.hour ?? valueState.current?.hour);
		const enteredHour = hour;
		const minute = Number(drafts.minute ?? valueState.current?.minute);
		const second =
			granularity === 'second' ? Number(drafts.second ?? valueState.current?.second) : 0;
		if (hourCycle === 12 && drafts.hour !== undefined) {
			const pm = (draftPeriod ?? ((valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am')) === 'pm';
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
		const next = new Time(hour, minute, second);
		if (unavailable(next)) {
			draftInvalid = true;
			return false;
		}
		valueState.setFromUser(next);
		drafts = {};
		draftPeriod = null;
		draftInvalid = false;
		return true;
	}
	function cycle(segment: TimeSegment, amount: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? new Time(0);
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
		valueState.setFromUser(next);
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
		const intent = navigationIntent(event.key, 'horizontal', zui.direction);
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
				drafts = {};
				draftPeriod = null;
				draftInvalid = false;
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
		const base = valueState.current ?? new Time(0);
		valueState.setFromUser(clamp(base.cycle('hour', 12)));
	}
	function handlePeriodKey(event: KeyboardEvent): void {
		const index = focusOrder.indexOf('dayPeriod');
		const intent = navigationIntent(event.key, 'horizontal', zui.direction);
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
		onReset?.();
	}
	function handleInput(
		event: Event & { currentTarget: HTMLInputElement },
		segment: TimeSegment,
		focusIndex: number
	): void {
		const nextDraft = event.currentTarget.value.replace(/\D/gu, '');
		drafts = { ...drafts, [segment]: nextDraft };
		if (inputs.every((input) => !input?.value)) {
			valueState.setFromUser(null);
			drafts = {};
			draftPeriod = null;
			draftInvalid = false;
			return;
		}
		if (nextDraft.length === 2) {
			commit(false);
			if (focusIndex < focusOrder.length - 1) move(focusIndex, 'next');
		}
	}
	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		if (
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		)
			return;
		commit();
	}
	onDestroy(fieldOwner.registerFocusOwner(() => inputs[0]?.focus({ preventScroll: true })));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-label={ariaLabelledBy || field
		? undefined
		: (ariaLabel ?? zui.localePack.time.timeFieldLabel)}
	aria-labelledby={mergeAriaIds(ariaLabelledBy, field?.labelId)}
	aria-describedby={describedBy}
	aria-disabled={resolvedDisabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={draftInvalid || invalidProp || field?.invalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
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
				class={segmentClass}
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
				aria-labelledby={index === 0 ? mergeAriaIds(ariaLabelledBy, field?.labelId) : undefined}
				aria-describedby={describedBy}
				aria-invalid={draftInvalid || invalidProp || field?.invalid ? 'true' : ariaInvalid}
				aria-readonly={resolvedReadonly || undefined}
				aria-required={resolvedRequired || undefined}
				onfocus={(event) => event.currentTarget.select()}
				oninput={(event) => handleInput(event, segment, focusIndex)}
				onkeydown={(event) => handleKey(event, segment, focusIndex)}
			/>
		{:else}<button
				bind:this={periodRef}
				type="button"
				class={periodClass}
				data-slot="day-period"
				disabled={resolvedDisabled || resolvedReadonly}
				aria-disabled={resolvedReadonly || undefined}
				aria-label={toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod}
				onclick={togglePeriod}
				onkeydown={handlePeriodKey}
				>{dayPeriodLabel?.(visiblePeriod) ?? zui.localePack.time[visiblePeriod]}</button
			>{/if}
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
