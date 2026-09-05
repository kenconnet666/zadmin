<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export interface ZPopconfirmProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly formatConfirmError?: (error: unknown) => string;
		readonly gutter?: number;
		readonly onConfirm?: (event: MouseEvent) => Promise<void> | void;
		readonly onConfirmError?: (error: unknown) => void;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm',
		importStatement:
			"import { ZPopconfirm, ZPopconfirmTrigger, ZPopconfirmContent, ZPopconfirmTitle, ZPopconfirmDescription, ZPopconfirmCancel, ZPopconfirmAction } from '@zadmin/zui';",
		name: 'ZPopconfirm',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZPopover', 'Floating', 'FocusScope', 'ControllableState'],
		events: [
			{
				description: '确认时调用；Promise resolve关闭，reject保持打开并显示错误。',
				name: 'onConfirm',
				type: '(event: MouseEvent) => Promise<void> | void'
			},
			{
				description: '当前generation确认失败后调用；迟到结果不会触发。',
				name: 'onConfirmError',
				type: '(error: unknown) => void'
			},
			{
				description: '打开、取消、确认或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '关闭并恢复Trigger焦点；pending结果随后失效。', key: 'Escape' },
			{ description: '使用原生按钮确认或取消。', key: 'Enter / Space' }
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
			},
			{
				default: "'bottom'",
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: '8',
				description: 'Trigger与Content间距，单位px。',
				name: 'gutter',
				type: 'number'
			},
			{
				default: 'Provider localePack.feedback.confirmFailed',
				description: '把reject原因安全映射为用户可见错误；不得默认泄漏内部异常。',
				name: 'formatConfirmError',
				type: '(error: unknown) => string'
			}
		],
		since: '0.2.0',
		snippets: [{ description: 'Trigger、Content及显式操作。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirm.svelte',
		states: [
			{ description: '确认Promise尚未settle。', name: 'data-pending', values: ['true'] },
			{ description: '当前generation确认失败。', name: 'data-error', values: ['true'] }
		],
		status: 'stable',
		summary:
			'基于非modal Popover、以generation隔离异步确认并在reject后保留可访问错误的就地确认组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import { provideZPopconfirm, type ZPopconfirmContext } from './context.svelte.js';

	let {
		children,
		defaultOpen = false,
		formatConfirmError,
		gutter = 8,
		onConfirm,
		onConfirmError,
		onOpenChange,
		open = $bindable(),
		placement = 'bottom'
	}: ZPopconfirmProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'popconfirm'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	let generation = 0;
	let action = $state<HTMLButtonElement | null>(null);
	let pending = $state(false);
	let errorMessage = $state<string>();
	let previousOpen = untrack(() => openState.current);

	function invalidateConfirmation(): void {
		generation += 1;
		pending = false;
		errorMessage = undefined;
	}

	function setOpen(next: boolean): void {
		if (next) errorMessage = undefined;
		else invalidateConfirmation();
		openState.setFromUser(next);
	}

	function confirmationError(error: unknown): string {
		try {
			const formatted = formatConfirmError?.(error).trim();
			if (formatted) return formatted;
		} catch {
			// Presentation formatters never replace the safe localized fallback.
		}
		return zui.localePack.feedback.confirmFailed;
	}

	async function confirm(event: MouseEvent): Promise<void> {
		if (pending) return;
		const currentGeneration = (generation += 1);
		pending = true;
		errorMessage = undefined;
		try {
			await onConfirm?.(event);
			if (currentGeneration !== generation) return;
			pending = false;
			setOpen(false);
		} catch (error) {
			if (currentGeneration !== generation || !openState.current) return;
			pending = false;
			errorMessage = confirmationError(error);
			queueMicrotask(() => action?.focus({ preventScroll: true }));
			onConfirmError?.(error);
		}
	}

	const context: ZPopconfirmContext = {
		cancel() {
			setOpen(false);
		},
		confirm(event) {
			void confirm(event);
		},
		get descriptionId() {
			return `${idBase}-description`;
		},
		get errorId() {
			return `${idBase}-error`;
		},
		get errorMessage() {
			return errorMessage;
		},
		get pending() {
			return pending;
		},
		setAction(next) {
			action = next;
		},
		get titleId() {
			return `${idBase}-title`;
		}
	};
	provideZPopconfirm(context);

	$effect(() => {
		const currentOpen = openState.current;
		if (!currentOpen && previousOpen) invalidateConfirmation();
		if (currentOpen && !previousOpen) errorMessage = undefined;
		previousOpen = currentOpen;
	});
	onDestroy(invalidateConfirmation);
</script>

<ZPopover {gutter} modal={false} onOpenChange={setOpen} open={openState.current} {placement}>
	{@render children?.()}
</ZPopover>
