<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { TabsActivationMode } from './context.svelte.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type TabsOrientation = 'horizontal' | 'vertical';

	export interface ZTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly activationMode?: TabsActivationMode;
		readonly children?: Snippet;
		readonly defaultValue?: string;
		readonly disabled?: boolean;
		readonly loop?: boolean;
		readonly onValueChange?: (value: string) => void;
		readonly orientation?: TabsOrientation;
		ref?: HTMLDivElement | null;
		value?: string;
	}

	const tabsRecipe = defineRecipe({
		base: (s) => s.display.block,
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, tabsRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tabs',
		importStatement: "import { ZTabs, ZTabsList, ZTabsTrigger, ZTabsPanel } from '@zadmin/zui';",
		name: 'ZTabs',
		bindings: [
			{ description: '当前激活Tab的value。', name: 'value', type: 'string' },
			{ description: '真实Tabs根元素引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZTabsList',
			'ZTabsTrigger',
			'ZTabsPanel',
			'CollectionStore',
			'Selection',
			'RovingFocus'
		],
		events: [
			{
				description: '用户激活新Tab后调用一次。',
				name: 'onValueChange',
				type: '(value: string) => void'
			}
		],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前激活Tab的value。',
				name: 'value',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '非受控模式的初始激活值。',
				name: 'defaultValue',
				type: 'string'
			},
			{
				default: "'automatic'",
				description: '焦点移动时自动激活，或等待Space/Enter。',
				name: 'activationMode',
				type: "'automatic' | 'manual'"
			},
			{
				default: "'horizontal'",
				description: 'TabList布局和方向键轴。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{ default: 'true', description: '方向键在边界循环。', name: 'loop', type: 'boolean' },
			{ default: 'false', description: '禁用整个Tabs。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实Tabs根元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'List、Trigger与Panel组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tabs/ZTabs.svelte',
		states: [
			{ description: '布局方向。', name: 'data-orientation', values: ['horizontal', 'vertical'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '分离焦点与选择、支持自动或手动激活、RTL和稳定ARIA关联的Tabs根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { hashString } from '../../../icss/hash.js';
	import { CollectionStore } from '../../../runtime/collection.svelte.js';
	import { ControllableState } from '../../../runtime/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/root-style.js';
	import { RovingFocus } from '../../../runtime/roving-focus.svelte.js';
	import { isSelected, singleSelection } from '../../../runtime/selection.js';
	import { useZui } from '../../../runtime/context.js';
	import { readIcssCarrier } from '../../../runtime/compiler-bridge.js';
	import { provideZTabs, type TabsCollectionItem, type ZTabsContext } from './context.svelte.js';

	let {
		activationMode = 'automatic',
		children,
		class: className,
		defaultValue,
		disabled = false,
		loop = true,
		onValueChange,
		orientation = 'horizontal',
		ref = $bindable(null),
		style,
		value = $bindable(),
		...rest
	}: ZTabsProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tabs'));
	const rootClass = $derived(zui.recipe(tabsRecipe));
	const valueState = new ControllableState<string | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		write: (next) => (value = next)
	});
	const collection = new CollectionStore<TabsCollectionItem>();
	let focusKey = $state<string | undefined>();
	const roving = new RovingFocus({
		collection,
		direction: () => zui.direction,
		loop: () => loop,
		orientation: () => orientation,
		read: () => focusKey ?? valueState.current,
		write: (key) => (focusKey = key)
	});
	const itemId = (itemValue: string, part: 'panel' | 'trigger') =>
		`${idBase}-${hashString(itemValue)}-${part}`;
	const context: ZTabsContext = {
		get activationMode() {
			return activationMode;
		},
		collection,
		get disabled() {
			return disabled;
		},
		get orientation() {
			return orientation;
		},
		focus(itemValue) {
			roving.set(itemValue);
		},
		handleKey(event) {
			if (disabled) return;
			const next = roving.handleKey(event);
			if (next !== undefined && activationMode === 'automatic') context.select(next);
		},
		isSelected(itemValue) {
			return isSelected(singleSelection(valueState.current), itemValue);
		},
		panelId(itemValue) {
			return itemId(itemValue, 'panel');
		},
		register(read) {
			return collection.register(read);
		},
		select(itemValue) {
			const item = collection.get(itemValue);
			if (disabled || !item || item.disabled) return;
			focusKey = itemValue;
			valueState.setFromUser(itemValue);
		},
		tabIndex(itemValue) {
			return disabled ? -1 : roving.tabIndex(itemValue);
		},
		triggerId(itemValue) {
			return itemId(itemValue, 'trigger');
		}
	};
	provideZTabs(context);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-disabled={disabled || undefined}
	data-orientation={orientation}
>
	{@render children?.()}
</div>
