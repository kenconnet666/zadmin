import type { IcssStyle } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';

function styleFocusRing(s: IcssStyle<ZuiTheme>): void {
	s.outlineColor._focus;
	s.outlineOffset._outer;
	s.outlineStyle.solid;
	s.outlineWidth._medium;
}

export function styleInternalFocusRing(s: IcssStyle<ZuiTheme>): void {
	s._focusVisible((focus) => styleFocusRing(focus));
}

export function styleInternalFocusWithinRing(s: IcssStyle<ZuiTheme>): void {
	s._selector('&:focus-within', (focus) => styleFocusRing(focus));
}

export function styleInternalAction(s: IcssStyle<ZuiTheme>): void {
	s.alignItems.center;
	s.appearance.none;
	s.backgroundColor.transparent;
	s.borderColor.transparent;
	s.borderRadius._medium;
	s.borderStyle.solid;
	s.borderWidth._hairline;
	s.cursor.pointer;
	s.display.inlineFlex;
	s.justifyContent.center;
	s.lineHeight(1);
	s._hover((hover) => hover.backgroundColor._surface);
	s._disabled((disabled) => {
		disabled.cursor.notAllowed;
		disabled.opacity._disabled;
	});
	styleInternalFocusRing(s);
}
