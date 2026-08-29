import type { StyleRegistryMetrics } from '../icss/registry.js';
import type { IcssClassName } from '../icss/types.js';
import type { IcssTestSnapshot } from './types.js';

const METRIC_NAMES = ['classes', 'hydrated', 'owners', 'recipes', 'rules'] as const;

export function assertIcssClassName(value: unknown): asserts value is IcssClassName {
	if (typeof value !== 'string' || !/^c-[a-z0-9]+$/u.test(value)) {
		throw new TypeError(`Expected an ICSS class name, received ${String(value)}.`);
	}
}

export function assertIcssResourcesStable(
	before: IcssTestSnapshot,
	after: IcssTestSnapshot,
	metrics: readonly (keyof StyleRegistryMetrics)[] = METRIC_NAMES
): void {
	const changes = metrics
		.filter((name) => before.metrics[name] !== after.metrics[name])
		.map((name) => `${name}: ${before.metrics[name]} -> ${after.metrics[name]}`);
	if (before.entries !== after.entries) {
		changes.push(`entries: ${before.entries} -> ${after.entries}`);
	}
	if (changes.length > 0) throw new Error(`ICSS resources changed: ${changes.join(', ')}.`);
}
