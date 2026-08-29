import { describe, expect, it } from 'vitest';

import { mergeStyles, serializeIcssVariables } from '../src/runtime/root-style.js';

describe('component ICSS variables', () => {
	it('serializes defined values and omits nullish entries', () => {
		expect(
			serializeIcssVariables({
				'--first': 1,
				'--removed': undefined,
				'--second': 'red'
			})
		).toBe('--first:1;--second:red');
		expect(serializeIcssVariables(undefined)).toBe('');
	});

	it('rejects invalid generated property names', () => {
		expect(() => serializeIcssVariables({ color: 'red' } as never)).toThrow(
			/Invalid ICSS variable/
		);
	});

	it('merges authored and generated inline styles without redundant separators', () => {
		expect(mergeStyles(undefined, '')).toBeUndefined();
		expect(mergeStyles('color:red;;', '')).toBe('color:red');
		expect(mergeStyles(undefined, '--x:1')).toBe('--x:1');
		expect(mergeStyles('color:red;', '--x:1')).toBe('color:red;--x:1');
	});
});
