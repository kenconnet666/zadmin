<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from './context.svelte.js';
	import type { ZMenuItemProps } from './ZMenuItem.svelte';

	export interface ZMenuRadioItemProps extends Omit<
		ZMenuItemProps,
		'checked' | 'children' | 'closeOnSelect' | 'itemRole' | 'onSelect'
	> {
		readonly children?: Snippet;
		readonly closeOnSelect?: boolean;
		readonly onSelect?: (event: MenuActionEvent) => void;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-radio-item',
		importStatement: "import { ZMenuRadioItem } from '@zadmin/zui';",
		name: 'ZMenuRadioItem',
		bindings: [{ description: '真实menuitemradio引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ZMenuItem', 'ZMenuRadioGroup', 'Lucide'],
		events: [
			{
				description: '选择前的可取消Menu action。',
				name: 'onSelect',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [{ description: '选择当前值，默认保持Menu打开。', key: 'Enter / Space' }],
		parts: [{ description: 'checked Lucide指示器。', name: 'indicator' }],
		props: [
			{
				default: 'false',
				description: '选择后是否dismiss Popup Menu。',
				name: 'closeOnSelect',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Radio标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuRadioItem.svelte',
		states: [
			{ description: 'ARIA checked状态。', name: 'aria-checked', values: ['true', 'false'] }
		],
		status: 'experimental',
		summary: '由ZMenuRadioGroup拥有typed值、默认保持Menu打开的menuitemradio。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import Circle from '@lucide/svelte/icons/circle';
	import { useZMenuRadioGroup } from './context.svelte.js';
	import ZMenuItem from './ZMenuItem.svelte';

	let {
		children,
		closeOnSelect = false,
		onSelect,
		ref = $bindable(null),
		value,
		...rest
	}: ZMenuRadioItemProps = $props();
	const group = useZMenuRadioGroup();
	const selected = $derived(Object.is(group.value, value));

	function handleSelect(event: MenuActionEvent): void {
		onSelect?.(event);
		if (!event.defaultPrevented) event.deferDefault(() => group.select(value));
	}
</script>

{#snippet indicator()}
	{#if selected}<Circle fill="currentColor" size={9} />{/if}
{/snippet}

<ZMenuItem
	{...rest}
	bind:ref
	checked={selected}
	{closeOnSelect}
	itemRole="menuitemradio"
	leading={indicator}
	{value}
	onSelect={handleSelect}
>
	{@render children?.()}
</ZMenuItem>
