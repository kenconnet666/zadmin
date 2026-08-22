import type { PostgresService } from '@zadmin/postgres';
import type { RedisService } from '@zadmin/redis';
import type { SvelteKitHost } from '@zadmin/sveltekit';

export interface AuthOptions {
	readonly database: PostgresService;
	readonly cache: RedisService;
	readonly web: SvelteKitHost;
}

export interface AuthService {
	readonly provider: 'auth';
	readonly database: PostgresService;
	readonly cache: RedisService;
	dispose(): void;
}

export function createAuth(options: AuthOptions): AuthService {
	const disposeRoute = options.web.routes.add('@zadmin/auth', {
		path: '/auth/api/status',
		handler: () => Response.json({ package: '@zadmin/auth', status: 'active' })
	});

	return Object.freeze({
		provider: 'auth' as const,
		database: options.database,
		cache: options.cache,
		dispose: disposeRoute
	});
}
