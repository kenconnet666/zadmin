import type { HTMLAttributes } from 'svelte/elements';
import type { StackDesignProps } from '@zadmin/zui-core';

import type { IcssVariables } from '../provider/variables.js';

export type {
	StackAlignment,
	StackDirection,
	StackGap,
	StackJustification
} from '@zadmin/zui-core';

export interface StackProps extends HTMLAttributes<HTMLDivElement>, StackDesignProps {
	/** @internal Compiler-generated dynamic style values. */
	__icssVariables?: IcssVariables;
	ref?: HTMLDivElement | null;
}
