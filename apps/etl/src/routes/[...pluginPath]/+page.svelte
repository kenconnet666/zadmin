<script lang="ts">
	import { page } from '$app/state';
	import { etlPages } from '@zadmin/etl/client';
	import { PluginPageOutlet } from '@zadmin/sveltekit/client';
</script>

<PluginPageOutlet pages={etlPages} pathname={page.url.pathname} />
