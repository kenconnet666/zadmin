import { mount, unmount } from 'svelte';
import { definePluginPage, type ClientPluginContext } from '@zadmin/sveltekit/client';
import AuthPage from './AuthPage.svelte';

export const authPages = Object.freeze([
	definePluginPage({
		path: '/auth',
		load: async () => ({ default: AuthPage })
	})
]);

export function activateAuth(context: ClientPluginContext) {
	return context.pages.register({
		path: '/auth',
		mount(target) {
			const component = mount(AuthPage, { target });
			return () => unmount(component);
		}
	});
}
