<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>ZAdmin</title>
</svelte:head>

<main>
	<h1>ZAdmin</h1>
	<p>Administration application workspace.</p>
	<nav aria-label="Applications and plugins">
		<a href={resolve('/plugins')}>Plugins</a>
		<a href={resolve('/[...pluginPath]', { pluginPath: 'auth' })}>Auth</a>
		<a href={resolve('/[...pluginPath]', { pluginPath: 'approval' })}>Approval</a>
		<a href={resolve('/[...pluginPath]', { pluginPath: 'erp' })}>ERP</a>
		<a href={resolve('/[...pluginPath]', { pluginPath: 'crm' })}>CRM</a>
	</nav>
</main>

<style>
	nav {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
</style>
