import {
	ZAccordionTrigger,
	ZDialogTrigger,
	type ZMenuSubTriggerProps,
	type ZMenuCheckboxItemProps,
	type ZMenuRadioItemProps,
	ZPopoverTrigger,
	ZTabsPanel,
	ZTabsTrigger,
	type ZAccordionTriggerProps,
	type ZDialogTriggerProps,
	type ZPopoverTriggerProps,
	type ZTabsPanelProps,
	type ZTabsTriggerProps
} from '../src/entrypoints/index.js';

const accordionTriggerProps = {
	// @ts-expect-error Accordion Root owns the generated trigger id.
	id: 'custom-accordion-trigger'
} satisfies ZAccordionTriggerProps;

const dialogTriggerProps = {
	// @ts-expect-error Dialog Root owns the generated trigger id.
	id: 'custom-dialog-trigger'
} satisfies ZDialogTriggerProps;

const popoverTriggerProps = {
	// @ts-expect-error Popover Root owns the generated trigger id; use triggerId on Root.
	id: 'custom-popover-trigger'
} satisfies ZPopoverTriggerProps;

const tabsTriggerProps = {
	value: 'overview',
	// @ts-expect-error Tabs Root owns the generated trigger id.
	id: 'custom-tabs-trigger'
} satisfies ZTabsTriggerProps;

const tabsPanelProps = {
	value: 'overview',
	// @ts-expect-error Tabs Root owns the generated panel id.
	id: 'custom-tabs-panel'
} satisfies ZTabsPanelProps;

void ZAccordionTrigger;
void ZDialogTrigger;
void ZPopoverTrigger;
void ZTabsPanel;
void ZTabsTrigger;
void accordionTriggerProps;
void dialogTriggerProps;
void popoverTriggerProps;
void tabsPanelProps;
void tabsTriggerProps;

const menuSubTriggerProps = {
	value: 'more',
	// @ts-expect-error Submenu Root owns its trigger relation id.
	id: 'custom-menu-trigger'
} satisfies ZMenuSubTriggerProps;
const checkboxIndicator = {
	value: 'enabled',
	// @ts-expect-error The checked indicator owns the leading slot.
	leading: () => undefined
} satisfies ZMenuCheckboxItemProps;
const radioIndicator = {
	value: 'small',
	// @ts-expect-error The selected indicator owns the leading slot.
	leading: () => undefined
} satisfies ZMenuRadioItemProps;
const submenuIndicator = {
	value: 'more',
	// @ts-expect-error Submenu navigation owns the trailing slot.
	trailing: () => undefined
} satisfies ZMenuSubTriggerProps;
void menuSubTriggerProps;
void checkboxIndicator;
void radioIndicator;
void submenuIndicator;
