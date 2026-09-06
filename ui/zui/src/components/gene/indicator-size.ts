import type { IcssFactory } from '../../icss/types.js';
import type { ZControlSize } from '../../runtime/foundation/control-size.js';
import type { ZuiTheme } from '../../theme/types.js';

/** Icon and waiting-indicator proportions are independent of control height. */
export const indicatorSizeStyles = {
	xsmall: (s) => {
		s.blockSize._xsmall;
		s.inlineSize._xsmall;
	},
	small: (s) => {
		s.blockSize._small;
		s.inlineSize._small;
	},
	medium: (s) => {
		s.blockSize._medium;
		s.inlineSize._medium;
	},
	large: (s) => {
		s.blockSize._large;
		s.inlineSize._large;
	},
	xlarge: (s) => {
		s.blockSize._xlarge;
		s.inlineSize._xlarge;
	}
} satisfies Readonly<Record<ZControlSize, IcssFactory<ZuiTheme>>>;
