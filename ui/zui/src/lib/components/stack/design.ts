import type { DefaultTheme } from '../../theme/default.js';

export type StackGap = keyof DefaultTheme['space'] | number;
export type StackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
export type StackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
export type StackJustification =
	'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly' | 'start';

export interface StackDesignProps {
	align?: StackAlignment;
	direction?: StackDirection;
	gap?: StackGap;
	justify?: StackJustification;
}
