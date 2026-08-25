<script lang="ts">
	import { getWeChatPlatform } from '../src/platform/index.ts';
	import { invokeRuntimeNavigation, lifecycleEvents } from './lifecycle-tracker.ts';

	let count = $state(0);
	const platform = getWeChatPlatform();

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

<view>
	<text>runtime:{count} · platform:{platform.raw === undefined ? 'missing' : 'ready'}</text>
	<button id="runtime-add" onclick={() => (count += 1)}>add</button>
	<button id="runtime-navigate" onclick={invokeRuntimeNavigation}>navigate</button>
</view>
