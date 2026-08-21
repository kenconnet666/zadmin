import type { Handle } from '@sveltejs/kit';
import { sveltekitPlugin } from '@zadmin/sveltekit';
import { etlRuntime } from '$lib/server/zadmin';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__zadmin/runtime') {
		return Response.json(etlRuntime.snapshot);
	}
	const response = await etlRuntime.get(sveltekitPlugin).routes.handle(event.request);
	return response ?? resolve(event);
};
