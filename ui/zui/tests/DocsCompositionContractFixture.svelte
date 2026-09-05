<script lang="ts">
	import { ZButton, ZCard, ZLink, ZTable, ZText } from '../src/entrypoints/index.js';

	let disabledActivations = $state(0);
</script>

<div style="inline-size: 32rem;">
	<ZLink
		appearance="button"
		data-testid="link-button-small"
		href="#small"
		size="small"
		variant="secondary"
	>
		Small action
	</ZLink>
	<ZButton data-testid="button-small-reference" size="small" variant="secondary"
		>Small action</ZButton
	>
	<ZLink
		appearance="button"
		data-testid="link-button-medium"
		href="#medium"
		size="medium"
		variant="primary">Medium action</ZLink
	>
	<ZButton data-testid="button-medium-reference" size="medium" variant="primary"
		>Medium action</ZButton
	>
	<ZButton data-testid="button-large-reference" size="large" variant="primary">Large action</ZButton
	>
	<ZLink
		appearance="button"
		data-testid="link-button-large"
		href="#large"
		size="large"
		variant="primary"
	>
		Large action
	</ZLink>
	<ZLink
		appearance="navigation"
		aria-current="page"
		data-testid="link-navigation-current"
		href="#current"
	>
		Current section
	</ZLink>
	<ZLink appearance="navigation" data-testid="link-navigation-inactive" href="#other">
		Other section
	</ZLink>
	<ZLink
		appearance="navigation"
		aria-current="false"
		data-testid="link-navigation-false"
		href="#false"
	>
		False current
	</ZLink>
	<ZLink
		data-testid="link-disabled"
		disabled
		href="#disabled"
		onclick={() => (disabledActivations += 1)}
	>
		Disabled action
	</ZLink>

	<ZCard bodyPadding="none" data-testid="card-padding-none">
		{#snippet header()}<span data-testid="card-none-header">Header</span>{/snippet}
		<ZText>Media or table content</ZText>
		{#snippet footer()}<span data-testid="card-none-footer">Footer</span>{/snippet}
	</ZCard>
	<ZCard bodyPadding="large" data-testid="card-padding-large">
		{#snippet header()}<span data-testid="card-large-header">Header</span>{/snippet}
		<ZText>Readable body content</ZText>
		{#snippet footer()}<span data-testid="card-large-footer">Footer</span>{/snippet}
	</ZCard>
	<output data-testid="disabled-output">{disabledActivations}</output>

	<h2 id="table-scroll-title">Wide release table</h2>
	<p id="table-scroll-description">Use the viewport to inspect all release columns.</p>
	<ZTable
		caption="Wide release table"
		data-testid="table-overflow"
		scroll="auto"
		scrollDescribedBy="table-scroll-description"
		scrollLabelledBy="table-scroll-title"
		style="min-inline-size: 60rem;"
	>
		{#snippet header()}
			<tr><th scope="col">Service</th><th scope="col">Release</th><th scope="col">Owner</th></tr>
		{/snippet}
		<tr><th scope="row">Docs</th><td>2.4.0</td><td>UI Team</td></tr>
	</ZTable>

	<ZTable caption="Short release table" data-testid="table-no-overflow" scroll="auto">
		{#snippet header()}
			<tr><th scope="col">Service</th><th scope="col">Release</th></tr>
		{/snippet}
		<tr><th scope="row">Docs</th><td>2.4.0</td></tr>
	</ZTable>
</div>
