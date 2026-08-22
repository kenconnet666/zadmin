<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { DynamicPluginPageOutlet } from '@zadmin/sveltekit/client';
	import { clientPlugins, startClientPlugins, stopClientPlugins } from '$lib/client/plugins';

	onMount(() => {
		void startClientPlugins();
		return () => {
			void stopClientPlugins();
		};
	});
</script>

<DynamicPluginPageOutlet pages={clientPlugins.pages} pathname={page.url.pathname} />
