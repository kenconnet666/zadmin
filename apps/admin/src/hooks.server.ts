import type { Handle } from '@sveltejs/kit';
import { adminHost } from '$lib/server/host';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__zadmin/runtime') {
		return Response.json(adminHost.runtime.snapshot);
	}
	const response = await adminHost.web.routes.handle(event.request);
	return response ?? resolve(event);
};
