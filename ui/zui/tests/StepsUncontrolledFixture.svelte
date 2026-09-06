<script lang="ts">
	import ZSteps from '../src/components/navigation/ZSteps.svelte';
	let initial = $state('one');
	let changes = $state(0);
	let api: { reset(): void };
	const items = [
		{ key: 'one', title: 'One', clickable: true },
		{ key: 'two', title: 'Two', clickable: true },
		{ key: 'three', title: 'Three', clickable: true }
	];
	export function changeInitial(): void {
		initial = 'three';
	}
	export function reset(): void {
		api.reset();
	}
</script>

<form data-testid="steps-outer-form">
	<ZSteps
		bind:this={api}
		{items}
		defaultCurrentKey={initial}
		onCurrentKeyChange={() => (changes += 1)}
		aria-label="Uncontrolled steps"
	/>
	<output>{changes}</output>
</form>
