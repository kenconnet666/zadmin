import type { HTMLAttributes } from 'svelte/elements';
import type { StackDesignProps } from './design.js';

import type { IcssVariables } from '../provider/variables.js';

export type { StackAlignment, StackDirection, StackGap, StackJustification } from './design.js';

export interface StackProps extends HTMLAttributes<HTMLDivElement>, StackDesignProps {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	ref?: HTMLDivElement | null;
}
