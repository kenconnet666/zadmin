<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Plugins | ZAdmin</title>
</svelte:head>

<main>
	<h1>Plugins</h1>

	<section>
		<h2>Runtime</h2>
		<table>
			<thead
				><tr><th>ID</th><th>Version</th><th>Revision</th><th>State</th><th>Error</th></tr></thead
			>
			<tbody>
				{#each data.plugins as plugin (plugin.id)}
					<tr>
						<td>{plugin.id}</td>
						<td>{plugin.version}</td>
						<td><code>{plugin.artifactRevision?.slice(0, 12) ?? 'host'}</code></td>
						<td>{plugin.state}</td>
						<td>{plugin.error ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section>
		<h2>Installed</h2>
		{#if Object.keys(data.installed.plugins).length === 0}
			<p>No production plugin artifacts are installed.</p>
		{:else}
			<ul>
				{#each Object.values(data.installed.plugins) as plugin (plugin.id)}
					<li>
						<strong>{plugin.id}</strong>
						{plugin.version} — {plugin.enabled ? 'enabled' : 'disabled'}
						{#if data.development}
							<form method="POST">
								<input type="hidden" name="id" value={plugin.id} />
								<button name="action" value={plugin.enabled ? 'disable' : 'enable'}>
									{plugin.enabled ? 'Disable' : 'Enable'}
								</button>
								<button name="action" value="uninstall">Uninstall</button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<h2>Host providers</h2>
		<ul>
			{#each data.providers as provider (provider.id)}
				<li>{provider.id} {provider.version} ({provider.owner})</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		border-bottom: 1px solid #ddd;
		padding: 0.5rem;
		text-align: left;
	}
	form {
		display: inline-flex;
		gap: 0.5rem;
		margin-left: 1rem;
	}
	section + section {
		margin-top: 2rem;
	}
</style>
