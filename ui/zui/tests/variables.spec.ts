import { describe, expect, it } from 'vitest';

import { mergeStyles, serializeIcssVariables } from '../src/runtime/foundation/root-style.js';
import {
	__icssCarrier,
	__icssSlot,
	__registerIcssHmr,
	readIcssCarrier
} from '../src/runtime/foundation/compiler-bridge.js';

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

	it('carries compiler variables through symbols and ignores unrelated attachments', () => {
		const carrier = __icssCarrier({ '--size': 12 });
		expect(readIcssCarrier(carrier)).toEqual({ '--size': 12 });
		expect(readIcssCarrier({ [Symbol('value')]: 1 })).toBeUndefined();
		expect(readIcssCarrier({ [Symbol('attachment')]: () => undefined })).toBeUndefined();
		expect((__icssSlot('--slot') as unknown as { id: string }).id).toBe('--slot');
		expect(() => __registerIcssHmr({} as ImportMeta, 'owner')).not.toThrow();
		let dispose: (() => void) | undefined;
		__registerIcssHmr(
			{ hot: { dispose: (callback: () => void) => (dispose = callback) } } as unknown as ImportMeta,
			'owner'
		);
		expect(dispose).toBeTypeOf('function');
		dispose?.();
	});
});
