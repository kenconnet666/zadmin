import type { ComponentProps } from 'svelte';

import { defaultTheme, type IcssStyle } from '../src/entrypoints/index.js';
import DirectZBox from '../src/components/gene/ZBox.svelte';
import type { ZBoxProps as DirectZBoxProps } from '../src/components/gene/ZBox.svelte';
import {
	ZAccordion,
	ZAccordionContent,
	ZAccordionItem,
	ZAccordionTrigger,
	ZAlertDialog,
	ZAlertDialogAction,
	ZAlertDialogCancel,
	ZAlertDialogContent,
	ZAlertDialogDescription,
	ZAlertDialogOverlay,
	ZAlertDialogTitle,
	ZAlertDialogTrigger,
	ZBox,
	ZButton,
	ZCheckbox,
	ZDialog,
	ZDialogClose,
	ZDialogContent,
	ZDialogDescription,
	ZDialogOverlay,
	ZDialogTitle,
	ZDialogTrigger,
	ZDropdownMenu,
	ZDropdownMenuContent,
	ZDropdownMenuTrigger,
	ZDrawer,
	ZDrawerClose,
	ZDrawerContent,
	ZDrawerDescription,
	ZDrawerOverlay,
	ZDrawerTitle,
	ZDrawerTrigger,
	ZMenu,
	ZMenuGroup,
	ZMenuItem,
	ZMenuLabel,
	ZMenuSeparator,
	ZPagination,
	ZPopconfirm,
	ZPopconfirmAction,
	ZPopconfirmCancel,
	ZPopconfirmContent,
	ZPopconfirmDescription,
	ZPopconfirmTitle,
	ZPopconfirmTrigger,
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
	type ZAlertDialogActionProps,
	type ZAlertDialogCancelProps,
	type ZAlertDialogContentProps,
	type ZAlertDialogDescriptionProps,
	type ZAlertDialogOverlayProps,
	type ZAlertDialogProps,
	type ZAlertDialogTitleProps,
	type ZAlertDialogTriggerProps,
	type ZBoxProps,
	type ZButtonProps,
	type ZCheckboxProps,
	type ZDialogCloseProps,
	type ZDialogContentProps,
	type ZDialogDescriptionProps,
	type ZDialogOverlayProps,
	type ZDialogProps,
	type ZDialogTitleProps,
	type ZDialogTriggerProps,
	type ZDropdownMenuContentProps,
	type ZDropdownMenuProps,
	type ZDropdownMenuTriggerProps,
	type ZDrawerCloseProps,
	type ZDrawerContentProps,
	type ZDrawerDescriptionProps,
	type ZDrawerOverlayProps,
	type ZDrawerProps,
	type ZDrawerTitleProps,
	type ZDrawerTriggerProps,
	type ZMenuGroupProps,
	type ZMenuItemProps,
	type ZMenuLabelProps,
	type ZMenuProps,
	type ZMenuSeparatorProps,
	type ZPaginationProps,
	type ZPopconfirmActionProps,
	type ZPopconfirmCancelProps,
	type ZPopconfirmContentProps,
	type ZPopconfirmDescriptionProps,
	type ZPopconfirmProps,
	type ZPopconfirmTitleProps,
	type ZPopconfirmTriggerProps,
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
const alertDialogProps: ComponentProps<typeof ZAlertDialog> = {
	defaultOpen: true
} satisfies ZAlertDialogProps;
const alertDialogTriggerProps: ComponentProps<typeof ZAlertDialogTrigger> =
	{} satisfies ZAlertDialogTriggerProps;
const alertDialogOverlayProps: ComponentProps<typeof ZAlertDialogOverlay> =
	{} satisfies ZAlertDialogOverlayProps;
const alertDialogContentProps: ComponentProps<typeof ZAlertDialogContent> =
	{} satisfies ZAlertDialogContentProps;
const alertDialogTitleProps: ComponentProps<typeof ZAlertDialogTitle> =
	{} satisfies ZAlertDialogTitleProps;
const alertDialogDescriptionProps: ComponentProps<typeof ZAlertDialogDescription> =
	{} satisfies ZAlertDialogDescriptionProps;
const alertDialogCancelProps: ComponentProps<typeof ZAlertDialogCancel> =
	{} satisfies ZAlertDialogCancelProps;
const alertDialogActionProps: ComponentProps<typeof ZAlertDialogAction> =
	{} satisfies ZAlertDialogActionProps;
const inferredBoxProps: ComponentProps<typeof ZBox> = boxProps;
const directBoxProps: DirectZBoxProps = inferredBoxProps;
const buttonProps: ComponentProps<typeof ZButton> = { variant: 'primary' } satisfies ZButtonProps;
const checkboxProps: ComponentProps<typeof ZCheckbox> = {
	defaultChecked: 'indeterminate',
	value: 42n
} satisfies ZCheckboxProps;
const dialogProps: ComponentProps<typeof ZDialog> = { defaultOpen: true } satisfies ZDialogProps;
const dialogTriggerProps: ComponentProps<typeof ZDialogTrigger> = {} satisfies ZDialogTriggerProps;
const dialogOverlayProps: ComponentProps<typeof ZDialogOverlay> = {} satisfies ZDialogOverlayProps;
const dialogContentProps: ComponentProps<typeof ZDialogContent> = {} satisfies ZDialogContentProps;
const dialogTitleProps: ComponentProps<typeof ZDialogTitle> = {} satisfies ZDialogTitleProps;
const dialogDescriptionProps: ComponentProps<typeof ZDialogDescription> =
	{} satisfies ZDialogDescriptionProps;
const dialogCloseProps: ComponentProps<typeof ZDialogClose> = {} satisfies ZDialogCloseProps;
const dropdownMenuProps: ComponentProps<typeof ZDropdownMenu> = {
	placement: 'bottom-end'
} satisfies ZDropdownMenuProps;
const dropdownMenuTriggerProps: ComponentProps<typeof ZDropdownMenuTrigger> =
	{} satisfies ZDropdownMenuTriggerProps;
const dropdownMenuContentProps: ComponentProps<typeof ZDropdownMenuContent> =
	{} satisfies ZDropdownMenuContentProps;
const drawerProps: ComponentProps<typeof ZDrawer> = { defaultOpen: true } satisfies ZDrawerProps;
const drawerTriggerProps: ComponentProps<typeof ZDrawerTrigger> = {} satisfies ZDrawerTriggerProps;
const drawerOverlayProps: ComponentProps<typeof ZDrawerOverlay> = {} satisfies ZDrawerOverlayProps;
const drawerContentProps: ComponentProps<typeof ZDrawerContent> = {
	placement: 'start',
	size: 'large'
} satisfies ZDrawerContentProps;
const drawerTitleProps: ComponentProps<typeof ZDrawerTitle> = {} satisfies ZDrawerTitleProps;
const drawerDescriptionProps: ComponentProps<typeof ZDrawerDescription> =
	{} satisfies ZDrawerDescriptionProps;
const drawerCloseProps: ComponentProps<typeof ZDrawerClose> = {} satisfies ZDrawerCloseProps;
const menuProps: ComponentProps<typeof ZMenu> = { loop: false } satisfies ZMenuProps;
const menuGroupProps: ComponentProps<typeof ZMenuGroup> = {} satisfies ZMenuGroupProps;
const menuItemProps: ComponentProps<typeof ZMenuItem> = { value: 'open' } satisfies ZMenuItemProps;
const menuLabelProps: ComponentProps<typeof ZMenuLabel> = {} satisfies ZMenuLabelProps;
const menuSeparatorProps: ComponentProps<typeof ZMenuSeparator> = {} satisfies ZMenuSeparatorProps;
const paginationProps: ComponentProps<typeof ZPagination> = {
	defaultPage: 2,
	totalPages: 20
} satisfies ZPaginationProps;
const popconfirmProps: ComponentProps<typeof ZPopconfirm> = {
	placement: 'bottom-start'
} satisfies ZPopconfirmProps;
const popconfirmTriggerProps: ComponentProps<typeof ZPopconfirmTrigger> =
	{} satisfies ZPopconfirmTriggerProps;
const popconfirmContentProps: ComponentProps<typeof ZPopconfirmContent> =
	{} satisfies ZPopconfirmContentProps;
const popconfirmTitleProps: ComponentProps<typeof ZPopconfirmTitle> =
	{} satisfies ZPopconfirmTitleProps;
const popconfirmDescriptionProps: ComponentProps<typeof ZPopconfirmDescription> =
	{} satisfies ZPopconfirmDescriptionProps;
const popconfirmCancelProps: ComponentProps<typeof ZPopconfirmCancel> =
	{} satisfies ZPopconfirmCancelProps;
const popconfirmActionProps: ComponentProps<typeof ZPopconfirmAction> =
	{} satisfies ZPopconfirmActionProps;
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
void alertDialogProps;
void alertDialogTriggerProps;
void alertDialogOverlayProps;
void alertDialogContentProps;
void alertDialogTitleProps;
void alertDialogDescriptionProps;
void alertDialogCancelProps;
void alertDialogActionProps;
void directBoxProps;
void buttonProps;
void checkboxProps;
void dialogProps;
void dialogTriggerProps;
void dialogOverlayProps;
void dialogContentProps;
void dialogTitleProps;
void dialogDescriptionProps;
void dialogCloseProps;
void dropdownMenuProps;
void dropdownMenuTriggerProps;
void dropdownMenuContentProps;
void drawerProps;
void drawerTriggerProps;
void drawerOverlayProps;
void drawerContentProps;
void drawerTitleProps;
void drawerDescriptionProps;
void drawerCloseProps;
void menuProps;
void menuGroupProps;
void menuItemProps;
void menuLabelProps;
void menuSeparatorProps;
void paginationProps;
void popconfirmProps;
void popconfirmTriggerProps;
void popconfirmContentProps;
void popconfirmTitleProps;
void popconfirmDescriptionProps;
void popconfirmCancelProps;
void popconfirmActionProps;
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
s.width.fitContent;

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
