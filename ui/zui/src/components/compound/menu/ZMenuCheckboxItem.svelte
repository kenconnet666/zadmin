<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { MenuActionEvent } from './context.svelte.js';
	import type { ZMenuItemProps } from './ZMenuItem.svelte';

	export interface ZMenuCheckboxItemProps extends Omit<
		ZMenuItemProps,
		'checked' | 'children' | 'closeOnSelect' | 'itemRole' | 'onSelect'
	> {
		checked?: boolean | 'mixed';
		readonly children?: Snippet;
		readonly closeOnSelect?: boolean;
		readonly defaultChecked?: boolean | 'mixed';
		readonly onCheckedChange?: (checked: boolean) => void;
		readonly onSelect?: (event: MenuActionEvent) => void;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menu-checkbox-item',
		importStatement: "import { ZMenuCheckboxItem } from '@zadmin/zui';",
		name: 'ZMenuCheckboxItem',
		bindings: [
			{ description: '当前checked或mixed状态。', name: 'checked', type: "boolean | 'mixed'" },
			{ description: '真实menuitemcheckbox引用。', name: 'ref', type: 'HTMLElement | null' }
		],
		dependencies: ['ZMenuItem', 'ControllableState', 'Lucide'],
		events: [
			{
				description: '用户切换后通知最终boolean值。',
				name: 'onCheckedChange',
				type: '(checked: boolean) => void'
			},
			{
				description: '切换前的可取消Menu action。',
				name: 'onSelect',
				type: '(event: MenuActionEvent) => void'
			}
		],
		keyboard: [{ description: '切换checked，默认保持Menu打开。', key: 'Enter / Space' }],
		parts: [{ description: 'checked或mixed的Lucide指示器。', name: 'indicator' }],
		props: [
			{
				default: 'undefined',
				description: '受控或bindable状态。',
				name: 'checked',
				type: "boolean | 'mixed'"
			},
			{
				default: 'false',
				description: '非受控初始状态。',
				name: 'defaultChecked',
				type: "boolean | 'mixed'"
			},
			{
				default: 'false',
				description: '切换后是否dismiss Popup Menu。',
				name: 'closeOnSelect',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Checkbox标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/menu/ZMenuCheckboxItem.svelte',
		states: [
			{
				description: 'ARIA checked状态。',
				name: 'aria-checked',
				values: ['true', 'false', 'mixed']
			}
		],
		status: 'experimental',
		summary: '保持Menu打开并支持受控、非受控和mixed状态的menuitemcheckbox。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import ZMenuItem from './ZMenuItem.svelte';

	let {
		checked = $bindable(),
		children,
		closeOnSelect = false,
		defaultChecked = false,
		onCheckedChange,
		onSelect,
		ref = $bindable(null),
		...rest
	}: ZMenuCheckboxItemProps = $props();
	const checkedState = new ControllableState<boolean | 'mixed'>({
		defaultValue: () => defaultChecked,
		onChange: () => (next) => onCheckedChange?.(next === true),
		read: () => checked,
		write: (next) => (checked = next)
	});

	function handleSelect(event: MenuActionEvent): void {
		onSelect?.(event);
		if (!event.defaultPrevented) {
			const next = checkedState.current !== true;
			event.deferDefault(() => checkedState.setFromUser(next));
		}
	}
</script>

{#snippet indicator()}
	{#if checkedState.current === 'mixed'}
		<Minus size={15} />
	{:else if checkedState.current}
		<Check size={15} />
	{/if}
{/snippet}

<ZMenuItem
	{...rest}
	bind:ref
	checked={checkedState.current}
	{closeOnSelect}
	itemRole="menuitemcheckbox"
	leading={indicator}
	onSelect={handleSelect}
>
	{@render children?.()}
</ZMenuItem>
