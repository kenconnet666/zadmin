import { describe, expect, it } from 'vitest';
import { hashString } from '../src/icss/hash.js';

import { StyleRegistry } from '../src/icss/registry.js';
import { createIcssRuntime } from '../src/icss/runtime.js';
import { canonicalizeStyleProgram, hyphenateProperty } from '../src/icss/serialize.js';
import { MemoryStyleSheet } from '../src/icss/sheet.js';
import type { StyleProgram } from '../src/icss/types.js';
import { createIcssSlot } from '../src/icss/values.js';
import { defaultTheme } from '../src/entrypoints/index.js';

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

	it('serializes slots, string units, important declarations and nested blocks', () => {
		const slot = createIcssSlot('--runtime-width');
		const program = {
			block: {
				instructions: [
					{ important: false, kind: 'declaration', property: 'width', values: [{ value: slot }] },
					{
						important: false,
						kind: 'declaration',
						property: 'height',
						values: [{ unit: 'px', value: slot }]
					},
					{
						important: true,
						kind: 'declaration',
						property: 'lineHeight',
						values: [{ unit: 'px', value: 'normal' }]
					},
					{
						block: {
							instructions: [
								{
									important: false,
									kind: 'declaration',
									property: 'display',
									values: [{ value: 'block' }]
								}
							]
						},
						kind: 'nested',
						query: '@media (min-width: 40rem)',
						type: 'at-rule'
					}
				]
			},
			theme: defaultTheme
		} satisfies StyleProgram;

		expect(canonicalizeStyleProgram(program)).toBe(
			'width:var(--runtime-width);height:calc(var(--runtime-width) * 1px);line-height:normal!important;@media (min-width: 40rem){display:block;}'
		);

		const invalid = {
			block: {
				instructions: [
					{
						important: false,
						kind: 'declaration',
						property: 'width',
						values: [{ unit: 'unknown', value: 1 }]
					}
				]
			},
			theme: defaultTheme
		} as unknown as StyleProgram;
		expect(() => canonicalizeStyleProgram(invalid)).toThrow(/Unknown ICSS unit/u);
	});
});
