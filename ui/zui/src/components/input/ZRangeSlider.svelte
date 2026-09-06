<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type {
		SliderCollision,
		SliderOrientation,
		SliderRangeValue
	} from '../../runtime/slider.js';
	import type { SliderMark, SliderSize, SliderTone, SliderValueLabel } from './ZSlider.svelte';

	export type RangeSliderThumbRefs = [HTMLInputElement | null, HTMLInputElement | null];
	const sliderThumbIndices = [0, 1] as const;

	export type ZRangeSliderProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'aria-disabled'
		| 'aria-invalid'
		| 'aria-readonly'
		| 'children'
		| 'id'
		| 'onkeydown'
		| 'onlostpointercapture'
		| 'onpointercancel'
		| 'onpointerdown'
		| 'onpointermove'
		| 'onpointerup'
		| 'role'
	> & {
		readonly collision?: SliderCollision;
		readonly defaultValue?: SliderRangeValue;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly formatValue?: (value: number, index: 0 | 1) => string;
		readonly id?: string;
		readonly invalid?: boolean;
		readonly label?: Snippet<[value: number, index: 0 | 1]>;
		readonly mark?: Snippet<[mark: SliderMark, index: number]>;
		readonly marks?: readonly SliderMark[];
		readonly max?: number;
		readonly min?: number;
		readonly minRange?: number;
		readonly name?: string;
		readonly onkeydown?: (event: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
		readonly onlostpointercapture?: HTMLAttributes<HTMLDivElement>['onlostpointercapture'];
		readonly onpointercancel?: HTMLAttributes<HTMLDivElement>['onpointercancel'];
		readonly onpointerdown?: HTMLAttributes<HTMLDivElement>['onpointerdown'];
		readonly onpointermove?: HTMLAttributes<HTMLDivElement>['onpointermove'];
		readonly onpointerup?: HTMLAttributes<HTMLDivElement>['onpointerup'];
		readonly onValueChange?: (value: SliderRangeValue) => void;
		readonly onValueCommit?: (value: SliderRangeValue) => void;
		readonly orientation?: SliderOrientation;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly reversed?: boolean;
		readonly size?: SliderSize;
		readonly step?: number;
		thumbRefs?: RangeSliderThumbRefs;
		readonly thumbLabels: readonly [string, string];
		readonly tone?: SliderTone;
		value?: SliderRangeValue;
		readonly valueLabel?: SliderValueLabel;
	};

	export const zuiMetadata = {
		bindings: [
			{ description: '当前已排序的二元值。', name: 'value', type: 'SliderRangeValue' },
			{ description: '范围根元素。', name: 'ref', type: 'HTMLDivElement | null' },
			{
				description: '两个真实range input，顺序对应下界和上界。',
				name: 'thumbRefs',
				type: 'RangeSliderThumbRefs'
			}
		],
		category: 'input',
		dependencies: ['native input[type=range]', 'ControllableState', 'slider runtime', 'Field'],
		events: [
			{
				description: '每次用户值变化后触发。',
				name: 'onValueChange',
				type: '(value: SliderRangeValue) => void'
			},
			{
				description: '指针或键盘交互结束时触发一次。',
				name: 'onValueCommit',
				type: '(value: SliderRangeValue) => void'
			},
			{
				description: '从真实thumb冒泡到范围根的原生input。',
				name: 'oninput',
				type: 'InputEventHandler<HTMLDivElement>'
			},
			{
				description: '从真实thumb冒泡到范围根的原生change。',
				name: 'onchange',
				type: 'EventHandler<Event, HTMLDivElement>'
			},
			{
				description: '当前真实thumb的原生keydown，可preventDefault取消内建变化。',
				name: 'onkeydown',
				type: 'KeyboardEventHandler<HTMLInputElement>'
			},
			{
				description: '轨道原生pointerdown，可preventDefault取消拖动。',
				name: 'onpointerdown',
				type: 'PointerEventHandler<HTMLDivElement>'
			},
			{
				description: '拖动中的轨道原生pointermove。',
				name: 'onpointermove',
				type: 'PointerEventHandler<HTMLDivElement>'
			},
			{
				description: '结束拖动的轨道原生pointerup。',
				name: 'onpointerup',
				type: 'PointerEventHandler<HTMLDivElement>'
			},
			{
				description: '轨道丢失pointer capture；清理拖动且不commit。',
				name: 'onlostpointercapture',
				type: 'PointerEventHandler<HTMLDivElement>'
			},
			{
				description: '取消拖动的轨道原生pointercancel。',
				name: 'onpointercancel',
				type: 'PointerEventHandler<HTMLDivElement>'
			}
		],
		id: 'range-slider',
		importStatement: "import { ZRangeSlider } from '@zadmin/zui';",
		keyboard: [
			{
				description: '按方向、RTL和reversed移动当前thumb，并应用碰撞策略。',
				key: 'Arrow keys / Home / End / PageUp / PageDown'
			}
		],
		name: 'ZRangeSlider',
		parts: [
			{ description: '拥有公开class/style/ref的范围根。', name: 'root' },
			{ description: '指针命中与几何坐标域。', name: 'track' },
			{ description: '共同domain的轨道底色。', name: 'rail' },
			{ description: '两个值之间的选择区。', name: 'fill' },
			{ description: '两个视觉thumb。', name: 'thumb' },
			{ description: 'domain标记。', name: 'marks' },
			{ description: '各thumb的数值提示。', name: 'value-label' },
			{ description: '两个真实range owner。', name: 'input' }
		],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前二元范围；输出始终按下界、上界排序。',
				name: 'value',
				type: 'SliderRangeValue'
			},
			{
				default: '[25, 75]',
				description: '非受控初值和form reset基线。',
				name: 'defaultValue',
				type: 'SliderRangeValue'
			},
			{ default: '0', description: '共同domain最小值。', name: 'min', type: 'number' },
			{ default: '100', description: '共同domain最大值。', name: 'max', type: 'number' },
			{ default: '1', description: '共同正步长。', name: 'step', type: 'number' },
			{
				default: '0',
				description: '两个thumb之间的最小数值距离；向上对齐到step。',
				name: 'minRange',
				type: 'number'
			},
			{
				default: 'clamp',
				description: 'thumb相遇时钳制、推动相邻thumb或交换活动thumb。',
				name: 'collision',
				type: "'clamp' | 'push' | 'swap'"
			},
			{
				default: 'required',
				description: '两个真实range input的可访问名称。',
				name: 'thumbLabels',
				required: true,
				type: 'readonly [string, string]'
			},
			{
				default: 'horizontal',
				description: '轨道方向。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				default: 'false',
				description: '反转视觉和值增量方向。',
				name: 'reversed',
				type: 'boolean'
			},
			{
				default: '[]',
				description: '共同domain标记。',
				name: 'marks',
				type: 'readonly SliderMark[]'
			},
			{
				default: 'focus',
				description: '两个thumb的提示显示策略。',
				name: 'valueLabel',
				type: 'SliderValueLabel'
			},
			{
				default: 'String(value)',
				description: '格式化每个thumb的aria与提示。',
				name: 'formatValue',
				type: '(value: number, index: 0 | 1) => string'
			},
			{
				default: 'undefined',
				description: '自定义每个thumb的提示内容。',
				name: 'label',
				type: 'Snippet<[number, 0 | 1]>'
			},
			{
				default: 'undefined',
				description: '自定义mark内容。',
				name: 'mark',
				type: 'Snippet<[SliderMark, number]>'
			},
			{
				default: 'Field → componentDefaults.rangeSlider → componentDefaults.slider → density',
				description: '五档尺寸。',
				name: 'size',
				type: 'SliderSize'
			},
			{
				default: 'componentDefaults.rangeSlider → componentDefaults.slider → primary',
				description: '选择区色调。',
				name: 'tone',
				type: 'SliderTone'
			},
			{ default: 'false', description: '禁用两个真实input。', name: 'disabled', type: 'boolean' },
			{
				default: 'Field或自身',
				description: '阻止修改并保留焦点和FormData。',
				name: 'readonly',
				type: 'boolean'
			},
			{ default: 'Field或false', description: '错误语义。', name: 'invalid', type: 'boolean' },
			{
				default: 'Field或undefined',
				description: '两个input共享的表单字段名。',
				name: 'name',
				type: 'string'
			},
			{ default: 'undefined', description: '显式关联的form id。', name: 'form', type: 'string' },
			{
				default: 'Field或false',
				description: '两个真实input的required状态。',
				name: 'required',
				type: 'boolean'
			},
			{ default: 'undefined', description: '下界input id的基名。', name: 'id', type: 'string' },
			{
				bindable: true,
				default: 'null',
				description: '范围根引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			},
			{
				bindable: true,
				default: '[null, null]',
				description: '两个真实range input引用。',
				name: 'thumbRefs',
				type: 'RangeSliderThumbRefs'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '每个thumb的value提示。', name: 'label', type: 'Snippet<[number, 0 | 1]>' },
			{ description: 'mark标签。', name: 'mark', type: 'Snippet<[SliderMark, number]>' }
		],
		source: 'ui/zui/src/components/input/ZRangeSlider.svelte',
		states: [
			{ description: '当前下界与上界。', name: 'data-value', values: ['lower,upper'] },
			{ description: '轨道方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{ description: '反向布局。', name: 'data-reversed', values: ['true'] },
			{
				description: '当前五档尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '当前活动thumb。', name: 'data-active-thumb', values: ['lower', 'upper'] },
			{ description: '指针拖动中。', name: 'data-dragging', values: ['true'] },
			{ description: '只读。', name: 'data-readonly', values: ['true'] },
			{ description: '无效。', name: 'data-invalid', values: ['true'] }
		],
		status: 'experimental',
		summary: '两个真实range input共享公共domain、FormData和reset，并由薄数学层协调碰撞、RTL与指针。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { sliderVisualRecipe } from './ZSlider.svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';
	import {
		applySliderRangeChange,
		normalizeSliderRange,
		sliderKeyboardValue,
		sliderPercent,
		sliderValueFromPointer
	} from '../../runtime/slider.js';

	let {
		'aria-describedby': ariaDescribedBy,
		class: className,
		collision = 'clamp',
		defaultValue = [25, 75],
		dir,
		disabled = false,
		form,
		formatValue,
		id,
		invalid,
		label,
		mark,
		marks = [],
		max = 100,
		min = 0,
		minRange = 0,
		name,
		onkeydown,
		onlostpointercapture,
		onpointercancel,
		onpointerdown,
		onpointermove,
		onpointerup,
		onValueChange,
		onValueCommit,
		orientation = 'horizontal',
		readonly,
		ref = $bindable(null),
		required = false,
		reversed = false,
		size,
		step = 1,
		style,
		thumbLabels,
		thumbRefs = $bindable<RangeSliderThumbRefs>([null, null]),
		tone,
		value = $bindable(),
		valueLabel = 'focus',
		...rest
	}: ZRangeSliderProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const requestedDirection = $derived(dir ?? zui.direction);
	const direction = $derived(
		getElementDirection(ref, dir === 'ltr' || dir === 'rtl' ? dir : zui.direction)
	);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedSize = $derived(
		resolveControlSize(
			size ??
				field?.size ??
				zui.componentDefaults.rangeSlider?.size ??
				zui.componentDefaults.slider?.size,
			zui.density
		)
	);
	const resolvedTone = $derived(
		tone ??
			zui.componentDefaults.rangeSlider?.tone ??
			zui.componentDefaults.slider?.tone ??
			'primary'
	);
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const valueState = new ControllableState<SliderRangeValue>({
		defaultValue: () => normalizeSliderRange(defaultValue, min, max, step),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalizeSliderRange(valueState.current, min, max, step));
	let lowerInput = $state<HTMLInputElement | null>(null);
	let upperInput = $state<HTMLInputElement | null>(null);
	let activeIndex = $state<0 | 1>(0);
	let focusedIndex = $state<0 | 1 | null>(null);
	let dragIndex = $state<0 | 1 | null>(null);
	let keyboardDirty = false;
	const lowerLogical = $derived(sliderPercent(resolvedValue[0], min, max, reversed));
	const upperLogical = $derived(sliderPercent(resolvedValue[1], min, max, reversed));
	function physicalPercent(logical: number): number {
		if (orientation === 'horizontal' && direction === 'rtl') return 1 - logical;
		if (orientation === 'vertical') return 1 - logical;
		return logical;
	}
	const lowerPhysical = $derived(physicalPercent(lowerLogical));
	const upperPhysical = $derived(physicalPercent(upperLogical));
	const fillStart = $derived(Math.min(lowerPhysical, upperPhysical));
	const fillSize = $derived(Math.abs(upperPhysical - lowerPhysical));
	const classes = $derived(
		zui.slots(sliderVisualRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			orientation,
			readonly: resolvedReadonly,
			tone: resolvedTone
		})
	);
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'range-slider'));
	const lowerId = $derived(id ?? field?.controlId ?? `${generatedId}-lower`);
	const upperId = $derived(`${id ?? generatedId}-upper`);
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedName = $derived(name ?? field?.name);
	const inputDirection = $derived(
		orientation === 'vertical'
			? reversed
				? 'ltr'
				: 'rtl'
			: (direction === 'rtl') !== reversed
				? 'rtl'
				: 'ltr'
	);
	const inputStyle = $derived(orientation === 'vertical' ? 'writing-mode:vertical-lr' : undefined);
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-slider-fill-size': `${fillSize * 100}%`,
		'--zui-slider-fill-start': `${fillStart * 100}%`,
		'--zui-slider-control-size': metrics.height,
		'--zui-slider-label-gap': metrics.paddingInline,
		'--zui-slider-thumb-size': metrics.indicatorSize,
		'--zui-slider-track-size': `max(2px, calc(${metrics.indicatorSize} / 4))`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	$effect(() => {
		thumbRefs = [lowerInput, upperInput];
	});
	$effect(() => field?.registerFocusOwner(() => lowerInput?.focus({ preventScroll: true })));

	function isNativeDisabled(index: 0 | 1): boolean {
		return (index === 0 ? lowerInput : upperInput)?.matches(':disabled') ?? resolvedDisabled;
	}
	function formatted(index: 0 | 1): string {
		return formatValue?.(resolvedValue[index], index) ?? String(resolvedValue[index]);
	}
	function showBubble(index: 0 | 1): boolean {
		if (valueLabel === 'always') return true;
		if (valueLabel === 'drag') return dragIndex === index;
		return valueLabel === 'focus' && focusedIndex === index;
	}
	function markPosition(markValue: number): string {
		return `${physicalPercent(sliderPercent(markValue, min, max, reversed)) * 100}%`;
	}
	function markEdge(markValue: number): 'end' | 'start' | undefined {
		const position = Number.parseFloat(markPosition(markValue));
		return position <= 0 ? 'start' : position >= 100 ? 'end' : undefined;
	}
	function focusChangedThumb(previous: 0 | 1, next: 0 | 1): void {
		if (previous !== next)
			queueMicrotask(() => (next === 0 ? lowerInput : upperInput)?.focus({ preventScroll: true }));
	}
	function applyUserValue(index: 0 | 1, candidate: number): 0 | 1 {
		const change = applySliderRangeChange(resolvedValue, index, candidate, {
			collision,
			max,
			min,
			minRange,
			step
		});
		activeIndex = change.activeIndex;
		valueState.setFromUser(change.value);
		return change.activeIndex;
	}
	function commit(): void {
		onValueCommit?.(resolvedValue);
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }, index: 0 | 1): void {
		if (event.currentTarget.matches(':disabled')) return;
		if (resolvedReadonly) {
			event.currentTarget.value = String(resolvedValue[index]);
			return;
		}
		focusChangedThumb(index, applyUserValue(index, event.currentTarget.valueAsNumber));
	}
	function handleKey(
		event: KeyboardEvent & { currentTarget: HTMLInputElement },
		index: 0 | 1
	): void {
		if (event.currentTarget.matches(':disabled')) return;
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		const candidate = sliderKeyboardValue(
			resolvedValue[index],
			event.key,
			orientation,
			direction,
			reversed,
			min,
			max,
			step
		);
		if (candidate === undefined) return;
		event.preventDefault();
		if (resolvedReadonly) return;
		keyboardDirty = true;
		const nextIndex = applyUserValue(index, candidate);
		focusChangedThumb(index, nextIndex);
	}
	function pointerValue(event: PointerEvent & { currentTarget: HTMLDivElement }): number {
		return sliderValueFromPointer(
			event,
			event.currentTarget.getBoundingClientRect(),
			orientation,
			direction,
			reversed,
			min,
			max,
			step
		);
	}
	function closestThumb(candidate: number): 0 | 1 {
		const lowerDistance = Math.abs(candidate - resolvedValue[0]);
		const upperDistance = Math.abs(candidate - resolvedValue[1]);
		return lowerDistance === upperDistance ? activeIndex : lowerDistance < upperDistance ? 0 : 1;
	}
	function handlePointerDown(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		if (event.button !== 0) return;
		const candidate = pointerValue(event);
		const index = closestThumb(candidate);
		if (isNativeDisabled(index)) return;
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		(index === 0 ? lowerInput : upperInput)?.focus({ preventScroll: true });
		if (resolvedReadonly) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragIndex = applyUserValue(index, candidate);
		focusChangedThumb(index, dragIndex);
	}
	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		if (dragIndex === null || isNativeDisabled(dragIndex)) return;
		onpointermove?.(event);
		if (event.defaultPrevented) return;
		const previous = dragIndex;
		dragIndex = applyUserValue(previous, pointerValue(event));
		focusChangedThumb(previous, dragIndex);
	}
	function handlePointerUp(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		const index = dragIndex;
		if (index === null) return;
		onpointerup?.(event);
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
		dragIndex = null;
		if (event.defaultPrevented || isNativeDisabled(index)) return;
		commit();
	}
	function handlePointerCancel(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointercancel?.(event);
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
		dragIndex = null;
	}
	function handleLostPointerCapture(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onlostpointercapture?.(event);
		dragIndex = null;
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	dir={requestedDirection}
	role="group"
	aria-labelledby={field?.labelId}
	aria-describedby={describedBy}
	aria-disabled={resolvedDisabled || undefined}
	aria-readonly={resolvedReadonly || undefined}
	aria-invalid={resolvedInvalid || undefined}
	data-slot="root"
	data-value={`${resolvedValue[0]},${resolvedValue[1]}`}
	data-orientation={orientation}
	data-reversed={reversed || undefined}
	data-size={resolvedSize}
	data-active-thumb={activeIndex === 0 ? 'lower' : 'upper'}
	data-dragging={dragIndex !== null || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid || undefined}
>
	{#if valueLabel === 'always'}
		<div class={classes.header}>
			<span></span>
			<output class={classes.value}>{formatted(0)} – {formatted(1)}</output>
		</div>
	{/if}
	<div
		class={classes.track}
		data-slot="track"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
		onlostpointercapture={handleLostPointerCapture}
	>
		<span class={classes.rail} data-slot="rail"></span>
		<span class={classes.fill} data-slot="fill"></span>
		{#if marks.length}
			<span class={classes.marks} data-slot="marks">
				{#each marks as entry, markIndex}
					<span
						class={classes.mark}
						data-edge={markEdge(entry.value)}
						style={orientation === 'horizontal'
							? `left:${markPosition(entry.value)};top:50%`
							: `left:50%;top:${markPosition(entry.value)}`}
					>
						<span class={classes.markLabel} data-slot="mark-label">
							{#if mark}{@render mark(entry, markIndex)}{:else}{entry.label}{/if}
						</span>
					</span>
				{/each}
			</span>
		{/if}
		{#each sliderThumbIndices as index}
			<span
				class={classes.thumb}
				data-slot="thumb"
				data-thumb={index === 0 ? 'lower' : 'upper'}
				style={`left:${orientation === 'horizontal' ? (index === 0 ? lowerPhysical : upperPhysical) * 100 : 50}%;top:${orientation === 'vertical' ? (index === 0 ? lowerPhysical : upperPhysical) * 100 : 50}%`}
			>
				{#if showBubble(index)}
					<output class={classes.bubble} data-slot="value-label">
						{#if label}
							{@render label(resolvedValue[index], index)}
						{:else}
							{formatted(index)}
						{/if}
					</output>
				{/if}
			</span>
		{/each}
		<input
			bind:this={lowerInput}
			class={classes.input}
			use:formReset={() => valueState.reset()}
			id={lowerId}
			name={resolvedName}
			{form}
			dir={inputDirection}
			style={inputStyle}
			type="range"
			{min}
			{max}
			{step}
			defaultValue={normalizeSliderRange(defaultValue, min, max, step)[0]}
			value={resolvedValue[0]}
			disabled={resolvedDisabled}
			required={required || field?.required}
			oninput={(event) => handleInput(event, 0)}
			onchange={() => commit()}
			onkeydown={(event) => handleKey(event, 0)}
			onkeyup={() => {
				if (keyboardDirty) {
					keyboardDirty = false;
					commit();
				}
			}}
			onfocus={() => {
				activeIndex = 0;
				focusedIndex = 0;
			}}
			onblur={() => (focusedIndex = null)}
			aria-label={thumbLabels[0]}
			aria-orientation={orientation}
			aria-valuetext={formatted(0)}
			aria-describedby={describedBy}
			aria-invalid={resolvedInvalid || undefined}
			aria-readonly={resolvedReadonly || undefined}
			data-slot="input"
			data-thumb="lower"
		/>
		<input
			bind:this={upperInput}
			class={classes.input}
			id={upperId}
			name={resolvedName}
			{form}
			dir={inputDirection}
			style={inputStyle}
			type="range"
			{min}
			{max}
			{step}
			defaultValue={normalizeSliderRange(defaultValue, min, max, step)[1]}
			value={resolvedValue[1]}
			disabled={resolvedDisabled}
			required={required || field?.required}
			oninput={(event) => handleInput(event, 1)}
			onchange={() => commit()}
			onkeydown={(event) => handleKey(event, 1)}
			onkeyup={() => {
				if (keyboardDirty) {
					keyboardDirty = false;
					commit();
				}
			}}
			onfocus={() => {
				activeIndex = 1;
				focusedIndex = 1;
			}}
			onblur={() => (focusedIndex = null)}
			aria-label={thumbLabels[1]}
			aria-orientation={orientation}
			aria-valuetext={formatted(1)}
			aria-describedby={describedBy}
			aria-invalid={resolvedInvalid || undefined}
			aria-readonly={resolvedReadonly || undefined}
			data-slot="input"
			data-thumb="upper"
		/>
	</div>
</div>
