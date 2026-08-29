import type { ComponentProps } from 'svelte';

import { defaultTheme, type IcssStyle } from '../src/entrypoints/index.js';
import DirectZBox from '../src/components/gene/ZBox.svelte';
import type { ZBoxProps as DirectZBoxProps } from '../src/components/gene/ZBox.svelte';
import {
	ZBox,
	ZButton,
	ZCheckbox,
	ZSwitch,
	ZToggleButton,
	defineRecipe,
	defineSlotRecipe,
	type RecipeVariants,
	type SlotRecipeSelection,
	type ZBoxProps,
	type ZButtonProps,
	type ZCheckboxProps,
	type ZSwitchProps,
	type ZToggleButtonProps
} from '../src/entrypoints/index.js';

const boxProps: ZBoxProps = { 'aria-label': 'Box' };
const inferredBoxProps: ComponentProps<typeof ZBox> = boxProps;
const directBoxProps: DirectZBoxProps = inferredBoxProps;
const buttonProps: ComponentProps<typeof ZButton> = { variant: 'primary' } satisfies ZButtonProps;
const checkboxProps: ComponentProps<typeof ZCheckbox> = {
	defaultChecked: 'indeterminate',
	value: 42n
} satisfies ZCheckboxProps;
const switchProps: ComponentProps<typeof ZSwitch> = {
	defaultChecked: true,
	value: 1n
} satisfies ZSwitchProps;
const toggleButtonProps: ComponentProps<typeof ZToggleButton> = {
	defaultPressed: true,
	onPressedChange: (pressed) => void pressed
} satisfies ZToggleButtonProps;
void DirectZBox;
void directBoxProps;
void buttonProps;
void checkboxProps;
void switchProps;
void toggleButtonProps;

declare const s: IcssStyle<typeof defaultTheme>;

s.color._primary;
s.accentColor._primary;
s.blockSize._medium;
s.display.inlineFlex;
s.inlineSize._small;
s.padding.px(4, 8);
s.width.percent(100);

// @ts-expect-error color does not accept length units
s.color.px(4);

// @ts-expect-error unknown theme tokens are rejected
s.color._missing;

// @ts-expect-error padding does not accept time units
s.padding.ms(100);

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
