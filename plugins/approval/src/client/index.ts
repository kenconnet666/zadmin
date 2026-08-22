import { mount, unmount } from 'svelte';
import type { ClientPluginContext } from '@zadmin/sveltekit/client';
import ApprovalPage from './ApprovalPage.svelte';

export function activate(context: ClientPluginContext) {
	return context.pages.register({
		path: '/approval',
		mount(target) {
			const component = mount(ApprovalPage, { target });
			return () => unmount(component);
		}
	});
}
