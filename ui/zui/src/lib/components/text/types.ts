import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { ZuiTheme } from '../../theme/types.js';

export type ZTextElement = 'label' | 'p' | 'small' | 'span' | 'strong';
export type ZTextTone = 'danger' | 'default' | 'muted' | 'primary';

export interface ZTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	readonly as?: ZTextElement;
	readonly children?: Snippet;
	readonly size?: keyof ZuiTheme['fontSize'];
	readonly tone?: ZTextTone;
	readonly truncate?: boolean;
	readonly weight?: keyof ZuiTheme['fontWeight'];
	ref?: HTMLElement | null;
}
