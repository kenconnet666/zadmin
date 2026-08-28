import type { Snippet } from 'svelte';

import type { MiniStyle } from '../styles/index.ts';
import type { MiniappTheme } from '../theme/index.ts';

export interface MiniappEvent<TDetail = unknown> {
	readonly currentTarget: Readonly<{ dataset?: Readonly<Record<string, unknown>>; id?: string }>;
	readonly detail: TDetail;
	readonly target: Readonly<{ dataset?: Readonly<Record<string, unknown>>; id?: string }>;
	readonly timeStamp: number;
	readonly type: string;
}

export interface MiniComponentProps {
	readonly children?: Snippet;
	readonly class?: string;
	readonly id?: string;
	readonly style?: MiniStyle;
}

export interface MProviderProps {
	readonly children?: Snippet;
	readonly theme?: MiniappTheme;
}
