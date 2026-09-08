<script lang="ts">
	import ZNavigationMenu from '../src/components/compound/navigation-menu/ZNavigationMenu.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type {
		NavigationMenuEntry,
		NavigationMenuItem,
		NavigationMenuNavigateRequest
	} from '../src/runtime/collection/navigation-menu.js';
	import type { NavigationMenuItemContext } from '../src/components/compound/navigation-menu/context.js';

	type MenuKey = string | number;
	type ConsumerKey = 'consumer-panel' | 'consumer-one' | 'consumer-two' | 'consumer-three';
	type MenuHandle = {
		close(): void;
		collapse(key: MenuKey): void;
		expand(key: MenuKey): void;
		focus(key?: MenuKey): void;
	};

	const inlineItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{ key: 'inline-home', label: 'Home', href: '/inline-home' },
		{
			key: 'inline-projects',
			label: 'Projects',
			href: '/projects',
			children: [
				{ key: 1, label: 'Number project', href: '/projects/number' },
				{ key: '1', label: 'String project', href: '/projects/string' }
			]
		},
		{
			key: 'inline-resources',
			label: 'Resources',
			children: [{ key: 'inline-guides', label: 'Guides', href: '/guides' }]
		},
		{
			kind: 'group',
			key: 'inline-group',
			label: 'Workspace',
			children: [{ key: 'inline-settings', label: 'Settings', href: '/settings' }]
		},
		{ kind: 'separator', key: 'inline-separator' },
		{ key: 'inline-disabled', label: 'Disabled destination', href: '/disabled', disabled: true }
	];
	let inlineCurrent = $state<MenuKey | null>('inline-home');
	let inlineOpenKeys = $state<readonly MenuKey[]>([]);
	let inlineOpenChanges = $state(0);
	let inlineMenu = $state<MenuHandle>();

	const horizontalItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{ key: 'horizontal-home', label: 'Horizontal home', href: '/horizontal-home' },
		{
			key: 'horizontal-products',
			label: 'Products',
			href: '/products',
			children: [
				{ key: 'horizontal-overview', label: 'Product overview', href: '/products/overview' },
				{ key: 'horizontal-pricing', label: 'Pricing', href: '/products/pricing' }
			]
		},
		{ key: 'native-modified', label: 'Modified native link', href: '/native-modified' },
		{
			key: 'native-window',
			label: 'New window link',
			href: '/native-window',
			target: '_blank',
			rel: 'noreferrer'
		},
		{
			key: 'native-external',
			label: 'External link',
			href: 'https://example.com/navigation',
			external: true
		}
	];
	let horizontalCurrent = $state<MenuKey | null>('horizontal-home');
	let horizontalOpenKeys = $state<readonly MenuKey[]>([]);
	let horizontalOpenChanges = $state(0);
	let navigateRequests = $state(0);
	let pendingKey = $state<MenuKey | null>(null);
	let pendingHref = $state('');
	let pendingClose: (() => void) | undefined;
	let nativeStates = $state<readonly string[]>([]);

	const verticalItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{
			key: 'vertical-admin',
			label: 'Administration',
			children: [
				{ key: 'vertical-users', label: 'Users', href: '/admin/users' },
				{ key: 'vertical-roles', label: 'Roles', href: '/admin/roles' }
			]
		},
		{ key: 'vertical-help', label: 'Help', href: '/help' }
	];

	const collapsedItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{
			key: 'collapsed-library',
			label: 'Component library',
			children: [
				{ key: 'collapsed-buttons', label: 'Buttons', href: '/library/buttons' },
				{ key: 'collapsed-inputs', label: 'Inputs', href: '/library/inputs' }
			]
		},
		{ key: 'collapsed-account', label: 'Account settings', href: '/account' }
	];

	const overflowItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{ key: 'overflow-one', label: 'Architecture dashboard', href: '/overflow/one' },
		{ key: 'overflow-two', label: 'Deployment environments', href: '/overflow/two' },
		{ key: 'overflow-three', label: 'Observability workspace', href: '/overflow/three' },
		{ key: 'overflow-four', label: 'Security configuration', href: '/overflow/four' },
		{ key: 'overflow-five', label: 'Organization settings', href: '/overflow/five' }
	];
	const singleItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{
			key: 'single-a',
			label: 'Single A',
			children: [
				{
					key: 'single-a-child',
					label: 'Single A child',
					children: [{ key: 'single-a-leaf', label: 'Single A leaf', href: '/single/a/leaf' }]
				}
			]
		},
		{
			key: 'single-b',
			label: 'Single B',
			children: [{ key: 'single-b-leaf', label: 'Single B leaf', href: '/single/b/leaf' }]
		}
	];
	let singleOpenKeys = $state<readonly MenuKey[]>(['single-a', 'single-a-child']);
	let singleOpenChanges = $state(0);
	const panelBoundaryItems: readonly NavigationMenuEntry<MenuKey>[] = [
		{
			key: 'panel-boundary',
			label: 'Panel boundary',
			children: [
				{ key: 'panel-boundary-first', label: 'Panel first', href: '/panel/first' },
				{ key: 'panel-boundary-last', label: 'Panel last', href: '/panel/last' }
			]
		}
	];

	let dynamicItems = $state<readonly NavigationMenuEntry<MenuKey>[]>([
		{ key: 'dynamic-before', label: 'Before', href: '/dynamic/before' },
		{ key: 'dynamic-middle', label: 'Middle', href: '/dynamic/middle' },
		{ key: 'dynamic-after', label: 'After', href: '/dynamic/after' }
	]);
	let dynamicMenu = $state<MenuHandle>();

	function navigate(request: NavigationMenuNavigateRequest<MenuKey>): void {
		request.preventDefault();
		navigateRequests += 1;
		pendingKey = request.key;
		pendingHref = request.href;
		pendingClose = request.close;
	}

	function captureNative(event: MouseEvent): void {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const anchor = target.closest<HTMLAnchorElement>('a');
		const href = anchor?.getAttribute('href');
		if (
			!href ||
			!['/native-modified', '/native-window', 'https://example.com/navigation'].includes(href)
		)
			return;
		nativeStates = [...nativeStates, `${href}:${event.defaultPrevented ? 'prevented' : 'native'}`];
		// Keep the browser fixture on this document after observing the component's decision.
		event.preventDefault();
	}

	export function confirmNavigation(): void {
		if (pendingKey === null || !pendingClose) return;
		horizontalCurrent = pendingKey;
		pendingClose();
		pendingClose = undefined;
	}
	export function expandInline(): void {
		inlineMenu?.expand('inline-projects');
	}
	export function collapseInline(): void {
		inlineMenu?.collapse('inline-projects');
	}
	export function closeInline(): void {
		inlineMenu?.close();
	}
	export function focusDynamicMiddle(): void {
		dynamicMenu?.focus('dynamic-middle');
	}
	export function removeDynamicMiddle(): void {
		dynamicItems = dynamicItems.filter((entry) => entry.key !== 'dynamic-middle');
	}
</script>

{#snippet consumerItem(
	item: NavigationMenuItem<ConsumerKey>,
	context: NavigationMenuItemContext<ConsumerKey>
)}
	<span id={`consumer-item-${String(item.key)}`} data-depth={context.depth}>{item.label}</span>
{/snippet}
{#snippet consumerStart(item: NavigationMenuItem<ConsumerKey>)}
	<span id={`consumer-start-${String(item.key)}`} aria-hidden="true">S</span>
{/snippet}
{#snippet consumerEnd(item: NavigationMenuItem<ConsumerKey>)}
	<span id={`consumer-end-${String(item.key)}`} aria-hidden="true">E</span>
{/snippet}
{#snippet consumerPanel()}
	<button id="consumer-panel-fixed" type="button">Custom panel action</button>
{/snippet}

<ZProvider motion="reduced">
	<ZNavigationMenu
		bind:this={inlineMenu}
		bind:openKeys={inlineOpenKeys}
		aria-label="Inline navigation"
		currentKey={inlineCurrent}
		items={inlineItems}
		overflow={false}
		onOpenKeysChange={() => (inlineOpenChanges += 1)}
	/>

	<ZNavigationMenu
		bind:openKeys={horizontalOpenKeys}
		aria-label="Horizontal navigation"
		currentKey={horizontalCurrent}
		items={horizontalItems}
		mode="horizontal"
		overflow={false}
		onNavigateRequest={navigate}
		onOpenKeysChange={() => (horizontalOpenChanges += 1)}
		onclick={captureNative}
	/>

	<ZNavigationMenu
		aria-label="Vertical navigation"
		items={verticalItems}
		mode="vertical"
		overflow={false}
	/>

	<div data-testid="collapsed-navigation-owner" style="inline-size: 64px">
		<ZNavigationMenu
			aria-label="Collapsed RTL navigation"
			collapsed
			dir="rtl"
			items={collapsedItems}
			overflow={false}
		/>
	</div>

	<div data-testid="overflow-navigation-owner" style="inline-size: 260px">
		<ZNavigationMenu
			aria-label="Overflow navigation"
			currentKey="overflow-one"
			items={overflowItems}
			mode="horizontal"
			overflowLabel="More overflow destinations"
		/>
	</div>

	<ZNavigationMenu
		bind:openKeys={singleOpenKeys}
		aria-label="Single expansion navigation"
		expandMode="single"
		items={singleItems}
		overflow={false}
		onOpenKeysChange={() => (singleOpenChanges += 1)}
	/>

	<div data-testid="panel-boundary-owner" style="inline-size: 800px">
		<ZNavigationMenu
			aria-label="Panel boundary navigation"
			items={panelBoundaryItems}
			mode="horizontal"
			overflowLabel="Panel boundary more"
		/>
	</div>
	<button data-testid="panel-boundary-after" type="button">After panel boundary</button>

	<div data-testid="consumer-navigation-owner" style="inline-size: 260px">
		<ZNavigationMenu
			aria-label="Consumer overflow navigation"
			items={[
				{ key: 'consumer-panel', label: 'Pinned custom panel', panel: consumerPanel },
				{ key: 'consumer-one', label: 'Consumer destination one', href: '/consumer/one' },
				{ key: 'consumer-two', label: 'Consumer destination two', href: '/consumer/two' },
				{ key: 'consumer-three', label: 'Consumer destination three', href: '/consumer/three' }
			]}
			mode="horizontal"
			overflowLabel="More consumer destinations"
			item={consumerItem}
			start={consumerStart}
			end={consumerEnd}
		/>
	</div>

	<ZNavigationMenu
		bind:this={dynamicMenu}
		aria-label="Dynamic navigation"
		items={dynamicItems}
		overflow={false}
	/>
</ZProvider>

<output data-testid="inline-navigation-output"
	>{String(inlineCurrent)}|{inlineOpenKeys.map(String).join(',')}|{inlineOpenChanges}</output
>
<output data-testid="horizontal-navigation-output"
	>{String(horizontalCurrent)}|{horizontalOpenKeys
		.map(String)
		.join(',')}|{navigateRequests}|{String(pendingKey)}|{pendingHref}</output
>
<output data-testid="native-navigation-output">{nativeStates.join('|')}</output>
<output data-testid="horizontal-open-output"
	>{horizontalOpenKeys.map(String).join(',')}:{horizontalOpenChanges}</output
>
<output data-testid="single-navigation-output"
	>{singleOpenKeys.map(String).join(',')}:{singleOpenChanges}</output
>
