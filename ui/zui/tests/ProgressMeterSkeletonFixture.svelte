<script lang="ts">
	import ZMeter from '../src/components/data-display/ZMeter.svelte';
	import ZProgress from '../src/components/data-display/ZProgress.svelte';
	import ZSkeleton from '../src/components/data-display/ZSkeleton.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
</script>

<ZProgress
	data-testid="progress-line-production"
	formatValue={(value, range) => `${value - range.min}/${range.max - range.min} shards`}
	label="Shard progress"
	max={20}
	min={10}
	tone="warning"
	value={17}
/>
<ZProgress
	data-testid="progress-circle-production"
	indeterminateText="Waiting for worker"
	label="Worker progress"
	tone="danger"
	view="circle"
/>
<ZMeter
	aria-describedby="meter-production-description"
	data-testid="meter-production"
	formatValue={(value, range, state) => `${value}/${range.max} ${state}`}
	high={80}
	label="Capacity"
	low={35}
	optimum={20}
	value={72}
/>
<span id="meter-production-description">Capacity thresholds</span>
<ZSkeleton data-testid="skeleton-lines-production" lines={3} width="16rem" />
<ZSkeleton animated={false} data-testid="skeleton-static-production" width="12rem" />
<ZProvider motion="reduced">
	<ZProgress data-testid="progress-reduced-production" label="Reduced progress" view="circle" />
	<ZSkeleton data-testid="skeleton-reduced-production" lines={2} width="14rem" />
</ZProvider>
