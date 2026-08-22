export interface PostgresOptions {
	readonly url?: string;
}

export interface PostgresService {
	readonly driver: 'postgres';
	readonly options: PostgresOptions;
	readonly closed: boolean;
	close(): Promise<void>;
}

export function createPostgres(options: PostgresOptions = {}): PostgresService {
	let closed = false;
	return Object.freeze({
		driver: 'postgres' as const,
		options: Object.freeze({ ...options }),
		get closed() {
			return closed;
		},
		async close() {
			closed = true;
		}
	});
}
