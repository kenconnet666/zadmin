import { fieldPathToString, normalizeFieldPath, type FieldPathInput } from './field-path.js';
import type { FormErrors } from './validation.js';

export type FormErrorLayer = 'manual' | 'schema' | 'server';
export interface FormErrorLayers {
	readonly manual: FormErrors;
	readonly schema: FormErrors;
	readonly server: FormErrors;
}
function freeze(errors: FormErrors = {}): FormErrors {
	return Object.freeze(
		Object.fromEntries(
			Object.entries(errors)
				.filter(([, messages]) => messages.length > 0)
				.map(([path, messages]) => [path, Object.freeze([...new Set(messages)])])
		)
	);
}
export function createFormErrorLayers(layers: Partial<FormErrorLayers> = {}): FormErrorLayers {
	return Object.freeze({
		manual: freeze(layers.manual),
		schema: freeze(layers.schema),
		server: freeze(layers.server)
	});
}
export function setFormErrorLayer(
	layers: FormErrorLayers,
	layer: FormErrorLayer,
	errors: FormErrors,
	paths?: readonly FieldPathInput[]
): FormErrorLayers {
	const replacement = freeze(errors);
	if (!paths) return createFormErrorLayers({ ...layers, [layer]: replacement });
	const next: Record<string, readonly string[]> = { ...layers[layer] };
	for (const path of paths) {
		const key = fieldPathToString(normalizeFieldPath(path));
		delete next[key];
		if (replacement[key]) next[key] = replacement[key];
	}
	return createFormErrorLayers({ ...layers, [layer]: next });
}
export function clearFormErrorLayers(
	layers: FormErrorLayers,
	options: {
		readonly layers?: readonly FormErrorLayer[];
		readonly paths?: readonly FieldPathInput[];
	} = {}
): FormErrorLayers {
	const targets = options.layers ?? (['schema', 'server', 'manual'] as const);
	let next = layers;
	for (const layer of targets) next = setFormErrorLayer(next, layer, {}, options.paths);
	return next;
}
export function mergeFormErrorLayers(layers: FormErrorLayers): FormErrors {
	const result: Record<string, string[]> = {};
	for (const layer of [layers.schema, layers.server, layers.manual]) {
		for (const [path, messages] of Object.entries(layer)) {
			const current = result[path] ?? [];
			for (const message of messages) if (!current.includes(message)) current.push(message);
			result[path] = current;
		}
	}
	return freeze(result);
}
