import type { IcssStyle } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';

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
	s._focusVisible((focus) => {
		focus.outlineColor._focus;
		focus.outlineOffset.px(2);
		focus.outlineStyle.solid;
		focus.outlineWidth._medium;
	});
}
