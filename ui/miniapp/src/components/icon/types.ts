import type { MiniappTheme } from '../../theme/index.ts';
import type { MiniComponentProps } from '../types.ts';

export const miniIconManifest = {
	check: '✓',
	chevronDown: '⌄',
	close: '×',
	menu: '☰',
	plus: '+',
	search: '⌕',
	user: '●',
	warning: '!'
} as const;

export type MIconName = keyof typeof miniIconManifest;

export interface MIconProps extends Omit<MiniComponentProps, 'children'> {
	readonly color?: keyof MiniappTheme['color'];
	readonly label?: string;
	readonly name: MIconName;
	readonly size?: keyof MiniappTheme['fontSize'] | number;
}
