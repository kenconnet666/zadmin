import type { Snippet } from 'svelte';

import type { IcssRuntime } from '../../icss/runtime.js';
import type { ZuiTheme } from '../../theme/types.js';

export interface ZProviderProps {
	children?: Snippet;
	runtime?: IcssRuntime;
	theme?: ZuiTheme;
}
