<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type InputGroupSize = ZControlSize;

	export interface ZInputGroupProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'prefix'
	> {
		readonly children: Snippet;
		readonly disabled?: boolean;
		readonly invalid?: boolean;
		readonly prefix?: Snippet;
		readonly prefixAction?: Snippet;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly size?: InputGroupSize;
		readonly suffix?: Snippet;
		readonly suffixAction?: Snippet;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'input-group',
		importStatement: "import { ZInputGroup } from '@zadmin/zui';",
		name: 'ZInputGroup',
		bindings: [{ description: '真实组合边界引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: [
			'FieldControl owner',
			'InputGroupContext',
			'ZInput/ZTextarea control registration',
			'ReducedMotionState',
			'logical CSS focus-within'
		],
		events: [],
		keyboard: [
			{
				description: 'Group不拦截业务control与action的原生键盘行为。',
				key: 'Native control/action keys'
			},
			{ description: 'Field label点击由唯一control owner接收焦点。', key: 'Field label activation' }
		],
		parts: [
			{ description: '逻辑起始非交互affix。', name: 'prefix' },
			{ description: '逻辑起始真实action边界。', name: 'prefix-action' },
			{ description: '唯一业务control。', name: 'control' },
			{ description: '逻辑结束非交互affix。', name: 'suffix' },
			{ description: '逻辑结束真实action边界。', name: 'suffix-action' }
		],
		props: [
			{
				default: '必填',
				description: '一个直接ZInput/ZTextarea业务value owner；复合owner可投射自己的单一焦点入口。',
				name: 'children',
				required: true,
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '逻辑起始非交互文本、单位或装饰Lucide。',
				name: 'prefix',
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '逻辑结束非交互文本、单位或装饰Lucide。',
				name: 'suffix',
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '逻辑起始真实Button/Link action。',
				name: 'prefixAction',
				type: 'Snippet'
			},
			{
				default: 'undefined',
				description: '逻辑结束真实Button/Link action。',
				name: 'suffixAction',
				type: 'Snippet'
			},
			{
				default: 'Field context',
				description: '禁用唯一control；action仍由调用方显式禁用。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '投射到组合边界和唯一control。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '投射到唯一control。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: '投射到唯一control的原生required。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Field > Provider density',
				description: '显式Group size供control继承；control显式size仍优先。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '唯一业务control。', name: 'children', type: 'Snippet' },
			{ description: '非交互起始affix。', name: 'prefix', type: 'Snippet' },
			{ description: '非交互结束affix。', name: 'suffix', type: 'Snippet' },
			{ description: '起始action。', name: 'prefixAction', type: 'Snippet' },
			{ description: '结束action。', name: 'suffixAction', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/input/ZInputGroup.svelte',
		states: [
			{ description: 'Field或显式禁用。', name: 'data-disabled', values: ['true'] },
			{ description: 'Field或显式无效。', name: 'data-invalid', values: ['true'] },
			{ description: 'Field或显式只读。', name: 'data-readonly', values: ['true'] },
			{ description: 'Field或显式必填。', name: 'data-required', values: ['true'] },
			{ description: '解析尺寸。', name: 'data-size', values: ['small', 'medium', 'large'] },
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'声明唯一业务control并桥接Field焦点、标签、说明、状态、name与size，将非交互affix和真实action分区的响应式Input Group。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.backgroundColor._canvas;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.flex;
			s.maxWidth._full;
			s.minWidth.px(0);
			s.overflow.hidden;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s.width._full;
			s._selector('&:focus-within', (focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
			s._selector('& > input, & > textarea', (control) => {
				control.borderRadius._none;
				control.borderStyle.none;
				control.flex.raw('1 1 auto');
				control.minWidth.px(0);
				control.outlineStyle.none;
			});
			s._selector('& > input:focus-visible, & > textarea:focus-visible', (control) => {
				control.outlineStyle.none;
			});
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			invalid: {
				false: (s) => s.borderColor._border,
				true: (s) => s.borderColor._danger
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			}
		},
		defaultVariants: { disabled: false, invalid: false, motion: 'auto' }
	});
	const affixRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.color._textMuted;
			s.cursor.text;
			s.display.inlineFlex;
			s.flex.raw('0 1 auto');
			s.gap._small;
			s.maxWidth.percent(40);
			s.minWidth.px(0);
			s.overflow.hidden;
			s.textOverflow.ellipsis;
			s.whiteSpace.nowrap;
		},
		variants: {
			size: {
				large: (s) => s.paddingInline._xlarge,
				medium: (s) => s.paddingInline._large,
				small: (s) => s.paddingInline._medium
			}
		},
		defaultVariants: { size: 'medium' }
	});
	const actionRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.backgroundColor._surface;
			s.display.inlineFlex;
			s.flex.raw('0 0 auto');
			s.gap._small;
		},
		variants: {
			size: {
				large: (s) => s.paddingInline._small,
				medium: (s) => s.paddingInline._xsmall,
				small: (s) => s.paddingInline._xsmall
			}
		},
		defaultVariants: { size: 'medium' }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, affixRecipe);
	registerRecipeHmr(import.meta, actionRecipe);
</script>

<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import {
		provideZInputGroup,
		useZInputGroup,
		type ZInputGroupControl
	} from '../../runtime/form/input-group-context.svelte.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		class: className,
		disabled = false,
		invalid,
		prefix,
		prefixAction,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size,
		style,
		suffix,
		suffixAction,
		...rest
	}: ZInputGroupProps = $props();
	if (useZInputGroup())
		throw new TypeError('ZInputGroup cannot be nested inside another ZInputGroup.');
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	let controlOwner: ZInputGroupControl | undefined;

	function registerControl(control: ZInputGroupControl): () => void {
		if (controlOwner && controlOwner !== control)
			throw new TypeError('ZInputGroup supports exactly one registered business value control.');
		controlOwner = control;
		return () => {
			if (controlOwner === control) controlOwner = undefined;
		};
	}

	function focusControl(): void {
		if (resolvedDisabled) return;
		if (controlOwner) {
			controlOwner.focus();
			return;
		}
		ref
			?.querySelector<HTMLElement>(
				'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [role="textbox"][tabindex]:not([aria-disabled="true"])'
			)
			?.focus({ preventScroll: true });
	}

	const attachAffix: Attachment<HTMLElement> = (node) => {
		const selector =
			'a[href], button, input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
		const assertBoundary = () => {
			if (node.querySelector(selector))
				throw new TypeError(
					'ZInputGroup prefix/suffix are non-interactive affixes; use prefixAction/suffixAction.'
				);
		};
		assertBoundary();
		const handlePointerDown = (event: PointerEvent) => event.preventDefault();
		const handleClick = () => focusControl();
		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('click', handleClick);
		const MutationObserverConstructor = node.ownerDocument.defaultView?.MutationObserver;
		const observer = MutationObserverConstructor
			? new MutationObserverConstructor(assertBoundary)
			: undefined;
		observer?.observe(node, {
			attributeFilter: ['contenteditable', 'href', 'tabindex'],
			attributes: true,
			childList: true,
			subtree: true
		});
		return () => {
			observer?.disconnect();
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('click', handleClick);
		};
	};

	provideZInputGroup({
		get controlId() {
			return field?.controlId;
		},
		get describedBy() {
			return resolvedDescribedBy;
		},
		get disabled() {
			return resolvedDisabled;
		},
		get invalid() {
			return resolvedInvalid;
		},
		get labelId() {
			return field?.labelId;
		},
		get name() {
			return field?.name;
		},
		get readonly() {
			return resolvedReadonly;
		},
		get required() {
			return resolvedRequired;
		},
		get size() {
			return resolvedSize;
		},
		registerControl
	});
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(
		zui.recipe(rootRecipe, {
			disabled: resolvedDisabled,
			invalid: resolvedInvalid,
			motion: reduced ? 'reduced' : 'full'
		})
	);
	const affixClass = $derived(zui.recipe(affixRecipe, { size: resolvedSize }));
	const actionClass = $derived(zui.recipe(actionRecipe, { size: resolvedSize }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => {
		if (field && !controlOwner)
			throw new TypeError('ZInputGroup inside ZField requires one registered ZInput or ZTextarea.');
		return reducedMotion.connect(ref?.ownerDocument.defaultView);
	});
	onDestroy(fieldOwner.registerFocusOwner(focusControl));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="group"
	aria-label={resolvedLabelledBy ? undefined : ariaLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-describedby={resolvedDescribedBy}
	aria-disabled={resolvedDisabled || undefined}
	dir={rest.dir ?? zui.direction}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-required={resolvedRequired || undefined}
	data-size={resolvedSize}
	data-reduced-motion={reduced || undefined}
>
	{#if prefix}
		<span class={affixClass} data-slot="prefix" {@attach attachAffix}>{@render prefix()}</span>
	{/if}
	{#if prefixAction}<span class={actionClass} data-slot="prefix-action"
			>{@render prefixAction()}</span
		>{/if}
	{@render children()}
	{#if suffix}
		<span class={affixClass} data-slot="suffix" {@attach attachAffix}>{@render suffix()}</span>
	{/if}
	{#if suffixAction}<span class={actionClass} data-slot="suffix-action"
			>{@render suffixAction()}</span
		>{/if}
</div>
