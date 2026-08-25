import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { IcssVariables } from '../provider/variables.js';

export interface BoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	children?: Snippet;
	ref?: HTMLDivElement | null;
}
