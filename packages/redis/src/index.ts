import { defineModule, provideFactory, token } from '@zadmin/core/di';

export interface RedisOptions {
	readonly url?: string;
}

export const REDIS = token<RedisService>('@zadmin/redis');

export function createRedisModule(options: RedisOptions = {}) {
	return defineModule({
		id: REDIS.id,
		primary: REDIS,
		exports: [REDIS],
		providers: [
			provideFactory({
				token: REDIS,
				create: () => createRedis(options),
				dispose: (cache) => cache.close(),
				health: (cache) =>
					cache.closed
						? { status: 'unhealthy', message: 'Redis service is closed.' }
						: { status: 'healthy' }
			})
		]
	});
}

export const redisModule = createRedisModule();

export interface RedisService {
	readonly driver: 'redis';
	readonly options: RedisOptions;
	readonly closed: boolean;
	close(): Promise<void>;
}

export function createRedis(options: RedisOptions = {}): RedisService {
	let closed = false;
	return Object.freeze({
		driver: 'redis' as const,
		options: Object.freeze({ ...options }),
		get closed() {
			return closed;
		},
		async close() {
			closed = true;
		}
	});
}
