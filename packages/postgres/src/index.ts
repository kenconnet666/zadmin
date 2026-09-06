import { defineModule, provideFactory, token, type ServiceHealth } from '@zadmin/core/di';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

export interface PostgresOptions {
	readonly url?: string;
	readonly max?: number;
	/** Connection establishment timeout in seconds. Defaults to 5. */
	readonly connectTimeout?: number;
	/** Missing URLs disable the service by default; false requires a URL. */
	readonly disabled?: boolean;
}

export type PostgresHealth =
	ServiceHealth | { readonly status: 'disabled'; readonly message: string };

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
				health: async (database) => {
					const health = await database.checkHealth();
					// A deliberately disabled module is usable without claiming a live database.
					return health.status === 'disabled'
						? { status: 'healthy', message: health.message }
						: health;
				}
			})
		]
	});
}

export const postgresModule = createPostgresModule();

export interface PostgresService {
	readonly driver: 'postgres';
	readonly enabled: boolean;
	readonly client: Sql;
	readonly db: PostgresJsDatabase;
	readonly closed: boolean;
	checkHealth(): Promise<PostgresHealth>;
	close(): Promise<void>;
}

export function createPostgres(options: PostgresOptions = {}): PostgresService {
	const url = options.url?.trim();
	if (options.disabled === false && !url) {
		throw new Error('PostgreSQL requires a connection URL when enabled.');
	}
	const enabled = options.disabled !== true && Boolean(url);
	let client: Sql | undefined;
	if (enabled) {
		if (!/^postgres(?:ql)?:\/\//i.test(url!)) {
			throw new Error('PostgreSQL requires a postgres:// or postgresql:// connection URL.');
		}
		if (options.max !== undefined && (!Number.isInteger(options.max) || options.max < 1)) {
			throw new Error('PostgreSQL max must be a positive integer.');
		}
		if (
			options.connectTimeout !== undefined &&
			(!Number.isFinite(options.connectTimeout) || options.connectTimeout <= 0)
		) {
			throw new Error('PostgreSQL connectTimeout must be a positive number of seconds.');
		}
		try {
			client = postgres(url!, {
				max: options.max ?? 10,
				connect_timeout: options.connectTimeout ?? 5
			});
		} catch {
			throw new Error('Invalid PostgreSQL connection configuration.');
		}
	}
	const db = client ? drizzle({ client }) : undefined;
	let closed = false;
	let closing: Promise<void> | undefined;
	const disabledMessage = 'PostgreSQL is disabled; no database connection has been opened.';

	function assertAvailable() {
		if (closed) throw new Error('PostgreSQL service is closed.');
		if (!enabled) throw new Error(disabledMessage);
	}

	return Object.freeze({
		driver: 'postgres' as const,
		enabled,
		get client() {
			assertAvailable();
			return client!;
		},
		get db() {
			assertAvailable();
			return db!;
		},
		get closed() {
			return closed;
		},
		async checkHealth(): Promise<PostgresHealth> {
			if (closed) return { status: 'unhealthy', message: 'PostgreSQL service is closed.' };
			if (!client) return { status: 'disabled', message: disabledMessage };
			try {
				await client`SELECT 1`;
				return closed
					? { status: 'unhealthy', message: 'PostgreSQL service is closed.' }
					: { status: 'healthy', message: 'PostgreSQL connection is ready.' };
			} catch (error) {
				const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
				const sqlState = typeof code === 'string' && /^[A-Z0-9]{5}$/.test(code) ? ` (${code})` : '';
				return { status: 'unhealthy', message: `PostgreSQL health check failed${sqlState}.` };
			}
		},
		close() {
			closed = true;
			return (closing ??= client?.end({ timeout: 5 }) ?? Promise.resolve());
		}
	});
}
