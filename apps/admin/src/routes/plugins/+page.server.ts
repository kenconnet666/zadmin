import { fail } from '@sveltejs/kit';
import { adminHost } from '$lib/server/host';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	installed: await adminHost.installer.read(),
	providers: adminHost.runtime.snapshot.providers.filter(({ owner }) => owner === 'host'),
	plugins: adminHost.runtime.snapshot.plugins.map((plugin) => ({
		...plugin,
		error: plugin.error ? String(plugin.error) : undefined
	})),
	development: import.meta.env.MODE === 'development'
});

export const actions: Actions = {
	default: async ({ request }) => {
		if (import.meta.env.MODE !== 'development')
			return fail(403, { message: 'UI mutation is development-only.' });
		const data = await request.formData();
		const id = data.get('id');
		const action = data.get('action');
		if (typeof id !== 'string' || typeof action !== 'string') {
			return fail(400, { message: 'Plugin id and action are required.' });
		}
		try {
			switch (action) {
				case 'enable':
					await adminHost.installer.enable(id);
					break;
				case 'disable':
					await adminHost.installer.disable(id);
					break;
				case 'uninstall':
					await adminHost.installer.uninstall(id);
					break;
				default:
					return fail(400, { message: 'Unsupported action.' });
			}
			await adminHost.refreshInstalledPlugins();
			return { success: true };
		} catch (error) {
			return fail(400, { message: String(error) });
		}
	}
};
