import { describe, expect, it } from 'vitest';

import {
	resolveComponentDefaults,
	resolveComponentDefault,
	type ResolvedZuiComponentDefaults
} from '../src/runtime/foundation/component-defaults.js';

describe('component defaults foundation', () => {
	it('merges input family visual defaults without sharing value or interaction policy', () => {
		const parent = resolveComponentDefaults(undefined, {
			slider: { size: 'large', tone: 'success' },
			rangeSlider: { tone: 'info' },
			rating: { size: 'small' },
			fieldset: { variant: 'filled' }
		});
		const child = resolveComponentDefaults(parent, {
			slider: { size: 'small' },
			rangeSlider: null,
			fieldset: { size: 'large' }
		});
		expect(child.slider).toEqual({ size: 'small', tone: 'success' });
		expect(child.rangeSlider).toBeUndefined();
		expect(child.rating).toEqual({ size: 'small' });
		expect(child.fieldset).toEqual({ variant: 'filled', size: 'large' });
		expect(() => resolveComponentDefaults(undefined, { rating: { value: 3 } } as never)).toThrow();
		expect(() =>
			resolveComponentDefaults(undefined, { fieldset: { disabled: true } } as never)
		).toThrow();
	});
	it('accepts scoped Toolbar and choice appearance without accepting selection ownership', () => {
		const parent = resolveComponentDefaults(undefined, {
			button: { size: 'small' },
			toolbar: { size: 'large' },
			toggleGroup: { variant: 'outline' },
			segmented: { size: 'xlarge' }
		});
		const child = resolveComponentDefaults(parent, { toggleGroup: { tone: 'warning' } });
		expect(child.toggleGroup).toEqual({ variant: 'outline', tone: 'warning' });
		expect(child.toolbar).toEqual({ size: 'large' });
		expect(child.segmented).toEqual({ size: 'xlarge' });
		for (const unsafe of [{ value: ['one'] }, { selectionMode: 'multiple' }, { roving: false }])
			expect(() => resolveComponentDefaults(parent, { toggleGroup: unsafe } as never)).toThrow();
	});
	it('merges shallowly, supports null stops, and freezes snapshots', () => {
		const parent = resolveComponentDefaults(undefined, {
			button: { size: 'large', variant: 'solid' }
		});
		const child = resolveComponentDefaults(parent, {
			button: { size: 'small' },
			dataTable: { overscan: 4, virtualized: true }
		});
		expect(child).toEqual({
			button: { size: 'small', variant: 'solid' },
			dataTable: { overscan: 4, virtualized: true }
		});
		expect(Object.isFrozen(child)).toBe(true);
		expect(Object.isFrozen(child.button)).toBe(true);
		expect(Object.getPrototypeOf(child)).toBeNull();
		expect(Object.getPrototypeOf(child.button)).toBeNull();
		expect(resolveComponentDefaults(child, undefined)).toBe(child);
		expect(resolveComponentDefaults(child, null)).toEqual({});
	});

	it.each([
		['unknown component', { unknownComponent: { size: 'small' } }],
		['unknown prop', { button: { loading: true } }],
		['controlled state', { button: { value: 'x' } }],
		['callback', { button: { onClick: () => undefined } }],
		['DOM/CSS', { button: { style: 'color:red' } }],
		['non-finite number', { dataTable: { overscan: Number.POSITIVE_INFINITY } }],
		['boolean string', { dataTable: { striped: 'true' } }],
		['invalid overscan', { dataTable: { overscan: -1 } }],
		['invalid rowHeight', { dataTable: { rowHeight: 0 } }],
		['invalid input size', { input: { size: 'giant' } }],
		['invalid tag tone', { tag: { tone: 'accent' } }],
		['invalid card variant', { card: { variant: 'filled' } }],
		['invalid pagination mode', { pagination: { mode: 'cursor' } }],
		['nested object', { button: { size: { value: 'small' } } }]
	] as const)('rejects %s', (_, source) => {
		expect(() => resolveComponentDefaults(undefined, source as never)).toThrow();
	});

	it('rejects hidden, symbol and accessor defaults instead of silently ignoring them', () => {
		const hidden = {} as { button?: { size?: string } };
		Object.defineProperty(hidden, 'button', { enumerable: false, value: { size: 'small' } });
		const symbol = { button: { size: 'small' }, [Symbol('hidden')]: true };
		const accessor = {} as { button?: unknown };
		Object.defineProperty(accessor, 'button', { enumerable: true, get: () => ({ size: 'small' }) });
		const nestedHidden = { button: {} };
		Object.defineProperty(nestedHidden.button, 'size', { enumerable: false, value: 'small' });
		const nestedSymbol = { button: { size: 'small', [Symbol('hidden')]: true } };
		const nestedAccessor = { button: {} as { size?: string } };
		Object.defineProperty(nestedAccessor.button, 'size', {
			enumerable: true,
			get: () => 'small'
		});
		expect(() => resolveComponentDefaults(undefined, hidden as never)).toThrow(/enumerable/u);
		expect(() => resolveComponentDefaults(undefined, symbol as never)).toThrow(/symbol/u);
		expect(() => resolveComponentDefaults(undefined, accessor as never)).toThrow(/data property/u);
		expect(() => resolveComponentDefaults(undefined, nestedHidden as never)).toThrow(/enumerable/u);
		expect(() => resolveComponentDefaults(undefined, nestedSymbol as never)).toThrow(/symbol/u);
		expect(() => resolveComponentDefaults(undefined, nestedAccessor as never)).toThrow(
			/data property/u
		);
	});

	it('reports unsafe props before generic unknown-prop diagnostics', () => {
		expect(() => resolveComponentDefaults(undefined, { button: { value: 'x' } } as never)).toThrow(
			/controlled or unsafe/u
		);
	});

	it('accepts zero overscan, fractional positive row height, and omits undefined', () => {
		const resolved = resolveComponentDefaults(undefined, {
			dataTable: { overscan: 0, rowHeight: 44.5, striped: undefined }
		});
		expect(resolved).toEqual({ dataTable: { overscan: 0, rowHeight: 44.5 } });
	});

	it('merges low-risk input, tag, card and pagination defaults', () => {
		const resolved = resolveComponentDefaults(undefined, {
			input: { size: 'large' },
			tag: { size: 'small', tone: 'info' },
			card: { variant: 'outlined' },
			pagination: { mode: 'simple' }
		});
		expect(resolved).toEqual({
			input: { size: 'large' },
			tag: { size: 'small', tone: 'info' },
			card: { variant: 'outlined' },
			pagination: { mode: 'simple' }
		});
	});

	it('does not mutate the caller source', () => {
		const source: { button: { size: 'small' | 'medium' } } = { button: { size: 'medium' } };
		const resolved = resolveComponentDefaults(undefined, source);
		source.button.size = 'small';
		expect((resolved as ResolvedZuiComponentDefaults).button?.size).toBe('medium');
	});

	it('accepts the new visual groups and preserves group-level merge and null stops', () => {
		const parent = resolveComponentDefaults(undefined, {
			text: { size: 'large', tone: 'info', weight: 'semibold', lineHeight: 'relaxed' },
			heading: { size: 'xxxlarge', tone: 'success', wrap: 'pretty' },
			icon: { size: 22, strokeWidth: 1.5 },
			spinner: { size: 'xlarge', tone: 'muted' },
			toggleButton: { variant: 'ghost', fullWidth: false },
			link: { appearance: 'button', underline: 'hover', tone: 'warning' },
			badge: { size: 'small', tone: 'warning', placement: 'bottom-start', overlap: 'circular' },
			avatar: { size: 'large', shape: 'square' },
			dialog: { size: 'small' },
			tooltip: { size: 'large' }
		});
		const child = resolveComponentDefaults(parent, {
			text: { tone: 'danger' },
			icon: null,
			badge: { size: undefined }
		});
		expect(child.text).toEqual({
			size: 'large',
			tone: 'danger',
			weight: 'semibold',
			lineHeight: 'relaxed'
		});
		expect(child.icon).toBeUndefined();
		expect(child.badge).toEqual(parent.badge);
		for (const group of Object.values(child)) expect(Object.isFrozen(group)).toBe(true);
		expect(parent.text?.tone).toBe('info');
	});

	it.each([
		{ text: { size: 'giant' } },
		{ text: { children: 'default text' } },
		{ heading: { level: 1 } },
		{ heading: { wrap: 'truncate' } },
		{ icon: { size: 0 } },
		{ icon: { size: Number.NaN } },
		{ icon: { name: 'check' } },
		{ icon: { strokeWidth: '2' } },
		{ spinner: { label: 'Business loading' } },
		{ spinner: { tone: 'success' } },
		{ toggleButton: { pressed: true } },
		{ link: { href: '/implicit-route' } },
		{ badge: { count: 5 } },
		{ avatar: { src: '/avatar.png' } },
		{ avatar: { alt: 'Everyone' } },
		{ dialog: { open: true } },
		{ dialog: { disabled: true } },
		{ tooltip: { openDelay: 300 } },
		{ tooltip: { size: 'giant' } }
	])('rejects data, behavior and unsupported visual defaults: %o', (source) => {
		expect(() => resolveComponentDefaults(undefined, source as never)).toThrow();
	});

	it('uses undefined for inheritance without swallowing explicit false, zero or null', () => {
		expect(resolveComponentDefault(undefined, 'large', 'medium')).toBe('large');
		expect(resolveComponentDefault(undefined, undefined, 'medium')).toBe('medium');
		expect(resolveComponentDefault(false, true, true)).toBe(false);
		expect(resolveComponentDefault(0, 1, 2)).toBe(0);
		expect(resolveComponentDefault(null, 'configured', 'built-in')).toBeNull();
	});
});
