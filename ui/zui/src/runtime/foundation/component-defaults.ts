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

export interface DataTableComponentDefaults {
	readonly density?: 'compact' | 'comfortable' | 'spacious';
	readonly selectionMode?: 'multiple' | 'none' | 'single';
	readonly stickyHeader?: boolean;
	readonly striped?: boolean;
	readonly virtualized?: boolean;
	readonly overscan?: number;
	readonly rowHeight?: number;
}

export interface InputComponentDefaults {
	readonly size?: 'small' | 'medium' | 'large';
}

export interface TagComponentDefaults {
	readonly size?: 'small' | 'medium';
	readonly tone?: 'accent' | 'danger' | 'default' | 'success' | 'warning';
}

export interface CardComponentDefaults {
	readonly variant?: 'elevated' | 'outlined';
}

export interface PaginationComponentDefaults {
	readonly mode?: 'compact' | 'default' | 'simple';
}

export interface ZuiComponentDefaults {
	readonly button?: ButtonComponentDefaults | null;
	readonly card?: CardComponentDefaults | null;
	readonly dataTable?: DataTableComponentDefaults | null;
	readonly input?: InputComponentDefaults | null;
	readonly pagination?: PaginationComponentDefaults | null;
	readonly tag?: TagComponentDefaults | null;
}

export interface ResolvedZuiComponentDefaults {
	readonly button?: ButtonComponentDefaults;
	readonly card?: CardComponentDefaults;
	readonly dataTable?: DataTableComponentDefaults;
	readonly input?: InputComponentDefaults;
	readonly pagination?: PaginationComponentDefaults;
	readonly tag?: TagComponentDefaults;
}

type ComponentDefaultRule =
	| { readonly kind: 'boolean' }
	| { readonly kind: 'enum'; readonly values: readonly string[] }
	| { readonly kind: 'integer'; readonly minimum: number }
	| { readonly exclusiveMinimum: number; readonly kind: 'number' };

const COMPONENT_RULES = {
	button: {
		fullWidth: { kind: 'boolean' },
		shape: { kind: 'enum', values: ['default', 'circle', 'square'] },
		size: { kind: 'enum', values: ['small', 'medium', 'large'] },
		tone: { kind: 'enum', values: ['default', 'danger'] },
		variant: { kind: 'enum', values: ['ghost', 'primary', 'secondary'] }
	},
	card: { variant: { kind: 'enum', values: ['elevated', 'outlined'] } },
	dataTable: {
		density: { kind: 'enum', values: ['compact', 'comfortable', 'spacious'] },
		overscan: { kind: 'integer', minimum: 0 },
		rowHeight: { exclusiveMinimum: 0, kind: 'number' },
		selectionMode: { kind: 'enum', values: ['multiple', 'none', 'single'] },
		stickyHeader: { kind: 'boolean' },
		striped: { kind: 'boolean' },
		virtualized: { kind: 'boolean' }
	},
	input: { size: { kind: 'enum', values: ['small', 'medium', 'large'] } },
	pagination: { mode: { kind: 'enum', values: ['compact', 'default', 'simple'] } },
	tag: {
		size: { kind: 'enum', values: ['small', 'medium'] },
		tone: {
			kind: 'enum',
			values: ['accent', 'danger', 'default', 'success', 'warning']
		}
	}
} as const satisfies Readonly<Record<string, Readonly<Record<string, ComponentDefaultRule>>>>;

const COMPONENTS = new Set(Object.keys(COMPONENT_RULES));
const CONTROLLED_OR_UNSAFE = new Set([
	'checked',
	'defaultOpen',
	'defaultPage',
	'defaultPageSize',
	'defaultSelectedKeys',
	'defaultValue',
	'disabled',
	'loading',
	'open',
	'page',
	'pageSize',
	'pressed',
	'readonly',
	'removable',
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
	for (const key of Reflect.ownKeys(value)) {
		if (typeof key !== 'string') throw new TypeError(`${location} must not contain symbol keys.`);
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor?.enumerable || descriptor.get !== undefined || descriptor.set !== undefined) {
			throw new TypeError(`${location}.${key} must be an enumerable data property.`);
		}
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
	assertPrimitive(value, location);
	const rules = COMPONENT_RULES[component as keyof typeof COMPONENT_RULES];
	const rule = rules?.[prop as keyof typeof rules] as ComponentDefaultRule | undefined;
	if (!rule) throw new TypeError(`Unknown component default "${component}.${prop}".`);
	switch (rule.kind) {
		case 'boolean':
			if (typeof value !== 'boolean') throw new TypeError(`${location} must be a boolean.`);
			return;
		case 'enum':
			if (typeof value !== 'string' || !rule.values.includes(value))
				throw new TypeError(`${location} has an invalid value.`);
			return;
		case 'integer':
			if (typeof value !== 'number' || !Number.isInteger(value) || value < rule.minimum)
				throw new TypeError(`${location} must be an integer of at least ${rule.minimum}.`);
			return;
		case 'number':
			if (typeof value !== 'number' || value <= rule.exclusiveMinimum)
				throw new TypeError(`${location} must be greater than ${rule.exclusiveMinimum}.`);
	}
}

function cloneComponent(
	component: string,
	value: unknown
): Record<string, ComponentDefaultPrimitive> {
	assertPlainRecord(value, `componentDefaults.${component}`);
	const result: Record<string, ComponentDefaultPrimitive> = Object.create(null);
	for (const [prop, propValue] of Object.entries(value)) {
		if (
			CONTROLLED_OR_UNSAFE.has(prop) ||
			prop.startsWith('on') ||
			typeof propValue === 'function'
		) {
			throw new TypeError(
				`componentDefaults.${component}.${prop} is controlled or unsafe and cannot be a component default.`
			);
		}
		if (!Object.hasOwn(COMPONENT_RULES[component as keyof typeof COMPONENT_RULES] ?? {}, prop)) {
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
