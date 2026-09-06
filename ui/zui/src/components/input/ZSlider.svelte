<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ZSemanticTone } from '../../theme/semantics.js';
	import type { SliderOrientation } from '../../runtime/slider.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface SliderMark {
		readonly label?: string;
		readonly value: number;
	}
	export type SliderTone = ZSemanticTone | 'primary';
	export type SliderValueLabel = 'always' | 'drag' | 'focus' | 'never';
	export type SliderSize = ZControlSize;
	export interface SliderVisualProps {
		readonly formatValue?: (value: number) => string;
		readonly label?: Snippet<[value: number]>;
		readonly mark?: Snippet<[mark: SliderMark, index: number]>;
		readonly marks?: readonly SliderMark[];
		readonly orientation?: SliderOrientation;
		readonly reversed?: boolean;
		readonly size?: SliderSize;
		readonly tone?: SliderTone;
		readonly valueLabel?: SliderValueLabel;
	}
	/** @deprecated Prefer SliderVisualProps; retained for source compatibility. */
	export type ZSliderVariants = Pick<
		SliderVisualProps,
		'orientation' | 'reversed' | 'size' | 'tone' | 'valueLabel'
	>;
	export type ZSliderProps = Omit<
		HTMLInputAttributes,
		| 'children'
		| 'aria-readonly'
		| 'defaultValue'
		| 'disabled'
		| 'dir'
		| 'max'
		| 'min'
		| 'onchange'
		| 'oninput'
		| 'onkeydown'
		| 'onlostpointercapture'
		| 'onpointercancel'
		| 'onpointerdown'
		| 'onpointerup'
		| 'readonly'
		| 'size'
		| 'step'
		| 'type'
		| 'value'
	> &
		SliderVisualProps & {
			readonly defaultValue?: number;
			readonly disabled?: boolean;
			readonly dir?: HTMLInputAttributes['dir'];
			readonly invalid?: boolean;
			readonly max?: number;
			readonly min?: number;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly oninput?: HTMLInputAttributes['oninput'];
			readonly onkeydown?: HTMLInputAttributes['onkeydown'];
			readonly onlostpointercapture?: HTMLInputAttributes['onlostpointercapture'];
			readonly onpointercancel?: HTMLInputAttributes['onpointercancel'];
			readonly onpointerdown?: HTMLInputAttributes['onpointerdown'];
			readonly onpointerup?: HTMLInputAttributes['onpointerup'];
			readonly onValueChange?: (value: number) => void;
			readonly onValueCommit?: (value: number) => void;
			readonly readonly?: boolean;
			ref?: HTMLInputElement | null;
			readonly step?: number;
			value?: number;
		};

	export const sliderVisualRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'header',
				'value',
				'track',
				'rail',
				'fill',
				'thumb',
				'marks',
				'mark',
				'markLabel',
				'bubble',
				'input'
			] as const,
			base: {
				root: (s) => {
					s.display.grid;
					s.gap._small;
					s.maxWidth.percent(100);
					s.minWidth.px(0);
					s.width.percent(100);
					s._selector('&:has(input:disabled)', (s) => s.opacity._disabled);
				},
				header: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.justifyContent.spaceBetween;
				},
				value: (s) => {
					s.color._textMuted;
					s.fontSize._small;
				},
				track: (s) => {
					s.boxSizing.borderBox;
					s.position.relative;
					s.touchAction.none;
					s._selector('[data-orientation="horizontal"] &', (s) => {
						s.blockSize.raw('var(--zui-slider-control-size)');
						s.width.percent(100);
					});
					s._selector('[data-orientation="vertical"] &', (s) => {
						s.blockSize.raw('10rem');
						s.inlineSize.raw('var(--zui-slider-control-size)');
					});
					s._selector('&:has(input:focus-visible) [data-slot="thumb"]', (s) => {
						s.outlineColor._focus;
						s.outlineOffset._outer;
						s.outlineStyle.solid;
						s.outlineWidth._medium;
					});
					s._selector(
						'&:has(input[data-thumb="lower"]:focus-visible) [data-thumb="upper"]',
						(s) => s.outlineStyle.none
					);
					s._selector(
						'&:has(input[data-thumb="upper"]:focus-visible) [data-thumb="lower"]',
						(s) => s.outlineStyle.none
					);
				},
				rail: (s) => {
					s.backgroundColor._border;
					s.borderRadius._large;
					s.position.absolute;
					s._selector('[data-orientation="horizontal"] &', (s) => {
						s.blockSize.raw('var(--zui-slider-track-size)');
						s.left.px(0);
						s.right.px(0);
						s.top.percent(50);
						s.transform.raw('translateY(-50%)');
					});
					s._selector('[data-orientation="vertical"] &', (s) => {
						s.bottom.px(0);
						s.inlineSize.raw('var(--zui-slider-track-size)');
						s.left.percent(50);
						s.top.px(0);
						s.transform.raw('translateX(-50%)');
					});
				},
				fill: (s) => {
					s.backgroundColor._primary;
					s.borderRadius._large;
					s.position.absolute;
					s._selector('[data-orientation="horizontal"] &', (s) => {
						s.blockSize.raw('var(--zui-slider-track-size)');
						s.left.raw('var(--zui-slider-fill-start)');
						s.top.percent(50);
						s.transform.raw('translateY(-50%)');
						s.width.raw('var(--zui-slider-fill-size)');
					});
					s._selector('[data-orientation="vertical"] &', (s) => {
						s.height.raw('var(--zui-slider-fill-size)');
						s.inlineSize.raw('var(--zui-slider-track-size)');
						s.left.percent(50);
						s.top.raw('var(--zui-slider-fill-start)');
						s.transform.raw('translateX(-50%)');
					});
				},
				thumb: (s) => {
					s.boxSizing.borderBox;
					s.backgroundColor._canvas;
					s.borderColor._primary;
					s.borderRadius.percent(50);
					s.borderStyle.solid;
					s.borderWidth._medium;
					s.boxShadow._small;
					s.height.raw('var(--zui-slider-thumb-size)');
					s.pointerEvents.none;
					s.position.absolute;
					s.transform.raw('translate(-50%, -50%)');
					s.width.raw('var(--zui-slider-thumb-size)');
				},
				marks: (s) => {
					s.inset.px(0);
					s.pointerEvents.none;
					s.position.absolute;
				},
				mark: (s) => {
					s.backgroundColor._border;
					s.borderRadius.percent(50);
					s.height.raw('var(--zui-slider-track-size)');
					s.position.absolute;
					s.transform.raw('translate(-50%, -50%)');
					s.width.raw('var(--zui-slider-track-size)');
				},
				markLabel: (s) => {
					s.color._textMuted;
					s.fontSize._xsmall;
					s.position.absolute;
					s.whiteSpace.nowrap;
					s._selector('[data-orientation="horizontal"] &', (s) => {
						s.left.percent(50);
						s.top.raw('calc(100% + var(--zui-slider-label-gap))');
						s.transform.raw('translateX(-50%)');
					});
					s._selector('[data-orientation="vertical"] &', (s) => {
						s.left.raw('calc(100% + var(--zui-slider-label-gap))');
						s.top.percent(50);
						s.transform.raw('translateY(-50%)');
					});
					s._selector('[data-orientation="horizontal"] [data-edge="start"] &', (s) => {
						s.transform.raw('none');
					});
					s._selector('[data-orientation="horizontal"] [data-edge="end"] &', (s) => {
						s.transform.raw('translateX(-100%)');
					});
					s._selector('[data-orientation="vertical"] [data-edge="start"] &', (s) => {
						s.transform.raw('none');
					});
					s._selector('[data-orientation="vertical"] [data-edge="end"] &', (s) => {
						s.transform.raw('translateY(-100%)');
					});
				},
				bubble: (s) => {
					s.backgroundColor._inverseSurface;
					s.borderRadius._small;
					s.color._inverseText;
					s.fontSize._xsmall;
					s.padding._xsmall;
					s.pointerEvents.none;
					s.position.absolute;
					s.whiteSpace.nowrap;
					s._selector('[data-orientation="horizontal"] &', (s) => {
						s.bottom.raw('calc(100% + var(--zui-slider-label-gap))');
						s.left.percent(50);
						s.transform.raw('translateX(-50%)');
					});
					s._selector('[data-orientation="vertical"] &', (s) => {
						s.left.raw('calc(100% + var(--zui-slider-label-gap))');
						s.top.percent(50);
						s.transform.raw('translateY(-50%)');
					});
				},
				input: (s) => {
					s.cursor.pointer;
					s.inset.px(0);
					s.margin.px(0);
					s.opacity(0);
					s.position.absolute;
					s.width.percent(100);
					s.height.percent(100);
					s._focusVisible((s) => {
						s.outlineColor._focus;
						s.outlineOffset._outer;
						s.outlineStyle.solid;
						s.outlineWidth._medium;
					});
				}
			},
			variants: {
				disabled: {
					false: {},
					true: { root: (s) => s.opacity._disabled, input: (s) => s.cursor.notAllowed }
				},
				invalid: {
					false: {},
					true: { fill: (s) => s.backgroundColor._danger, thumb: (s) => s.borderColor._danger }
				},
				orientation: { horizontal: {}, vertical: { root: (s) => s.width.fitContent } },
				readonly: { false: {}, true: { input: (s) => s.cursor.default } },
				tone: {
					primary: {},
					neutral: {
						fill: (s) => s.backgroundColor._textMuted,
						thumb: (s) => s.borderColor._textMuted
					},
					info: {
						fill: (s) => s.backgroundColor._info,
						thumb: (s) => s.borderColor._info
					},
					success: {
						fill: (s) => s.backgroundColor._success,
						thumb: (s) => s.borderColor._success
					},
					warning: {
						fill: (s) => s.backgroundColor._warning,
						thumb: (s) => s.borderColor._warning
					},
					danger: {
						fill: (s) => s.backgroundColor._danger,
						thumb: (s) => s.borderColor._danger
					}
				}
			},
			defaultVariants: {
				disabled: false,
				invalid: false,
				orientation: 'horizontal',
				readonly: false,
				tone: 'primary'
			}
		},
		import.meta
	);

	export const zuiMetadata = {
		category: 'input',
		id: 'slider',
		name: 'ZSlider',
		status: 'stable',
		since: 'unreleased',
		source: 'ui/zui/src/components/input/ZSlider.svelte',
		importStatement: "import { ZSlider } from '@zadmin/zui';",
		summary:
			'真实range input拥有键盘、ARIA、FormData和reset，并共享marks、value label、方向与commit视觉。',
		dependencies: ['native input[type=range]', 'ControllableState', 'slider runtime', 'Field'],
		bindings: [
			{ name: 'value', type: 'number', description: '当前规范化数值。' },
			{ name: 'ref', type: 'HTMLInputElement | null', description: '真实range input。' }
		],
		events: [
			{ name: 'onValueChange', type: '(value: number) => void', description: '用户input级变化。' },
			{
				name: 'onValueCommit',
				type: '(value: number) => void',
				description: 'change或键盘交互结束。'
			},
			{ name: 'oninput', type: 'InputEventHandler<HTMLInputElement>', description: '原生input。' },
			{
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>',
				description: '原生change。'
			},
			{
				name: 'onkeydown',
				type: 'KeyboardEventHandler<HTMLInputElement>',
				description: '原生keydown，可preventDefault取消内建方向映射。'
			},
			{
				name: 'onpointerdown',
				type: 'PointerEventHandler<HTMLInputElement>',
				description: '真实input的原生pointerdown。'
			},
			{
				name: 'onpointerup',
				type: 'PointerEventHandler<HTMLInputElement>',
				description: '真实input的原生pointerup；内部始终结束dragging。'
			},
			{
				name: 'onpointercancel',
				type: 'PointerEventHandler<HTMLInputElement>',
				description: '真实input的原生pointercancel；内部始终结束dragging。'
			},
			{
				name: 'onlostpointercapture',
				type: 'PointerEventHandler<HTMLInputElement>',
				description: '真实input丢失capture；内部始终结束dragging。'
			}
		],
		keyboard: [
			{
				key: 'Arrow keys / Home / End / PageUp / PageDown',
				description: '按方向、RTL和reversed更新。'
			}
		],
		parts: [
			{ name: 'root', description: '共享视觉外壳。' },
			{ name: 'track', description: '轨道。' },
			{ name: 'rail', description: '轨道底色。' },
			{ name: 'fill', description: '选择区。' },
			{ name: 'thumb', description: '视觉thumb。' },
			{ name: 'marks', description: '标记。' },
			{ name: 'value-label', description: '数值提示。' },
			{ name: 'input', description: '真实range owner。' }
		],
		props: [
			{
				name: 'value',
				type: 'number',
				default: 'undefined',
				bindable: true,
				description: '当前值。'
			},
			{ name: 'defaultValue', type: 'number', default: '0', description: '非受控和reset值。' },
			{ name: 'min', type: 'number', default: '0', description: 'domain最小值。' },
			{ name: 'max', type: 'number', default: '100', description: 'domain最大值。' },
			{ name: 'step', type: 'number', default: '1', description: '正步长。' },
			{
				name: 'dir',
				type: "'ltr' | 'rtl' | 'auto'",
				default: 'Provider direction',
				description: '实例方向；auto按真实input计算方向。'
			},
			{
				name: 'orientation',
				type: "'horizontal' | 'vertical'",
				default: 'horizontal',
				description: '轨道方向。'
			},
			{ name: 'reversed', type: 'boolean', default: 'false', description: '反转视觉与增量方向。' },
			{ name: 'marks', type: 'readonly SliderMark[]', default: '[]', description: 'domain标记。' },
			{
				name: 'valueLabel',
				type: 'SliderValueLabel',
				default: 'focus',
				description: '提示显示策略。'
			},
			{
				name: 'formatValue',
				type: '(value: number) => string',
				default: 'String(value)',
				description: '格式化aria和提示。'
			},
			{ name: 'label', type: 'Snippet<[number]>', default: 'undefined', description: '提示内容。' },
			{
				name: 'mark',
				type: 'Snippet<[SliderMark, number]>',
				default: 'undefined',
				description: 'mark内容。'
			},
			{
				name: 'onValueCommit',
				type: '(value: number) => void',
				default: 'undefined',
				description: '提交回调。'
			},
			{
				name: 'size',
				type: 'SliderSize',
				default: 'Field → componentDefaults.slider → density',
				description: '五档尺寸。'
			},
			{
				name: 'tone',
				type: 'SliderTone',
				default: 'componentDefaults.slider → primary',
				description: '选择区色调。'
			},
			{ name: 'disabled', type: 'boolean', default: 'false', description: '禁用真实input。' },
			{
				name: 'readonly',
				type: 'boolean',
				default: 'Field或自身',
				description: '阻止修改并保留焦点/FormData。'
			},
			{ name: 'invalid', type: 'boolean', default: 'Field或false', description: '错误语义。' },
			{
				name: 'ref',
				type: 'HTMLInputElement | null',
				default: 'null',
				bindable: true,
				description: '真实range引用。'
			}
		],
		snippets: [
			{ name: 'label', type: 'Snippet<[number]>', description: 'value提示。' },
			{ name: 'mark', type: 'Snippet<[SliderMark, number]>', description: 'mark标签。' }
		],
		states: [
			{ name: 'data-value', values: ['finite number'], description: '当前值。' },
			{ name: 'data-orientation', values: ['horizontal', 'vertical'], description: '方向。' },
			{ name: 'data-reversed', values: ['true'], description: '反向。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '尺寸。'
			},
			{ name: 'data-dragging', values: ['true'], description: '拖动中。' },
			{ name: 'data-readonly', values: ['true'], description: '只读。' },
			{ name: 'data-invalid', values: ['true'], description: '无效。' }
		]
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { formReset, mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import {
		normalizeSliderValue,
		sliderKeyboardValue,
		sliderPercent
	} from '../../runtime/slider.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { getElementDirection } from '../../runtime/layer/dom-realm.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		class: className,
		defaultValue = 0,
		dir,
		disabled = false,
		formatValue,
		id,
		invalid,
		label,
		mark,
		marks = [],
		max = 100,
		min = 0,
		name,
		onchange,
		oninput,
		onkeydown,
		onlostpointercapture,
		onpointercancel,
		onpointerdown,
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
		tone,
		value = $bindable(),
		valueLabel = 'focus',
		...rest
	}: ZSliderProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedSize = $derived(
		resolveControlSize(size ?? field?.size ?? zui.componentDefaults.slider?.size, zui.density)
	);
	const resolvedTone = $derived(tone ?? zui.componentDefaults.slider?.tone ?? 'primary');
	const metrics = $derived(controlSizeMetrics(zui.theme, resolvedSize));
	const valueState = new ControllableState<number>({
		defaultValue: () => normalizeSliderValue(defaultValue, min, max, step),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalizeSliderValue(valueState.current, min, max, step));
	let focused = $state(false);
	let dragging = $state(false);
	let keyboardDirty = false;
	const requestedDirection = $derived(dir ?? zui.direction);
	const direction = $derived(
		requestedDirection === 'auto'
			? getElementDirection(ref?.parentElement ?? null, zui.direction)
			: requestedDirection
	);
	const logical = $derived(sliderPercent(resolvedValue, min, max, reversed));
	const physical = $derived(
		orientation === 'horizontal' && direction === 'rtl'
			? 1 - logical
			: orientation === 'vertical'
				? 1 - logical
				: logical
	);
	const minimum = $derived(
		orientation === 'horizontal' && direction === 'rtl'
			? reversed
				? 0
				: 1
			: orientation === 'vertical'
				? reversed
					? 0
					: 1
				: reversed
					? 1
					: 0
	);
	const fillStart = $derived(Math.min(physical, minimum));
	const fillSize = $derived(Math.abs(physical - minimum));
	const classes = $derived(
		zui.slots(sliderVisualRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			orientation,
			readonly: resolvedReadonly,
			tone: resolvedTone
		})
	);
	const formatted = $derived(formatValue?.(resolvedValue) ?? String(resolvedValue));
	const showBubble = $derived(
		valueLabel === 'always' ||
			(valueLabel === 'focus' && focused) ||
			(valueLabel === 'drag' && dragging)
	);
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'slider'));
	const describedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-slider-fill-size': `${fillSize * 100}%`,
		'--zui-slider-fill-start': `${fillStart * 100}%`,
		'--zui-slider-control-size': metrics.height,
		'--zui-slider-label-gap': metrics.paddingInline,
		'--zui-slider-thumb-size': metrics.indicatorSize,
		'--zui-slider-track-size': `max(2px, calc(${metrics.indicatorSize} / 4))`
	} as const);
	const inputDirection = $derived(
		orientation === 'vertical'
			? reversed
				? 'ltr'
				: 'rtl'
			: (direction === 'rtl') !== reversed
				? 'rtl'
				: 'ltr'
	);
	const inputStyle = $derived(
		orientation === 'vertical' ? mergeStyles(style, 'writing-mode:vertical-lr') : style
	);
	const initialStyle = untrack(() => mergeStyles(inputStyle, serializeIcssVariables(variables)));
	const initialRootStyle = untrack(() => serializeIcssVariables(variables));
	function setUser(next: number) {
		valueState.setFromUser(normalizeSliderValue(next, min, max, step));
	}
	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		if (event.currentTarget.matches(':disabled')) return;
		if (resolvedReadonly) {
			event.currentTarget.value = String(resolvedValue);
			return;
		}
		setUser(event.currentTarget.valueAsNumber);
		oninput?.(event);
	}
	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		if (event.currentTarget.matches(':disabled')) return;
		if (resolvedReadonly) {
			event.currentTarget.value = String(resolvedValue);
			return;
		}
		onchange?.(event);
		onValueCommit?.(resolvedValue);
	}
	function handleKey(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.currentTarget.matches(':disabled')) return;
		const next = sliderKeyboardValue(
			resolvedValue,
			event.key,
			orientation,
			direction,
			reversed,
			min,
			max,
			step
		);
		if (resolvedReadonly) {
			if (next !== undefined) event.preventDefault();
			return;
		}
		onkeydown?.(event);
		if (event.defaultPrevented || next === undefined) return;
		event.preventDefault();
		keyboardDirty = true;
		setUser(next);
	}
	function markPosition(v: number) {
		let p = sliderPercent(v, min, max, reversed);
		if (orientation === 'horizontal' && direction === 'rtl') p = 1 - p;
		if (orientation === 'vertical') p = 1 - p;
		return `${p * 100}%`;
	}
	function markEdge(v: number): 'end' | 'start' | undefined {
		const position = Number.parseFloat(markPosition(v));
		return position <= 0 ? 'start' : position >= 100 ? 'end' : undefined;
	}
</script>

<div
	class={classes.root}
	style={initialRootStyle}
	use:applyIcssRootStyle={{ variables }}
	dir={requestedDirection}
	data-orientation={orientation}
	data-reversed={reversed || undefined}
	data-size={resolvedSize}
	data-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-dragging={dragging || undefined}
>
	{#if valueLabel === 'always'}<div class={classes.header}>
			<span></span><output class={classes.value}
				>{#if label}{@render label(resolvedValue)}{:else}{formatted}{/if}</output
			>
		</div>{/if}
	<div class={classes.track} data-slot="track">
		<span class={classes.rail} data-slot="rail"></span>
		<span class={classes.fill} data-slot="fill"></span>
		{#if marks.length}<span class={classes.marks} data-slot="marks"
				>{#each marks as entry, index}<span
						class={classes.mark}
						data-edge={markEdge(entry.value)}
						style={orientation === 'horizontal'
							? `left:${markPosition(entry.value)};top:50%`
							: `left:50%;top:${markPosition(entry.value)}`}
						><span class={classes.markLabel} data-slot="mark-label"
							>{#if mark}{@render mark(entry, index)}{:else}{entry.label}{/if}</span
						></span
					>{/each}</span
			>{/if}
		<span
			class={classes.thumb}
			data-slot="thumb"
			style={`left:${orientation === 'horizontal' ? physical * 100 : 50}%;top:${orientation === 'vertical' ? physical * 100 : 50}%`}
			>{#if showBubble}<output class={classes.bubble} data-slot="value-label"
					>{#if label}{@render label(resolvedValue)}{:else}{formatted}{/if}</output
				>{/if}</span
		>
		<input
			{...rest}
			bind:this={ref}
			class={[classes.input, className]}
			style={initialStyle}
			use:applyIcssRootStyle={{ style: inputStyle, variables }}
			use:formReset={() => valueState.reset()}
			id={id ?? field?.controlId ?? generatedId}
			name={name ?? field?.name}
			type="range"
			dir={inputDirection}
			{min}
			{max}
			{step}
			defaultValue={normalizeSliderValue(defaultValue, min, max, step)}
			value={resolvedValue}
			disabled={resolvedDisabled}
			required={required || field?.required}
			oninput={handleInput}
			onchange={handleChange}
			onkeydown={handleKey}
			onkeyup={() => {
				if (keyboardDirty) {
					keyboardDirty = false;
					onValueCommit?.(resolvedValue);
				}
			}}
			onpointerdown={(event) => {
				if (event.currentTarget.matches(':disabled')) return;
				if (resolvedReadonly) {
					event.preventDefault();
					event.currentTarget.focus();
					return;
				}
				onpointerdown?.(event);
				if (event.defaultPrevented) return;
				dragging = true;
			}}
			onpointerup={(event) => {
				onpointerup?.(event);
				dragging = false;
			}}
			onpointercancel={(event) => {
				onpointercancel?.(event);
				dragging = false;
			}}
			onlostpointercapture={(event) => {
				onlostpointercapture?.(event);
				dragging = false;
			}}
			onfocus={() => (focused = true)}
			onblur={() => {
				focused = false;
				dragging = false;
			}}
			aria-valuetext={formatted}
			aria-orientation={orientation}
			aria-describedby={describedBy}
			aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
			aria-readonly={resolvedReadonly || undefined}
			data-value={resolvedValue}
			data-size={resolvedSize}
		/>
	</div>
</div>
