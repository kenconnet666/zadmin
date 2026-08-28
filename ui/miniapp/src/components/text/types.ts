import type { MiniappTheme } from '../../theme/index.ts';
import type { MiniComponentProps } from '../types.ts';

export type MTextTone = 'danger' | 'default' | 'muted' | 'primary';

export interface MTextProps extends MiniComponentProps {
	readonly decode?: boolean;
	readonly selectable?: boolean;
	readonly size?: keyof MiniappTheme['fontSize'];
	readonly space?: 'emsp' | 'ensp' | 'nbsp';
	readonly tone?: MTextTone;
	readonly userSelect?: boolean;
	readonly weight?: keyof MiniappTheme['fontWeight'];
}
