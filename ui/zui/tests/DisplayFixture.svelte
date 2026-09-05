<script lang="ts">
	import {
		ZAvatar,
		ZBadge,
		ZCard,
		ZDescriptionList,
		ZEmpty,
		ZList,
		ZMeter,
		ZProgress,
		ZSkeleton,
		ZStatistic,
		ZTimeline,
		ZTag
	} from '../src/entrypoints/index.js';

	const listItems = [
		{ description: 'Create release assets', key: 'build', label: 'Build' },
		{ description: 'Verify production contracts', key: 'verify', label: 'Verify' }
	];
	const descriptions = [
		{ description: 'v2.4.0', key: 'version', term: 'Version' },
		{ description: 'cn-east-1', key: 'region', term: 'Region' }
	];
	const timeline = [
		{
			datetime: '2026-08-30T09:00:00Z',
			key: 'build',
			status: 'done' as const,
			time: '09:00',
			title: 'Build'
		},
		{ key: 'deploy', status: 'current' as const, title: 'Deploy' },
		{ key: 'verify', status: 'pending' as const, title: 'Verify' }
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
	<ZBadge count={128} max={99} tone="danger" data-testid="badge" />
	{#if tagVisible}
		<ZTag
			removable
			removeLabel="Remove production"
			onRemove={() => (tagVisible = false)}
			data-testid="tag">production</ZTag
		>
	{/if}
	<output data-testid="tag-output">{tagVisible ? 'visible' : 'removed'}</output>
	<ZCard as="article" aria-labelledby="display-card-title">
		{#snippet header()}<h2 id="display-card-title">Production release</h2>{/snippet}
		<p>All release gates passed.</p>
		{#snippet footer()}Updated now{/snippet}
	</ZCard>
	<ZList ordered items={listItems} data-testid="ordered-list" />
	<ZDescriptionList items={descriptions} data-testid="description-list" />
	<ZProgress label="Build progress" value={68} data-testid="progress-line" />
	<ZProgress label="Analysis progress" view="circle" data-testid="progress-circle" />
	<ZMeter label="Capacity" value={72} low={35} high={80} optimum={20} data-testid="meter" />
	<ZSkeleton width={120} data-testid="skeleton" />
	<ZEmpty title="No releases" headingLevel={3} data-testid="empty">Create the first release.</ZEmpty
	>
	<ZTimeline items={timeline} label="Release timeline" data-testid="timeline" />
	<ZStatistic label="Requests" value={128430} trend={12.4} data-testid="statistic" />
</section>
