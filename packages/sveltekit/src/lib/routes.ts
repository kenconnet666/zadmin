import type { ServiceContext } from '@zadmin/core/di';

export type RouteMethod = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';

export interface RouteRequest {
	readonly request: Request;
	readonly params: Readonly<Record<string, string>>;
	readonly pluginId: string;
}

export interface PluginRoute {
	readonly method?: RouteMethod;
	readonly path: string;
	readonly handler: (request: RouteRequest) => Response | Promise<Response>;
}

export interface RegisteredRoute {
	readonly method: RouteMethod;
	readonly path: string;
	readonly pluginId: string;
}

interface RouteEntry extends RegisteredRoute {
	readonly pattern: RegExp;
	readonly parameters: readonly string[];
	readonly score: number;
	readonly handler: PluginRoute['handler'];
}

export class PluginRouteRegistry {
	readonly #entries: RouteEntry[] = [];
	readonly #reservations = new Map<
		string,
		{ readonly generation: string; readonly owner: string }
	>();

	get routes(): readonly RegisteredRoute[] {
		return Object.freeze(
			this.#entries.map(({ method, path, pluginId }) => Object.freeze({ method, path, pluginId }))
		);
	}

	register(context: ServiceContext, route: PluginRoute): void {
		const entry = createEntry(context.id, route);
		const key = routeKey(entry);
		const reservation = this.#reservations.get(key);
		if (reservation) {
			throw new Error(`Route ${entry.method} ${entry.path} is already registered.`);
		}
		const active = this.#entries.find(
			(candidate) => candidate.method === entry.method && candidate.path === entry.path
		);
		if (active && active.pluginId !== context.moduleId) {
			throw new Error(`Route ${entry.method} ${entry.path} is already registered.`);
		}
		const owner = Object.freeze({ owner: context.moduleId, generation: context.generation });
		this.#reservations.set(key, owner);
		context.onActivate(() => {
			if (this.#reservations.get(key) === owner) this.#reservations.delete(key);
			return this.#activate(entry);
		});
		context.onDispose(() => {
			if (this.#reservations.get(key) === owner) this.#reservations.delete(key);
		});
	}

	add(ownerId: string, route: PluginRoute): () => void {
		return this.#activate(createEntry(ownerId, route));
	}

	#activate(entry: RouteEntry): () => void {
		if (
			this.#entries.some(
				(candidate) => candidate.method === entry.method && candidate.path === entry.path
			)
		) {
			throw new Error(`Route ${entry.method} ${entry.path} is already registered.`);
		}
		this.#entries.push(entry);
		this.#entries.sort((left, right) => right.score - left.score);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			const index = this.#entries.indexOf(entry);
			if (index >= 0) this.#entries.splice(index, 1);
		};
	}

	async handle(request: Request): Promise<Response | undefined> {
		const method = request.method.toUpperCase() as RouteMethod;
		const pathname = normalizePath(new URL(request.url).pathname);

		for (const entry of this.#entries) {
			if (entry.method !== method && !(method === 'HEAD' && entry.method === 'GET')) continue;
			const match = entry.pattern.exec(pathname);
			if (!match) continue;
			const params = Object.freeze(
				Object.fromEntries(
					entry.parameters.map((parameter, index) => [parameter, match[index + 1] ?? ''])
				)
			);
			return entry.handler({ request, params, pluginId: entry.pluginId });
		}

		return undefined;
	}
}

function createEntry(ownerId: string, route: PluginRoute): RouteEntry {
	const method = route.method ?? 'GET';
	const path = normalizePath(route.path);
	return {
		method,
		path,
		pluginId: ownerId,
		handler: route.handler,
		...compilePath(path)
	};
}

function routeKey(route: Pick<RouteEntry, 'method' | 'path'>): string {
	return `${route.method} ${route.path}`;
}

function normalizePath(path: string): string {
	if (!path.startsWith('/')) throw new Error(`Plugin route must start with "/": ${path}`);
	const normalized = path.replace(/\/{2,}/g, '/').replace(/\/$/, '');
	return normalized || '/';
}

function compilePath(path: string): Pick<RouteEntry, 'parameters' | 'pattern' | 'score'> {
	const parameters: string[] = [];
	let score = 0;
	const parts = path === '/' ? [] : path.slice(1).split('/');
	const pattern = parts
		.map((part, index) => {
			if (part.startsWith(':')) {
				const name = part.slice(1);
				if (!name) throw new Error(`Route parameter name is empty in "${path}".`);
				parameters.push(name);
				score += 10;
				return '([^/]+)';
			}
			if (part.startsWith('*')) {
				if (index !== parts.length - 1)
					throw new Error(`Wildcard must be the last route segment: ${path}`);
				parameters.push(part.slice(1) || 'rest');
				score += 1;
				return '(.*)';
			}
			score += 100;
			return escapeRegex(part);
		})
		.join('/');

	return {
		parameters: Object.freeze(parameters),
		pattern: new RegExp(path === '/' ? '^/$' : `^/${pattern}$`),
		score
	};
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
