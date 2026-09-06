<script lang="ts">
	import ZCheckboxGroup from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
	import ZCheckboxGroupItem from '../src/components/compound/checkbox-group/ZCheckboxGroupItem.svelte';
</script>

<ZCheckboxGroup aria-label="Required compound group" name="compound-choice" required>
	<ZCheckboxGroupItem data-testid="compound-disabled" value="disabled" disabled>
		Disabled first
	</ZCheckboxGroupItem>
	<ZCheckboxGroupItem data-testid="compound-first" value="first">First available</ZCheckboxGroupItem
	>
	<ZCheckboxGroupItem data-testid="compound-second" value="second"
		>Second available</ZCheckboxGroupItem
	>
</ZCheckboxGroup>
