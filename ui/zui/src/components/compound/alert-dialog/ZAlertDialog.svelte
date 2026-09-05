<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	export interface ZAlertDialogProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly onAction?: (event: MouseEvent) => Promise<void> | void;
		readonly onActionError?: (error: unknown) => void;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'alert-dialog',
		importStatement:
			"import { ZAlertDialog, ZAlertDialogTrigger, ZAlertDialogOverlay, ZAlertDialogContent, ZAlertDialogTitle, ZAlertDialogDescription, ZAlertDialogCancel, ZAlertDialogAction } from '@zadmin/zui';",
		name: 'ZAlertDialog',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: [
			'ZDialog',
			'FocusScope',
			'inert others',
			'scroll lock',
			'async action generation'
		],
		events: [
			{
				description: '显式Action调用；Promise resolve关闭，reject保持打开。',
				name: 'onAction',
				type: '(event: MouseEvent) => Promise<void> | void'
			},
			{
				description: '当前generation Action失败后通知调用方。',
				name: 'onActionError',
				type: '(error: unknown) => void'
			},
			{
				description: '用户显式打开、取消或确认后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '在Trigger、Cancel与Action之间使用原生按钮键盘语义。', key: 'Enter / Space' },
			{ description: '在AlertDialog中循环焦点；Escape不会隐式关闭。', key: 'Tab / Escape' }
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
		since: '0.2.0',
		snippets: [{ description: 'AlertDialog复合部件。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/alert-dialog/ZAlertDialog.svelte',
		states: [],
		status: 'stable',
		summary:
			'建立默认Cancel焦点、强制显式决策和generation-safe caller-owned async Action的modal alertdialog根。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import ZDialog from '../dialog/ZDialog.svelte';
	import { provideZAlertDialog, type ZAlertDialogContext } from './context.svelte.js';

	let {
		children,
		defaultOpen = false,
		onAction,
		onActionError,
		onOpenChange,
		open = $bindable()
	}: ZAlertDialogProps = $props();
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	let generation = 0;
	let action = $state<HTMLButtonElement | null>(null);
	let cancel = $state<HTMLButtonElement | null>(null);
	let pending = $state(false);
	let previousOpen = untrack(() => openState.current);

	function invalidate(): void {
		generation += 1;
		pending = false;
	}
	function setOpen(next: boolean): void {
		if (!next) invalidate();
		openState.setFromUser(next);
	}
	async function confirm(event: MouseEvent): Promise<void> {
		if (pending) return;
		const current = (generation += 1);
		pending = true;
		try {
			await onAction?.(event);
			if (current !== generation) return;
			pending = false;
			setOpen(false);
		} catch (error) {
			if (current !== generation || !openState.current) return;
			pending = false;
			(action?.ownerDocument.defaultView ?? globalThis).queueMicrotask(() =>
				action?.focus({ preventScroll: true })
			);
			onActionError?.(error);
		}
	}

	const context: ZAlertDialogContext = {
		get action() {
			return action;
		},
		get cancel() {
			return cancel;
		},
		cancelDialog() {
			if (!pending) setOpen(false);
		},
		confirm(event) {
			void confirm(event);
		},
		get pending() {
			return pending;
		},
		setAction(next) {
			action = next;
		},
		setCancel(next) {
			cancel = next;
		}
	};
	provideZAlertDialog(context);
	$effect(() => {
		const currentOpen = openState.current;
		if (!currentOpen && previousOpen) invalidate();
		previousOpen = currentOpen;
	});
	onDestroy(invalidate);
</script>

<ZDialog onOpenChange={setOpen} open={openState.current}>
	{@render children?.()}
</ZDialog>
