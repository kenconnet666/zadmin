import { boxDoc } from './box.js';
import { buttonDoc } from './button.js';
import { codeDoc } from './code.js';
import { fieldDoc } from './field.js';
import { iconDoc } from './icon.js';
import { inputDoc } from './input.js';
import { providerDoc } from './provider.js';
import { stackDoc } from './stack.js';
import { textDoc } from './text.js';
import type { ComponentCategory, ComponentDoc } from './types.js';

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
} from './types.js';
