<script lang="ts">
	import { createToastQueue, ZButton, ZToaster } from '../src/entrypoints/index.js';

	const first = createToastQueue({ debugName: 'first' });
	const second = createToastQueue({ debugName: 'second' });
	let queue = $state(first);
	let swapped = $state(false);

	function replaceQueue(): void {
		queue = second;
		second.push({ duration: null, id: 'replacement', title: 'Replacement' });
		swapped = true;
	}
</script>

<ZButton data-testid="toast-replace" onclick={replaceQueue}>Replace queue</ZButton>
<output data-testid="toast-replacement-state">
	{swapped
		? `${first.diagnostics.connected}:${first.diagnostics.disposed}:${second.diagnostics.connected}`
		: 'initial'}
</output>
{#key queue}
	<ZToaster {queue} label="Replacement notifications" />
{/key}
