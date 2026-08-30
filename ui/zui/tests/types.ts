import type { ComponentProps } from 'svelte';

import { defaultTheme, type IcssStyle } from '../src/entrypoints/index.js';
import DirectZBox from '../src/components/gene/ZBox.svelte';
import type { ZBoxProps as DirectZBoxProps } from '../src/components/gene/ZBox.svelte';
import {
	ZAccordion,
	ZAccordionContent,
	ZAccordionItem,
	ZAccordionTrigger,
	ZAlert,
	ZAlertDialog,
	ZAlertDialogAction,
	ZAlertDialogCancel,
	ZAlertDialogContent,
	ZAlertDialogDescription,
	ZAlertDialogOverlay,
	ZAlertDialogTitle,
	ZAlertDialogTrigger,
	ZAvatar,
	ZBadge,
	ZBox,
	ZButton,
	ZCard,
	ZCascader,
	ZCalendar,
	ZCheckbox,
	ZCombobox,
	ZColorPicker,
	ZComboboxContent,
	ZComboboxInput,
	ZComboboxItem,
	ZCommand,
	ZCommandPalette,
	ZContextMenu,
	ZContextMenuContent,
	ZContextMenuTrigger,
	ZDateField,
	ZDatePicker,
	ZDateRangePicker,
	ZDialog,
	ZDialogClose,
	ZDialogContent,
	ZDialogDescription,
	ZDialogOverlay,
	ZDialogTitle,
	ZDialogTrigger,
	ZDescriptionList,
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
	ZEmpty,
	ZFileUpload,
	ZForm,
	ZFormField,
	ZInputGroup,
	ZList,
	ZLoadingBar,
	ZMenu,
	ZMenuGroup,
	ZMenuItem,
	ZMenuLabel,
	ZMenuSeparator,
	ZMeter,
	ZMention,
	ZMultiSelect,
	ZMultiSelectContent,
	ZMultiSelectItem,
	ZMultiSelectTrigger,
	ZNumberField,
	ZPagination,
	ZPinInput,
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
	ZProgress,
	ZRadioGroup,
	ZRadioGroupItem,
	ZResult,
	ZSelect,
	ZSelectContent,
	ZSelectItem,
	ZSelectTrigger,
	ZSegmented,
	ZSlider,
	ZSkeleton,
	ZSpinner,
	ZStatistic,
	ZSwitch,
	ZTabs,
	ZTabsList,
	ZTabsPanel,
	ZTabsTrigger,
	ZTagsInput,
	ZTag,
	ZToast,
	ZToaster,
	ZTextarea,
	ZTimeField,
	ZTimeline,
	ZTooltip,
	ZTooltipContent,
	ZTooltipTrigger,
	ZTree,
	ZTreeSelect,
	ZTransfer,
	ZToggleButton,
	createToastQueue,
	defineRecipe,
	defineSlotRecipe,
	type RecipeVariants,
	type SlotRecipeSelection,
	type ZAccordionContentProps,
	type ZAccordionItemProps,
	type ZAccordionProps,
	type ZAccordionTriggerProps,
	type ZAlertProps,
	type ZAlertDialogActionProps,
	type ZAlertDialogCancelProps,
	type ZAlertDialogContentProps,
	type ZAlertDialogDescriptionProps,
	type ZAlertDialogOverlayProps,
	type ZAlertDialogProps,
	type ZAlertDialogTitleProps,
	type ZAlertDialogTriggerProps,
	type ZAvatarProps,
	type ZBadgeProps,
	type ZBoxProps,
	type ZButtonProps,
	type ZCardProps,
	type ZCascaderProps,
	type ZCalendarProps,
	type ZCheckboxProps,
	type ZComboboxContentProps,
	type ZComboboxInputProps,
	type ZComboboxItemProps,
	type ZComboboxProps,
	type ZColorPickerProps,
	type ZCommandPaletteProps,
	type ZCommandProps,
	type ZContextMenuContentProps,
	type ZContextMenuProps,
	type ZContextMenuTriggerProps,
	type ZDateFieldProps,
	type ZDatePickerProps,
	type ZDateRangePickerProps,
	type ZDialogCloseProps,
	type ZDialogContentProps,
	type ZDialogDescriptionProps,
	type ZDialogOverlayProps,
	type ZDialogProps,
	type ZDialogTitleProps,
	type ZDialogTriggerProps,
	type ZDescriptionListProps,
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
	type ZEmptyProps,
	type ZFileUploadProps,
	type ZFormFieldProps,
	type ZFormProps,
	type ZInputGroupProps,
	type ZListProps,
	type ZLoadingBarProps,
	type ZMenuGroupProps,
	type ZMenuItemProps,
	type ZMenuLabelProps,
	type ZMenuProps,
	type ZMenuSeparatorProps,
	type ZMeterProps,
	type ZMentionProps,
	type ZMultiSelectContentProps,
	type ZMultiSelectItemProps,
	type ZMultiSelectProps,
	type ZMultiSelectTriggerProps,
	type ZNumberFieldProps,
	type ZPaginationProps,
	type ZPinInputProps,
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
	type ZProgressProps,
	type ZRadioGroupItemProps,
	type ZRadioGroupProps,
	type ZResultProps,
	type ZSelectContentProps,
	type ZSelectItemProps,
	type ZSelectProps,
	type ZSelectTriggerProps,
	type ZSegmentedProps,
	type ZSliderProps,
	type ZSkeletonProps,
	type ZSpinnerProps,
	type ZStatisticProps,
	type ZSwitchProps,
	type ZTabsListProps,
	type ZTabsPanelProps,
	type ZTabsProps,
	type ZTabsTriggerProps,
	type ZTagsInputProps,
	type ZTagProps,
	type ZToastProps,
	type ZToasterProps,
	type ZTextareaProps,
	type ZTimeFieldProps,
	type ZTimelineProps,
	type ZTooltipContentProps,
	type ZTooltipProps,
	type ZTooltipTriggerProps,
	type ZTreeProps,
	type ZTreeSelectProps,
	type ZTransferProps,
	type ZToggleButtonProps
} from '../src/entrypoints/index.js';

const boxProps: ZBoxProps = { 'aria-label': 'Box' };
const avatarProps: ComponentProps<typeof ZAvatar> = { alt: 'Alice' } satisfies ZAvatarProps;
const badgeProps: ComponentProps<typeof ZBadge> = { tone: 'success' } satisfies ZBadgeProps;
const cardProps: ComponentProps<typeof ZCard> = {} satisfies ZCardProps;
const descriptionListProps: ComponentProps<typeof ZDescriptionList> = {
	items: [{ description: '1', id: 'version', term: 'Version' }]
} satisfies ZDescriptionListProps;
const listProps: ComponentProps<typeof ZList> = {
	items: [{ id: 'one', label: 'One' }]
} satisfies ZListProps;
const tagProps: ComponentProps<typeof ZTag> = { removable: true } satisfies ZTagProps;
const alertProps: ComponentProps<typeof ZAlert> = { title: 'Saved' } satisfies ZAlertProps;
const loadingBarProps: ComponentProps<typeof ZLoadingBar> = {
	value: 50
} satisfies ZLoadingBarProps;
const resultProps: ComponentProps<typeof ZResult> = { title: 'Ready' } satisfies ZResultProps;
const spinnerProps: ComponentProps<typeof ZSpinner> = { label: 'Loading' } satisfies ZSpinnerProps;
const toastProps: ComponentProps<typeof ZToast> = { title: 'Ready' } satisfies ZToastProps;
const toasterProps: ComponentProps<typeof ZToaster> = {
	queue: createToastQueue()
} satisfies ZToasterProps;
const progressProps: ComponentProps<typeof ZProgress> = {
	label: 'Progress',
	value: 50
} satisfies ZProgressProps;
const meterProps: ComponentProps<typeof ZMeter> = {
	label: 'Capacity',
	value: 50
} satisfies ZMeterProps;
const skeletonProps: ComponentProps<typeof ZSkeleton> = {
	shape: 'line',
	width: 120
} satisfies ZSkeletonProps;
const emptyProps: ComponentProps<typeof ZEmpty> = { title: 'Empty' } satisfies ZEmptyProps;
const timelineProps: ComponentProps<typeof ZTimeline> = {
	items: [{ id: 'one', title: 'One' }]
} satisfies ZTimelineProps;
const statisticProps: ComponentProps<typeof ZStatistic> = {
	label: 'Requests',
	value: 12
} satisfies ZStatisticProps;
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
const comboboxProps: ComponentProps<typeof ZCombobox> = {
	defaultInputValue: 'Ready',
	defaultValue: 'ready'
} satisfies ZComboboxProps;
const comboboxInputProps: ComponentProps<typeof ZComboboxInput> = {} satisfies ZComboboxInputProps;
const comboboxContentProps: ComponentProps<typeof ZComboboxContent> = {
	ariaLabel: 'Suggestions'
} satisfies ZComboboxContentProps;
const comboboxItemProps: ComponentProps<typeof ZComboboxItem> = {
	textValue: 'Ready',
	value: 'ready'
} satisfies ZComboboxItemProps;
const contextMenuProps: ComponentProps<typeof ZContextMenu> = {
	placement: 'right-start'
} satisfies ZContextMenuProps;
const contextMenuTriggerProps: ComponentProps<typeof ZContextMenuTrigger> =
	{} satisfies ZContextMenuTriggerProps;
const contextMenuContentProps: ComponentProps<typeof ZContextMenuContent> = {
	ariaLabel: 'Actions'
} satisfies ZContextMenuContentProps;
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
const multiSelectProps: ComponentProps<typeof ZMultiSelect> = {
	defaultValues: ['a', 2],
	name: 'choice'
} satisfies ZMultiSelectProps;
const multiSelectTriggerProps: ComponentProps<typeof ZMultiSelectTrigger> =
	{} satisfies ZMultiSelectTriggerProps;
const multiSelectContentProps: ComponentProps<typeof ZMultiSelectContent> =
	{} satisfies ZMultiSelectContentProps;
const multiSelectItemProps: ComponentProps<typeof ZMultiSelectItem> = {
	value: 'a'
} satisfies ZMultiSelectItemProps;
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
const selectProps: ComponentProps<typeof ZSelect> = {
	defaultValue: 'ready',
	name: 'status'
} satisfies ZSelectProps;
const selectTriggerProps: ComponentProps<typeof ZSelectTrigger> = {} satisfies ZSelectTriggerProps;
const selectContentProps: ComponentProps<typeof ZSelectContent> = {} satisfies ZSelectContentProps;
const selectItemProps: ComponentProps<typeof ZSelectItem> = {
	value: 'ready'
} satisfies ZSelectItemProps;
const segmentedProps: ComponentProps<typeof ZSegmented> = {
	items: [{ label: 'Ready', value: 'ready' }]
} satisfies ZSegmentedProps;
const tagsInputProps: ComponentProps<typeof ZTagsInput> = {
	defaultValues: ['alpha'],
	delimiters: [',', ';']
} satisfies ZTagsInputProps;
const treeProps: ComponentProps<typeof ZTree> = {
	nodes: [{ key: 'root', label: 'Root' }]
} satisfies ZTreeProps;
const treeSelectProps: ComponentProps<typeof ZTreeSelect> = {
	nodes: [{ key: 'root', label: 'Root' }]
} satisfies ZTreeSelectProps;
const cascaderProps: ComponentProps<typeof ZCascader> = {
	nodes: [{ key: 'root', label: 'Root' }],
	value: ['root']
} satisfies ZCascaderProps;
const transferProps: ComponentProps<typeof ZTransfer> = {
	items: [{ key: 'ready', label: 'Ready' }],
	value: ['ready']
} satisfies ZTransferProps;
const mentionProps: ComponentProps<typeof ZMention> = {
	items: [{ key: 'alice', label: 'Alice' }],
	value: 'Notify @alice'
} satisfies ZMentionProps;
const commandProps: ComponentProps<typeof ZCommand> = {
	items: [{ key: 'open', label: 'Open' }]
} satisfies ZCommandProps;
const commandPaletteProps: ComponentProps<typeof ZCommandPalette> = {
	items: [{ key: 'open', label: 'Open' }],
	shortcut: { key: 'k', modKey: true }
} satisfies ZCommandPaletteProps;
const textareaProps: ComponentProps<typeof ZTextarea> = {
	autosize: true,
	defaultValue: 'Description',
	resize: 'none'
} satisfies ZTextareaProps;
const inputGroupProps: ComponentProps<typeof ZInputGroup> = {
	children: (() => undefined) as never,
	invalid: true
} satisfies ZInputGroupProps;
const numberFieldProps: ComponentProps<typeof ZNumberField> = {
	formatOptions: { maximumFractionDigits: 2 },
	step: 0.25,
	value: 1.5
} satisfies ZNumberFieldProps;
const pinInputProps: ComponentProps<typeof ZPinInput> = {
	length: 6,
	mask: true,
	value: '123456'
} satisfies ZPinInputProps;
const colorPickerProps: ComponentProps<typeof ZColorPicker> = {
	allowAlpha: true,
	value: '#33669980'
} satisfies ZColorPickerProps;
const fileUploadProps: ComponentProps<typeof ZFileUpload> = {
	accept: 'image/*',
	maxFiles: 2,
	multiple: true
} satisfies ZFileUploadProps;
const calendarProps: ComponentProps<typeof ZCalendar> = {
	calendarLabel: 'Calendar',
	firstDayOfWeek: 'mon'
} satisfies ZCalendarProps;
const dateFieldProps: ComponentProps<typeof ZDateField> = {
	locale: 'zh-CN'
} satisfies ZDateFieldProps;
const datePickerProps: ComponentProps<typeof ZDatePicker> = {
	placeholder: 'Choose date'
} satisfies ZDatePickerProps;
const dateRangePickerProps: ComponentProps<typeof ZDateRangePicker> = {
	placeholder: 'Choose range'
} satisfies ZDateRangePickerProps;
const timeFieldProps: ComponentProps<typeof ZTimeField> = {
	granularity: 'second',
	hourCycle: 24
} satisfies ZTimeFieldProps;
const formProps: ComponentProps<typeof ZForm> = {
	children: (() => undefined) as never,
	validateOn: ['submit']
} satisfies ZFormProps;
const formFieldProps: ComponentProps<typeof ZFormField> = {
	label: 'Account',
	name: 'account'
} satisfies ZFormFieldProps;
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
void avatarProps;
void badgeProps;
void cardProps;
void descriptionListProps;
void listProps;
void tagProps;
void alertProps;
void loadingBarProps;
void resultProps;
void spinnerProps;
void toastProps;
void toasterProps;
void progressProps;
void meterProps;
void skeletonProps;
void emptyProps;
void timelineProps;
void statisticProps;
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
void comboboxProps;
void comboboxInputProps;
void comboboxContentProps;
void comboboxItemProps;
void contextMenuProps;
void contextMenuTriggerProps;
void contextMenuContentProps;
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
void multiSelectProps;
void multiSelectTriggerProps;
void multiSelectContentProps;
void multiSelectItemProps;
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
void selectProps;
void selectTriggerProps;
void selectContentProps;
void selectItemProps;
void segmentedProps;
void tagsInputProps;
void treeProps;
void treeSelectProps;
void cascaderProps;
void transferProps;
void mentionProps;
void commandProps;
void commandPaletteProps;
void textareaProps;
void inputGroupProps;
void numberFieldProps;
void pinInputProps;
void colorPickerProps;
void fileUploadProps;
void calendarProps;
void dateFieldProps;
void datePickerProps;
void dateRangePickerProps;
void timeFieldProps;
void formProps;
void formFieldProps;
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
