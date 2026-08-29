import { describe, expect, it } from 'vitest';

import { createZuiId, createZuiIdScope } from '../src/runtime/ids.js';

describe('ZUI foundation runtime', () => {
	it('creates scoped SSR-stable ids and rejects ambiguous parts', () => {
		expect(createZuiId('zui', 's1')).toBe('zui-s1');
		expect(createZuiId('admin', 's1', 'control')).toBe('admin-s1-control');
		const scoped = createZuiIdScope('docs', 's2');
		expect(scoped()).toBe('docs-s2');
		expect(scoped('label')).toBe('docs-s2-label');
		expect(() => createZuiId('', 's1')).toThrow(/prefix/);
		expect(() => createZuiId('zui', 'bad id')).toThrow(/local id/);
		expect(() => createZuiId('zui', 's1', 'bad suffix')).toThrow(/suffix/);
	});
});
