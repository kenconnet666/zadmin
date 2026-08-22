export interface RedisOptions {
	readonly url?: string;
}

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
