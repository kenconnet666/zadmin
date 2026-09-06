<script lang="ts">
	import ZAnchor from '../src/components/navigation/ZAnchor.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { AnchorItem, AnchorNavigateRequest } from '../src/runtime/navigation-anchor.js';
	let { mode = 'managed' }: { mode?: 'managed' | 'native' } = $props();
	let viewport = $state<HTMLDivElement | null>(null);
	let active = $state<'alpha' | 'beta' | 'gamma' | null>(null);
	let canceled = $state(false);
	let second = $state(true);
	let disabled = $state(false);
	let requests = $state(0);
	let motion = $state<'full' | 'reduced'>('reduced');
	let nav = $state<{ refresh(): void } | null>(null);
	const entries = $derived<readonly AnchorItem<'alpha' | 'beta' | 'gamma'>[]>([
		{
			key: 'alpha',
			label: 'Alpha',
			href: '#anchor-fixture-alpha',
			children: second ? [{ key: 'beta', label: 'Beta', href: '#anchor-fixture-beta' }] : []
		},
		{ key: 'gamma', label: 'Gamma', href: '#anchor-fixture-gamma' }
	]);
	function request(event: AnchorNavigateRequest<'alpha' | 'beta' | 'gamma'>): void {
		requests += 1;
		if (canceled) event.preventDefault();
	}
	export function removeSecond(): void {
		second = false;
	}
	export function setDisabled(value: boolean): void {
		disabled = value;
	}
	export function refresh(): void {
		nav?.refresh();
	}
</script>

<ZProvider {motion}>
	<button data-testid="anchor-cancel" onclick={() => (canceled = !canceled)}>Toggle cancel</button>
	<button
		data-testid="anchor-motion"
		onclick={() => (motion = motion === 'reduced' ? 'full' : 'reduced')}>Motion</button
	>
	<ZAnchor
		bind:this={nav}
		items={entries}
		bind:activeKey={active}
		scrollContainer={viewport}
		history={false}
		behavior={mode === 'native' ? false : 'smooth'}
		{disabled}
		onNavigateRequest={request}
		aria-label="Fixture contents"
		data-testid="anchor-nav"
	/>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (the named native scroll owner needs keyboard access) -->
	<div
		bind:this={viewport}
		data-testid="anchor-viewport"
		role="region"
		aria-label="Fixture article"
		tabindex="0"
		style="height:240px;width:320px;max-width:100%;overflow:auto;border:3px solid;scroll-padding-top:20px;scroll-behavior:smooth;"
	>
		<section id="anchor-fixture-alpha" style="height:300px;scroll-margin-top:12px;">Alpha</section>
		{#if second}<section id="anchor-fixture-beta" style="height:300px;scroll-margin-top:12px;">
				Beta
			</section>{/if}
		<section id="anchor-fixture-gamma" style="height:300px;scroll-margin-top:12px;">Gamma</section>
	</div>
	<output data-testid="anchor-state" data-active={active} data-requests={requests}>{active}</output>
</ZProvider>
