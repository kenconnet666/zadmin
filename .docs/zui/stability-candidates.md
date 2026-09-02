# ZUI stability policy candidates

本文件由 `scripts/check-stability-policy.mjs` 生成；不会修改组件 status。compound member 可继承同 family root 的 Docs 页面。

stableCompliant：37；stableViolations：0；promotionEligibleExperimental：63。

| Component               | Status       | Classification                | Blockers                                   | Docs                                                                           | SSR |
| ----------------------- | ------------ | ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | --: |
| ZAccordion              | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/accordion/doc.ts                   |   1 |
| ZAccordionContent       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/accordion/doc.ts (family root)     |   1 |
| ZAccordionItem          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/accordion/doc.ts (family root)     |   1 |
| ZAccordionTrigger       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/accordion/doc.ts (family root)     |   1 |
| ZAlertDialog            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts                   |   2 |
| ZAlertDialogAction      | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogCancel      | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogContent     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogDescription | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogOverlay     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogTitle       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   2 |
| ZAlertDialogTrigger     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/alert-dialog/doc.ts (family root)     |   1 |
| ZCombobox               | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/combobox/doc.ts                         |   1 |
| ZComboboxContent        | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/combobox/doc.ts (family root)           |   1 |
| ZComboboxInput          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/combobox/doc.ts (family root)           |   1 |
| ZComboboxItem           | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/combobox/doc.ts (family root)           |   1 |
| ZContextMenu            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/context-menu/doc.ts                |   2 |
| ZContextMenuContent     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/context-menu/doc.ts (family root)  |   2 |
| ZContextMenuTrigger     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/context-menu/doc.ts (family root)  |   2 |
| ZDialog                 | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts                         |   2 |
| ZDialogClose            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   1 |
| ZDialogContent          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   2 |
| ZDialogDescription      | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   1 |
| ZDialogOverlay          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   1 |
| ZDialogTitle            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   2 |
| ZDialogTrigger          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/dialog/doc.ts (family root)           |   1 |
| ZDrawer                 | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/overlay/drawer/doc.ts                         |   1 |
| ZDrawerClose            | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDrawerContent          | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDrawerDescription      | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDrawerOverlay          | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDrawerTitle            | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDrawerTrigger          | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/overlay/drawer/doc.ts (family root)           |   1 |
| ZDropdownMenu           | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts               |   2 |
| ZDropdownMenuContent    | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts (family root) |   2 |
| ZDropdownMenuTrigger    | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/dropdown-menu/doc.ts (family root) |   2 |
| ZMenu                   | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts                        |   2 |
| ZMenuCheckboxItem       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMenuGroup              | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   2 |
| ZMenuItem               | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   2 |
| ZMenuLabel              | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   2 |
| ZMenuRadioGroup         | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMenuRadioItem          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMenuSeparator          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   2 |
| ZMenuSub                | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMenuSubContent         | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMenuSubTrigger         | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/menu/doc.ts (family root)          |   1 |
| ZMultiSelect            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/multi-select/doc.ts                     |   1 |
| ZMultiSelectContent     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/multi-select/doc.ts (family root)       |   1 |
| ZMultiSelectItem        | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/multi-select/doc.ts (family root)       |   1 |
| ZMultiSelectTrigger     | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/multi-select/doc.ts (family root)       |   1 |
| ZPopconfirm             | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts                     |   2 |
| ZPopconfirmAction       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopconfirmCancel       | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopconfirmContent      | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopconfirmDescription  | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopconfirmTitle        | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopconfirmTrigger      | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/popconfirm/doc.ts (family root)       |   2 |
| ZPopover                | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/overlay/popover/doc.ts                        |   2 |
| ZPopoverContent         | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/overlay/popover/doc.ts (family root)          |   2 |
| ZPopoverTrigger         | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/overlay/popover/doc.ts (family root)          |   2 |
| ZRadioGroup             | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/radio-group/doc.ts                      |   1 |
| ZRadioGroupItem         | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/radio-group/doc.ts (family root)        |   1 |
| ZSelect                 | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/select/doc.ts                           |   1 |
| ZSelectContent          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/select/doc.ts (family root)             |   1 |
| ZSelectItem             | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/select/doc.ts (family root)             |   1 |
| ZSelectTrigger          | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/input/select/doc.ts (family root)             |   1 |
| ZTabs                   | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/tabs/doc.ts                        |   1 |
| ZTabsList               | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/tabs/doc.ts (family root)          |   1 |
| ZTabsPanel              | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/tabs/doc.ts (family root)          |   1 |
| ZTabsTrigger            | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/navigation/tabs/doc.ts (family root)          |   1 |
| ZTooltip                | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/tooltip/doc.ts                        |   2 |
| ZTooltipContent         | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/tooltip/doc.ts (family root)          |   2 |
| ZTooltipGroup           | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/tooltip/doc.ts (family root)          |   1 |
| ZTooltipTrigger         | experimental | promotionEligibleExperimental | —                                          | apps/docs/src/content/components/overlay/tooltip/doc.ts (family root)          |   2 |
| ZTree                   | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/navigation/tree/doc.ts                        |   2 |
| ZAvatar                 | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/avatar/doc.ts                    |   2 |
| ZBadge                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/badge/doc.ts                     |   2 |
| ZCard                   | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/card/doc.ts                      |   2 |
| ZCarousel               | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/data-display/carousel/doc.ts                  |   1 |
| ZDataTable              | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/data-table/doc.ts                |   2 |
| ZDescriptionList        | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/data-display/description-list/doc.ts          |   2 |
| ZEmpty                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/empty/doc.ts                     |   2 |
| ZList                   | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/data-display/list/doc.ts                      |   1 |
| ZMeter                  | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/data-display/meter/doc.ts                     |   2 |
| ZProgress               | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/data-display/progress/doc.ts                  |   2 |
| ZSkeleton               | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/data-display/skeleton/doc.ts                  |   2 |
| ZStatistic              | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/statistic/doc.ts                 |   2 |
| ZTable                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/table/doc.ts                     |   2 |
| ZTag                    | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/tag/doc.ts                       |   2 |
| ZTimeline               | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/data-display/timeline/doc.ts                  |   2 |
| ZVirtualList            | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/data-display/virtual-list/doc.ts              |   2 |
| ZAlert                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/feedback/alert/doc.ts                         |   2 |
| ZLoadingBar             | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/feedback/loading-bar/doc.ts                   |   2 |
| ZResult                 | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/feedback/result/doc.ts                        |   2 |
| ZSpinner                | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/feedback/spinner/doc.ts                       |   2 |
| ZToast                  | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/feedback/toast/doc.ts                         |   1 |
| ZToaster                | experimental | experimental                  | VisuallyVerified, ProductionVerified, Docs | —                                                                              |   2 |
| ZBox                    | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/box/doc.ts                               |   1 |
| ZButton                 | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/button/doc.ts                            |   7 |
| ZCode                   | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/code/doc.ts                              |   2 |
| ZHeading                | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/heading/doc.ts                           |   1 |
| ZIcon                   | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/icon/doc.ts                              |   1 |
| ZKbd                    | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/kbd/doc.ts                               |   2 |
| ZLink                   | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/link/doc.ts                              |   2 |
| ZProvider               | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/provider/doc.ts                          |   7 |
| ZSeparator              | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/gene/separator/doc.ts                         |   2 |
| ZText                   | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/text/doc.ts                              |   4 |
| ZToggleButton           | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/gene/toggle-button/doc.ts                     |   2 |
| ZVisuallyHidden         | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/gene/visually-hidden/doc.ts                   |   2 |
| ZCalendar               | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/calendar/doc.ts                         |   1 |
| ZCascader               | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/cascader/doc.ts                         |   1 |
| ZCheckbox               | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/checkbox/doc.ts                         |   1 |
| ZColorPicker            | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/color-picker/doc.ts                     |   1 |
| ZDateField              | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/date-field/doc.ts                       |   1 |
| ZDatePicker             | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/date-picker/doc.ts                      |   1 |
| ZDateRangePicker        | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/date-range-picker/doc.ts                |   1 |
| ZField                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/field/doc.ts                            |   3 |
| ZFileUpload             | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/file-upload/doc.ts                      |   1 |
| ZForm                   | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/input/form/doc.ts                             |   1 |
| ZFormField              | experimental | experimental                  | ProductionVerified, Docs                   | —                                                                              |   1 |
| ZInput                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/input/doc.ts                            |   2 |
| ZInputGroup             | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/input-group/doc.ts                      |   2 |
| ZMention                | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/mention/doc.ts                          |   1 |
| ZNumberField            | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/number-field/doc.ts                     |   1 |
| ZPinInput               | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/pin-input/doc.ts                        |   2 |
| ZSegmented              | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/segmented/doc.ts                        |   1 |
| ZSlider                 | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/slider/doc.ts                           |   1 |
| ZSwitch                 | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/input/switch/doc.ts                           |   2 |
| ZTagsInput              | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/tags-input/doc.ts                       |   1 |
| ZTextarea               | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/input/textarea/doc.ts                         |   2 |
| ZTimeField              | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/time-field/doc.ts                       |   1 |
| ZTransfer               | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/input/transfer/doc.ts                         |   1 |
| ZTreeSelect             | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/input/tree-select/doc.ts                      |   2 |
| ZAspectRatio            | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/layout/aspect-ratio/doc.ts                    |   2 |
| ZContainer              | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/layout/container/doc.ts                       |   2 |
| ZStack                  | stable       | stableCompliant               | —                                          | apps/docs/src/content/components/layout/stack/doc.ts                           |   3 |
| ZCommand                | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/navigation/command/doc.ts                     |   1 |
| ZCommandPalette         | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/navigation/command-palette/doc.ts             |   1 |
| ZPagination             | experimental | experimental                  | VisuallyVerified, ProductionVerified       | apps/docs/src/content/components/navigation/pagination/doc.ts                  |   1 |
| ZTour                   | experimental | experimental                  | ProductionVerified                         | apps/docs/src/content/components/overlay/tour/doc.ts                           |   1 |

## 晋级规则

- stable 必须满足 ContractVerified、RuntimeImplemented、VisuallyVerified、ProductionVerified、Docs、适用 SSR、source metadata gap=0 和 teaching fallback=0。
- compound member 不要求独立文档页；拥有同 family root 文档页即可满足 Docs。
- compound family 原子晋级：任一成员仍有 blocker，整个 family 都不是候选；stable family 不允许混合 status。
- experimental 只报告 promotionEligibleExperimental，不自动修改 status。
