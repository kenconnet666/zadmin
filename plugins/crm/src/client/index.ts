import { mount, unmount } from 'svelte';
import type { ClientPluginContext } from '@zadmin/sveltekit/client';
import CrmPage from './CrmPage.svelte';

export function activate(context: ClientPluginContext) {
	return context.pages.register({
		path: '/crm',
		mount(target) {
			const component = mount(CrmPage, { target });
			return () => unmount(component);
		}
	});
}
