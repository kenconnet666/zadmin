<script lang="ts">
	import type { ApiSection } from '../catalog/index.js';

	let { section }: { section: ApiSection } = $props();
</script>

<section class="api-section" id={`api-${section.title.toLowerCase()}`}>
	<h2>{section.title}</h2>
	{#if section.description}<p class="section-description">{section.description}</p>{/if}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard focus is required for horizontal scrolling) -->
	<div class="table-scroll" role="region" aria-label={`${section.title} API表格`} tabindex="0">
		<table>
			<thead>
				<tr><th>名称</th><th>类型</th><th>默认值</th><th>说明</th></tr>
			</thead>
			<tbody>
				{#each section.rows as row (row.name)}
					<tr>
						<td><code>{row.name}</code></td>
						<td><code>{row.type}</code></td>
						<td><code>{row.default}</code></td>
						<td>{row.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
