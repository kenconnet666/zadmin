<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createToastQueue, ZToaster } from '../src/entrypoints/index.js';

	const queue = createToastQueue({ maxVisible: 2 });
	queue.push({ duration: null, id: 'polite', title: 'Server polite', tone: 'success' });
	queue.push({ duration: null, id: 'assertive', title: 'Server assertive', tone: 'danger' });
	onDestroy(() => queue.dispose());
</script>

<ZToaster {queue} maxVisible={2} label="Server notifications" />
