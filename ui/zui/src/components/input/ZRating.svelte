<script module lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { ZSemanticTone } from '../../theme/semantics.js';

	export type ZRatingTone = 'primary' | ZSemanticTone;
	export interface ZRatingItemContext {
		readonly index: number;
		readonly previewed: boolean;
		readonly selected: boolean;
		readonly state: 'empty' | 'filled';
		readonly value: number;
	}
	export interface ZRatingProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'onpointerleave' | 'role'
	> {
		readonly clearable?: boolean;
		readonly count?: number;
		readonly defaultValue?: number;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly fractions?: number;
		readonly invalid?: boolean;
		readonly item?: Snippet<[context: ZRatingItemContext]>;
		readonly itemLabel?: (value: number) => string;
		readonly label?: string;
		readonly name?: string;
		readonly onFormReset?: () => void;
		readonly onHoverChange?: (value: number) => void;
		readonly onValueChange?: (value: number) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: ZControlSize;
		readonly tone?: ZRatingTone;
		value?: number;
	}

	export const zuiMetadata = {
		bindings: [
			{ name: 'value', type: 'number', description: '当前分数，0表示尚未选择。' },
			{ name: 'ref', type: 'HTMLDivElement | null', description: '真实radiogroup根元素。' }
		],
		category: 'input',
		dependencies: [
			'native radio inputs',
			'ControllableState',
			'FieldControl owner',
			'FormResetSignal'
		],
		events: [
			{
				name: 'onValueChange',
				type: '(value: number) => void',
				description: '用户选择或清除分数。'
			},
			{
				name: 'onHoverChange',
				type: '(value: number) => void',
				description: 'hover预览变化；离开报告0且不写选中值。'
			},
			{ name: 'onFormReset', type: '() => void', description: '原生reset恢复默认分数后调用。' }
		],
		id: 'rating',
		importStatement: "import { ZRating } from '@zadmin/zui';",
		keyboard: [
			{ key: 'Arrow Right / Left', description: '按视觉方向选择相邻fraction；RTL反转。' },
			{ key: 'Arrow Up / Down', description: '增加或减少一个fraction。' },
			{ key: 'Home / End', description: '选择最小非零值或最大值。' },
			{ key: 'Space', description: '原生radio激活；再次激活可清除。' }
		],
		name: 'ZRating',
		parts: [
			{ name: 'root', description: '整体radiogroup。' },
			{ name: 'item', description: '一个视觉评分项。' },
			{ name: 'empty', description: '未填充符号层。' },
			{ name: 'fill', description: '按分数裁剪的填充符号层。' },
			{ name: 'option', description: '真实fraction radio命中区。' }
		],
		props: [
			{
				name: 'value',
				type: 'number',
				default: 'undefined',
				description: '受控或可绑定分数。',
				bindable: true
			},
			{ name: 'defaultValue', type: 'number', default: '0', description: '初值与form reset目标。' },
			{ name: 'count', type: 'number', default: '5', description: '正安全整数个评分项。' },
			{
				name: 'fractions',
				type: 'number',
				default: '1',
				description: '每项份数；精度为1/fractions。'
			},
			{
				name: 'clearable',
				type: 'boolean',
				default: 'true',
				description: '再次激活当前项时清为0。'
			},
			{
				name: 'label',
				type: 'string',
				default: 'Field label或aria-label/aria-labelledby',
				requiredWhen: '不在ZField且没有aria-label或aria-labelledby时必填',
				description: '整体名称，不替代逐radio名称。'
			},
			{
				name: 'itemLabel',
				type: '(value: number) => string',
				default: 'localePack.common.ratingValue',
				description: '逐fraction radio名称。'
			},
			{
				name: 'item',
				type: 'Snippet<[ZRatingItemContext]>',
				default: 'Lucide Star',
				description: 'empty/filled自定义符号。'
			},
			{
				name: 'onValueChange',
				type: '(value: number) => void',
				default: 'undefined',
				description: '用户值通知。'
			},
			{
				name: 'onHoverChange',
				type: '(value: number) => void',
				default: 'undefined',
				description: 'hover值通知。'
			},
			{
				name: 'onFormReset',
				type: '() => void',
				default: 'undefined',
				description: 'reset完成通知。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: '继承Field或false',
				description: '禁用radio并排除FormData。'
			},
			{
				name: 'readonly',
				type: 'boolean',
				default: '继承Field或false',
				description: '保留焦点/FormData但阻止交互。'
			},
			{
				name: 'required',
				type: 'boolean',
				default: '继承Field或false',
				description: '原生radio组required。'
			},
			{
				name: 'invalid',
				type: 'boolean',
				default: '继承Field或false',
				description: '整体无效状态。'
			},
			{
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
				default: 'Field → componentDefaults.rating → density',
				description: '五档符号尺寸。'
			},
			{
				name: 'tone',
				type: "'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger'",
				default: "componentDefaults.rating → 'primary'",
				description: '品牌或语义填充色。'
			},
			{
				name: 'name',
				type: 'string',
				default: '继承Field或undefined',
				description: '原生radio组name。'
			},
			{ name: 'form', type: 'string', default: 'undefined', description: '原生外部form关联。' },
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				description: 'radiogroup根引用。',
				bindable: true
			}
		],
		since: 'unreleased',
		snippets: [
			{
				name: 'item',
				type: 'Snippet<[ZRatingItemContext]>',
				description: '分别渲染empty与filled层。'
			}
		],
		source: 'ui/zui/src/components/input/ZRating.svelte',
		states: [
			{ name: 'data-value', values: ['number'], description: '当前选中分数。' },
			{ name: 'data-preview', values: ['number'], description: '当前hover预览或0。' },
			{ name: 'data-disabled', values: ['true'], description: '自身或Field禁用。' },
			{ name: 'data-readonly', values: ['true'], description: '自身或Field只读。' },
			{ name: 'data-invalid', values: ['true'], description: '自身或Field无效。' },
			{
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
				description: '解析尺寸。'
			},
			{
				name: 'data-tone',
				values: ['primary', 'neutral', 'info', 'success', 'warning', 'danger'],
				description: '解析色调。'
			}
		],
		status: 'experimental',
		summary: '真实radio拥有分数、键盘、FormData和reset；视觉层提供fraction预览与自定义符号。'
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineSlotRecipe({
		slots: ['root', 'item', 'empty', 'fill', 'glyph', 'hit', 'input'] as const,
		base: {
			root: (s) => {
				s.alignItems.center;
				s.display.inlineFlex;
				s.flexWrap.wrap;
				s.gap._xsmall;
				s.maxWidth._full;
				s.userSelect.none;
				s._selector('&:has(input:disabled)', (disabled) => {
					disabled.cursor.notAllowed;
					disabled.opacity._disabled;
				});
			},
			item: (s) => {
				s.blockSize.raw('var(--zui-rating-item-size)');
				s.flexShrink(0);
				s.inlineSize.raw('var(--zui-rating-item-size)');
				s.position.relative;
				s._selector('&:focus-within', (focus) => {
					focus.outlineColor._focus;
					focus.outlineOffset._outer;
					focus.outlineStyle.solid;
					focus.outlineWidth._medium;
				});
			},
			empty: (s) => {
				s.color._textMuted;
				s.inset.px(0);
				s.pointerEvents.none;
				s.position.absolute;
			},
			fill: (s) => {
				s.blockSize.percent(100);
				s.insetBlockStart.px(0);
				s.insetInlineStart.px(0);
				s.overflow.hidden;
				s.pointerEvents.none;
				s.position.absolute;
			},
			glyph: (s) => {
				s.blockSize.raw('var(--zui-rating-item-size)');
				s.display.block;
				s.inlineSize.raw('var(--zui-rating-item-size)');
			},
			hit: (s) => {
				s.blockSize.percent(100);
				s.insetBlockStart.px(0);
				s.position.absolute;
				s.zIndex(1);
			},
			input: (s) => {
				s.cursor.inherit;
				s.height._full;
				s.inset.px(0);
				s.margin.px(0);
				s.opacity(0);
				s.position.absolute;
				s.width._full;
			}
		},
		variants: {
			disabled: {
				false: { root: (s) => s.cursor.pointer },
				true: {
					root: (s) => {
						s.cursor.notAllowed;
						s.opacity._disabled;
					}
				}
			},
			invalid: { false: {}, true: { fill: (s) => s.color._danger } },
			readonly: { false: {}, true: { root: (s) => s.cursor.default } },
			tone: {
				primary: { fill: (s) => s.color._primary },
				neutral: { fill: (s) => s.color._neutral },
				info: { fill: (s) => s.color._info },
				success: { fill: (s) => s.color._success },
				warning: { fill: (s) => s.color._warning },
				danger: { fill: (s) => s.color._danger }
			}
		},
		defaultVariants: { disabled: false, invalid: false, readonly: false, tone: 'primary' }
	});
	registerSlotRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import {
		claimFormValueScope,
		createFormControlState
	} from '../../runtime/form/form-value-adapter.svelte.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		class: className,
		clearable = true,
		count = 5,
		defaultValue = 0,
		dir,
		disabled = false,
		form,
		fractions = 1,
		id,
		invalid,
		item,
		itemLabel,
		label,
		name,
		onFormReset,
		onHoverChange,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		style,
		tone,
		value = $bindable(),
		...rest
	}: ZRatingProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const resolvedCount = $derived(positiveInteger(count, 'count'));
	const resolvedFractions = $derived(positiveInteger(fractions, 'fractions'));
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedSize = $derived(
		resolveControlSize(size ?? field?.size ?? zui.componentDefaults.rating?.size, zui.density)
	);
	const resolvedTone = $derived(tone ?? zui.componentDefaults.rating?.tone ?? 'primary');
	const resolvedDirection = $derived(dir ?? zui.direction);
	const resolvedName = $derived(name ?? field?.name);
	const valueScope = claimFormValueScope();
	const valueState = createFormControlState<number>(
		{
			defaultValue: () =>
				ratingValue(defaultValue, resolvedCount, resolvedFractions, 'defaultValue'),
			element: () => ref,
			normalizeModelValue: (candidate) => {
				if (candidate === undefined || candidate === null) return 0;
				if (typeof candidate !== 'number')
					throw new TypeError('ZRating model value must be a number, null or undefined.');
				return ratingValue(candidate, resolvedCount, resolvedFractions, 'model value');
			},
			onChange: () => onValueChange,
			owner: 'ZRating',
			read: () => value,
			syncNative: (next) => {
				for (const input of ref?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])
					input.checked = Number(input.value) === next;
			},
			write: (next) => (value = next)
		},
		valueScope
	);
	const resolvedValue = $derived(
		ratingValue(valueState.current, resolvedCount, resolvedFractions, 'value')
	);
	const resetValue = $derived(
		ratingValue(defaultValue, resolvedCount, resolvedFractions, 'defaultValue')
	);
	const totalSteps = $derived(resolvedCount * resolvedFractions);
	const options = $derived(
		Array.from({ length: totalSteps }, (_, offset) => {
			const step = offset + 1;
			return { step, value: step / resolvedFractions };
		})
	);
	const rootId = $derived(id ?? field?.controlId ?? createZuiId(zui.idPrefix, uid, 'rating'));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabel = $derived.by(() => {
		if (resolvedLabelledBy) return undefined;
		const candidate = label ?? ariaLabel;
		if (typeof candidate !== 'string' || !candidate.trim())
			throw new TypeError('ZRating requires a non-empty label outside ZField.');
		return candidate;
	});
	const classes = $derived(
		zui.slots(recipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			readonly: resolvedReadonly,
			tone: resolvedTone
		})
	);
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-rating-item-size': controlSizeMetrics(zui.theme, resolvedSize).height
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	let hoverValue = $state(0);
	let activeStep = $state(1);
	let clearedActivationStep: number | undefined;
	let selectionReconcileFrame: { view: Window; id: number } | undefined;
	let selectionReconcileVersion = 0;
	let selectionReconcileActive = true;
	let notifiedHoverValue = 0;
	let firstInput = $state<HTMLInputElement | null>(null);

	function positiveInteger(candidate: number, name: string): number {
		if (!Number.isSafeInteger(candidate) || candidate < 1)
			throw new TypeError('ZRating ' + name + ' must be a positive safe integer.');
		return candidate;
	}
	function ratingValue(candidate: number, maximum: number, parts: number, name: string): number {
		if (!Number.isFinite(candidate) || candidate < 0 || candidate > maximum)
			throw new TypeError('ZRating ' + name + ' must be between 0 and count.');
		const scaled = candidate * parts;
		const rounded = Math.round(scaled);
		if (Math.abs(scaled - rounded) > 1e-8)
			throw new TypeError('ZRating ' + name + ' must align with fractions.');
		return rounded / parts;
	}
	function optionLabel(optionValue: number): string {
		const candidate =
			itemLabel?.(optionValue) ?? zui.localePack.common.ratingValue(optionValue, resolvedCount);
		if (typeof candidate !== 'string' || !candidate.trim())
			throw new TypeError('ZRating itemLabel must return a non-empty string.');
		return candidate;
	}
	function fill(index: number): number {
		const shown = hoverValue > 0 ? hoverValue : resolvedValue;
		return Math.max(0, Math.min(1, shown - (index - 1))) * 100;
	}
	function itemContext(index: number, state: 'empty' | 'filled'): ZRatingItemContext {
		return Object.freeze({
			index,
			previewed: hoverValue > 0,
			selected: resolvedValue >= index,
			state,
			value: index
		});
	}
	function setHover(next: number, input: HTMLInputElement | null): void {
		if (resolvedDisabled || resolvedReadonly || input?.matches(':disabled')) return;
		hoverValue = next;
		if (notifiedHoverValue === next) return;
		notifiedHoverValue = next;
		onHoverChange?.(next);
	}
	function clearHover(): void {
		hoverValue = 0;
		if (notifiedHoverValue === 0) return;
		notifiedHoverValue = 0;
		onHoverChange?.(0);
	}
	function handlePointerOver(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		const ElementConstructor = event.currentTarget.ownerDocument.defaultView?.Element;
		if (!ElementConstructor || !(event.target instanceof ElementConstructor)) return;
		const option = event.target.closest<HTMLLabelElement>('[data-slot="option"]');
		if (!option || !event.currentTarget.contains(option)) return;
		const optionValue = Number(option.dataset.value);
		if (!Number.isFinite(optionValue)) return;
		setHover(optionValue, option.querySelector<HTMLInputElement>('input'));
	}
	function cancelSelectionReconcile(): void {
		selectionReconcileVersion += 1;
		if (selectionReconcileFrame) {
			selectionReconcileFrame.view.cancelAnimationFrame(selectionReconcileFrame.id);
			selectionReconcileFrame = undefined;
		}
	}
	function reconcileNativeSelection(input: HTMLInputElement, step: number): void {
		cancelSelectionReconcile();
		const version = selectionReconcileVersion;
		const reconcile = () => {
			if (!selectionReconcileActive || version !== selectionReconcileVersion) return;
			selectionReconcileFrame = undefined;
			if (!input.isConnected || !ref?.contains(input)) return;
			for (const candidate of ref?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])
				candidate.checked = Number(candidate.value) === valueState.current;
			if (clearedActivationStep === step) clearedActivationStep = undefined;
		};
		const ownerWindow = input.ownerDocument.defaultView;
		if (ownerWindow)
			selectionReconcileFrame = {
				view: ownerWindow,
				id: ownerWindow.requestAnimationFrame(reconcile)
			};
		else queueMicrotask(reconcile);
	}
	function inputFor(step: number): HTMLInputElement | null {
		return ref?.querySelector<HTMLInputElement>('input[data-step="' + step + '"]') ?? null;
	}
	export function focus(): void {
		if (resolvedDisabled) return;
		const step = resolvedValue > 0 ? Math.round(resolvedValue * resolvedFractions) : activeStep;
		const target = inputFor(step) ?? firstInput;
		if (!target?.matches(':disabled')) target?.focus({ preventScroll: true });
	}
	function selectStep(step: number): void {
		const bounded = Math.max(1, Math.min(totalSteps, step));
		const target = inputFor(bounded);
		if (!target || target.matches(':disabled')) return;
		activeStep = bounded;
		valueState.setFromUser(bounded / resolvedFractions);
		target.focus({ preventScroll: true });
	}
	function handleChange(
		event: Event & { currentTarget: HTMLInputElement },
		step: number,
		optionValue: number
	): void {
		if (clearedActivationStep === step) {
			clearedActivationStep = undefined;
			event.currentTarget.checked = false;
			return;
		}
		if (resolvedReadonly || event.currentTarget.matches(':disabled')) {
			event.currentTarget.checked = resolvedValue === optionValue;
			return;
		}
		activeStep = step;
		if (!valueState.setFromUser(optionValue)) {
			for (const input of ref?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])
				input.checked = Number(input.value) === resolvedValue;
		}
	}
	function handleClick(
		event: MouseEvent & { currentTarget: HTMLInputElement },
		step: number,
		optionValue: number
	): void {
		if (resolvedReadonly || event.currentTarget.matches(':disabled')) {
			event.preventDefault();
			event.currentTarget.checked = resolvedValue === optionValue;
			return;
		}
		if (!clearable || resolvedValue !== optionValue) {
			clearedActivationStep = undefined;
			return;
		}
		const input = event.currentTarget;
		if (valueState.setFromUser(0) && valueState.current === 0) {
			clearedActivationStep = step;
			input.checked = false;
			reconcileNativeSelection(input, step);
		} else event.currentTarget.checked = true;
	}
	function handleKeydown(
		event: KeyboardEvent & { currentTarget: HTMLInputElement },
		step: number
	): void {
		if (
			event.isComposing ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			event.currentTarget.matches(':disabled')
		)
			return;
		if (event.key === ' ') {
			if (resolvedReadonly) {
				event.preventDefault();
				return;
			}
			if (clearable && resolvedValue === step / resolvedFractions) {
				event.preventDefault();
				if (valueState.setFromUser(0) && valueState.current === 0) {
					event.currentTarget.checked = false;
					reconcileNativeSelection(event.currentTarget, step);
				}
			}
			return;
		}
		let next: number | undefined;
		switch (event.key) {
			case 'ArrowRight':
				next = step + (resolvedDirection === 'rtl' ? -1 : 1);
				break;
			case 'ArrowLeft':
				next = step + (resolvedDirection === 'rtl' ? 1 : -1);
				break;
			case 'ArrowUp':
				next = step + 1;
				break;
			case 'ArrowDown':
				next = step - 1;
				break;
			case 'Home':
				next = 1;
				break;
			case 'End':
				next = totalSteps;
				break;
			default:
				return;
		}
		event.preventDefault();
		if (resolvedReadonly) return;
		if (next < 1) next = totalSteps;
		if (next > totalSteps) next = 1;
		selectStep(next);
	}
	function reset(): void {
		clearHover();
		valueState.reset();
		activeStep = resetValue > 0 ? Math.round(resetValue * resolvedFractions) : 1;
		onFormReset?.();
	}
	onMount(() => {
		firstInput = ref?.querySelector<HTMLInputElement>('input') ?? null;
	});
	onDestroy(fieldOwner.registerFocusOwner(focus));
	onDestroy(() => {
		selectionReconcileActive = false;
		cancelSelectionReconcile();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={rootId}
	role="radiogroup"
	dir={resolvedDirection}
	aria-label={resolvedLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={resolvedDisabled || undefined}
	aria-readonly={resolvedReadonly || undefined}
	aria-required={resolvedRequired || undefined}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-required={resolvedRequired || undefined}
	data-preview={hoverValue}
	data-size={resolvedSize}
	data-tone={resolvedTone}
	data-value={resolvedValue}
	onpointerover={handlePointerOver}
	onpointerleave={clearHover}
>
	{#each Array.from({ length: resolvedCount }, (_, index) => index + 1) as index (index)}
		<span class={classes.item} data-fill={fill(index)} data-index={index} data-slot="item">
			<span class={classes.empty} data-slot="empty">
				{#if item}{@render item(itemContext(index, 'empty'))}{:else}<Star
						aria-hidden="true"
						class={classes.glyph}
					/>{/if}
			</span>
			<span class={classes.fill} data-slot="fill" style={'inline-size:' + fill(index) + '%'}>
				{#if item}{@render item(itemContext(index, 'filled'))}{:else}<Star
						aria-hidden="true"
						class={classes.glyph}
						fill="currentColor"
					/>{/if}
			</span>
			{#each options.slice((index - 1) * resolvedFractions, index * resolvedFractions) as option (option.step)}
				<label
					class={classes.hit}
					data-slot="option"
					data-value={option.value}
					style={'inset-inline-start:' +
						((option.step - 1) % resolvedFractions) * (100 / resolvedFractions) +
						'%;inline-size:' +
						100 / resolvedFractions +
						'%'}
				>
					<input
						class={classes.input}
						data-step={option.step}
						defaultChecked={resetValue === option.value}
						checked={resolvedValue === option.value}
						disabled={resolvedDisabled}
						{form}
						id={rootId + '-option-' + option.step}
						name={resolvedName}
						required={resolvedRequired}
						tabindex={resolvedValue === option.value ||
						(resolvedValue === 0 && activeStep === option.step)
							? 0
							: -1}
						type="radio"
						value={String(option.value)}
						onchange={(event) => handleChange(event, option.step, option.value)}
						onclick={(event) => handleClick(event, option.step, option.value)}
						onfocus={() => (activeStep = option.step)}
						onkeydown={(event) => handleKeydown(event, option.step)}
						aria-label={optionLabel(option.value)}
					/>
				</label>
			{/each}
		</span>
	{/each}
</div>
<FormResetSignal association={form} control={firstInput} onReset={reset} />
