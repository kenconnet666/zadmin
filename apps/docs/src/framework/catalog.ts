import { boxDoc } from '../content/components/gene/box/doc.js';
import { buttonDoc } from '../content/components/gene/button/doc.js';
import { codeDoc } from '../content/components/gene/code/doc.js';
import { iconDoc } from '../content/components/gene/icon/doc.js';
import { providerDoc } from '../content/components/gene/provider/doc.js';
import { textDoc } from '../content/components/gene/text/doc.js';
import { fieldDoc } from '../content/components/input/field/doc.js';
import { inputDoc } from '../content/components/input/input/doc.js';
import { stackDoc } from '../content/components/layout/stack/doc.js';
import type { ComponentCategory, ComponentDoc } from './component-doc.js';

export const componentCategories = Object.freeze([
	{ id: 'gene', label: '通用组件' },
	{ id: 'layout', label: '布局组件' },
	{ id: 'input', label: '输入组件' }
] satisfies readonly { readonly id: ComponentCategory; readonly label: string }[]);

export const componentDocs = Object.freeze([
	providerDoc,
	boxDoc,
	stackDoc,
	textDoc,
	iconDoc,
	codeDoc,
	buttonDoc,
	inputDoc,
	fieldDoc
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
