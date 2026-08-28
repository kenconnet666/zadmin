import type { MiniComponentProps, MiniappEvent } from '../types.ts';

export type MImageMode =
	| 'aspectFill'
	| 'aspectFit'
	| 'bottom'
	| 'center'
	| 'heightFix'
	| 'scaleToFill'
	| 'top'
	| 'widthFix';

export interface MImageProps extends Omit<MiniComponentProps, 'children'> {
	readonly fadeShow?: boolean;
	readonly lazyLoad?: boolean;
	readonly mode?: MImageMode;
	readonly onerror?: (event: MiniappEvent) => void;
	readonly onload?: (event: MiniappEvent<{ height: number; width: number }>) => void;
	readonly showMenuByLongpress?: boolean;
	readonly src: string;
	readonly webp?: boolean;
}
