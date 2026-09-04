# ZUI component maturity matrix

Generated from 141 metadata components, 79 documentation modules, 141 API contract entries, and 155 test files.

Generation is evidence-based. `BrowserBehaviorVerified` requires an executed browser render with component-owned assertions. `VisuallyVerified` additionally requires an explicit `@zui-visual ZComponent` ownership marker and a geometry, computed-style, CSS, or screenshot assertion; generic browser assertions never count as visual evidence. `DesktopVerified` remains false until a component-level desktop evidence source is added.

| Stage                   | Count |
| ----------------------- | ----: |
| Declared                |   141 |
| Authorable              |   141 |
| ContractVerified        |   141 |
| RuntimeImplemented      |   141 |
| BrowserBehaviorVerified |   141 |
| VisuallyVerified        |    79 |
| DesktopVerified         |     0 |
| ProductionVerified      |   141 |

| Component               | Category     | Declared | Authorable | Contract | Runtime | Browser | Visual | Desktop | Production | Docs                                                                  |
| ----------------------- | ------------ | -------: | ---------: | -------: | ------: | ------: | -----: | ------: | ---------: | --------------------------------------------------------------------- |
| ZAccordion              | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/accordion/doc.ts          |
| ZAccordionContent       | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/accordion/doc.ts          |
| ZAccordionItem          | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/accordion/doc.ts          |
| ZAccordionTrigger       | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/accordion/doc.ts          |
| ZAlertDialog            | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogAction      | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogCancel      | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogContent     | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogDescription | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogOverlay     | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogTitle       | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZAlertDialogTrigger     | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |
| ZCombobox               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/combobox/doc.ts                |
| ZComboboxContent        | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/combobox/doc.ts                |
| ZComboboxInput          | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/combobox/doc.ts                |
| ZComboboxItem           | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/combobox/doc.ts                |
| ZContextMenu            | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/context-menu/doc.ts       |
| ZContextMenuContent     | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/context-menu/doc.ts       |
| ZContextMenuTrigger     | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/context-menu/doc.ts       |
| ZDialog                 | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogClose            | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogContent          | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogDescription      | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogOverlay          | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogTitle            | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDialogTrigger          | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/dialog/doc.ts                |
| ZDrawer                 | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerClose            | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerContent          | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerDescription      | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerOverlay          | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerTitle            | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDrawerTrigger          | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/drawer/doc.ts                |
| ZDropdownMenu           | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |
| ZDropdownMenuContent    | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |
| ZDropdownMenuTrigger    | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |
| ZMenu                   | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuCheckboxItem       | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuGroup              | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuItem               | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuLabel              | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuRadioGroup         | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuRadioItem          | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuSeparator          | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuSub                | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuSubContent         | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMenuSubTrigger         | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/menu/doc.ts               |
| ZMultiSelect            | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/multi-select/doc.ts            |
| ZMultiSelectContent     | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/multi-select/doc.ts            |
| ZMultiSelectItem        | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/multi-select/doc.ts            |
| ZMultiSelectTrigger     | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/multi-select/doc.ts            |
| ZPopconfirm             | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmAction       | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmCancel       | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmContent      | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmDescription  | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmTitle        | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopconfirmTrigger      | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |
| ZPopover                | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/popover/doc.ts               |
| ZPopoverContent         | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popover/doc.ts               |
| ZPopoverTrigger         | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/popover/doc.ts               |
| ZRadioGroup             | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/radio-group/doc.ts             |
| ZRadioGroupItem         | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/radio-group/doc.ts             |
| ZSelect                 | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/select/doc.ts                  |
| ZSelectContent          | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/select/doc.ts                  |
| ZSelectItem             | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/select/doc.ts                  |
| ZSelectTrigger          | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/select/doc.ts                  |
| ZTabs                   | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/tabs/doc.ts               |
| ZTabsList               | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/tabs/doc.ts               |
| ZTabsPanel              | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/tabs/doc.ts               |
| ZTabsTrigger            | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/tabs/doc.ts               |
| ZTooltip                | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/tooltip/doc.ts               |
| ZTooltipContent         | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/tooltip/doc.ts               |
| ZTooltipGroup           | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/tooltip/doc.ts               |
| ZTooltipTrigger         | overlay      |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/overlay/tooltip/doc.ts               |
| ZTree                   | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/tree/doc.ts               |
| ZAvatar                 | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/avatar/doc.ts           |
| ZBadge                  | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/badge/doc.ts            |
| ZCard                   | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/card/doc.ts             |
| ZCarousel               | data-display |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/data-display/carousel/doc.ts         |
| ZDataTable              | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/data-table/doc.ts       |
| ZDescriptionList        | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/description-list/doc.ts |
| ZEmpty                  | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/empty/doc.ts            |
| ZList                   | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/list/doc.ts             |
| ZMeter                  | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/meter/doc.ts            |
| ZProgress               | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/progress/doc.ts         |
| ZSkeleton               | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/skeleton/doc.ts         |
| ZStatistic              | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/statistic/doc.ts        |
| ZTable                  | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/table/doc.ts            |
| ZTag                    | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/tag/doc.ts              |
| ZTimeline               | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/timeline/doc.ts         |
| ZVirtualList            | data-display |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/data-display/virtual-list/doc.ts     |
| ZAlert                  | feedback     |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/feedback/alert/doc.ts                |
| ZLoadingBar             | feedback     |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/feedback/loading-bar/doc.ts          |
| ZResult                 | feedback     |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/feedback/result/doc.ts               |
| ZSpinner                | feedback     |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/feedback/spinner/doc.ts              |
| ZToast                  | feedback     |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/feedback/toast/doc.ts                |
| ZToaster                | feedback     |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/feedback/toast/doc.ts                |
| ZBox                    | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/box/doc.ts                      |
| ZButton                 | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/button/doc.ts                   |
| ZCode                   | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/code/doc.ts                     |
| ZHeading                | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/heading/doc.ts                  |
| ZIcon                   | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/icon/doc.ts                     |
| ZKbd                    | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/kbd/doc.ts                      |
| ZLink                   | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/link/doc.ts                     |
| ZProvider               | gene         |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/gene/provider/doc.ts                 |
| ZSeparator              | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/separator/doc.ts                |
| ZText                   | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/text/doc.ts                     |
| ZToggleButton           | gene         |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/gene/toggle-button/doc.ts            |
| ZVisuallyHidden         | gene         |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/gene/visually-hidden/doc.ts          |
| ZCalendar               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/calendar/doc.ts                |
| ZCascader               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/cascader/doc.ts                |
| ZCheckbox               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/checkbox/doc.ts                |
| ZColorPicker            | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/color-picker/doc.ts            |
| ZDateField              | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/date-field/doc.ts              |
| ZDatePicker             | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/date-picker/doc.ts             |
| ZDateRangePicker        | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/date-range-picker/doc.ts       |
| ZField                  | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/field/doc.ts                   |
| ZFileUpload             | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/file-upload/doc.ts             |
| ZForm                   | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/form/doc.ts                    |
| ZFormField              | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/form/doc.ts                    |
| ZInput                  | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/input/doc.ts                   |
| ZInputGroup             | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/input-group/doc.ts             |
| ZMention                | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/mention/doc.ts                 |
| ZNumberField            | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/number-field/doc.ts            |
| ZPinInput               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/pin-input/doc.ts               |
| ZSegmented              | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/segmented/doc.ts               |
| ZSlider                 | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/slider/doc.ts                  |
| ZSwitch                 | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/switch/doc.ts                  |
| ZTagsInput              | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/tags-input/doc.ts              |
| ZTextarea               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/textarea/doc.ts                |
| ZTimeField              | input        |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/input/time-field/doc.ts              |
| ZTransfer               | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/transfer/doc.ts                |
| ZTreeSelect             | input        |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/input/tree-select/doc.ts             |
| ZAspectRatio            | layout       |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/layout/aspect-ratio/doc.ts           |
| ZContainer              | layout       |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/layout/container/doc.ts              |
| ZStack                  | layout       |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/layout/stack/doc.ts                  |
| ZCommand                | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/command/doc.ts            |
| ZCommandPalette         | navigation   |        Y |          Y |        Y |       Y |       Y |      — |       — |          Y | apps/docs/src/content/components/navigation/command-palette/doc.ts    |
| ZPagination             | navigation   |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/navigation/pagination/doc.ts         |
| ZTour                   | overlay      |        Y |          Y |        Y |       Y |       Y |      Y |       — |          Y | apps/docs/src/content/components/overlay/tour/doc.ts                  |
