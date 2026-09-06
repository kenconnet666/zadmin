<script lang="ts">
	import ZCopyButton from '../src/components/gene/ZCopyButton.svelte';
	let value = $state('Clipboard fixture\nsecond line');
	let copies = $state(0);
	let failures = $state(0);
	let cancel = $state(false);
	export function changeValue(next: string): void {
		value = next;
	}
	export function cancelCopy(next: boolean): void {
		cancel = next;
	}
</script>

<ZCopyButton
	{value}
	label="Copy example"
	copyingLabel="Copy example"
	copiedLabel="Copied example"
	errorLabel="Copy failed"
	timeout={0}
	onclick={(event) => {
		if (cancel) event.preventDefault();
	}}
	onCopy={() => (copies += 1)}
	onCopyError={() => (failures += 1)}
	data-testid="copy-fixture"
/>
<ZCopyButton value="Icon example" label="Copy icon example" iconOnly data-testid="copy-icon-only" />
<output data-testid="copy-events">{copies}:{failures}</output>
