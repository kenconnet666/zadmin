import { mount, unmount } from 'svelte';
import type { ClientPluginContext } from '@zadmin/sveltekit/client';
import ErpPage from './ErpPage.svelte';

export function activate(context: ClientPluginContext) {
	return context.pages.register({
		path: '/erp',
		mount(target) {
			const component = mount(ErpPage, { target });
			return () => unmount(component);
		}
	});
}
