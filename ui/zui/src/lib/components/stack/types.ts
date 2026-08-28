import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { ZuiTheme } from '../../theme/types.js';

export type ZStackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
export type ZStackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
export type ZStackJustification = 'around' | 'between' | 'center' | 'end' | 'evenly' | 'start';

export interface ZStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly align?: ZStackAlignment;
	readonly children?: Snippet;
	readonly direction?: ZStackDirection;
	readonly gap?: keyof ZuiTheme['space'] | number;
	readonly justify?: ZStackJustification;
	readonly wrap?: boolean;
	ref?: HTMLDivElement | null;
}
