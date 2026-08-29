import { boxDoc } from './box.js';
import { buttonDoc } from './button.js';
import { fieldDoc } from './field.js';
import { iconDoc } from './icon.js';
import { inputDoc } from './input.js';
import { providerDoc } from './provider.js';
import { stackDoc } from './stack.js';
import { textDoc } from './text.js';
import type { ComponentDoc } from './types.js';

export const componentDocs = Object.freeze([
	providerDoc,
	boxDoc,
	stackDoc,
	textDoc,
	iconDoc,
	buttonDoc,
	inputDoc,
	fieldDoc
] satisfies readonly ComponentDoc[]);

export const componentDocsById: ReadonlyMap<string, ComponentDoc> = new Map(
	componentDocs.map((doc) => [doc.id, doc])
);

export type { ApiRow, ApiSection, ComponentDoc, DemoDefinition } from './types.js';
