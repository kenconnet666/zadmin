import { describe, expect, it } from 'vitest';

import {
	defaultMiniappTheme,
	extendMiniappTheme,
	mcss,
	mergeMiniStyles,
	rpx
} from '../src/index.ts';

describe('Miniapp theme and mcss', () => {
	it('emits deterministic static WXSS without runtime style injection', () => {
		const first = mcss({ display: 'flex', gap: rpx(16) });
		const second = mcss({ display: 'flex', gap: rpx(16) });

		expect(first).toEqual(second);
		expect(first.className).toMatch(/^m-[a-z0-9]+$/u);
		expect(first.wxss).toContain('display:flex;gap:16rpx');
		expect(first.style).toBeUndefined();
	});

	it('merges dynamic leaf styles and validates the WeChat property subset', () => {
		expect(mergeMiniStyles('color:red;', { opacity: 0.5, width: '100rpx' })).toBe(
			'color:red;opacity:0.5;width:100rpx'
		);
		expect(() => mcss({ position: 'fixed' })).toThrow(/not supported by WeChat/);
		expect(() => rpx(Number.NaN)).toThrow(/finite/);
	});

	it('extends the independent mobile theme immutably', () => {
		const theme = extendMiniappTheme(defaultMiniappTheme, {
			color: { primary: '#7c3aed' },
			touch: { minTarget: '96rpx' }
		});
		expect(theme.color.primary).toBe('#7c3aed');
		expect(theme.touch.minTarget).toBe('96rpx');
		expect(defaultMiniappTheme.color.primary).toBe('#2563eb');
		expect(Object.isFrozen(theme.color)).toBe(true);
		expect(() => extendMiniappTheme(defaultMiniappTheme, { missing: {} } as never)).toThrow(
			/Unknown Miniapp theme group/
		);
	});
});
