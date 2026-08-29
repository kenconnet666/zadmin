import type { ComponentProps } from 'svelte';

import { defaultTheme, type IcssStyle } from '../src/entrypoints/index.js';
import DirectZBox from '../src/components/gene/ZBox.svelte';
import type { ZBoxProps as DirectZBoxProps } from '../src/components/gene/ZBox.svelte';
import {
	ZAccordion,
	ZAccordionContent,
	ZAccordionItem,
	ZAccordionTrigger,
	ZBox,
	ZButton,
	ZCheckbox,
	ZPagination,
	ZPopover,
	ZPopoverContent,
	ZPopoverTrigger,
	ZRadioGroup,
	ZRadioGroupItem,
	ZSlider,
	ZSwitch,
	ZTabs,
	ZTabsList,
	ZTabsPanel,
	ZTabsTrigger,
	ZTooltip,
	ZTooltipContent,
	ZTooltipTrigger,
	ZToggleButton,
	defineRecipe,
	defineSlotRecipe,
	type RecipeVariants,
	type SlotRecipeSelection,
	type ZAccordionContentProps,
	type ZAccordionItemProps,
	type ZAccordionProps,
	type ZAccordionTriggerProps,
	type ZBoxProps,
	type ZButtonProps,
	type ZCheckboxProps,
	type ZPaginationProps,
	type ZPopoverContentProps,
	type ZPopoverProps,
	type ZPopoverTriggerProps,
	type ZRadioGroupItemProps,
	type ZRadioGroupProps,
	type ZSliderProps,
	type ZSwitchProps,
	type ZTabsListProps,
	type ZTabsPanelProps,
	type ZTabsProps,
	type ZTabsTriggerProps,
	type ZTooltipContentProps,
	type ZTooltipProps,
	type ZTooltipTriggerProps,
	type ZToggleButtonProps
} from '../src/entrypoints/index.js';

const boxProps: ZBoxProps = { 'aria-label': 'Box' };
const accordionProps: ComponentProps<typeof ZAccordion> = {
	defaultValue: ['one'],
	type: 'multiple'
} satisfies ZAccordionProps;
const accordionItemProps: ComponentProps<typeof ZAccordionItem> = {
	value: 'one'
} satisfies ZAccordionItemProps;
const accordionTriggerProps: ComponentProps<typeof ZAccordionTrigger> =
	{} satisfies ZAccordionTriggerProps;
const accordionContentProps: ComponentProps<typeof ZAccordionContent> =
	{} satisfies ZAccordionContentProps;
const inferredBoxProps: ComponentProps<typeof ZBox> = boxProps;
const directBoxProps: DirectZBoxProps = inferredBoxProps;
const buttonProps: ComponentProps<typeof ZButton> = { variant: 'primary' } satisfies ZButtonProps;
const checkboxProps: ComponentProps<typeof ZCheckbox> = {
	defaultChecked: 'indeterminate',
	value: 42n
} satisfies ZCheckboxProps;
const paginationProps: ComponentProps<typeof ZPagination> = {
	defaultPage: 2,
	totalPages: 20
} satisfies ZPaginationProps;
const popoverProps: ComponentProps<typeof ZPopover> = {
	placement: 'bottom-start'
} satisfies ZPopoverProps;
const popoverTriggerProps: ComponentProps<typeof ZPopoverTrigger> = {
	variant: 'secondary'
} satisfies ZPopoverTriggerProps;
const popoverContentProps: ComponentProps<typeof ZPopoverContent> =
	{} satisfies ZPopoverContentProps;
const radioGroupProps: ComponentProps<typeof ZRadioGroup> = {
	defaultValue: 'ready',
	orientation: 'horizontal'
} satisfies ZRadioGroupProps;
const radioGroupItemProps: ComponentProps<typeof ZRadioGroupItem> = {
	value: 'ready'
} satisfies ZRadioGroupItemProps;
const sliderProps: ComponentProps<typeof ZSlider> = {
	defaultValue: 25,
	max: 50,
	step: 5
} satisfies ZSliderProps;
const switchProps: ComponentProps<typeof ZSwitch> = {
	defaultChecked: true,
	value: 1n
} satisfies ZSwitchProps;
const tabsProps: ComponentProps<typeof ZTabs> = {
	activationMode: 'manual',
	defaultValue: 'overview'
} satisfies ZTabsProps;
const tabsListProps: ComponentProps<typeof ZTabsList> = {} satisfies ZTabsListProps;
const tabsTriggerProps: ComponentProps<typeof ZTabsTrigger> = {
	value: 'overview'
} satisfies ZTabsTriggerProps;
const tabsPanelProps: ComponentProps<typeof ZTabsPanel> = {
	value: 'overview'
} satisfies ZTabsPanelProps;
const tooltipProps: ComponentProps<typeof ZTooltip> = { delay: 200 } satisfies ZTooltipProps;
const tooltipTriggerProps: ComponentProps<typeof ZTooltipTrigger> =
	{} satisfies ZTooltipTriggerProps;
const tooltipContentProps: ComponentProps<typeof ZTooltipContent> =
	{} satisfies ZTooltipContentProps;
const toggleButtonProps: ComponentProps<typeof ZToggleButton> = {
	defaultPressed: true,
	onPressedChange: (pressed) => void pressed
} satisfies ZToggleButtonProps;
void DirectZBox;
void accordionProps;
void accordionItemProps;
void accordionTriggerProps;
void accordionContentProps;
void directBoxProps;
void buttonProps;
void checkboxProps;
void paginationProps;
void popoverProps;
void popoverTriggerProps;
void popoverContentProps;
void radioGroupProps;
void radioGroupItemProps;
void sliderProps;
void switchProps;
void tabsProps;
void tabsListProps;
void tabsTriggerProps;
void tabsPanelProps;
void tooltipProps;
void tooltipTriggerProps;
void tooltipContentProps;
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
