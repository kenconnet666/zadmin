<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { CommandShortcut } from '../../runtime/command.js';
	import type { ZDialogContentProps } from '../compound/dialog/ZDialogContent.svelte';
	import type { CommandActionEvent, CommandItem } from './ZCommand.svelte';

	export type CommandPaletteShortcutTarget = Document | Element | ShadowRoot;

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
		readonly shortcutTarget?: CommandPaletteShortcutTarget | null;
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
			{ description: '可选平台感知快捷键在所属DOM边界内打开。', key: 'Configured shortcut' },
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
				default: 'Provider localePack.common.close',
				description: 'Dialog内显式关闭按钮文本。',
				name: 'closeLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.command.paletteTitle',
				description: 'Dialog的可访问标题与可见标题。',
				name: 'title',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '可选Dialog描述；缺省时不渲染description节点。',
				name: 'description',
				type: 'string'
			},
			{
				bindable: true,
				default: 'false',
				description: '模态打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始Dialog状态。',
				name: 'defaultOpen',
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
				default: "''",
				description: '非受控初始查询，也是resetQueryOnClose的恢复值。',
				name: 'defaultQuery',
				type: 'string'
			},
			{
				default: 'false',
				description: '阻止Trigger与shortcut打开，并禁用内部Command。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.command.empty',
				description: '内部Command没有匹配项时的状态文本。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: 'Provider localePack.command.inputLabel',
				description: '内部Command查询输入的可访问名称。',
				name: 'inputLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.command.listLabel',
				description: '内部Command listbox的可访问名称。',
				name: 'listLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.command.placeholder',
				description: '内部Command查询输入提示。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'Provider localePack.command.paletteTrigger',
				description: '内置Dialog Trigger的可访问名称与默认文本。',
				name: 'triggerLabel',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '显式平台感知快捷键；不配置则不安装监听器。',
				name: 'shortcut',
				type: 'CommandShortcut'
			},
			{
				default: 'Trigger或Portal所在DOM root',
				description:
					'快捷键监听边界；显式传入Document、Element或ShadowRoot可覆盖Trigger或Portal推导结果，null禁用作用域。',
				name: 'shortcutTarget',
				type: 'Document | Element | ShadowRoot | null'
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
		status: 'stable',
		summary: '复用Command相关性与Dialog模态生命周期、支持DOM realm安全快捷键的Command Palette。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { matchesCommandShortcut } from '../../runtime/command.js';
	import { isDomDocument, isDomElement, isDomShadowRoot } from '../../runtime/layer/dom-realm.js';
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
		shortcutTarget,
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
	let triggerRef = $state<HTMLButtonElement | null>(null);

	function inferredShortcutTarget(): Document | ShadowRoot | null {
		for (const candidate of [triggerRef, ref]) {
			const root = candidate?.getRootNode();
			if (isDomDocument(root) || isDomShadowRoot(root)) return root;
		}
		const portalContainer = zui.portalContainer;
		if (isDomDocument(portalContainer) || isDomShadowRoot(portalContainer)) {
			return portalContainer;
		}
		if (isDomElement(portalContainer)) {
			const root = portalContainer.getRootNode();
			if (isDomDocument(root) || isDomShadowRoot(root)) return root;
		}
		return null;
	}

	function resolvedShortcutTarget(): CommandPaletteShortcutTarget | null {
		if (shortcutTarget === null) return null;
		if (shortcutTarget !== undefined) {
			if (
				!isDomDocument(shortcutTarget) &&
				!isDomElement(shortcutTarget) &&
				!isDomShadowRoot(shortcutTarget)
			) {
				throw new TypeError(
					'CommandPalette shortcutTarget must be a Document, Element, ShadowRoot or null.'
				);
			}
			return shortcutTarget;
		}
		return inferredShortcutTarget();
	}

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
		const target = resolvedShortcutTarget();
		if (!shortcut || disabled || !target) return;
		const handleKeydown: EventListener = (event) => {
			const keyboardEvent = event as KeyboardEvent;
			if (keyboardEvent.repeat || !matchesCommandShortcut(keyboardEvent, shortcut)) return;
			keyboardEvent.preventDefault();
			setOpen(true);
		};
		target.addEventListener('keydown', handleKeydown);
		return () => target.removeEventListener('keydown', handleKeydown);
	});
</script>

<ZDialog onOpenChange={setOpen} open={openState.current}>
	{#if showTrigger}
		<ZDialogTrigger bind:ref={triggerRef} aria-label={resolvedTriggerLabel} {disabled}>
			{#if trigger}{@render trigger()}{:else}{resolvedTriggerLabel}{/if}
		</ZDialogTrigger>
	{/if}
	<ZDialogOverlay data-slot="overlay" />
	<ZDialogContent bind:ref class={className} {style} data-slot="content">
		<ZDialogTitle>{resolvedTitle}</ZDialogTitle>
		{#if description}
			<ZDialogDescription>{description}</ZDialogDescription>
		{/if}
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
