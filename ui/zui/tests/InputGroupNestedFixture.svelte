<script lang="ts">
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZInputGroup from '../src/components/input/ZInputGroup.svelte';
</script>

<ZInputGroup aria-label="Outer group">
	<ZInputGroup aria-label="Inner group"><ZInput aria-label="Nested input" /></ZInputGroup>
</ZInputGroup>
