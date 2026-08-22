import { defineModule, provideFactory, token } from '@zadmin/core/di';

export interface PostgresOptions {
	readonly url?: string;
}

export const POSTGRES = token<PostgresService>('@zadmin/postgres');

export function createPostgresModule(options: PostgresOptions = {}) {
	return defineModule({
		id: POSTGRES.id,
		primary: POSTGRES,
		exports: [POSTGRES],
		providers: [
			provideFactory({
				token: POSTGRES,
				create: () => createPostgres(options),
				dispose: (database) => database.close(),
				health: (database) =>
					database.closed
						? { status: 'unhealthy', message: 'PostgreSQL service is closed.' }
						: { status: 'healthy' }
			})
		]
	});
}

export const postgresModule = createPostgresModule();

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
