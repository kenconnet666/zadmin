import type { MiniComponentProps } from '../types.ts';

export interface MBoxProps extends MiniComponentProps {
	readonly ariaLabel?: string;
	readonly hidden?: boolean;
	readonly hoverClass?: string;
}
