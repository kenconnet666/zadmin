/**
 * Provider defaults share one typed rule source for public shapes and runtime validation.
 * No component/Svelte imports: this remains usable from SSR and package tooling.
 */
/* eslint @typescript-eslint/no-empty-object-type: ["error", { "allowInterfaces": "with-single-extends" }] -- Preserve public interface declarations while deriving their fields from the validation rules. */
import { controlSizes } from './control-size.js';
import { semanticTones } from '../../theme/semantics.js';
import { DEFAULT_THEME_SCHEMA } from '../../theme/schema.js';

export type ComponentDefaultPrimitive = string | number | boolean;

type ComponentDefaultRule =
	| { readonly kind: 'boolean' }
	| { readonly kind: 'enum'; readonly values: readonly string[] }
	| {
			readonly kind: 'enum-or-number';
			readonly values: readonly string[];
			readonly exclusiveMinimum: number;
	  }
	| { readonly kind: 'integer'; readonly minimum: number }
	| { readonly kind: 'number'; readonly exclusiveMinimum: number };

function keys<T extends object>(source: T): readonly Extract<keyof T, string>[] {
	return Object.freeze(Object.keys(source)) as readonly Extract<keyof T, string>[];
}

const buttonRules = {
	fullWidth: { kind: 'boolean' },
	shape: { kind: 'enum', values: ['default', 'circle', 'square'] },
	size: { kind: 'enum', values: controlSizes },
	tone: { kind: 'enum', values: ['primary', ...semanticTones] },
	variant: { kind: 'enum', values: ['ghost', 'solid', 'outline'] }
} as const;

const typographyRules = {
	lineHeight: { kind: 'enum', values: keys(DEFAULT_THEME_SCHEMA.lineHeight) },
	size: { kind: 'enum', values: keys(DEFAULT_THEME_SCHEMA.fontSize) },
	tone: { kind: 'enum', values: ['primary', 'muted', ...semanticTones] },
	weight: { kind: 'enum', values: keys(DEFAULT_THEME_SCHEMA.fontWeight) }
} as const;

const actionButtonRules = {
	shape: buttonRules.shape,
	size: buttonRules.size,
	tone: buttonRules.tone,
	variant: buttonRules.variant
} as const;

const navigationRules = {
	size: buttonRules.size,
	tone: buttonRules.tone,
	variant: { kind: 'enum', values: ['subtle', 'solid', 'outline'] }
} as const;

const COMPONENT_RULES = {
	avatar: {
		shape: { kind: 'enum', values: ['circle', 'rounded', 'square'] },
		size: { kind: 'enum', values: controlSizes }
	},
	badge: {
		overlap: { kind: 'enum', values: ['circular', 'rectangular'] },
		placement: { kind: 'enum', values: ['bottom-end', 'bottom-start', 'top-end', 'top-start'] },
		size: { kind: 'enum', values: controlSizes },
		tone: { kind: 'enum', values: semanticTones }
	},
	button: buttonRules,
	copyButton: actionButtonRules,
	backTop: actionButtonRules,
	card: {
		elevation: { kind: 'enum', values: ['large', 'medium', 'none', 'small'] },
		variant: { kind: 'enum', values: ['elevated', 'outlined'] }
	},
	dataTable: {
		density: { kind: 'enum', values: ['compact', 'comfortable', 'spacious'] },
		overscan: { kind: 'integer', minimum: 0 },
		rowHeight: { exclusiveMinimum: 0, kind: 'number' },
		selectionMode: { kind: 'enum', values: ['multiple', 'none', 'single'] },
		stickyHeader: { kind: 'boolean' },
		striped: { kind: 'boolean' },
		virtualized: { kind: 'boolean' }
	},
	dialog: { size: { kind: 'enum', values: controlSizes } },
	heading: {
		...typographyRules,
		wrap: { kind: 'enum', values: ['balance', 'pretty', 'wrap', 'nowrap'] }
	},
	icon: {
		size: { kind: 'enum-or-number', values: ['full', ...controlSizes], exclusiveMinimum: 0 },
		strokeWidth: { kind: 'number', exclusiveMinimum: 0 }
	},
	input: { size: { kind: 'enum', values: controlSizes } },
	checkbox: { size: buttonRules.size, tone: buttonRules.tone },
	checkboxGroup: { size: buttonRules.size, tone: buttonRules.tone },
	passwordInput: { size: buttonRules.size },
	nativeSelect: { size: buttonRules.size },
	calendar: { size: buttonRules.size },
	dateField: { size: buttonRules.size },
	timeField: { size: buttonRules.size },
	datePicker: { size: buttonRules.size },
	dateRangePicker: { size: buttonRules.size },
	timePicker: { size: buttonRules.size },
	timeRangePicker: { size: buttonRules.size },
	dateTimeField: { size: buttonRules.size },
	dateTimePicker: { size: buttonRules.size },
	dateTimeRangePicker: { size: buttonRules.size },
	numberField: { size: buttonRules.size },
	fieldset: {
		size: buttonRules.size,
		variant: { kind: 'enum', values: ['outlined', 'filled', 'plain'] }
	},
	slider: { size: buttonRules.size, tone: buttonRules.tone },
	rangeSlider: { size: buttonRules.size, tone: buttonRules.tone },
	rating: { size: buttonRules.size, tone: buttonRules.tone },
	link: {
		appearance: { kind: 'enum', values: ['text', 'button', 'navigation'] },
		size: { kind: 'enum', values: controlSizes },
		tone: typographyRules.tone,
		underline: { kind: 'enum', values: ['always', 'hover', 'none'] },
		variant: buttonRules.variant
	},
	navLink: { ...navigationRules, indicator: { kind: 'enum', values: ['none', 'start', 'end'] } },
	navigationMenu: navigationRules,
	anchor: { size: buttonRules.size, tone: typographyRules.tone },
	menubar: { size: buttonRules.size },
	resizable: { size: buttonRules.size },
	splitter: { size: buttonRules.size },
	pagination: {
		mode: { kind: 'enum', values: ['compact', 'default', 'simple'] },
		size: { kind: 'enum', values: controlSizes }
	},
	spinner: {
		size: { kind: 'enum', values: controlSizes },
		tone: { kind: 'enum', values: ['inherit', 'muted', 'primary'] }
	},
	segmented: { size: buttonRules.size },
	tag: {
		size: { kind: 'enum', values: controlSizes },
		tone: { kind: 'enum', values: semanticTones }
	},
	text: typographyRules,
	toggleButton: buttonRules,
	toggleGroup: {
		shape: buttonRules.shape,
		size: buttonRules.size,
		tone: buttonRules.tone,
		variant: buttonRules.variant
	},
	toolbar: { size: buttonRules.size },
	tooltip: { size: { kind: 'enum', values: controlSizes } }
} as const satisfies Readonly<Record<string, Readonly<Record<string, ComponentDefaultRule>>>>;

type RuleValue<TRule extends ComponentDefaultRule> = TRule extends { readonly kind: 'boolean' }
	? boolean
	: TRule extends { readonly kind: 'enum'; readonly values: readonly (infer TValue)[] }
		? TValue
		: TRule extends { readonly kind: 'enum-or-number'; readonly values: readonly (infer TValue)[] }
			? TValue | number
			: number;

type DefaultsFor<TName extends keyof typeof COMPONENT_RULES> = {
	readonly [
		TProp in keyof (typeof COMPONENT_RULES)[TName]
	]?: (typeof COMPONENT_RULES)[TName][TProp] extends ComponentDefaultRule
		? RuleValue<(typeof COMPONENT_RULES)[TName][TProp]>
		: never;
};

export interface AvatarComponentDefaults extends DefaultsFor<'avatar'> {}
export interface BadgeComponentDefaults extends DefaultsFor<'badge'> {}
export interface ButtonComponentDefaults extends DefaultsFor<'button'> {}
export interface CopyButtonComponentDefaults extends DefaultsFor<'copyButton'> {}
export interface BackTopComponentDefaults extends DefaultsFor<'backTop'> {}
export interface CardComponentDefaults extends DefaultsFor<'card'> {}
export interface DataTableComponentDefaults extends DefaultsFor<'dataTable'> {}
export interface DialogComponentDefaults extends DefaultsFor<'dialog'> {}
export interface HeadingComponentDefaults extends DefaultsFor<'heading'> {}
export interface IconComponentDefaults extends DefaultsFor<'icon'> {}
export interface InputComponentDefaults extends DefaultsFor<'input'> {}
export interface CheckboxComponentDefaults extends DefaultsFor<'checkbox'> {}
export interface CheckboxGroupComponentDefaults extends DefaultsFor<'checkboxGroup'> {}
export interface PasswordInputComponentDefaults extends DefaultsFor<'passwordInput'> {}
export interface NativeSelectComponentDefaults extends DefaultsFor<'nativeSelect'> {}
export interface CalendarComponentDefaults extends DefaultsFor<'calendar'> {}
export interface DateFieldComponentDefaults extends DefaultsFor<'dateField'> {}
export interface TimeFieldComponentDefaults extends DefaultsFor<'timeField'> {}
export interface DatePickerComponentDefaults extends DefaultsFor<'datePicker'> {}
export interface DateRangePickerComponentDefaults extends DefaultsFor<'dateRangePicker'> {}
export interface TimePickerComponentDefaults extends DefaultsFor<'timePicker'> {}
export interface TimeRangePickerComponentDefaults extends DefaultsFor<'timeRangePicker'> {}
export interface DateTimeFieldComponentDefaults extends DefaultsFor<'dateTimeField'> {}
export interface DateTimePickerComponentDefaults extends DefaultsFor<'dateTimePicker'> {}
export interface DateTimeRangePickerComponentDefaults extends DefaultsFor<'dateTimeRangePicker'> {}
export interface NumberFieldComponentDefaults extends DefaultsFor<'numberField'> {}
export interface FieldsetComponentDefaults extends DefaultsFor<'fieldset'> {}
export interface SliderComponentDefaults extends DefaultsFor<'slider'> {}
export interface RangeSliderComponentDefaults extends DefaultsFor<'rangeSlider'> {}
export interface RatingComponentDefaults extends DefaultsFor<'rating'> {}
export interface LinkComponentDefaults extends DefaultsFor<'link'> {}
export interface NavLinkComponentDefaults extends DefaultsFor<'navLink'> {}
export interface NavigationMenuComponentDefaults extends DefaultsFor<'navigationMenu'> {}
export interface AnchorComponentDefaults extends DefaultsFor<'anchor'> {}
export interface MenubarComponentDefaults extends DefaultsFor<'menubar'> {}
export interface ResizableComponentDefaults extends DefaultsFor<'resizable'> {}
export interface SplitterComponentDefaults extends DefaultsFor<'splitter'> {}
export interface PaginationComponentDefaults extends DefaultsFor<'pagination'> {}
export interface SpinnerComponentDefaults extends DefaultsFor<'spinner'> {}
export interface SegmentedComponentDefaults extends DefaultsFor<'segmented'> {}
export interface TagComponentDefaults extends DefaultsFor<'tag'> {}
export interface TextComponentDefaults extends DefaultsFor<'text'> {}
export interface ToggleButtonComponentDefaults extends DefaultsFor<'toggleButton'> {}
export interface ToggleGroupComponentDefaults extends DefaultsFor<'toggleGroup'> {}
export interface ToolbarComponentDefaults extends DefaultsFor<'toolbar'> {}
export interface TooltipComponentDefaults extends DefaultsFor<'tooltip'> {}

type DefaultsWithStops = {
	readonly [TName in keyof typeof COMPONENT_RULES]?: DefaultsFor<TName> | null;
};
type ResolvedDefaults = {
	readonly [TName in keyof typeof COMPONENT_RULES]?: DefaultsFor<TName>;
};
export interface ZuiComponentDefaults extends DefaultsWithStops {}
export interface ResolvedZuiComponentDefaults extends ResolvedDefaults {}

/** Explicit props win; only undefined asks for a configured or built-in visual default. */
export function resolveComponentDefault<T>(
	value: T | undefined,
	configured: T | undefined,
	fallback: T
): T {
	return value === undefined ? (configured === undefined ? fallback : configured) : value;
}

const COMPONENTS = new Set(Object.keys(COMPONENT_RULES));
const CONTROLLED_OR_UNSAFE = new Set([
	'checked',
	'defaultChecked',
	'defaultPressed',
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
		case 'enum-or-number':
			if (typeof value === 'string' && rule.values.includes(value)) return;
			if (typeof value === 'number' && value > rule.exclusiveMinimum) return;
			throw new TypeError(
				`${location} must be a declared preset or a number greater than ${rule.exclusiveMinimum}.`
			);
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
