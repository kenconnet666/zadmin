<script lang="ts">
	import {
		ZButton,
		ZDescriptionList,
		ZLink,
		ZList,
		ZProvider,
		ZTag,
		ZText
	} from '../src/entrypoints/index.js';

	const listItems = [
		{ key: 1, label: 'Numeric one', description: 'number key' },
		{ key: '1', label: 'String one', description: 'string key' }
	] as const;
	const descriptions = [
		{ key: 1, term: 'Numeric one', description: 'number key' },
		{ key: '1', term: 'String one', description: 'string key' }
	] as const;
	let listRef = $state<HTMLUListElement | HTMLOListElement | null>(null);
	let descriptionRef = $state<HTMLDListElement | null>(null);
	let actions = $state(0);
</script>

<ZList bind:ref={listRef} data-testid="display-list" items={listItems}>
	{#snippet item(entry)}
		<ZText>{entry.label} <ZTag>{typeof entry.key}</ZTag></ZText>
	{/snippet}
	{#snippet action()}<ZButton size="small" onclick={() => (actions += 1)}>Action</ZButton>{/snippet}
</ZList>

<ZList data-testid="display-ordered" items={listItems} ordered reversed start={7} type="I" />

<ZList aria-label="Manual nested list" data-testid="display-manual-list">
	<li>
		Manual parent
		<ZList items={[{ key: 'child', label: 'Nested child' }]} />
	</li>
</ZList>

<ZList
	aria-label="Empty list"
	data-testid="display-empty-list"
	emptyText="Nothing here"
	items={[]}
/>
<ZList
	aria-label="Loading list"
	data-testid="display-loading-list"
	items={listItems}
	loading
	loadingCount={2}
/>

<ZDescriptionList
	bind:ref={descriptionRef}
	aria-label="Typed descriptions"
	data-testid="display-descriptions"
	items={descriptions}
>
	{#snippet term(entry)}<ZText weight="semibold">{entry.term}</ZText>{/snippet}
	{#snippet description(entry)}<ZTag>{entry.description}</ZTag>{/snippet}
	{#snippet action(entry)}
		<ZLink href={`#description-${String(entry.key)}`}>Open</ZLink>
	{/snippet}
</ZDescriptionList>

<ZDescriptionList aria-label="Manual descriptions" data-testid="display-manual-descriptions">
	<dt>Manual term</dt>
	<dd>Manual description</dd>
</ZDescriptionList>

<ZDescriptionList
	aria-label="Empty descriptions"
	data-testid="display-empty-descriptions"
	emptyText="No metadata"
	items={[]}
/>
<ZDescriptionList
	aria-label="Loading descriptions"
	data-testid="display-loading-descriptions"
	items={descriptions}
	loading
	loadingCount={2}
/>

<ZProvider direction="rtl">
	<div data-testid="display-rtl-owner" style="inline-size: 18rem;">
		<ZDescriptionList
			aria-label="RTL descriptions"
			data-testid="display-rtl-descriptions"
			items={[
				{
					key: 'long',
					term: 'معرّف طويل',
					description: 'production-platform/services/reporting/extremely-long-resource-identifier'
				}
			]}
		/>
	</div>
</ZProvider>

<output data-testid="display-collections-output">
	{actions}:{listRef?.tagName ?? 'none'}:{descriptionRef?.tagName ?? 'none'}
</output>
