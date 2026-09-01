<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../../runtime/collection/selection.js';
	import type {
		AccordionMultipleValue as AccordionMultipleValueType,
		AccordionSingleValue as AccordionSingleValueType,
		AccordionType as AccordionTypeValue,
		AccordionValue as AccordionPublicValue
	} from './context.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type AccordionType = AccordionTypeValue;
	export type AccordionValue = AccordionPublicValue;
	export type AccordionSingleValue = AccordionSingleValueType;
	export type AccordionMultipleValue = AccordionMultipleValueType;

	interface ZAccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		activeValue?: PublicSelectionKey | null;
		readonly children?: Snippet;
		readonly defaultActiveValue?: PublicSelectionKey | null;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly onActiveValueChange?: (value: PublicSelectionKey | null) => void;
		ref?: HTMLDivElement | null;
	}

	interface ZAccordionSingleProps {
		readonly collapsible?: boolean;
		readonly defaultValue?: AccordionSingleValue;
		readonly onValueChange?: (value: AccordionSingleValue) => void;
		readonly type?: 'single';
		value?: AccordionSingleValue;
	}

	interface ZAccordionMultipleProps {
		readonly collapsible?: never;
		readonly defaultValue?: AccordionMultipleValue;
		readonly onValueChange?: (value: AccordionMultipleValue) => void;
		readonly type: 'multiple';
		value?: AccordionMultipleValue;
	}

	export type ZAccordionProps = ZAccordionBaseProps &
		(ZAccordionMultipleProps | ZAccordionSingleProps);

	const accordionRecipe = defineRecipe({
		base: (s) => s.display.block,
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, accordionRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'accordion',
		importStatement:
			"import { ZAccordion, ZAccordionItem, ZAccordionTrigger, ZAccordionContent } from '@zadmin/zui';",
		name: 'ZAccordion',
		bindings: [
			{
				description: 'single为typed key/null；multiple为去重typed-key数组。',
				name: 'value',
				type: 'SelectionKey | null | readonly SelectionKey[]'
			},
			{
				description: '独立于展开选择的roving焦点key；null是显式空active。',
				name: 'activeValue',
				type: 'SelectionKey | null'
			},
			{ description: '真实Accordion根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZAccordionItem',
			'ZAccordionTrigger',
			'ZAccordionContent',
			'LogicalCollection',
			'MountedElements',
			'CollectionNavigation',
			'Presence',
			'ReducedMotionState'
		],
		events: [
			{
				description: '真实用户展开/折叠后调用；动态删除和外部同步不调用。',
				name: 'onValueChange',
				type: '(value: SelectionKey | null | readonly SelectionKey[]) => void'
			},
			{
				description: '用户或键盘移动active trigger后调用；collection恢复不调用。',
				name: 'onActiveValueChange',
				type: '(value: SelectionKey | null) => void'
			}
		],
		keyboard: [
			{ description: '在enabled Trigger间移动焦点。', key: 'ArrowUp / ArrowDown' },
			{ description: '移动到首尾enabled Trigger。', key: 'Home / End' },
			{ description: '原生button展开/折叠；non-collapsible已打开项不关闭。', key: 'Enter / Space' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'single: null；multiple: []',
				description: '由type判别的展开值；number 1与string 1保持不同身份。',
				name: 'value',
				type: 'SelectionKey | null | readonly SelectionKey[]'
			},
			{
				default: '同value空合同',
				description: '非受控初值。',
				name: 'defaultValue',
				type: 'SelectionKey | null | readonly SelectionKey[]'
			},
			{
				bindable: true,
				default: 'null后恢复到第一enabled key',
				description: '独立roving active key。',
				name: 'activeValue',
				type: 'SelectionKey | null'
			},
			{
				default: 'null',
				description: '非受控初始active key。',
				name: 'defaultActiveValue',
				type: 'SelectionKey | null'
			},
			{
				default: "'single'",
				description: '判别single/null或multiple/array合同。',
				name: 'type',
				type: "'single' | 'multiple'"
			},
			{
				default: 'true（仅single）',
				description: '允许关闭single模式最后一个展开项。',
				name: 'collapsible',
				type: 'boolean'
			},
			{ default: 'true', description: '方向键边界循环。', name: 'loop', type: 'boolean' },
			{
				default: 'false',
				description: '禁用整个Accordion和所有Trigger。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实Accordion根引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Item组合；支持嵌套Accordion。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/accordion/ZAccordion.svelte',
		states: [
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '当前已解析为减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'以LogicalCollection统一typed compound items、分离active/expanded owner，并保留nested、collapsible与Presence motion的Accordion。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { CollectionNavigation } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../../runtime/foundation/presence.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		provideZAccordion,
		type AccordionCollectionItem,
		type AccordionValue as AccordionRuntimeValue,
		type ZAccordionContext
	} from './context.svelte.js';

	let {
		activeValue = $bindable(),
		children,
		class: className,
		collapsible = true,
		defaultActiveValue = null,
		defaultValue,
		disabled = false,
		loop = true,
		onActiveValueChange,
		onfocusin,
		onfocusout,
		onValueChange,
		ref = $bindable(null),
		style,
		type = 'single',
		value = $bindable(),
		...rest
	}: ZAccordionProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const reduced = $derived(reducedMotion.current);
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'accordion'));
	const rootClass = $derived(zui.recipe(accordionRecipe));
	const mounted = new MountedElements<SelectionKey, HTMLButtonElement>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, AccordionCollectionItem>(
		mounted
	);
	const owner = Symbol('zui-accordion-owner');
	const collection = $derived(compound.collection);
	const view = $derived(collection.full);
	const slots = new Map<SelectionKey, number>();
	let nextSlot = 0;
	let focusWithin = $state(false);
	let initialTabStopKey: SelectionKey | undefined;
	let alive = true;

	function assertKey(key: SelectionKey | null): void {
		if (key === null || typeof key === 'string') return;
		if (!Number.isFinite(key) || Object.is(key, -0))
			throw new TypeError('ZAccordion values must be strings or finite numbers other than -0.');
	}

	function normalize(source: AccordionRuntimeValue | undefined): readonly SelectionKey[] {
		if (type === 'single') {
			if (Array.isArray(source))
				throw new TypeError('ZAccordion type="single" requires a SelectionKey or null value.');
			if (source === undefined || source === null) return [];
			assertKey(source);
			return [source];
		}
		if (source === undefined) return [];
		if (!Array.isArray(source))
			throw new TypeError('ZAccordion type="multiple" requires a readonly SelectionKey[] value.');
		const values: SelectionKey[] = [];
		const seen = new Set<SelectionKey>();
		for (const key of source) {
			assertKey(key);
			if (!seen.has(key)) {
				seen.add(key);
				values.push(key);
			}
		}
		return Object.freeze(values);
	}

	function toPublic(values: readonly SelectionKey[]): AccordionRuntimeValue {
		return type === 'single' ? (values[0] ?? null) : Object.freeze([...values]);
	}

	const valueState = new ControllableState<AccordionRuntimeValue>({
		defaultValue: () => toPublic(normalize(defaultValue)),
		onChange: () => onValueChange as ((next: AccordionRuntimeValue) => void) | undefined,
		read: () => value,
		write: (next) => (value = next)
	});
	const activeState = new ControllableState<SelectionKey | null>({
		defaultValue: () => defaultActiveValue,
		onChange: () => onActiveValueChange,
		read: () => activeValue,
		write: (next) => (activeValue = next)
	});
	const contract = $derived.by(() => {
		normalize(defaultValue);
		normalize(valueState.current);
		assertKey(defaultActiveValue);
		assertKey(activeState.current);
		return { collapsible, disabled, loop, type };
	});
	const navigation = new CollectionNavigation<SelectionKey, AccordionCollectionItem>({
		disabled: () => disabled,
		loop: () => loop,
		orientation: () => 'vertical',
		readActive: () => activeState.current ?? undefined,
		view: () => view,
		writeActive: (next, reason) => {
			if (reason === 'collection-change') activeValue = next ?? null;
			else activeState.setFromUser(next ?? null);
		}
	});
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function slotFor(key: SelectionKey): number {
		let slot = slots.get(key);
		if (slot === undefined) {
			slot = nextSlot += 1;
			slots.set(key, slot);
		}
		return slot;
	}

	function itemId(key: SelectionKey, part: 'content' | 'trigger'): string {
		return `${idBase}-${slotFor(key)}-${part}`;
	}

	function syncRemovedSelection(key: SelectionKey): void {
		if (collection.get(key)) return;
		slots.delete(key);
		const current = normalize(valueState.current);
		if (!current.includes(key)) return;
		value = toPublic(current.filter((candidate) => !Object.is(candidate, key)));
	}

	function ownerMicrotask(element: HTMLElement | null, callback: () => void): void {
		(element?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() => {
			if (alive) callback();
		});
	}

	function preferredActive(): SelectionKey | undefined {
		return navigation.currentKey ?? view.first();
	}

	const context: ZAccordionContext = {
		contentId(itemValue) {
			return itemId(itemValue, 'content');
		},
		get disabled() {
			return disabled;
		},
		get exitDuration() {
			return reduced ? 0 : durationMilliseconds(zui.theme.duration.normal);
		},
		focus(itemValue) {
			navigation.set(itemValue, 'pointer');
		},
		handleKey(event) {
			if (!navigation.handleKey(event)) return false;
			const next = navigation.currentKey;
			if (next !== undefined) mounted.focus(next);
			return true;
		},
		isActive(itemValue) {
			return Object.is(navigation.currentKey, itemValue);
		},
		isOpen(itemValue) {
			return normalize(valueState.current).some((key) => Object.is(key, itemValue));
		},
		isTriggerLocked(itemValue) {
			return type === 'single' && !collapsible && context.isOpen(itemValue);
		},
		owner,
		get reducedMotion() {
			return reduced;
		},
		register(read) {
			const current = read();
			const stopLogical = compound.register(read);
			const stopMount = current.element
				? mounted.mount(current.key, current.element, current.id)
				: () => undefined;
			return () => {
				const restoreFocus =
					current.element?.ownerDocument.activeElement === current.element ||
					(focusWithin && Object.is(navigation.currentKey, current.key));
				stopMount();
				stopLogical();
				ownerMicrotask(current.element, () => {
					syncRemovedSelection(current.key);
					if (restoreFocus) {
						const nearest = navigation.reconcile();
						if (nearest !== undefined) mounted.focus(nearest);
					}
				});
			};
		},
		restoreFocus(itemValue) {
			const target =
				collection.get(itemValue) && !collection.get(itemValue)?.disabled
					? itemValue
					: (navigation.currentKey ?? view.first());
			if (target === undefined) return;
			navigation.set(target, 'collection-change');
			mounted.focus(target);
		},
		tabIndex(itemValue) {
			if (disabled) return -1;
			if (view.size === 0) {
				const preferred = activeState.current;
				if (preferred !== null) return Object.is(preferred, itemValue) ? 0 : -1;
				initialTabStopKey ??= itemValue;
				return Object.is(initialTabStopKey, itemValue) ? 0 : -1;
			}
			return disabled || !Object.is(preferredActive(), itemValue) ? -1 : 0;
		},
		toggle(itemValue) {
			const item = collection.get(itemValue);
			if (disabled || !item || item.disabled) return;
			const current = normalize(valueState.current);
			const open = current.some((key) => Object.is(key, itemValue));
			if (type === 'single') {
				if (open && !collapsible) return;
				valueState.setFromUser(open ? null : itemValue);
				return;
			}
			valueState.setFromUser(
				Object.freeze(
					open ? current.filter((key) => !Object.is(key, itemValue)) : [...current, itemValue]
				)
			);
		},
		triggerId(itemValue) {
			return itemId(itemValue, 'trigger');
		}
	};
	provideZAccordion(context);

	$effect(() => {
		const currentView = view;
		const currentContract = contract;
		untrack(() => {
			const previous = activeState.current;
			const next = navigation.reconcile();
			if (focusWithin && !Object.is(previous, next) && next !== undefined)
				ownerMicrotask(ref, () => mounted.focus(next));
		});
		void currentView;
		void currentContract;
	});

	function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		focusWithin = true;
		onfocusin?.(event);
	}

	function handleFocusout(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		const NodeConstructor = event.currentTarget.ownerDocument.defaultView?.Node;
		focusWithin = Boolean(
			NodeConstructor &&
			event.relatedTarget instanceof NodeConstructor &&
			event.currentTarget.contains(event.relatedTarget)
		);
		onfocusout?.(event);
	}

	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	onDestroy(() => {
		alive = false;
		mounted.clear();
		slots.clear();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={disabled || undefined}
	data-reduced-motion={reduced || undefined}
	onfocusin={handleFocusin}
	onfocusout={handleFocusout}
>
	{@render children?.()}
</div>
