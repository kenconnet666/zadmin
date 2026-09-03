/**
 * Provider-level defaults are deliberately narrower than component props.
 * This module has no component or Svelte imports so it can remain a cheap
 * foundation dependency and be used by SSR and build-time tooling.
 */

export type ComponentDefaultPrimitive = string | number | boolean;

export interface ButtonComponentDefaults {
	readonly size?: 'small' | 'medium' | 'large';
	readonly shape?: 'default' | 'circle' | 'square';
	readonly tone?: 'default' | 'danger';
	readonly variant?: 'ghost' | 'primary' | 'secondary';
	readonly fullWidth?: boolean;
}

export interface DialogComponentDefaults {
	readonly closeOnEscape?: boolean;
	readonly trapFocus?: boolean;
	readonly autoFocus?: boolean;
	readonly modal?: boolean;
	readonly presence?: 'if' | 'show';
}

export interface DataTableComponentDefaults {
	readonly density?: 'compact' | 'comfortable' | 'spacious';
	readonly selectionMode?: 'multiple' | 'none' | 'single';
	readonly stickyHeader?: boolean;
	readonly striped?: boolean;
	readonly virtualized?: boolean;
	readonly overscan?: number;
	readonly rowHeight?: number;
}

export interface ZuiComponentDefaults {
	readonly button?: ButtonComponentDefaults | null;
	readonly dialog?: DialogComponentDefaults | null;
	readonly dataTable?: DataTableComponentDefaults | null;
}

export interface ResolvedZuiComponentDefaults {
	readonly button?: ButtonComponentDefaults;
	readonly dialog?: DialogComponentDefaults;
	readonly dataTable?: DataTableComponentDefaults;
}

const COMPONENT_PROPS = {
	button: new Set(['size', 'shape', 'tone', 'variant', 'fullWidth']),
	dialog: new Set(['closeOnEscape', 'trapFocus', 'autoFocus', 'modal', 'presence']),
	dataTable: new Set([
		'density',
		'selectionMode',
		'stickyHeader',
		'striped',
		'virtualized',
		'overscan',
		'rowHeight'
	])
} as const;

const COMPONENTS = new Set(Object.keys(COMPONENT_PROPS));
const CONTROLLED_OR_UNSAFE = new Set([
	'open',
	'value',
	'selectedKeys',
	'expandedKeys',
	'sort',
	'rows',
	'columns',
	'rowKey',
	'controller',
	'ref',
	'children',
	'style',
	'class',
	'portalContainer'
]);

function assertPlainRecord(
	value: unknown,
	location: string
): asserts value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new TypeError(`${location} must be a plain object.`);
	}
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) {
		throw new TypeError(`${location} must be a plain object.`);
	}
}

function assertPrimitive(
	value: unknown,
	location: string
): asserts value is ComponentDefaultPrimitive {
	if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
		throw new TypeError(`${location} must be a JSON-like primitive.`);
	}
	if (typeof value === 'number' && !Number.isFinite(value)) {
		throw new TypeError(`${location} must be finite.`);
	}
}

function validateProp(component: string, prop: string, value: unknown): void {
	const location = `componentDefaults.${component}.${prop}`;
	if (CONTROLLED_OR_UNSAFE.has(prop)) {
		throw new TypeError(`${location} is controlled or unsafe and cannot be a component default.`);
	}
	assertPrimitive(value, location);
	if (
		[
			'fullWidth',
			'closeOnEscape',
			'trapFocus',
			'autoFocus',
			'modal',
			'stickyHeader',
			'striped',
			'virtualized'
		].includes(prop) &&
		typeof value !== 'boolean'
	) {
		throw new TypeError(`${location} must be a boolean.`);
	}
	if (
		component === 'button' &&
		prop === 'size' &&
		!['small', 'medium', 'large'].includes(String(value))
	) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (
		component === 'button' &&
		prop === 'shape' &&
		!['default', 'circle', 'square'].includes(String(value))
	) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (component === 'button' && prop === 'tone' && !['default', 'danger'].includes(String(value))) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (
		component === 'button' &&
		prop === 'variant' &&
		!['ghost', 'primary', 'secondary'].includes(String(value))
	) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (component === 'dialog' && prop === 'presence' && !['if', 'show'].includes(String(value))) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (
		component === 'dataTable' &&
		prop === 'density' &&
		!['compact', 'comfortable', 'spacious'].includes(String(value))
	) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (
		component === 'dataTable' &&
		prop === 'selectionMode' &&
		!['multiple', 'none', 'single'].includes(String(value))
	) {
		throw new TypeError(`${location} has an invalid value.`);
	}
	if (component === 'dataTable' && ['overscan', 'rowHeight'].includes(prop)) {
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			throw new TypeError(`${location} must be a finite number.`);
		}
		if (prop === 'overscan' && (!Number.isInteger(value) || value < 0)) {
			throw new TypeError(`${location} must be a non-negative integer.`);
		}
		if (prop === 'rowHeight' && value <= 0) {
			throw new TypeError(`${location} must be positive.`);
		}
	}
}

function cloneComponent(
	component: string,
	value: unknown
): Record<string, ComponentDefaultPrimitive> {
	assertPlainRecord(value, `componentDefaults.${component}`);
	const result: Record<string, ComponentDefaultPrimitive> = Object.create(null);
	for (const [prop, propValue] of Object.entries(value)) {
		if (!COMPONENT_PROPS[component as keyof typeof COMPONENT_PROPS]?.has(prop as never)) {
			throw new TypeError(`Unknown component default "${component}.${prop}".`);
		}
		if (propValue === undefined) continue;
		validateProp(component, prop, propValue);
		result[prop] = propValue as ComponentDefaultPrimitive;
	}
	return result;
}

function freezeDefaults(
	value: Record<string, Record<string, ComponentDefaultPrimitive>>
): ResolvedZuiComponentDefaults {
	for (const component of Object.keys(value)) Object.freeze(value[component]);
	return Object.freeze(value) as ResolvedZuiComponentDefaults;
}

export function resolveComponentDefaults(
	parent: ResolvedZuiComponentDefaults | undefined,
	source: ZuiComponentDefaults | null | undefined
): ResolvedZuiComponentDefaults {
	if (source === undefined) return parent ?? freezeDefaults(Object.create(null));
	if (source === null) return freezeDefaults(Object.create(null));
	assertPlainRecord(source, 'componentDefaults');
	const result: Record<string, Record<string, ComponentDefaultPrimitive>> = Object.create(null);
	for (const [component, value] of Object.entries(parent ?? {})) {
		result[component] = Object.assign(Object.create(null), value);
	}
	for (const [component, value] of Object.entries(source)) {
		if (!COMPONENTS.has(component))
			throw new TypeError(`Unknown component default component "${component}".`);
		if (value === null) {
			delete result[component];
			continue;
		}
		const next = cloneComponent(component, value);
		result[component] = Object.assign(Object.create(null), result[component] ?? {}, next);
	}
	return freezeDefaults(result);
}

function stable(value: unknown): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value !== 'object') return JSON.stringify(value) ?? 'undefined';
	const record = value as Record<string, unknown>;
	return `{${Object.keys(record)
		.sort()
		.map((key) => `${JSON.stringify(key)}:${stable(record[key])}`)
		.join(',')}}`;
}

export function componentDefaultsFingerprint(value: ResolvedZuiComponentDefaults): string {
	return stable(value);
}
