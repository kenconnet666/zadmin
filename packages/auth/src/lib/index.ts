import { defineModule, inject, provideFactory, token } from '@zadmin/core/di';
import { POSTGRES, type PostgresService } from '@zadmin/postgres';
import { REDIS, type RedisService } from '@zadmin/redis';
import { SVELTEKIT, type SvelteKitHost } from '@zadmin/sveltekit';

export interface AuthOptions {
	readonly database: PostgresService;
	readonly cache: RedisService;
	readonly web: SvelteKitHost;
}

export interface AuthService {
	readonly provider: 'auth';
	readonly database: PostgresService;
	readonly cache: RedisService;
}

export interface StandaloneAuthService extends AuthService {
	dispose(): void;
}

export const AUTH = token<AuthService>('@zadmin/auth');

const authDependencies = {
	database: inject(POSTGRES),
	cache: inject(REDIS),
	web: inject(SVELTEKIT)
} as const;

export const authModule = defineModule({
	id: AUTH.id,
	primary: AUTH,
	exports: [AUTH],
	providers: [
		provideFactory({
			token: AUTH,
			dependencies: authDependencies,
			create(context, services) {
				services.web.routes.register(context, {
					path: '/auth/api/status',
					handler: () => Response.json({ package: AUTH.id, status: 'active' })
				});
				return Object.freeze({
					provider: 'auth' as const,
					database: services.database,
					cache: services.cache
				});
			}
		})
	]
});

export function createAuth(options: AuthOptions): StandaloneAuthService {
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
