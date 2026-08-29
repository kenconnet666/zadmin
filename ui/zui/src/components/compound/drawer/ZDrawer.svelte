<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	export interface ZDrawerProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer',
		importStatement:
			"import { ZDrawer, ZDrawerTrigger, ZDrawerOverlay, ZDrawerContent, ZDrawerTitle, ZDrawerDescription, ZDrawerClose } from '@zadmin/zui';",
		name: 'ZDrawer',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZDialog', 'logical placement', 'Presence'],
		events: [
			{
				description: '打开或关闭后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '关闭最顶层Drawer并恢复焦点。', key: 'Escape' },
			{ description: '在Drawer内部循环焦点。', key: 'Tab / Shift+Tab' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			}
		],
		since: '0.3.0',
		snippets: [{ description: 'Drawer复合部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/drawer/ZDrawer.svelte',
		states: [],
		status: 'experimental',
		summary: '复用Dialog modal合同并提供四向逻辑placement的侧滑面板根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ZDialog from '../dialog/ZDialog.svelte';

	let { children, defaultOpen = false, onOpenChange, open = $bindable() }: ZDrawerProps = $props();
</script>

<ZDialog bind:open {defaultOpen} {onOpenChange}>
	{@render children?.()}
</ZDialog>
