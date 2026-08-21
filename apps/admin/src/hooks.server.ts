import type { Handle } from '@sveltejs/kit';
import { sveltekitPlugin } from '@zadmin/sveltekit';
import { adminRuntime } from '$lib/server/zadmin';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__zadmin/runtime') {
		return Response.json(adminRuntime.snapshot);
	}
	const response = await adminRuntime.get(sveltekitPlugin).routes.handle(event.request);
	return response ?? resolve(event);
};
