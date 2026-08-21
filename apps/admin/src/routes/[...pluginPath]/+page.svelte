<script lang="ts">
	import { page } from '$app/state';
	import { authPages } from '@zadmin/auth/client';
	import { PluginPageOutlet } from '@zadmin/sveltekit/client';
</script>

<PluginPageOutlet pages={authPages} pathname={page.url.pathname} />
