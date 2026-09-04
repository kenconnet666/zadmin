<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import ZButton from '../src/components/gene/ZButton.svelte';
	import ZToggleButton from '../src/components/gene/ZToggleButton.svelte';

	let loading = $state(false);
	let buttonClicks = $state(0);
	let pressed = $state(false);
	let pressedChanges = $state(0);
	let prevented = $state(false);
	let submissions = $state(0);
</script>

<form
	data-testid="button-form"
	onsubmit={(event) => {
		event.preventDefault();
		submissions += 1;
	}}
>
	<ZButton data-testid="button-default">Default action</ZButton>
	<ZButton data-testid="button-danger-secondary" tone="danger" variant="secondary">
		Danger secondary
	</ZButton>
	<ZButton data-testid="button-ghost" variant="ghost">Ghost action</ZButton>
	<ZButton aria-label="Favorite" data-testid="button-circle" shape="circle">
		<Star aria-hidden="true" size={16} />
	</ZButton>
	<ZButton
		data-testid="button-loading"
		{loading}
		loadingLabel="Saving deployment"
		onclick={() => (buttonClicks += 1)}
	>
		Save deployment
	</ZButton>
	<ZButton data-testid="button-submit" type="submit" variant="secondary">Submit form</ZButton>
</form>
<button data-testid="button-loading-on" type="button" onclick={() => (loading = true)}
	>Loading on</button
>
<button data-testid="button-loading-off" type="button" onclick={() => (loading = false)}
	>Loading off</button
>
<output data-testid="button-output">{loading}:{buttonClicks}:{submissions}</output>

<div data-testid="button-size-contract">
	<ZButton data-testid="button-size-small" size="small">Small</ZButton>
	<ZButton data-testid="button-size-medium" size="medium">Medium</ZButton>
	<ZButton data-testid="button-size-large" size="large">Large</ZButton>
</div>

<ZToggleButton
	bind:pressed
	data-testid="toggle-controlled"
	onPressedChange={() => (pressedChanges += 1)}
>
	Monitoring
</ZToggleButton>
<ZToggleButton aria-label="Favorite toggle" data-testid="toggle-icon" shape="square" tone="danger">
	<Star aria-hidden="true" size={16} />
</ZToggleButton>
<ZToggleButton data-testid="toggle-disabled" disabled>Disabled toggle</ZToggleButton>
<ZToggleButton
	data-testid="toggle-prevented"
	onclick={(event) => {
		event.preventDefault();
		prevented = true;
	}}
>
	Prevented toggle
</ZToggleButton>
<button data-testid="toggle-owner-on" type="button" onclick={() => (pressed = true)}
	>Owner on</button
>
<button data-testid="toggle-owner-off" type="button" onclick={() => (pressed = false)}
	>Owner off</button
>
<output data-testid="toggle-output">{pressed}:{pressedChanges}:{prevented}</output>
