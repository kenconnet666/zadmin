<script module lang="ts">
	import type { Time } from '@internationalized/date';
	import type { HTMLAttributes } from 'svelte/elements';

	import { styleInternalAction } from '../gene/internal-action.js';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { controlSizeStyles, type ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TimeGridGranularity, TimeGridSlot } from '../../runtime/time-grid.js';

	export type TimeGridFormParticipation = 'auto' | 'none';
	export type TimeGridSize = ZControlSize;
	// eslint-disable-next-line no-import-assign -- Type-only re-exports have no runtime assignments.
	export type { TimeGridGranularity, TimeGridSlot } from '../../runtime/time-grid.js';

	export interface ZTimeGridProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onchange'
	> {
		readonly allowDeselect?: boolean;
		readonly columns?: number;
		readonly defaultValue?: Time | null;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formParticipation?: TimeGridFormParticipation;
		readonly granularity?: TimeGridGranularity;
		readonly gridLabel?: string;
		readonly hourCycle?: 12 | 24;
		readonly invalid?: boolean;
		readonly isTimeUnavailable?: (value: Time) => boolean;
		readonly locale?: string;
		readonly maxValue?: Time;
		readonly minValue?: Time;
		readonly name?: string;
		readonly onValueChange?: (value: Time | null) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: TimeGridSize;
		readonly slots: readonly TimeGridSlot[];
		value?: Time | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'time-grid',
		importStatement: "import { ZTimeGrid } from '@zadmin/zui';",
		name: 'ZTimeGrid',
		bindings: [
			{ description: '唯一Time/null选择值。', name: 'value', type: 'Time | null' },
			{ description: '真实radiogroup根元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'Time',
			'LogicalCollection',
			'CollectionNavigation',
			'MountedElements',
			'FormControlState',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户选择或清空时返回Time/null；外部同步与reset不触发。',
				name: 'onValueChange',
				type: '(value: Time | null) => void'
			}
		],
		keyboard: [
			{
				description: '循环移动到相邻可用时隙并选择；RTL反转左右，只读时仅移动焦点。',
				key: 'Arrow keys'
			},
			{ description: '移动并选择首个或末个可用时隙；只读时仅移动焦点。', key: 'Home / End' },
			{ description: '选择当前时隙；再次选择是否清空由allowDeselect决定。', key: 'Enter / Space' },
			{ description: '清空nullable选择；required只报告无效。', key: 'Delete / Backspace' }
		],
		parts: [
			{ description: '显式Time时隙button radio。', name: 'slot' },
			{ description: 'standalone intrinsic validation的可访问反馈。', name: 'feedback' }
		],
		props: [
			{
				default: '无',
				description: '显式有序时隙；value必须是唯一Time，label缺省时本地化格式化。',
				name: 'slots',
				required: true,
				type: 'readonly TimeGridSlot[]'
			},
			{
				default: 'false',
				description: '再次激活当前时隙时是否清空选择。',
				name: 'allowDeselect',
				type: 'boolean'
			},
			{
				default: '4',
				description: '正整数视觉网格列数；逻辑顺序始终来自slots。',
				name: 'columns',
				type: 'number'
			},
			{
				default: 'null',
				description: '非受控初始Time/null与form reset基线。',
				name: 'defaultValue',
				type: 'Time | null'
			},
			{
				default: 'null',
				description: '受控唯一Time/null；不在slots或违反约束的外部值会报告intrinsic invalid。',
				name: 'value',
				type: 'Time | null'
			},
			{
				default: 'false',
				description: '禁用全部时隙并退出FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保留浏览、焦点和FormData，拒绝选择与清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '空选择进入invalid但仍允许用户清空。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '外部无效状态，与intrinsic constraints合并。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '最早可选Time；不重排或生成slots。',
				name: 'minValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '最晚可选Time；不重排或生成slots。',
				name: 'maxValue',
				type: 'Time'
			},
			{
				default: 'undefined',
				description: '按完整Time禁用候选时隙并验证外部值。',
				name: 'isTimeUnavailable',
				type: '(value: Time) => boolean'
			},
			{
				default: "'minute'",
				description: '缺省时隙label显示到hour、minute或second。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '缺省时隙label使用的12或24小时显示制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'Provider locale',
				description: '缺省时隙label使用的Intl locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'locale.time.chooseTime',
				description: 'standalone radiogroup可访问名称。',
				name: 'gridLabel',
				type: 'string'
			},
			{
				default: "componentDefaults.timeGrid.size → Field/Provider input → 'medium'",
				description: '统一全部时隙的五档控制尺寸。',
				name: 'size',
				type: 'TimeGridSize'
			},
			{
				default: 'Field context 或 undefined',
				description: '唯一ISO Time FormData字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: 'FormValueBridge关联的外部form id。',
				name: 'form',
				type: 'string'
			},
			{
				default: "'auto'",
				description: 'none退出FormValueBridge与ZForm value scope，但仍触发值回调。',
				name: 'formParticipation',
				type: "'auto' | 'none'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实radiogroup根元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTimeGrid.svelte',
		states: [
			{ description: '当前选中时隙。', name: 'data-selected', values: ['true'] },
			{ description: '组件或时隙不可用。', name: 'data-disabled', values: ['true'] },
			{ description: '只读浏览状态。', name: 'data-readonly', values: ['true'] },
			{ description: '外部或intrinsic无效状态。', name: 'data-invalid', values: ['true'] },
			{
				description: '解析后的控制尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			}
		],
		status: 'experimental',
		summary: '以显式Time时隙、roving radio焦点与唯一表单owner提供nullable单选网格。'
	} as const satisfies ZuiComponentMetadata;

	const gridRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
			s.minWidth.px(0);
			s.maxWidth._full;
		},
		variants: {}
	});
	const slotRecipe = defineRecipe({
		base: (s) => {
			styleInternalAction(s);
			s.borderColor._border;
			s.color._text;
			s.fontFamily._mono;
			s.width._full;
			s.minWidth.px(0);
			s.whiteSpace.normal;
			s.overflowWrap.anywhere;
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			readonly: { false: () => undefined, true: (s) => s.cursor.default },
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._primarySubtle;
					s.borderColor._primary;
					s.color._primary;
				}
			},
			size: controlSizeStyles
		},
		defaultVariants: { disabled: false, readonly: false, selected: false, size: 'medium' }
	});
	registerRecipeHmr(import.meta, gridRecipe);
	registerRecipeHmr(import.meta, slotRecipe);
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { Action } from 'svelte/action';

	import { CollectionNavigation } from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { resolveHourCycle } from '../../runtime/date.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import {
		claimFormValueScope,
		createFormControlState,
		type FormControlDraftState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import {
		normalizeTimeGridSlots,
		normalizeTimeGridValue,
		sameTimeGridValue,
		timeGridValueAvailable,
		validateTimeGridConstraints,
		type NormalizedTimeGridSlot
	} from '../../runtime/time-grid.js';
	import {
		formatTimeValue,
		serializeTimeValue,
		validateTimeValueFormatOptions
	} from '../../runtime/time-value.js';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';

	interface GridSlotRecord extends NormalizedTimeGridSlot {
		readonly label: string;
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		allowDeselect = false,
		class: className,
		columns = 4,
		defaultValue,
		disabled: disabledProp = false,
		form,
		formParticipation = 'auto',
		granularity = 'minute',
		gridLabel,
		hourCycle: hourCycleProp,
		invalid,
		isTimeUnavailable,
		locale,
		maxValue,
		minValue,
		name: nameProp,
		onValueChange,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		size,
		slots,
		style,
		value = $bindable(),
		...rest
	}: ZTimeGridProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const claimedValueScope = untrack(claimFormValueScope);
	const valueScope = untrack(() => (formParticipation === 'auto' ? claimedValueScope : null));
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'time-grid'));
	const feedbackId = $derived(`${idBase}-feedback`);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedHourCycle = $derived(
		hourCycleProp ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const displayOptions = $derived.by(() => {
		const result = { granularity, hourCycle: resolvedHourCycle };
		validateTimeValueFormatOptions(result);
		return result;
	});
	const resolvedDisabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedReadonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.timeGrid?.size ??
				zui.componentDefaults.input?.size,
			zui.density
		)
	);
	const resolvedColumns = $derived.by(() => {
		if (!Number.isInteger(columns) || columns < 1)
			throw new TypeError('ZTimeGrid columns must be a positive integer.');
		return columns;
	});
	const constraints = $derived.by(() => {
		const result = { isTimeUnavailable, maxValue, minValue };
		validateTimeGridConstraints(result);
		return result;
	});
	const records = $derived.by<GridSlotRecord[]>(() => {
		const rules = constraints;
		const formatting = displayOptions;
		return normalizeTimeGridSlots(slots).map((slot) =>
			Object.freeze({
				...slot,
				disabled: slot.disabled || !timeGridValueAvailable(slot.value, rules),
				label: slot.label ?? formatTimeValue(slot.value, resolvedLocale, formatting)
			})
		);
	});
	const collection = $derived(
		new LogicalCollection<string, GridSlotRecord>(
			records,
			{
				disabled: (slot) => slot.disabled,
				key: (slot) => slot.key,
				textValue: (slot) => slot.label
			},
			{ name: 'ZTimeGrid slots' }
		)
	);
	const view = $derived(collection.full);
	const mounted = new MountedElements<string, HTMLButtonElement>();

	function normalizeValue(candidate: unknown): Time | null {
		return normalizeTimeGridValue(candidate, 'ZTimeGrid');
	}

	function selectedRecord(candidate: Time | null): GridSlotRecord | undefined {
		return candidate ? records.find((record) => record.value.compare(candidate) === 0) : undefined;
	}

	function inspectDraftState(): FormControlDraftState {
		const current = valueState.current;
		const valid =
			(!resolvedRequired || current !== null) &&
			(current === null || selectedRecord(current)?.disabled === false);
		return Object.freeze({
			dirty: false,
			message: valid
				? undefined
				: current === null && resolvedRequired
					? zui.localePack.form.requiredValue
					: zui.localePack.time.invalidTime,
			valid
		});
	}

	const valueState = createFormControlState<Time | null>(
		{
			defaultValue: () => normalizeValue(defaultValue),
			draftState: inspectDraftState,
			element: () => ref,
			normalizeModelValue: normalizeValue,
			onChange: () => onValueChange,
			owner: 'ZTimeGrid',
			read: () => (value === undefined ? undefined : normalizeValue(value)),
			write: (next) => (value = next)
		},
		valueScope
	);
	let activeKey = $state<string | undefined>(
		untrack(() => selectedRecord(valueState.current)?.key ?? view.first())
	);
	const navigation = new CollectionNavigation<string, GridSlotRecord>({
		direction: () => getElementDirection(ref, zui.direction),
		disabled: () => resolvedDisabled,
		loop: () => true,
		orientation: () => 'both',
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const mountSlot: Action<HTMLButtonElement, GridSlotRecord> = (node, slot) => {
		const destroy = mounted.mount(
			slot.key,
			node,
			`${idBase}-${slot.key.replace(/[^a-zA-Z0-9_-]/gu, '-')}`
		);
		return { destroy };
	};
	const intrinsicState = $derived.by(inspectDraftState);
	const resolvedInvalid = $derived(!intrinsicState.valid || (invalid ?? field?.invalid ?? false));
	const resolvedDescribedBy = $derived(
		mergeAriaIds(
			ariaDescribedBy,
			field?.describedBy,
			!intrinsicState.valid ? feedbackId : undefined
		)
	);
	const resolvedGridLabel = $derived(
		ariaLabel ?? (resolvedLabelledBy ? undefined : (gridLabel ?? zui.localePack.time.chooseTime))
	);
	const gridClass = $derived(zui.recipe(gridRecipe));
	const layoutClass = $derived(
		zui.icss((s) => s.gridTemplateColumns.raw(`repeat(${resolvedColumns}, minmax(0, 1fr))`))
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function selected(slot: GridSlotRecord): boolean {
		return sameTimeGridValue(valueState.current, slot.value);
	}

	function choose(
		slot: GridSlotRecord,
		control: HTMLButtonElement,
		allowActivationDeselect = true
	): void {
		if (resolvedDisabled || resolvedReadonly || slot.disabled || control.matches(':disabled'))
			return;
		const next = allowActivationDeselect && selected(slot) && allowDeselect ? null : slot.value;
		valueState.setFromUser(next);
	}

	function clear(control: HTMLButtonElement): void {
		if (resolvedDisabled || resolvedReadonly || control.matches(':disabled')) return;
		valueState.setFromUser(null);
	}

	function handleKeydown(
		event: KeyboardEvent & { currentTarget: HTMLButtonElement },
		slot: GridSlotRecord
	): void {
		if (resolvedDisabled || event.currentTarget.matches(':disabled')) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(slot, event.currentTarget);
			return;
		}
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			clear(event.currentTarget);
			return;
		}
		if (!navigation.handleKey(event)) return;
		const target = navigation.currentKey;
		if (target === undefined) return;
		const targetElement = mounted.get(target)?.element;
		const targetSlot = view.get(target)?.value;
		if (targetElement) mounted.focus(target);
		if (targetElement && targetSlot && !resolvedReadonly) choose(targetSlot, targetElement, false);
	}

	function reset(): void {
		valueState.reset();
	}

	$effect(() => {
		const current = valueState.current;
		const chosen = selectedRecord(current);
		if (chosen && !chosen.disabled) activeKey = chosen.key;
		else navigation.reconcile();
	});
	onDestroy(
		fieldOwner.registerFocusOwner(() => {
			const target = navigation.currentKey ?? view.first();
			if (target !== undefined) mounted.focus(target);
		})
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[gridClass, layoutClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="radiogroup"
	aria-describedby={resolvedDescribedBy}
	aria-disabled={resolvedDisabled || undefined}
	aria-invalid={resolvedInvalid ? 'true' : undefined}
	aria-label={resolvedGridLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-readonly={resolvedReadonly || undefined}
	aria-required={resolvedRequired || undefined}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-slot="time-grid"
	data-value={valueState.current?.toString()}
>
	{#each records as slot (slot.key)}
		<button
			class={zui.recipe(slotRecipe, {
				disabled: resolvedDisabled || slot.disabled,
				readonly: resolvedReadonly,
				selected: selected(slot),
				size: resolvedSize
			})}
			type="button"
			use:mountSlot={slot}
			disabled={resolvedDisabled || slot.disabled}
			role="radio"
			aria-checked={selected(slot)}
			aria-disabled={resolvedDisabled || slot.disabled || undefined}
			aria-label={slot.label}
			tabindex={activeKey === slot.key && !resolvedDisabled && !slot.disabled ? 0 : -1}
			data-disabled={resolvedDisabled || slot.disabled || undefined}
			data-selected={selected(slot) || undefined}
			data-slot="slot"
			data-value={slot.key}
			onclick={(event) => choose(slot, event.currentTarget)}
			onfocus={() => (activeKey = slot.key)}
			onkeydown={(event) => handleKeydown(event, slot)}>{slot.label}</button
		>
	{/each}
</div>
{#if !intrinsicState.valid}
	<ZVisuallyHidden id={feedbackId} data-slot="feedback" aria-live="polite"
		>{intrinsicState.message}</ZVisuallyHidden
	>
{/if}
{#if formParticipation === 'auto'}
	<FormValueBridge
		disabled={resolvedDisabled}
		{form}
		name={resolvedName}
		value={valueState.current ? serializeTimeValue(valueState.current) : undefined}
		onReset={reset}
	/>
{/if}
