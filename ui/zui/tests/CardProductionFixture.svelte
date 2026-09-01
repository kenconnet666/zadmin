<script lang="ts">
	import { ZButton, ZCard, ZText } from '../src/entrypoints/index.js';

	let actionCount = $state(0);
	let loading = $state(false);
</script>

<section data-testid="card-production-fixture">
	<ZCard data-testid="card-production-default">
		<ZText>Neutral surface</ZText>
	</ZCard>
	<ZCard
		as="article"
		aria-labelledby="card-production-title"
		data-testid="card-production-article"
		{loading}
		variant="outlined"
	>
		{#snippet media()}<div data-testid="card-production-media">Media</div>{/snippet}
		{#snippet header()}<h2 id="card-production-title">Release</h2>{/snippet}
		<p data-testid="card-production-body">Production body</p>
		{#snippet footer()}<span data-testid="card-production-footer">Updated now</span>{/snippet}
		{#snippet actions()}
			<ZButton data-testid="card-production-action" onclick={() => (actionCount += 1)}>
				Acknowledge
			</ZButton>
		{/snippet}
	</ZCard>
	<ZButton data-testid="card-production-loading" onclick={() => (loading = !loading)}>
		Toggle loading
	</ZButton>
	<output data-testid="card-production-output">{actionCount}:{loading}</output>
</section>
