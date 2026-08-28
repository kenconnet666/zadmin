import { describe, expect, it } from 'vitest';
import { hashString } from '@zadmin/zui/core';

import { StyleRegistry } from '../src/lib/icss/registry.js';
import { createIcssRuntime } from '../src/lib/icss/runtime.js';
import { hyphenateProperty } from '../src/lib/icss/serialize.js';
import { MemoryStyleSheet } from '../src/lib/icss/sheet.js';
import { defaultTheme } from '../src/lib/index.js';

describe('ICSS runtime edge behavior', () => {
	it('hashes deterministically and hyphenates standard and custom properties', () => {
		expect(hashString('same')).toBe(hashString('same'));
		expect(hashString('same')).not.toBe(hashString('different'));
		expect(hyphenateProperty('WebkitLineClamp')).toBe('-webkit-line-clamp');
		expect(hyphenateProperty('msOverflowStyle')).toBe('-ms-overflow-style');
		expect(hyphenateProperty('--already-custom')).toBe('--already-custom');
	});

	it('clears registries and validates structural limits', () => {
		expect(() => new StyleRegistry({ maxVariantsPerOwner: 0 })).toThrow(/positive integer/);
		expect(() => new StyleRegistry({ maxVariantsPerOwner: 1.5 })).toThrow(/positive integer/);

		const sheet = new MemoryStyleSheet();
		const registry = new StyleRegistry({ sheet });
		createIcssRuntime({ registry }).icss(defaultTheme, (s) => s.display.flex);
		expect(sheet.entries).toHaveLength(1);
		registry.clear();
		expect(registry.size).toBe(0);
		expect(sheet.entries).toHaveLength(0);
	});

	it('releases owner prefixes and tolerates unknown owner removals', () => {
		const registry = new StyleRegistry();
		const runtime = createIcssRuntime({ registry });
		runtime.ownedIcss('module:a', defaultTheme, (s) => s.color._primary);
		runtime.ownedIcss('module:b', defaultTheme, (s) => s.color._danger);
		registry.releaseOwner('missing');
		registry.releaseOwnerPrefix('module:');
		expect(registry.size).toBe(0);
	});

	it('escapes nonce attributes and raw style closing tags', () => {
		const registry = new StyleRegistry();
		createIcssRuntime({ registry }).icss(defaultTheme, (s) => s.content('</style><script>'));
		const tag = registry.styleTag({ nonce: 'a"<&' });

		expect(tag).toContain('nonce="a&quot;&lt;&amp;"');
		expect(tag).toContain('<\\/style>');
	});
});
