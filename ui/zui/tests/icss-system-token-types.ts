import { createStyleProgram, defaultTheme } from '../src/entrypoints/index.js';

export function verifySystemTokenTypes(): void {
	createStyleProgram(defaultTheme, (s) => {
		s.backgroundColor.canvas;
		s.color.canvasText;
		s.backgroundColor._canvas;
		s.outlineOffset._outer;
		s.transitionTimingFunction._standard;
		s.transitionTimingFunction.ease;
		s._media({ min: 'small', max: 'medium' }, (m) => m.display.block);
		// @ts-expect-error A breakpoint query must specify a boundary.
		s._media({}, () => undefined);
		// @ts-expect-error Unknown theme breakpoint.
		s._media({ min: 'phone' }, () => undefined);
		// @ts-expect-error Deprecated CSS system color has no convenience accessor.
		s.color.windowText;
	});
}
