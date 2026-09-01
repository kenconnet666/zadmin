<script module lang="ts">
	import type { Time as TimeValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { styleInternalAction } from '../gene/internal-action.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type TimeGranularity = 'minute' | 'second';
	export type TimeDayPeriod = 'am' | 'pm';
	export type TimeSegment = 'hour' | 'minute' | 'second';
	export interface ZTimeFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly dayPeriodLabel?: (period: TimeDayPeriod) => string;
		readonly defaultValue?: TimeValue;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly granularity?: TimeGranularity;
		readonly hourCycle?: 12 | 24;
		readonly maxValue?: TimeValue;
		readonly minValue?: TimeValue;
		readonly minuteStep?: number;
		readonly name?: string;
		readonly onValueChange?: (value: TimeValue | undefined) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly secondStep?: number;
		readonly segmentLabel?: (segment: TimeSegment) => string;
		readonly toggleDayPeriodLabel?: string;
		value?: TimeValue;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'time-field',
		importStatement: "import { ZTimeField } from '@zadmin/zui';",
		name: 'ZTimeField',
		bindings: [
			{ description: 'Time值。', name: 'value', type: 'Time | undefined' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['@internationalized/date', 'time segments', 'ControllableState', 'FormValue'],
		events: [
			{
				description: '完整时间或清空变化。',
				name: 'onValueChange',
				type: '(value: Time | undefined) => void'
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
				bindable: true,
				default: 'undefined',
				description: '时间值。',
				name: 'value',
				type: 'Time'
			},
			{ default: 'undefined', description: '非受控初始时间。', name: 'defaultValue', type: 'Time' },
			{
				default: "'minute'",
				description: '是否显示秒。',
				name: 'granularity',
				type: "'minute' | 'second'"
			},
			{
				default: 'localePack.time.hourCycle',
				description: '12或24小时制；显式值优先于Provider locale pack。',
				name: 'hourCycle',
				type: '12 | 24'
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
			{ default: 'undefined', description: 'ISO时间隐藏字段名。', name: 'name', type: 'string' }
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimeField.svelte',
		states: [{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] }],
		status: 'experimental',
		summary: 'Time值、分钟/秒step、12/24小时segment与表单桥接的Time Field。'
	} as const satisfies ZuiComponentMetadata;
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.gap._small;
			s.paddingInline._medium;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: { false: () => undefined, true: (s) => s.borderColor._danger }
		},
		defaultVariants: { disabled: false, invalid: false }
	});
	const segmentRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.fontFamily._mono;
			s.fontSize._medium;
			s.minHeight._medium;
			s.outlineStyle.none;
			s.padding.px(0);
			s.textAlign.center;
			s.width.rem(3);
		},
		variants: {},
		defaultVariants: {}
	});
	const periodRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.backgroundColor._surface;
			s.borderStyle.none;
			s.color._text;
			s.padding._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, segmentRecipe);
	registerRecipeHmr(import.meta, periodRecipe);
</script>

<script lang="ts">
	import { Time } from '@internationalized/date';
	import { untrack } from 'svelte';
	import {
		moveIndex,
		navigationIntent,
		type NavigationIntent
	} from '../../runtime/collection/list-navigation.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
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
		class: className,
		dayPeriodLabel,
		defaultValue,
		disabled = false,
		form,
		granularity = 'minute',
		hourCycle: hourCycleProp,
		maxValue,
		minValue,
		minuteStep = 1,
		name,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		secondStep = 1,
		segmentLabel,
		style,
		toggleDayPeriodLabel,
		value = $bindable(),
		...rest
	}: ZTimeFieldProps = $props();
	const zui = useZui();
	const field = useZField();
	const uid = $props.id();
	const idBase = $derived(field?.controlId ?? createZuiId(zui.idPrefix, uid, 'time-field'));
	const hourCycle = $derived(hourCycleProp ?? zui.localePack.time.hourCycle);
	const constraints = $derived.by(() => {
		if (![minuteStep, secondStep].every((step) => Number.isInteger(step) && step > 0))
			throw new TypeError('ZTimeField steps must be positive integers.');
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZTimeField minValue cannot exceed maxValue.');
		return { minuteStep, secondStep };
	});
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const valueState = new ControllableState<Time | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const segments = $derived<readonly TimeSegment[]>(
		granularity === 'second' ? ['hour', 'minute', 'second'] : ['hour', 'minute']
	);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	let drafts = $state<Partial<Record<TimeSegment, string>>>({});
	let invalid = $state(false);
	let proxy = $state<HTMLInputElement | null>(null);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			disabled: resolvedDisabled,
			invalid: invalid || field?.invalid || false
		})
	);
	const segmentClass = $derived(zui.recipe(segmentRecipe));
	const periodClass = $derived(zui.recipe(periodRecipe));
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
	function commit(): void {
		let hour = Number(drafts.hour ?? valueState.current?.hour);
		const minute = Number(drafts.minute ?? valueState.current?.minute);
		const second =
			granularity === 'second' ? Number(drafts.second ?? valueState.current?.second) : 0;
		if (hourCycle === 12 && drafts.hour !== undefined) {
			const pm = (valueState.current?.hour ?? 0) >= 12;
			hour = (hour % 12) + (pm ? 12 : 0);
		}
		if (
			![hour, minute, second].every(Number.isInteger) ||
			hour < 0 ||
			hour > 23 ||
			minute < 0 ||
			minute > 59 ||
			second < 0 ||
			second > 59
		) {
			invalid = Object.keys(drafts).length > 0;
			return;
		}
		valueState.setFromUser(clamp(new Time(hour, minute, second)));
		drafts = {};
		invalid = false;
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
		valueState.setFromUser(clamp(base.cycle(segment, amount * step)));
		drafts = {};
		invalid = false;
	}
	function move(index: number, intent: NavigationIntent): void {
		const target = moveIndex(inputs.length, index, intent, false);
		inputs[target]?.focus({ preventScroll: true });
		inputs[target]?.select();
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
			default:
				return;
		}
	}
	function togglePeriod(): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? new Time(0);
		valueState.setFromUser(clamp(base.cycle('hour', 12)));
	}
	function resetFromForm(): void {
		valueState.reset();
		drafts = {};
		invalid = false;
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-disabled={resolvedDisabled || undefined}
	data-invalid={invalid || field?.invalid || undefined}
>
	{#each segments as segment, index (segment)}
		{#if index > 0}<span aria-hidden="true">:</span>{/if}
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
			aria-describedby={describedBy}
			aria-invalid={invalid || field?.invalid ? 'true' : ariaInvalid}
			onfocus={(event) => event.currentTarget.select()}
			oninput={(event) => {
				drafts = { ...drafts, [segment]: event.currentTarget.value.replace(/\D/gu, '') };
				commit();
			}}
			onblur={commit}
			onkeydown={(event) => handleKey(event, segment, index)}
		/>
	{/each}
	{#if hourCycle === 12}<button
			type="button"
			class={periodClass}
			data-slot="day-period"
			disabled={resolvedDisabled || resolvedReadonly}
			aria-label={toggleDayPeriodLabel ?? zui.localePack.time.toggleDayPeriod}
			onclick={togglePeriod}
			>{dayPeriodLabel?.((valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am') ??
				zui.localePack.time[(valueState.current?.hour ?? 0) >= 12 ? 'pm' : 'am']}</button
		>{/if}
</div>
<input
	bind:this={proxy}
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	disabled
	{form}
	use:formReset={resetFromForm}
/>
{#if resolvedName && !resolvedDisabled}<input
		type="hidden"
		{form}
		name={resolvedName}
		value={valueState.current?.toString() ?? ''}
	/>{/if}
