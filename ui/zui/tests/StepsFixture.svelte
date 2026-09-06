<script lang="ts">
	import ZSteps, {
		type StepsItem,
		type StepRequestEvent,
		type StepsOrientation
	} from '../src/components/navigation/ZSteps.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { ZControlSize } from '../src/runtime/foundation/control-size.js';
	import { defaultTheme } from '../src/theme/default.js';
	import { extendTheme } from '../src/theme/define.js';

	let {
		size = 'medium',
		orientation = 'horizontal',
		direction = 'ltr',
		reduced = true
	}: {
		size?: ZControlSize;
		orientation?: StepsOrientation;
		direction?: 'ltr' | 'rtl';
		reduced?: boolean;
	} = $props();
	type Key = 1 | '1' | 'passive' | 'disabled' | 'loading' | 'link' | 'disabled-link';
	let items = $state<readonly StepsItem<Key>[]>([
		{ key: 1, title: 'First', description: 'Profile', status: 'complete', clickable: true },
		{ key: '1', title: 'Second', description: 'Configuration', clickable: true },
		{ key: 'passive', title: 'Passive', description: 'Information only' },
		{ key: 'disabled', title: 'Disabled', clickable: true, disabled: true },
		{ key: 'loading', title: 'Loading', clickable: true, loading: true },
		{ key: 'link', title: 'Route', href: '#steps-target' },
		{ key: 'disabled-link', title: 'Blocked route', href: '#steps-target', disabled: true }
	]);
	let current = $state<Key | null>(1);
	let requests = $state(0);
	let changes = $state(0);
	let cancel = $state(false);
	let api: { reset(): void };
	let scheme = $state(false);
	const theme = $derived(
		extendTheme(defaultTheme, {
			color: { primary: scheme ? '#663399' : '#123456', success: '#236734', danger: '#990033' }
		})
	);
	function request(event: StepRequestEvent<Key>): void {
		requests += 1;
		if (cancel) event.preventDefault();
	}
	export function cancelRequests(next: boolean): void {
		cancel = next;
	}
	export function choose(key: Key | null): void {
		current = key;
	}
	export function reset(): void {
		api.reset();
	}
	export function reorder(): void {
		items = [...items].reverse();
	}
	export function removeCurrent(): void {
		items = items.filter((entry) => !Object.is(entry.key, current));
	}
	export function swapTheme(): void {
		scheme = !scheme;
	}
</script>

<ZProvider {theme} {direction} motion={reduced ? 'reduced' : 'full'}>
	<div style="width:320px; max-width:100%" data-testid="steps-boundary">
		<ZSteps
			bind:this={api}
			bind:currentKey={current}
			{items}
			{size}
			{orientation}
			aria-label="Fixture steps"
			onStepRequest={request}
			onCurrentKeyChange={() => (changes += 1)}
		/>
	</div>
	<output data-testid="steps-events">{typeof current}:{current}:{requests}:{changes}</output>
	<div id="steps-target">Native link destination</div>
</ZProvider>
