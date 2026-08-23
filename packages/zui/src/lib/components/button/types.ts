import type { HTMLButtonAttributes } from 'svelte/elements';

import type { IcssVariables } from '../provider/variables.js';

export type ButtonSize = 'large' | 'medium' | 'small';
export type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

export interface ButtonProps extends HTMLButtonAttributes {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	loading?: boolean;
	ref?: HTMLButtonElement | null;
	size?: ButtonSize;
	variant?: ButtonVariant;
}
