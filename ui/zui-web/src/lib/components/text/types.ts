import type { HTMLAttributes } from 'svelte/elements';
import type { DefaultTheme } from '@zadmin/zui-core';

import type { IcssVariables } from '../provider/variables.js';

export type TextElement = 'label' | 'p' | 'small' | 'span' | 'strong';

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	as?: TextElement;
	color?: keyof DefaultTheme['color'];
	ref?: HTMLElement | null;
	size?: keyof DefaultTheme['fontSize'];
	weight?: keyof DefaultTheme['fontWeight'];
}
