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

/** Composite date/time fields delegate the disabled fade to an enclosing InputGroup. */
export function compositeInputDisabledStyles(s: IcssStyle<ZuiTheme>): void {
	s._selector('&:not([data-zui-input-group-control]):has(> input:disabled)', disabledControlStyles);
	s._selector('&:has(> input:disabled) > button:disabled', (s) => s.opacity(1));
}
