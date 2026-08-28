import type { MiniappTheme } from '../../theme/index.ts';
import type { MiniComponentProps } from '../types.ts';

export type MStackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';
export type MStackAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
export type MStackJustification = 'around' | 'between' | 'center' | 'end' | 'evenly' | 'start';

export interface MStackProps extends MiniComponentProps {
	readonly align?: MStackAlignment;
	readonly direction?: MStackDirection;
	readonly gap?: keyof MiniappTheme['space'] | number;
	readonly justify?: MStackJustification;
	readonly wrap?: boolean;
}
