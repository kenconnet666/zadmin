import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ButtonDesignProps } from './design.js';

import type { IcssVariables } from '../provider/variables.js';

export type { ButtonSize, ButtonVariant } from './design.js';

export interface ButtonProps extends HTMLButtonAttributes, Omit<ButtonDesignProps, 'disabled'> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	ref?: HTMLButtonElement | null;
}
