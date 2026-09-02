<script lang="ts">
	import { ZAlert, ZButton, ZLoadingBar, ZProvider, ZSpinner } from '../src/entrypoints/index.js';
	import type {
		LoadingBarController,
		LoadingBarState
	} from '../src/components/feedback/ZLoadingBar.svelte';

	let alertVisible = $state(true);
	let active = $state(false);
	let controller = $state<LoadingBarController | null>(null);
	let loadingState = $state<LoadingBarState>('idle');
	let value = $state<number | undefined>();
</script>

<ZAlert data-testid="alert-off" icon={null} live="off" title="Static guidance" tone="info">
	Static content.
</ZAlert>
<ZAlert data-testid="alert-polite" title="Saved" tone="success">Configuration saved.</ZAlert>
<ZAlert data-testid="alert-assertive" live="assertive" title="Failed" tone="danger">
	Deployment failed.
</ZAlert>
{#if alertVisible}
	<ZAlert
		data-testid="alert-dismissible"
		dismissible
		dismissLabel="Dismiss deployment warning"
		onDismiss={() => (alertVisible = false)}
		title="Expiring"
		tone="warning"
	>
		Certificate expires soon.
		{#snippet action()}<ZButton data-testid="alert-action" size="small">Renew</ZButton>{/snippet}
	</ZAlert>
{/if}
<output data-testid="alert-output">{alertVisible ? 'visible' : 'dismissed'}</output>

<ZSpinner data-testid="spinner-primary" label="Synchronizing" />
<ZSpinner aria-hidden="true" data-testid="spinner-hidden" label="Nested loading" tone="inherit" />
<ZSpinner data-testid="spinner-muted" label="Background task" tone="muted" />

<ZLoadingBar data-testid="loading-determinate" label="Release progress" value={42} />
<ZLoadingBar data-testid="loading-indeterminate" label="Connecting" />
<ZLoadingBar data-testid="loading-page" label="Navigation" mode="page" value={12} />
<ZLoadingBar data-testid="loading-error" label="Failed import" state="error" value={64} />
<ZLoadingBar
	bind:active
	bind:controller
	bind:state={loadingState}
	bind:value
	data-testid="loading-controller"
	finishDelay={20}
	label="Controller task"
/>
<ZButton data-testid="loading-start" onclick={() => controller?.start()}>Start</ZButton>
<ZButton data-testid="loading-update" onclick={() => controller?.update(48)}>Update</ZButton>
<ZButton data-testid="loading-finish" onclick={() => controller?.finish()}>Finish</ZButton>
<ZButton data-testid="loading-error-action" onclick={() => controller?.error()}>Error</ZButton>
<ZButton data-testid="loading-reset" onclick={() => controller?.reset()}>Reset</ZButton>
<output data-testid="loading-output">{active}:{loadingState}:{value ?? 'indeterminate'}</output>

<ZProvider direction="rtl" motion="reduced">
	<ZSpinner data-testid="spinner-reduced" label="Reduced spinner" />
	<ZLoadingBar data-testid="loading-reduced" label="Reduced loading" />
</ZProvider>
