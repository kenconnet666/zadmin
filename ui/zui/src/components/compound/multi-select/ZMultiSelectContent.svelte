<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZPopoverContentProps } from '../popover/ZPopoverContent.svelte';
	export type ZMultiSelectContentProps = Omit<
		ZPopoverContentProps,
		'ariaLabelledBy' | 'children' | 'role'
	> & { readonly children?: Snippet };
	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select-content',
		importStatement: "import { ZMultiSelectContent } from '@zadmin/zui';",
		name: 'ZMultiSelectContent',
		bindings: [{ description: '真实listbox引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMultiSelect', 'ZPopoverContent', 'Typeahead'],
		events: [],
		keyboard: [
			{ description: 'option导航与typeahead。', key: 'Arrow keys / Home / End / Printable' },
			{ description: 'dismiss并恢复Trigger。', key: 'Escape' }
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
		snippets: [{ description: 'Items。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectContent.svelte',
		states: [],
		status: 'experimental',
		summary: 'aria-multiselectable listbox与集合键盘容器。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { useZMultiSelect } from './context.svelte.js';
	let { children, onkeydown, ref = $bindable(null), ...rest }: ZMultiSelectContentProps = $props();
	const popover = useZPopover();
	const multi = useZMultiSelect();
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || multi.roving.handleKey(event) !== undefined) return;
		const match = multi.typeahead.search(
			event.key,
			multi.collection.items,
			multi.roving.currentKey
		);
		if (match !== undefined) {
			event.preventDefault();
			multi.roving.set(match, true);
		}
	}
</script>

<ZPopoverContent
	{...rest}
	aria-multiselectable="true"
	ariaLabelledBy={popover.triggerId}
	bind:ref
	role="listbox"
	onkeydown={handleKeydown}>{@render children?.()}</ZPopoverContent
>
