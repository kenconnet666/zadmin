<script lang="ts">
	import { lifecycleEvents } from './lifecycle-tracker.ts';

	let count = $state(0);

	export function onLoad(): void {
		lifecycleEvents.push('page:load');
	}

	export function onReady(): void {
		lifecycleEvents.push('page:ready');
	}

	export function onUnload(): void {
		lifecycleEvents.push('page:unload');
	}
</script>

<view><text>runtime:{count}</text><button onclick={() => (count += 1)}>add</button></view>
