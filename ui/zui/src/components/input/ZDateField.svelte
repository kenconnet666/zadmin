<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type DateSegment = 'day' | 'month' | 'year';
	export interface ZDateFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly defaultValue?: CalendarDateValue;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly onValueChange?: (value: CalendarDateValue | undefined) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly segmentLabel?: (segment: DateSegment) => string;
		value?: CalendarDateValue;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'date-field',
		importStatement: "import { ZDateField } from '@zadmin/zui';",
		name: 'ZDateField',
		bindings: [
			{ description: 'CalendarDate值。', name: 'value', type: 'CalendarDate | undefined' },
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'locale segment order',
			'ControllableState',
			'FormValue'
		],
		events: [
			{
				description: '完整日期或清空变化。',
				name: 'onValueChange',
				type: '(value: CalendarDate | undefined) => void'
			}
		],
		keyboard: [
			{ description: '增减当前segment。', key: 'ArrowUp / ArrowDown' },
			{ description: '按locale顺序移动segment。', key: 'ArrowLeft / ArrowRight' },
			{ description: '移动到首尾segment。', key: 'Home / End' }
		],
		parts: [{ description: 'year/month/day输入。', name: 'segment' }],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '日期值。',
				name: 'value',
				type: 'CalendarDate'
			},
			{
				default: 'undefined',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate'
			},
			{
				default: 'Provider locale',
				description: 'segment DOM顺序和数字格式。',
				name: 'locale',
				type: 'string'
			},
			{ default: 'undefined', description: '最小日期。', name: 'minValue', type: 'CalendarDate' },
			{ default: 'undefined', description: '最大日期。', name: 'maxValue', type: 'CalendarDate' },
			{ default: 'undefined', description: 'ISO日期隐藏字段名。', name: 'name', type: 'string' }
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateField.svelte',
		states: [{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] }],
		status: 'experimental',
		summary: '按locale排列year/month/day、使用CalendarDate约束并桥接表单的Date Field。'
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
		variants: { year: { false: () => undefined, true: (s) => s.width.rem(4) } },
		defaultVariants: { year: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, segmentRecipe);
</script>

<script lang="ts">
	import { CalendarDate, today } from '@internationalized/date';
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
	import { clampDate } from '../../runtime/date.js';
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
		defaultValue,
		disabled = false,
		form,
		locale,
		maxValue,
		minValue,
		name,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		segmentLabel = (segment) => segment[0]!.toUpperCase() + segment.slice(1),
		style,
		value = $bindable(),
		...rest
	}: ZDateFieldProps = $props();
	const zui = useZui();
	const field = useZField();
	const uid = $props.id();
	const idBase = $derived(field?.controlId ?? createZuiId(zui.idPrefix, uid, 'date-field'));
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const valueState = new ControllableState<CalendarDate | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	let drafts = $state<Partial<Record<DateSegment, string>>>({});
	let invalid = $state(false);
	let proxy = $state<HTMLInputElement | null>(null);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	const pattern = $derived.by(() =>
		new Intl.DateTimeFormat(resolvedLocale, {
			day: 'numeric',
			month: 'numeric',
			timeZone: 'UTC',
			year: 'numeric'
		})
			.formatToParts(new Date(Date.UTC(2006, 10, 22)))
			.filter(({ type }) => ['day', 'month', 'year', 'literal'].includes(type))
			.map((part) =>
				part.type === 'literal' ? { literal: part.value } : { segment: part.type as DateSegment }
			)
	);
	const segmentOrder = $derived(
		pattern.flatMap((part) => ('segment' in part ? [part.segment] : []))
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			disabled: resolvedDisabled,
			invalid: invalid || field?.invalid || false
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function segmentValue(segment: DateSegment): string {
		const draft = drafts[segment];
		if (draft !== undefined) return draft;
		const current = valueState.current;
		if (!current) return '';
		const raw =
			segment === 'year' ? current.year : segment === 'month' ? current.month : current.day;
		return String(raw).padStart(segment === 'year' ? 4 : 2, '0');
	}
	function commitDrafts(): void {
		const year = Number(drafts.year ?? valueState.current?.year);
		const month = Number(drafts.month ?? valueState.current?.month);
		const day = Number(drafts.day ?? valueState.current?.day);
		if (![year, month, day].every(Number.isInteger)) {
			invalid = Object.keys(drafts).length > 0;
			return;
		}
		try {
			const next = new CalendarDate(year, month, day);
			if (next.year !== year || next.month !== month || next.day !== day) throw new Error();
			valueState.setFromUser(clampDate(next, minValue, maxValue));
			drafts = {};
			invalid = false;
		} catch {
			invalid = true;
		}
	}
	function cycle(segment: DateSegment, amount: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? today('UTC');
		valueState.setFromUser(clampDate(base.cycle(segment, amount), minValue, maxValue));
		drafts = {};
		invalid = false;
	}
	function move(index: number, intent: NavigationIntent): void {
		const target = moveIndex(segmentOrder.length, index, intent, false);
		inputs[target]?.focus({ preventScroll: true });
		inputs[target]?.select();
	}
	function handleKey(event: KeyboardEvent, segment: DateSegment, index: number): void {
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
	{#each pattern as part, partIndex (partIndex)}
		{#if 'literal' in part}<span aria-hidden="true">{part.literal}</span>{:else}
			{@const index = segmentOrder.indexOf(part.segment)}
			<input
				bind:this={inputs[index]}
				class={zui.recipe(segmentRecipe, { year: part.segment === 'year' })}
				id={index === 0 ? idBase : `${idBase}-${part.segment}`}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				value={segmentValue(part.segment)}
				maxlength={part.segment === 'year' ? 4 : 2}
				disabled={resolvedDisabled}
				readonly={resolvedReadonly}
				required={resolvedRequired}
				aria-label={index === 0 && field ? undefined : segmentLabel(part.segment)}
				aria-describedby={describedBy}
				aria-invalid={invalid || field?.invalid ? 'true' : ariaInvalid}
				onfocus={(event) => event.currentTarget.select()}
				oninput={(event) => {
					drafts = { ...drafts, [part.segment]: event.currentTarget.value.replace(/\D/gu, '') };
					commitDrafts();
				}}
				onblur={commitDrafts}
				onkeydown={(event) => handleKey(event, part.segment, index)}
			/>
		{/if}
	{/each}
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
