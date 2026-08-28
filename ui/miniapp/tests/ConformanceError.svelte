<script lang="ts">
	let { shouldThrow }: { shouldThrow: boolean } = $props();

	function content(): string {
		if (shouldThrow) throw new Error('fixture-boundary');
		return 'boundary-safe';
	}
</script>

<text>{content()}</text>
