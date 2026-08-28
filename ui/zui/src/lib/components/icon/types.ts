import type { SVGAttributes } from 'svelte/elements';

import type { ZuiTheme } from '../../theme/types.js';
import type { iconManifest } from './manifest.js';

export type ZIconName = keyof typeof iconManifest;

export interface ZIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
	readonly label?: string;
	readonly name: ZIconName;
	readonly size?: keyof ZuiTheme['size'] | number;
	ref?: SVGSVGElement | null;
}
