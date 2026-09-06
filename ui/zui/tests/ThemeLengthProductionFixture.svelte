<script lang="ts">
	import {
		defaultTheme,
		extendTheme,
		ZProvider,
		ZSkeleton,
		ZTimeline
	} from '../src/entrypoints/index.js';

	let { stringLengths = false }: { stringLengths?: boolean } = $props();
	const theme = $derived(
		extendTheme(defaultTheme, {
			size: stringLengths
				? { medium: 'var(--theme-test-size)', skeletonLine: '0.75rem', small: 'calc(1rem + 9px)' }
				: { medium: 43, skeletonLine: 11, small: 31 }
		})
	);
</script>

<ZProvider {theme} motion="reduced">
	<div style="--theme-test-size: 43px; width: 500px;">
		<ZSkeleton data-testid="theme-length-circle" shape="circle" />
		<ZSkeleton data-testid="theme-length-rectangle" shape="rectangle" />
		<ZSkeleton data-testid="theme-length-lines" lines={2} />
		<ZSkeleton data-testid="theme-length-explicit" height={23} shape="circle" width="37px" />
		<ZTimeline
			data-testid="theme-length-timeline"
			items={[{ key: 'step', title: 'Deploy complete' }]}
			label="Theme length timeline"
		/>
	</div>
</ZProvider>
