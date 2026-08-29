import { boxDoc } from '../content/components/gene/box/doc.js';
import { buttonDoc } from '../content/components/gene/button/doc.js';
import { codeDoc } from '../content/components/gene/code/doc.js';
import { iconDoc } from '../content/components/gene/icon/doc.js';
import { kbdDoc } from '../content/components/gene/kbd/doc.js';
import { linkDoc } from '../content/components/gene/link/doc.js';
import { providerDoc } from '../content/components/gene/provider/doc.js';
import { separatorDoc } from '../content/components/gene/separator/doc.js';
import { textDoc } from '../content/components/gene/text/doc.js';
import { toggleButtonDoc } from '../content/components/gene/toggle-button/doc.js';
import { visuallyHiddenDoc } from '../content/components/gene/visually-hidden/doc.js';
import { checkboxDoc } from '../content/components/input/checkbox/doc.js';
import { cascaderDoc } from '../content/components/input/cascader/doc.js';
import { comboboxDoc } from '../content/components/input/combobox/doc.js';
import { fieldDoc } from '../content/components/input/field/doc.js';
import { inputDoc } from '../content/components/input/input/doc.js';
import { multiSelectDoc } from '../content/components/input/multi-select/doc.js';
import { radioGroupDoc } from '../content/components/input/radio-group/doc.js';
import { selectDoc } from '../content/components/input/select/doc.js';
import { segmentedDoc } from '../content/components/input/segmented/doc.js';
import { sliderDoc } from '../content/components/input/slider/doc.js';
import { switchDoc } from '../content/components/input/switch/doc.js';
import { tagsInputDoc } from '../content/components/input/tags-input/doc.js';
import { treeSelectDoc } from '../content/components/input/tree-select/doc.js';
import { stackDoc } from '../content/components/layout/stack/doc.js';
import { aspectRatioDoc } from '../content/components/layout/aspect-ratio/doc.js';
import { containerDoc } from '../content/components/layout/container/doc.js';
import { accordionDoc } from '../content/components/navigation/accordion/doc.js';
import { contextMenuDoc } from '../content/components/navigation/context-menu/doc.js';
import { dropdownMenuDoc } from '../content/components/navigation/dropdown-menu/doc.js';
import { paginationDoc } from '../content/components/navigation/pagination/doc.js';
import { tabsDoc } from '../content/components/navigation/tabs/doc.js';
import { treeDoc } from '../content/components/navigation/tree/doc.js';
import { menuDoc } from '../content/components/navigation/menu/doc.js';
import { alertDialogDoc } from '../content/components/overlay/alert-dialog/doc.js';
import { popoverDoc } from '../content/components/overlay/popover/doc.js';
import { dialogDoc } from '../content/components/overlay/dialog/doc.js';
import { drawerDoc } from '../content/components/overlay/drawer/doc.js';
import { popconfirmDoc } from '../content/components/overlay/popconfirm/doc.js';
import { tooltipDoc } from '../content/components/overlay/tooltip/doc.js';
import type { ComponentCategory, ComponentDoc } from './component-doc.js';

export const componentCategories = Object.freeze([
	{ id: 'gene', label: '通用组件' },
	{ id: 'layout', label: '布局组件' },
	{ id: 'input', label: '输入组件' },
	{ id: 'navigation', label: '导航组件' },
	{ id: 'overlay', label: '浮层组件' }
] satisfies readonly { readonly id: ComponentCategory; readonly label: string }[]);

export const componentDocs = Object.freeze([
	providerDoc,
	boxDoc,
	stackDoc,
	textDoc,
	iconDoc,
	codeDoc,
	buttonDoc,
	toggleButtonDoc,
	linkDoc,
	separatorDoc,
	visuallyHiddenDoc,
	kbdDoc,
	aspectRatioDoc,
	containerDoc,
	checkboxDoc,
	cascaderDoc,
	comboboxDoc,
	inputDoc,
	multiSelectDoc,
	fieldDoc,
	radioGroupDoc,
	selectDoc,
	segmentedDoc,
	switchDoc,
	tagsInputDoc,
	treeSelectDoc,
	sliderDoc,
	accordionDoc,
	contextMenuDoc,
	dropdownMenuDoc,
	menuDoc,
	paginationDoc,
	tabsDoc,
	treeDoc,
	alertDialogDoc,
	dialogDoc,
	drawerDoc,
	popconfirmDoc,
	popoverDoc,
	tooltipDoc
] satisfies readonly ComponentDoc[]);

export const componentDocsById: ReadonlyMap<string, ComponentDoc> = new Map(
	componentDocs.map((doc) => [doc.id, doc])
);

export type {
	ApiRow,
	ApiSection,
	ComponentCategory,
	ComponentDoc,
	DemoDefinition
} from './component-doc.js';
