import type { HTMLAttributes } from 'svelte/elements';

import type { defaultTheme } from '../../theme/default.js';
import type { IcssVariables } from '../provider/variables.js';

export type TextElement = 'label' | 'p' | 'small' | 'span' | 'strong';

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	as?: TextElement;
	color?: keyof typeof defaultTheme.color;
	ref?: HTMLElement | null;
	size?: keyof typeof defaultTheme.fontSize;
	weight?: keyof typeof defaultTheme.fontWeight;
}
