<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { ZDialogOverlayProps } from '../dialog/ZDialogOverlay.svelte';

	export type ZDrawerOverlayProps = ZDialogOverlayProps;
	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-overlay',
		importStatement: "import { ZDrawerOverlay } from '@zadmin/zui';",
		name: 'ZDrawerOverlay',
		bindings: [
			{ description: '挂载期间的真实overlay引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDrawer', 'ZDialogOverlay'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实overlay引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerOverlay.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{
				description: '进入与退出的可视动画阶段。',
				name: 'data-motion-state',
				values: ['entering', 'entered', 'exiting']
			}
		],
		status: 'stable',
		summary: '与Drawer Presence同步的modal遮罩。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { mergeStyles } from '../../../runtime/foundation/root-style.js';
	import ZDialogOverlay from '../dialog/ZDialogOverlay.svelte';
	import { useZDialog } from '../dialog/context.svelte.js';
	import { DrawerEntryMotion } from './entry-motion.svelte.js';

	let { ref = $bindable(null), style, ...rest }: ZDrawerOverlayProps = $props();
	const dialog = useZDialog();
	const entryMotion = new DrawerEntryMotion(untrack(() => dialog.open));
	const motionState = $derived(
		dialog.open ? (entryMotion.entered ? 'entered' : 'entering') : 'exiting'
	);
	const overlayStyle = $derived(mergeStyles(style, entryMotion.entered ? '' : 'opacity:0'));
	$effect(() => entryMotion.update(dialog.open, dialog.reducedMotion, ref));
	onDestroy(() => entryMotion.destroy());
</script>

<ZDialogOverlay {...rest} bind:ref data-motion-state={motionState} style={overlayStyle} />
