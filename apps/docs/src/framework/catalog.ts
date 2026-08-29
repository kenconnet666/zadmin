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
import { fieldDoc } from '../content/components/input/field/doc.js';
import { inputDoc } from '../content/components/input/input/doc.js';
import { radioGroupDoc } from '../content/components/input/radio-group/doc.js';
import { switchDoc } from '../content/components/input/switch/doc.js';
import { stackDoc } from '../content/components/layout/stack/doc.js';
import { aspectRatioDoc } from '../content/components/layout/aspect-ratio/doc.js';
import { containerDoc } from '../content/components/layout/container/doc.js';
import { paginationDoc } from '../content/components/navigation/pagination/doc.js';
import { tabsDoc } from '../content/components/navigation/tabs/doc.js';
import type { ComponentCategory, ComponentDoc } from './component-doc.js';

export const componentCategories = Object.freeze([
	{ id: 'gene', label: '通用组件' },
	{ id: 'layout', label: '布局组件' },
	{ id: 'input', label: '输入组件' },
	{ id: 'navigation', label: '导航组件' }
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
	inputDoc,
	fieldDoc,
	radioGroupDoc,
	switchDoc,
	paginationDoc,
	tabsDoc
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
