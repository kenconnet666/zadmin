<script module lang="ts">
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { NavigationMenuItem } from '../../../runtime/collection/navigation-menu.js';
	import type { NavigationMenuContext } from './context.js';
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	import ZNavLink from '../../navigation/ZNavLink.svelte';
	import ZIcon from '../../gene/ZIcon.svelte';
	import ZText from '../../gene/ZText.svelte';
	import ZPopoverContent from '../popover/ZPopoverContent.svelte';
	import { useZPopover } from '../popover/context.svelte.js';
	import { getActiveElement, isDomHtmlElement } from '../../../runtime/layer/dom-realm.js';
	import NavigationList from './NavigationList.svelte';
	import NavigationInlinePanel from './NavigationInlinePanel.svelte';
	let {
		menu,
		entry,
		floating = false
	}: {
		menu: NavigationMenuContext<TKey>;
		entry: NavigationMenuItem<TKey>;
		floating?: boolean;
	} = $props();
	const popover = floating ? useZPopover() : undefined;
	let primary = $state<HTMLElement | null>(null);
	let disclosure = $state<HTMLButtonElement | null>(null);
	let panel = $state<HTMLDivElement | null>(null);
	const record = $derived(menu.record(entry.key));
	const info = $derived(menu.itemContext(entry.key));
	const contentId = $derived(popover?.contentId ?? menu.id(entry.key, 'content'));
	$effect(() => menu.register(entry.key, primary, disclosure));
	$effect(() =>
		menu.registerPanel(
			entry.key,
			panel,
			popover ? (target) => popover.setRestoreTarget(target) : undefined
		)
	);
	$effect(() => {
		if (!popover) return;
		const target = disclosure ?? primary;
		popover.setTrigger(target);
		return () => {
			if (popover.trigger === target) popover.setTrigger(null);
		};
	});
	$effect(() => {
		if (popover?.open) popover.setRestoreTarget(disclosure ?? primary);
	});
</script>

{#snippet labelContent()}{@render menu.item?.(entry, info)}{/snippet}
{#snippet start()}
	{#if menu.start}{@render menu.start(entry, info)}{:else if entry.icon}<ZIcon
			name={entry.icon}
			size={menu.size}
		/>{/if}
{/snippet}
{#snippet end()}{@render menu.end?.(entry, info)}{/snippet}
{#snippet contents()}
	{#if entry.panel}{@render entry.panel(menu.panelContext(entry.key))}
	{:else if entry.children?.length}<NavigationList {menu} entries={entry.children} />
	{:else}<ZText tone="muted">{menu.emptyLabel}</ZText>{/if}
{/snippet}
<ZNavLink
	bind:ref={primary}
	bind:disclosureRef={disclosure}
	id={menu.id(entry.key, entry.href ? 'primary' : 'disclosure')}
	disclosureId={menu.id(entry.key, 'disclosure')}
	label={entry.label}
	labelContent={menu.item ? labelContent : undefined}
	description={entry.description}
	start={menu.start || entry.icon ? start : undefined}
	end={menu.end ? end : undefined}
	href={entry.href}
	target={entry.target}
	rel={entry.rel}
	external={entry.external}
	active={info.current}
	disabled={info.disabled}
	expanded={record.branch ? info.expanded : undefined}
	contentId={record.branch ? contentId : undefined}
	onExpandedChange={record.branch ? (open) => menu.setExpanded(entry.key, open) : undefined}
	size={menu.size}
	tone={menu.tone}
	variant={menu.variant}
	compact={menu.compact && record.branches.length === 0}
	dir={menu.direction}
	title={menu.compact ? entry.label : undefined}
	data-current-ancestor={info.currentAncestor || undefined}
	onclick={(event) => menu.navigate(entry.key, event)}
	onkeydown={(event) => menu.keydown(entry.key, event)}
/>
{#if record.branch}
	{#if popover}
		<ZPopoverContent
			bind:ref={panel}
			role="region"
			ariaLabelledBy={menu.id(entry.key, 'disclosure')}
			data-slot="panel"
			initialFocus={() => menu.initialFocus(entry.key, panel)}
			onFocusOutside={(event) => {
				if (!popover.open) return;
				event.preventDefault();
				const target = panel ? getActiveElement(panel) : event.originalEvent.target;
				menu.setExpanded(
					entry.key,
					false,
					undefined,
					isDomHtmlElement(target) ? target : undefined
				);
			}}
			onkeydown={(event) => menu.panelKeydown(entry.key, panel, event)}
		>
			{@render contents()}
		</ZPopoverContent>
	{:else}
		<NavigationInlinePanel
			bind:ref={panel}
			id={contentId}
			open={info.expanded}
			beforeClose={(node) => menu.returnFocus(entry.key, node)}
		>
			{@render contents()}
		</NavigationInlinePanel>
	{/if}
{/if}
