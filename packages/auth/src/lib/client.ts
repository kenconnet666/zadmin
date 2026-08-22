import { definePluginPage } from '@zadmin/sveltekit/client';
import AuthPage from './AuthPage.svelte';

export const authPages = Object.freeze([
	definePluginPage({
		path: '/auth',
		load: async () => ({ default: AuthPage })
	})
]);
