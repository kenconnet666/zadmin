import { createIcssSlot, createStyleProgram, defaultTheme } from '@zadmin/zui-core';
import { describe, expect, it } from 'vitest';

import { bindTaroIcss, compileTaroIcss, rpx, slotValues } from '../src/compiler/index.ts';

describe('Taro ICSS compiler', () => {
	it('emits deterministic flat WXSS with tokens, px, percent, and explicit rpx', () => {
		const program = createStyleProgram(defaultTheme, (css) => {
			css.color._primary;
			css.padding.px(8, 16);
			css.width.percent(100);
			css.margin.raw(rpx(12));
		});
		const first = compileTaroIcss(program);
		const second = compileTaroIcss(program);
		expect(first).toEqual(second);
		expect(first.className).toMatch(/^zt-[a-z0-9]+$/u);
		expect(first.cssText).toContain('color:#2563eb');
		expect(first.cssText).toContain('padding:8px 16px');
		expect(first.cssText).toContain('width:100%');
		expect(first.cssText).toContain('margin:12rpx');
	});

	it('keeps one class while binding only dynamic leaves', () => {
		const width = createIcssSlot('panel-width', 'panelWidth');
		const opacity = createIcssSlot('panel-opacity');
		const compiled = compileTaroIcss(
			createStyleProgram(defaultTheme, (css) => {
				css.backgroundColor._surface;
				css.width.px(width);
				css.opacity(opacity);
			})
		);
		expect(compiled.cssText).toContain('background-color:#f8fafc');
		expect(compiled.cssText).not.toContain('width');
		expect(
			bindTaroIcss(
				compiled,
				slotValues([
					[width, 320],
					[opacity, 0.8]
				])
			)
		).toBe('width:320px;opacity:0.8');
		expect(bindTaroIcss(compiled, { 'panel-width': null })).toBeUndefined();
		expect(() => bindTaroIcss(compiled, { 'panel-width': Number.NaN })).toThrow(/finite/u);
	});

	it('rejects unsupported selectors, properties, and units instead of emitting invalid WXSS', () => {
		expect(() =>
			compileTaroIcss(
				createStyleProgram(defaultTheme, (css) => css._hover((hover) => hover.color._primary))
			)
		).toThrow(/selector/u);
		expect(() =>
			compileTaroIcss(createStyleProgram(defaultTheme, (css) => css.cursor.pointer))
		).toThrow(/not supported/u);
		expect(() =>
			compileTaroIcss(createStyleProgram(defaultTheme, (css) => css.width.em(2)))
		).toThrow(/unit "em"/u);
		expect(() => rpx(Number.POSITIVE_INFINITY)).toThrow(/finite/u);
	});
});
