<script lang="ts">
	import {
		ZAvatar,
		ZBadge,
		ZCard,
		ZDescriptionList,
		ZList,
		ZTag
	} from '../src/entrypoints/index.js';

	const listItems = [
		{ description: 'Create release assets', id: 'build', label: 'Build' },
		{ description: 'Verify production contracts', id: 'verify', label: 'Verify' }
	];
	const descriptions = [
		{ description: 'v2.4.0', id: 'version', term: 'Version' },
		{ description: 'cn-east-1', id: 'region', term: 'Region' }
	];
	let tagVisible = $state(true);
</script>

<section data-testid="display-fixture">
	<ZAvatar alt="Alice" fallbackText="A" data-testid="avatar-fallback" />
	<ZAvatar
		alt="Broken image"
		fallbackText="B"
		src="data:image/png;base64,broken"
		data-testid="avatar-image"
	/>
	<ZBadge tone="success" data-testid="badge">Ready</ZBadge>
	{#if tagVisible}
		<ZTag
			removable
			removeLabel="Remove production"
			onRemove={() => (tagVisible = false)}
			data-testid="tag">production</ZTag
		>
	{/if}
	<output data-testid="tag-output">{tagVisible ? 'visible' : 'removed'}</output>
	<ZCard aria-labelledby="display-card-title">
		{#snippet header()}<h2 id="display-card-title">Production release</h2>{/snippet}
		<p>All release gates passed.</p>
		{#snippet footer()}Updated now{/snippet}
	</ZCard>
	<ZList ordered items={listItems} data-testid="ordered-list" />
	<ZDescriptionList items={descriptions} data-testid="description-list" />
</section>
