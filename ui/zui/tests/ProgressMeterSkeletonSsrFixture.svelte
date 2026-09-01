<script lang="ts">
	import ZMeter from '../src/components/data-display/ZMeter.svelte';
	import ZProgress from '../src/components/data-display/ZProgress.svelte';
	import ZSkeleton from '../src/components/data-display/ZSkeleton.svelte';
</script>

<ZProgress label="Server line" max={20} min={10} tone="success" value={15} />
<ZProgress indeterminateText="Server waiting" label="Server circle" view="circle" />
<ZMeter high={80} label="Server capacity" low={35} optimum={20} value={72} />
<ZSkeleton animated={false} lines={3} width="12rem" />
