import type { Handle } from '@sveltejs/kit';
import { adminHost } from '$lib/server/host';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__zadmin/runtime') {
		return Response.json(adminHost.runtime.snapshot);
	}
	if (event.url.pathname === '/__zadmin/plugins/client') {
		return Response.json(adminHost.bridge.clientArtifacts);
	}
	if (event.url.pathname === '/__zadmin/plugins/client.js') {
		return adminHost.bridge.serveClient(event.url);
	}
	if (event.url.pathname === '/__zadmin/plugins/events') {
		return adminHost.bridge.events();
	}
	const response = await adminHost.web.routes.handle(event.request);
	return response ?? resolve(event);
};
