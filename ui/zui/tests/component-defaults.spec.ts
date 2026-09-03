import { describe, expect, it } from 'vitest';

import {
	componentDefaultsFingerprint,
	resolveComponentDefaults,
	type ResolvedZuiComponentDefaults
} from '../src/runtime/foundation/component-defaults.js';

describe('component defaults foundation', () => {
	it('merges shallowly, supports null stops, and freezes snapshots', () => {
		const parent = resolveComponentDefaults(undefined, {
			button: { size: 'large', variant: 'primary' },
			dialog: { trapFocus: true }
		});
		const child = resolveComponentDefaults(parent, {
			button: { size: 'small' },
			dialog: null,
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

	it('fingerprints independent of insertion order', () => {
		const left = resolveComponentDefaults(undefined, {
			button: { size: 'small', fullWidth: false }
		});
		const right = resolveComponentDefaults(undefined, {
			button: { fullWidth: false, size: 'small' }
		});
		expect(componentDefaultsFingerprint(left)).toBe(componentDefaultsFingerprint(right));
	});

	it.each([
		['unknown component', { card: { size: 'small' } }],
		['unknown prop', { button: { loading: true } }],
		['controlled state', { dialog: { open: true } }],
		['callback', { button: { onClick: () => undefined } }],
		['DOM/CSS', { button: { style: 'color:red' } }],
		['non-finite number', { dataTable: { overscan: Number.POSITIVE_INFINITY } }],
		['boolean string', { dataTable: { striped: 'true' } }],
		['invalid overscan', { dataTable: { overscan: -1 } }],
		['invalid rowHeight', { dataTable: { rowHeight: 0 } }],
		['nested object', { button: { size: { value: 'small' } } }]
	] as const)('rejects %s', (_, source) => {
		expect(() => resolveComponentDefaults(undefined, source as never)).toThrow();
	});

	it('accepts zero overscan, fractional positive row height, and omits undefined', () => {
		const resolved = resolveComponentDefaults(undefined, {
			dataTable: { overscan: 0, rowHeight: 44.5, striped: undefined }
		});
		expect(resolved).toEqual({ dataTable: { overscan: 0, rowHeight: 44.5 } });
	});

	it('does not mutate the caller source', () => {
		const source: { button: { size: 'small' | 'medium' } } = { button: { size: 'medium' } };
		const resolved = resolveComponentDefaults(undefined, source);
		source.button.size = 'small';
		expect((resolved as ResolvedZuiComponentDefaults).button?.size).toBe('medium');
	});
});
