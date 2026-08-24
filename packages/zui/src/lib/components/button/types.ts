import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ButtonDesignProps } from '@zadmin/zui-core';

import type { IcssVariables } from '../provider/variables.js';

export type { ButtonSize, ButtonVariant } from '@zadmin/zui-core';

export interface ButtonProps extends HTMLButtonAttributes, Omit<ButtonDesignProps, 'disabled'> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	ref?: HTMLButtonElement | null;
}
