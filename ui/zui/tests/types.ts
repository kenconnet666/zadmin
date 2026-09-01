import type { ComponentProps } from 'svelte';
import type { StandardSchemaV1 } from '@standard-schema/spec';

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
	ZCarousel,
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
	ZDataTable,
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
	ZMenuCheckboxItem,
	ZMenuGroup,
	ZMenuItem,
	ZMenuLabel,
	ZMenuRadioGroup,
	ZMenuRadioItem,
	ZMenuSeparator,
	ZMenuSub,
	ZMenuSubContent,
	ZMenuSubTrigger,
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
	ZTable,
	ZToast,
	ZToaster,
	ZTextarea,
	ZTimeField,
	ZTimeline,
	ZTooltip,
	ZTooltipContent,
	ZTooltipGroup,
	ZTooltipTrigger,
	ZTour,
	ZTree,
	ZTreeSelect,
	ZTransfer,
	ZToggleButton,
	ZVirtualList,
	createToastQueue,
	defineRecipe,
	defineSlotRecipe,
	type CascaderFilter,
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
	type ZCarouselProps,
	type ZCascaderProps,
	type ZCalendarProps,
	type ZCheckboxProps,
	type ColorPickerPreset,
	type ZComboboxContentProps,
	type ZComboboxInputProps,
	type ZComboboxItemProps,
	type ZComboboxOption,
	type ZComboboxProps,
	type ZColorPickerProps,
	type ZCollectionOption,
	type ZCommandPaletteProps,
	type ZCommandProps,
	type ZContextMenuContentProps,
	type ZContextMenuProps,
	type ZContextMenuTriggerProps,
	type ZDateFieldProps,
	type ZDatePickerProps,
	type ZDateRangePickerProps,
	type ZDataTableProps,
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
	type FieldPath,
	type ZFormFieldProps,
	type ZFormProps,
	type ZInputGroupProps,
	type ZListProps,
	type ZLoadingBarProps,
	type ZMenuCheckboxItemProps,
	type ZMenuGroupProps,
	type ZMenuItemProps,
	type ZMenuLabelProps,
	type ZMenuProps,
	type ZMenuRadioGroupProps,
	type ZMenuRadioItemProps,
	type ZMenuSeparatorProps,
	type ZMenuSubContentProps,
	type ZMenuSubProps,
	type ZMenuSubTriggerProps,
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
	type ZRadioGroupOption,
	type ZRadioGroupItemProps,
	type ZRadioGroupProps,
	type ZResultProps,
	type ZSelectContentProps,
	type ZSelectItemProps,
	type ZSelectOption,
	type ZSelectProps,
	type ZSelectTriggerProps,
	type ZSegmentedOption,
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
	type ZTableProps,
	type ZToastProps,
	type ZToasterProps,
	type ZTextareaProps,
	type ZTimeFieldProps,
	type ZTimelineProps,
	type ZTooltipContentProps,
	type ZTooltipGroupProps,
	type ZTooltipProps,
	type ZTooltipTriggerProps,
	type ZTourProps,
	type ZTreeProps,
	type ZTreeSelectProps,
	type ZTransferProps,
	type ZToggleButtonProps,
	type ZVirtualListProps
} from '../src/entrypoints/index.js';

const boxProps: ZBoxProps = { 'aria-label': 'Box' };
const avatarProps: ComponentProps<typeof ZAvatar> = { alt: 'Alice' } satisfies ZAvatarProps;
const badgeProps: ComponentProps<typeof ZBadge> = {
	count: 128,
	dot: false,
	max: 99,
	overlap: 'circular',
	placement: 'top-end',
	tone: 'danger'
} satisfies ZBadgeProps;
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
const tableProps: ComponentProps<typeof ZTable> = { caption: 'Rows' } satisfies ZTableProps;
const virtualListProps: ComponentProps<typeof ZVirtualList> = {
	ariaLabel: 'Rows',
	item: (() => {}) as never,
	itemKey: () => 'one',
	items: [{ id: 'one' }]
} satisfies ZVirtualListProps;
const dataTableProps: ComponentProps<typeof ZDataTable> = {
	caption: 'Rows',
	columns: [{ accessor: () => 'One', header: 'Name', id: 'name' }],
	rowKey: () => 'one',
	rows: [{ id: 'one' }]
} satisfies ZDataTableProps;
const carouselProps: ComponentProps<typeof ZCarousel> = {
	'aria-label': 'Slides',
	item: (() => {}) as never,
	itemKey: () => 'one',
	itemLabel: () => 'One',
	items: [{ id: 'one' }]
} satisfies ZCarouselProps;
const tourProps: ComponentProps<typeof ZTour> = {
	steps: [{ description: 'Inspect', id: 'one', target: '#target', title: 'Target' }]
} satisfies ZTourProps;
const accordionProps: ComponentProps<typeof ZAccordion> = {
	defaultValue: ['one'],
	type: 'multiple'
} satisfies ZAccordionProps;
const accordionSingleProps: ComponentProps<typeof ZAccordion> = {
	activeValue: 1,
	defaultValue: null,
	type: 'single',
	value: 1
} satisfies ZAccordionProps;
const accordionItemProps: ComponentProps<typeof ZAccordionItem> = {
	value: 'one'
} satisfies ZAccordionItemProps;
const accordionTriggerProps: ComponentProps<typeof ZAccordionTrigger> = {
	headingLevel: 4
} satisfies ZAccordionTriggerProps;
const accordionContentProps: ComponentProps<typeof ZAccordionContent> = {
	region: false
} satisfies ZAccordionContentProps;
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
const collectionOptions = [
	{ label: 'Ready', value: 'ready' }
] satisfies readonly ZCollectionOption[];
const comboboxProps: ComponentProps<typeof ZCombobox> = {
	defaultInputValue: 'Ready',
	defaultValue: 'ready',
	options: collectionOptions satisfies readonly ZComboboxOption[]
} satisfies ZComboboxProps;
const comboboxInputProps: ComponentProps<typeof ZComboboxInput> = {} satisfies ZComboboxInputProps;
const comboboxContentProps: ComponentProps<typeof ZComboboxContent> = {
	ariaLabel: 'Suggestions',
	virtual: true,
	virtualHeight: 240,
	virtualItemSize: 40
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
const menuCheckboxItemProps: ComponentProps<typeof ZMenuCheckboxItem> = {
	defaultChecked: 'mixed',
	value: 'grid'
} satisfies ZMenuCheckboxItemProps;
const menuLabelProps: ComponentProps<typeof ZMenuLabel> = {} satisfies ZMenuLabelProps;
const menuRadioGroupProps: ComponentProps<typeof ZMenuRadioGroup> = {
	defaultValue: 1
} satisfies ZMenuRadioGroupProps;
const menuRadioItemProps: ComponentProps<typeof ZMenuRadioItem> = {
	value: 1
} satisfies ZMenuRadioItemProps;
const menuSeparatorProps: ComponentProps<typeof ZMenuSeparator> = {} satisfies ZMenuSeparatorProps;
const menuSubProps: ComponentProps<typeof ZMenuSub> = {
	defaultOpen: false
} satisfies ZMenuSubProps;
const menuSubTriggerProps: ComponentProps<typeof ZMenuSubTrigger> = {
	value: 'more'
} satisfies ZMenuSubTriggerProps;
const menuSubContentProps: ComponentProps<typeof ZMenuSubContent> = {
	'aria-label': 'More actions'
} satisfies ZMenuSubContentProps;
const multiSelectProps: ComponentProps<typeof ZMultiSelect> = {
	defaultValue: ['a', 2],
	maxTagCount: 2,
	name: 'choice',
	options: [{ label: 'A', value: 'a' }],
	valueLabel: String
} satisfies ZMultiSelectProps;
const multiSelectTriggerProps: ComponentProps<typeof ZMultiSelectTrigger> =
	{} satisfies ZMultiSelectTriggerProps;
const multiSelectContentProps: ComponentProps<typeof ZMultiSelectContent> = {
	virtual: true,
	virtualHeight: 240,
	virtualItemSize: 40
} satisfies ZMultiSelectContentProps;
const multiSelectItemProps: ComponentProps<typeof ZMultiSelectItem> = {
	value: 'a'
} satisfies ZMultiSelectItemProps;
const paginationProps: ComponentProps<typeof ZPagination> = {
	defaultPage: 2,
	totalPages: 20
} satisfies ZPaginationProps;
const paginationItemCountProps: ComponentProps<typeof ZPagination> = {
	defaultPage: 2,
	defaultPageSize: 20,
	mode: 'simple',
	pageSizeOptions: [10, 20, 50],
	totalItems: 93
} satisfies ZPaginationProps;
const popconfirmProps: ComponentProps<typeof ZPopconfirm> = {
	onConfirm: async () => undefined,
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
	defaultValue: 1,
	options: [{ label: 'Ready', value: 1 }] satisfies readonly ZRadioGroupOption[],
	orientation: 'horizontal'
} satisfies ZRadioGroupProps;
const radioGroupItemProps: ComponentProps<typeof ZRadioGroupItem> = {
	value: 1
} satisfies ZRadioGroupItemProps;
const selectProps: ComponentProps<typeof ZSelect> = {
	defaultValue: 'ready',
	name: 'status',
	options: collectionOptions satisfies readonly ZSelectOption[],
	valueLabel: String
} satisfies ZSelectProps;
const selectTriggerProps: ComponentProps<typeof ZSelectTrigger> = {} satisfies ZSelectTriggerProps;
const selectContentProps: ComponentProps<typeof ZSelectContent> = {
	virtual: true,
	virtualHeight: 240,
	virtualItemSize: 40
} satisfies ZSelectContentProps;
const selectItemProps: ComponentProps<typeof ZSelectItem> = {
	value: 'ready'
} satisfies ZSelectItemProps;
const segmentedProps: ComponentProps<typeof ZSegmented> = {
	options: [{ label: 'Ready', value: 1 }] satisfies readonly ZSegmentedOption[]
} satisfies ZSegmentedProps;
const tagsInputProps: ComponentProps<typeof ZTagsInput> = {
	defaultValues: ['alpha'],
	delimiters: [',', ';'],
	editable: true,
	maxVisibleTags: 3,
	size: 'small',
	transform: (value) => value.toLocaleLowerCase()
} satisfies ZTagsInputProps;
const treeProps: ComponentProps<typeof ZTree> = {
	nodes: [{ key: 'root', label: 'Root' }]
} satisfies ZTreeProps;
const treeSelectProps: ComponentProps<typeof ZTreeSelect> = {
	nodes: [{ key: 'root', label: 'Root' }]
} satisfies ZTreeSelectProps;
const cascaderFilter: CascaderFilter = (path, query) =>
	path.some(({ label }) => label.includes(query));
const cascaderProps: ComponentProps<typeof ZCascader> = {
	filter: cascaderFilter,
	nodes: [{ key: 'root', label: 'Root' }],
	searchable: true,
	value: ['root'],
	virtual: true
} satisfies ZCascaderProps;
const transferProps: ComponentProps<typeof ZTransfer> = {
	items: [{ key: 'ready', label: 'Ready' }],
	loading: true,
	readonly: true,
	value: ['ready'],
	virtual: true,
	virtualHeight: 260,
	virtualItemSize: 52
} satisfies ZTransferProps;
const mentionProps: ComponentProps<typeof ZMention> = {
	items: [{ key: 'alice', label: 'Alice' }],
	loading: true,
	value: 'Notify @alice',
	virtual: true,
	virtualHeight: 240,
	virtualItemSize: 52
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
	clearable: true,
	presets: [{ label: 'Brand', value: '#336699' }] satisfies readonly ColorPickerPreset[],
	value: '#33669980'
} satisfies ZColorPickerProps;
const fileUploadProps: ComponentProps<typeof ZFileUpload> = {
	accept: 'image/*',
	maxFiles: 2,
	multiple: true
} satisfies ZFileUploadProps;
const calendarProps: ComponentProps<typeof ZCalendar> = {
	calendarLabel: 'Calendar',
	firstDayOfWeek: 'mon',
	timeZone: 'Asia/Shanghai'
} satisfies ZCalendarProps;
const dateFieldProps: ComponentProps<typeof ZDateField> = {
	locale: 'zh-CN',
	timeZone: 'Asia/Shanghai'
} satisfies ZDateFieldProps;
const datePickerProps: ComponentProps<typeof ZDatePicker> = {
	placeholder: 'Choose date',
	readonly: true,
	required: true,
	timeZone: 'Asia/Shanghai'
} satisfies ZDatePickerProps;
const dateRangePickerProps: ComponentProps<typeof ZDateRangePicker> = {
	endLabel: 'End',
	readonly: true,
	startLabel: 'Start',
	timeZone: 'Asia/Shanghai'
} satisfies ZDateRangePickerProps;
const timeFieldProps: ComponentProps<typeof ZTimeField> = {
	dayPeriodLabel: (period) => period.toUpperCase(),
	granularity: 'second',
	hourCycle: 24,
	toggleDayPeriodLabel: 'Toggle period'
} satisfies ZTimeFieldProps;
const formProps: ComponentProps<typeof ZForm> = {
	children: (() => undefined) as never,
	validateOn: ['submit']
} satisfies ZFormProps;
const formFieldProps: ComponentProps<typeof ZFormField> = {
	label: 'Account',
	name: ['users', 0, 'account']
} satisfies ZFormFieldProps;
declare const typedFormSchema: StandardSchemaV1<{ account: string }, { accountId: number }>;
const typedFormProps = {
	schema: typedFormSchema,
	onValidSubmit(detail) {
		const accountId: number = detail.data.accountId;
		void accountId;
	}
} satisfies ZFormProps<typeof typedFormSchema>;
const nestedFieldPath = ['users', 0, 'account'] as const satisfies FieldPath;
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
	activeValue: 1,
	defaultValue: null,
	panelMount: 'lazy',
	value: 1
} satisfies ZTabsProps;
const tabsListProps: ComponentProps<typeof ZTabsList> = {} satisfies ZTabsListProps;
const tabsTriggerProps: ComponentProps<typeof ZTabsTrigger> = {
	value: 1
} satisfies ZTabsTriggerProps;
const tabsPanelProps: ComponentProps<typeof ZTabsPanel> = {
	tabindex: -1,
	value: 1
} satisfies ZTabsPanelProps;
const tooltipProps: ComponentProps<typeof ZTooltip> = { delay: 200 } satisfies ZTooltipProps;
const tooltipTriggerProps: ComponentProps<typeof ZTooltipTrigger> =
	{} satisfies ZTooltipTriggerProps;
const tooltipContentProps: ComponentProps<typeof ZTooltipContent> =
	{} satisfies ZTooltipContentProps;
const tooltipGroupProps: ComponentProps<typeof ZTooltipGroup> = {
	delay: 400,
	skipDelayDuration: 200
} satisfies ZTooltipGroupProps;
const toggleButtonProps: ComponentProps<typeof ZToggleButton> = {
	defaultPressed: true,
	onPressedChange: (pressed) => void pressed
} satisfies ZToggleButtonProps;
void DirectZBox;
void accordionProps;
void accordionSingleProps;
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
void tableProps;
void virtualListProps;
void dataTableProps;
void carouselProps;
void tourProps;
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
void menuCheckboxItemProps;
void menuLabelProps;
void menuRadioGroupProps;
void menuRadioItemProps;
void menuSeparatorProps;
void menuSubProps;
void menuSubTriggerProps;
void menuSubContentProps;
void multiSelectProps;
void multiSelectTriggerProps;
void multiSelectContentProps;
void multiSelectItemProps;
void paginationProps;
void paginationItemCountProps;
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
void typedFormProps;
void nestedFieldPath;
void sliderProps;
void switchProps;
void tabsProps;
void tabsListProps;
void tabsTriggerProps;
void tabsPanelProps;
void tooltipProps;
void tooltipTriggerProps;
void tooltipContentProps;
void tooltipGroupProps;
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
