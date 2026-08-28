import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

import type { RecipeVariants } from '../../recipes/types.js';
import { buttonRecipe } from './button.recipe.js';

export type ZButtonVariants = Omit<RecipeVariants<typeof buttonRecipe>, 'disabled'>;

export type ZButtonProps = Omit<HTMLButtonAttributes, 'children' | 'disabled'> &
	ZButtonVariants & {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly loading?: boolean;
		ref?: HTMLButtonElement | null;
	};
