import { defaultTheme, type IcssStyle } from '../src/lib/core.js';
import {
	defineRecipe,
	defineSlotRecipe,
	type RecipeVariants,
	type SlotRecipeSelection
} from '../src/lib/index.js';

declare const style: IcssStyle<typeof defaultTheme>;

style.color._primary;
style.display.inlineFlex;
style.padding.px(4, 8);
style.width.percent(100);

// @ts-expect-error color does not accept length units
style.color.px(4);

// @ts-expect-error unknown theme tokens are rejected
style.color._missing;

// @ts-expect-error padding does not accept time units
style.padding.ms(100);

const recipe = defineRecipe({
	variants: {
		disabled: { false: () => undefined, true: () => undefined },
		size: { large: () => undefined, small: () => undefined }
	}
});
void recipe;

const validRecipeVariants: RecipeVariants<typeof recipe> = { disabled: true, size: 'small' };
void validRecipeVariants;

// @ts-expect-error boolean recipes do not accept string booleans
const invalidBooleanRecipe: RecipeVariants<typeof recipe> = { disabled: 'true' };
void invalidBooleanRecipe;

// @ts-expect-error variant values are inferred exactly
const invalidSizeRecipe: RecipeVariants<typeof recipe> = { size: 'medium' };
void invalidSizeRecipe;

const slotRecipe = defineSlotRecipe({
	slots: ['root', 'control'] as const,
	variants: {
		invalid: {
			false: {},
			true: { control: () => undefined }
		}
	}
});
void slotRecipe;
const validSlotVariants: SlotRecipeSelection<typeof slotRecipe> = { invalid: true };
void validSlotVariants;

// @ts-expect-error slot recipe boolean variants are normalized
const invalidSlotVariants: SlotRecipeSelection<typeof slotRecipe> = { invalid: 'true' };
void invalidSlotVariants;
