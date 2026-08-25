<script lang="ts">
	import { lifecycleEvents } from './lifecycle-tracker.ts';

	export function onLaunch(): string {
		lifecycleEvents.push('app:launch');
		return 'launched';
	}

	export function onShow(): void {
		lifecycleEvents.push('app:show');
	}

	export function onHide(): void {
		lifecycleEvents.push('app:hide');
	}
</script>
