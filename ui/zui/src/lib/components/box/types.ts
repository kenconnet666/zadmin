import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ZBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly children?: Snippet;
	ref?: HTMLDivElement | null;
}
