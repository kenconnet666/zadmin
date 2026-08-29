<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZSelectContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'role'
	> & { readonly children?: Snippet };
	export const zuiMetadata = {
		category: 'input',
		id: 'select-content',
		importStatement: "import { ZSelectContent } from '@zadmin/zui';",
		name: 'ZSelectContent',
		bindings: [{ description: '真实listbox引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZSelect', 'ZPopoverContent', 'Typeahead'],
		events: [],
		keyboard: [
			{ description: '在enabled option间移动。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '按文本前缀移动。', key: 'Printable characters' },
			{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '真实listbox引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: 'ZSelectItem集合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/select/ZSelectContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '自身使用listbox角色并统一处理Collection导航与typeahead。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZSelect } from './context.svelte.js';
	let { children, onkeydown, ref = $bindable(null), ...rest }: ZSelectContentProps = $props();
	const popover = useZPopover();
	const select = useZSelect();
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || select.roving.handleKey(event) !== undefined) return;
		const match = select.typeahead.search(
			event.key,
			select.collection.items,
			select.roving.currentKey
		);
		if (match !== undefined) {
			event.preventDefault();
			select.roving.set(match, true);
		}
	}
</script>

<ZPopoverContent
	{...rest}
	ariaLabelledBy={popover.triggerId}
	bind:ref
	role="listbox"
	onkeydown={handleKeydown}>{@render children?.()}</ZPopoverContent
>
