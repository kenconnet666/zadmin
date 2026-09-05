import type { IcssFactory } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';

/**
 * Generates the state-specific easing used by Presence-backed surfaces.
 * Duration and state ownership remain with the component recipe/lifecycle;
 * this helper only emits the theme-driven transition timing declarations.
 */
export const stylePresenceEasing: IcssFactory<ZuiTheme> = (s) => {
	s._selector('&[data-state="open"]', (state) => state.transitionTimingFunction._enter);
	s._selector('&[data-state="closed"]', (state) => state.transitionTimingFunction._exit);
};
