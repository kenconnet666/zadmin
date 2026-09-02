<script lang="ts">
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import Rocket from '@lucide/svelte/icons/rocket';
	import ZEmpty from '../src/components/data-display/ZEmpty.svelte';
	import ZResult from '../src/components/feedback/ZResult.svelte';
	import ZButton from '../src/components/gene/ZButton.svelte';

	let resultActions = $state(0);
	let emptyActions = $state(0);
	const resultTones = ['info', 'success', 'warning', 'danger'] as const;
</script>

{#each resultTones as tone (tone)}
	<ZResult
		data-testid={`result-${tone}`}
		headingLevel={tone === 'info' ? 1 : 4}
		title={`Result ${tone}`}
		{tone}
	>
		{#snippet content()}Default {tone} result content{/snippet}
	</ZResult>
{/each}

<ZResult
	contentAlign="start"
	data-native-result="true"
	data-testid="result-detailed"
	headingLevel={6}
	title="Detailed result"
	tone="danger"
>
	{#snippet icon()}<Rocket aria-hidden="true" size={48} />{/snippet}
	{#snippet content()}
		Detailed release-candidate-with-an-intentionally-long-name result content that must wrap safely.
	{/snippet}
	{#snippet actions()}
		<ZButton data-testid="result-action" onclick={() => (resultActions += 1)}>Retry</ZButton>
		<ZButton variant="secondary">Download report</ZButton>
	{/snippet}
</ZResult>
<ZResult data-testid="result-no-icon" icon={null} title="Text-only result" />

<ZEmpty data-testid="empty-default" headingLevel={2} title="No records">
	{#snippet description()}The collection has no records.{/snippet}
	{#snippet actions()}
		<ZButton data-testid="empty-action" onclick={() => (emptyActions += 1)}>Create record</ZButton>
	{/snippet}
</ZEmpty>
<ZEmpty data-native-empty="true" data-testid="empty-custom" headingLevel={5} title="No artifacts">
	{#snippet icon()}<PackageOpen aria-hidden="true" size={40} />{/snippet}
	{#snippet description()}
		No artifact matched environment-production-east-with-an-intentionally-long-name.
	{/snippet}
</ZEmpty>
<ZEmpty data-testid="empty-no-icon" icon={null} title="Completed collection" />
<output data-testid="result-empty-output">{resultActions}:{emptyActions}</output>
