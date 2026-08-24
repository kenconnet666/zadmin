import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { icssHandle } from '@zadmin/zui-web/sveltekit';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { adminHost } from '$lib/server/host';

const adminHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/__zadmin/runtime') {
		return Response.json(adminHost.runtime.snapshot);
	}
	if (event.url.pathname === '/__zadmin/health') {
		const snapshot = await adminHost.runtime.container.checkHealth();
		return Response.json(snapshot, { status: snapshot.state === 'active' ? 200 : 503 });
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
	if (event.url.pathname === '/__zadmin/plugins/installed') {
		return Response.json(await adminHost.installer.read());
	}
	if (event.url.pathname === '/__zadmin/plugins/install') {
		if (event.request.method !== 'POST')
			return new Response('Method not allowed.', { status: 405 });
		const unauthorized = authorizePluginMutation(event.request);
		if (unauthorized) return unauthorized;
		const length = Number(event.request.headers.get('content-length') ?? 0);
		if (length > 100 * 1024 * 1024)
			return new Response('Plugin archive is too large.', { status: 413 });
		const bytes = new Uint8Array(await event.request.arrayBuffer());
		if (!bytes.length || bytes.length > 100 * 1024 * 1024) {
			return new Response('Plugin archive is empty or too large.', { status: 413 });
		}
		const uploadRoot = join(adminHost.pluginDataRoot, 'uploads');
		await mkdir(uploadRoot, { recursive: true });
		const upload = join(uploadRoot, `${randomUUID()}.zplugin`);
		try {
			await writeFile(upload, bytes, { flag: 'wx' });
			const installed = await adminHost.mutatePlugins(() => adminHost.installer.install(upload));
			return Response.json(installed, { status: 201 });
		} finally {
			await rm(upload, { force: true });
		}
	}
	if (event.url.pathname === '/__zadmin/plugins/action') {
		if (event.request.method !== 'POST')
			return new Response('Method not allowed.', { status: 405 });
		const unauthorized = authorizePluginMutation(event.request);
		if (unauthorized) return unauthorized;
		const body = (await event.request.json()) as {
			action?: unknown;
			id?: unknown;
			version?: unknown;
		};
		const { action, id } = body;
		if (typeof id !== 'string' || typeof action !== 'string') {
			return new Response('Plugin id and action are required.', { status: 400 });
		}
		switch (action) {
			case 'enable':
				await adminHost.mutatePlugins(() => adminHost.installer.enable(id));
				break;
			case 'disable':
				await adminHost.mutatePlugins(() => adminHost.installer.disable(id));
				break;
			case 'activate':
				if (typeof body.version !== 'string') {
					return new Response('Plugin version is required.', { status: 400 });
				}
				{
					const version = body.version;
					await adminHost.mutatePlugins(() => adminHost.installer.activate(id, version));
				}
				break;
			case 'uninstall':
				await adminHost.mutatePlugins(() => adminHost.installer.uninstall(id));
				break;
			default:
				return new Response('Unsupported plugin action.', { status: 400 });
		}
		return Response.json(await adminHost.installer.read());
	}
	const response = await adminHost.web.routes.handle(event.request);
	return response ?? resolve(event);
};

export const handle = sequence(icssHandle(), adminHandle);

function authorizePluginMutation(request: Request): Response | undefined {
	if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test') return undefined;
	const expected = process.env.ZADMIN_PLUGIN_ADMIN_TOKEN;
	if (!expected) return new Response('Plugin mutation API is not configured.', { status: 503 });
	const actual = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	const expectedBytes = Buffer.from(expected);
	const actualBytes = Buffer.from(actual);
	if (expectedBytes.length !== actualBytes.length || !timingSafeEqual(expectedBytes, actualBytes)) {
		return new Response('Unauthorized.', { status: 401 });
	}
	return undefined;
}
