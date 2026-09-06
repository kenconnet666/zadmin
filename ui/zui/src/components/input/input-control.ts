import { controlSizeStyles } from '../../runtime/foundation/control-size.js';
import type { IcssStyle } from '../../icss/types.js';
import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
import type { ZuiTheme } from '../../theme/types.js';

function styleGroupedControl(s: IcssStyle<ZuiTheme>): void {
	s.borderRadius._none;
	s.borderStyle.none;
	s.flex.raw('1 1 auto');
	s.minWidth.px(0);
	s.outlineStyle.none;
}

function styleGroupedControlFocus(s: IcssStyle<ZuiTheme>): void {
	s.outlineStyle.none;
}

function styleGroupOwnedDisabledOpacity(s: IcssStyle<ZuiTheme>): void {
	s.opacity._opaque;
}

/** Shared direct-control reset for the chrome owned by ZInputGroup. */
export function styleInputGroupDirectControls(s: IcssStyle<ZuiTheme>): void {
	s._selector('& > input, & > select, & > textarea', styleGroupedControl);
	s._selector(
		'& > input:focus-visible, & > select:focus-visible, & > textarea:focus-visible',
		styleGroupedControlFocus
	);
}

/** Prevents a disabled child from multiplying the opacity already owned by ZInputGroup. */
export function styleInputGroupDisabledControls(s: IcssStyle<ZuiTheme>): void {
	s._selector(
		'& > input:disabled, & > select:disabled, & > textarea:disabled',
		styleGroupOwnedDisabledOpacity
	);
}

/** Shared text-control chrome; each native element keeps its own appearance semantics. */
export const inputControlRecipe = defineRecipe({
	base: (s) => {
		s.fontFamily._sans;
		s.lineHeight._compact;
		s.paddingBlock.px(0);
		s.boxSizing.borderBox;
		s.width._full;
		s.borderWidth._hairline;
		s.borderStyle.solid;
		s.borderRadius._medium;
		s.backgroundColor._canvas;
		s.color._text;
		s.transitionDuration._fast;
		s.transitionProperty.raw('border-color, box-shadow');
		s.transitionTimingFunction._standard;
		s._selector('&::placeholder', (s) => s.color._textMuted);
		s._focusVisible((s) => {
			s.outlineWidth._medium;
			s.outlineStyle.solid;
			s.outlineColor._focus;
			s.outlineOffset._outer;
		});
	},
	variants: {
		disabled: {
			false: () => undefined,
			true: (s) => {
				s.cursor.notAllowed;
				s.opacity._disabled;
			}
		},
		invalid: {
			false: (s) => s.borderColor._border,
			true: (s) => s.borderColor._danger
		},
		motion: {
			auto: () => undefined,
			full: () => undefined,
			reduced: (s) => s.transitionDuration.ms(0)
		},
		readonly: {
			false: () => undefined,
			true: (s) => s.backgroundColor._surface
		},
		size: controlSizeStyles
	},
	defaultVariants: {
		disabled: false,
		invalid: false,
		motion: 'auto',
		readonly: false,
		size: 'medium'
	}
});

/** Adapts one composite value control whose native input is nested one level below ZInputGroup. */
export const inputGroupCompositeControlRecipe = defineRecipe({
	base: (s) => {
		s.flex.raw('1 1 auto');
		s.minWidth.px(0);
		s._selector('& > input', styleGroupedControl);
		s._selector('& > input:focus-visible', styleGroupedControlFocus);
	},
	variants: {
		disabled: {
			false: () => undefined,
			true: (s) => {
				s._selector('& > input:disabled, & > button:disabled', styleGroupOwnedDisabledOpacity);
			}
		}
	},
	defaultVariants: { disabled: false }
});

registerRecipeHmr(import.meta, inputControlRecipe);
registerRecipeHmr(import.meta, inputGroupCompositeControlRecipe);
