<script lang="ts">
	import ZEmpty from '../src/components/data-display/ZEmpty.svelte';
	import ZResult from '../src/components/feedback/ZResult.svelte';
</script>

<ZResult data-testid="ssr-result" headingLevel={1} title="Server result" tone="success">
	{#snippet content()}Server result content{/snippet}
</ZResult>
<ZResult data-testid="ssr-result-no-icon" headingLevel={6} icon={null} title="Nested result" />
<ZEmpty data-testid="ssr-empty" headingLevel={3} title="Server empty">
	{#snippet description()}Server empty description{/snippet}
</ZEmpty>
<ZEmpty data-testid="ssr-empty-no-icon" headingLevel={5} icon={null} title="Nested empty" />
