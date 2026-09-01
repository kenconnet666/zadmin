<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		createToastQueue,
		ZButton,
		ZProvider,
		ZToaster
	} from '../src/entrypoints/index.js';

	const queue = createToastQueue({ maxVisible: 1 });
	const reducedQueue = createToastQueue({ maxVisible: 1 });
	let portalTarget = $state<HTMLDivElement | null>(null);
	let actions = $state(0);
	const phases = $derived(queue.items.map((item) => `${item.id}:${item.phase}`).join('|'));

	function addPair(): void {
		queue.push({
			actionLabel: 'Continue',
			duration: null,
			id: 'first',
			onAction: () => (actions += 1),
			title: 'First'
		});
		queue.push({ duration: 500, id: 'second', title: 'Second' });
	}

	onDestroy(() => {
		queue.dispose();
		reducedQueue.dispose();
	});
</script>

<ZButton data-testid="toast-add-pair" onclick={addPair}>Add pair</ZButton>
<ZButton
	data-testid="toast-add-reduced"
	onclick={() => reducedQueue.push({ duration: null, id: 'reduced', title: 'Reduced' })}
	>Add reduced</ZButton
>
<output data-testid="toast-lifecycle-output">{phases}:{actions}</output>
<div bind:this={portalTarget} data-testid="toast-portal-target"></div>

<ZProvider portalContainer={portalTarget}>
	<ZToaster {queue} maxVisible={1} label="Lifecycle notifications" />
</ZProvider>
<ZProvider motion="reduced" portalContainer={portalTarget}>
	<ZToaster queue={reducedQueue} maxVisible={1} label="Reduced notifications" />
</ZProvider>
