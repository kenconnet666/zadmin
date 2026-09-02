<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	export interface ZDialogProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog',
		importStatement:
			"import { ZDialog, ZDialogTrigger, ZDialogOverlay, ZDialogContent, ZDialogTitle, ZDialogDescription, ZDialogClose } from '@zadmin/zui';",
		name: 'ZDialog',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: [
			'Portal',
			'LayerStack',
			'DismissableLayer',
			'FocusScope',
			'ReducedMotionState',
			'scroll lock',
			'inert others',
			'Presence'
		],
		events: [
			{
				description: '用户打开或关闭后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [{ description: '关闭最顶层Dialog并恢复焦点。', key: 'Escape' }],
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
		since: 'unreleased',
		snippets: [{ description: 'Dialog复合部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/dialog/ZDialog.svelte',
		states: [],
		status: 'experimental',
		summary:
			'统一管理modal Portal、ownerDocument、Layer、focus、scroll、inert、motion与Presence的Dialog根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../../runtime/foundation/presence.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { resolvePortalTarget } from '../../../runtime/layer/portal.js';
	import { provideZDialog, type ZDialogContext } from './context.svelte.js';

	let { children, defaultOpen = false, onOpenChange, open = $bindable() }: ZDialogProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'dialog'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let overlay = $state<HTMLDivElement | null>(null);
	let description = $state<HTMLParagraphElement | null>(null);
	let descriptionCount = $state(0);
	let portalAnchor = $state<HTMLElement | null>(null);
	let title = $state<HTMLHeadingElement | null>(null);
	let titleCount = $state(0);
	let trigger = $state<HTMLButtonElement | null>(null);
	onMount(() => reducedMotion.connect(portalAnchor?.ownerDocument.defaultView));
	const context: ZDialogContext = {
		get contentId() {
			return `${idBase}-content`;
		},
		get descriptionId() {
			return `${idBase}-description`;
		},
		get description() {
			return description;
		},
		get hasDescription() {
			return descriptionCount > 0;
		},
		get hasTitle() {
			return titleCount > 0;
		},
		get exitDuration() {
			return reducedMotion.current ? 0 : durationMilliseconds(zui.theme.duration.normal);
		},
		get open() {
			return openState.current;
		},
		get overlay() {
			return overlay;
		},
		get portalTarget() {
			return resolvePortalTarget(trigger ?? portalAnchor, zui.portalContainer);
		},
		get reducedMotion() {
			return reducedMotion.current;
		},
		setOpen(next) {
			openState.setFromUser(next);
		},
		registerDescription() {
			descriptionCount += 1;
			return () => (descriptionCount = Math.max(0, descriptionCount - 1));
		},
		registerTitle() {
			titleCount += 1;
			return () => (titleCount = Math.max(0, titleCount - 1));
		},
		setOverlay(next) {
			overlay = next;
		},
		setDescription(next) {
			description = next;
		},
		setTitle(next) {
			title = next;
		},
		setTrigger(next) {
			trigger = next;
		},
		get titleId() {
			return `${idBase}-title`;
		},
		get title() {
			return title;
		},
		get trigger() {
			return trigger;
		},
		get triggerId() {
			return `${idBase}-trigger`;
		}
	};
	provideZDialog(context);
</script>

<span bind:this={portalAnchor} hidden aria-hidden="true" data-zui-portal-anchor></span>
{@render children?.()}
