import type { IcssStyle } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';

/** Apply to the visible control owner, never to a transparent native hit target. */
export function disabledControlStyles(s: IcssStyle<ZuiTheme>): void {
	s.cursor.notAllowed;
	s.opacity._disabled;
}

/** Native :disabled also observes a parent fieldset, including its first-legend exception. */
export function nativeDisabledControlStyles(s: IcssStyle<ZuiTheme>): void {
	s._selector('&:disabled', disabledControlStyles);
}
