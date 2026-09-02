<script lang="ts">
	import { ZButton, ZProvider, ZTable, ZTag, zhCNLocalePack } from '../src/entrypoints/index.js';

	let action = $state('none');
	let parentClicks = $state(0);
	let standaloneVisible = $state(true);
	let tableRef = $state<HTMLTableElement | null>(null);
	let wrapperRef = $state<HTMLDivElement | null>(null);

	function trackParentClicks(node: HTMLElement): { destroy(): void } {
		const handleClick = () => (parentClicks += 1);
		node.addEventListener('click', handleClick);
		return { destroy: () => node.removeEventListener('click', handleClick) };
	}
</script>

<ZProvider density="compact" locale="zh-CN" localePack={zhCNLocalePack}>
	<div use:trackParentClicks data-testid="tag-parent">
		{#if standaloneVisible}
			<ZTag
				data-testid="tag-localized"
				onRemove={() => (standaloneVisible = false)}
				removable
				textValue="production"
				tone="success"
			>
				production
			</ZTag>
		{/if}
	</div>
	<ZTag data-testid="tag-compound" removable removeTabIndex={-1} textValue="compound">
		compound
	</ZTag>
	<ZTag data-testid="tag-disabled" disabled removable textValue="locked">locked</ZTag>
	<ZTag data-testid="tag-medium" size="medium" tone="danger">explicit medium</ZTag>
	<ZTag data-testid="tag-long">
		production-release-candidate-with-an-extremely-long-identifier-without-breaks
	</ZTag>
</ZProvider>
<output data-testid="tag-output">{standaloneVisible}:{parentClicks}</output>

<ZTable caption="Simple deployments" data-testid="table-simple" data-native-table="true">
	{#snippet header()}<tr><th scope="col">Service</th><th scope="col">Version</th></tr>{/snippet}
	<tr><th scope="row">Docs</th><td>v2.4.0</td></tr>
</ZTable>

<div style="width: 240px;">
	<ZTable
		bind:ref={tableRef}
		bind:wrapperRef
		caption="Wide deployments"
		captionHidden
		data-testid="table-wide"
		scrollLabel="Wide deployments scroll area"
		style="min-width: 640px;"
	>
		{#snippet header()}
			<tr
				><th scope="col">Service</th><th scope="col">Region</th><th scope="col">Version</th><th
					scope="col">Owner</th
				></tr
			>
		{/snippet}
		<tr><th scope="row">Docs</th><td>East</td><td>v2.4.0</td><td>Platform</td></tr>
	</ZTable>
</div>
<output data-testid="table-ref-output">{tableRef?.tagName}:{wrapperRef?.tagName}</output>

<div style="width: 240px;">
	<ZTable
		caption="No scroll owner"
		data-testid="table-no-scroll"
		scroll="none"
		style="min-width: 640px;"
	>
		<tr><td>Long unowned table content</td></tr>
	</ZTable>
</div>

<ZProvider density="spacious" direction="rtl">
	<ZTable caption="RTL density" data-testid="table-rtl" striped>
		<tr><th scope="row">الخدمة</th><td>جاهز</td></tr>
	</ZTable>
</ZProvider>

<ZTable caption="Interactive cells" data-testid="table-interactive">
	<tr>
		<th scope="row">Docs</th>
		<td
			><ZButton data-testid="table-action" onclick={() => (action = 'inspect')}>Inspect</ZButton
			></td
		>
	</tr>
</ZTable>
<output data-testid="table-action-output">{action}</output>
