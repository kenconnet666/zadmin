import type { ModuleKind } from './context.ts';
import type { ServiceHealth } from './provider.ts';

export type ContainerState = 'active' | 'degraded' | 'disposed' | 'reconciling';
export type GenerationState =
	| 'active'
	| 'activating'
	| 'candidate'
	| 'deactivating'
	| 'disposed'
	| 'disposing'
	| 'failed'
	| 'leaked'
	| 'preparing';
export type ProviderState =
	| 'active'
	| 'activating'
	| 'creating'
	| 'deactivating'
	| 'disposed'
	| 'disposing'
	| 'failed'
	| 'prepared'
	| 'preparing';

export interface SerializedError {
	readonly name: string;
	readonly message: string;
	readonly stack?: string;
	readonly cause?: SerializedError;
	readonly errors?: readonly SerializedError[];
}

export interface ProviderSnapshot {
	readonly id: string;
	readonly moduleId: string;
	readonly generation: string;
	readonly source: 'class' | 'factory' | 'value';
	readonly state: ProviderState;
	readonly dependencies: readonly string[];
	readonly dependents: readonly string[];
	readonly createdAt: number;
	readonly activatedAt?: number;
	readonly health?: ServiceHealth;
	readonly error?: SerializedError;
}

export interface ModuleSnapshot {
	readonly id: string;
	readonly kind: ModuleKind;
	readonly version: string;
	readonly revision: string;
	readonly generation?: string;
	readonly state: 'active' | 'waiting';
	readonly providers: readonly string[];
	readonly dependencies: readonly string[];
	readonly dependents: readonly string[];
	readonly waitingFor: readonly string[];
	readonly leakedGenerations: readonly string[];
	readonly createdAt?: number;
}

export interface ContainerSnapshot {
	readonly instanceId: string;
	readonly state: ContainerState;
	readonly modules: readonly ModuleSnapshot[];
	readonly providers: readonly ProviderSnapshot[];
}

export interface ContainerEvent {
	readonly type: 'reconciled' | 'reconcile-failed' | 'state-changed';
	readonly timestamp: number;
	readonly snapshot: ContainerSnapshot;
	readonly error?: SerializedError;
}

export function serializeError(value: unknown): SerializedError {
	if (!(value instanceof Error)) {
		return Object.freeze({ name: 'Error', message: String(value) });
	}
	const aggregate = value instanceof AggregateError ? value.errors.map(serializeError) : undefined;
	return Object.freeze({
		name: value.name,
		message: value.message,
		...(value.stack ? { stack: value.stack } : {}),
		...(value.cause !== undefined ? { cause: serializeError(value.cause) } : {}),
		...(aggregate?.length ? { errors: Object.freeze(aggregate) } : {})
	});
}
