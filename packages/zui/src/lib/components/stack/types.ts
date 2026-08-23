import type { HTMLAttributes } from 'svelte/elements';

import type { IcssVariables } from '../provider/variables.js';
import type { defaultTheme } from '../../theme/default.js';

export type StackGap = keyof typeof defaultTheme.space | number;
export type StackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
export type StackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
export type StackJustification =
	'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly' | 'start';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	align?: StackAlignment;
	direction?: StackDirection;
	gap?: StackGap;
	justify?: StackJustification;
	ref?: HTMLDivElement | null;
}
