import type { Identifier, MemberExpression, Node } from 'estree';
import { walk } from 'estree-walker';
import type MagicString from 'magic-string';

import { createDirectCallsite } from './analyze.ts';
import { analyzeDynamicSlots } from './bindings.ts';
import { createDiagnostic } from './diagnostics.ts';
import type { IcssCallsite, IcssCompilerDiagnostic, PositionedCallExpression } from './types.ts';

interface SvelteNode {
	readonly attributes?: readonly SvelteNode[];
	readonly end?: number;
	readonly expression?: Node;
	readonly name?: string;
	readonly start?: number;
	readonly type: string;
	readonly value?: unknown;
	readonly [key: string]: unknown;
}

interface ElementUse {
	readonly attributeEnd: number;
	readonly callsites: Set<IcssCallsite>;
	readonly regular: boolean;
}

export interface RewriteResult {
	readonly changed: boolean;
	readonly diagnostics: readonly IcssCompilerDiagnostic[];
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function visitSvelteNodes(value: unknown, visitor: (node: SvelteNode) => void): void {
	if (Array.isArray(value)) {
		for (const entry of value) visitSvelteNodes(entry, visitor);
		return;
	}
	if (!isObject(value) || typeof value.type !== 'string') return;
	const node = value as SvelteNode;
	visitor(node);
	for (const [key, child] of Object.entries(node)) {
		if (key === 'loc' || key === 'metadata' || key === 'parent') continue;
		if (key === 'expression' && node.type === 'ExpressionTag') continue;
		visitSvelteNodes(child, visitor);
	}
}

function isMemberProperty(node: Identifier, parent: Node | null, key: unknown): boolean {
	return (
		parent?.type === 'MemberExpression' &&
		key === 'property' &&
		!(parent as MemberExpression).computed
	);
}

function expressionTag(attribute: SvelteNode): Node | undefined {
	if (!isObject(attribute.value)) return undefined;
	const value = attribute.value as SvelteNode;
	return value.type === 'ExpressionTag' ? value.expression : undefined;
}

function collectClassCallsites(
	expression: Node,
	variableCallsites: ReadonlyMap<string, IcssCallsite>,
	icssBindings: ReadonlySet<string>,
	filename: string | undefined,
	diagnostics: IcssCompilerDiagnostic[]
): Set<IcssCallsite> {
	const callsites = new Set<IcssCallsite>();
	walk(expression, {
		enter(node, parent, key) {
			if (node.type === 'CallExpression') {
				const result = createDirectCallsite(node, icssBindings, filename);
				if (result.callsite !== undefined) {
					callsites.add(result.callsite);
					this.skip();
					return;
				}
				if (result.diagnostic !== undefined) diagnostics.push(result.diagnostic);
			}
			if (node.type !== 'Identifier' || isMemberProperty(node, parent, key)) return;
			const callsite = variableCallsites.get(node.name);
			if (callsite !== undefined) callsites.add(callsite);
		}
	});
	return callsites;
}

function positionedCall(callsite: IcssCallsite): PositionedCallExpression {
	return callsite.call;
}

function renderBinding(expression: string, guards: readonly string[]): string {
	if (guards.length === 0) return expression;
	return `${guards.join(' && ')} ? (${expression}) : undefined`;
}

export function rewriteIcssBindings(
	fragment: unknown,
	variableCallsites: ReadonlyMap<string, IcssCallsite>,
	icssBindings: ReadonlySet<string>,
	magic: MagicString,
	source: string,
	slotLocal: string,
	root: string,
	filename?: string
): RewriteResult {
	const diagnostics: IcssCompilerDiagnostic[] = [];
	const uses: ElementUse[] = [];
	const unsafe = new Set<IcssCallsite>();

	visitSvelteNodes(fragment, (node) => {
		const regular = node.type === 'RegularElement';
		const component = node.type === 'Component' || node.type === 'SvelteComponent';
		if ((!regular && !component) || node.attributes === undefined) return;
		const classAttribute = node.attributes.find(
			(attribute) => attribute.type === 'Attribute' && attribute.name === 'class'
		);
		if (classAttribute?.end === undefined) return;
		const expression = expressionTag(classAttribute);
		if (expression === undefined) return;
		const callsites = collectClassCallsites(
			expression,
			variableCallsites,
			icssBindings,
			filename,
			diagnostics
		);
		if (callsites.size === 0) return;
		if (!regular) for (const callsite of callsites) unsafe.add(callsite);
		uses.push({ attributeEnd: classAttribute.end, callsites, regular });
	});

	const analyses = new Map<IcssCallsite, ReturnType<typeof analyzeDynamicSlots>>();
	for (const use of uses) {
		for (const callsite of use.callsites) {
			if (analyses.has(callsite)) continue;
			if (unsafe.has(callsite)) {
				const call = positionedCall(callsite);
				diagnostics.push(
					createDiagnostic(
						'component-boundary',
						'Dynamic ICSS classes on component boundaries use runtime class-rule fallback.',
						call.start,
						call.end,
						filename
					)
				);
				continue;
			}
			const analysis = analyzeDynamicSlots(callsite, source, filename, root);
			analyses.set(callsite, analysis);
			diagnostics.push(...analysis.diagnostics);
		}
	}

	const overwritten = new Set<string>();
	for (const analysis of analyses.values()) {
		for (const slot of analysis.slots) {
			const key = `${slot.replacementStart}:${slot.replacementEnd}`;
			if (overwritten.has(key)) continue;
			overwritten.add(key);
			magic.overwrite(
				slot.replacementStart,
				slot.replacementEnd,
				`${slotLocal}('${slot.variable}')`
			);
		}
	}

	for (const use of uses) {
		if (!use.regular) continue;
		const directives = new Map<string, string>();
		for (const callsite of use.callsites) {
			const analysis = analyses.get(callsite);
			if (analysis === undefined) continue;
			for (const slot of analysis.slots) {
				directives.set(
					slot.variable,
					` style:${slot.variable}={${renderBinding(slot.expression, slot.guards)}}`
				);
			}
		}
		if (directives.size > 0) magic.appendRight(use.attributeEnd, [...directives.values()].join(''));
	}

	return { changed: overwritten.size > 0, diagnostics };
}
