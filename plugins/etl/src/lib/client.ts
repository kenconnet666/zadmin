import { definePluginPage } from '@zadmin/sveltekit/client';
import EtlPage from './EtlPage.svelte';

export const etlPages = Object.freeze([
	definePluginPage({
		path: '/etl',
		load: async () => ({ default: EtlPage })
	})
]);
