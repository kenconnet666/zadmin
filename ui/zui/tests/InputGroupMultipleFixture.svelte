<script lang="ts">
	import ZInput from '../src/components/input/ZInput.svelte';
	import ZInputGroup from '../src/components/input/ZInputGroup.svelte';
</script>

<ZInputGroup aria-label="Invalid multiple controls">
	<ZInput aria-label="First owner" />
	<ZInput aria-label="Second owner" />
</ZInputGroup>
