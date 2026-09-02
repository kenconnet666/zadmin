# ZUI stability policy candidates

本文件由 `scripts/check-stability-policy.mjs` 生成；不会修改组件 status。compound member 可继承同 family root 的 Docs 页面。

stableCompliant：74；stableViolations：0；promotionEligibleExperimental：43。

| Component               | Status       | Classification                | Blockers                             | Docs                                                                  | SSR |
| ----------------------- | ------------ | ----------------------------- | ------------------------------------ | --------------------------------------------------------------------- | --: |
| ZAccordion              | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/accordion/doc.ts          |   1 |
| ZAccordionContent       | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/accordion/doc.ts          |   1 |
| ZAccordionItem          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/accordion/doc.ts          |   1 |
| ZAccordionTrigger       | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/accordion/doc.ts          |   1 |
| ZAlertDialog            | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogAction      | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogCancel      | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogContent     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogDescription | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogOverlay     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogTitle       | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   2 |
| ZAlertDialogTrigger     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/alert-dialog/doc.ts          |   1 |
| ZCombobox               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/combobox/doc.ts                |   1 |
| ZComboboxContent        | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/combobox/doc.ts                |   1 |
| ZComboboxInput          | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/combobox/doc.ts                |   1 |
| ZComboboxItem           | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/combobox/doc.ts                |   1 |
| ZContextMenu            | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/context-menu/doc.ts       |   2 |
| ZContextMenuContent     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/context-menu/doc.ts       |   2 |
| ZContextMenuTrigger     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/context-menu/doc.ts       |   2 |
| ZDialog                 | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   2 |
| ZDialogClose            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   1 |
| ZDialogContent          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   2 |
| ZDialogDescription      | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   1 |
| ZDialogOverlay          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   1 |
| ZDialogTitle            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   2 |
| ZDialogTrigger          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/dialog/doc.ts                |   1 |
| ZDrawer                 | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerClose            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerContent          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerDescription      | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerOverlay          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerTitle            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDrawerTrigger          | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/drawer/doc.ts                |   1 |
| ZDropdownMenu           | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |   2 |
| ZDropdownMenuContent    | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |   2 |
| ZDropdownMenuTrigger    | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts      |   2 |
| ZMenu                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   2 |
| ZMenuCheckboxItem       | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMenuGroup              | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   2 |
| ZMenuItem               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   2 |
| ZMenuLabel              | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   2 |
| ZMenuRadioGroup         | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMenuRadioItem          | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMenuSeparator          | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   2 |
| ZMenuSub                | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMenuSubContent         | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMenuSubTrigger         | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/navigation/menu/doc.ts               |   1 |
| ZMultiSelect            | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/multi-select/doc.ts            |   1 |
| ZMultiSelectContent     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/multi-select/doc.ts            |   1 |
| ZMultiSelectItem        | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/multi-select/doc.ts            |   1 |
| ZMultiSelectTrigger     | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/multi-select/doc.ts            |   1 |
| ZPopconfirm             | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmAction       | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmCancel       | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmContent      | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmDescription  | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmTitle        | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopconfirmTrigger      | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/popconfirm/doc.ts            |   2 |
| ZPopover                | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/popover/doc.ts               |   2 |
| ZPopoverContent         | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/popover/doc.ts               |   2 |
| ZPopoverTrigger         | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/overlay/popover/doc.ts               |   2 |
| ZRadioGroup             | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/input/radio-group/doc.ts             |   1 |
| ZRadioGroupItem         | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/input/radio-group/doc.ts             |   1 |
| ZSelect                 | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/select/doc.ts                  |   1 |
| ZSelectContent          | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/select/doc.ts                  |   1 |
| ZSelectItem             | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/select/doc.ts                  |   1 |
| ZSelectTrigger          | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/select/doc.ts                  |   1 |
| ZTabs                   | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/tabs/doc.ts               |   1 |
| ZTabsList               | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/tabs/doc.ts               |   1 |
| ZTabsPanel              | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/tabs/doc.ts               |   1 |
| ZTabsTrigger            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/tabs/doc.ts               |   1 |
| ZTooltip                | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/tooltip/doc.ts               |   2 |
| ZTooltipContent         | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/tooltip/doc.ts               |   2 |
| ZTooltipGroup           | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/tooltip/doc.ts               |   1 |
| ZTooltipTrigger         | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/overlay/tooltip/doc.ts               |   2 |
| ZTree                   | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/navigation/tree/doc.ts               |   2 |
| ZAvatar                 | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/avatar/doc.ts           |   2 |
| ZBadge                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/badge/doc.ts            |   2 |
| ZCard                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/card/doc.ts             |   2 |
| ZCarousel               | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/data-display/carousel/doc.ts         |   1 |
| ZDataTable              | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/data-table/doc.ts       |   2 |
| ZDescriptionList        | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/data-display/description-list/doc.ts |   2 |
| ZEmpty                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/empty/doc.ts            |   2 |
| ZList                   | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/data-display/list/doc.ts             |   1 |
| ZMeter                  | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/data-display/meter/doc.ts            |   2 |
| ZProgress               | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/data-display/progress/doc.ts         |   2 |
| ZSkeleton               | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/data-display/skeleton/doc.ts         |   2 |
| ZStatistic              | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/statistic/doc.ts        |   2 |
| ZTable                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/table/doc.ts            |   2 |
| ZTag                    | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/tag/doc.ts              |   2 |
| ZTimeline               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/data-display/timeline/doc.ts         |   2 |
| ZVirtualList            | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/data-display/virtual-list/doc.ts     |   2 |
| ZAlert                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/feedback/alert/doc.ts                |   2 |
| ZLoadingBar             | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/feedback/loading-bar/doc.ts          |   2 |
| ZResult                 | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/feedback/result/doc.ts               |   2 |
| ZSpinner                | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/feedback/spinner/doc.ts              |   2 |
| ZToast                  | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/feedback/toast/doc.ts                |   1 |
| ZToaster                | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/feedback/toast/doc.ts                |   2 |
| ZBox                    | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/box/doc.ts                      |   1 |
| ZButton                 | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/button/doc.ts                   |   7 |
| ZCode                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/code/doc.ts                     |   2 |
| ZHeading                | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/heading/doc.ts                  |   1 |
| ZIcon                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/icon/doc.ts                     |   1 |
| ZKbd                    | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/kbd/doc.ts                      |   2 |
| ZLink                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/link/doc.ts                     |   2 |
| ZProvider               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/provider/doc.ts                 |   7 |
| ZSeparator              | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/gene/separator/doc.ts                |   2 |
| ZText                   | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/text/doc.ts                     |   4 |
| ZToggleButton           | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/gene/toggle-button/doc.ts            |   2 |
| ZVisuallyHidden         | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/gene/visually-hidden/doc.ts          |   2 |
| ZCalendar               | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/calendar/doc.ts                |   1 |
| ZCascader               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/cascader/doc.ts                |   1 |
| ZCheckbox               | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/checkbox/doc.ts                |   1 |
| ZColorPicker            | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/color-picker/doc.ts            |   1 |
| ZDateField              | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/date-field/doc.ts              |   1 |
| ZDatePicker             | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/date-picker/doc.ts             |   1 |
| ZDateRangePicker        | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/date-range-picker/doc.ts       |   1 |
| ZField                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/field/doc.ts                   |   3 |
| ZFileUpload             | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/file-upload/doc.ts             |   1 |
| ZForm                   | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/input/form/doc.ts                    |   1 |
| ZFormField              | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/input/form/doc.ts                    |   1 |
| ZInput                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/input/doc.ts                   |   2 |
| ZInputGroup             | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/input-group/doc.ts             |   2 |
| ZMention                | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/mention/doc.ts                 |   1 |
| ZNumberField            | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/number-field/doc.ts            |   1 |
| ZPinInput               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/pin-input/doc.ts               |   2 |
| ZSegmented              | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/input/segmented/doc.ts               |   1 |
| ZSlider                 | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/slider/doc.ts                  |   1 |
| ZSwitch                 | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/switch/doc.ts                  |   2 |
| ZTagsInput              | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/tags-input/doc.ts              |   1 |
| ZTextarea               | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/input/textarea/doc.ts                |   2 |
| ZTimeField              | experimental | promotionEligibleExperimental | —                                    | apps/docs/src/content/components/input/time-field/doc.ts              |   1 |
| ZTransfer               | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/input/transfer/doc.ts                |   1 |
| ZTreeSelect             | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/input/tree-select/doc.ts             |   2 |
| ZAspectRatio            | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/layout/aspect-ratio/doc.ts           |   2 |
| ZContainer              | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/layout/container/doc.ts              |   2 |
| ZStack                  | stable       | stableCompliant               | —                                    | apps/docs/src/content/components/layout/stack/doc.ts                  |   3 |
| ZCommand                | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/navigation/command/doc.ts            |   1 |
| ZCommandPalette         | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/navigation/command-palette/doc.ts    |   1 |
| ZPagination             | experimental | experimental                  | VisuallyVerified, ProductionVerified | apps/docs/src/content/components/navigation/pagination/doc.ts         |   1 |
| ZTour                   | experimental | experimental                  | ProductionVerified                   | apps/docs/src/content/components/overlay/tour/doc.ts                  |   1 |

## 晋级规则

- stable 必须满足 ContractVerified、RuntimeImplemented、VisuallyVerified、ProductionVerified、Docs、适用 SSR、source metadata gap=0 和 teaching fallback=0。
- compound member 不要求独立文档页；拥有同 family root 文档页即可满足 Docs。
- compound family 原子晋级：任一成员仍有 blocker，整个 family 都不是候选；stable family 不允许混合 status。
- experimental 只报告 promotionEligibleExperimental，不自动修改 status。
