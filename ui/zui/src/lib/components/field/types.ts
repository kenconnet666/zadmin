import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ZFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	readonly children?: Snippet;
	readonly controlId?: string;
	readonly description?: string;
	readonly error?: string;
	readonly label: string;
	readonly required?: boolean;
	ref?: HTMLDivElement | null;
}
