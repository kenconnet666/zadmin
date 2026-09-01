<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { CommandShortcut } from '../../runtime/command.js';
	import type { ZDialogContentProps } from '../compound/dialog/ZDialogContent.svelte';
	import type { CommandActionEvent, CommandItem } from './ZCommand.svelte';

	export interface ZCommandPaletteProps {
		readonly class?: ZDialogContentProps['class'];
		readonly closeLabel?: string;
		readonly defaultOpen?: boolean;
		readonly defaultQuery?: string;
		readonly description?: string;
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly inputLabel?: string;
		readonly items: readonly CommandItem[];
		readonly listLabel?: string;
		readonly onAction?: (event: CommandActionEvent) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onQueryChange?: (query: string) => void;
		open?: boolean;
		readonly placeholder?: string;
		query?: string;
		ref?: HTMLDivElement | null;
		readonly resetQueryOnClose?: boolean;
		readonly shortcut?: CommandShortcut;
		readonly showTrigger?: boolean;
		readonly style?: ZDialogContentProps['style'];
		readonly title?: string;
		readonly trigger?: Snippet;
		readonly triggerLabel?: string;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'command-palette',
		importStatement: "import { ZCommandPalette } from '@zadmin/zui';",
		name: 'ZCommandPalette',
		bindings: [
			{ description: 'Dialog打开状态。', name: 'open', type: 'boolean' },
			{ description: 'Command查询。', name: 'query', type: 'string' },
			{ description: '真实dialog content引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZCommand', 'ZDialog', 'FocusScope', 'DismissableLayer', 'shortcut matcher'],
		events: [
			{ description: '打开状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' },
			{ description: '查询变化。', name: 'onQueryChange', type: '(query: string) => void' },
			{
				description: 'Command action；preventDefault可阻止Palette自动关闭。',
				name: 'onAction',
				type: '(event: CommandActionEvent) => void'
			}
		],
		keyboard: [
			{ description: '可选平台感知全局快捷键打开。', key: 'Configured shortcut' },
			{ description: '复用ZCommand导航并提交。', key: 'Arrow keys / Home / End / Enter' },
			{ description: '关闭顶层Dialog并恢复Trigger焦点。', key: 'Escape' },
			{ description: '在输入和关闭按钮间循环。', key: 'Tab / Shift+Tab' }
		],
		parts: [
			{ description: '可选Dialog Trigger。', name: 'trigger' },
			{ description: '模态overlay。', name: 'overlay' },
			{ description: 'Dialog content。', name: 'content' },
			{ description: 'ZCommand内核。', name: 'command' }
		],
		props: [
			{
				default: '必填',
				description: '传给ZCommand的命令集合。',
				name: 'items',
				required: true,
				type: 'readonly CommandItem[]'
			},
			{
				bindable: true,
				default: 'false',
				description: '模态打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				bindable: true,
				default: "''",
				description: 'Command查询。',
				name: 'query',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '显式平台感知全局快捷键；不配置则不监听document。',
				name: 'shortcut',
				type: 'CommandShortcut'
			},
			{
				default: 'true',
				description: '关闭时恢复defaultQuery。',
				name: 'resetQueryOnClose',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '渲染内置Dialog Trigger。',
				name: 'showTrigger',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '内置Trigger按钮内容。', name: 'trigger', type: 'Snippet' }],
		source: 'ui/zui/src/components/navigation/ZCommandPalette.svelte',
		states: [{ description: 'Dialog打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '复用Command相关性与Dialog模态生命周期、支持显式快捷键的Command Palette。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { matchesCommandShortcut } from '../../runtime/command.js';
	import ZDialog from '../compound/dialog/ZDialog.svelte';
	import ZDialogClose from '../compound/dialog/ZDialogClose.svelte';
	import ZDialogContent from '../compound/dialog/ZDialogContent.svelte';
	import ZDialogDescription from '../compound/dialog/ZDialogDescription.svelte';
	import ZDialogOverlay from '../compound/dialog/ZDialogOverlay.svelte';
	import ZDialogTitle from '../compound/dialog/ZDialogTitle.svelte';
	import ZDialogTrigger from '../compound/dialog/ZDialogTrigger.svelte';
	import ZCommand from './ZCommand.svelte';

	let {
		class: className,
		closeLabel,
		defaultOpen = false,
		defaultQuery = '',
		description,
		disabled = false,
		emptyText,
		inputLabel,
		items,
		listLabel,
		onAction,
		onOpenChange,
		onQueryChange,
		open = $bindable(),
		placeholder,
		query = $bindable(),
		ref = $bindable(null),
		resetQueryOnClose = true,
		shortcut,
		showTrigger = true,
		style,
		title,
		trigger,
		triggerLabel
	}: ZCommandPaletteProps = $props();
	const zui = useZui();
	const resolvedCloseLabel = $derived(closeLabel ?? zui.localePack.common.close);
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.command.empty);
	const resolvedInputLabel = $derived(inputLabel ?? zui.localePack.command.inputLabel);
	const resolvedListLabel = $derived(listLabel ?? zui.localePack.command.listLabel);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.command.placeholder);
	const resolvedTitle = $derived(title ?? zui.localePack.command.paletteTitle);
	const resolvedTriggerLabel = $derived(triggerLabel ?? zui.localePack.command.paletteTrigger);
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const queryState = new ControllableState<string>({
		defaultValue: () => defaultQuery,
		onChange: () => onQueryChange,
		read: () => query,
		write: (next) => (query = next)
	});
	function setOpen(next: boolean): void {
		if (disabled && next) return;
		if (!next && resetQueryOnClose) queryState.reset();
		openState.setFromUser(next);
	}
	function handleAction(event: CommandActionEvent): void {
		onAction?.(event);
		if (!event.defaultPrevented) setOpen(false);
	}
	$effect(() => {
		if (!shortcut || disabled || typeof document === 'undefined') return;
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.repeat || !matchesCommandShortcut(event, shortcut)) return;
			event.preventDefault();
			setOpen(true);
		};
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<ZDialog onOpenChange={setOpen} open={openState.current}>
	{#if showTrigger}
		<ZDialogTrigger aria-label={resolvedTriggerLabel} {disabled}>
			{#if trigger}{@render trigger()}{:else}{resolvedTriggerLabel}{/if}
		</ZDialogTrigger>
	{/if}
	<ZDialogOverlay data-slot="overlay" />
	<ZDialogContent bind:ref class={className} {style} data-slot="content">
		<ZDialogTitle>{resolvedTitle}</ZDialogTitle>
		{#if description}<ZDialogDescription>{description}</ZDialogDescription>{/if}
		<ZCommand
			autofocus
			data-slot="command"
			{defaultQuery}
			{disabled}
			emptyText={resolvedEmptyText}
			inputLabel={resolvedInputLabel}
			{items}
			listLabel={resolvedListLabel}
			onAction={handleAction}
			onQueryChange={(next) => queryState.setFromUser(next)}
			placeholder={resolvedPlaceholder}
			query={queryState.current}
		/>
		<ZDialogClose variant="secondary">{resolvedCloseLabel}</ZDialogClose>
	</ZDialogContent>
</ZDialog>
