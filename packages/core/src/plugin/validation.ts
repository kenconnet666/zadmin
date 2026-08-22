import type { PluginManifest } from '../artifact/manifest.ts';
import type { AnyPluginDefinition } from '../container/module.ts';

export function validatePluginDefinition(
	manifest: PluginManifest,
	definition: AnyPluginDefinition
): void {
	if (definition.id !== manifest.id) {
		throw new Error(
			`${manifest.id}: server PluginDefinition id "${definition.id}" does not match its manifest.`
		);
	}
	const injections = new Map<string, boolean>();
	for (const provider of definition.providers) {
		for (const injection of Object.values(provider.dependencies)) {
			if (injection.id === definition.id || injection.id.startsWith(`${definition.id}/`)) {
				continue;
			}
			const previous = injections.get(injection.id);
			injections.set(injection.id, previous === false ? false : injection.optional);
		}
	}
	for (const [id, optional] of injections) {
		const declared = optional ? manifest.optional[id] : manifest.requires[id];
		if (!declared) {
			throw new Error(
				`${manifest.id}: ${optional ? 'optional' : 'required'} injection "${id}" is missing from its manifest.`
			);
		}
	}
	for (const id of Object.keys(manifest.requires)) {
		if (injections.get(id) !== false) {
			throw new Error(`${manifest.id}: manifest requires unused injection "${id}".`);
		}
	}
	for (const id of Object.keys(manifest.optional)) {
		if (injections.get(id) !== true) {
			throw new Error(`${manifest.id}: manifest declares unused optional injection "${id}".`);
		}
	}
}

export function isPluginDefinition(value: unknown): value is AnyPluginDefinition {
	if (typeof value !== 'object' || value === null) return false;
	const definition = value as Record<string, unknown>;
	return (
		definition.plugin === true &&
		typeof definition.id === 'string' &&
		typeof definition.primary === 'object' &&
		definition.primary !== null &&
		Array.isArray(definition.providers)
	);
}
