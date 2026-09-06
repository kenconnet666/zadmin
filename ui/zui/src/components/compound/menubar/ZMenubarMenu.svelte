<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	export interface ZMenubarMenuProps {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly value: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'menubar-menu',
		name: 'ZMenubarMenu',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/compound/menubar/ZMenubarMenu.svelte',
		importStatement: "import { ZMenubarMenu } from '@zadmin/zui';",
		summary: '无DOM地把一个DropdownMenu的trigger/content注册为Menubar根级单开项。',
		dependencies: ['ZMenubar', 'ZDropdownMenu'],
		bindings: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				name: 'value',
				type: 'SelectionKey',
				required: true,
				default: '必填',
				description: 'Menubar内唯一根菜单key。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '禁用该根trigger并关闭其菜单。'
			}
		],
		snippets: [
			{ name: 'children', type: 'Snippet', description: '对应的ZMenubarTrigger和ZMenubarContent。' }
		],
		states: []
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { assertSelectionKey } from '../../../runtime/collection/selection.js';
	import ZDropdownMenu from '../dropdown-menu/ZDropdownMenu.svelte';
	import { provideZMenubarMenu, useZMenubar } from './context.svelte.js';

	let { children, disabled = false, value }: ZMenubarMenuProps = $props();
	const menubar = useZMenubar();
	const resolvedDisabled = $derived(disabled || menubar.disabled);
	const validatedValue = $derived.by(() => {
		assertSelectionKey(value, 'ZMenubarMenu');
		return value;
	});
	provideZMenubarMenu({
		get disabled() {
			return resolvedDisabled;
		},
		get value() {
			return validatedValue;
		}
	});
</script>

<ZDropdownMenu
	open={!resolvedDisabled && Object.is(menubar.openValue, validatedValue)}
	onOpenChange={(open) => menubar.setOpen(validatedValue, open)}
>
	{@render children?.()}
</ZDropdownMenu>
