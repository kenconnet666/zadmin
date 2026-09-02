<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		createToastQueue,
		ZAlert,
		ZButton,
		ZLoadingBar,
		ZResult,
		ZSpinner,
		ZToaster
	} from '../src/entrypoints/index.js';

	let alertVisible = $state(true);
	const queue = createToastQueue();
	queue.push({
		actionLabel: 'Inspect',
		description: 'All checks passed.',
		duration: null,
		id: 'persistent',
		title: 'Release ready',
		tone: 'success'
	});
	onDestroy(() => queue.dispose());
</script>

{#if alertVisible}
	<ZAlert
		title="Saved"
		tone="success"
		dismissible
		dismissLabel="Dismiss saved alert"
		onDismiss={() => (alertVisible = false)}>Production configuration is active.</ZAlert
	>
{/if}
<output data-testid="alert-output">{alertVisible ? 'visible' : 'dismissed'}</output>
<ZSpinner label="Synchronizing" data-testid="spinner" />
<ZLoadingBar label="Release progress" value={65} data-testid="loading-determinate" />
<ZLoadingBar label="Connecting" data-testid="loading-indeterminate" />
<ZResult title="Release complete" tone="success">Version 2.4.0 is live.</ZResult>
<ZButton
	onclick={() =>
		queue.push({ duration: 500, id: 'timed', title: 'Timed notification', tone: 'info' })}
	data-testid="add-timed-toast">Add timed toast</ZButton
>
<ZToaster {queue} label="Release notifications" />
