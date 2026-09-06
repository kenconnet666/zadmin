<script module lang="ts">
	import type { CalendarDate as CalendarDateValue } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { DateFieldSegment } from '../../runtime/date.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { compositeInputDisabledStyles } from '../../runtime/foundation/control-styles.js';

	export type DateSegment = DateFieldSegment;
	export type DateFieldAppearance = 'bare' | 'field';
	export type DateFieldFormParticipation = 'auto' | 'none';
	export type DateFieldSize = ZControlSize;

	export interface ZDateFieldProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly appearance?: DateFieldAppearance;
		readonly controlId?: string;
		readonly defaultValue?: CalendarDateValue | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formParticipation?: DateFieldFormParticipation;
		readonly invalid?: boolean;
		readonly isDateUnavailable?: (date: CalendarDateValue) => boolean;
		readonly locale?: string;
		readonly maxValue?: CalendarDateValue;
		readonly minValue?: CalendarDateValue;
		readonly name?: string;
		readonly onFormReset?: () => void;
		readonly onValueChange?: (value: CalendarDateValue | null) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly segmentLabel?: (segment: DateSegment) => string;
		readonly size?: DateFieldSize;
		readonly timeZone?: string;
		value?: CalendarDateValue | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'date-field',
		importStatement: "import { ZDateField } from '@zadmin/zui';",
		name: 'ZDateField',
		bindings: [
			{
				description: 'CalendarDate值；null是显式空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{ description: '真实group引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'@internationalized/date',
			'locale segment order',
			'FormControlState',
			'FormValue'
		],
		events: [
			{
				description: '完整日期或清空变化。',
				name: 'onValueChange',
				type: '(value: CalendarDate | null) => void'
			},
			{
				description: '所属form reset恢复defaultValue并清理segment草稿后调用。',
				name: 'onFormReset',
				type: '() => void'
			}
		],
		keyboard: [
			{ description: '增减当前segment。', key: 'ArrowUp / ArrowDown' },
			{ description: '按locale顺序移动segment。', key: 'ArrowLeft / ArrowRight' },
			{ description: '移动到首尾segment。', key: 'Home / End' },
			{ description: '提交完整segment草稿。', key: 'Enter' },
			{ description: '放弃未提交草稿并恢复当前值。', key: 'Escape' }
		],
		parts: [{ description: 'year/month/day输入。', name: 'segment' }],
		props: [
			{
				default: "'field'",
				description: '独立边框或供DatePicker/InputGroup复用的bare外观。',
				name: 'appearance',
				type: "'bare' | 'field'"
			},
			{
				bindable: true,
				default: 'null',
				description: '日期值；null是受控空值。',
				name: 'value',
				type: 'CalendarDate | null'
			},
			{
				default: 'undefined',
				description: '非受控初始日期。',
				name: 'defaultValue',
				type: 'CalendarDate | null'
			},
			{
				default: 'Field controlId或自动生成',
				description: '第一个locale日期segment的DOM id，其余segment派生独立id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'Field context或false',
				description: '禁用所有原生segment输入并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '与不完整/非法草稿合并后投射到根和每个segment。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '保留原生segment焦点和值提交，但阻止编辑与步进。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context或false',
				description: '投射到每个可编辑日期segment的原生required语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '额外日期可用性谓词，同时约束完整草稿提交与键盘步进。',
				name: 'isDateUnavailable',
				type: '(date: CalendarDate) => boolean'
			},
			{
				default: 'Provider locale',
				description: 'segment DOM顺序和数字格式。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'Provider timeZone或UTC',
				description: 'today与locale segment pattern使用的SSR稳定IANA时区。',
				name: 'timeZone',
				type: 'string'
			},
			{
				default: 'localePack.date对应segment',
				description: '覆盖year、month、day segment可访问名称。',
				name: 'segmentLabel',
				type: '(segment: DateSegment) => string'
			},
			{ default: 'undefined', description: '最小日期。', name: 'minValue', type: 'CalendarDate' },
			{ default: 'undefined', description: '最大日期。', name: 'maxValue', type: 'CalendarDate' },
			{
				default: 'Field context或undefined',
				description: 'formParticipation为auto时提交ISO日期的隐藏字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: 'formParticipation为auto时关联唯一FormValueBridge。',
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
				default: 'Field > componentDefaults.dateField > input > density',
				description: '统一group padding、segment高度与字号。',
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'"
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZDateField.svelte',
		states: [
			{ description: '存在不完整或非法segment。', name: 'data-invalid', values: ['true'] },
			{
				description: '解析后的五档控件尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'stable',
		summary: '按locale排列year/month/day、使用CalendarDate约束并桥接表单的Date Field。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			compositeInputDisabledStyles(s);
			s.fontFamily._mono;
			s.lineHeight._compact;
			s.minWidth.px(0);
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
				xsmall: (s) => {
					s.fontSize._xsmall;
					s.gap._small;
					s.paddingInline._small;
				},
				small: (s) => {
					s.fontSize._small;
					s.gap._small;
					s.paddingInline._small;
				},
				medium: (s) => {
					s.fontSize._medium;
					s.gap._small;
					s.paddingInline._medium;
				},
				large: (s) => {
					s.fontSize._large;
					s.gap._small;
					s.paddingInline._large;
				},
				xlarge: (s) => {
					s.fontSize._large;
					s.gap._small;
					s.paddingInline._large;
				}
			}
		},
		compoundVariants: [{ when: { appearance: 'bare' }, style: (s) => s.paddingInline._small }],
		defaultVariants: { appearance: 'field', disabled: false, invalid: false, size: 'medium' }
	});
	const segmentRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.boxSizing.borderBox;
			s.lineHeight._compact;
			s.backgroundColor.transparent;
			s.borderStyle.none;
			s.color._text;
			s.fontFamily._mono;
			s.outlineStyle.none;
			s.padding.px(0);
			s.textAlign.center;
			s.width.ch(2);
			s.flexShrink(0);
		},
		variants: {
			size: {
				xsmall: (s) => {
					s.fontSize._xsmall;
				},
				small: (s) => {
					s.fontSize._small;
				},
				medium: (s) => {
					s.fontSize._medium;
				},
				large: (s) => {
					s.fontSize._large;
				},
				xlarge: (s) => {
					s.fontSize._large;
				}
			},
			year: { false: () => undefined, true: (s) => s.width.ch(4) }
		},
		defaultVariants: { size: 'medium', year: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, segmentRecipe);
</script>

<script lang="ts">
	import { CalendarDate, today } from '@internationalized/date';
	import { onDestroy, untrack } from 'svelte';
	import {
		moveIndex,
		navigationIntent,
		type NavigationIntent
	} from '../../runtime/collection/list-navigation.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import {
		clampDate,
		dateFieldPattern,
		isDateUnavailable as dateIsUnavailable,
		normalizeCalendarDateModelValue
	} from '../../runtime/date.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		appearance = 'field',
		class: className,
		controlId,
		defaultValue,
		disabled = false,
		form,
		formParticipation = 'auto',
		invalid: invalidProp = false,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		onFormReset,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		segmentLabel,
		size,
		style,
		timeZone,
		value = $bindable(),
		...rest
	}: ZDateFieldProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const group = useZInputGroup();
	const valueScope = formParticipation === 'auto' ? claimFormValueScope() : null;
	const uid = $props.id();
	const idBase = $derived(
		controlId ??
			group?.controlId ??
			field?.controlId ??
			createZuiId(zui.idPrefix, uid, 'date-field')
	);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedTimeZone = $derived(timeZone ?? zui.timeZone);
	const resolvedDisabled = $derived(disabled || group?.disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || group?.readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || group?.required || field?.required || false);
	const resolvedInvalid = $derived(invalidProp || group?.invalid || field?.invalid || false);
	const resolvedName = $derived(name ?? group?.name ?? field?.name);
	const describedBy = $derived(
		mergeAriaIds(ariaDescribedBy, group?.describedBy, field?.describedBy)
	);
	const labelledBy = $derived(mergeAriaIds(ariaLabelledBy, group?.labelId, field?.labelId));
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				group?.size ??
				field?.size ??
				zui.componentDefaults.dateField?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const constraints = $derived.by(() => {
		if (minValue && maxValue && minValue.compare(maxValue) > 0)
			throw new RangeError('ZDateField minValue cannot exceed maxValue.');
		return { maxValue, minValue };
	});
	const valueState = createFormControlState<CalendarDate | null>(
		{
			defaultValue: () => defaultValue ?? null,
			element: () => ref,
			normalizeModelValue: (candidate) => normalizeCalendarDateModelValue(candidate, 'ZDateField'),
			onChange: () => onValueChange,
			owner: 'ZDateField',
			read: () => value,
			syncNative: (next) => syncInputs(next),
			write: (next) => (value = next)
		},
		valueScope
	);
	let drafts = $state<Partial<Record<DateSegment, string>>>({});
	let draftInvalid = $state(false);
	const inputs = $state<(HTMLInputElement | null)[]>([]);
	const pattern = $derived(dateFieldPattern(resolvedLocale, resolvedTimeZone));
	const segmentOrder = $derived(
		pattern.flatMap((part) => ('segment' in part ? [part.segment] : []))
	);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			appearance,
			disabled: resolvedDisabled && !group,
			invalid: draftInvalid || resolvedInvalid,
			size: resolvedSize
		})
	);
	const contentClass = $derived(
		zui.icss((s) => {
			s.minHeight.raw(controlSizeMetrics(zui.theme, resolvedSize).contentHeight);
		})
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function syncInputs(next: CalendarDate | null): void {
		for (const [index, segment] of segmentOrder.entries()) {
			const raw = segment === 'year' ? next?.year : segment === 'month' ? next?.month : next?.day;
			if (inputs[index])
				inputs[index].value =
					raw === undefined ? '' : String(raw).padStart(segment === 'year' ? 4 : 2, '0');
		}
	}

	function segmentValue(segment: DateSegment): string {
		const draft = drafts[segment];
		if (draft !== undefined) return draft;
		const current = valueState.current;
		if (!current) return '';
		const raw =
			segment === 'year' ? current.year : segment === 'month' ? current.month : current.day;
		return String(raw).padStart(segment === 'year' ? 4 : 2, '0');
	}

	function commitDrafts(markIncomplete = true): boolean {
		if (Object.keys(drafts).length === 0) return true;
		const year = Number(drafts.year ?? valueState.current?.year);
		const month = Number(drafts.month ?? valueState.current?.month);
		const day = Number(drafts.day ?? valueState.current?.day);
		if (![year, month, day].every(Number.isInteger)) {
			draftInvalid = markIncomplete;
			return false;
		}
		try {
			const next = new CalendarDate(year, month, day);
			if (next.year !== year || next.month !== month || next.day !== day) throw new Error();
			if (dateIsUnavailable(next, constraints.minValue, constraints.maxValue, isDateUnavailable)) {
				draftInvalid = true;
				return false;
			}
			valueState.setFromUser(next);
			drafts = {};
			draftInvalid = false;
			return true;
		} catch {
			draftInvalid = true;
			return false;
		}
	}

	function availableFrom(candidate: CalendarDate, direction: -1 | 1): CalendarDate | null {
		let next = clampDate(candidate, minValue, maxValue);
		for (let attempts = 0; attempts < 3660; attempts += 1) {
			if (!dateIsUnavailable(next, minValue, maxValue, isDateUnavailable)) return next;
			const stepped = next.add({ days: direction });
			if (
				(minValue && stepped.compare(minValue) < 0) ||
				(maxValue && stepped.compare(maxValue) > 0)
			)
				return null;
			next = stepped;
		}
		return null;
	}

	function cycle(segment: DateSegment, amount: number): void {
		if (resolvedDisabled || resolvedReadonly) return;
		const base = valueState.current ?? today(resolvedTimeZone);
		const next = availableFrom(base.cycle(segment, amount), amount < 0 ? -1 : 1);
		if (!next) return;
		valueState.setFromUser(next);
		drafts = {};
		draftInvalid = false;
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
			case 'Enter':
				event.preventDefault();
				commitDrafts();
				return;
			case 'Escape':
				event.preventDefault();
				drafts = {};
				draftInvalid = false;
				return;
			default:
				return;
		}
	}

	function resetFromForm(): void {
		valueState.reset();
		drafts = {};
		draftInvalid = false;
		onFormReset?.();
	}

	function handleInput(
		event: Event & { currentTarget: HTMLInputElement },
		segment: DateSegment,
		index: number
	): void {
		const nextDraft = event.currentTarget.value.replace(/\D/gu, '');
		drafts = { ...drafts, [segment]: nextDraft };
		if (inputs.every((input) => !input?.value)) {
			valueState.setFromUser(null);
			drafts = {};
			draftInvalid = false;
			return;
		}
		const expectedLength = segment === 'year' ? 4 : 2;
		if (nextDraft.length === expectedLength) {
			commitDrafts(false);
			if (index < segmentOrder.length - 1) move(index, 'next');
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
		commitDrafts();
	}

	onDestroy(fieldOwner.registerFocusOwner(() => inputs[0]?.focus({ preventScroll: true })));
	if (group && formParticipation === 'auto')
		onDestroy(group.registerControl({ focus: () => inputs[0]?.focus({ preventScroll: true }) }));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	data-zui-composite-control=""
	data-zui-input-group-control={group ? '' : undefined}
	aria-label={labelledBy ? undefined : (ariaLabel ?? zui.localePack.date.dateFieldLabel)}
	aria-labelledby={labelledBy}
	aria-describedby={describedBy}
	aria-disabled={resolvedDisabled || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={draftInvalid || resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	onfocusout={handleFocusOut}
>
	{#each pattern as part, partIndex (partIndex)}
		{#if 'literal' in part}<span aria-hidden="true">{part.literal}</span>{:else}
			{@const index = segmentOrder.indexOf(part.segment)}
			<input
				bind:this={inputs[index]}
				class={[
					zui.recipe(segmentRecipe, {
						size: resolvedSize,
						year: part.segment === 'year'
					}),
					contentClass
				]}
				id={index === 0 ? idBase : `${idBase}-${part.segment}`}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				value={segmentValue(part.segment)}
				maxlength={part.segment === 'year' ? 4 : 2}
				disabled={resolvedDisabled}
				readonly={resolvedReadonly}
				required={resolvedRequired}
				aria-label={index === 0 && field
					? undefined
					: (segmentLabel?.(part.segment) ?? zui.localePack.date[part.segment])}
				aria-labelledby={index === 0 ? labelledBy : undefined}
				aria-describedby={describedBy}
				aria-invalid={draftInvalid || resolvedInvalid ? 'true' : ariaInvalid}
				aria-readonly={resolvedReadonly || undefined}
				aria-required={resolvedRequired || undefined}
				onfocus={(event) => event.currentTarget.select()}
				oninput={(event) => handleInput(event, part.segment, index)}
				onkeydown={(event) => handleKey(event, part.segment, index)}
			/>
		{/if}
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
