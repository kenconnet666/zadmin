import { describe, expect, it } from 'vitest';

import {
	resolveComponentDefaults,
	type ResolvedZuiComponentDefaults
} from '../src/runtime/foundation/component-defaults.js';

describe('component defaults foundation', () => {
	it('merges shallowly, supports null stops, and freezes snapshots', () => {
		const parent = resolveComponentDefaults(undefined, {
			button: { size: 'large', variant: 'primary' }
		});
		const child = resolveComponentDefaults(parent, {
			button: { size: 'small' },
			dataTable: { overscan: 4, virtualized: true }
		});
		expect(child).toEqual({
			button: { size: 'small', variant: 'primary' },
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
		['unknown component', { badge: { size: 'small' } }],
		['unknown prop', { button: { loading: true } }],
		['controlled state', { button: { value: 'x' } }],
		['callback', { button: { onClick: () => undefined } }],
		['DOM/CSS', { button: { style: 'color:red' } }],
		['non-finite number', { dataTable: { overscan: Number.POSITIVE_INFINITY } }],
		['boolean string', { dataTable: { striped: 'true' } }],
		['invalid overscan', { dataTable: { overscan: -1 } }],
		['invalid rowHeight', { dataTable: { rowHeight: 0 } }],
		['invalid input size', { input: { size: 'giant' } }],
		['invalid tag tone', { tag: { tone: 'info' } }],
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
			tag: { size: 'small', tone: 'accent' },
			card: { variant: 'outlined' },
			pagination: { mode: 'simple' }
		});
		expect(resolved).toEqual({
			input: { size: 'large' },
			tag: { size: 'small', tone: 'accent' },
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
});
