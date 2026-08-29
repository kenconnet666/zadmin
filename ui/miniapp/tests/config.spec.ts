import { describe, expect, it } from 'vitest';

import { defineMiniappConfig } from '../src/vite/index.ts';

describe('defineMiniappConfig', () => {
	it('freezes the direct WeChat build contract', () => {
		const config = defineMiniappConfig({ outputRoot: 'dist/wechat', target: 'wechat' });
		expect(config).toEqual({ outputRoot: 'dist/wechat', target: 'wechat' });
		expect(Object.isFrozen(config)).toBe(true);
	});

	it('rejects unimplemented targets', () => {
		expect(() => defineMiniappConfig({ target: 'alipay' } as never)).toThrow(/only supports/);
	});
});
